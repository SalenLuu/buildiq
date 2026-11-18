import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
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
import { AlmacenService, errorApi, MovimientoFila } from './almacen.service';
import { CrudService } from './crud.service';

/*
 * Un servicio por entidad (patrón "servicio" del lado del front: los componentes no
 * saben de dónde salen los datos). Se agrupan en un archivo porque cada uno es corto.
 * Las reglas de cada uno (único, llave foránea) son las que luego hará el backend.
 */

@Injectable({ providedIn: 'root' })
export class CategoriaService extends CrudService<Categoria> {
  protected readonly tabla = 'categorias';
  protected readonly pk = 'idCategoria';

  protected override validar(dato: Partial<Categoria>, idActual?: number): void {
    const repetida = this.almacen.datos.categorias.some(
      (c) => c.nombre.toLowerCase() === String(dato.nombre).toLowerCase() && c.idCategoria !== idActual,
    );
    if (repetida) throw errorApi(409, 'Ya existe una categoría con ese nombre.');
  }

  protected override bloquearBorrado(id: number): void {
    if (this.almacen.datos.materiales.some((m) => m.idCategoria === id)) {
      throw errorApi(409, 'No se puede borrar: hay materiales en esta categoría.');
    }
  }
}

@Injectable({ providedIn: 'root' })
export class ProveedorService extends CrudService<Proveedor> {
  protected readonly tabla = 'proveedores';
  protected readonly pk = 'idProveedor';

  protected override validar(dato: Partial<Proveedor>, idActual?: number): void {
    const repetido = this.almacen.datos.proveedores.some((p) => p.nit === dato.nit && p.idProveedor !== idActual);
    if (repetido) throw errorApi(409, 'Ya existe un proveedor con ese NIT.');
  }

  protected override bloquearBorrado(id: number): void {
    if (this.almacen.datos.movimientos.some((m) => m.idProveedor === id)) {
      throw errorApi(409, 'No se puede borrar: el proveedor tiene movimientos registrados.');
    }
  }
}

@Injectable({ providedIn: 'root' })
export class ObraService extends CrudService<Obra> {
  protected readonly tabla = 'obras';
  protected readonly pk = 'idObra';

  protected override validar(dato: Partial<Obra>): void {
    if (dato.fechaFin && dato.fechaInicio && dato.fechaFin < dato.fechaInicio) {
      throw errorApi(400, 'La fecha de fin no puede ser anterior a la de inicio.');
    }
  }

  protected override bloquearBorrado(id: number): void {
    const { stock, movimientos } = this.almacen.datos;
    if (stock.some((s) => s.idObra === id) || movimientos.some((m) => m.idObra === id)) {
      throw errorApi(409, 'No se puede borrar: la obra tiene stock o movimientos.');
    }
  }
}

@Injectable({ providedIn: 'root' })
export class MaterialService extends CrudService<Material> {
  protected readonly tabla = 'materiales';
  protected readonly pk = 'idMaterial';

  protected override validar(dato: Partial<Material>, idActual?: number): void {
    const { materiales, categorias } = this.almacen.datos;
    const repetido = materiales.some(
      (m) => m.codigo.toLowerCase() === String(dato.codigo).toLowerCase() && m.idMaterial !== idActual,
    );
    if (repetido) throw errorApi(409, 'Ya existe un material con ese código.');
    if (!categorias.some((c) => c.idCategoria === dato.idCategoria)) {
      throw errorApi(409, 'La categoría indicada no existe.');
    }
  }

  protected override bloquearBorrado(id: number): void {
    const { stock, movimientos } = this.almacen.datos;
    if (stock.some((s) => s.idMaterial === id) || movimientos.some((m) => m.idMaterial === id)) {
      throw errorApi(409, 'No se puede borrar: el material tiene stock o movimientos.');
    }
  }

  // El backend traerá el nombre de la categoría con un JOIN; aquí lo buscamos a mano.
  protected override conJoins(fila: Record<string, unknown>): Material {
    const categoria = this.almacen.datos.categorias.find((c) => c.idCategoria === fila['idCategoria']);
    return { ...fila, categoriaNombre: categoria?.nombre ?? '' } as unknown as Material;
  }
}

/** El stock es de solo lectura: cambia únicamente al registrar movimientos. */
@Injectable({ providedIn: 'root' })
export class StockService {
  private readonly almacen = inject(AlmacenService);

