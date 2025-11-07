# Hackaton Node.js API

API REST con Node.js, Express, MySQL y autenticación JWT.

## Requisitos

- Node.js 18+
- MySQL 5.7+ (corriendo localmente)
- Docker y Docker Compose (para dockerización)

## Instalación

### 1. Clonar y configurar

```bash
cd hackaton-node-api
npm install
```

### 2. Configurar variables de entorno

Edita el archivo `.env` con tus credenciales de MySQL:

```env
DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=root
DB_PASSWORD=tu_password
DB_NAME=hackaton_db
JWT_SECRET=cambia-este-secret-en-produccion
```

### 3. Crear base de datos

Ejecuta el script SQL para crear la base de datos y tabla:

```bash
mysql -u root -p < database.sql
```

O manualmente:

```sql
CREATE DATABASE hackaton_db;
USE hackaton_db;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

### 4. Iniciar en modo desarrollo

```bash
npm run dev
```

### 5. Iniciar en modo producción

```bash
npm start
```

## Docker

### Importante: MySQL Local

Esta aplicación se conecta a MySQL corriendo **localmente en tu PC**, no en Docker.

### Configurar MySQL para aceptar conexiones desde Docker

En Linux, edita el archivo de configuración de MySQL:

```bash
sudo nano /etc/mysql/mysql.conf.d/mysqld.cnf
```

Cambia:
```
bind-address = 127.0.0.1
```

Por:
```
bind-address = 0.0.0.0
```

Reinicia MySQL:
```bash
sudo systemctl restart mysql
```

### Construir y ejecutar con Docker

```bash
docker-compose up --build
```

O en modo detached:
```bash
docker-compose up -d
```

Ver logs:
```bash
docker-compose logs -f
```

Detener:
```bash
docker-compose down
```

## Endpoints

### Health Check
```
GET /api/health
```

### Registro de usuario
```
POST /api/auth/register
Content-Type: application/json

{
  "username": "johndoe",
  "email": "john@example.com",
  "password": "password123"
}
```

### Login
```
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

Respuesta:
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": 1,
      "username": "johndoe",
      "email": "john@example.com"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

### Obtener perfil (protegido)
```
GET /api/auth/profile
Authorization: Bearer <token>
```

## Estructura del Proyecto

```
hackaton-node-api/
├── src/
│   ├── config/
│   │   └── database.js       # Configuración MySQL
│   ├── controllers/
│   │   └── authController.js # Controladores de autenticación
│   ├── middleware/
│   │   └── auth.js           # Middleware JWT
│   ├── models/
│   │   └── User.js           # Modelo de usuario
│   ├── routes/
│   │   ├── authRoutes.js     # Rutas de autenticación
│   │   └── index.js          # Rutas principales
│   ├── utils/
│   │   └── jwt.js            # Utilidades JWT
│   └── index.js              # Servidor principal
├── .env                      # Variables de entorno
├── .env.example              # Ejemplo de variables
├── .gitignore
├── .dockerignore
├── database.sql              # Script de base de datos
├── Dockerfile
├── docker-compose.yml
├── package.json
└── README.md
```

## Seguridad

- Las contraseñas se hashean con bcrypt
- Los tokens JWT expiran en 24 horas (configurable)
- CORS configurado
- Validación de datos de entrada
- Variables de entorno para secretos

## Problemas Comunes

### Error de conexión a MySQL desde Docker

1. Verifica que MySQL acepte conexiones remotas (bind-address = 0.0.0.0)
2. En Linux, usa `host.docker.internal` o la IP del host
3. Verifica permisos del usuario MySQL:

```sql
CREATE USER 'root'@'%' IDENTIFIED BY 'tu_password';
GRANT ALL PRIVILEGES ON hackaton_db.* TO 'root'@'%';
FLUSH PRIVILEGES;
```

### Puerto 3000 en uso

Cambia el puerto en `.env`:
```
PORT=3001
```

Y en `docker-compose.yml`:
```yaml
ports:
  - "3001:3001"
```
