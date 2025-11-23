import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import paymentRoutes from './src/routes/paymentRoutes.js';
import fs from 'fs';
import path from 'path';

dotenv.config();

const app = express();
app.use(cors({
  origin: process.env.FRONTEND_URL === '*' ? true : process.env.FRONTEND_URL
}));
app.use(express.json());

app.use('/payments', paymentRoutes);

app.get('/', (req, res) => {
  res.json({ message: 'Bebella Backend (Checkout Pro) funcionando' });
});

// Ensure data dir exists
const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);
const ordersFile = path.join(dataDir, 'orders.json');
if (!fs.existsSync(ordersFile)) fs.writeFileSync(ordersFile, JSON.stringify([]));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Backend rodando na porta ${PORT}`));
