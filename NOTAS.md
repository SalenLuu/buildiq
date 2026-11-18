# BuildIQ — Notas del proyecto

Sistema de gestión de inventario en obra de construcción (proyecto final, Técnicas de Programación 2026-2).

- **Frontend** (`buildiq-frontend/`): Angular 22 (standalone, signals), TypeScript, Tailwind CSS v4.
- **Backend** (`buildiq-backend/`): Java 25 + Spring Boot 4.1.2 (Maven), Spring Data JPA / Hibernate, MySQL 8.4.
- **Base de datos**: `inventario_obra.sql` (6 tablas: categorias, proveedores, obras, materiales, stock_obra, movimientos).

> Estado al cierre de la sesión nocturna del 5-6 de noviembre de 2026. **Los commits NO se hicieron** (ver "Pendiente").

---

## 1. Cómo explicar el patrón MVC (para la sustentación)

El front y el back están separados; **lo único que viaja entre ambos es JSON** por HTTP.

| Capa MVC | Dónde está | Qué hace |
|---|---|---|
| **Vista (View)** | `buildiq-frontend/` (Angular) | Pantallas, formularios y tablas. No sabe de SQL; solo pide y muestra JSON. |
| **Controlador (Controller)** | `com.buildiq.controller` | Recibe la petición HTTP (`GET /api/materiales`), delega y responde JSON. |
| **Modelo (Model)** | `com.buildiq.model` | Entidades JPA: una clase por tabla (`Material`, `Obra`...). |
| *(apoyo)* Servicio | `com.buildiq.service` | Reglas de negocio (la de "una salida no supera el stock" va aquí en la Fase 3). |
| *(apoyo)* Repositorio | `com.buildiq.repository` | Acceso a la base de datos. Spring Data genera el CRUD a partir de una interfaz. |

Flujo de una petición: `Angular (Servicio HttpClient) → Controller → Service → Repository → MySQL` y de vuelta como JSON.

Dentro de Angular, la separación equivalente: **componentes** (`pages/`) → **servicios** (`core/services/`, hablan HTTP) → **modelos** (`models/`, interfaces que coinciden con el JSON).

---

## 2. Qué quedó hecho

### Selección de frontend ✅
- Angular 22 (última estable) con componentes standalone, rutas con carga diferida y `HttpClient`.
- Tailwind CSS v4 instalado **local** (`tailwindcss`, `@tailwindcss/postcss`, `postcss`), `.postcssrc.json` y `@import "tailwindcss";` en `src/styles.css`.
- Verificado que el CSS compilado **sí** contiene las clases usadas (`bg-brand-500`, `lg:flex`, etc.), no solo que compile.

### Diseño frontend main page ✅
- Tema propio en `styles.css` (`@theme`): paleta **ámbar** (`brand-*`) y **gris pizarra** (`pizarra-*`).
- Layout con menú lateral compartido (en móvil se vuelve barra superior con botón ☰). Sin scroll horizontal a 375 px.
- Página **Inicio**: total de materiales, obras activas, materiales con stock bajo (con aviso que los lista) y últimos movimientos.

### Construcción de frontend CRUD ✅
- Materiales, Categorías, Proveedores y Obras: tabla con búsqueda, formulario reactivo (`ReactiveFormsModule`) en ventana modal para crear/editar, validaciones y borrado con confirmación.
- Las validaciones replican las restricciones del SQL (NOT NULL, `VARCHAR(n)`, `>= 0`, `fecha_fin >= fecha_inicio`).
- Componentes reutilizables en `shared/ui/`: `Boton`, `Tarjeta`, `CampoFormulario`, `Insignia`, `Modal`, `Confirmar`, `Tabla`, `Aviso`, `EncabezadoPagina` y `VistaCrud`. La lógica común del CRUD está en `shared/pagina-crud.ts` (clase base), así las 4 pantallas casi no repiten código.

### Frontend de informes y filtros ✅
- Pantalla **Informes** con filtros (tipo de informe, obra, desde, hasta). El botón **Generar PDF está desactivado** a propósito: lo genera el backend el 20 de noviembre.
- Filtros por obra, categoría y búsqueda en **Stock por obra**; filtros por obra, material, tipo y fechas en el **historial de movimientos**.

### Construcción frontend negocio ✅
- **Movimientos**: formulario de entrada y de salida. La salida **no puede superar el stock disponible** (se muestra el disponible y se bloquea con mensaje).
- **Stock por obra**: los materiales bajo el mínimo van resaltados en ámbar.
- **Datos de prueba en archivos JSON**: `public/datos/*.json` (uno por tabla), copia de los INSERT del script SQL, nada inventado. `core/services/almacen.service.ts` los lee una vez y los deja en memoria; los servicios (`entidades.service.ts`) hacen el CRUD y las reglas sobre esas listas. Se reinician al recargar la página (ver sección 5).
- **Módulos ocultos y restaurados**: Obras, Movimientos, Stock por obra e Informes se ocultaron un tiempo y ya se restauraron (rutas, menú, páginas e Inicio completo). La carpeta `buildiq-frontend/respaldo-modulos/` quedó vacía de páginas y solo conserva una copia del Inicio completo; se puede borrar.

