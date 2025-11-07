const express = require('express');
const router = express.Router();
const imagenController = require('../controllers/imagenController');

router.get('/:nombre', imagenController.obtenerImagen);

module.exports = router;
