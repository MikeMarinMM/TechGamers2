const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Asegurar que el directorio de subidas exista dinámicamente desde el primer día
const uploadDir = path.join(__dirname, '../uploads/productos');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configuración de Motor de Almacenamiento Local (Disk Storage)
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir); // Ruta relativa al server interno (en node_modules)
    },
    filename: function (req, file, cb) {
        // Algoritmo de Renombrado Seguro: Previene choques de nombres idénticos usando el reloj unix y randoms enteros.
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const extension = path.extname(file.originalname);
        cb(null, 'producto-' + uniqueSuffix + extension); // ej: producto-1658428123000-123456.jpg
    }
});

// Filtro estricto de seguridad para Tipos de Archivo (Evitar recibir malwares como .exe, .sh, .php disfrazados)
const fileFilter = (req, file, cb) => {
    // Aceptamos tres formatos principales de web performance:
    const allowedTypes = /jpeg|jpg|png|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
        return cb(null, true); 
    } else {
        cb(new Error('Violación del Filtro MIME: Solo el Administrador puede inyectar multimedia (JPEG, PNG, WEBP).'));
    }
};

// Objeto Middleware exportable configurando todos los escudos y límites de subida
const upload = multer({ 
    storage: storage,
    limits: { fileSize: 5 * 1024 * 1024 }, // LÍMITE INFLEXIBLE: 5 Megabytes por imagen como máximo
    fileFilter: fileFilter
});

module.exports = upload;
