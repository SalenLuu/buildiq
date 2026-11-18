import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProveedorService } from '../../core/services/entidades.service';
import { Proveedor } from '../../models';
import { PaginaCrud } from '../../shared/pagina-crud';
import { CampoFormulario } from '../../shared/ui/campo-formulario';
import { Columna } from '../../shared/ui/tabla';
import { VistaCrud } from '../../shared/ui/vista-crud';

@Component({
  selector: 'app-proveedores',
  imports: [ReactiveFormsModule, VistaCrud, CampoFormulario],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-vista-crud
      titulo="Proveedores"
      subtitulo="Quienes nos venden los materiales."
      etiquetaNuevo="Nuevo proveedor"
      placeholderBusqueda="Buscar por nombre, NIT o correo…"
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
        <div class="grid gap-4 sm:grid-cols-2">
          <app-campo etiqueta="NIT" [obligatorio]="true" [control]="form.controls.nit">
            <input class="app-input" formControlName="nit" maxlength="20" placeholder="900123456-1" />
          </app-campo>
          <app-campo etiqueta="Teléfono" [control]="form.controls.telefono">
            <input class="app-input" formControlName="telefono" maxlength="20" inputmode="tel" />
          </app-campo>
        </div>
        <app-campo etiqueta="Correo" [control]="form.controls.correo">
          <input class="app-input" type="email" formControlName="correo" maxlength="100" />
        </app-campo>
        <app-campo etiqueta="Dirección" [control]="form.controls.direccion">
          <input class="app-input" formControlName="direccion" maxlength="150" />
        </app-campo>
        <label class="flex items-center gap-2 text-sm text-pizarra-700">
          <input type="checkbox" formControlName="activo" class="size-4 accent-brand-500" />
          Proveedor activo
        </label>
      </form>
    </app-vista-crud>
  `,
})
export class ProveedoresPage extends PaginaCrud<Proveedor> {
  protected readonly servicio = inject(ProveedorService);
  protected readonly nombreSingular = 'proveedor';

  protected readonly form = new FormGroup({
    nombre: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(100)] }),
    nit: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(20)] }),
    telefono: new FormControl('', { nonNullable: true, validators: [Validators.maxLength(20)] }),
    correo: new FormControl('', { nonNullable: true, validators: [Validators.email, Validators.maxLength(100)] }),
    direccion: new FormControl('', { nonNullable: true, validators: [Validators.maxLength(150)] }),
    activo: new FormControl(true, { nonNullable: true }),
  });

  protected readonly columnas: Columna[] = [
    { clave: 'nombre', etiqueta: 'Nombre' },
    { clave: 'nit', etiqueta: 'NIT' },
    { clave: 'telefono', etiqueta: 'Teléfono' },
    { clave: 'correo', etiqueta: 'Correo' },
    { clave: 'activo', etiqueta: 'Activo', tipo: 'booleano' },
  ];

  protected idDe = (f: Proveedor) => f.idProveedor;
  protected textoBusqueda = (f: Proveedor) => `${f.nombre} ${f.nit} ${f.correo ?? ''} ${f.telefono ?? ''}`;
  protected valorVacio = () => ({ nombre: '', nit: '', telefono: '', correo: '', direccion: '', activo: true });
  protected descripcion = (f: Proveedor) => f.nombre;
}