### Crear proyecto Spring Boot con estructura MVC ✅
- Proyecto generado con Spring Initializr: Boot **4.1.2**, Java 25, dependencias Web, Data JPA, MySQL Driver, Validation y DevTools. Paquete base `com.buildiq` con `model`, `repository`, `service`, `controller` (+ `config` para CORS).
- 6 entidades JPA con relaciones y validaciones (`stock_obra` con `@EmbeddedId`) y un repositorio por entidad.
- Conexión en `application.properties` leyendo `DB_USER`, `DB_PASSWORD` y `DB_NAME` de variables de entorno (**ninguna contraseña en el código**). CORS permite solo `http://localhost:4200`.
- 6 controladores REST bajo `/api/...` con los `GET` funcionando. Crear/editar/borrar quedan con `// TODO Fase 3` y responden **501 Not Implemented**.
- Hibernate en modo `validate`: confirma que las entidades coinciden con las tablas reales.

### Verificación realizada (esto sí se ejecutó)
> **Ojo:** el frontend se verificó (build y navegador) cuando los datos de prueba los daba un interceptor. Después se reemplazó por los JSON + `AlmacenService` y **eso aún no se ha compilado ni probado**: hay que correr `./run-frontend.sh build` y revisar las pantallas. Las pruebas automáticas (front y back) se eliminaron porque el tema aún no se ha visto en clase.

| Qué | Resultado |
|---|---|
| `inventario_obra.sql` en MySQL | 6 tablas y todos los datos |
| Backend arranca y los 6 `GET` devuelven JSON real | Sí, con filtros probados |
| Contrato JSON backend ↔ interfaces TypeScript | Coincide campo por campo en las 6 entidades |

---

## 3. Pendiente o falló, y por qué

1. **No hice ningún commit.** Tu `~/.claude/settings.json` tiene una regla `ask` para `git commit`, que gana sobre cualquier `allow`; cada commit habría quedado esperando tu confirmación. Todo está en disco y sin commitear (el repo tiene 2 commits previos: base + andamiaje de Angular). Para commitear al despertar:
   ```bash
   cd "$HOME/Documents/Técnicas de Programación/Proyecto final"
   git status
   git add -A && git status        # revisa que NO aparezcan backend.secrets ni mysql-local.cnf
   git commit -m "feat(frontend): páginas, servicios con datos JSON y componentes reutilizables"
   ```
   Sugerencia de partir en commits por paso (frontend UI, mock/servicios, backend, notas).
2. **Node del sistema desactualizado para Angular 22.** Angular CLI pide Node ≥ **22.22.3**; tienes `22.22.2` (build `fc43` rezagado). No usé `sudo`. Lo resolví con `./run-frontend.sh` (usa un Node temporal vía `npx` solo si hace falta). Para arreglarlo de raíz **debes ejecutar tú**:
   ```bash
   sudo dnf distro-sync 'nodejs*'     # en los repos hay nodejs22 22.23.1 (fc44)
   node -v                            # debe mostrar >= v22.22.3
   ```
   *(No lo ejecuté ni verifiqué el resultado; si `distro-sync` no cambia la versión, prueba `sudo dnf install nodejs22`.)*
3. **Generación de PDF**: solo la pantalla con filtros y el botón desactivado (backend, 20 de noviembre).
4. **CRUD del backend (crear/editar/borrar) y registro de movimientos**: stubs `501`, es la Fase 3 (12 de noviembre).
5. **Frontend ↔ backend real**: aún no se conectan (19 de noviembre). Ya se comprobó que el contrato JSON coincide, pero **no** se ejecutó el front contra el back real.
6. **Despliegue** (21 de noviembre): no se tocó.
7. **Regla de borrado en el backend real**: el front de prueba devuelve 409 si borras algo con dependencias; el backend deberá hacer lo mismo (hoy MySQL lo impediría con error 500 de llave foránea si no se captura).

---

## 4. Comandos exactos para correr todo en tu PC

**Requisito**: MySQL corriendo (`systemctl is-active mysqld` → `active`).

```bash
cd "$HOME/Documents/Técnicas de Programación/Proyecto final"

# Frontend → http://localhost:4200  (usa el Node correcto automáticamente)
./run-frontend.sh

# Backend → http://localhost:8080   (lee backend.secrets)
./run-backend.sh
```

Otros comandos útiles:
```bash
./run-frontend.sh build          # compila (dist/)
mysql --defaults-extra-file=mysql-local.cnf salenluu_inventario_obra              # consola SQL
```

**Variables de entorno del backend** (archivo `backend.secrets`, ignorado por git, nunca se sube):
```bash
export DB_USER=...
export DB_PASSWORD=...
export DB_NAME=salenluu_inventario_obra
```

**DBeaver**: `flatpak run io.dbeaver.DBeaverCommunity` → conexión MySQL, host `localhost`, puerto `3306`, base `salenluu_inventario_obra`. Si da error `Public Key Retrieval is not allowed`, pon `allowPublicKeyRetrieval=true` en las propiedades del driver.

