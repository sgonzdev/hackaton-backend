const express = require('express');
const router = express.Router();
const blockchainController = require('../controllers/blockchainController');

// Obtener toda la cadena blockchain
router.get('/chain', blockchainController.obtenerCadena);

// Verificar certificado por hash (JSON)
router.get('/verificar/:hash', blockchainController.verificarCertificado);

// Ver certificado visual (HTML) - Este es el que se escanea con QR
router.get('/certificado/:hash', blockchainController.verCertificado);

// Verificar integridad de la cadena
router.get('/integridad', blockchainController.verificarIntegridad);

module.exports = router;
