import { ChangeDetectionStrategy, Component, input } from '@angular/core';

const ESTILOS = {
  error: 'border-red-200 bg-red-50 text-red-800',
  exito: 'border-emerald-200 bg-emerald-50 text-emerald-800',
  info: 'border-sky-200 bg-sky-50 text-sky-800',
  alerta: 'border-brand-200 bg-brand-50 text-brand-800',
} as const;

// Mensaje de error, éxito o alerta.
@Component({
  selector: 'app-aviso',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div [class]="'rounded-lg border px-4 py-3 text-sm ' + estilo()" role="status">
      <ng-content />
    </div>
  `,
})
export class Aviso {
  readonly tipo = input<keyof typeof ESTILOS>('info');

  estilo(): string {
    return ESTILOS[this.tipo()];
  }
}
