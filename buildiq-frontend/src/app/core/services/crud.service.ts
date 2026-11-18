import { inject } from '@angular/core';
import { Observable } from 'rxjs';
import { AlmacenService, Datos, errorApi } from './almacen.service';

/**
 * Base de los servicios CRUD. Cada entidad indica su tabla y su llave primaria y hereda
 * listar, obtener, crear, actualizar y eliminar, que hoy trabajan sobre las listas del
 * AlmacenService. Cuando exista el backend, estos cinco métodos pasarán a usar HttpClient
 * (get/post/put/delete) y las páginas no cambian, porque siguen llamando a los mismos métodos.
 */
export abstract class CrudService<T extends object> {
  protected readonly almacen = inject(AlmacenService);
  protected abstract readonly tabla: keyof Pick<Datos, 'categorias' | 'proveedores' | 'obras' | 'materiales'>;
  protected abstract readonly pk: string;

  private get filas(): Record<string, unknown>[] {
    return this.almacen.datos[this.tabla] as unknown as Record<string, unknown>[];
  }

  /** Lanza un error si el dato rompe una regla (valor repetido, llave foránea...). */
  protected validar(_dato: Partial<T>, _idActual?: number): void {}

  /** Lanza un error si hay registros que dependen de este y no se puede borrar. */
  protected bloquearBorrado(_id: number): void {}

  /** Agrega los datos que en el backend vendrían de un JOIN (ej. nombre de la categoría). */
  protected conJoins(fila: Record<string, unknown>): T {
    return { ...fila } as T;
  }

  private buscar(id: number): Record<string, unknown> {
    const fila = this.filas.find((f) => f[this.pk] === id);
    if (!fila) throw errorApi(404, 'Registro no encontrado.');
    return fila;
  }

  listar(): Observable<T[]> {
    return this.almacen.ejecutar(() => this.filas.map((f) => this.conJoins(f)));
  }

  obtener(id: number): Observable<T> {
    return this.almacen.ejecutar(() => this.conJoins(this.buscar(id)));
  }

  crear(dato: Partial<T>): Observable<T> {
    return this.almacen.ejecutar(() => {
      this.validar(dato);
      const nuevo = { ...dato, [this.pk]: this.almacen.siguienteId(this.filas, this.pk) };
      this.filas.push(nuevo);
      return this.conJoins(nuevo);
    });
  }

  actualizar(id: number, dato: Partial<T>): Observable<T> {
    return this.almacen.ejecutar(() => {
      this.buscar(id);
      this.validar(dato, id);
      const actualizado = { ...dato, [this.pk]: id };
      this.filas[this.filas.findIndex((f) => f[this.pk] === id)] = actualizado;
      return this.conJoins(actualizado);
    });
  }

  eliminar(id: number): Observable<void> {
    return this.almacen.ejecutar(() => {
      this.buscar(id);
      this.bloquearBorrado(id);
      this.filas.splice(this.filas.findIndex((f) => f[this.pk] === id), 1);
    });
  }
}
