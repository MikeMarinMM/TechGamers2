-- Script de configuración TechGamers DB
CREATE DATABASE IF NOT EXISTS techgamers_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'techgamers_user'@'localhost' IDENTIFIED BY 'TechGamers2026!';
GRANT ALL PRIVILEGES ON techgamers_db.* TO 'techgamers_user'@'localhost';
FLUSH PRIVILEGES;
SELECT 'Usuario creado OK' AS resultado;
