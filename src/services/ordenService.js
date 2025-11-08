const Compra = require('../models/Compra');
const User = require('../models/User');
const Carrito = require('../models/Carrito');
const Producto = require('../models/Producto');
const StripeService = require('./stripeService');

class OrdenService {
  // Crear checkout session (devuelve URL de Stripe)
  static async crearCheckoutSession(userId) {
    const carritoBase = await User.getCartByUserId(userId);
    const productos = await Carrito.obtenerProductos(carritoBase.id_carrito);

    if (productos.length === 0) {
      const error = new Error('El carrito está vacío');
      error.statusCode = 400;
      throw error;
    }

    // Validar stock de todos los productos
    for (const item of productos) {
      const producto = await Producto.findById(item.id_producto);
      if (producto.stock < item.cantidad) {
        const error = new Error(`Stock insuficiente para ${item.nombre}`);
        error.statusCode = 400;
        throw error;
      }
    }

    const total = await Carrito.calcularTotal(carritoBase.id_carrito);

    // Crear orden en DB con estado pendiente
    const id_compra = await Compra.crear({
      id_usuario: userId,
      total,
      estado: 'pendiente',
      stripe_payment_intent_id: null
    });

    // Agregar productos a la orden
    const productosParaOrden = productos.map(p => ({
      id_producto: p.id_producto,
      cantidad: p.cantidad,
      precio: p.precio
    }));

    await Compra.agregarProductos(id_compra, productosParaOrden);

    // Crear checkout session en Stripe
    const { sessionId, url } = await StripeService.crearCheckoutSession(
      id_compra,
      productos,
      total,
      userId
    );

    // Guardar session ID en la orden
    await Compra.actualizarStripeId(id_compra, sessionId);

    return {
      id_compra,
      checkout_url: url,
      session_id: sessionId
    };
  }

  // Procesar pago exitoso (llamado por webhook)
  static async procesarPagoExitoso(sessionId) {
    const session = await StripeService.obtenerCheckoutSession(sessionId);
    const id_compra = parseInt(session.metadata.id_compra);
    const id_usuario = parseInt(session.metadata.id_usuario);

    const compra = await Compra.obtenerPorId(id_compra);

    if (!compra) {
      throw new Error('Orden no encontrada');
    }

    if (compra.estado === 'completado') {
      console.log(`Orden ${id_compra} ya fue procesada anteriormente`);
      return;
    }

    // Actualizar estado a completado
    await Compra.actualizarEstado(id_compra, 'completado');

    // Reducir stock de productos
    const ordenCompleta = await Compra.obtenerConProductos(id_compra);
    for (const producto of ordenCompleta.productos) {
      await Producto.updateStock(producto.id_producto, -producto.cantidad);
    }

    // Vaciar carrito
    const carritoBase = await User.getCartByUserId(id_usuario);
    await Carrito.vaciar(carritoBase.id_carrito);

    console.log(`✅ Orden ${id_compra} completada exitosamente`);
  }

  // Obtener órdenes del usuario
  static async obtenerOrdenes(userId, page = 1, limit = 10) {
    return await Compra.obtenerPorUsuario(userId, page, limit);
  }

  // Obtener detalle de orden
  static async obtenerOrden(userId, id_compra) {
    const orden = await Compra.obtenerConProductos(id_compra);

    if (!orden) {
      const error = new Error('Orden no encontrada');
      error.statusCode = 404;
      throw error;
    }

    if (orden.id_usuario !== userId) {
      const error = new Error('No autorizado');
      error.statusCode = 403;
      throw error;
    }

    return orden;
  }
}

module.exports = OrdenService;
