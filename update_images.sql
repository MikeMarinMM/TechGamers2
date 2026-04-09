UPDATE productos 
SET url_imagen = REPLACE(url_imagen, 'http://localhost:8080', '');

-- Verifica los cambios ejecutando:
-- SELECT id, nombre, url_imagen FROM productos LIMIT 5;
