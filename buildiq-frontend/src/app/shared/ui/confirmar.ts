import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { Boton } from './boton';
import { Modal } from './modal';

// Diálogo para confirmar un borrado.
@Component({
  selector: 'app-confirmar',
  imports: [Modal, Boton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-modal [abierto]="abierto()" [titulo]="titulo()" (cerrar)="cancelar.emit()">
      <p class="text-sm text-pizarra-600">{{ mensaje() }}</p>
      <div class="mt-6 flex justify-end gap-2">
        <button appBoton variante="secundario" type="button" (click)="cancelar.emit()">Cancelar</button>
        <button appBoton variante="peligro" type="button" (click)="confirmar.emit()">{{ textoConfirmar() }}</button>
      </div>
    </app-modal>
  `,
})
export class Confirmar {
  readonly abierto = input(false);
  readonly titulo = input('Confirmar');
  readonly mensaje = input('¿Seguro que quieres continuar?');
  readonly textoConfirmar = input('Eliminar');
  readonly confirmar = output<void>();
  readonly cancelar = output<void>();
}
