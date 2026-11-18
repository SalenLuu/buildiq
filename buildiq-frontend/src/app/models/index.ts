/*
 * Modelos del dominio. Los nombres de campo coinciden con el JSON que devolverá
 * el backend (camelCase), derivados de las columnas de inventario_obra.sql.
 * Los campos "xxxNombre" son datos de lectura que el backend resuelve con joins,
 * para que la tabla no tenga que consultar otra entidad por cada fila.
 */

export type EstadoObra = 'PLANEADA' | 'EN_EJECUCION' | 'PAUSADA' | 'FINALIZADA';
export type TipoMovimiento = 'ENTRADA' | 'SALIDA' | 'AJUSTE';

export interface Categoria {
  idCategoria: number;
  nombre: string;
  descripcion: string | null;
}

export interface Proveedor {
  idProveedor: number;
  nombre: string;
  nit: string;
  telefono: string | null;
  correo: string | null;
  direccion: string | null;
  activo: boolean;
}

export interface Obra {
  idObra: number;
  nombre: string;
  direccion: string | null;
  fechaInicio: string; // 'YYYY-MM-DD'
  fechaFin: string | null;
  estado: EstadoObra;
}

export interface Material {
  idMaterial: number;
  codigo: string;
  nombre: string;
  descripcion: string | null;
  idCategoria: number;
  categoriaNombre?: string;
  unidadMedida: string;
  stockMinimo: number;
  precioUnitario: number;
  activo: boolean;
}

/** Una fila de stock_obra (PK compuesta idObra + idMaterial) con datos del material. */
export interface StockObra {
  idObra: number;
  idMaterial: number;
  cantidad: number;
  obraNombre: string;
  materialCodigo: string;
  materialNombre: string;
  unidadMedida: string;
  stockMinimo: number;
  idCategoria: number;
  categoriaNombre: string;
}

export interface Movimiento {
  idMovimiento: number;
  idObra: number;
  obraNombre?: string;
  idMaterial: number;
  materialNombre?: string;
  unidadMedida?: string;
  idProveedor: number | null;
  proveedorNombre?: string | null;
  tipo: TipoMovimiento;
  cantidad: number;
  fecha: string; // ISO 'YYYY-MM-DDTHH:mm:ss'
  responsable: string;
  observacion: string | null;
}

/** Cuerpo para registrar un movimiento (el backend pone id y fecha). */
export type MovimientoNuevo = Pick<
  Movimiento,
  'idObra' | 'idMaterial' | 'idProveedor' | 'tipo' | 'cantidad' | 'responsable' | 'observacion'
>;

export interface FiltroMovimientos {
  idObra?: number | null;
  idMaterial?: number | null;
  tipo?: TipoMovimiento | '' | null;
  desde?: string | null; // 'YYYY-MM-DD'
  hasta?: string | null;
}

export interface FiltroStock {
  idObra?: number | null;
  idCategoria?: number | null;
}

/** Cuerpo de error que devuelve la API (el frontend de prueba la imita). */
export interface ErrorApi {
  message: string;
}
