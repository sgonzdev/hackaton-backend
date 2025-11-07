const ArtesanoService = require('../services/artesanoService');

const artesanoController = {

  buscarPaginado: async (req, res) => {
    try {
      const { page = 1, limit = 10, busqueda } = req.query;

      const filters = {};
      if (busqueda) filters.busqueda = busqueda;

      const resultado = await ArtesanoService.buscarPaginado(page, limit, filters);

      res.status(200).json({
        success: true,
        data: resultado.data,
        pagination: resultado.pagination
      });
    } catch (error) {
      console.error('Error en búsqueda paginada de artesanos:', error);
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Error en la búsqueda de artesanos'
      });
    }
  },

  obtenerPorId: async (req, res) => {
    try {
      const { page = 1, limit = 10 } = req.query;
      const artesano = await ArtesanoService.obtenerPorId(req.params.id, page, limit);

      res.status(200).json({
        success: true,
        data: artesano
      });
    } catch (error) {
      console.error('Error obteniendo artesano:', error);
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Error al obtener artesano'
      });
    }
  },

  obtenerTodos: async (_req, res) => {
    try {
      const artesanos = await ArtesanoService.obtenerTodos();

      res.status(200).json({
        success: true,
        data: { artesanos }
      });
    } catch (error) {
      console.error('Error obteniendo artesanos:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener artesanos'
      });
    }
  }
};

module.exports = artesanoController;
