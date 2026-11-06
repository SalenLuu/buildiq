-- ============================================================
-- Sistema de gestión de inventario en obra (borrador v1)
-- Motor: MySQL 8.x  |  Codificación: utf8mb4
-- ============================================================

DROP DATABASE IF EXISTS salenluu_inventario_obra;
CREATE DATABASE salenluu_inventario_obra CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE salenluu_inventario_obra;

-- ------------------------------------------------------------
-- Tablas de catálogo
-- ------------------------------------------------------------
CREATE TABLE categorias (
    id_categoria  INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nombre        VARCHAR(60)  NOT NULL UNIQUE,
    descripcion   VARCHAR(200)
) ENGINE=InnoDB;

CREATE TABLE proveedores (
    id_proveedor  INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nombre        VARCHAR(100) NOT NULL,
    nit           VARCHAR(20)  NOT NULL UNIQUE,
    telefono      VARCHAR(20),
    correo        VARCHAR(100),
    direccion     VARCHAR(150),
    activo        BOOLEAN NOT NULL DEFAULT TRUE
) ENGINE=InnoDB;

CREATE TABLE obras (
    id_obra       INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nombre        VARCHAR(100) NOT NULL,
    direccion     VARCHAR(150),
    fecha_inicio  DATE NOT NULL,
    fecha_fin     DATE,
    estado        ENUM('PLANEADA','EN_EJECUCION','PAUSADA','FINALIZADA')
                  NOT NULL DEFAULT 'PLANEADA',
    CONSTRAINT chk_obras_fechas CHECK (fecha_fin IS NULL OR fecha_fin >= fecha_inicio)
) ENGINE=InnoDB;

CREATE TABLE materiales (
    id_material     INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    codigo          VARCHAR(20)   NOT NULL UNIQUE,
    nombre          VARCHAR(100)  NOT NULL,
    descripcion     VARCHAR(200),
    id_categoria    INT UNSIGNED  NOT NULL,
    unidad_medida   VARCHAR(15)   NOT NULL,          -- kg, m, m2, m3, bulto, unidad...
    stock_minimo    DECIMAL(12,2) NOT NULL DEFAULT 0,
    precio_unitario DECIMAL(12,2) NOT NULL DEFAULT 0,
    activo          BOOLEAN       NOT NULL DEFAULT TRUE,
    CONSTRAINT chk_mat_stock_min CHECK (stock_minimo >= 0),
    CONSTRAINT chk_mat_precio    CHECK (precio_unitario >= 0),
    CONSTRAINT fk_mat_categoria  FOREIGN KEY (id_categoria)
        REFERENCES categorias(id_categoria)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- Stock actual de cada material en cada obra
-- ------------------------------------------------------------
CREATE TABLE stock_obra (
    id_obra      INT UNSIGNED  NOT NULL,
    id_material  INT UNSIGNED  NOT NULL,
    cantidad     DECIMAL(12,2) NOT NULL DEFAULT 0,
    PRIMARY KEY (id_obra, id_material),
    CONSTRAINT chk_stock_cant CHECK (cantidad >= 0),
    CONSTRAINT fk_stock_obra     FOREIGN KEY (id_obra)     REFERENCES obras(id_obra),
    CONSTRAINT fk_stock_material FOREIGN KEY (id_material) REFERENCES materiales(id_material)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- Historial de movimientos (entradas, salidas, ajustes)
-- ------------------------------------------------------------
CREATE TABLE movimientos (
    id_movimiento INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    id_obra       INT UNSIGNED  NOT NULL,
    id_material   INT UNSIGNED  NOT NULL,
    id_proveedor  INT UNSIGNED  NULL,                -- solo aplica a ENTRADA
    tipo          ENUM('ENTRADA','SALIDA','AJUSTE') NOT NULL,
    cantidad      DECIMAL(12,2) NOT NULL,
    fecha         DATETIME      NOT NULL DEFAULT CURRENT_TIMESTAMP,
    responsable   VARCHAR(80)   NOT NULL,
    observacion   VARCHAR(250),
    CONSTRAINT chk_mov_cant CHECK (cantidad > 0),
    CONSTRAINT fk_mov_obra      FOREIGN KEY (id_obra)      REFERENCES obras(id_obra),
    CONSTRAINT fk_mov_material  FOREIGN KEY (id_material)  REFERENCES materiales(id_material),
    CONSTRAINT fk_mov_proveedor FOREIGN KEY (id_proveedor) REFERENCES proveedores(id_proveedor),
    INDEX idx_mov_fecha (fecha),
    INDEX idx_mov_obra_material (id_obra, id_material)
) ENGINE=InnoDB;

-- ------------------------------------------------------------
-- Datos de ejemplo
-- ------------------------------------------------------------
INSERT INTO categorias (nombre, descripcion) VALUES
 ('Cementantes', 'Cemento, mortero, pegantes'),
 ('Acero', 'Varillas, mallas, alambre'),
 ('Agregados', 'Arena, gravilla, recebo'),
 ('Mampostería', 'Ladrillos, bloques'),
 ('Herramientas', 'Herramienta menor de obra'),
 ('Eléctrico', 'Cables, tubería y accesorios eléctricos');

INSERT INTO proveedores (nombre, nit, telefono, correo, direccion) VALUES
 ('Ferretería El Constructor', '900123456-1', '3001112233', 'ventas@elconstructor.com', 'Cra 50 # 30-20, Medellín'),
 ('Cementos del Norte S.A.S.', '900654321-7', '3004445566', 'pedidos@cementosnorte.com', 'Calle 10 # 40-15, Bello'),
 ('Aceros Antioquia', '900987654-3', '3007778899', 'comercial@acerosantioquia.com', 'Autopista Sur Km 3, Itagüí');

INSERT INTO obras (nombre, direccion, fecha_inicio, estado) VALUES
 ('Edificio Los Almendros', 'Cl 20 # 15-30, Medellín', '2026-08-01', 'EN_EJECUCION'),
 ('Casa Campestre La Ceja', 'Vereda San José, La Ceja', '2026-10-15', 'EN_EJECUCION');

INSERT INTO materiales (codigo, nombre, descripcion, id_categoria, unidad_medida, stock_minimo, precio_unitario) VALUES
 ('CEM-001', 'Cemento gris 50 kg', 'Uso general', 1, 'bulto', 50, 32000),
 ('ACE-001', 'Varilla corrugada 3/8"', 'Barra de 6 m', 2, 'unidad', 100, 18500),
 ('AGR-001', 'Arena de río', 'Para mezclas y pañete', 3, 'm3', 10, 85000),
 ('MAM-001', 'Ladrillo estructural', 'Ladrillo tolete', 4, 'unidad', 500, 1300),
 ('HER-001', 'Pala redonda', 'Mango de madera', 5, 'unidad', 5, 45000);

INSERT INTO stock_obra (id_obra, id_material, cantidad) VALUES
 (1, 1, 120), (1, 2, 300), (1, 3, 25), (2, 1, 40), (2, 4, 2000);

INSERT INTO movimientos (id_obra, id_material, id_proveedor, tipo, cantidad, responsable, observacion) VALUES
 (1, 1, 2, 'ENTRADA', 150, 'Almacenista Juan', 'Compra inicial de cemento'),
 (1, 1, NULL, 'SALIDA', 30, 'Maestro Pedro', 'Fundición de placa piso 2'),
 (1, 2, 3, 'ENTRADA', 300, 'Almacenista Juan', 'Varilla para columnas'),
 (2, 4, 1, 'ENTRADA', 2000, 'Almacenista Ana', 'Ladrillo para muros');
