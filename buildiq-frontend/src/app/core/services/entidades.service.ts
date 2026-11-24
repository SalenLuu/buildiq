import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  Categoria,
  FiltroMovimientos,
  FiltroStock,
  Material,
  Movimiento,
  MovimientoNuevo,
  Obra,
  Proveedor,
  StockObra,
} from '../../models';
import { CrudService } from './crud.service';

@Injectable({ providedIn: 'root' })
export class CategoriaService extends CrudService<Categoria> {
  protected readonly ruta = 'categorias';
}

@Injectable({ providedIn: 'root' })
export class ProveedorService extends CrudService<Proveedor> {
  protected readonly ruta = 'proveedores';
}

@Injectable({ providedIn: 'root' })
export class ObraService extends CrudService<Obra> {
  protected readonly ruta = 'obras';
}

@Injectable({ providedIn: 'root' })
export class MaterialService extends CrudService<Material> {
  protected readonly ruta = 'materiales';
}

// El stock solo se consulta; cambia al registrar movimientos.
@Injectable({ providedIn: 'root' })
export class StockService {
  private readonly http = inject(HttpClient);

  consultar(filtro: FiltroStock = {}): Observable<StockObra[]> {
    let params = new HttpParams();
    if (filtro.idObra) params = params.set('idObra', filtro.idObra);
    if (filtro.idCategoria) params = params.set('idCategoria', filtro.idCategoria);
    return this.http.get<StockObra[]>(`${environment.apiUrl}/stock`, { params });
  }
}

@Injectable({ providedIn: 'root' })
export class MovimientoService {
  private readonly http = inject(HttpClient);
  private readonly url = `${environment.apiUrl}/movimientos`;

  consultar(filtro: FiltroMovimientos = {}): Observable<Movimiento[]> {
    let params = new HttpParams();
    if (filtro.idObra) params = params.set('idObra', filtro.idObra);
    if (filtro.idMaterial) params = params.set('idMaterial', filtro.idMaterial);
    if (filtro.tipo) params = params.set('tipo', filtro.tipo);
    if (filtro.desde) params = params.set('desde', filtro.desde);
    if (filtro.hasta) params = params.set('hasta', filtro.hasta);
    return this.http.get<Movimiento[]>(this.url, { params });
  }

  // El backend valida el stock y lo actualiza.
  registrar(movimiento: MovimientoNuevo): Observable<Movimiento> {
    return this.http.post<Movimiento>(this.url, movimiento);
  }
}
