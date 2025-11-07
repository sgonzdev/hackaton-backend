const ResenaService = require('../services/resenaService');

const resenaController = {

  crear: async (req, res) => {
    try {
      const id_usuario = req.user.id_usuario;
      const datosResena = req.body;

      const resena = await ResenaService.crear(datosResena, id_usuario);

      res.status(201).json({
        success: true,
        message: 'Reseña creada exitosamente',
        data: resena
      });
    } catch (error) {
      console.error('Error creando reseña:', error);
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Error al crear la reseña'
      });
    }
  },

  listarPorProducto: async (req, res) => {
    try {
      const { id_producto } = req.params;
      const { page = 1, limit = 10 } = req.query;

      const resultado = await ResenaService.listarPorProducto(id_producto, page, limit);

      res.status(200).json({
        success: true,
        ...resultado
      });
    } catch (error) {
      console.error('Error listando reseñas:', error);
      res.status(error.statusCode || 500).json({
        success: false,
        message: error.message || 'Error al listar las reseñas'
      });
    }
  }
};

module.exports = resenaController;
