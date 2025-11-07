const { pool } = require('../config/database');

class Resena {
  static async create({ puntuacion, comentario, id_producto, id_usuario }) {
    try {
      const fecha = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      const [result] = await pool.query(
        'INSERT INTO resena (puntuacion, comentario, fecha, id_producto, id_usuario) VALUES (?, ?, ?, ?, ?)',
        [puntuacion, comentario, fecha, id_producto, id_usuario]
      );
      return {
        id_resena: result.insertId,
        puntuacion,
        comentario,
        fecha,
        id_producto,
        id_usuario
      };
    } catch (error) {
      throw error;
    }
  }

  static async findByProductoPaginated(id_producto, page = 1, limit = 10) {
    try {
      const offset = (page - 1) * limit;

      // Query principal con JOIN para obtener información del usuario
      const query = `
        SELECT
          r.id_resena,
          r.puntuacion,
          r.comentario,
          r.fecha,
          r.id_producto,
          r.id_usuario,
          r.created_at,
          r.updated_at,
          u.nombre as nombre_usuario,
          u.correo as correo_usuario
        FROM resena r
        INNER JOIN usuario u ON r.id_usuario = u.id_usuario
        WHERE r.id_producto = ?
        ORDER BY r.created_at DESC
        LIMIT ? OFFSET ?
      `;

      // Query para contar total
      const countQuery = 'SELECT COUNT(*) as total FROM resena WHERE id_producto = ?';

      const [rows] = await pool.query(query, [id_producto, limit, offset]);
      const [countResult] = await pool.query(countQuery, [id_producto]);
      const total = countResult[0].total;

      // Calcular promedio de puntuación
      const [avgResult] = await pool.query(
        'SELECT AVG(puntuacion) as promedio FROM resena WHERE id_producto = ?',
        [id_producto]
      );
      const promedioCalificacion = avgResult[0].promedio ? parseFloat(avgResult[0].promedio).toFixed(1) : null;

      return {
        data: rows,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        },
        estadisticas: {
          total_resenas: total,
          promedio_calificacion: promedioCalificacion
        }
      };
    } catch (error) {
      throw error;
    }
  }

  static async findById(id) {
    try {
      const [rows] = await pool.query(
        `SELECT
          r.*,
          u.nombre as nombre_usuario
        FROM resena r
        INNER JOIN usuario u ON r.id_usuario = u.id_usuario
        WHERE r.id_resena = ?`,
        [id]
      );
      return rows[0];
    } catch (error) {
      throw error;
    }
  }

  static async findByUsuarioAndProducto(id_usuario, id_producto) {
    try {
      const [rows] = await pool.query(
        'SELECT * FROM resena WHERE id_usuario = ? AND id_producto = ?',
        [id_usuario, id_producto]
      );
      return rows[0];
    } catch (error) {
      throw error;
    }
  }

  static async delete(id) {
    try {
      const [result] = await pool.query(
        'DELETE FROM resena WHERE id_resena = ?',
        [id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Resena;
