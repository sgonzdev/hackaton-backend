const { pool } = require('../config/database');

class Carrito {
  // Agregar producto al carrito
  static async agregarProducto(id_carrito, id_producto, cantidad = 1) {
    try {
      const [existing] = await pool.query(
        'SELECT * FROM carrito_producto WHERE id_carrito = ? AND id_producto = ?',
        [id_carrito, id_producto]
      );

      if (existing.length > 0) {
        // Si ya existe, actualizar cantidad
        await pool.query(
          'UPDATE carrito_producto SET cantidad = cantidad + ? WHERE id_carrito = ? AND id_producto = ?',
          [cantidad, id_carrito, id_producto]
        );
      } else {
        // Si no existe, insertar nuevo
        await pool.query(
          'INSERT INTO carrito_producto (id_carrito, id_producto, cantidad) VALUES (?, ?, ?)',
          [id_carrito, id_producto, cantidad]
        );
      }
      return true;
    } catch (error) {
      throw error;
    }
  }

  // Obtener productos del carrito con información completa
  static async obtenerProductos(id_carrito) {
    try {
      const [rows] = await pool.query(
        `SELECT
          cp.id_carrito_producto,
          cp.cantidad,
          p.id_producto,
          p.nombre,
          p.descripcion,
          p.precio,
          p.stock,
          p.imagenes,
          (cp.cantidad * p.precio) as subtotal
        FROM carrito_producto cp
        INNER JOIN producto p ON cp.id_producto = p.id_producto
        WHERE cp.id_carrito = ?`,
        [id_carrito]
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }

  // Actualizar cantidad de un producto
  static async actualizarCantidad(id_carrito, id_producto, cantidad) {
    try {
      if (cantidad <= 0) {
        return await this.eliminarProducto(id_carrito, id_producto);
      }

      const [result] = await pool.query(
        'UPDATE carrito_producto SET cantidad = ? WHERE id_carrito = ? AND id_producto = ?',
        [cantidad, id_carrito, id_producto]
      );
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // Eliminar producto del carrito
  static async eliminarProducto(id_carrito, id_producto) {
    try {
      const [result] = await pool.query(
        'DELETE FROM carrito_producto WHERE id_carrito = ? AND id_producto = ?',
        [id_carrito, id_producto]
      );
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // Vaciar carrito
  static async vaciar(id_carrito) {
    try {
      await pool.query('DELETE FROM carrito_producto WHERE id_carrito = ?', [id_carrito]);
      return true;
    } catch (error) {
      throw error;
    }
  }

  // Calcular total del carrito
  static async calcularTotal(id_carrito) {
    try {
      const [result] = await pool.query(
        `SELECT SUM(cp.cantidad * p.precio) as total
        FROM carrito_producto cp
        INNER JOIN producto p ON cp.id_producto = p.id_producto
        WHERE cp.id_carrito = ?`,
        [id_carrito]
      );
      return parseFloat(result[0].total || 0);
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Carrito;
