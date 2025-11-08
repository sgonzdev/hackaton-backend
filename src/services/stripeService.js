const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

class StripeService {
  // Crear Checkout Session (devuelve URL)
  static async crearCheckoutSession(id_compra, productos, total, userId) {
    try {
      const lineItems = productos.map(p => ({
        price_data: {
          currency: 'usd',
          product_data: {
            name: p.nombre,
            description: p.descripcion || '',
          },
          unit_amount: Math.round(p.precio * 100), // Centavos
        },
        quantity: p.cantidad,
      }));

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: lineItems,
        mode: 'payment',
        success_url: `${process.env.DOMINIO}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.DOMINIO}/checkout/cancel`,
        metadata: {
          id_compra: id_compra.toString(),
          id_usuario: userId.toString()
        }
      });

      return {
        sessionId: session.id,
        url: session.url
      };
    } catch (error) {
      console.error('Error creando Checkout Session:', error);
      throw new Error('Error al crear sesión de pago con Stripe');
    }
  }

  // Obtener sesión de checkout
  static async obtenerCheckoutSession(sessionId) {
    try {
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      return {
        id: session.id,
        status: session.payment_status,
        amount_total: session.amount_total / 100,
        metadata: session.metadata
      };
    } catch (error) {
      console.error('Error obteniendo Checkout Session:', error);
      throw new Error('Error al obtener sesión de pago');
    }
  }

  // Verificar webhook signature
  static verificarWebhookSignature(payload, signature) {
    try {
      const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
      if (!webhookSecret) {
        console.warn('STRIPE_WEBHOOK_SECRET no configurado - webhook sin verificar');
        return JSON.parse(payload);
      }

      return stripe.webhooks.constructEvent(payload, signature, webhookSecret);
    } catch (error) {
      console.error('Error verificando webhook:', error);
      throw error;
    }
  }
}

module.exports = StripeService;
