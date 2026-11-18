import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CategoriaService } from '../../core/services/entidades.service';
import { Categoria } from '../../models';
import { PaginaCrud } from '../../shared/pagina-crud';
import { CampoFormulario } from '../../shared/ui/campo-formulario';
import { Columna } from '../../shared/ui/tabla';
import { VistaCrud } from '../../shared/ui/vista-crud';

@Component({
  selector: 'app-categorias',
  imports: [ReactiveFormsModule, VistaCrud, CampoFormulario],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-vista-crud
      titulo="Categorías"
      subtitulo="Agrupan los materiales (cementantes, acero, agregados...)."
      etiquetaNuevo="Nueva categoría"
      placeholderBusqueda="Buscar por nombre o descripción…"
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
          <input class="app-input" formControlName="nombre" maxlength="60" />
        </app-campo>
        <app-campo etiqueta="Descripción" [control]="form.controls.descripcion">
          <textarea class="app-input" rows="3" formControlName="descripcion" maxlength="200"></textarea>
        </app-campo>
      </form>
    </app-vista-crud>
  `,
})
export class CategoriasPage extends PaginaCrud<Categoria> {
  protected readonly servicio = inject(CategoriaService);
  protected readonly nombreSingular = 'categoría';

  protected readonly form = new FormGroup({
    nombre: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(60)] }),
    descripcion: new FormControl('', { nonNullable: true, validators: [Validators.maxLength(200)] }),
  });

  protected readonly columnas: Columna[] = [
    { clave: 'idCategoria', etiqueta: 'ID' },
    { clave: 'nombre', etiqueta: 'Nombre' },
    { clave: 'descripcion', etiqueta: 'Descripción' },
  ];

  protected idDe = (f: Categoria) => f.idCategoria;
  protected textoBusqueda = (f: Categoria) => `${f.nombre} ${f.descripcion ?? ''}`;
  protected valorVacio = () => ({ nombre: '', descripcion: '' });
  protected descripcion = (f: Categoria) => f.nombre;
}
