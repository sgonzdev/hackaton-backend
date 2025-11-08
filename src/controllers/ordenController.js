const OrdenService = require('../services/ordenService');

const ordenController = {
  obtenerOrdenes: async (req, res) => {
    try {
      const { page = 1, limit = 10 } = req.query;
      const resultado = await OrdenService.obtenerOrdenes(req.userId, parseInt(page), parseInt(limit));

      res.status(200).json({
        success: true,
        data: resultado.data,
        pagination: resultado.pagination
      });
    } catch (error) {
      console.error('Error obteniendo órdenes:', error);
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Error al obtener órdenes'
      });
    }
  },

  obtenerOrdenPorId: async (req, res) => {
    try {
      const { id } = req.params;
      const orden = await OrdenService.obtenerOrden(req.userId, parseInt(id));

      res.status(200).json({
        success: true,
        data: { orden }
      });
    } catch (error) {
      console.error('Error obteniendo orden:', error);
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Error al obtener orden'
      });
    }
  }
};

module.exports = ordenController;
