import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type ToneInsignia = 'neutro' | 'exito' | 'alerta' | 'peligro' | 'info';

const TONOS: Record<ToneInsignia, string> = {
  neutro: 'bg-pizarra-100 text-pizarra-700',
  exito: 'bg-emerald-100 text-emerald-800',
  alerta: 'bg-brand-100 text-brand-800',
  peligro: 'bg-red-100 text-red-700',
  info: 'bg-sky-100 text-sky-800',
};

// Etiqueta pequeña de color.
@Component({
  selector: 'app-insignia',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `<span [class]="clases()"><ng-content /></span>`,
})
export class Insignia {
  readonly tono = input<ToneInsignia>('neutro');

  clases(): string {
    return `inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${TONOS[this.tono()]}`;
  }
}
