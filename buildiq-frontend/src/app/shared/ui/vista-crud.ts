import { ChangeDetectionStrategy, Component, input, model, output } from '@angular/core';
import { Aviso } from './aviso';
import { Boton } from './boton';
import { Confirmar } from './confirmar';
import { EncabezadoPagina } from './encabezado-pagina';
import { Modal } from './modal';
import { Columna, Tabla } from './tabla';

/**
 * Pantalla CRUD completa: encabezado, buscador, tabla, ventana del formulario y
 * confirmación de borrado. Cada página solo aporta las columnas y los campos del
 * formulario (que se proyectan con <ng-content> dentro del modal).
 *
 * El botón "Guardar" está fuera del <form> proyectado y lo envía con form="form-crud".
 */
@Component({
  selector: 'app-vista-crud',
  imports: [EncabezadoPagina, Boton, Aviso, Tabla, Modal, Confirmar],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-encabezado-pagina [titulo]="titulo()" [subtitulo]="subtitulo()">
      <button appBoton type="button" (click)="nuevo.emit()">+ {{ etiquetaNuevo() }}</button>
    </app-encabezado-pagina>

    <div class="mb-4">
      <input
        type="search"
        class="app-input max-w-sm"
        [placeholder]="placeholderBusqueda()"
        [value]="busqueda()"
        (input)="busqueda.set($any($event.target).value)"
        aria-label="Buscar"
      />
    </div>

    @if (error()) {
      <div class="mb-4"><app-aviso tipo="error">{{ error() }}</app-aviso></div>
    }

    @if (cargando()) {
      <p class="py-10 text-center text-pizarra-400">Cargando…</p>
    } @else {
      <app-tabla
        [columnas]="columnas()"
        [filas]="filas()"
        [acciones]="true"
        [vacio]="'No se encontraron registros.'"
        (editar)="editar.emit($event)"
        (eliminar)="eliminar.emit($event)"
      />
    }

    <app-modal [abierto]="modalAbierto()" [titulo]="tituloModal()" (cerrar)="cerrarModal.emit()">
      @if (errorModal()) {
        <div class="mb-4"><app-aviso tipo="error">{{ errorModal() }}</app-aviso></div>
      }
      <ng-content />
      <div class="mt-6 flex justify-end gap-2">
        <button appBoton variante="secundario" type="button" (click)="cerrarModal.emit()">Cancelar</button>
        <button appBoton type="submit" form="form-crud" [disabled]="guardando()">
          {{ guardando() ? 'Guardando…' : 'Guardar' }}
        </button>
      </div>
    </app-modal>

    <app-confirmar
      [abierto]="mensajeBorrar() !== null"
      titulo="Confirmar eliminación"
      [mensaje]="mensajeBorrar() ?? ''"
      (confirmar)="confirmarBorrado.emit()"
      (cancelar)="cancelarBorrado.emit()"
    />
  `,
})
export class VistaCrud {
  readonly titulo = input.required<string>();
  readonly subtitulo = input('');
  readonly etiquetaNuevo = input('Nuevo');
  readonly placeholderBusqueda = input('Buscar…');
  readonly columnas = input.required<Columna[]>();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  readonly filas = input.required<any[]>();
  readonly cargando = input(false);
  readonly error = input<string | null>(null);

  readonly modalAbierto = input(false);
  readonly tituloModal = input('');
  readonly guardando = input(false);
  readonly errorModal = input<string | null>(null);
  /** Texto del diálogo de borrado; null = cerrado. */
  readonly mensajeBorrar = input<string | null>(null);

  readonly busqueda = model('');

  readonly nuevo = output<void>();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  readonly editar = output<any>();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  readonly eliminar = output<any>();
  readonly cerrarModal = output<void>();
  readonly confirmarBorrado = output<void>();
  readonly cancelarBorrado = output<void>();
}
