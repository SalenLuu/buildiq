import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

// Base de los servicios CRUD. Cada servicio solo indica su ruta en la API.
export abstract class CrudService<T> {
  protected readonly http = inject(HttpClient);
  protected abstract readonly ruta: string;

  protected get url(): string {
    return `${environment.apiUrl}/${this.ruta}`;
  }

  listar(): Observable<T[]> {
    return this.http.get<T[]>(this.url);
  }

  obtener(id: number): Observable<T> {
    return this.http.get<T>(`${this.url}/${id}`);
  }

  crear(dato: Partial<T>): Observable<T> {
    return this.http.post<T>(this.url, dato);
  }

  actualizar(id: number, dato: Partial<T>): Observable<T> {
    return this.http.put<T>(`${this.url}/${id}`, dato);
  }

  eliminar(id: number): Observable<void> {
    return this.http.delete<void>(`${this.url}/${id}`);
  }
}
