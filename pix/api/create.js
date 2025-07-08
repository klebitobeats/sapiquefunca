import { MercadoPagoConfig, Payment } from 'mercadopago';

const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN });
const payment = new Payment(client);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const { valor } = req.body;

    if (!valor || valor <= 0) {
      return res.status(400).json({ erro: 'Valor inválido' });
    }

    const response = await payment.create({
      body: {
        transaction_amount: parseFloat(valor),
        description: 'Pagamento via Pix',
        payment_method_id: 'pix',
        payer: {
          email: 'cliente@email.com'
        }
      }
    });

    return res.status(200).json({ qr_code_base64: response.point_of_interaction.transaction_data.qr_code_base64 });
  } catch (error) {
    return res.status(500).json({ erro: 'Erro ao gerar pagamento', detalhes: error.message });
  }
}