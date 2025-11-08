const { pool } = require('../config/database');

class Compra {
  // Crear nueva compra
  static async crear({ id_usuario, total, estado = 'pendiente', stripe_payment_intent_id = null }) {
    try {
      const fecha = new Date().toISOString().split('T')[0];
      const [result] = await pool.query(
        'INSERT INTO compra (fecha, total, estado, id_usuario, stripe_payment_intent_id) VALUES (?, ?, ?, ?, ?)',
        [fecha, total, estado, id_usuario, stripe_payment_intent_id]
      );
      return result.insertId;
    } catch (error) {
      throw error;
    }
  }

  // Agregar productos a la compra
  static async agregarProductos(id_compra, productos) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      for (const producto of productos) {
        await connection.query(
          'INSERT INTO compra_producto (id_compra, id_producto, cantidad, precio_unitario) VALUES (?, ?, ?, ?)',
          [id_compra, producto.id_producto, producto.cantidad, producto.precio]
        );
      }

      await connection.commit();
      return true;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  // Obtener compra por ID
  static async obtenerPorId(id_compra) {
    try {
      const [rows] = await pool.query('SELECT * FROM compra WHERE id_compra = ?', [id_compra]);
      return rows[0];
    } catch (error) {
      throw error;
    }
  }

  // Obtener compra con productos
  static async obtenerConProductos(id_compra) {
    try {
      const [compra] = await pool.query('SELECT * FROM compra WHERE id_compra = ?', [id_compra]);

      if (!compra[0]) return null;

      const [productos] = await pool.query(
        `SELECT
          cp.id_producto,
          cp.cantidad,
          cp.precio_unitario,
          p.nombre,
          p.imagenes,
          (cp.cantidad * cp.precio_unitario) as subtotal
        FROM compra_producto cp
        INNER JOIN producto p ON cp.id_producto = p.id_producto
        WHERE cp.id_compra = ?`,
        [id_compra]
      );

      return { ...compra[0], productos };
    } catch (error) {
      throw error;
    }
  }

  // Obtener compras por usuario
  static async obtenerPorUsuario(id_usuario, page = 1, limit = 10) {
    try {
      const offset = (page - 1) * limit;

      const [count] = await pool.query(
        'SELECT COUNT(*) as total FROM compra WHERE id_usuario = ?',
        [id_usuario]
      );

      const [rows] = await pool.query(
        'SELECT * FROM compra WHERE id_usuario = ? ORDER BY created_at DESC LIMIT ? OFFSET ?',
        [id_usuario, limit, offset]
      );

      return {
        data: rows,
        pagination: {
          page,
          limit,
          total: count[0].total,
          totalPages: Math.ceil(count[0].total / limit)
        }
      };
    } catch (error) {
      throw error;
    }
  }

  // Actualizar estado de compra
  static async actualizarEstado(id_compra, estado) {
    try {
      const [result] = await pool.query(
        'UPDATE compra SET estado = ? WHERE id_compra = ?',
        [estado, id_compra]
      );
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  // Actualizar stripe session ID
  static async actualizarStripeId(id_compra, stripe_payment_intent_id) {
    try {
      const [result] = await pool.query(
        'UPDATE compra SET stripe_payment_intent_id = ? WHERE id_compra = ?',
        [stripe_payment_intent_id, id_compra]
      );
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Compra;
