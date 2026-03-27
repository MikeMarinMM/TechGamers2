/**
 * ARCHIVO DE CONFIGURACIÓN DE BASE DE DATOS
 * Este archivo se encarga de establecer la conexión con MySQL (techgamers_db).
 * Utilizamos un "Pool" de conexiones para mejorar el rendimiento, permitiendo 
 * múltiples consultas simultáneas de forma asíncrona.
 */
const mysql = require('mysql2/promise');

// Configuración basada en tu panel de MySQL Workbench (localhost, puerto 3306, root)
const dbConfig = {
    host: 'localhost',      // Hostname indicado en tu imagen de Workbench
    user: 'root',           // Username indicado 
    password: 'usuario1',           // Queda vacío (por defecto en XAMPP o entornos locales sin contraseña). Ajústalo si le pusiste clave secreta al vault.
    database: 'techgamers_db', // Nuestra BD 
    port: 3306,             // Puerto por defecto de MySQL
    waitForConnections: true,
    connectionLimit: 10,    // Límite concurrente de consultas simultáneas
    queueLimit: 0
};

// Crear el Pool de conexiones
const pool = mysql.createPool(dbConfig);

// Validamos la conexión inicial
pool.getConnection()
    .then(connection => {
        console.log('✅ Conexión exitosa a la base de datos: techgamers_db');
        connection.release();
    })
    .catch(error => {
        console.error('❌ Error fatal al conectar con MySQL:', error.message);
    });

module.exports = pool;
