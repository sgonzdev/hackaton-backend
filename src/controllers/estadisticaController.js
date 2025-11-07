const EstadisticaService = require('../services/estadisticaService');

const estadisticaController = {
  // Obtener estadísticas generales (solo números: total vendidos y ganancias)
  obtenerEstadisticasGenerales: async (_req, res) => {
    try {
      const estadisticas = await EstadisticaService.obtenerEstadisticasGenerales();

      res.status(200).json({
        success: true,
        data: estadisticas
      });
    } catch (error) {
      console.error('Error obteniendo estadísticas generales:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener estadísticas generales'
      });
    }
  },

  // Obtener productos con mejor reseña (paginado)
  obtenerProductosMejorResena: async (req, res) => {
    try {
      const { page = 1, limit = 10 } = req.query;

      const resultado = await EstadisticaService.obtenerProductosMejorResena(page, limit);

      res.status(200).json({
        success: true,
        data: resultado.data,
        pagination: resultado.pagination
      });
    } catch (error) {
      console.error('Error obteniendo productos con mejor reseña:', error);
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Error al obtener productos con mejor reseña'
      });
    }
  },

  // Obtener todas las estadísticas (generales + productos top paginados)
  obtenerEstadisticasCompletas: async (req, res) => {
    try {
      const { page = 1, limit = 10 } = req.query;

      const estadisticas = await EstadisticaService.obtenerEstadisticasCompletas(page, limit);

      res.status(200).json({
        success: true,
        data: estadisticas
      });
    } catch (error) {
      console.error('Error obteniendo estadísticas completas:', error);
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Error al obtener estadísticas completas'
      });
    }
  }
};

module.exports = estadisticaController;
