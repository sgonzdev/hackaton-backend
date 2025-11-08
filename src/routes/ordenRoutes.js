const express = require('express');
const router = express.Router();
const ordenController = require('../controllers/ordenController');
const authenticateToken = require('../middleware/auth');

// Todas las rutas requieren autenticación
router.use(authenticateToken);

router.get('/', ordenController.obtenerOrdenes);
router.get('/:id', ordenController.obtenerOrdenPorId);

module.exports = router;
