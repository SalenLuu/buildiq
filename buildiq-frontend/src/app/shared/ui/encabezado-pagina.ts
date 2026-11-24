import { ChangeDetectionStrategy, Component, input } from '@angular/core';

// Título de la pantalla con espacio para botones.
@Component({
  selector: 'app-encabezado-pagina',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 class="text-2xl font-bold text-pizarra-900">{{ titulo() }}</h1>
        @if (subtitulo()) {
          <p class="mt-1 text-sm text-pizarra-500">{{ subtitulo() }}</p>
        }
      </div>
      <div class="flex items-center gap-2"><ng-content /></div>
    </div>
  `,
})
export class EncabezadoPagina {
  readonly titulo = input.required<string>();
  readonly subtitulo = input('');
}
