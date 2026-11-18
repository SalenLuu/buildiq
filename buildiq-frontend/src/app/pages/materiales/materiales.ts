import { ChangeDetectionStrategy, Component, inject, OnInit, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CategoriaService, MaterialService } from '../../core/services/entidades.service';
import { Categoria, Material } from '../../models';
import { PaginaCrud } from '../../shared/pagina-crud';
import { CampoFormulario } from '../../shared/ui/campo-formulario';
import { Columna } from '../../shared/ui/tabla';
import { VistaCrud } from '../../shared/ui/vista-crud';

@Component({
  selector: 'app-materiales',
  imports: [ReactiveFormsModule, VistaCrud, CampoFormulario],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-vista-crud
      titulo="Materiales"
      subtitulo="Catálogo de materiales y herramientas con su stock mínimo y precio."
      etiquetaNuevo="Nuevo material"
      placeholderBusqueda="Buscar por código, nombre o categoría…"
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
        <div class="grid gap-4 sm:grid-cols-2">
          <app-campo etiqueta="Código" [obligatorio]="true" [control]="form.controls.codigo">
            <input class="app-input" formControlName="codigo" maxlength="20" placeholder="CEM-001" />
          </app-campo>
          <app-campo etiqueta="Unidad de medida" [obligatorio]="true" [control]="form.controls.unidadMedida">
            <input class="app-input" formControlName="unidadMedida" maxlength="15" placeholder="bulto, m3, unidad…" />
          </app-campo>
        </div>
        <app-campo etiqueta="Nombre" [obligatorio]="true" [control]="form.controls.nombre">
          <input class="app-input" formControlName="nombre" maxlength="100" />
        </app-campo>
        <app-campo etiqueta="Descripción" [control]="form.controls.descripcion">
          <input class="app-input" formControlName="descripcion" maxlength="200" />
        </app-campo>
        <app-campo etiqueta="Categoría" [obligatorio]="true" [control]="form.controls.idCategoria">
          <select class="app-input" formControlName="idCategoria">
            <option [ngValue]="null" disabled>Selecciona una categoría…</option>
            @for (c of categorias(); track c.idCategoria) {
              <option [ngValue]="c.idCategoria">{{ c.nombre }}</option>
            }
          </select>
        </app-campo>
        <div class="grid gap-4 sm:grid-cols-2">
          <app-campo etiqueta="Stock mínimo" [obligatorio]="true" [control]="form.controls.stockMinimo">
            <input class="app-input" type="number" min="0" step="0.01" formControlName="stockMinimo" />
          </app-campo>
          <app-campo etiqueta="Precio unitario (COP)" [obligatorio]="true" [control]="form.controls.precioUnitario">
            <input class="app-input" type="number" min="0" step="0.01" formControlName="precioUnitario" />
          </app-campo>
        </div>
        <label class="flex items-center gap-2 text-sm text-pizarra-700">
          <input type="checkbox" formControlName="activo" class="size-4 accent-brand-500" />
          Material activo
        </label>
      </form>
    </app-vista-crud>
  `,
})
export class MaterialesPage extends PaginaCrud<Material> implements OnInit {
  protected readonly servicio = inject(MaterialService);
  private readonly categoriaService = inject(CategoriaService);
  protected readonly nombreSingular = 'material';
  protected readonly categorias = signal<Categoria[]>([]);

  protected readonly form = new FormGroup({
    codigo: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(20)] }),
    nombre: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(100)] }),
    descripcion: new FormControl('', { nonNullable: true, validators: [Validators.maxLength(200)] }),
    idCategoria: new FormControl<number | null>(null, { validators: [Validators.required] }),
    unidadMedida: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(15)] }),
    stockMinimo: new FormControl(0, { nonNullable: true, validators: [Validators.required, Validators.min(0)] }),
    precioUnitario: new FormControl(0, { nonNullable: true, validators: [Validators.required, Validators.min(0)] }),
    activo: new FormControl(true, { nonNullable: true }),
  });

  protected readonly columnas: Columna[] = [
    { clave: 'codigo', etiqueta: 'Código' },
    { clave: 'nombre', etiqueta: 'Nombre' },
    { clave: 'categoriaNombre', etiqueta: 'Categoría' },
    { clave: 'unidadMedida', etiqueta: 'Unidad' },
    { clave: 'stockMinimo', etiqueta: 'Stock mín.', tipo: 'numero' },
    { clave: 'precioUnitario', etiqueta: 'Precio', tipo: 'moneda' },
    { clave: 'activo', etiqueta: 'Activo', tipo: 'booleano' },
  ];

  override ngOnInit(): void {
    super.ngOnInit();
    // El selector de categoría necesita la lista de categorías.
    this.categoriaService.listar().subscribe((c) => this.categorias.set(c));
  }

  protected idDe = (f: Material) => f.idMaterial;
  protected textoBusqueda = (f: Material) => `${f.codigo} ${f.nombre} ${f.categoriaNombre ?? ''} ${f.descripcion ?? ''}`;
  protected valorVacio = () => ({
    codigo: '',
    nombre: '',
    descripcion: '',
    idCategoria: null,
    unidadMedida: '',
    stockMinimo: 0,
    precioUnitario: 0,
    activo: true,
  });
  protected descripcion = (f: Material) => `${f.codigo} · ${f.nombre}`;
}
