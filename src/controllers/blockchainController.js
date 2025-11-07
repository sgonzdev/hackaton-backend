const blockchainService = require('../services/blockchainService');
const QRService = require('../services/qrService');

const blockchainController = {

  obtenerCadena: async (_req, res) => {
    try {
      const chain = blockchainService.obtenerCadena();

      res.status(200).json({
        success: true,
        data: {
          chain,
          length: chain.length
        }
      });
    } catch (error) {
      console.error('Error obteniendo cadena blockchain:', error);
      res.status(500).json({
        success: false,
        message: 'Error al obtener la cadena blockchain'
      });
    }
  },

  verificarCertificado: async (req, res) => {
    try {
      const { hash } = req.params;

      if (!hash) {
        return res.status(400).json({
          success: false,
          message: 'Hash del certificado es requerido'
        });
      }

      const verificacion = blockchainService.verificarCertificado(hash);

      // Generar código QR con la URL de verificación si el certificado es válido
      let qrCode = null;
      if (verificacion.valido) {
        try {
          const dominio = process.env.DOMINIO || 'http://localhost:3000';
          qrCode = await QRService.generarQRCustom(dominio, `api/blockchain/verificar/${hash}`);
        } catch (qrError) {
          console.error('Error generando QR:', qrError);
        }
      }

      res.status(verificacion.valido ? 200 : 404).json({
        success: verificacion.valido,
        ...verificacion,
        qrCode
      });
    } catch (error) {
      console.error('Error verificando certificado:', error);
      res.status(500).json({
        success: false,
        message: 'Error al verificar el certificado'
      });
    }
  },

  // Nuevo endpoint para mostrar certificado visual en HTML
  verCertificado: async (req, res) => {
    try {
      const { hash } = req.params;

      if (!hash) {
        return res.status(400).send(`
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <title>Error - Certificado Blockchain</title>
            <style>
              body { font-family: Arial, sans-serif; background: #f5f5f5; padding: 40px; text-align: center; }
              .error { background: white; padding: 30px; border-radius: 10px; max-width: 500px; margin: 0 auto; }
            </style>
          </head>
          <body>
            <div class="error">
              <h1>❌ Error</h1>
              <p>Hash del certificado es requerido</p>
            </div>
          </body>
          </html>
        `);
      }

      const verificacion = blockchainService.verificarCertificado(hash);

      // Generar código QR
      let qrCode = null;
      if (verificacion.valido) {
        try {
          const dominio = process.env.DOMINIO || 'http://localhost:3000';
          qrCode = await QRService.generarQRCustom(dominio, `api/blockchain/certificado/${hash}`);
        } catch (qrError) {
          console.error('Error generando QR:', qrError);
        }
      }

      if (!verificacion.valido) {
        return res.status(404).send(`
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Certificado No Válido</title>
            <style>
              body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                padding: 20px;
                margin: 0;
              }
              .container {
                max-width: 800px;
                margin: 50px auto;
                background: white;
                padding: 40px;
                border-radius: 15px;
                box-shadow: 0 10px 40px rgba(0,0,0,0.2);
                text-align: center;
              }
              h1 { color: #e74c3c; margin-bottom: 20px; }
              .message { color: #555; font-size: 18px; line-height: 1.6; }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>❌ Certificado No Válido</h1>
              <p class="message">${verificacion.mensaje}</p>
            </div>
          </body>
          </html>
        `);
      }

      // Certificado válido - Mostrar página con diseño profesional
      const bloque = verificacion.bloque;
      const data = bloque.data;
      const fecha = new Date(data.fecha_certificacion).toLocaleString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });

      res.send(`
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Certificado de Autenticidad Blockchain</title>
          <style>
            * { margin: 0; padding: 0; box-sizing: border-box; }
            body {
              font-family: 'Georgia', serif;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              padding: 20px;
              min-height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            .certificate {
              max-width: 900px;
              width: 100%;
              background: white;
              padding: 60px;
              border-radius: 20px;
              box-shadow: 0 20px 60px rgba(0,0,0,0.3);
              border: 15px solid #f0f0f0;
              position: relative;
            }
            .certificate::before {
              content: '';
              position: absolute;
              top: 30px;
              left: 30px;
              right: 30px;
              bottom: 30px;
              border: 2px solid #667eea;
              pointer-events: none;
            }
            .header {
              text-align: center;
              margin-bottom: 40px;
            }
            .header h1 {
              color: #667eea;
              font-size: 36px;
              margin-bottom: 10px;
              font-weight: bold;
            }
            .header .subtitle {
              color: #764ba2;
              font-size: 20px;
              font-style: italic;
            }
            .badge {
              text-align: center;
              margin: 30px 0;
            }
            .badge-icon {
              font-size: 80px;
              color: #27ae60;
              margin-bottom: 10px;
            }
            .badge-text {
              color: #27ae60;
              font-size: 24px;
              font-weight: bold;
            }
            .info-section {
              margin: 30px 0;
              padding: 20px;
              background: #f8f9fa;
              border-radius: 10px;
            }
            .info-row {
              display: flex;
              margin: 15px 0;
              padding: 10px 0;
              border-bottom: 1px solid #e0e0e0;
            }
            .info-row:last-child {
              border-bottom: none;
            }
            .info-label {
              font-weight: bold;
              color: #555;
              min-width: 200px;
              font-size: 16px;
            }
            .info-value {
              color: #333;
              font-size: 16px;
              word-break: break-all;
            }
            .hash-section {
              margin: 30px 0;
              padding: 20px;
              background: #fff3cd;
              border-left: 5px solid #ffc107;
              border-radius: 5px;
            }
            .hash-section h3 {
              color: #856404;
              margin-bottom: 10px;
            }
            .hash-value {
              font-family: 'Courier New', monospace;
              font-size: 12px;
              color: #856404;
              word-break: break-all;
              background: white;
              padding: 10px;
              border-radius: 5px;
            }
            .qr-section {
              text-align: center;
              margin: 30px 0;
              padding: 20px;
              background: #f8f9fa;
              border-radius: 10px;
            }
            .qr-section h3 {
              color: #555;
              margin-bottom: 15px;
            }
            .qr-section img {
              max-width: 250px;
              border: 5px solid white;
              box-shadow: 0 5px 15px rgba(0,0,0,0.1);
              border-radius: 10px;
            }
            .footer {
              text-align: center;
              margin-top: 40px;
              padding-top: 20px;
              border-top: 2px solid #e0e0e0;
              color: #888;
              font-size: 14px;
            }
            .blockchain-info {
              background: #e8f5e9;
              padding: 15px;
              border-radius: 10px;
              margin: 20px 0;
              text-align: center;
            }
            .blockchain-info p {
              color: #2e7d32;
              font-size: 14px;
              margin: 5px 0;
            }
            @media print {
              body { background: white; }
              .certificate { box-shadow: none; }
            }
          </style>
        </head>
        <body>
          <div class="certificate">
            <div class="header">
              <h1>🏺 CERTIFICADO DE AUTENTICIDAD</h1>
              <p class="subtitle">Verificado mediante Blockchain</p>
            </div>

            <div class="badge">
              <div class="badge-icon">✓</div>
              <div class="badge-text">PRODUCTO AUTÉNTICO</div>
            </div>

            <div class="info-section">
              <h2 style="color: #667eea; margin-bottom: 20px; text-align: center;">Información del Producto</h2>

              <div class="info-row">
                <span class="info-label">📦 Nombre del Producto:</span>
                <span class="info-value">${data.nombre_producto || 'N/A'}</span>
              </div>

              <div class="info-row">
                <span class="info-label">👤 Artesano:</span>
                <span class="info-value">ID: ${data.id_artesano || 'N/A'}</span>
              </div>

              <div class="info-row">
                <span class="info-label">🏷️ Categoría:</span>
                <span class="info-value">${data.categoria || 'N/A'}</span>
              </div>

              <div class="info-row">
                <span class="info-label">💰 Precio:</span>
                <span class="info-value">$${data.precio || 'N/A'}</span>
              </div>

              <div class="info-row">
                <span class="info-label">📅 Fecha de Certificación:</span>
                <span class="info-value">${fecha}</span>
              </div>
            </div>

            <div class="blockchain-info">
              <p><strong>🔗 Bloque #${bloque.index}</strong></p>
              <p>Este certificado está registrado de forma inmutable en la blockchain</p>
              <p>Timestamp: ${bloque.timestamp}</p>
            </div>

            <div class="hash-section">
              <h3>🔒 Hash del Certificado (Blockchain)</h3>
              <div class="hash-value">${bloque.hash}</div>
            </div>

            ${qrCode ? `
            <div class="qr-section">
              <h3>📱 Código QR de Verificación</h3>
              <p style="color: #888; margin-bottom: 15px;">Escanea para verificar la autenticidad</p>
              <img src="${qrCode}" alt="Código QR de Verificación">
            </div>
            ` : ''}

            <div class="footer">
              <p><strong>Este certificado es verificable en tiempo real mediante blockchain</strong></p>
              <p>Sistema de Certificación Blockchain v1.0</p>
              <p style="margin-top: 10px; font-size: 12px;">
                Hash del bloque anterior: ${bloque.previousHash}
              </p>
            </div>
          </div>
        </body>
        </html>
      `);
    } catch (error) {
      console.error('Error mostrando certificado:', error);
      res.status(500).send(`
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <title>Error</title>
          <style>
            body { font-family: Arial, sans-serif; background: #f5f5f5; padding: 40px; text-align: center; }
            .error { background: white; padding: 30px; border-radius: 10px; max-width: 500px; margin: 0 auto; }
          </style>
        </head>
        <body>
          <div class="error">
            <h1>❌ Error</h1>
            <p>Error al mostrar el certificado</p>
          </div>
        </body>
        </html>
      `);
    }
  },

  verificarIntegridad: async (_req, res) => {
    try {
      const esValida = blockchainService.verificarIntegridadCadena();

      res.status(200).json({
        success: true,
        data: {
          valida: esValida,
          mensaje: esValida
            ? 'La blockchain es válida y no ha sido comprometida'
            : 'La blockchain ha sido comprometida o alterada'
        }
      });
    } catch (error) {
      console.error('Error verificando integridad:', error);
      res.status(500).json({
        success: false,
        message: 'Error al verificar la integridad de la blockchain'
      });
    }
  }
};

module.exports = blockchainController;
