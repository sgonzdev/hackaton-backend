const ImagenService = require('../services/imagenService');
const path = require('path');

const imagenController = {

  obtenerImagen: async (req, res) => {
    try {
      const { nombre } = req.params;

      if (!ImagenService.existeImagen(nombre)) {
        return res.status(404).json({
          success: false,
          message: 'Imagen no encontrada'
        });
      }

      const rutaImagen = ImagenService.obtenerRutaImagen(nombre);

      // Determinar tipo MIME
      const ext = path.extname(nombre).toLowerCase();
      const mimeTypes = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.gif': 'image/gif',
        '.webp': 'image/webp'
      };

      const mimeType = mimeTypes[ext] || 'application/octet-stream';

      res.setHeader('Content-Type', mimeType);
      res.sendFile(rutaImagen);

    } catch (error) {
      console.error('Error obteniendo imagen:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener la imagen'
      });
    }
  }
};

module.exports = imagenController;
