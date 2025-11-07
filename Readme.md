# 📋 Documentación de Endpoints - API Hackaton

Base URL: `http://localhost:3000/api`

---

## 🔐 Autenticación (`/auth`)

### 1. Registrar Usuario
```
POST /api/auth/register
```

**Body (JSON):**
```json
{
  "nombre": "Juan Pérez",
  "correo": "juan@example.com",
  "contrasena": "password123",
  "roles": "COMPRADOR"  // O "ARTESANO"
}
```

**Respuesta Exitosa (201):**
```json
{
  "success": true,
  "message": "Usuario registrado exitosamente",
  "data": {
    "user": {
      "id_usuario": 1,
      "nombre": "Juan Pérez",
      "correo": "juan@example.com",
      "roles": "COMPRADOR"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### 2. Iniciar Sesión
```
POST /api/auth/login
```

**Body (JSON):**
```json
{
  "correo": "juan@example.com",
  "contrasena": "password123"
}
```

**Respuesta Exitosa (200):**
```json
{
  "success": true,
  "message": "Login exitoso",
  "data": {
    "user": {
      "id_usuario": 1,
      "nombre": "Juan Pérez",
      "correo": "juan@example.com",
      "roles": "COMPRADOR"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

---

### 3. Obtener Perfil (Requiere autenticación)
```
GET /api/auth/profile
Authorization: Bearer {token}
```

**Respuesta Exitosa (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id_usuario": 1,
      "nombre": "Juan Pérez",
      "correo": "juan@example.com",
      "roles": "COMPRADOR",
      "qr": "data:image/png;base64,...",
      "created_at": "2025-11-07T10:00:00.000Z"
    }
  }
}
```

---

## 🏺 Productos (`/productos`)

### 1. Listar Todos los Productos
```
GET /api/productos
```

**Respuesta Exitosa (200):**
```json
{
  "success": true,
  "data": {
    "productos": [
      {
        "id_producto": 1,
        "nombre": "Camiseta deportiva",
        "descripcion": "Camiseta transpirable",
        "precio": "59.99",
        "stock": 120,
        "categoria": "Ropa deportiva",
        "imagenes": ["imagen1.png", "imagen2.png"],
        "qr": "data:image/png;base64,...",
        "certificado_blockchain": "00e85e8395ba...",
        "video_proceso": "https://...",
        "id_usuario": 1,
        "created_at": "2025-11-07T10:00:00.000Z"
      }
    ]
  }
}
```

---

### 2. Buscar Productos (Paginado)
```
GET /api/productos/search?page=1&limit=10&categoria=Cerámica&busqueda=artesanal&id_usuario=2
```

**Query Parameters:**
- `page` (opcional): Número de página (default: 1)
- `limit` (opcional): Items por página (default: 10, max: 100)
- `categoria` (opcional): Filtrar por categoría
- `busqueda` (opcional): Buscar en nombre o descripción
- `id_usuario` (opcional): Filtrar por artesano

**Respuesta Exitosa (200):**
```json
{
  "success": true,
  "data": [ /* array de productos */ ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 45,
    "totalPages": 5
  }
}
```

---

### 3. Obtener Producto por ID
```
GET /api/productos/:id
```

**Ejemplo:**
```
GET /api/productos/1
```

**Respuesta Exitosa (200):**
```json
{
  "success": true,
  "data": {
    "producto": {
      "id_producto": 1,
      "nombre": "Camiseta deportiva",
      "descripcion": "...",
      "precio": "59.99",
      "stock": 120,
      "categoria": "Ropa deportiva",
      "imagenes": ["imagen1.png"],
      "qr": "data:image/png;base64,...",
      "certificado_blockchain": "00e85e8395ba...",
      "video_proceso": "https://...",
      "id_usuario": 1
    }
  }
}
```

---

### 4. Obtener Productos por Categoría
```
GET /api/productos/categoria/:categoria
```

**Ejemplo:**
```
GET /api/productos/categoria/Cerámica
```

**Respuesta:** Similar a listar todos los productos

---

### 5. Obtener Mis Productos (Requiere autenticación - Solo artesanos)
```
GET /api/productos/mis-productos
Authorization: Bearer {token}
```

**Respuesta:** Array de productos del artesano autenticado

---

### 6. Crear Producto (Requiere autenticación - Solo artesanos)
```
POST /api/productos
Authorization: Bearer {token}
Content-Type: multipart/form-data
```

**Body (FormData):**
```
nombre: "Cerámica artesanal"
descripcion: "Hermosa pieza de cerámica"
precio: 50.00
stock: 10
categoria: "Cerámica"
video_proceso: "https://..."  (opcional)
imagenes: [File, File]  (hasta 10 imágenes)
```

**Respuesta Exitosa (201):**
```json
{
  "success": true,
  "message": "Producto creado exitosamente",
  "data": {
    "producto": {
      "id_producto": 5,
      "nombre": "Cerámica artesanal",
      "precio": "50.00",
      "stock": 10,
      "qr": "data:image/png;base64,...",
      "certificado_blockchain": "abc123...",
      "blockchain_info": {
        "hash": "abc123...",
        "index": 2,
        "timestamp": "2025-11-07T15:30:00.000Z"
      }
    }
  }
}
```

---

### 7. Actualizar Producto (Requiere autenticación - Solo dueño)
```
PUT /api/productos/:id
Authorization: Bearer {token}
```

**Body (JSON):**
```json
{
  "nombre": "Nuevo nombre",
  "descripcion": "Nueva descripción",
  "precio": 60.00,
  "stock": 15,
  "categoria": "Nueva categoría",
  "video_proceso": "https://..."
}
```

**Respuesta Exitosa (200):**
```json
{
  "success": true,
  "message": "Producto actualizado exitosamente"
}
```

---

### 8. Agregar Imágenes a Producto (Requiere autenticación - Solo dueño)
```
POST /api/productos/:id/imagenes
Authorization: Bearer {token}
Content-Type: multipart/form-data
```

**Body (FormData):**
```
imagenes: [File, File]  (hasta 10 imágenes)
```

**Respuesta Exitosa (200):**
```json
{
  "success": true,
  "message": "Imágenes agregadas exitosamente",
  "data": {
    "imagenes": ["imagen1.png", "imagen2.png", "imagen3.png"]
  }
}
```

---

### 9. Eliminar Imagen de Producto (Requiere autenticación - Solo dueño)
```
DELETE /api/productos/:id/imagenes
Authorization: Bearer {token}
```

**Body (JSON):**
```json
{
  "nombreImagen": "1762545020953-81540241.png"
}
```

**Respuesta Exitosa (200):**
```json
{
  "success": true,
  "message": "Imagen eliminada exitosamente",
  "data": {
    "imagenes": ["imagen2.png"]
  }
}
```

---

### 10. Eliminar Producto (Requiere autenticación - Solo dueño)
```
DELETE /api/productos/:id
Authorization: Bearer {token}
```

**Respuesta Exitosa (200):**
```json
{
  "success": true,
  "message": "Producto eliminado exitosamente"
}
```

---

## 👨‍🎨 Artesanos (`/artesanos`)

### 1. Listar Todos los Artesanos
```
GET /api/artesanos
```

**Respuesta Exitosa (200):**
```json
{
  "success": true,
  "data": {
    "artesanos": [
      {
        "id_usuario": 2,
        "nombre": "María Artesana",
        "correo": "maria@example.com",
        "roles": "ARTESANO",
        "qr": "data:image/png;base64,...",
        "created_at": "2025-11-07T10:00:00.000Z"
      }
    ]
  }
}
```

---

### 2. Buscar Artesanos (Paginado)
```
GET /api/artesanos/search?page=1&limit=10&busqueda=maria
```

**Query Parameters:**
- `page` (opcional): Número de página (default: 1)
- `limit` (opcional): Items por página (default: 10, max: 100)
- `busqueda` (opcional): Buscar por nombre o correo

**Respuesta Exitosa (200):**
```json
{
  "success": true,
  "data": [ /* array de artesanos */ ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 5,
    "totalPages": 1
  }
}
```

---

### 3. Obtener Artesano por ID (con productos paginados)
```
GET /api/artesanos/:id?page=1&limit=10
```

**Query Parameters:**
- `page` (opcional): Página de productos (default: 1)
- `limit` (opcional): Productos por página (default: 10)

**Respuesta Exitosa (200):**
```json
{
  "success": true,
  "data": {
    "id_usuario": 2,
    "nombre": "María Artesana",
    "correo": "maria@example.com",
    "roles": "ARTESANO",
    "qr": "data:image/png;base64,...",
    "productos": {
      "data": [ /* array de productos del artesano */ ],
      "pagination": {
        "page": 1,
        "limit": 10,
        "total": 15,
        "totalPages": 2
      }
    }
  }
}
```

---

## 🖼️ Imágenes (`/imagenes`)

### 1. Obtener Imagen
```
GET /api/imagenes/:nombre
```

**Ejemplo:**
```
GET /api/imagenes/1762545020953-81540241.png
```

**Respuesta:** Retorna la imagen con el Content-Type correcto (image/png, image/jpeg, etc.)

---

## 🔗 Blockchain (`/blockchain`)

### 1. Obtener Cadena Blockchain Completa
```
GET /api/blockchain/chain
```

**Respuesta Exitosa (200):**
```json
{
  "success": true,
  "data": {
    "chain": [
      {
        "index": 0,
        "timestamp": "2025-11-07T10:00:00.000Z",
        "data": "Genesis block",
        "previousHash": "0",
        "hash": "abc123...",
        "nonce": 0
      },
      {
        "index": 1,
        "timestamp": "2025-11-07T11:00:00.000Z",
        "data": {
          "tipo": "CERTIFICADO_PRODUCTO",
          "id_producto": 1,
          "nombre_producto": "Cerámica",
          "id_artesano": 2,
          "precio": "50.00",
          "categoria": "Cerámica",
          "fecha_certificacion": "2025-11-07T11:00:00.000Z"
        },
        "previousHash": "abc123...",
        "hash": "def456...",
        "nonce": 12345
      }
    ],
    "length": 2
  }
}
```

---

### 2. Verificar Certificado Blockchain (JSON)
```
GET /api/blockchain/verificar/:hash
```

**Ejemplo:**
```
GET /api/blockchain/verificar/00e85e8395ba0978ead1ab142cf181fb6d1e4ee7705e94de6918ce8b5509d06b
```

**Respuesta Exitosa (200):**
```json
{
  "success": true,
  "valido": true,
  "mensaje": "Certificado válido y auténtico",
  "bloque": {
    "index": 1,
    "timestamp": "2025-11-07T11:00:00.000Z",
    "data": {
      "tipo": "CERTIFICADO_PRODUCTO",
      "id_producto": 1,
      "nombre_producto": "Cerámica artesanal",
      "id_artesano": 2,
      "precio": "50.00",
      "categoria": "Cerámica",
      "fecha_certificacion": "2025-11-07T11:00:00.000Z"
    },
    "hash": "00e85e8395ba...",
    "previousHash": "abc123...",
    "nonce": 12345
  },
  "qrCode": "data:image/png;base64,..."
}
```

**Respuesta Error - Certificado No Válido (404):**
```json
{
  "success": false,
  "valido": false,
  "mensaje": "Certificado no encontrado en la blockchain",
  "qrCode": null
}
```

---

### 3. Ver Certificado Visual (HTML)
```
GET /api/blockchain/certificado/:hash
```

**Ejemplo:**
```
GET /api/blockchain/certificado/00e85e8395ba0978ead1ab142cf181fb6d1e4ee7705e94de6918ce8b5509d06b
```

**Respuesta:** Retorna una página HTML con el certificado de autenticidad visual, incluyendo:
- Nombre del producto
- Artesano
- Categoría
- Precio
- Fecha de certificación
- Hash del certificado
- QR code para verificación
- Información del bloque blockchain

---

### 4. Verificar Integridad de la Cadena
```
GET /api/blockchain/integridad
```

**Respuesta Exitosa (200):**
```json
{
  "success": true,
  "data": {
    "valida": true,
    "mensaje": "La blockchain es válida y no ha sido comprometida"
  }
}
```

**Respuesta Error - Cadena Comprometida (200):**
```json
{
  "success": true,
  "data": {
    "valida": false,
    "mensaje": "La blockchain ha sido comprometida o alterada"
  }
}
```

---

## ⭐ Reseñas (`/resenas`)

### 1. Crear Reseña (Requiere autenticación - Solo compradores)
```
POST /api/resenas
Authorization: Bearer {token}
```

**Body (JSON):**
```json
{
  "puntuacion": 5,
  "comentario": "Excelente producto artesanal, muy buena calidad!",
  "id_producto": 1
}
```

**Validaciones:**
- Solo usuarios con rol `COMPRADOR` pueden crear reseñas
- Puntuación debe estar entre 1 y 5
- Un usuario solo puede dejar una reseña por producto

**Respuesta Exitosa (201):**
```json
{
  "success": true,
  "message": "Reseña creada exitosamente",
  "data": {
    "id_resena": 1,
    "puntuacion": 5,
    "comentario": "Excelente producto artesanal, muy buena calidad!",
    "fecha": "2025-11-07",
    "id_producto": 1,
    "id_usuario": 3
  }
}
```

**Respuesta Error - Usuario ya dejó reseña (409):**
```json
{
  "success": false,
  "message": "Ya has dejado una reseña para este producto"
}
```

**Respuesta Error - Solo compradores (403):**
```json
{
  "success": false,
  "message": "Solo los compradores pueden dejar reseñas"
}
```

---

### 2. Listar Reseñas de un Producto (Público, paginado)
```
GET /api/resenas/producto/:id_producto?page=1&limit=10
```

**Ejemplo:**
```
GET /api/resenas/producto/1?page=1&limit=10
```

**Query Parameters:**
- `page` (opcional): Número de página (default: 1)
- `limit` (opcional): Items por página (default: 10, max: 100)

**Respuesta Exitosa (200):**
```json
{
  "success": true,
  "data": [
    {
      "id_resena": 1,
      "puntuacion": 5,
      "comentario": "Excelente producto artesanal!",
      "fecha": "2025-11-07",
      "id_producto": 1,
      "id_usuario": 3,
      "nombre_usuario": "Pedro Comprador",
      "correo_usuario": "pedro@example.com",
      "created_at": "2025-11-07T15:30:00.000Z",
      "updated_at": "2025-11-07T15:30:00.000Z"
    },
    {
      "id_resena": 2,
      "puntuacion": 4,
      "comentario": "Muy buen producto, llegó rápido",
      "fecha": "2025-11-06",
      "id_producto": 1,
      "id_usuario": 4,
      "nombre_usuario": "Ana López",
      "correo_usuario": "ana@example.com",
      "created_at": "2025-11-06T12:00:00.000Z",
      "updated_at": "2025-11-06T12:00:00.000Z"
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 15,
    "totalPages": 2
  },
  "estadisticas": {
    "total_resenas": 15,
    "promedio_calificacion": "4.5"
  }
}
```

---

---

## 📝 Notas Importantes

### Autenticación
- Los endpoints que requieren autenticación necesitan el header:
  ```
  Authorization: Bearer {token}
  ```
- El token se obtiene al hacer login o registro
- El token contiene `userId` que se usa para identificar al usuario en operaciones protegidas

### Roles de Usuario
- `COMPRADOR`: Puede crear reseñas, ver productos
- `ARTESANO`: Puede crear, editar y eliminar sus productos

### Paginación
- Todos los endpoints paginados aceptan `page` y `limit` como query parameters
- `limit` máximo: 100
- Por defecto: `page=1`, `limit=10`

### Formato de Imágenes
- Las imágenes se suben como `multipart/form-data`
- Máximo 10 imágenes por producto
- QR codes se retornan en formato Data URL (base64)

### Blockchain
- Cada producto creado recibe automáticamente un certificado blockchain
- El hash se guarda en la columna `certificado_blockchain` del producto
- Los certificados son inmutables y verificables
