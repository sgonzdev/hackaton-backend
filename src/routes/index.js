const express = require('express');
const router = express.Router();
const authRoutes = require('./authRoutes');
const productoRoutes = require('./productoRoutes');
const artesanoRoutes = require('./artesanoRoutes');
const imagenRoutes = require('./imagenRoutes');

router.get('/health', (req, res) => {
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

module.exports = router;
