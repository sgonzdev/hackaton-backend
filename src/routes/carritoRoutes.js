const express = require('express');
const router = express.Router();
const carritoController = require('../controllers/carritoController');
const authenticateToken = require('../middleware/auth');

// Todas las rutas requieren autenticación
router.use(authenticateToken);

router.get('/', carritoController.obtener);
router.post('/productos', carritoController.agregarProducto);
router.put('/productos/:id_producto', carritoController.actualizarCantidad);
router.delete('/productos/:id_producto', carritoController.eliminarProducto);
router.delete('/', carritoController.vaciar);

module.exports = router;
