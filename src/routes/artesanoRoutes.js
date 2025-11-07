const express = require('express');
const router = express.Router();
const artesanoController = require('../controllers/artesanoController');

router.get('/', artesanoController.obtenerTodos);
router.get('/search', artesanoController.buscarPaginado);
router.get('/:id', artesanoController.obtenerPorId);

module.exports = router;
