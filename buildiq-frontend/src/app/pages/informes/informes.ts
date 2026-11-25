import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { ObraService } from '../../core/services/entidades.service';
import { Obra } from '../../models';
import { Boton } from '../../shared/ui/boton';
import { CampoFormulario } from '../../shared/ui/campo-formulario';
import { EncabezadoPagina } from '../../shared/ui/encabezado-pagina';
import { Tarjeta } from '../../shared/ui/tarjeta';

// Filtros de los informes. El PDF todavía no está hecho.
@Component({
  selector: 'app-informes',
  imports: [ReactiveFormsModule, EncabezadoPagina, Tarjeta, CampoFormulario, Boton],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-encabezado-pagina titulo="Informes" subtitulo="Elige qué informe quieres y con qué filtros." />

    <app-tarjeta titulo="Filtros del informe">
      <form [formGroup]="form" class="grid gap-4 sm:grid-cols-2">
        <app-campo etiqueta="Tipo de informe">
          <select class="app-input" formControlName="tipo">
            <option value="stock">Stock actual por obra</option>
            <option value="movimientos">Historial de movimientos</option>
            <option value="stockBajo">Materiales con stock bajo</option>
          </select>
        </app-campo>
        <app-campo etiqueta="Obra">
          <select class="app-input" formControlName="idObra">
            <option [ngValue]="null">Todas las obras</option>
            @for (o of obras(); track o.idObra) {
              <option [ngValue]="o.idObra">{{ o.nombre }}</option>
            }
          </select>
        </app-campo>
        <app-campo etiqueta="Desde">
          <input class="app-input" type="date" formControlName="desde" />
        </app-campo>
        <app-campo etiqueta="Hasta">
          <input class="app-input" type="date" formControlName="hasta" />
        </app-campo>
      </form>

      <div class="mt-6 flex flex-wrap items-center gap-3">
        <button appBoton type="button" disabled title="Todavía no disponible">
          Generar PDF
        </button>
        <span class="text-sm text-pizarra-500">La generación del PDF estará disponible próximamente.</span>
      </div>
    </app-tarjeta>
  `,
})
export class InformesPage implements OnInit {
  private readonly obraService = inject(ObraService);
  protected readonly obras = signal<Obra[]>([]);

  protected readonly form = new FormGroup({
    tipo: new FormControl('stock', { nonNullable: true }),
    idObra: new FormControl<number | null>(null),
    desde: new FormControl(''),
    hasta: new FormControl(''),
  });

  ngOnInit(): void {
    this.obraService.listar().subscribe((o) => this.obras.set(o));
  }
}
