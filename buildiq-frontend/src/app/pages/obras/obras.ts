import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, ValidatorFn, Validators } from '@angular/forms';
import { ObraService } from '../../core/services/entidades.service';
import { EstadoObra, Obra } from '../../models';
import { PaginaCrud } from '../../shared/pagina-crud';
import { CampoFormulario } from '../../shared/ui/campo-formulario';
import { ToneInsignia } from '../../shared/ui/insignia';
import { Columna } from '../../shared/ui/tabla';
import { VistaCrud } from '../../shared/ui/vista-crud';

export const ETIQUETA_ESTADO: Record<EstadoObra, string> = {
  PLANEADA: 'Planeada',
  EN_EJECUCION: 'En ejecución',
  PAUSADA: 'Pausada',
  FINALIZADA: 'Finalizada',
};

const TONO_ESTADO: Record<EstadoObra, ToneInsignia> = {
  PLANEADA: 'info',
  EN_EJECUCION: 'exito',
  PAUSADA: 'alerta',
  FINALIZADA: 'neutro',
};

// La fecha de fin no puede ser anterior a la de inicio.
const fechaFinPosterior: ValidatorFn = (control) => {
  const inicio = control.parent?.get('fechaInicio')?.value as string | undefined;
  const fin = control.value as string;
  return inicio && fin && fin < inicio ? { fechaFin: true } : null;
};

@Component({
  selector: 'app-obras',
  imports: [ReactiveFormsModule, VistaCrud, CampoFormulario],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-vista-crud
      titulo="Obras"
      subtitulo="Proyectos de construcción donde se controla el inventario."
      etiquetaNuevo="Nueva obra"
      placeholderBusqueda="Buscar por nombre o dirección…"
      [columnas]="columnas"
      [filas]="visibles()"
      [cargando]="cargando()"
      [error]="error()"
      [modalAbierto]="modalAbierto()"
      [tituloModal]="tituloModal()"
      [guardando]="guardando()"
      [errorModal]="errorModal()"
      [mensajeBorrar]="mensajeBorrar()"
      [(busqueda)]="busqueda"
      (nuevo)="nuevo()"
      (editar)="editar($event)"
      (eliminar)="pedirBorrar($event)"
      (cerrarModal)="cerrarModal()"
      (confirmarBorrado)="confirmarBorrado()"
      (cancelarBorrado)="cancelarBorrado()"
    >
      <form id="form-crud" [formGroup]="form" (ngSubmit)="guardar()" class="space-y-4" novalidate>
        <app-campo etiqueta="Nombre" [obligatorio]="true" [control]="form.controls.nombre">
          <input class="app-input" formControlName="nombre" maxlength="100" />
        </app-campo>
        <app-campo etiqueta="Dirección" [control]="form.controls.direccion">
          <input class="app-input" formControlName="direccion" maxlength="150" />
        </app-campo>
        <div class="grid gap-4 sm:grid-cols-2">
          <app-campo etiqueta="Fecha de inicio" [obligatorio]="true" [control]="form.controls.fechaInicio">
            <input class="app-input" type="date" formControlName="fechaInicio" />
          </app-campo>
          <app-campo etiqueta="Fecha de fin" [control]="form.controls.fechaFin">
            <input class="app-input" type="date" formControlName="fechaFin" />
          </app-campo>
        </div>
        <app-campo etiqueta="Estado" [obligatorio]="true" [control]="form.controls.estado">
          <select class="app-input" formControlName="estado">
            @for (e of estados; track e.valor) {
              <option [value]="e.valor">{{ e.etiqueta }}</option>
            }
          </select>
        </app-campo>
      </form>
    </app-vista-crud>
  `,
})
export class ObrasPage extends PaginaCrud<Obra> {
  protected readonly servicio = inject(ObraService);
  protected readonly nombreSingular = 'obra';

  protected readonly form = new FormGroup({
    nombre: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(100)] }),
    direccion: new FormControl('', { nonNullable: true, validators: [Validators.maxLength(150)] }),
    fechaInicio: new FormControl('', { nonNullable: true, validators: [Validators.required] }),
    fechaFin: new FormControl('', { nonNullable: true, validators: [fechaFinPosterior] }),
    estado: new FormControl<EstadoObra>('PLANEADA', { nonNullable: true, validators: [Validators.required] }),
  });

  protected readonly estados = (Object.keys(ETIQUETA_ESTADO) as EstadoObra[]).map((valor) => ({
    valor,
    etiqueta: ETIQUETA_ESTADO[valor],
  }));

  protected readonly columnas: Columna[] = [
    { clave: 'nombre', etiqueta: 'Nombre' },
    { clave: 'direccion', etiqueta: 'Dirección' },
    { clave: 'fechaInicio', etiqueta: 'Inicio', tipo: 'fecha' },
    { clave: 'fechaFin', etiqueta: 'Fin', tipo: 'fecha' },
    {
      clave: 'estado',
      etiqueta: 'Estado',
      tipo: 'insignia',
      tono: (v) => TONO_ESTADO[v as EstadoObra],
      texto: (v) => ETIQUETA_ESTADO[v as EstadoObra],
    },
  ];

  constructor() {
    super();
    // Si cambia la fecha de inicio, hay que volver a validar la de fin.
    this.form.controls.fechaInicio.valueChanges.subscribe(() => this.form.controls.fechaFin.updateValueAndValidity());
  }

  protected idDe = (f: Obra) => f.idObra;
  protected textoBusqueda = (f: Obra) => `${f.nombre} ${f.direccion ?? ''}`;
  protected valorVacio = () => ({ nombre: '', direccion: '', fechaInicio: '', fechaFin: '', estado: 'PLANEADA' });
  protected descripcion = (f: Obra) => f.nombre;
}
