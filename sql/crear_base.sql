-- Ejecutar dentro de: sudo mysql
-- CAMBIA la contrasena de ejemplo ANTES de ejecutar.
CREATE DATABASE IF NOT EXISTS srmact3_db
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE USER IF NOT EXISTS 'srmact3'@'127.0.0.1'
  IDENTIFIED BY 'CAMBIA_AQUI_POR_UNA_CLAVE_SEGURA';

GRANT ALL PRIVILEGES ON srmact3_db.* TO 'srmact3'@'127.0.0.1';

-- IMPORTANTE: las tablas escuela y alumno las crea JPA al iniciar Spring Boot.
