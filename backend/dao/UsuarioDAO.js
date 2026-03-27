const pool = require('../config/db');

class UsuarioDAO {
    // READ: Mapeo por correo usado vitalmente en el Login y Registro
    static async encontrarPorCorreo(correo) {
        try {
            const [rows] = await pool.query('SELECT * FROM usuarios WHERE correo = ? LIMIT 1', [correo]);
            return rows.length > 0 ? rows[0] : null; 
        } catch (error) { 
            throw error; 
        }
    }

    // CREATE: Guardado Hash
    static async crear(usuarioData) {
        try {
            // rol_id = 2 es el Cliente estándar en nuestra base de datos que configuramos antes
            const query = `INSERT INTO usuarios (rol_id, nombre, correo, password_hash) VALUES (?, ?, ?, ?)`;
            const params = [
                usuarioData.rol_id || 2, 
                usuarioData.nombre, 
                usuarioData.correo, 
                usuarioData.password_hash // Este Hash vino de Bcrypt en el controlador
            ];
            const [result] = await pool.query(query, params);
            return result.insertId;
        } catch (error) { 
            throw error; 
        }
    }
}
module.exports = UsuarioDAO;
