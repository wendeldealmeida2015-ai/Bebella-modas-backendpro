import express from 'express';
import { createPayment, mpWebhook, listOrders } from './paymentController.js';


const router = express.Router();

router.post('/create_payment', createPayment); // creates preference (Checkout Pro)
router.post('/mp_webhook', mpWebhook); // Mercado Pago webhook
router.get('/orders', listOrders); // admin: list orders

export default router;
