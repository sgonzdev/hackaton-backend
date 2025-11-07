const User = require('../models/User');
const { generateToken } = require('../utils/jwt');

const authController = {
  // Register new user
  register: async (req, res) => {
    try {
      const { nombre, correo, contrasena, roles } = req.body;

      // Validate required fields
      if (!nombre || !correo || !contrasena) {
        return res.status(400).json({
          success: false,
          message: 'Todos los campos son requeridos (nombre, correo, contrasena)'
        });
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(correo)) {
        return res.status(400).json({
          success: false,
          message: 'Formato de correo inválido'
        });
      }

      // Validate password length
      if (contrasena.length < 6) {
        return res.status(400).json({
          success: false,
          message: 'La contraseña debe tener al menos 6 caracteres'
        });
      }

      // Validate roles if provided
      if (roles && !['ARTESANO', 'COMPRADOR'].includes(roles)) {
        return res.status(400).json({
          success: false,
          message: 'Rol inválido. Debe ser ARTESANO o COMPRADOR'
        });
      }

      // Check if user already exists
      const existingUserByEmail = await User.findByEmail(correo);
      if (existingUserByEmail) {
        return res.status(400).json({
          success: false,
          message: 'El correo ya está registrado'
        });
      }

      // Create new user
      const user = await User.create({ nombre, correo, contrasena, roles });

      // Generate token
      const token = generateToken({
        userId: user.id_usuario,
        correo: user.correo,
        roles: user.roles
      });

      res.status(201).json({
        success: true,
        message: 'Usuario registrado exitosamente',
        data: {
          user: {
            id_usuario: user.id_usuario,
            nombre: user.nombre,
            correo: user.correo,
            roles: user.roles
          },
          token
        }
      });
    } catch (error) {
      console.error('Register error:', error);
      res.status(500).json({
        success: false,
        message: 'Error al registrar usuario',
        error: error.message
      });
    }
  },

  // Login user
  login: async (req, res) => {
    try {
      const { correo, contrasena } = req.body;

      // Validate required fields
      if (!correo || !contrasena) {
        return res.status(400).json({
          success: false,
          message: 'Correo y contraseña son requeridos'
        });
      }

      // Find user by email
      const user = await User.findByEmail(correo);
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Credenciales inválidas'
        });
      }

      // Compare password
      const isValidPassword = await User.comparePassword(contrasena, user.contrasena);
      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          message: 'Credenciales inválidas'
        });
      }

      // Generate token
      const token = generateToken({
        userId: user.id_usuario,
        correo: user.correo,
        roles: user.roles
      });

      res.status(200).json({
        success: true,
        message: 'Login exitoso',
        data: {
          user: {
            id_usuario: user.id_usuario,
            nombre: user.nombre,
            correo: user.correo,
            roles: user.roles
          },
          token
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: 'Error al iniciar sesión',
        error: error.message
      });
    }
  },

  // Get current user profile (requires authentication)
  getProfile: async (req, res) => {
    try {
      const user = await User.findById(req.userId);

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Usuario no encontrado'
        });
      }

      res.status(200).json({
        success: true,
        data: {
          user
        }
      });
    } catch (error) {
      console.error('Get profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener perfil',
        error: error.message
      });
    }
  }
};

module.exports = authController;
