const User = require('../models/User');

class ArtesanoService {

  static async buscarPaginado(page = 1, limit = 10, filters = {}) {
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

    return await User.findArtesanosPaginated(pageNum, limitNum, filters);
  }

  static async obtenerPorId(id_usuario, page = 1, limit = 10) {
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

    const artesano = await User.findArtesanoWithProducts(id_usuario, pageNum, limitNum);

    if (!artesano) {
      const error = new Error('Artesano no encontrado');
      error.statusCode = 404;
      throw error;
    }

    return artesano;
  }

  static async obtenerTodos() {
    try {
      const resultado = await User.findArtesanosPaginated(1, 1000, {});
      return resultado.data;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = ArtesanoService;