  consultar(filtro: FiltroStock = {}): Observable<StockObra[]> {
    return this.almacen.ejecutar(() => {
      const { stock, materiales, obras, categorias } = this.almacen.datos;
      return stock
        .map((s): StockObra => {
          const m = materiales.find((x) => x.idMaterial === s.idMaterial)!;
          return {
            idObra: s.idObra,
            idMaterial: s.idMaterial,
            cantidad: s.cantidad,
            obraNombre: obras.find((o) => o.idObra === s.idObra)!.nombre,
            materialCodigo: m.codigo,
            materialNombre: m.nombre,
            unidadMedida: m.unidadMedida,
            stockMinimo: m.stockMinimo,
            idCategoria: m.idCategoria,
            categoriaNombre: categorias.find((c) => c.idCategoria === m.idCategoria)?.nombre ?? '',
          };
        })
        .filter(
          (s) =>
            (!filtro.idObra || s.idObra === filtro.idObra) &&
            (!filtro.idCategoria || s.idCategoria === filtro.idCategoria),
        );
    });
  }
}

@Injectable({ providedIn: 'root' })
export class MovimientoService {
  private readonly almacen = inject(AlmacenService);

  consultar(filtro: FiltroMovimientos = {}): Observable<Movimiento[]> {
    return this.almacen.ejecutar(() =>
      this.almacen.datos.movimientos
        .filter(
          (m) =>
            (!filtro.idObra || m.idObra === filtro.idObra) &&
            (!filtro.idMaterial || m.idMaterial === filtro.idMaterial) &&
            (!filtro.tipo || m.tipo === filtro.tipo) &&
            (!filtro.desde || m.fecha.slice(0, 10) >= filtro.desde) &&
            (!filtro.hasta || m.fecha.slice(0, 10) <= filtro.hasta),
        )
        .map((m) => this.conJoins(m))
        // Más recientes primero; a igual fecha, el id mayor (el último registrado).
        .sort((a, b) => b.fecha.localeCompare(a.fecha) || b.idMovimiento - a.idMovimiento),
    );
  }

  /** Registra una entrada, salida o ajuste y actualiza el stock (regla de negocio central). */
  registrar(nuevo: MovimientoNuevo): Observable<Movimiento> {
    return this.almacen.ejecutar(() => {
      const { obras, materiales, stock, movimientos } = this.almacen.datos;
      if (!(nuevo.cantidad > 0)) throw errorApi(400, 'La cantidad debe ser mayor que cero.');
      if (!obras.some((o) => o.idObra === nuevo.idObra)) throw errorApi(400, 'La obra indicada no existe.');
      if (!materiales.some((m) => m.idMaterial === nuevo.idMaterial)) {
        throw errorApi(400, 'El material indicado no existe.');
      }
      if (!nuevo.responsable?.trim()) throw errorApi(400, 'El responsable es obligatorio.');

      let fila = stock.find((s) => s.idObra === nuevo.idObra && s.idMaterial === nuevo.idMaterial);
      if (nuevo.tipo === 'SALIDA') {
        const disponible = fila?.cantidad ?? 0;
        if (nuevo.cantidad > disponible) {
          throw errorApi(400, `Stock insuficiente: disponible ${disponible}, solicitado ${nuevo.cantidad}.`);
        }
      }
      if (!fila) {
        fila = { idObra: nuevo.idObra, idMaterial: nuevo.idMaterial, cantidad: 0 };
        stock.push(fila);
      }
      // ENTRADA suma, SALIDA resta, AJUSTE fija el conteo físico (decisión anotada en NOTAS.md).
      if (nuevo.tipo === 'ENTRADA') fila.cantidad += nuevo.cantidad;
      else if (nuevo.tipo === 'SALIDA') fila.cantidad -= nuevo.cantidad;
      else fila.cantidad = nuevo.cantidad;

      const creado: MovimientoFila = {
        idMovimiento: this.almacen.siguienteId(movimientos, 'idMovimiento'),
        idObra: nuevo.idObra,
        idMaterial: nuevo.idMaterial,
        // El proveedor solo aplica a ENTRADA (así lo documenta el script SQL).
        idProveedor: nuevo.tipo === 'ENTRADA' ? (nuevo.idProveedor ?? null) : null,
        tipo: nuevo.tipo,
        cantidad: nuevo.cantidad,
        fecha: fechaLocalIso(),
        responsable: nuevo.responsable.trim(),
        observacion: nuevo.observacion?.trim() || null,
      };
      movimientos.push(creado);
      return this.conJoins(creado);
    });
  }

  // El backend traerá estos nombres con JOIN; aquí los buscamos a mano.
  private conJoins(m: MovimientoFila): Movimiento {
    const { obras, materiales, proveedores } = this.almacen.datos;
    const material = materiales.find((x) => x.idMaterial === m.idMaterial);
    return {
      ...m,
      obraNombre: obras.find((o) => o.idObra === m.idObra)?.nombre,
      materialNombre: material?.nombre,
      unidadMedida: material?.unidadMedida,
      proveedorNombre: proveedores.find((p) => p.idProveedor === m.idProveedor)?.nombre ?? null,
    };
  }
}

function fechaLocalIso(d = new Date()): string {
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}
