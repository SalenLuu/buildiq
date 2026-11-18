import { CurrencyPipe, DatePipe, DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { Boton } from './boton';
import { Insignia, ToneInsignia } from './insignia';

export type TipoColumna = 'texto' | 'numero' | 'moneda' | 'fecha' | 'fechaHora' | 'booleano' | 'insignia';

export interface Columna {
  /** Nombre del campo en el objeto de la fila. */
  clave: string;
  etiqueta: string;
  tipo?: TipoColumna;
  /** Para tipo 'insignia': decide el color según el valor. */
  tono?: (valor: unknown) => ToneInsignia;
  /** Para tipo 'insignia': traduce el valor a texto legible. */
  texto?: (valor: unknown) => string;
}

/**
 * Tabla genérica: recibe columnas y filas y emite eventos de editar/eliminar.
 * Así las 4 pantallas CRUD comparten el mismo marcado en vez de repetir clases.
 */
@Component({
  selector: 'app-tabla',
  imports: [DatePipe, DecimalPipe, CurrencyPipe, Insignia, Boton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="overflow-x-auto rounded-xl border border-pizarra-200 bg-white shadow-sm">
      <table class="min-w-full divide-y divide-pizarra-100 text-sm">
        <thead class="bg-pizarra-50">
          <tr>
            @for (col of columnas(); track col.clave) {
              <th scope="col" class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-pizarra-500">
                {{ col.etiqueta }}
              </th>
            }
            @if (acciones()) {
              <th scope="col" class="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-pizarra-500">
                Acciones
              </th>
            }
          </tr>
        </thead>
        <tbody class="divide-y divide-pizarra-100">
          @for (fila of filas(); track $index) {
            <tr [class]="claseFila()(fila)">
              @for (col of columnas(); track col.clave) {
                <td class="px-4 py-3 text-pizarra-700">
                  @switch (col.tipo ?? 'texto') {
                    @case ('numero') {
                      {{ fila[col.clave] | number: '1.0-2' }}
                    }
                    @case ('moneda') {
                      {{ fila[col.clave] | currency: 'COP' : 'symbol-narrow' : '1.0-0' }}
                    }
                    @case ('fecha') {
                      {{ fila[col.clave] | date: 'dd/MM/yyyy' }}
                    }
                    @case ('fechaHora') {
                      {{ fila[col.clave] | date: 'dd/MM/yyyy HH:mm' }}
                    }
                    @case ('booleano') {
                      <app-insignia [tono]="fila[col.clave] ? 'exito' : 'neutro'">
                        {{ fila[col.clave] ? 'Sí' : 'No' }}
                      </app-insignia>
                    }
                    @case ('insignia') {
                      <app-insignia [tono]="col.tono ? col.tono(fila[col.clave]) : 'neutro'">
                        {{ col.texto ? col.texto(fila[col.clave]) : fila[col.clave] }}
                      </app-insignia>
                    }
                    @default {
                      {{ fila[col.clave] ?? '—' }}
                    }
                  }
                </td>
              }
              @if (acciones()) {
                <td class="whitespace-nowrap px-4 py-3 text-right">
                  <button appBoton variante="fantasma" type="button" (click)="editar.emit(fila)">Editar</button>
                  <button appBoton variante="fantasma" type="button" class="!text-red-600" (click)="eliminar.emit(fila)">
                    Borrar
                  </button>
                </td>
              }
            </tr>
          } @empty {
            <tr>
              <td [attr.colspan]="columnas().length + (acciones() ? 1 : 0)" class="px-4 py-10 text-center text-pizarra-400">
                {{ vacio() }}
              </td>
            </tr>
          }
        </tbody>
      </table>
    </div>
  `,
})
export class Tabla {
  readonly columnas = input.required<Columna[]>();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  readonly filas = input.required<any[]>();
  readonly acciones = input(false);
  readonly vacio = input('No hay registros para mostrar.');
  /** Permite resaltar filas (por ejemplo, stock bajo el mínimo). */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  readonly claseFila = input<(fila: any) => string>(() => '');

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  readonly editar = output<any>();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  readonly eliminar = output<any>();
}
