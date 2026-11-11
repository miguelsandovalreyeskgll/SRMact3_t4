# SRMact3_t4 — Actividad 3: CRUD con Spring Boot, JPA y MySQL

**Estudiante:** Sandoval Reyes Miguel  
**Materia:** Programación Web  
**Java:** 17 · **Spring Boot:** 4.1.0 · **Gradle:** wrapper incluido  
**Puerto de esta actividad:** 8083 (verificar que esté libre)  
**Importante:** Es una API REST probada con Bruno, sin frontend separado. La consigna permite hacerlo solo con REST.

## 1. ¿Qué hace?

Permite **crear, consultar, actualizar y eliminar alumnos de MySQL**, relacionados con una escuela.

- Una `Escuela` puede tener **muchos** `Alumno`: `@OneToMany`.
- Cada `Alumno` pertenece a **una** `Escuela`: `@ManyToOne`.
- Llave foránea: `alumno.escuela_id → escuela.id`.
- El JSON devuelve `escuelaNombre`, no solamente el identificador.
- No utiliza una lista temporal: se guarda en MySQL mediante `JpaRepository.save()`.

```text
ESCUELA                            ALUMNO
+--------------------------+       +-----------------------+
| id (PK)                  | 1 --N | id (PK)               |
| nombre                   |       | nombre                |
+--------------------------+       | escuela_id (FK)       |
                                   +-----------------------+
```

## 2. Archivos más importantes y para qué sirven

```text
src/main/java/com/srm/actividad3/
  Actividad3Application.java       → Inicia Spring Boot
  modelo/Escuela.java              → Entidad @Entity / @OneToMany
  modelo/Alumno.java               → Entidad @Entity / @ManyToOne
  dto/AlumnoDTO.java               → Datos que entran/salen en JSON
  repositorio/EscuelaRepository.java → Acceso a tabla escuela
  repositorio/AlumnoRepository.java  → Acceso a tabla alumno
  servicio/EscuelaService.java     → Validar y guardar escuelas
  servicio/AlumnoService.java      → Lógica del CRUD y relación
  controlador/EscuelaController.java → Endpoints de escuela
  controlador/AlumnoController.java  → CRUD REST de alumno
src/main/resources/application.properties → Puerto y MySQL (sin contraseñas)
sql/crear_base.sql                 → Crear la base y el usuario
sql/comprobar_relacion.sql         → Consultar la llave foránea JOIN
bruno/                             → Colección importable en Bruno
PRUEBAS_BRUNO.txt                  → Ejemplos de cada petición
```

**Flujo a explicar a la profesora:** Bruno → Controller → Service → Repository → MySQL. El DTO transporta los datos; la entidad representa la tabla de la base de datos.

## 3. Preparar MySQL en el VPS (ya lo tienes instalado)

Conéctate por SSH:

```bash
ssh root@167.99.15.140
sudo mysql
```

Dentro de MySQL, **sustituye la clave de ejemplo por una nueva contraseña segura**:

```sql
CREATE DATABASE IF NOT EXISTS srmact3_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'srmact3'@'127.0.0.1' IDENTIFIED BY 'CAMBIA_AQUI_POR_UNA_CLAVE_SEGURA';
GRANT ALL PRIVILEGES ON srmact3_db.* TO 'srmact3'@'127.0.0.1';
EXIT;
```

Comprobar acceso con el usuario de la actividad, sin usar root para la aplicación:

```bash
mysql -h 127.0.0.1 -u srmact3 -p srmact3_db
```

Escribe la contraseña y luego `EXIT;`. **Solo creas la base y el usuario manualmente**; `spring.jpa.hibernate.ddl-auto=update` crea las tablas `escuela` y `alumno` cuando arranques el proyecto.

No pongas la contraseña real en `application.properties`, archivos de GitHub ni capturas.

## 4. Ejecutar en localhost desde VS Code (CMD)

Opción A: instalar MySQL también en tu PC, crear `srmact3_db` y el usuario con el mismo SQL de arriba, y ejecutar:

```cmd
set "DB_USER=srmact3"
set "DB_PASSWORD=TU_CONTRASENA_MYSQL_LOCAL"
gradlew.bat bootRun
```

Opción B: **si SOLO tienes MySQL en el VPS, no necesitas instalarlo en Windows**. Abre **dos terminales CMD**:

