# BuildIQ — Notas del proyecto

Sistema de inventario para obras de construcción (proyecto final, Técnicas de Programación 2026-2).

- **Frontend** (`buildiq-frontend/`): Angular 22, TypeScript y Tailwind CSS v4.
- **Backend** (`buildiq-backend/`): Java 25 + Spring Boot 4.1.2 (Maven), Spring Data JPA / Hibernate.
- **Base de datos**: MySQL 8.4, creada con `inventario_obra.sql` (6 tablas: categorias, proveedores, obras, materiales, stock_obra, movimientos).

---

## 1. Cómo correr todo

El orden importa: **MySQL → backend → frontend**. El front ya no funciona sin el back.

```bash
cd "$HOME/Documents/Técnicas de Programación/Proyecto final"

systemctl is-active mysqld     # debe decir "active"; si no: sudo systemctl start mysqld
./run-backend.sh               # http://localhost:8080 (lee backend.secrets)
./run-frontend.sh              # http://localhost:4200 (en otra terminal)
```

Otros comandos:
```bash
./run-frontend.sh build                                               # compila el front
mysql --defaults-extra-file=mysql-local.cnf salenluu_inventario_obra  # consola SQL
mysql --defaults-extra-file=mysql-local.cnf < inventario_obra.sql     # REINICIA la base a los datos originales
```

- `backend.secrets` (ignorado por git) tiene `DB_USER`, `DB_PASSWORD` y `DB_NAME`.
- Si cambias `application.properties`, detén el backend (Ctrl+C) y vuelve a arrancarlo.
- **DBeaver**: conexión MySQL a `localhost:3306`, base `salenluu_inventario_obra`. Si sale `Public Key Retrieval is not allowed`, pon `allowPublicKeyRetrieval=true` en las propiedades del driver.

---

## 2. Cómo funciona (MVC)

```
Angular (4200) --HTTP/JSON--> Controller -> Service -> Repository -> MySQL (3306)
```

| Capa | Dónde | Qué hace |
|---|---|---|
| Vista | `buildiq-frontend/` | Pantallas, formularios y tablas. Pide y muestra JSON. |
| Controller | `com.buildiq.controller` | Recibe la petición HTTP y responde JSON con el código correcto (200, 201, 204, 400, 404, 409). |
| Service | `com.buildiq.service` | Reglas de negocio (únicos, no borrar registros en uso, stock). |
| Repository | `com.buildiq.repository` | Acceso a MySQL. Spring Data genera el CRUD a partir de una interfaz. |
| Model | `com.buildiq.model` | Una clase por tabla (`@Entity`). |

En Angular: **páginas** (`pages/`) → **servicios** (`core/services/`, usan `HttpClient`) → **modelos** (`models/`).

### API

| Ruta | Métodos |
|---|---|
| `/api/categorias`, `/api/proveedores`, `/api/obras`, `/api/materiales` | `GET`, `GET /{id}`, `POST`, `PUT /{id}`, `DELETE /{id}` |
| `/api/stock` | `GET` (filtros `idObra`, `idCategoria`) |
| `/api/movimientos` | `GET` (filtros `idObra`, `idMaterial`, `tipo`, `desde`, `hasta`), `POST` |

### Reglas de negocio (backend)

- **Categorías**: nombre único. No se borra si tiene materiales.
- **Proveedores**: NIT único. No se borra si tiene movimientos.
- **Obras**: la fecha de fin no puede ser anterior a la de inicio. No se borra si tiene stock o movimientos.
- **Materiales**: código único y categoría existente. No se borra si tiene stock o movimientos.
- **Movimientos**: ENTRADA suma al stock, SALIDA resta (no puede superar el disponible), AJUSTE fija la cantidad. El movimiento y el stock se guardan en la misma transacción: si algo falla, no se guarda ninguno.

Los errores llegan al front como `{ "message": "..." }` (ver `ManejoErrores`).

---

## 3. Estado

| Parte | Estado |
|---|---|
| Base de datos | ✅ |
| Frontend: 8 pantallas, CRUD, filtros, tema | ✅ |
| Backend: CRUD completo y registro de movimientos | ✅ escrito, **sin compilar ni probar todavía** |
| Front conectado al back | ✅ escrito, **sin probar todavía** |
| Informes en PDF | ⏳ solo la pantalla de filtros, el botón está desactivado |
| Despliegue | ⏳ no empezado |

---

## 4. Decisiones

- **Nombre de la base**: el usuario `salenluu` solo puede crear bases que empiecen por `salenluu_`, por eso el script usa `salenluu_inventario_obra` (líneas 6-8). El backend lo toma de `DB_NAME`.
- **`ddl-auto=validate`** (no `update`): Hibernate solo revisa que las clases coincidan con las tablas; el esquema lo manda el script SQL.
- **JSON plano**: las entidades exponen ids y nombres (`idCategoria` + `categoriaNombre`), no objetos anidados. Se hace con `@JsonIgnore` y `@JsonProperty`. Para recibir `idCategoria` en un material hay un setter que el servicio completa con la categoría real.
- **Registrar movimiento** usa `MovimientoNuevo` (un `record`) en vez de la entidad, porque el front manda ids sueltos.
- **AJUSTE**: el script no define qué hace; aquí fija el stock al conteo físico. El formulario del front solo ofrece Entrada y Salida.
- **Alerta de stock bajo**: `cantidad < stockMinimo`. Con los datos del script hay 1 alerta (cemento en La Ceja: 40 < 50).
- **Relaciones `LAZY` + `open-in-view=false`**: las consultas traen lo necesario con `@EntityGraph`; si no, sale `LazyInitializationException`.
- **Spring Boot 4**: el mensaje de error se configura con `spring.web.error.*`, no con `server.error.*`.

---

## 5. Pendientes del entorno

- **Node**: Angular 22 pide Node ≥ 22.22.3 y el sistema tiene 22.22.2. `run-frontend.sh` usa uno temporal. Para arreglarlo: `sudo dnf install nodejs22 nodejs22-npm`.
- **Contraseñas**: la de MySQL y la de `sudo` se escribieron en un chat. Cámbialas:
  ```bash
  passwd
  mysql --defaults-extra-file=mysql-local.cnf -e "ALTER USER 'salenluu'@'localhost' IDENTIFIED BY 'NUEVA_CLAVE';"
  ```
  y actualiza `backend.secrets`, `mysql-local.cnf` y la conexión de DBeaver.
- `backend.secrets` y `mysql-local.cnf` están en `.gitignore`. No los subas.
