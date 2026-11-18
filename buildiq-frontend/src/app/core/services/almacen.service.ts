import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { forkJoin, map, Observable, of, shareReplay, tap } from 'rxjs';
import { Categoria, Material, Movimiento, Obra, Proveedor } from '../../models';

/** Fila cruda de stock_obra (sin joins). */
export interface StockFila {
  idObra: number;
  idMaterial: number;
  cantidad: number;
}

/** Fila cruda de movimientos (sin joins). */
export type MovimientoFila = Omit<
  Movimiento,
  'obraNombre' | 'materialNombre' | 'unidadMedida' | 'proveedorNombre'
>;

/** Una lista por tabla de inventario_obra.sql. */
export interface Datos {
  categorias: Categoria[];
  proveedores: Proveedor[];
  obras: Obra[];
  materiales: Omit<Material, 'categoriaNombre'>[];
  stock: StockFila[];
  movimientos: MovimientoFila[];
}

/** Error con la misma forma que devolverá el backend: { message } y un código HTTP. */
export function errorApi(status: number, message: string): HttpErrorResponse {
  return new HttpErrorResponse({ status, error: { message } });
}

/**
 * Fuente de datos temporal del frontend (hasta conectar el backend).
 *
 * Lee una sola vez los archivos public/datos/*.json (copia de los INSERT de
 * inventario_obra.sql) y los deja en listas en memoria. Los servicios consultan y
 * modifican estas listas; al recargar la página se vuelve a los datos originales.
 */
@Injectable({ providedIn: 'root' })
export class AlmacenService {
  private readonly http = inject(HttpClient);

  datos: Datos = { categorias: [], proveedores: [], obras: [], materiales: [], stock: [], movimientos: [] };

  private cargado$?: Observable<void>;

  /** Carga los JSON la primera vez; las siguientes reutiliza lo ya cargado. */
  private iniciar(): Observable<void> {
    this.cargado$ ??= forkJoin({
      categorias: this.http.get<Datos['categorias']>('datos/categorias.json'),
      proveedores: this.http.get<Datos['proveedores']>('datos/proveedores.json'),
      obras: this.http.get<Datos['obras']>('datos/obras.json'),
      materiales: this.http.get<Datos['materiales']>('datos/materiales.json'),
      stock: this.http.get<Datos['stock']>('datos/stock.json'),
      movimientos: this.http.get<Datos['movimientos']>('datos/movimientos.json'),
    }).pipe(
      tap((datos) => (this.datos = datos)),
      map(() => undefined),
      shareReplay(1),
    );
    return this.cargado$;
  }

  /** Para las pruebas: usa estos datos en vez de leer los JSON. */
  cargarDatos(datos: Datos): void {
    this.datos = datos;
    this.cargado$ = of(undefined);
  }

  /**
   * Espera a que haya datos y luego ejecuta la acción. Si la acción lanza un error
   * (por ejemplo errorApi(404, ...)), el Observable falla, como lo haría una petición HTTP.
   */
  ejecutar<R>(accion: () => R): Observable<R> {
    return this.iniciar().pipe(map(accion));
  }

  siguienteId(filas: object[], pk: string): number {
    return filas.reduce((max, f) => Math.max(max, (f as Record<string, number>)[pk]), 0) + 1;
  }
}
