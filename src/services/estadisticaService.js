const Estadistica = require('../models/Estadistica');

class EstadisticaService {
  // Obtener estadísticas generales
  static async obtenerEstadisticasGenerales() {
    try {
      return await Estadistica.obtenerEstadisticasGenerales();
    } catch (error) {
      console.error('Error obteniendo estadísticas generales:', error);
      throw error;
    }
  }

  // Obtener productos con mejor reseña (paginado)
  static async obtenerProductosMejorResena(page = 1, limit = 10) {
    try {
      // Validar page y limit
      const pageNum = parseInt(page);
      const limitNum = parseInt(limit);

      if (isNaN(pageNum) || pageNum < 1) {
        const error = new Error('El número de página debe ser mayor a 0');
        error.statusCode = 400;
        throw error;
      }

      if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
        const error = new Error('El límite debe estar entre 1 y 100');
        error.statusCode = 400;
        throw error;
      }

      return await Estadistica.obtenerProductosMejorResena(pageNum, limitNum);
    } catch (error) {
      console.error('Error obteniendo productos con mejor reseña:', error);
      throw error;
    }
  }

  // Obtener todas las estadísticas (generales + productos top paginados)
  static async obtenerEstadisticasCompletas(page = 1, limit = 10) {
    try {
      const [estadisticasGenerales, productosMejorResena] = await Promise.all([
        this.obtenerEstadisticasGenerales(),
        this.obtenerProductosMejorResena(page, limit)
      ]);

      return {
        ...estadisticasGenerales,
        productos_mejor_resena: productosMejorResena.data,
        pagination: productosMejorResena.pagination
      };
    } catch (error) {
      console.error('Error obteniendo estadísticas completas:', error);
      throw error;
    }
  }
}

module.exports = EstadisticaService;
