-- =======================================================
-- SCRIPT DE EXPANSIÓN: USUARIOS, ROLES Y COMPRAS
-- Base de Datos: techgamers_db
-- =======================================================
USE techgamers_db;

-- -------------------------------------------------------
-- 1. TABLA ROLES
-- -------------------------------------------------------
-- Almacena los tipos de privilegios del sistema
CREATE TABLE IF NOT EXISTS roles (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nombre_rol VARCHAR(50) NOT NULL UNIQUE
) ENGINE=InnoDB;

-- Insertar roles por defecto (Usamos IGNORE por si se ejecuta varias veces)
INSERT IGNORE INTO roles (id, nombre_rol) VALUES 
(1, 'Administrador'),
(2, 'Cliente');

-- -------------------------------------------------------
-- 2. TABLA USUARIOS
-- -------------------------------------------------------
-- Guarda la información de acceso de clientes y administradores.
CREATE TABLE IF NOT EXISTS usuarios (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    rol_id INT UNSIGNED NOT NULL DEFAULT 2, -- Por defecto todo nuevo registro asume que es 'Cliente' (id=2)
    nombre VARCHAR(150) NOT NULL,
    correo VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL, -- Campo de longitud alta, preparado para hashes largos como Bcrypt o Argon2
    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    activo BOOLEAN DEFAULT TRUE,
    
    -- Restricción (FK): Un usuario obligatoriamente necesita un rol.
    -- RESTRICT previene que un administrador borre el rol 'Cliente' si existen usuarios asi.
    CONSTRAINT fk_usuarios_roles 
        FOREIGN KEY (rol_id) 
        REFERENCES roles(id) 
        ON DELETE RESTRICT 
        ON UPDATE CASCADE
) ENGINE=InnoDB;

-- -------------------------------------------------------
-- 3. TABLA PEDIDOS (COMPRAS)
-- -------------------------------------------------------
-- Historial transaccional de adquisiciones hechas por los Usuarios.
CREATE TABLE IF NOT EXISTS pedidos (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT UNSIGNED NOT NULL,
    producto_id INT UNSIGNED NOT NULL,
    
    cantidad INT UNSIGNED NOT NULL DEFAULT 1,
    
    -- Guardar el precio en el momento exacto de la compra. Si el producto sube de precio mañana, el recibo original no debe alterarse.
    precio_unitario DECIMAL(12, 2) NOT NULL, 
    
    -- Campo calculado automáticamente (MySQL 5.7+) basado en cantidad y precio.
    total DECIMAL(12, 2) GENERATED ALWAYS AS (cantidad * precio_unitario) STORED,
    
    fecha_compra TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Restricción (FK) Usuarios: Si el usuario borra su cuenta, sus recibos se borran (CASCADE). Común en leyes de protección de datos.
    CONSTRAINT fk_pedidos_usuarios 
        FOREIGN KEY (usuario_id) 
        REFERENCES usuarios(id) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE,
        
    -- Restricción (FK) Productos: Si el administrador intenta borrar un Producto de MySQL, 
    -- RESTRICT abortará la acción si dicho producto ya fue vendido alguna vez (para evitar recibos huérfanos). 
    -- (La buena práctica E-commerce es usar Soft Delete / 'Activo = 0' en el producto viejo).
    CONSTRAINT fk_pedidos_productos
        FOREIGN KEY (producto_id) 
        REFERENCES productos(id) 
        ON DELETE RESTRICT 
        ON UPDATE CASCADE
) ENGINE=InnoDB;

-- Optimización de búsquedas para el backend (inicios de sesión y reportes de compra)
CREATE INDEX idx_usuarios_correo ON usuarios(correo);
CREATE INDEX idx_pedidos_usuario ON pedidos(usuario_id);
