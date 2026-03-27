const ProductoDAO = require('../dao/ProductoDAO');

class ProductoController {
    // Renderizado/Lectura Total (READ)
    static async getProductos(req, res) {
        try {
            const productos = await ProductoDAO.obtenerCatalogoActivo();
            res.status(200).json(productos);
        } catch (error) {
            res.status(500).json({ error: 'Error interno del servidor al consultar BD' });
        }
    }

    // Obtener un solo producto
    static async getProductoById(req, res) {
        try {
            const producto = await ProductoDAO.encontrarPorId(req.params.id);
            if (!producto) return res.status(404).json({ message: 'No encontrado' });
            res.status(200).json(producto);
        } catch (error) {
            res.status(500).json({ error: 'Error interno' });
        }
    }

    // Agregar Producto (CREATE)
    static async createProducto(req, res) {
        try {
            // Si el Middleware procesó una imagen adjunta, tomamos su nombre generado y formamos la URL Absoluta.
            if (req.file) {
                req.body.url_imagen = `/uploads/productos/${req.file.filename}`;
            }
            
            const nuevoId = await ProductoDAO.crear(req.body);
            res.status(201).json({ message: 'Mercancía creada y catalogada exitosamente', id: nuevoId });
        } catch (error) {
            console.error('API Error:', error);
            res.status(500).json({ error: 'Falla al insertar los datos persistentes en MySQL' });
        }
    }

    // Modificar Producto (UPDATE)
    static async updateProducto(req, res) {
        try {
            // Si mandan una foto de reemplazo sobre el producto anterior, parsear su URL
            if (req.file) {
                req.body.url_imagen = `/uploads/productos/${req.file.filename}`;
            }
            
            const actualizado = await ProductoDAO.actualizar(req.params.id, req.body);
            if (!actualizado) return res.status(404).json({ message: 'Aviso: Producto No Editado o Id Inválido' });
            res.status(200).json({ message: 'Actualizado correctamente en todo el servidor' });
        } catch (error) {
            console.error('API Error:', error);
            res.status(500).json({ error: 'Error editando producto maestro' });
        }
    }

    // Borrado (DELETE)
    static async deleteProducto(req, res) {
        try {
            const eliminado = await ProductoDAO.eliminar(req.params.id);
            if (!eliminado) return res.status(404).json({ message: 'Producto no existe' });
            res.status(200).json({ message: 'Eliminado del inventario de forma exitosa' });
        } catch (error) {
            res.status(500).json({ error: 'Error en la petición de borrado' });
        }
    }
}

module.exports = ProductoController;
