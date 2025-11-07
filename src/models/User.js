const { pool } = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  static async create({ nombre, correo, contrasena, roles = 'COMPRADOR' }) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const hashedPassword = await bcrypt.hash(contrasena, 10);
      const [result] = await connection.query(
        'INSERT INTO usuario (nombre, correo, contrasena, roles) VALUES (?, ?, ?, ?)',
        [nombre, correo, hashedPassword, roles]
      );

      const id_usuario = result.insertId;

      await connection.query(
        'INSERT INTO carrito (id_usuario) VALUES (?)',
        [id_usuario]
      );

      await connection.commit();
      return { id_usuario, nombre, correo, roles };
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }

  static async findByEmail(correo) {
    try {
      const [rows] = await pool.query(
        'SELECT * FROM usuario WHERE correo = ?',
        [correo]
      );
      return rows[0];
    } catch (error) {
      throw error;
    }
  }

  static async findById(id) {
    try {
      const [rows] = await pool.query(
        'SELECT id_usuario, nombre, correo, roles, qr, created_at FROM usuario WHERE id_usuario = ?',
        [id]
      );
      return rows[0];
    } catch (error) {
      throw error;
    }
  }

  static async updateQR(id_usuario, qr) {
    try {
      const [result] = await pool.query(
        'UPDATE usuario SET qr = ? WHERE id_usuario = ?',
        [qr, id_usuario]
      );
      return result.affectedRows > 0;
    } catch (error) {
      throw error;
    }
  }

  static async comparePassword(password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword);
  }

  static async getCartByUserId(id_usuario) {
    try {
      const [rows] = await pool.query(
        'SELECT * FROM carrito WHERE id_usuario = ?',
        [id_usuario]
      );
      return rows[0];
    } catch (error) {
      throw error;
    }
  }

  static async findArtesanosPaginated(page = 1, limit = 10, filters = {}) {
    try {
      const offset = (page - 1) * limit;
      let query = `
        SELECT
          u.id_usuario,
          u.nombre,
          u.correo,
          u.qr,
          u.created_at,
          COUNT(p.id_producto) as total_productos
        FROM usuario u
        LEFT JOIN producto p ON u.id_usuario = p.id_usuario
        WHERE u.roles = 'ARTESANO'
      `;

      let countQuery = "SELECT COUNT(*) as total FROM usuario WHERE roles = 'ARTESANO'";
      const params = [];
      const whereClauses = [];

      // Aplicar filtros si existen
      if (filters.busqueda) {
        whereClauses.push('(u.nombre LIKE ? OR u.correo LIKE ?)');
        params.push(`%${filters.busqueda}%`, `%${filters.busqueda}%`);
      }

      if (whereClauses.length > 0) {
        query += ' AND ' + whereClauses.join(' AND ');
        countQuery += ' AND ' + whereClauses.join(' AND ');
      }

      query += ' GROUP BY u.id_usuario, u.nombre, u.correo, u.qr, u.created_at';
      query += ' ORDER BY u.created_at DESC';

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

  static async findArtesanoWithProducts(id_usuario, page = 1, limit = 10) {
    try {
      // Obtener datos del artesano
      const [artesano] = await pool.query(
        'SELECT id_usuario, nombre, correo, qr, created_at FROM usuario WHERE id_usuario = ? AND roles = ?',
        [id_usuario, 'ARTESANO']
      );

      if (artesano.length === 0) {
        return null;
      }

      // Calcular offset
      const offset = (page - 1) * limit;

      // Obtener total de productos del artesano
      const [countResult] = await pool.query(
        'SELECT COUNT(*) as total FROM producto WHERE id_usuario = ?',
        [id_usuario]
      );
      const totalProductos = countResult[0].total;

      // Obtener productos del artesano con paginación
      const [productos] = await pool.query(
        'SELECT * FROM producto WHERE id_usuario = ? ORDER BY created_at DESC LIMIT ? OFFSET ?',
        [id_usuario, limit, offset]
      );

      return {
        ...artesano[0],
        productos,
        pagination: {
          page,
          limit,
          total: totalProductos,
          totalPages: Math.ceil(totalProductos / limit)
        }
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = User;
