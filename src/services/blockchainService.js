const Blockchain = require('../blockchain/Blockchain');
const Block = require('../blockchain/Block');
const fs = require('fs');
const path = require('path');

class BlockchainService {
  constructor() {
    this.blockchainFile = path.join(__dirname, '../../data/blockchain.json');
    this.blockchain = this.loadBlockchain();
  }

  // Cargar blockchain desde archivo o crear una nueva
  loadBlockchain() {
    try {
      // Crear directorio data si no existe
      const dataDir = path.join(__dirname, '../../data');
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }

      // Cargar blockchain existente
      if (fs.existsSync(this.blockchainFile)) {
        const data = fs.readFileSync(this.blockchainFile, 'utf8');
        const chainData = JSON.parse(data);

        const blockchain = new Blockchain();
        blockchain.chain = chainData.map(blockData => {
          const block = new Block(
            blockData.index,
            blockData.timestamp,
            blockData.data,
            blockData.previousHash
          );
          block.hash = blockData.hash;
          block.nonce = blockData.nonce;
          return block;
        });

        return blockchain;
      }

      // Crear nueva blockchain
      return new Blockchain();
    } catch (error) {
      console.error('Error cargando blockchain:', error);
      return new Blockchain();
    }
  }

  // Guardar blockchain en archivo
  saveBlockchain() {
    try {
      fs.writeFileSync(
        this.blockchainFile,
        JSON.stringify(this.blockchain.getChain(), null, 2),
        'utf8'
      );
    } catch (error) {
      console.error('Error guardando blockchain:', error);
    }
  }

  // Crear certificado blockchain para un producto
  crearCertificadoProducto(productoData) {
    const { id_producto, nombre, id_usuario, precio, categoria } = productoData;

    const certificadoData = {
      tipo: 'CERTIFICADO_PRODUCTO',
      id_producto,
      nombre_producto: nombre,
      id_artesano: id_usuario,
      precio,
      categoria,
      fecha_certificacion: new Date().toISOString()
    };

    const newBlock = new Block(
      this.blockchain.getLatestBlock().index + 1,
      new Date().toISOString(),
      certificadoData
    );

    this.blockchain.addBlock(newBlock);
    this.saveBlockchain();

    return {
      hash: newBlock.hash,
      index: newBlock.index,
      timestamp: newBlock.timestamp,
      certificado: certificadoData
    };
  }

  // Verificar certificado por hash
  verificarCertificado(hash) {
    const block = this.blockchain.getBlockByHash(hash);

    if (!block) {
      return {
        valido: false,
        mensaje: 'Certificado no encontrado en la blockchain'
      };
    }

    // Verificar integridad de la cadena
    const cadenaValida = this.blockchain.isChainValid();

    if (!cadenaValida) {
      return {
        valido: false,
        mensaje: 'La blockchain ha sido comprometida'
      };
    }

    // Verificar que el hash del bloque es correcto
    const hashCalculado = block.calculateHash();
    if (block.hash !== hashCalculado) {
      return {
        valido: false,
        mensaje: 'El certificado ha sido alterado'
      };
    }

    return {
      valido: true,
      mensaje: 'Certificado válido y auténtico',
      bloque: {
        index: block.index,
        timestamp: block.timestamp,
        data: block.data,
        hash: block.hash,
        previousHash: block.previousHash,
        nonce: block.nonce
      }
    };
  }

  // Obtener toda la cadena
  obtenerCadena() {
    return this.blockchain.getChain();
  }

  // Verificar integridad de toda la cadena
  verificarIntegridadCadena() {
    return this.blockchain.isChainValid();
  }
}

// Exportar instancia singleton
module.exports = new BlockchainService();
