import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export type VarianteBoton = 'primario' | 'secundario' | 'peligro' | 'fantasma';

const BASE =
  'inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold ' +
  'transition-colors disabled:cursor-not-allowed disabled:opacity-50';

const VARIANTES: Record<VarianteBoton, string> = {
  primario: 'bg-brand-500 text-pizarra-950 hover:bg-brand-400 shadow-sm',
  secundario: 'bg-white text-pizarra-700 border border-pizarra-200 hover:bg-pizarra-100',
  peligro: 'bg-red-600 text-white hover:bg-red-500 shadow-sm',
  fantasma: 'text-pizarra-600 hover:bg-pizarra-100',
};

// Botón reutilizable. Uso: <button appBoton variante="peligro">Borrar</button>
@Component({
  selector: 'button[appBoton], a[appBoton]',
  template: '<ng-content />',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class]': 'clases()' },
})
export class Boton {
  readonly variante = input<VarianteBoton>('primario');

  clases(): string {
    return `${BASE} ${VARIANTES[this.variante()]}`;
  }
}
