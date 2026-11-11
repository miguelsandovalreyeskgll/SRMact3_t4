USE srmact3_db;
SHOW TABLES;

-- Esta consulta debe mostrar el nombre del alumno Y el de su escuela:
SELECT a.id, a.nombre AS alumno, e.nombre AS escuela
FROM alumno a
INNER JOIN escuela e ON a.escuela_id = e.id
ORDER BY a.id;

-- Para comprobar la relacion (llave foranea):
SHOW CREATE TABLE alumno;
