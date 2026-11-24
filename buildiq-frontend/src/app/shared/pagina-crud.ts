import { HttpErrorResponse } from '@angular/common/http';
import { computed, Directive, OnInit, signal } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Observable } from 'rxjs';
import { CrudService } from '../core/services/crud.service';

// Lógica común de las pantallas CRUD: listar, buscar, crear, editar y borrar.
@Directive()
export abstract class PaginaCrud<T extends object> implements OnInit {
  protected abstract readonly servicio: CrudService<T>;
  protected abstract readonly form: FormGroup;
  protected abstract readonly nombreSingular: string;
  protected abstract idDe(fila: T): number;
  protected abstract textoBusqueda(fila: T): string;
  // Valores iniciales del formulario.
  protected abstract valorVacio(): Record<string, unknown>;
  // Texto para el mensaje de borrado.
  protected abstract descripcion(fila: T): string;

  protected readonly filas = signal<T[]>([]);
  protected readonly busqueda = signal('');
  protected readonly cargando = signal(true);
  protected readonly error = signal<string | null>(null);

  protected readonly modalAbierto = signal(false);
  protected readonly editando = signal<T | null>(null);
  protected readonly guardando = signal(false);
  protected readonly errorModal = signal<string | null>(null);
  protected readonly porBorrar = signal<T | null>(null);

  protected readonly visibles = computed(() => {
    const q = this.busqueda().trim().toLowerCase();
    return q ? this.filas().filter((f) => this.textoBusqueda(f).toLowerCase().includes(q)) : this.filas();
  });

  protected readonly tituloModal = computed(() =>
    this.editando() ? `Editar ${this.nombreSingular}` : `Nuevo ${this.nombreSingular}`,
  );

  protected readonly mensajeBorrar = computed(() => {
    const fila = this.porBorrar();
    return fila ? `¿Eliminar ${this.nombreSingular} "${this.descripcion(fila)}"? Esta acción no se puede deshacer.` : null;
  });

  ngOnInit(): void {
    this.cargar();
  }

  protected cargar(): void {
    this.cargando.set(true);
    this.servicio.listar().subscribe({
      next: (datos) => {
        this.filas.set(datos);
        this.cargando.set(false);
      },
      error: (e) => {
        this.error.set(this.mensajeDe(e, 'No se pudo cargar la información.'));
        this.cargando.set(false);
      },
    });
  }

  protected nuevo(): void {
    this.editando.set(null);
    this.errorModal.set(null);
    this.form.reset(this.valorVacio());
    this.modalAbierto.set(true);
  }

  protected editar(fila: T): void {
    this.editando.set(fila);
    this.errorModal.set(null);
    this.form.reset({ ...this.valorVacio(), ...fila });
    this.modalAbierto.set(true);
  }

  protected cerrarModal(): void {
    this.modalAbierto.set(false);
  }

  protected guardar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    // Los campos vacíos se envían como null.
    const crudo = this.form.getRawValue() as Record<string, unknown>;
    const dato = Object.fromEntries(
      Object.entries(crudo).map(([k, v]) => [k, typeof v === 'string' && v.trim() === '' ? null : v]),
    ) as Partial<T>;

    const actual = this.editando();
    const peticion: Observable<T> = actual
      ? this.servicio.actualizar(this.idDe(actual), dato)
      : this.servicio.crear(dato);

    this.guardando.set(true);
    this.errorModal.set(null);
    peticion.subscribe({
      next: () => {
        this.guardando.set(false);
        this.modalAbierto.set(false);
        this.cargar();
      },
      error: (e) => {
        this.guardando.set(false);
        this.errorModal.set(this.mensajeDe(e, 'No se pudo guardar.'));
      },
    });
  }

  protected pedirBorrar(fila: T): void {
    this.error.set(null);
    this.porBorrar.set(fila);
  }

  protected cancelarBorrado(): void {
    this.porBorrar.set(null);
  }

  protected confirmarBorrado(): void {
    const fila = this.porBorrar();
    if (!fila) return;
    this.porBorrar.set(null);
    this.servicio.eliminar(this.idDe(fila)).subscribe({
      next: () => this.cargar(),
      error: (e) => this.error.set(this.mensajeDe(e, 'No se pudo eliminar.')),
    });
  }

  protected mensajeDe(e: unknown, porDefecto: string): string {
    if (e instanceof HttpErrorResponse) {
      if (e.status === 0) return 'Error de conexión con el servidor.';
      return e.error?.message ?? porDefecto;
    }
    return porDefecto;
  }
}
