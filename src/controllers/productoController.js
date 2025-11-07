const ProductoService = require('../services/productoService');


const productoController = {

  crear: async (req, res) => {
    try {
      const archivosImagenes = req.files || null;
      const producto = await ProductoService.crear(req.body, req.userId, archivosImagenes);

      res.status(201).json({
        success: true,
        message: 'Producto creado exitosamente',
        data: { producto }
      });
    } catch (error) {
      console.error('Error creando producto:', error);
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Error al crear producto'
      });
    }
  },

  agregarImagenes: async (req, res) => {
    try {
      const archivosImagenes = req.files;

      if (!archivosImagenes || archivosImagenes.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'No se proporcionaron imágenes'
        });
      }

      const imagenes = await ProductoService.agregarImagenes(req.params.id, archivosImagenes, req.userId);

      res.status(200).json({
        success: true,
        message: 'Imágenes agregadas exitosamente',
        data: { imagenes }
      });
    } catch (error) {
      console.error('Error agregando imágenes:', error);
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Error al agregar imágenes'
      });
    }
  },

  eliminarImagen: async (req, res) => {
    try {
      const { nombreImagen } = req.body;

      if (!nombreImagen) {
        return res.status(400).json({
          success: false,
          message: 'Se requiere el nombre de la imagen'
        });
      }

      const imagenes = await ProductoService.eliminarImagen(req.params.id, nombreImagen, req.userId);

      res.status(200).json({
        success: true,
        message: 'Imagen eliminada exitosamente',
        data: { imagenes }
      });
    } catch (error) {
      console.error('Error eliminando imagen:', error);
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Error al eliminar imagen'
      });
    }
  },

  obtenerTodos: async (_req, res) => {
    try {
      const productos = await ProductoService.obtenerTodos();

      res.status(200).json({
        success: true,
        data: { productos }
      });
    } catch (error) {
      console.error('Error obteniendo productos:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener productos'
      });
    }
  },

  buscarPaginado: async (req, res) => {
    try {
      const { page = 1, limit = 10, categoria, busqueda, id_usuario } = req.query;

      const filters = {};
      if (categoria) filters.categoria = categoria;
      if (busqueda) filters.busqueda = busqueda;
      if (id_usuario) filters.id_usuario = id_usuario;

      const resultado = await ProductoService.buscarPaginado(page, limit, filters);

      res.status(200).json({
        success: true,
        data: resultado.data,
        pagination: resultado.pagination
      });
    } catch (error) {
      console.error('Error en búsqueda paginada:', error);
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Error en la búsqueda de productos'
      });
    }
  },

  obtenerPorId: async (req, res) => {
    try {
      const producto = await ProductoService.obtenerPorId(req.params.id);

      res.status(200).json({
        success: true,
        data: { producto }
      });
    } catch (error) {
      console.error('Error obteniendo producto:', error);
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Error al obtener producto'
      });
    }
  },

  obtenerPorCategoria: async (req, res) => {
    try {
      const productos = await ProductoService.obtenerPorCategoria(req.params.categoria);

      res.status(200).json({
        success: true,
        data: { productos }
      });
    } catch (error) {
      console.error('Error obteniendo productos por categoría:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener productos por categoría'
      });
    }
  },

  obtenerMisProductos: async (req, res) => {
    try {
      const productos = await ProductoService.obtenerPorUsuario(req.userId);

      res.status(200).json({
        success: true,
        data: { productos }
      });
    } catch (error) {
      console.error('Error obteniendo mis productos:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener mis productos'
      });
    }
  },

  actualizar: async (req, res) => {
    try {
      await ProductoService.actualizar(req.params.id, req.body, req.userId);

      res.status(200).json({
        success: true,
        message: 'Producto actualizado exitosamente'
      });
    } catch (error) {
      console.error('Error actualizando producto:', error);
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Error al actualizar producto'
      });
    }
  },

  eliminar: async (req, res) => {
    try {
      await ProductoService.eliminar(req.params.id, req.userId);

      res.status(200).json({
        success: true,
        message: 'Producto eliminado exitosamente'
      });
    } catch (error) {
      console.error('Error eliminando producto:', error);
      const statusCode = error.statusCode || 500;
      res.status(statusCode).json({
        success: false,
        message: error.message || 'Error al eliminar producto'
      });
    }
  }
};

module.exports = productoController;