**Terminal 1** (túnel SSH seguro a la base del VPS; déjala abierta):

```cmd
ssh -L 3307:127.0.0.1:3306 root@167.99.15.140
```

**Terminal 2**, dentro de `SRMact3_t4`, en CMD:

```cmd
set "DB_URL=jdbc:mysql://127.0.0.1:3307/srmact3_db"
set "DB_USER=srmact3"
set "DB_PASSWORD=TU_CONTRASENA_MYSQL_DEL_VPS"
gradlew.bat bootRun
```

En la opción B, **el código corre en tu PC pero los datos van a MySQL del VPS por SSH**. Es útil para practicar sin abrir el puerto MySQL a internet. Esto modifica datos de la base del VPS, así que utiliza registros de prueba.

**La primera vez Gradle debe descargar dependencias por internet.** Abre http://localhost:8083/api/escuelas cuando diga que Tomcat inició. Ctrl+C detiene Spring Boot.

## 5. Probar con Bruno (en local o VPS)

Abre la carpeta `bruno/` como colección en Bruno y selecciona el ambiente `LOCAL` o `VPS`. También puedes crear solicitudes manualmente.

| Paso | Método | Ruta | Body |
|---|---|---|---|
| 1 | POST | `/api/escuelas` | `{"nombre":"Instituto Tecnologico de Oaxaca"}` |
| 2 | GET | `/api/escuelas` | — |
| 3 | POST | `/api/alumnos` | `{"nombre":"Ana Lopez","escuelaId":1}` |
| 4 | GET | `/api/alumnos` | — |
| 5 | GET | `/api/alumnos/1` | — |
| 6 | PUT | `/api/alumnos/1` | `{"nombre":"Ana Lopez Actualizada","escuelaId":1}` |
| 7 | DELETE | `/api/alumnos/1` | — |

**Importante:** los IDs `1` son ejemplos. Usa los IDs reales que devuelvan los POST. En POST/PUT selecciona **Body → JSON** (`Content-Type: application/json`).

Dirección local: `http://localhost:8083`  
Dirección VPS (solo tras desplegar y abrir el puerto): `http://167.99.15.140:8083`

Después del POST, por ejemplo, la API devuelve algo parecido a:

```json
{"id":1,"nombre":"Ana Lopez","escuelaId":1,"escuelaNombre":"Instituto Tecnologico de Oaxaca"}
```

Esto **demuestra la relación**: devuelve el nombre de la escuela, no solo el ID.

Respuestas: POST `201 Created`; GET/PUT `200 OK`; DELETE `204 No Content`; ID inexistente `404`; datos inválidos `400`.

## 6. Comprobar MySQL y la persistencia

En el VPS:

```bash
sudo mysql
```

```sql
USE srmact3_db;
SELECT a.id, a.nombre AS alumno, e.nombre AS escuela
FROM alumno a INNER JOIN escuela e ON a.escuela_id = e.id;
SHOW CREATE TABLE alumno;
```

La primera consulta prueba la relación. La segunda muestra la llave foránea. Reinicia Spring Boot y repite `GET /api/alumnos`: los registros todavía deben estar allí (si no los eliminaste).

## 7. Compilar el JAR desde CMD en Windows

```cmd
gradlew.bat bootJar
```

Archivo generado: `build/libs/SRMact3_t4-0.0.1-SNAPSHOT.jar`.

## 8. Subir al VPS SIN detener las Actividades 1 y 2

Antes de elegir el puerto:

```bash
sudo ss -ltnp | grep -E ':8082|:9082|:8083'
```

**8083 tiene que estar disponible;** si está ocupado, cambia `PORT` al iniciar y usa ese nuevo puerto en los enlaces.

**En CMD de Windows, desde la carpeta del proyecto y después de compilar**:

```cmd
ssh root@167.99.15.140 "mkdir -p /var/www/SRMact3_t4"
scp build/libs/SRMact3_t4-0.0.1-SNAPSHOT.jar root@167.99.15.140:/var/www/SRMact3_t4/
```

**En el VPS**:

```bash
ssh root@167.99.15.140
sudo nano /etc/srmact3.env
```

Escribe estas dos líneas en ese archivo (con tu clave real, sin comillas si no contiene caracteres especiales):

```text
DB_USER=srmact3
DB_PASSWORD=TU_CONTRASENA_MYSQL
```

