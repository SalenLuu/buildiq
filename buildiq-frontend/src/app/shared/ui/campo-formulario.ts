import { ChangeDetectionStrategy, Component, effect, input, signal } from '@angular/core';
import { AbstractControl } from '@angular/forms';

// Campo de formulario: etiqueta, control y mensaje de error.
@Component({
  selector: 'app-campo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <label class="block">
      <span class="mb-1 block text-sm font-medium text-pizarra-700">
        {{ etiqueta() }}
        @if (obligatorio()) {
          <span class="text-red-600" aria-hidden="true">*</span>
        }
      </span>
      <ng-content />
    </label>
    @if (mensajeError(); as msg) {
      <p class="mt-1 text-xs text-red-600" role="alert">{{ msg }}</p>
    }
  `,
})
export class CampoFormulario {
  readonly etiqueta = input.required<string>();
  readonly control = input<AbstractControl | null>(null);
  readonly obligatorio = input(false);

  // Cambia con cada evento del control para que los errores se vuelvan a pintar.
  private readonly cambios = signal(0);

  constructor() {
    effect((limpiar) => {
      const sub = this.control()?.events.subscribe(() => this.cambios.update((n) => n + 1));
      limpiar(() => sub?.unsubscribe());
    });
  }

  mensajeError(): string | null {
    this.cambios();
    const c = this.control();
    if (!c || !c.invalid || !(c.touched || c.dirty)) return null;
    const e = c.errors ?? {};
    if (e['required']) return 'Este campo es obligatorio.';
    if (e['min']) return `El valor mínimo es ${e['min'].min}.`;
    if (e['max']) return `El valor máximo es ${e['max'].max}.`;
    if (e['maxlength']) return `Máximo ${e['maxlength'].requiredLength} caracteres.`;
    if (e['email']) return 'Escribe un correo válido.';
    if (e['pattern']) return 'El formato no es válido.';
    if (e['fechaFin']) return 'La fecha de fin no puede ser anterior a la de inicio.';
    if (e['superaStock']) return e['superaStock'];
    return 'Valor no válido.';
  }
}
