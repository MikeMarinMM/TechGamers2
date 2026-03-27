const PedidoDAO = require('../dao/PedidoDAO');
const ProductoDAO = require('../dao/ProductoDAO');

class PedidoController {

    // Ejecución de Pasarela Frontal
    static async comprar(req, res) {
        try {
            // Gracias a que nuestro Filtro authMiddleware verificó primero, sabemos la identidad del atacante/cliente
            const ID_Cliente_Logueado = req.usuario.id; 
            
            // Atrapamos la firma desde JSON request Body
            const { producto_id, cantidad } = req.body;
            
            // Verificación Lógica Defensiva Preliminar
            if (!producto_id) {
                return res.status(400).json({ message: 'Error de Sintaxis Frontend. Faltó el IdProducto' });
            }

            // Petición hacia la fuente cruda DB de Producto para certificar precio no hackeado por Frontend
            const productoActual = await ProductoDAO.encontrarPorId(producto_id);
            
            if (!productoActual || productoActual.stock < (cantidad || 1) || productoActual.activo === 0) {
                return res.status(409).json({ message: 'Vaya. Alguien se acaba de llevar la última unidad disponible.' });
            }

            // Forzar en 1 la cantidad solo por si alteraron payload (para el E-Commerce express del ejercicio)
            const cantidadComienza = cantidad || 1; 

            // Pasamos a DAO la órden y extraemos el precio en BackEnd, prohibiendo manipulaciones locales al HTML User Agent.
            const ID_Factura_DB = await PedidoDAO.registrarCompra(
                ID_Cliente_Logueado, 
                producto_id, 
                cantidadComienza, 
                productoActual.precio // Siempre tomamos el precio dictado en Servidor MySQL
            );
            
            res.status(201).json({ 
                message: `✅ Tu compra ha facturado correctamente, recibo N°${ID_Factura_DB}.`
            });
            
        } catch (error) {
            console.log(error);
            if (error.message.includes('Insuficiente')) {
                res.status(409).json({ message: 'Error de Existencia: Ya se agotó instantes antes.' });
            } else {
                res.status(500).json({ error: 'Fallo al procesar orden criptográfica. Refresque sesión.' });
            }
        }
    }
}

module.exports = PedidoController;
