const AuthService = require('../services/authService');


const authController = {

  register: async (req, res) => {
    try {
      const result = await AuthService.registrar(req.body);

      res.status(201).json({
        success: true,
        message: 'Usuario registrado exitosamente',
        data: result
      });
    } catch (error) {
      console.error('Register error:', error);
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Error al registrar usuario'
      });
    }
  },

  login: async (req, res) => {
    try {
      const result = await AuthService.login(req.body);

      res.status(200).json({
        success: true,
        message: 'Login exitoso',
        data: result
      });
    } catch (error) {
      console.error('Login error:', error);
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Error al iniciar sesión'
      });
    }
  },

  getProfile: async (req, res) => {
    try {
      const user = await AuthService.obtenerPerfil(req.userId);

      res.status(200).json({
        success: true,
        data: { user }
      });
    } catch (error) {
      console.error('Get profile error:', error);
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Error al obtener perfil'
      });
    }
  }
};

module.exports = authController;
