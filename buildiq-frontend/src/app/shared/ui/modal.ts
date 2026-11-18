import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';

/**
 * Ventana modal simple (sin librerías). Se muestra con [abierto]="true" y avisa
 * con (cerrar) cuando la persona pulsa Esc, el fondo o la X.
 */
@Component({
  selector: 'app-modal',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(document:keydown.escape)': 'cerrar.emit()' },
  template: `
    @if (abierto()) {
      <div class="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
        <div class="absolute inset-0 bg-pizarra-950/60" (click)="cerrar.emit()" aria-hidden="true"></div>
        <div
          class="relative z-10 max-h-[90vh] w-full overflow-y-auto rounded-t-2xl bg-white shadow-xl sm:max-w-lg sm:rounded-2xl"
          role="dialog"
          aria-modal="true"
          [attr.aria-label]="titulo()"
        >
          <header class="flex items-center justify-between border-b border-pizarra-100 px-5 py-4">
            <h2 class="text-lg font-bold text-pizarra-900">{{ titulo() }}</h2>
            <button
              type="button"
              class="rounded-lg p-1 text-pizarra-500 hover:bg-pizarra-100"
              aria-label="Cerrar"
              (click)="cerrar.emit()"
            >
              ✕
            </button>
          </header>
          <div class="p-5"><ng-content /></div>
        </div>
      </div>
    }
  `,
})
export class Modal {
  readonly abierto = input(false);
  readonly titulo = input('');
  readonly cerrar = output<void>();
}
