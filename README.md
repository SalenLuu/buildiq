# BuildIQ

Sistema de inventario para obras de construcción.
Proyecto final de Técnicas de Programación, 2026-2.

Aplicación: https://buildiq-chi.vercel.app

## Tecnologías

- Frontend: Angular y Tailwind CSS (`buildiq-frontend/`)
- Backend: Java con Spring Boot y JPA (`buildiq-backend/`)
- Base de datos: MySQL (`inventario_obra.sql`)

## Cómo correrlo

1. Crear la base de datos con `inventario_obra.sql`.
2. Crear el archivo `backend.secrets` en la raíz:

   ```bash
   export DB_USER=tu_usuario
   export DB_PASSWORD=tu_contraseña
   export DB_NAME=salenluu_inventario_obra
   ```

3. Backend: `./run-backend.sh` (http://localhost:8080)
4. Frontend, en otra terminal: `./run-frontend.sh` (http://localhost:4200)

## Reglas principales

- No se repiten los nombres de categoría, los NIT de proveedor ni los códigos de material.
- No se pueden borrar registros que estén en uso.
- Una entrada suma al stock y una salida resta, sin superar lo disponible.

## Pendiente

- Generar los informes en PDF.
