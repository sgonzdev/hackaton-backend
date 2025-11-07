const express = require('express');
const router = express.Router();
const resenaController = require('../controllers/resenaController');
const authenticateToken = require('../middleware/auth');

// Crear reseña (solo usuarios autenticados)
router.post('/', authenticateToken, resenaController.crear);

// Listar reseñas de un producto (público, con paginación)
router.get('/producto/:id_producto', resenaController.listarPorProducto);

module.exports = router;
