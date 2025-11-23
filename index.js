import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import paymentRoutes from './paymentRoutes.js';  // Corrigido para o caminho correto
import fs from 'fs';
import path from 'path';

// Carregar variáveis de ambiente
dotenv.config();

const app = express();
app.use(cors({
  origin: process.env.FRONTEND_URL === '*' ? true : process.env.FRONTEND_URL
}));
app.use(express.json());

// Definindo as rotas
app.use('/payments', paymentRoutes);

// Rota principal
app.get('/', (req, res) => {
  res.json({ message: 'Bebella Backend (Checkout Pro) funcionando' });
});

// Garantir que o diretório de dados exista
const dataDir = path.join(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir);

// Arquivo de pedidos
const ordersFile = path.join(dataDir, 'orders.json');
if (!fs.existsSync(ordersFile)) fs.writeFileSync(ordersFile, JSON.stringify([]));

// Configuração da porta e inicialização do servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Backend rodando na porta ${PORT}`));