Guarda (`Ctrl+O`, Enter, `Ctrl+X`) y protege el archivo:

```bash
sudo chmod 600 /etc/srmact3.env
```

Para que el proyecto se reinicie automáticamente si cae o reinicia el VPS, crea este servicio:

```bash
sudo nano /etc/systemd/system/srmact3.service
```

Contenido:

```ini
[Unit]
Description=SRM Actividad 3 - Spring Boot
After=network.target mysql.service

[Service]
User=www-data
WorkingDirectory=/var/www/SRMact3_t4
EnvironmentFile=/etc/srmact3.env
ExecStart=/usr/bin/java -Xmx256m -jar /var/www/SRMact3_t4/SRMact3_t4-0.0.1-SNAPSHOT.jar
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

Activar y verificar:

```bash
sudo systemctl daemon-reload
sudo systemctl enable --now srmact3
sudo systemctl status srmact3
curl http://localhost:8083/api/escuelas
```

Para ver errores: `sudo journalctl -u srmact3 -n 60 --no-pager`.

Abrir el puerto **solo si está autorizado y utilizas UFW**:

```bash
sudo ufw allow 8083/tcp
```

También comprueba el firewall del proveedor del VPS. Si la API responde localmente pero no desde fuera, revisa esos dos controles.

**No toques los procesos ni carpetas de las actividades anteriores.**

## 9. Publicar en GitHub

Crea un repositorio **vacío** llamado `SRMact3_t4`, sin README remoto inicial para evitar historiales independientes. El proyecto ya trae README y `.gitignore`.

```cmd
git init
git add .
git commit -m "Actividad 3 CRUD Spring Boot MySQL"
git branch -M main
git remote add origin URL_HTTPS_DE_TU_REPOSITORIO
git push -u origin main
```

Sustituye `URL_HTTPS_DE_TU_REPOSITORIO` por el enlace que GitHub muestre en **Code → HTTPS**. No se incluye contraseña de MySQL en este repositorio.

## 10. Capturas REALES para el README antes de entregar

Debes obtenerlas de **tu aplicación corriendo**. No vienen inventadas en este ZIP:

1. Bruno POST `/api/escuelas`.
2. Bruno POST `/api/alumnos` con `escuelaNombre`.
3. Bruno GET `/api/alumnos`.
4. Bruno PUT `/api/alumnos/{id}`.
5. Bruno DELETE `/api/alumnos/{id}` con `204`.
6. SQL JOIN que muestre `alumno` y `escuela`.
7. Respuesta desde el VPS `http://167.99.15.140:8083/api/alumnos`.
8. `systemctl status srmact3` y los puertos de Act1/Act2 sin interferencia.

Guarda las imágenes en `docs/capturas/`, luego insértalas en este README con Markdown, por ejemplo:

```markdown
![GET alumnos](docs/capturas/get-alumnos.png)
```

## 11. Respuestas para las preguntas de Classroom

**a) ¿Qué entidades y qué relación?** Elegí `Escuela` y `Alumno`. Una escuela tiene muchos alumnos (`@OneToMany`) y cada alumno pertenece a una escuela (`@ManyToOne`). La llave foránea `escuela_id` está en `alumno`.

**b) ¿Qué es un Repository y su ventaja?** Es una interfaz que extiende `JpaRepository` y permite consultar, guardar, actualizar y eliminar registros con métodos como `findAll()`, `findById()`, `save()` y `delete()`, sin escribir SQL para cada operación.

**c) ¿Por qué separar Service y Controller?** El Controller recibe la petición HTTP; el Service valida los datos, localiza la escuela y realiza la lógica del negocio. Así el código es más claro y fácil de mantener.

**d) Enlaces:** incluye el repositorio de GitHub **real después de publicarlo**, y el enlace del VPS **después de verificar que funcione**, por ejemplo `http://167.99.15.140:8083/api/alumnos`. Incluye la colección dentro de `bruno/`.

## Nota de seguridad

La API de práctica no incluye autenticación. No introduzcas datos personales reales. Si la dejas expuesta a internet para evaluar, cualquier visitante con acceso al puerto podría enviar POST/PUT/DELETE. Limita el acceso a la red o IP autorizadas cuando sea posible y desactívala después de la evaluación si ya no se necesita.
