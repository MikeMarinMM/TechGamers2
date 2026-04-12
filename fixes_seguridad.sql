-- Sincronización Estratégica de Roles
UPDATE roles SET nombre_rol = 'ROLE_ADMIN' WHERE id = 1;
UPDATE roles SET nombre_rol = 'ROLE_USER' WHERE id = 2;

-- Inversión Rectificativa de Credenciales
UPDATE usuarios SET rol_id = 1 WHERE correo = 'admin@techgamers.com';
UPDATE usuarios SET rol_id = 2 WHERE correo = 'juanperez@techgamers.com';

-- Purga de Vulnerabilidad Plain-Text
ALTER TABLE usuarios DROP COLUMN contrasena;
