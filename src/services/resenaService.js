const Resena = require('../models/Resena');
const Producto = require('../models/Producto');
const User = require('../models/User');

class ResenaService {

  static async crear(datosResena, id_usuario) {
    const { puntuacion, comentario, id_producto } = datosResena;

    // Validaciones
    if (!puntuacion || !id_producto) {
      throw new Error('Puntuación e ID del producto son requeridos');
    }

    if (puntuacion < 1 || puntuacion > 5) {
      throw new Error('La puntuación debe estar entre 1 y 5');
    }

    // Verificar que el producto existe
    const producto = await Producto.findById(id_producto);
    if (!producto) {
      const error = new Error('Producto no encontrado');
      error.statusCode = 404;
      throw error;
    }

    // Verificar que el usuario existe
    const usuario = await User.findById(id_usuario);
    if (!usuario) {
      const error = new Error('Usuario no encontrado');
      error.statusCode = 404;
      throw error;
    }

    // Verificar que el usuario es un comprador (no artesano)
    if (usuario.roles !== 'COMPRADOR') {
      const error = new Error('Solo los compradores pueden dejar reseñas');
      error.statusCode = 403;
      throw error;
    }

    // Verificar que el usuario no haya dejado ya una reseña para este producto
    const resenaExistente = await Resena.findByUsuarioAndProducto(id_usuario, id_producto);
    if (resenaExistente) {
      const error = new Error('Ya has dejado una reseña para este producto');
      error.statusCode = 409;
      throw error;
    }

    // Crear la reseña
    const resena = await Resena.create({
      puntuacion,
      comentario,
      id_producto,
      id_usuario
    });

    return resena;
  }

  static async listarPorProducto(id_producto, page = 1, limit = 10) {
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

    // Verificar que el producto existe
    const producto = await Producto.findById(id_producto);
    if (!producto) {
      const error = new Error('Producto no encontrado');
      error.statusCode = 404;
      throw error;
    }

    return await Resena.findByProductoPaginated(id_producto, pageNum, limitNum);
  }
}

module.exports = ResenaService;
