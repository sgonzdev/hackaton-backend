const QRCode = require('qrcode');
require('dotenv').config();

class QRService {

  static async generarQR(url, options = {}) {
    try {
      const defaultOptions = {
        errorCorrectionLevel: 'M',
        type: 'image/png',
        width: 300,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      };

      const qrOptions = { ...defaultOptions, ...options };
      const qrCodeDataURL = await QRCode.toDataURL(url, qrOptions);

      return qrCodeDataURL;
    } catch (error) {
      throw new Error(`Error al generar código QR: ${error.message}`);
    }
  }

  static generarUrlProducto(idProducto, nombreProducto) {
    const dominio = process.env.DOMINIO || 'http://localhost:3000';
    const nombreSlug = this.convertirASlug(nombreProducto);

    return `${dominio}/product/${nombreSlug}/${idProducto}`;
  }


  static convertirASlug(texto) {
    return texto
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') 
      .replace(/[^a-z0-9]+/g, '-') 
      .replace(/(^-|-$)/g, ''); 
  }

  static async generarQRProducto(idProducto, nombreProducto, options = {}) {
    try {
      const url = this.generarUrlProducto(idProducto, nombreProducto);
      const qr = await this.generarQR(url, options);

      return { url, qr };
    } catch (error) {
      throw new Error(`Error al generar QR del producto: ${error.message}`);
    }
  }

  static async generarQRCustom(urlBase, path = '', options = {}) {
    try {
      const url = path ? `${urlBase}/${path}` : urlBase;
      return await this.generarQR(url, options);
    } catch (error) {
      throw new Error(`Error al generar QR personalizado: ${error.message}`);
    }
  }

  static generarUrlArtesano(idArtesano) {
    const dominio = process.env.DOMINIO || 'http://localhost:3000';

    return `${dominio}/artesano/${idArtesano}`;
  }

  static async generarQRArtesano(idArtesano, options = {}) {
    try {
      const url = this.generarUrlArtesano(idArtesano);
      const qr = await this.generarQR(url, options);

      return { url, qr };
    } catch (error) {
      throw new Error(`Error al generar QR del artesano: ${error.message}`);
    }
  }
}

module.exports = QRService;