**Reiniciar el backend a mano**: `mvn spring-boot:run` **no** copia a `target/` los cambios hechos en `application.properties`; hay que detenerlo (Ctrl+C) y volver a lanzarlo.

---

## 5. Cómo conectar el front con la API real (19 de noviembre)

Hoy los datos salen de `public/datos/*.json` y viven en memoria (al recargar vuelven a ser los del script SQL). Para usar el backend hay que cambiar **los servicios, no las páginas**:

1. Arranca MySQL y el backend (`./run-backend.sh`), y comprueba `curl http://localhost:8080/api/materiales`.
2. En `core/services/crud.service.ts`, reemplaza los 5 métodos (`listar`, `obtener`, `crear`, `actualizar`, `eliminar`) por llamadas con `HttpClient` a `${environment.apiUrl}/${ruta}` (get, post, put, delete). Hacen falta `inject(HttpClient)` y una propiedad `ruta` por servicio (`'materiales'`, `'obras'`...).
3. Haz lo mismo con `StockService.consultar`, `MovimientoService.consultar` y `MovimientoService.registrar` (los filtros viajan como `HttpParams`: `idObra`, `idCategoria`, `idMaterial`, `tipo`, `desde`, `hasta`).
4. Borra `almacen.service.ts`, `public/datos/` y las reglas de `validar`/`bloquearBorrado` de cada servicio: pasan al backend. Las páginas siguen igual porque llaman a los mismos métodos y leen `error.error.message`, que es el formato que devuelve Spring.

Las reglas que hoy implementa el front (stock suficiente en una SALIDA, únicos, llaves foráneas) son las que hay que programar en los `service` de Spring Boot en la Fase 3.

---

## 6. Decisiones que debes revisar

- **Nombre de la base**: tu usuario MySQL (`salenluu`) solo puede crear bases que empiecen por `salenluu_`. Cambié **solo 3 líneas** de `inventario_obra.sql` (6-8): `inventario_obra` → `salenluu_inventario_obra`. Si entregas el script al profesor, quizá quieras devolver el nombre original; en el backend el nombre se configura con `DB_NAME`, así que no hay que cambiar código.
- **JSON plano con nombres resueltos**: cada entidad expone ids y nombres (`idCategoria` + `categoriaNombre`, `obraNombre`, `materialNombre`...), no objetos anidados. Así los formularios envían solo ids y las tablas no hacen consultas extra. Es decisión mía; en el backend se hace con `@JsonIgnore` + `@JsonProperty` en getters.
- **Alerta de stock bajo**: una fila de stock está en alerta si `cantidad < stockMinimo` (estrictamente menor). Un material que no tiene fila en una obra no cuenta como alerta. Con los datos del script hay **1 alerta** (Cemento en La Ceja: 40 < 50).
- **Tipo AJUSTE**: el SQL tiene `AJUSTE` pero no define su semántica. En el front de prueba, un ajuste **fija** el stock a la cantidad indicada (conteo físico), y el formulario del front solo ofrece Entrada/Salida. Decide si quieres cambiarlo (la columna `cantidad` tiene `CHECK > 0`, así que no admite ajustes negativos).
- **Fechas de los movimientos de prueba**: en el SQL son `CURRENT_TIMESTAMP`; `public/datos/movimientos.json` usa los valores reales que quedaron al cargar el script (`2026-11-05 23:03:52`), no fechas inventadas.
- **Relaciones `LAZY` + `open-in-view=false`**: las consultas traen lo necesario con `@EntityGraph`. Si añades un campo nuevo que lea una relación, hay que incluirla en el grafo o fallará con `LazyInitializationException`.
- **Propiedades de error de Spring Boot 4**: las de `server.error.*` ya no controlan el JSON de error; se usan `spring.web.error.include-message` e `include-stacktrace`. DevTools mostraba el stacktrace completo por defecto; quedó en `never`.
- **Íconos del menú** son caracteres Unicode (sin librerías de íconos, como pediste). Pueden verse distinto según la fuente del sistema.
- **Permisos de Claude**: creé `../.claude/settings.local.json` (en la carpeta `Técnicas de Programación`, fuera del repo) con una lista de comandos permitidos y bloqueos explícitos (`sudo`, `rm -rf`, `git push`, `git reset --hard`, `npm -g`).

---

## 7. Seguridad y credenciales

- `backend.secrets` y `mysql-local.cnf` contienen la clave de MySQL y están en `.gitignore` (verificado con `git check-ignore`). **No los subas.**
- La contraseña de MySQL (`salenluu`) y la de `sudo` se escribieron en el chat de esta sesión. **Cámbialas**:
  ```bash
  passwd                                   # tu contraseña de usuario/sudo
  mysql --defaults-extra-file=mysql-local.cnf -e "ALTER USER 'salenluu'@'localhost' IDENTIFIED BY 'NUEVA_CLAVE';"
  ```
  y actualiza `backend.secrets` y `mysql-local.cnf` con la nueva.
- Las credenciales de MySQL son solo para uso local; el usuario solo tiene permisos sobre bases `salenluu_%`.
