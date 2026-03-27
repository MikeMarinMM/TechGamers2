const express = require('express');
const cors = require('cors');

// Controladores importados
const ProductoController = require('./controllers/ProductoController');
const AuthController = require('./controllers/AuthController');
const PedidoController = require('./controllers/PedidoController');

// Filtros JWT y Roles (Middlewares)
const { verificarToken, esAdministrador } = require('./middlewares/authMiddleware');

const app = express();

// Entornos de Cabecera (Tolerancia Cruzada localhost FRONT <-> Server)
app.use(cors()); 
app.use(express.json());

// Exponer la carpeta de imágenes estáticamente hacia la web abierta
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Middlewares Extraídos
const upload = require('./middlewares/uploadMiddleware');

// ==========================================
// RUTAS ABIERTAS (Transeúntes / Sin Cuenta)
// ==========================================
app.post('/api/auth/register', AuthController.register);
app.post('/api/auth/login', AuthController.login);

// Vitrina Digital pública para enganche natural
app.get('/api/productos', ProductoController.getProductos);
app.get('/api/productos/:id', ProductoController.getProductoById);

// ==========================================
// RUTAS DE CLIENTES REGISTRADOS (verificarToken)
// ==========================================
app.post('/api/pedidos', verificarToken, PedidoController.comprar);

// ==========================================
// RUTAS CORPORATIVAS (verificarToken + esAdministrador)
// ==========================================
// Se inyecta el "upload.single('imagen')" interceptando el FormData y decodificando la foto antes del Controlador
app.post('/api/productos', verificarToken, esAdministrador, upload.single('imagen'), ProductoController.createProducto);
app.put('/api/productos/:id', verificarToken, esAdministrador, upload.single('imagen'), ProductoController.updateProducto);
app.delete('/api/productos/:id', verificarToken, esAdministrador, ProductoController.deleteProducto);


const PORT = 3000;
app.listen(PORT, () => {
    console.log(`🌐 Servidor Express Integrado En Línea. Puerto TCP: ${PORT}`);
});
