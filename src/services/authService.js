const User = require('../models/User');
const { generateToken } = require('../utils/jwt');
const QRService = require('./qrService');

class AuthService {

  static async registrar(datosUsuario) {
    const { nombre, correo, contrasena, roles } = datosUsuario;

    if (!nombre || !correo || !contrasena) {
      const error = new Error('Todos los campos son requeridos (nombre, correo, contrasena)');
      error.statusCode = 400;
      throw error;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(correo)) {
      const error = new Error('Formato de correo inválido');
      error.statusCode = 400;
      throw error;
    }

    if (contrasena.length < 6) {
      const error = new Error('La contraseña debe tener al menos 6 caracteres');
      error.statusCode = 400;
      throw error;
    }

    if (roles && !['ARTESANO', 'COMPRADOR'].includes(roles)) {
      const error = new Error('Rol inválido. Debe ser ARTESANO o COMPRADOR');
      error.statusCode = 400;
      throw error;
    }

    const existingUser = await User.findByEmail(correo);
    if (existingUser) {
      const error = new Error('El correo ya está registrado');
      error.statusCode = 400;
      throw error;
    }

    const user = await User.create({ nombre, correo, contrasena, roles });

    // Si es un artesano, generar QR
    if (user.roles === 'ARTESANO') {
      try {
        const qrData = await QRService.generarQRArtesano(user.id_usuario);
        await User.updateQR(user.id_usuario, qrData.qr);
        user.qr = qrData.qr;
      } catch (qrError) {
        console.error('Error generando QR del artesano:', qrError);
      }
    }

    const token = generateToken({
      userId: user.id_usuario,
      correo: user.correo,
      roles: user.roles
    });

    return {
      user: {
        id_usuario: user.id_usuario,
        nombre: user.nombre,
        correo: user.correo,
        roles: user.roles,
        qr: user.qr
      },
      token
    };
  }

  static async login(credenciales) {
    const { correo, contrasena } = credenciales;

    if (!correo || !contrasena) {
      const error = new Error('Correo y contraseña son requeridos');
      error.statusCode = 400;
      throw error;
    }

    const user = await User.findByEmail(correo);
    if (!user) {
      const error = new Error('Credenciales inválidas');
      error.statusCode = 401;
      throw error;
    }

    const isValidPassword = await User.comparePassword(contrasena, user.contrasena);
    if (!isValidPassword) {
      const error = new Error('Credenciales inválidas');
      error.statusCode = 401;
      throw error;
    }

    const token = generateToken({
      userId: user.id_usuario,
      correo: user.correo,
      roles: user.roles
    });

    return {
      user: {
        id_usuario: user.id_usuario,
        nombre: user.nombre,
        correo: user.correo,
        roles: user.roles,
        qr: user.qr
      },
      token
    };
  }

  static async obtenerPerfil(userId) {
    const user = await User.findById(userId);

    if (!user) {
      const error = new Error('Usuario no encontrado');
      error.statusCode = 404;
      throw error;
    }

    return {
      id_usuario: user.id_usuario,
      nombre: user.nombre,
      correo: user.correo,
      roles: user.roles,
      qr: user.qr,
      created_at: user.created_at
    };
  }

  static async existeUsuario(correo) {
    const user = await User.findByEmail(correo);
    return !!user;
  }

  static async obtenerCarrito(userId) {
    const carrito = await User.getCartByUserId(userId);

    if (!carrito) {
      const error = new Error('Carrito no encontrado');
      error.statusCode = 404;
      throw error;
    }

    return carrito;
  }
}

module.exports = AuthService;
