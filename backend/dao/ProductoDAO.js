const pool = require('../config/db');
const Producto = require('../models/Producto');

class ProductoDAO {
    // READ ALL: Obtiene todos los productos del catálogo
    static async obtenerCatalogoActivo() {
        try {
            // Se le agregó ORDER BY id DESC para que los nuevos salgan primero
            const [rows] = await pool.query('SELECT * FROM productos WHERE activo = 1 ORDER BY id DESC');
            return rows;
        } catch (error) {
            console.error('Error DAO al obtener el catálogo activo:', error);
            throw error; 
        }
    }

    // READ ONE: Busca un individual
    static async encontrarPorId(id) {
        try {
            const [rows] = await pool.query('SELECT * FROM productos WHERE id = ?', [id]);
            return rows.length > 0 ? rows[0] : null;
        } catch (error) {
            console.error(`Error DAO buscar producto ID:`, error);
            throw error;
        }
    }

    // CREATE: Inserta un nuevo producto
    static async crear(productoData) {
        try {
            const query = `INSERT INTO productos (categoria_id, nombre, descripcion, precio, tipo_articulo, stock, estado_articulo, url_imagen, activo) 
                           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
            const params = [
                productoData.categoria_id || 1, 
                productoData.nombre, 
                productoData.descripcion || '', 
                productoData.precio, 
                productoData.tipo_articulo || 'PRODUCTO_FISICO', 
                productoData.stock || 0, 
                productoData.estado_articulo || 'NUEVO', 
                productoData.url_imagen || '',
                productoData.activo !== undefined ? productoData.activo : 1
            ];
            const [result] = await pool.query(query, params);
            return result.insertId; // ID autogenerado
        } catch (error) { 
            console.error('Error DAO crear producto:', error);
            throw error; 
        }
    }

    // UPDATE: Actualiza un registro existente (Soporte Dinámico Optativo de Imágenes)
    static async actualizar(id, productoData) {
        try {
            // Estructura query modular (concatenará partes dinámicas)
            let query = `UPDATE productos SET categoria_id=?, nombre=?, descripcion=?, precio=?, stock=?`;
            const params = [
                productoData.categoria_id, 
                productoData.nombre, 
                productoData.descripcion || '', // Aseguramos inyectar la descripción proveniente del textarea
                productoData.precio, 
                productoData.stock
            ];
            
            // Si el Controlador detectó y adjuntó una nueva url_imagen (Multer Stream)
            if (productoData.url_imagen) {
                query += `, url_imagen=?`;
                params.push(productoData.url_imagen);
            }
            
            // Cerramos la cláusula
            query += ` WHERE id=?`;
            params.push(id);
            
            const [result] = await pool.query(query, params);
            return result.affectedRows > 0;
        } catch (error) { 
            console.error('Error DAO actualizar producto:', error);
            throw error; 
        }
    }

    // DELETE: Elimina permanente un registro de la tabla (Hard Delete)
    static async eliminar(id) {
        try {
            const [result] = await pool.query('DELETE FROM productos WHERE id = ?', [id]);
            return result.affectedRows > 0;
        } catch (error) { 
            console.error('Error DAO eliminar producto:', error);
            throw error; 
        }
    }
}

module.exports = ProductoDAO;
