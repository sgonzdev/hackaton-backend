const { pool } = require('../config/database');

class Estadistica {
  // Obtener total de productos vendidos (solo compras completadas)
  static async obtenerTotalProductosVendidos() {
    try {
      const [rows] = await pool.query(`
        SELECT COALESCE(SUM(cp.cantidad), 0) as total_productos_vendidos
        FROM compra_producto cp
        INNER JOIN compra c ON cp.id_compra = c.id_compra
        WHERE c.estado = 'completado'
      `);
      return parseInt(rows[0].total_productos_vendidos);
    } catch (error) {
      throw error;
    }
  }

  // Obtener ganancias totales (solo compras completadas)
  static async obtenerGananciasTotales() {
    try {
      const [rows] = await pool.query(`
        SELECT COALESCE(SUM(cp.cantidad * cp.precio_unitario), 0) as ganancias_totales
        FROM compra_producto cp
        INNER JOIN compra c ON cp.id_compra = c.id_compra
        WHERE c.estado = 'completado'
      `);
      return parseFloat(rows[0].ganancias_totales);
    } catch (error) {
      throw error;
    }
  }

  // Obtener productos con mejor reseña (paginado)
  static async obtenerProductosMejorResena(page = 1, limit = 10) {
    try {
      const offset = (page - 1) * limit;

      // Query principal con promedio de reseñas y total vendidos
      const query = `
        SELECT
          p.id_producto,
          p.nombre,
          p.descripcion,
          p.precio,
          p.categoria,
          p.imagenes,
          COALESCE(AVG(r.puntuacion), 0) as promedio_puntuacion,
          COALESCE(COUNT(DISTINCT r.id_resena), 0) as total_resenas,
          COALESCE(SUM(cp.cantidad), 0) as total_vendidos
        FROM producto p
        LEFT JOIN resena r ON p.id_producto = r.id_producto
        LEFT JOIN compra_producto cp ON p.id_producto = cp.id_producto
        LEFT JOIN compra c ON cp.id_compra = c.id_compra AND c.estado = 'completado'
        GROUP BY p.id_producto, p.nombre, p.descripcion, p.precio, p.categoria, p.imagenes
        HAVING COUNT(DISTINCT r.id_resena) > 0
        ORDER BY promedio_puntuacion DESC, total_resenas DESC
        LIMIT ? OFFSET ?
      `;

      // Query para contar total de productos con reseñas
      const countQuery = `
        SELECT COUNT(DISTINCT p.id_producto) as total
        FROM producto p
        INNER JOIN resena r ON p.id_producto = r.id_producto
      `;

      const [rows] = await pool.query(query, [limit, offset]);
      const [countResult] = await pool.query(countQuery);
      const total = countResult[0].total;

      // Formatear resultados
      const productos = rows.map(row => ({
        id_producto: row.id_producto,
        nombre: row.nombre,
        descripcion: row.descripcion,
        precio: parseFloat(row.precio),
        categoria: row.categoria,
        imagenes: row.imagenes ? JSON.parse(row.imagenes) : [],
        promedio_puntuacion: parseFloat(row.promedio_puntuacion).toFixed(1),
        total_resenas: parseInt(row.total_resenas),
        total_vendidos: parseInt(row.total_vendidos)
      }));

      return {
        data: productos,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      throw error;
    }
  }

  // Obtener todas las estadísticas generales (sin paginación, solo números)
  static async obtenerEstadisticasGenerales() {
    try {
      const [totalProductosVendidos, gananciasTotales] = await Promise.all([
        this.obtenerTotalProductosVendidos(),
        this.obtenerGananciasTotales()
      ]);

      return {
        total_productos_vendidos: totalProductosVendidos,
        ganancias_totales: gananciasTotales
      };
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Estadistica;
