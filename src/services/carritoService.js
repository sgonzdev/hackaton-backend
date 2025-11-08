const User = require('../models/User');
const Carrito = require('../models/Carrito');
const Producto = require('../models/Producto');

class CarritoService {
  // Obtener carrito con productos
  static async obtenerCarrito(userId) {
    const carritoBase = await User.getCartByUserId(userId);

    if (!carritoBase) {
      const error = new Error('Carrito no encontrado');
      error.statusCode = 404;
      throw error;
    }

    const productos = await Carrito.obtenerProductos(carritoBase.id_carrito);
    const total = await Carrito.calcularTotal(carritoBase.id_carrito);

    return {
      id_carrito: carritoBase.id_carrito,
      productos,
      total,
      cantidad_items: productos.length
    };
  }

  // Agregar producto al carrito
  static async agregarProducto(userId, id_producto, cantidad = 1) {
    const carritoBase = await User.getCartByUserId(userId);
    const producto = await Producto.findById(id_producto);

    if (!producto) {
      const error = new Error('Producto no encontrado');
      error.statusCode = 404;
      throw error;
    }

    if (producto.stock < cantidad) {
      const error = new Error('Stock insuficiente');
      error.statusCode = 400;
      throw error;
    }

    await Carrito.agregarProducto(carritoBase.id_carrito, id_producto, cantidad);
    return await this.obtenerCarrito(userId);
  }

  // Actualizar cantidad
  static async actualizarCantidad(userId, id_producto, cantidad) {
    const carritoBase = await User.getCartByUserId(userId);
    const producto = await Producto.findById(id_producto);

    if (!producto) {
      const error = new Error('Producto no encontrado');
      error.statusCode = 404;
      throw error;
    }

    if (cantidad > 0 && producto.stock < cantidad) {
      const error = new Error('Stock insuficiente');
      error.statusCode = 400;
      throw error;
    }

    await Carrito.actualizarCantidad(carritoBase.id_carrito, id_producto, cantidad);
    return await this.obtenerCarrito(userId);
  }

  // Eliminar producto
  static async eliminarProducto(userId, id_producto) {
    const carritoBase = await User.getCartByUserId(userId);
    await Carrito.eliminarProducto(carritoBase.id_carrito, id_producto);
    return await this.obtenerCarrito(userId);
  }

  // Vaciar carrito
  static async vaciarCarrito(userId) {
    const carritoBase = await User.getCartByUserId(userId);
    await Carrito.vaciar(carritoBase.id_carrito);
    return { message: 'Carrito vaciado exitosamente' };
  }
}

module.exports = CarritoService;
