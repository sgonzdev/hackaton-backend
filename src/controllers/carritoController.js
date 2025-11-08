const CarritoService = require('../services/carritoService');

const carritoController = {
  obtener: async (req, res) => {
    try {
      const carrito = await CarritoService.obtenerCarrito(req.userId);
      res.status(200).json({
        success: true,
        data: { carrito }
      });
    } catch (error) {
      console.error('Error obteniendo carrito:', error);
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Error al obtener carrito'
      });
    }
  },

  agregarProducto: async (req, res) => {
    try {
      const { id_producto, cantidad = 1 } = req.body;

      if (!id_producto) {
        return res.status(400).json({
          success: false,
          message: 'id_producto es requerido'
        });
      }

      const carrito = await CarritoService.agregarProducto(req.userId, id_producto, cantidad);
      res.status(200).json({
        success: true,
        message: 'Producto agregado al carrito',
        data: { carrito }
      });
    } catch (error) {
      console.error('Error agregando producto:', error);
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Error al agregar producto'
      });
    }
  },

  actualizarCantidad: async (req, res) => {
    try {
      const { cantidad } = req.body;
      const { id_producto } = req.params;

      if (cantidad === undefined || cantidad < 0) {
        return res.status(400).json({
          success: false,
          message: 'Cantidad inválida'
        });
      }

      const carrito = await CarritoService.actualizarCantidad(req.userId, parseInt(id_producto), cantidad);
      res.status(200).json({
        success: true,
        message: 'Cantidad actualizada',
        data: { carrito }
      });
    } catch (error) {
      console.error('Error actualizando cantidad:', error);
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Error al actualizar cantidad'
      });
    }
  },

  eliminarProducto: async (req, res) => {
    try {
      const { id_producto } = req.params;
      const carrito = await CarritoService.eliminarProducto(req.userId, parseInt(id_producto));
      res.status(200).json({
        success: true,
        message: 'Producto eliminado del carrito',
        data: { carrito }
      });
    } catch (error) {
      console.error('Error eliminando producto:', error);
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Error al eliminar producto'
      });
    }
  },

  vaciar: async (req, res) => {
    try {
      const result = await CarritoService.vaciarCarrito(req.userId);
      res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (error) {
      console.error('Error vaciando carrito:', error);
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Error al vaciar carrito'
      });
    }
  }
};

module.exports = carritoController;
