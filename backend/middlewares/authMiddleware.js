const jwt = require('jsonwebtoken');

// Clave Secreta estática para entorno de enseñanza (Debe pasarse a un archivo .env en Prod)
const SECRET_KEY = 'TechGamers_Secret_Key_2026';

/**
 * 1. Middleware Base (Validación de Sesión):
 * Extrae el token JWT del frontend y descifra su contenido (payload).
 */
const verificarToken = (req, res, next) => {
    // El frontend nos debe enviar la cabecera: Authorization: Bearer <TOKEN>
    const authHeader = req.headers['authorization'];
    if (!authHeader) return res.status(403).json({ message: 'Prohibido: Se requiere un token de seguridad JWT.' });

    const token = authHeader.split(' ')[1]; // Rompe la cadena para remover el 'Bearer '
    if (!token) return res.status(403).json({ message: 'Formato de token mal formado.' });

    try {
        // Al verificar, se desencripta y obtenemos el objeto user (id, rol, etc)
        const jwtPayload = jwt.verify(token, SECRET_KEY);
        req.usuario = jwtPayload; // Lo adhieren al Request para que los próximos filtros lo lean
        
        next(); // Autorizado: da paso a la siguiente línea en la cadena de red
    } catch (error) {
        return res.status(401).json({ message: 'Tu sesión ha expirado o el token es inválido.' });
    }
};

/**
 * 2. Middleware Filtro Vertical (Verificación de Rol Administrador):
 * Solo deja pasar las rutas C, U, D del CRUD donde se requiere acceso total.
 */
const esAdministrador = (req, res, next) => {
    // req.usuario fue inyectado instantes antes en el servidor por 'verificarToken'
    if (!req.usuario) return res.status(403).json({ message: 'No te has autenticado.' });
    
    // Rol ID 1 = Administrador, Rol ID 2 = Cliente (como dictamos en el SQL)
    if (req.usuario.rol !== 1) {
        return res.status(403).json({ 
            message: 'Acceso Denegado: Esta área (Administración de Inventario) está restringida.' 
        });
    }
    
    next(); // Cumplió con todo: Pasa tu petición directamente al Controlador
};

module.exports = {
    verificarToken,
    esAdministrador,
    SECRET_KEY // lo exportamos para reutilizarlo en el AuthController
};
