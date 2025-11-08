-- Create database
CREATE DATABASE IF NOT EXISTS hackaton_db;
USE hackaton_db;

-- ======================================
-- TABLA: Usuario
-- ======================================
CREATE TABLE IF NOT EXISTS usuario (
  id_usuario INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  correo VARCHAR(255) UNIQUE NOT NULL,
  contrasena VARCHAR(255) NOT NULL,
  roles ENUM('ARTESANO', 'COMPRADOR') NOT NULL DEFAULT 'COMPRADOR',
  ubicacion VARCHAR(255),
  tags JSON,
  qr LONGTEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ======================================
-- TABLA: Carrito
-- ======================================
CREATE TABLE IF NOT EXISTS carrito (
  id_carrito INT AUTO_INCREMENT PRIMARY KEY,
  id_usuario INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario) ON DELETE CASCADE,
  UNIQUE KEY unique_usuario_carrito (id_usuario)
);

-- ======================================
-- TABLA: Producto
-- ======================================
CREATE TABLE IF NOT EXISTS producto (
  id_producto INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(255) NOT NULL,
  descripcion TEXT,
  precio DECIMAL(10,2) NOT NULL,
  stock INT NOT NULL DEFAULT 0,
  categoria VARCHAR(255),
  imagenes JSON,
  qr LONGTEXT,
  certificado_blockchain VARCHAR(255),
  video_proceso VARCHAR(255),
  id_usuario INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario) ON DELETE CASCADE
);

-- ======================================
-- TABLA: Compra
-- ======================================
CREATE TABLE IF NOT EXISTS compra (
  id_compra INT AUTO_INCREMENT PRIMARY KEY,
  fecha DATE NOT NULL,
  total DECIMAL(10,2) NOT NULL,
  estado VARCHAR(255) NOT NULL DEFAULT 'pendiente',
  stripe_payment_intent_id VARCHAR(255),
  id_usuario INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario) ON DELETE CASCADE
);

-- ======================================
-- TABLA: Reseña
-- ======================================
CREATE TABLE IF NOT EXISTS resena (
  id_resena INT AUTO_INCREMENT PRIMARY KEY,
  puntuacion INT NOT NULL CHECK (puntuacion >= 1 AND puntuacion <= 5),
  comentario TEXT,
  fecha DATE NOT NULL,
  id_producto INT NOT NULL,
  id_usuario INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (id_producto) REFERENCES producto(id_producto) ON DELETE CASCADE,
  FOREIGN KEY (id_usuario) REFERENCES usuario(id_usuario) ON DELETE CASCADE,
  UNIQUE KEY unique_usuario_producto_resena (id_usuario, id_producto)
);

-- ======================================
-- TABLA: Historia del Producto
-- ======================================
CREATE TABLE IF NOT EXISTS historia_producto (
  id_historia INT AUTO_INCREMENT PRIMARY KEY,
  id_producto INT NOT NULL UNIQUE,
  descripcion TEXT NOT NULL,
  tags JSON,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (id_producto) REFERENCES producto(id_producto) ON DELETE CASCADE
);

-- ======================================
-- TABLA INTERMEDIA: Carrito - Producto
-- ======================================
CREATE TABLE IF NOT EXISTS carrito_producto (
  id_carrito_producto INT AUTO_INCREMENT PRIMARY KEY,
  id_carrito INT NOT NULL,
  id_producto INT NOT NULL,
  cantidad INT NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (id_carrito) REFERENCES carrito(id_carrito) ON DELETE CASCADE,
  FOREIGN KEY (id_producto) REFERENCES producto(id_producto) ON DELETE CASCADE,
  UNIQUE KEY unique_carrito_producto (id_carrito, id_producto)
);

-- ======================================
-- TABLA INTERMEDIA: Compra - Producto
-- ======================================
CREATE TABLE IF NOT EXISTS compra_producto (
  id_compra_producto INT AUTO_INCREMENT PRIMARY KEY,
  id_compra INT NOT NULL,
  id_producto INT NOT NULL,
  cantidad INT NOT NULL DEFAULT 1,
  precio_unitario DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (id_compra) REFERENCES compra(id_compra) ON DELETE CASCADE,
  FOREIGN KEY (id_producto) REFERENCES producto(id_producto) ON DELETE CASCADE
);

-- ======================================
-- INDICES para optimización
-- ======================================
CREATE INDEX idx_usuario_correo ON usuario(correo);
CREATE INDEX idx_usuario_roles ON usuario(roles);
CREATE INDEX idx_producto_categoria ON producto(categoria);
CREATE INDEX idx_producto_usuario ON producto(id_usuario);
CREATE INDEX idx_compra_usuario ON compra(id_usuario);
CREATE INDEX idx_compra_fecha ON compra(fecha);
CREATE INDEX idx_compra_estado ON compra(estado);
CREATE INDEX idx_resena_producto ON resena(id_producto);
CREATE INDEX idx_resena_usuario ON resena(id_usuario);
CREATE INDEX idx_historia_producto ON historia_producto(id_producto);
