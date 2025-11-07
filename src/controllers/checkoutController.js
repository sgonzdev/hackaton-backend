const OrdenService = require('../services/ordenService');
const StripeService = require('../services/stripeService');

const checkoutController = {
  // Crear checkout session (devuelve URL)
  crearCheckoutSession: async (req, res) => {
    try {
      const resultado = await OrdenService.crearCheckoutSession(req.userId);

      res.status(201).json({
        success: true,
        message: 'Sesión de checkout creada exitosamente',
        data: resultado
      });
    } catch (error) {
      console.error('Error creando checkout session:', error);
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Error al crear sesión de checkout'
      });
    }
  },

  // Webhook de Stripe
  webhook: async (req, res) => {
    try {
      const signature = req.headers['stripe-signature'];
      const event = StripeService.verificarWebhookSignature(req.rawBody, signature);

      console.log(`📨 Webhook recibido: ${event.type}`);

      // Procesar evento según tipo
      switch (event.type) {
        case 'checkout.session.completed':
          const session = event.data.object;
          console.log(`✅ Checkout completado: ${session.id}`);
          await OrdenService.procesarPagoExitoso(session.id);
          break;

        case 'checkout.session.expired':
          console.log(`⏱️  Sesión expirada: ${event.data.object.id}`);
          break;

        default:
          console.log(`ℹ️  Evento no manejado: ${event.type}`);
      }

      res.status(200).json({ received: true });
    } catch (error) {
      console.error('❌ Error en webhook:', error);
      res.status(400).json({
        success: false,
        message: 'Webhook error'
      });
    }
  }
};

module.exports = checkoutController;
