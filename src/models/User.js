const { pool } = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  static async create({ nombre, correo, contrasena, roles = 'COMPRADOR' }) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      // Hash de la contraseña
      const hashedPassword = await bcrypt.hash(contrasena, 10);

      // Insertar usuario
      const [result] = await connection.query(
        'INSERT INTO usuario (nombre, correo, contrasena, roles) VALUES (?, ?, ?, ?)',
        [nombre, correo, hashedPassword, roles]
      );

      const id_usuario = result.insertId;

      // Crear carrito automáticamente para el usuario
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
        'SELECT id_usuario, nombre, correo, roles, created_at FROM usuario WHERE id_usuario = ?',
        [id]
      );
      return rows[0];
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
}

module.exports = User;
