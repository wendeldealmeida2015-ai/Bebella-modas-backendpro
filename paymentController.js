import mercadopago from 'mercadopago';
import fs from 'fs';
import path from 'path';

// Configure mercadopago
mercadopago.configure({
  access_token: process.env.MP_ACCESS_TOKEN
});

const dataPath = path.join(process.cwd(), 'data', 'orders.json');

function readOrders() {
  try {
    const raw = fs.readFileSync(dataPath, 'utf-8');
    return JSON.parse(raw || '[]');
  } catch (e) {
    return [];
  }
}
function writeOrders(orders) {
  fs.writeFileSync(dataPath, JSON.stringify(orders, null, 2));
}

export async function createPayment(req, res) {
  try {
    const { customer, items, delivery } = req.body || {};

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: 'items required' });
    }

    // Prepare items for Mercado Pago
    const mpItems = items.map(it => ({
      title: it.title || it.name || 'Produto Bebella',
      quantity: Number(it.quantity || 1),
      currency_id: 'BRL',
      unit_price: Number(it.unit_price || it.price || 0)
    }));

    const preference = {
      items: mpItems,
      back_urls: {
        success: process.env.MP_BACKURL_SUCCESS || (process.env.FRONTEND_URL || '') + '/?payment=success',
        failure: process.env.MP_BACKURL_FAILURE || (process.env.FRONTEND_URL || '') + '/?payment=failure',
        pending: process.env.MP_BACKURL_PENDING || (process.env.FRONTEND_URL || '') + '/?payment=pending'
      },
      notification_url: (process.env.BACKEND_URL || '') + '/payments/mp_webhook',
      external_reference: String(Date.now()),
      auto_return: 'approved'
    };

    const response = await mercadopago.preferences.create(preference);

    // Save prelim order locally
    const orders = readOrders();
    const newOrder = {
      id: orders.length ? orders[orders.length-1].id + 1 : 1,
      external_reference: preference.external_reference,
      customer: customer || {},
      items: mpItems,
      total: mpItems.reduce((s,i) => s + (i.unit_price * i.quantity), 0),
      status: 'pending',
      createdAt: new Date().toISOString(),
      preference_id: response.body.id,
      init_point: response.body.init_point,
      sandbox_init_point: response.body.sandbox_init_point
    };
    orders.push(newOrder);
    writeOrders(orders);

    return res.json({
      init_point: response.body.init_point,
      sandbox_init_point: response.body.sandbox_init_point,
      preference_id: response.body.id,
      order: newOrder
    });

  } catch (err) {
    console.error('createPayment error', err);
    return res.status(500).json({ error: 'Erro ao criar preferência' });
  }
}

export async function mpWebhook(req, res) {
  try {
    // Mercadopago can send topic=id or data.id
    const id = req.query.id || req.body?.data?.id || req.body?.id;
    const topic = req.query.topic || req.body?.topic || req.body?.type;

    if (!id) {
      console.warn('Webhook called without id');
      return res.status(400).send('no id');
    }

    // Get payment info
    const payment = await mercadopago.payment.findById(id)
      .then(r => r.body)
      .catch(err => {
        console.error('mp get error', err);
        return null;
      });

    if (!payment) {
      return res.status(200).send('ok');
    }

    // Update order by external_reference or preference_id
    const orders = readOrders();
    const idx = orders.findIndex(o => o.preference_id == payment.preference_id || o.external_reference == String(payment.order?.id || ''));
    if (idx === -1) {
      // try to match by metadata or payer email
      console.log('Order not found for payment', payment);
    } else {
      orders[idx].status = payment.status;
      orders[idx].payment = payment;
      writeOrders(orders);
    }

    // Respond 200 to MP
    return res.status(200).send('ok');

  } catch (err) {
    console.error('webhook error', err);
    return res.status(500).send('error');
  }
}

export function listOrders(req, res) {
  const orders = readOrders();
  return res.json(orders);
}
