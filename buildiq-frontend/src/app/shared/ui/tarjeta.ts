import { ChangeDetectionStrategy, Component, input } from '@angular/core';

// Contenedor con borde y sombra.
@Component({
  selector: 'app-tarjeta',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="rounded-xl border border-pizarra-200 bg-white shadow-sm">
      @if (titulo()) {
        <header class="border-b border-pizarra-100 px-5 py-3">
          <h2 class="text-sm font-semibold uppercase tracking-wide text-pizarra-500">{{ titulo() }}</h2>
        </header>
      }
      <div class="p-5"><ng-content /></div>
    </section>
  `,
})
export class Tarjeta {
  readonly titulo = input<string>('');
}
