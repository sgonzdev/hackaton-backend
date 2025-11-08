const express = require('express');
const router = express.Router();
const estadisticaController = require('../controllers/estadisticaController');

// GET /api/estadisticas - Obtener todas las estadísticas (generales + productos top paginados)
router.get('/', estadisticaController.obtenerEstadisticasCompletas);

// GET /api/estadisticas/generales - Obtener solo estadísticas generales (números)
router.get('/generales', estadisticaController.obtenerEstadisticasGenerales);

// GET /api/estadisticas/productos-mejor-resena - Obtener productos con mejor reseña (paginado)
router.get('/productos-mejor-resena', estadisticaController.obtenerProductosMejorResena);

module.exports = router;
