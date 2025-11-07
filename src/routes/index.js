const express = require('express');
const router = express.Router();
const authRoutes = require('./authRoutes');
const productoRoutes = require('./productoRoutes');
const artesanoRoutes = require('./artesanoRoutes');
const imagenRoutes = require('./imagenRoutes');
const blockchainRoutes = require('./blockchainRoutes');
const resenaRoutes = require('./resenaRoutes');
const carritoRoutes = require('./carritoRoutes');
const checkoutRoutes = require('./checkoutRoutes');
const ordenRoutes = require('./ordenRoutes');
const estadisticaRoutes = require('./estadisticaRoutes');

router.get('/health', (_req, res) => {
  res.status(200).json({
    success: true,
    message: 'API is running',
    timestamp: new Date().toISOString()
  });
});

router.use('/auth', authRoutes);

router.use('/productos', productoRoutes);
router.use('/artesanos', artesanoRoutes);
router.use('/imagenes', imagenRoutes);
router.use('/blockchain', blockchainRoutes);
router.use('/resenas', resenaRoutes);
router.use('/carrito', carritoRoutes);
router.use('/checkout', checkoutRoutes);
router.use('/ordenes', ordenRoutes);
router.use('/estadisticas', estadisticaRoutes);

module.exports = router;
