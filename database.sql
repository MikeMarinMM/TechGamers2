-- =======================================================
-- SCRIPT DE CREACIÓN DE BASE DE DATOS: TECHGAMERS_DB
-- =======================================================

-- Crear la Base de Datos si no existe, configurada con UTF-8 para pleno soporte de caracteres latinos
CREATE DATABASE IF NOT EXISTS techgamers_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE techgamers_db;

-- ==========================================
-- 1. TABLA: CATEGORIAS (Esquema Normalizado)
-- ==========================================
-- Buenas prácticas: separar las categorías reduce redundancia y mejora el mantenimiento a largo plazo.
CREATE TABLE categorias (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion TEXT,
    creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- ==========================================
-- 2. TABLA: PRODUCTOS (Inventario Centralizado)
-- ==========================================
-- Almacena todo: Componentes (PCs), Consolas, Accesorios y también los Servicios de Reparación.
CREATE TABLE productos (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    categoria_id INT UNSIGNED NOT NULL,
    nombre VARCHAR(150) NOT NULL,
    descripcion TEXT,
    
    -- DECIMAL(12, 2): Óptimo para moneda como el COP (Pesos Colombianos) ya que maneja cifras altas sin perder precisión (ej. 1,650,000.00)
    precio DECIMAL(12, 2) NOT NULL,
    
    -- Manejo del tipo de ofrecimiento. Útil para que un "Servicio" evite control estricto de unidades (stock = 999 lógico o ilimitado).
    tipo_articulo ENUM('PRODUCTO_FISICO', 'SERVICIO_REPARACION') DEFAULT 'PRODUCTO_FISICO',
    
    -- INT para el inventario, sin permitir valores negativos.
    stock INT UNSIGNED NOT NULL DEFAULT 0,
    
    -- Estado del producto para identificar si es de vitrina, segunda o un repuesto nuevo
    estado_articulo ENUM('NUEVO', 'SEGUNDA_MANO', 'PARA_REPARAR', 'SERVICIO') DEFAULT 'NUEVO',
    
    url_imagen VARCHAR(255) DEFAULT NULL,
    
    -- Control activo/inactivo (Soft delete, buena práctica en e-commerce para no perder histórico de ventas)
    activo BOOLEAN DEFAULT TRUE,
    
    -- Auditoría temporal
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Llave Foránea hacia la tabla Categorías. Restringe el borrado de una categoría si tiene productos en ella.
    CONSTRAINT fk_productos_categorias 
        FOREIGN KEY (categoria_id) 
        REFERENCES categorias(id) 
        ON DELETE RESTRICT 
        ON UPDATE CASCADE
) ENGINE=InnoDB;

-- Índices adicionales para mejorar la velocidad en búsquedas en el E-Commerce
CREATE INDEX idx_productos_nombre ON productos(nombre);
CREATE INDEX idx_productos_precio ON productos(precio);
CREATE INDEX idx_productos_activo ON productos(activo);

-- ==========================================
-- 3. INSERCIÓN DE DATOS DE PRUEBA (SEEDERS)
-- ==========================================

-- Insertar Categorías
INSERT INTO categorias (nombre, descripcion) VALUES 
('Consolas', 'Equipos de videojuegos portátiles y de sobremesa'),
('Componentes de PC', 'Tarjetas gráficas, procesadores, ram, motherboards'),
('Accesorios', 'Periféricos como controles de juego, headsets, teclados, mouse'),
('Servicios Clínicos', 'Reparación y mantenimiento en hardware y limpieza profunda');

-- Insertar Productos del E-commerce (Consolas, Componentes PC, y Reparaciones)
INSERT INTO productos (
    categoria_id, nombre, descripcion, precio, tipo_articulo, stock, estado_articulo, url_imagen
) VALUES 
-- Producto 1: Consola
(1, 'Consola Microsoft Xbox Series X 1TB', 'La consola más rápida y potente. Resolución nativa 4K a 120 FPS.', 2350000.00, 'PRODUCTO_FISICO', 12, 'NUEVO', 'images/xbox_series_x.jpg'),

-- Producto 2: Componente para PC
(2, 'Tarjeta Gráfica ASUS Dual RTX 4060 Ti 8GB', 'Arquitectura Ada Lovelace con DLSS 3.0. Ideal para diseño y gaming competente a 1440p.', 1850000.00, 'PRODUCTO_FISICO', 5, 'NUEVO', 'images/rtx4060ti.jpg'),

-- Producto 3: Componente para PC
(2, 'Procesador AMD Ryzen 7 7800X3D', 'El procesador definitivo para gaming con tecnoogía 3D V-Cache.', 1750000.00, 'PRODUCTO_FISICO', 8, 'NUEVO', 'images/ryzen7800x3d.jpg'),

-- Producto 4: Servicio de Reparación (Consolas)
(4, 'Mantenimiento Preventivo Consolas (PS5 / Xbox Series)', 'Limpieza profunda de placa y disipadores con cambio de metal líquido o sellador térmico.', 120000.00, 'SERVICIO_REPARACION', 999, 'SERVICIO', 'images/mantenimiento_preventivo.jpg'),

-- Producto 5: Servicio de Reparación (Controles / Accesorios)
(4, 'Reparación de Drift - Mando DualSense', 'Reemplazo del módulo del potenciómetro por repuesto original ALPS. Garantizado sin desviación.', 65000.00, 'SERVICIO_REPARACION', 999, 'SERVICIO', 'images/reparacion_drift.jpg');
