const fs = require('fs');
const path = require('path');

class ImagenService {

  static generarUrlImagen(nombreArchivo) {
    const dominio = process.env.DOMINIO || 'http://localhost:3000';
    return `${dominio}/api/imagenes/${nombreArchivo}`;
  }

  static procesarImagenesSubidas(files) {
    if (!files || files.length === 0) {
      return [];
    }

    return files.map(file => file.filename);
  }

  static eliminarImagen(nombreArchivo) {
    try {
      const rutaArchivo = path.join(__dirname, '../../uploads/productos', nombreArchivo);

      if (fs.existsSync(rutaArchivo)) {
        fs.unlinkSync(rutaArchivo);
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error eliminando imagen:', error);
      return false;
    }
  }

  static eliminarImagenes(nombresArchivos) {
    if (!nombresArchivos || nombresArchivos.length === 0) {
      return;
    }

    nombresArchivos.forEach(nombreArchivo => {
      this.eliminarImagen(nombreArchivo);
    });
  }

  static obtenerRutaImagen(nombreArchivo) {
    return path.join(__dirname, '../../uploads/productos', nombreArchivo);
  }

  static existeImagen(nombreArchivo) {
    const rutaArchivo = this.obtenerRutaImagen(nombreArchivo);
    return fs.existsSync(rutaArchivo);
  }
}

module.exports = ImagenService;
