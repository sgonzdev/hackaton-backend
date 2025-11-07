const { pool } = require('../config/database');

class HistoriaProducto {
  static async create({ id_producto, descripcion, tags }) {
    try {
      const tagsJson = tags ? JSON.stringify(tags) : null;
      const [result] = await pool.query(
        'INSERT INTO historia_producto (id_producto, descripcion, tags) VALUES (?, ?, ?)',
        [id_producto, descripcion, tagsJson]
      );
      return {
        id_historia: result.insertId,
        id_producto,
        descripcion,
        tags
      };
    } catch (error) {
      throw error;
    }
  }

  static async findByProductoId(id_producto) {
    try {
      const [rows] = await pool.query(
        'SELECT * FROM historia_producto WHERE id_producto = ?',
        [id_producto]
      );

      if (rows[0] && rows[0].tags) {
        rows[0].tags = JSON.parse(rows[0].tags);
      }

      return rows[0];
    } catch (error) {
      throw error;
    }
  }

  static async update(id_producto, { descripcion, tags }) {
    try {
      const tagsJson = tags ? JSON.stringify(tags) : null;
      const [result] = await pool.query(
        'UPDATE historia_producto SET descripcion = ?, tags = ? WHERE id_producto = ?',
        [descripcion, tagsJson, id_producto]
      );
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  static async delete(id_producto) {
    try {
      const [result] = await pool.query(
        'DELETE FROM historia_producto WHERE id_producto = ?',
        [id_producto]
      );
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = HistoriaProducto;
