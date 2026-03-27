const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const UsuarioDAO = require('../dao/UsuarioDAO');
// Importamos la clave simétrica que definimos en el Middleware
const { SECRET_KEY } = require('../middlewares/authMiddleware');

class AuthController {
    
    // REGISTRO (Sign-Up / Register)
    static async register(req, res) {
        try {
            // Se inyecta rol_id para aceptar selección manual desde el Formulario Front-End
            const { nombre, correo, password, rol_id } = req.body;
            
            // 1. Validar que no exista para evitar duplicados SQL en columna UNIQUE
            const cuentaExiste = await UsuarioDAO.encontrarPorCorreo(correo);
            if (cuentaExiste) {
                return res.status(409).json({ message: 'Uy, este correo ya está registrado en la base de datos.' });
            }

            // 2. HASHEAR: Cifrado con "Salting" a 10 rondas de ciclo
            const password_hash = await bcrypt.hash(password, 10);

            // 3. Crear cuenta pasando explícitamente el rol seleccionado desde el Front
            const nuevoId = await UsuarioDAO.crear({ nombre, correo, password_hash, rol_id: rol_id || 2 });
            res.status(201).json({ message: 'Cuenta creada con éxito. Ya puedes iniciar sesión en TechGamers.', id: nuevoId });
            
        } catch (error) {
            console.error('Registration Error:', error);
            res.status(500).json({ error: 'Fallo interno registrando en MYSQL' });
        }
    }

    // INICIO DE SESIÓN (Login)
    static async login(req, res) {
        try {
            const { correo, password } = req.body;

            // 1. Comprobar que esa cuenta si quiera exista
            const usuario = await UsuarioDAO.encontrarPorCorreo(correo);
            if (!usuario || !usuario.activo) {
                return res.status(401).json({ message: 'No hemos encontrado este correo o tu cuenta está suspendida.' });
            }

            // 2. Comprobar integridad criptográfica del password introducido vs Hash SQL
            const passwordCorrecto = await bcrypt.compare(password, usuario.password_hash);
            if (!passwordCorrecto) {
                return res.status(401).json({ message: 'Contraseña incorrecta.' });
            }

            // 3. JWT Payloader (El cuerpo de la firma). Ocultamos contraseñas aquí.
            const firma = {
                id: usuario.id,
                rol: usuario.rol_id, // Vital que esto viaje blindado para que el Middleware sepa si pasarlo de nivel
                nombre: usuario.nombre
            };

            // 4. Firmar Token (Asignamos 12 hrs de vida a la sesión del ecommerce)
            const tokenGenerado = jwt.sign(firma, SECRET_KEY, { expiresIn: '12h' });

            // Responder con la llave mágica de sesión para Guardar en el LocalStorage
            res.status(200).json({
                message: 'Sesión Validada',
                token: tokenGenerado,
                user: firma
            });

        } catch (error) {
            console.error('Login Error:', error);
            res.status(500).json({ error: 'Fallo procesando los algoritmos de verificación de firma' });
        }
    }
}

module.exports = AuthController;
