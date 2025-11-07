const { pool } = require('../config/database');

class Producto {
  static async create({ nombre, descripcion, precio, stock, categoria, imagenes, video_proceso, id_usuario }) {
    try {
      const imagenesJson = imagenes ? JSON.stringify(imagenes) : null;
      const [result] = await pool.query(
        'INSERT INTO producto (nombre, descripcion, precio, stock, categoria, imagenes, video_proceso, id_usuario) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [nombre, descripcion, precio, stock, categoria, imagenesJson, video_proceso, id_usuario]
      );
      return { id_producto: result.insertId, nombre, descripcion, precio, stock, categoria, imagenes, video_proceso, id_usuario };
    } catch (error) {
      throw error;
    }
  }

  static async findById(id) {
    try {
      const [rows] = await pool.query(
        'SELECT * FROM producto WHERE id_producto = ?',
        [id]
      );
      return rows[0];
    } catch (error) {
      throw error;
    }
  }

  static async findAll() {
    try {
      const [rows] = await pool.query('SELECT * FROM producto');
      return rows;
    } catch (error) {
      throw error;
    }
  }

  static async findAllPaginated(page = 1, limit = 10, filters = {}) {
    try {
      const offset = (page - 1) * limit;
      let query = 'SELECT * FROM producto';
      let countQuery = 'SELECT COUNT(*) as total FROM producto';
      const params = [];
      const whereClauses = [];

      // Aplicar filtros si existen
      if (filters.categoria) {
        whereClauses.push('categoria = ?');
        params.push(filters.categoria);
      }

      if (filters.id_usuario) {
        whereClauses.push('id_usuario = ?');
        params.push(filters.id_usuario);
      }

      if (filters.busqueda) {
        whereClauses.push('(nombre LIKE ? OR descripcion LIKE ?)');
        params.push(`%${filters.busqueda}%`, `%${filters.busqueda}%`);
      }

      if (whereClauses.length > 0) {
        const whereClause = ' WHERE ' + whereClauses.join(' AND ');
        query += whereClause;
        countQuery += whereClause;
      }

      // Agregar ORDER BY
      query += ' ORDER BY created_at DESC';

      // Obtener el total de registros
      const [countResult] = await pool.query(countQuery, params);
      const total = countResult[0].total;

      // Agregar LIMIT y OFFSET
      query += ' LIMIT ? OFFSET ?';
      params.push(limit, offset);

      const [rows] = await pool.query(query, params);

      return {
        data: rows,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      throw error;
    }
  }

  static async findByUserId(id_usuario) {
    try {
      const [rows] = await pool.query(
        'SELECT * FROM producto WHERE id_usuario = ?',
        [id_usuario]
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }

  static async findByCategoria(categoria) {
    try {
      const [rows] = await pool.query(
        'SELECT * FROM producto WHERE categoria = ?',
        [categoria]
      );
      return rows;
    } catch (error) {
      throw error;
    }
  }

  static async update(id, { nombre, descripcion, precio, stock, categoria, imagenes, video_proceso }) {
    try {
      const imagenesJson = imagenes !== undefined ? JSON.stringify(imagenes) : undefined;

      let query = 'UPDATE producto SET nombre = ?, descripcion = ?, precio = ?, stock = ?, categoria = ?';
      const params = [nombre, descripcion, precio, stock, categoria];

      if (imagenesJson !== undefined) {
        query += ', imagenes = ?';
        params.push(imagenesJson);
      }

      query += ', video_proceso = ? WHERE id_producto = ?';
      params.push(video_proceso, id);

      const [result] = await pool.query(query, params);
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  static async updateImagenes(id, imagenes) {
    try {
      const imagenesJson = JSON.stringify(imagenes);
      const [result] = await pool.query(
        'UPDATE producto SET imagenes = ? WHERE id_producto = ?',
        [imagenesJson, id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  static async updateQR(id, qr) {
    try {
      const [result] = await pool.query(
        'UPDATE producto SET qr = ? WHERE id_producto = ?',
        [qr, id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  static async updateStock(id, cantidad) {
    try {
      const [result] = await pool.query(
        'UPDATE producto SET stock = stock + ? WHERE id_producto = ?',
        [cantidad, id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  static async delete(id) {
    try {
      const [result] = await pool.query(
        'DELETE FROM producto WHERE id_producto = ?',
        [id]
      );
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Producto;
