const express = require('express');
const router = express.Router();
const productoController = require('../controllers/productoController');
const authenticateToken = require('../middleware/auth');
const upload = require('../config/multer');

router.get('/', productoController.obtenerTodos);
router.get('/search', productoController.buscarPaginado);
router.get('/categoria/:categoria', productoController.obtenerPorCategoria);

router.get('/mis-productos', authenticateToken, productoController.obtenerMisProductos);
router.post('/', authenticateToken, upload.array('imagenes', 10), productoController.crear);
router.post('/:id/imagenes', authenticateToken, upload.array('imagenes', 10), productoController.agregarImagenes);
router.delete('/:id/imagenes', authenticateToken, productoController.eliminarImagen);
router.put('/:id', authenticateToken, productoController.actualizar);
router.delete('/:id', authenticateToken, productoController.eliminar);
router.get('/:id', productoController.obtenerPorId);

module.exports = router;
