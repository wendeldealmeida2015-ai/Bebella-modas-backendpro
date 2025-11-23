# Bebella Backend - Checkout Pro (Mercado Pago)

## Overview
Backend Node.js + Express preparado para usar **Checkout Pro** do Mercado Pago.
- `POST /payments/create_payment` -> cria preferência e retorna `init_point`
- `POST /payments/mp_webhook` -> webhook para notificações do Mercado Pago
- `GET /payments/orders` -> lista pedidos salvos localmente

## Variáveis de ambiente (no Render)
- `MP_ACCESS_TOKEN` (obrigatório) - seu access token do Mercado Pago
- `MP_PUBLIC_KEY` (recomendado) - public key (frontend)
- `FRONTEND_URL` - URL do seu site Netlify (ex: https://...netlify.app)
- `BACKEND_URL` - URL do backend no Render (ex: https://seu-backend.onrender.com)
- `PORT` - (opcional) porta

## Como rodar localmente
1. Copie `.env.example` para `.env` e preencha.
2. `npm install`
3. `npm start`

## Observações
- NÃO faça commit de `.env` com credenciais.
- Em produção, configure as variáveis no painel do Render.
