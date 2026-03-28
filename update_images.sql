-- ==========================================================
-- SCRIPT DE ACTUALIZACIÓN MASIVA DE URLS DE IMÁGENES
-- ==========================================================
-- Objetivo: Migrar las rutas relativas locales a URLs accesibles por el frontend
-- mediante el nuevo ResourceHandler de Spring Boot.

USE techgamers_db;

-- 1. Actualización masiva: Reemplaza el prefijo 'images/' por la URL del servidor
-- Este script es idempotente si se ejecuta con cuidado.
UPDATE productos 
SET url_imagen = REPLACE(url_imagen, 'images/', 'http://localhost:8080/api/imagenes/')
WHERE url_imagen LIKE 'images/%';

-- 2. Asegurar que cualquier imagen que ya tenga el nombre de archivo solo (sin prefijo)
-- también se actualice (opcional, solo si aplica)
-- UPDATE productos 
-- SET url_imagen = CONCAT('http://localhost:8080/api/imagenes/', url_imagen)
-- WHERE url_imagen NOT LIKE 'http%' AND url_imagen IS NOT NULL;

-- 3. Verificación rápida de resultados
SELECT id, nombre, url_imagen FROM productos LIMIT 10;
