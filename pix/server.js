const express = require('express');
const cors = require('cors');
require('dotenv').config();

console.log('🧪 Verificando token do Mercado Pago...');
if (!process.env.MP_ACCESS_TOKEN) {
  console.error('❌ ERRO: Token do Mercado Pago não encontrado no .env!');
} else {
  console.log('✅ Token carregado com sucesso!');
}

const { MercadoPagoConfig, Payment } = require('mercadopago');
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN
});

const payment = new Payment(client);

app.post('/criar-pagamento', async (req, res) => {
  try {
    const valor = parseFloat(req.body.valor);

    if (!valor || valor <= 0) {
      return res.status(400).json({ erro: 'Valor inválido' });
    }

    const response = await payment.create({
      body: {
        transaction_amount: valor,
        description: 'Pagamento via Pix',
        payment_method_id: 'pix',
        payer: {
          email: 'teste@email.com',
          first_name: 'Fulano',
          last_name: 'da Silva'
        }
      }
    });

    const qrData = response.point_of_interaction.transaction_data;

    return res.json({
      qr_code_base64: qrData.qr_code_base64,
      qr_code: qrData.qr_code
    });

  } catch (error) {
    console.error('Erro ao criar pagamento:', error);
    res.status(500).json({ erro: 'Erro ao criar pagamento', detalhes: error.message });
  }
});

app.listen(3000, () => {
  console.log('🚀 Servidor rodando em http://localhost:3000');
});
