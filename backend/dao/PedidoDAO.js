const pool = require('../config/db');

class PedidoDAO {
    /**
     * EFECTÚA UN COMPROMISO TRANSACCIONAL (ACID)
     * Nunca se debe vender si se agotó. Aquí aplicaremos una Transacción estricta en MySQL.
     */
    static async registrarCompra(usuario_id, producto_id, cantidad, precio_unitario) {
        // Pedimos túnel particular al pool
        const connection = await pool.getConnection(); 
        try {
            // Empezamos transacción. Si hay un error, se anulará retrocediendo TODO
            await connection.beginTransaction();

            // 1. VERIFICAMOS STOCK ACTUAL (Y bloqueamos edición ajena de esta misma fila hasta terminar)
            // Esto evita el infame problema de concurrencia donde 2 clientes compran justo la última unidad en la misma décima de segundo.
            const [revision] = await connection.query('SELECT stock FROM productos WHERE id = ? FOR UPDATE', [producto_id]);
            
            if (revision.length === 0) throw new Error('Fantasma. El Registro DB original desapareció.');
            if (revision[0].stock < cantidad) throw new Error('Insuficiente. Nuestro inventario se quedó vacío este milisegundo.');

            // 2. REDUCIMOS AL INVENTARIO
            await connection.query('UPDATE productos SET stock = stock - ? WHERE id = ?', [cantidad, producto_id]);

            // 3. GENERAMOS ORDEN FINAL INMUTABLE (RECIBO)
            const queryFactura = `INSERT INTO pedidos (usuario_id, producto_id, cantidad, precio_unitario) VALUES (?, ?, ?, ?)`;
            const [resultadoFinal] = await connection.query(queryFactura, [usuario_id, producto_id, cantidad, precio_unitario]);

            // Se ejecutan físicamente ambos pasos cruzados permanentemente a disco:
            await connection.commit(); 
            return resultadoFinal.insertId;

        } catch (error) {
            // Si algo explotó (ej. stock negativo), retrocedemos mágicamente todo a su origen sin ensuciar la base de datos
            await connection.rollback();
            console.error('Aborto Transaccional por DAO Pedidos:', error.message);
            throw error;
            
        } finally {
            // Regresamos el túnel del Pool
            connection.release();
        }
    }
}

module.exports = PedidoDAO;
