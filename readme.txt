=========================================================
      TECHGAMERS - SISTEMA E-COMMERCE Y GESTIÓN
=========================================================

TechGamers es una aplicación web full-stack, diseñada bajo arquitectura de microservicios con un enfoque fuerte en ciberseguridad (RBAC, JWT) y desarrollo ágil. 

1. PILA TECNOLÓGICA (TECH STACK)
---------------------------------------------------------
- Frontend: HTML5, CSS3 Nativo, Vanilla JavaScript (DOM Dinámico).
- Backend: Java Spring Boot 3, Spring Security, JWT (JSON Web Tokens).
- Interacciones: Fetch API.
- Base de Datos: MySQL Relacional.


2. CONFIGURACIÓN Y EJECUCIÓN (PASO A PASO)
---------------------------------------------------------
Para desplegar el proyecto localmente, asegúrate de seguir este estricto orden:

Paso 1: Preparación de la Base de Datos (MySQL)
  - Inicia tu motor MySQL (ej. a través de XAMPP, WAMP o Docker).
  - Abre phpMyAdmin o tu cliente SQL preferido.
  - Crea una base de datos nueva llamada: techgamers_db
  - Importa en ella el archivo `techgamers_db.sql` provisto en el proyecto base.
  - IMPORTANTE DE SEGURIDAD: Tras importar, debes ejecutar obligatoriamente 
    el archivo script llamado `fixes_seguridad.sql` existente en la carpeta. 
    (Esto migrará al sistema estricto de roles de ciberseguridad).

Paso 2: Compilación de la API (Backend Java)
  - Abre la carpeta `backend-java` en tu IDE preferido (VS Code, IntelliJ, Eclipse).
  - Asegúrate de tener instalado Java Development Kit (JDK 21) y Maven.
  - Arranca la aplicación (ej. ejecutando el `start_app.bat` o corriendo la 
    clase principal). El backend desplegará el servidor en el puerto :9151.

Paso 3: Arranque de Vistas (Frontend)
  - Abre la carpeta de vistas y scripts principales (`index.html`, etc.) en tu IDE.
  - Arranca el sitio con la extensión "Live Server" de VS Code. 
  - (Suele desplegar por defecto en http://127.0.0.1:5501).


3. CREDENCIALES POR DEFECTO (PRUEBAS DEL SISTEMA)
---------------------------------------------------------
[!] ATENCION DE CIBERSEGURIDAD:
Las siguientes credenciales son puramente para fines de evaluacion 
y demostracion en entornos locales (Dummy Credentials). Nunca subas 
contraseñas reales a repositorios publicos de GitHub.

- Jefe Administrativo / Dueño del Panel
  Usuario: admin@techgamers.com
  Contraseña: admin123
  (Permisos Totales: Gestión CRUD, Usuarios, Configuración)

- Cliente Estándar
  Usuario: juanperez@techgamers.com 
  Contraseña: juanperez123
  (Permisos Restringidos: Vitrina pública y Carrito. Cero acceso administrativo)

- En MySql localhost:
  Username: root
  Contraseña: usuario1

=========================================================
Nota: En caso de cambios drásticos al código del Frontend, se recomienda "Limpiar Caché" del navegador o desloguearse (Cerrar Sesión) para limpiar el JSON Web Token de la memoria del explorador.
