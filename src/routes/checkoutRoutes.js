const express = require('express');
const router = express.Router();
const checkoutController = require('../controllers/checkoutController');
const authenticateToken = require('../middleware/auth');

// Crear checkout session (requiere autenticación)
router.post('/create-session', authenticateToken, checkoutController.crearCheckoutSession);

// Webhook de Stripe (NO requiere autenticación, usa firma de Stripe)
router.post('/webhook', checkoutController.webhook);

module.exports = router;
