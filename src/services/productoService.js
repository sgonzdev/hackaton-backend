const Producto = require('../models/Producto');
const User = require('../models/User');
const QRService = require('./qrService');
const ImagenService = require('./imagenService');

class ProductoService {

  static async crear(datosProducto, id_usuario, archivosImagenes = null) {
    const { nombre, descripcion, precio, stock, categoria, video_proceso } = datosProducto;

    if (!nombre || !precio || stock === undefined) {
      throw new Error('Nombre, precio y stock son requeridos');
    }

    const usuario = await User.findById(id_usuario);
    if (!usuario) {
      throw new Error('Usuario no encontrado');
    }

    if (usuario.roles !== 'ARTESANO') {
      const error = new Error('Solo los artesanos pueden crear productos');
      error.statusCode = 403;
      throw error;
    }

    // Procesar imágenes subidas
    const imagenes = archivosImagenes ? ImagenService.procesarImagenesSubidas(archivosImagenes) : [];

    const producto = await Producto.create({
      nombre,
      descripcion,
      precio,
      stock,
      categoria,
      imagenes,
      video_proceso,
      id_usuario
    });

    try {
      const { qr } = await QRService.generarQRProducto(producto.id_producto, producto.nombre);
      await Producto.updateQR(producto.id_producto, qr);
      producto.qr = qr;
    } catch (qrError) {
      console.error('Error generando QR:', qrError);
    }

    return producto;
  }

  static async obtenerTodos() {
    return await Producto.findAll();
  }

  static async buscarPaginado(page = 1, limit = 10, filters = {}) {
    // Validar page y limit
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    if (isNaN(pageNum) || pageNum < 1) {
      const error = new Error('El número de página debe ser mayor a 0');
      error.statusCode = 400;
      throw error;
    }

    if (isNaN(limitNum) || limitNum < 1 || limitNum > 100) {
      const error = new Error('El límite debe estar entre 1 y 100');
      error.statusCode = 400;
      throw error;
    }

    return await Producto.findAllPaginated(pageNum, limitNum, filters);
  }

  static async obtenerPorId(id) {
    const producto = await Producto.findById(id);

    if (!producto) {
      const error = new Error('Producto no encontrado');
      error.statusCode = 404;
      throw error;
    }

    return producto;
  }

  static async obtenerPorCategoria(categoria) {
    return await Producto.findByCategoria(categoria);
  }

  static async obtenerPorUsuario(id_usuario) {
    return await Producto.findByUserId(id_usuario);
  }


  static async actualizar(id, datosActualizacion, id_usuario) {
    const producto = await Producto.findById(id);
    if (!producto) {
      const error = new Error('Producto no encontrado');
      error.statusCode = 404;
      throw error;
    }

    if (producto.id_usuario !== id_usuario) {
      const error = new Error('No tienes permiso para actualizar este producto');
      error.statusCode = 403;
      throw error;
    }

    const { nombre, descripcion, precio, stock, categoria, video_proceso } = datosActualizacion;

    const actualizado = await Producto.update(id, {
      nombre: nombre || producto.nombre,
      descripcion: descripcion !== undefined ? descripcion : producto.descripcion,
      precio: precio || producto.precio,
      stock: stock !== undefined ? stock : producto.stock,
      categoria: categoria || producto.categoria,
      video_proceso: video_proceso || producto.video_proceso
    });

    if (nombre && nombre !== producto.nombre) {
      try {
        const { qr } = await QRService.generarQRProducto(id, nombre);
        await Producto.updateQR(id, qr);
      } catch (qrError) {
        console.error('Error regenerando QR:', qrError);
      }
    }

    return actualizado;
  }


  static async eliminar(id, id_usuario) {
    const producto = await Producto.findById(id);
    if (!producto) {
      const error = new Error('Producto no encontrado');
      error.statusCode = 404;
      throw error;
    }

    if (producto.id_usuario !== id_usuario) {
      const error = new Error('No tienes permiso para eliminar este producto');
      error.statusCode = 403;
      throw error;
    }

    return await Producto.delete(id);
  }

  static async actualizarStock(id, cantidad) {
    const producto = await Producto.findById(id);
    if (!producto) {
      const error = new Error('Producto no encontrado');
      error.statusCode = 404;
      throw error;
    }

    if (producto.stock + cantidad < 0) {
      const error = new Error('Stock insuficiente');
      error.statusCode = 400;
      throw error;
    }

    return await Producto.updateStock(id, cantidad);
  }


  static async regenerarQR(id) {
    const producto = await Producto.findById(id);
    if (!producto) {
      const error = new Error('Producto no encontrado');
      error.statusCode = 404;
      throw error;
    }

    const { qr } = await QRService.generarQRProducto(producto.id_producto, producto.nombre);
    await Producto.updateQR(id, qr);

    return qr;
  }

  static async agregarImagenes(id, archivosImagenes, id_usuario) {
    const producto = await Producto.findById(id);
    if (!producto) {
      const error = new Error('Producto no encontrado');
      error.statusCode = 404;
      throw error;
    }

    if (producto.id_usuario !== id_usuario) {
      const error = new Error('No tienes permiso para modificar este producto');
      error.statusCode = 403;
      throw error;
    }

    // Obtener imágenes actuales
    const imagenesActuales = producto.imagenes ? JSON.parse(producto.imagenes) : [];

    // Procesar nuevas imágenes
    const nuevasImagenes = ImagenService.procesarImagenesSubidas(archivosImagenes);

    // Combinar imágenes
    const todasLasImagenes = [...imagenesActuales, ...nuevasImagenes];

    await Producto.updateImagenes(id, todasLasImagenes);

    return todasLasImagenes;
  }

  static async eliminarImagen(id, nombreImagen, id_usuario) {
    const producto = await Producto.findById(id);
    if (!producto) {
      const error = new Error('Producto no encontrado');
      error.statusCode = 404;
      throw error;
    }

    if (producto.id_usuario !== id_usuario) {
      const error = new Error('No tienes permiso para modificar este producto');
      error.statusCode = 403;
      throw error;
    }

    // Obtener imágenes actuales
    const imagenesActuales = producto.imagenes ? JSON.parse(producto.imagenes) : [];

    // Filtrar la imagen a eliminar
    const nuevasImagenes = imagenesActuales.filter(img => img !== nombreImagen);

    if (imagenesActuales.length === nuevasImagenes.length) {
      const error = new Error('Imagen no encontrada en el producto');
      error.statusCode = 404;
      throw error;
    }

    // Eliminar archivo físico
    ImagenService.eliminarImagen(nombreImagen);

    // Actualizar BD
    await Producto.updateImagenes(id, nuevasImagenes);

    return nuevasImagenes;
  }
}

module.exports = ProductoService;
