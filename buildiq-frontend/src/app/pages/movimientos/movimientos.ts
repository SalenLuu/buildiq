import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { AbstractControl, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import {
  MaterialService,
  MovimientoService,
  ObraService,
  ProveedorService,
  StockService,
} from '../../core/services/entidades.service';
import { Material, Movimiento, Obra, Proveedor, StockObra, TipoMovimiento } from '../../models';
import { Aviso } from '../../shared/ui/aviso';
import { Boton } from '../../shared/ui/boton';
import { CampoFormulario } from '../../shared/ui/campo-formulario';
import { EncabezadoPagina } from '../../shared/ui/encabezado-pagina';
import { Columna, Tabla } from '../../shared/ui/tabla';
import { Tarjeta } from '../../shared/ui/tarjeta';

// Registro de entradas y salidas, e historial con filtros.
@Component({
  selector: 'app-movimientos',
  imports: [ReactiveFormsModule, EncabezadoPagina, Tarjeta, CampoFormulario, Boton, Aviso, Tabla],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-encabezado-pagina titulo="Movimientos" subtitulo="Registra entradas y salidas de material y consulta el historial." />

    <app-tarjeta titulo="Registrar movimiento">
      @if (exito()) {
        <div class="mb-4"><app-aviso tipo="exito">{{ exito() }}</app-aviso></div>
      }
      @if (errorRegistro()) {
        <div class="mb-4"><app-aviso tipo="error">{{ errorRegistro() }}</app-aviso></div>
      }

      <form [formGroup]="form" (ngSubmit)="registrar()" novalidate>
        <!-- Selector de tipo: entrada o salida -->
        <div class="mb-4 inline-flex rounded-lg border border-pizarra-200 p-1" role="group" aria-label="Tipo de movimiento">
          @for (t of tipos; track t.valor) {
            <button
              type="button"
              [class]="
                'rounded-md px-4 py-1.5 text-sm font-semibold transition-colors ' +
                (form.controls.tipo.value === t.valor ? t.activo : 'text-pizarra-600 hover:bg-pizarra-100')
              "
              [attr.aria-pressed]="form.controls.tipo.value === t.valor"
              (click)="form.controls.tipo.setValue(t.valor)"
            >
              {{ t.etiqueta }}
            </button>
          }
        </div>

        <div class="grid gap-4 sm:grid-cols-2">
          <app-campo etiqueta="Obra" [obligatorio]="true" [control]="form.controls.idObra">
            <select class="app-input" formControlName="idObra">
              <option [ngValue]="null" disabled>Selecciona una obra…</option>
              @for (o of obras(); track o.idObra) {
                <option [ngValue]="o.idObra">{{ o.nombre }}</option>
              }
            </select>
          </app-campo>
          <app-campo etiqueta="Material" [obligatorio]="true" [control]="form.controls.idMaterial">
            <select class="app-input" formControlName="idMaterial">
              <option [ngValue]="null" disabled>Selecciona un material…</option>
              @for (m of materiales(); track m.idMaterial) {
                <option [ngValue]="m.idMaterial">{{ m.codigo }} · {{ m.nombre }}</option>
              }
            </select>
          </app-campo>

          <div>
            <app-campo etiqueta="Cantidad" [obligatorio]="true" [control]="form.controls.cantidad">
              <input class="app-input" type="number" min="0.01" step="0.01" formControlName="cantidad" />
            </app-campo>
            @if (form.controls.idObra.value && form.controls.idMaterial.value) {
              <p class="mt-1 text-xs text-pizarra-500">
                Disponible en esta obra: <strong>{{ disponible() }}</strong> {{ unidadSeleccionada() }}
              </p>
            }
          </div>

          @if (esEntrada()) {
            <app-campo etiqueta="Proveedor" [control]="form.controls.idProveedor">
              <select class="app-input" formControlName="idProveedor">
                <option [ngValue]="null">Sin proveedor</option>
                @for (p of proveedores(); track p.idProveedor) {
                  <option [ngValue]="p.idProveedor">{{ p.nombre }}</option>
                }
              </select>
            </app-campo>
          }

          <app-campo etiqueta="Responsable" [obligatorio]="true" [control]="form.controls.responsable">
            <input class="app-input" formControlName="responsable" maxlength="80" placeholder="Quién recibe o entrega" />
          </app-campo>
          <app-campo etiqueta="Observación" [control]="form.controls.observacion">
            <input class="app-input" formControlName="observacion" maxlength="250" />
          </app-campo>
        </div>

        <div class="mt-6 flex justify-end">
          <button appBoton type="submit" [disabled]="registrando()">
            {{ registrando() ? 'Registrando…' : 'Registrar ' + (esEntrada() ? 'entrada' : 'salida') }}
          </button>
        </div>
      </form>
    </app-tarjeta>

    <h2 class="mb-3 mt-8 text-lg font-bold text-pizarra-900">Historial</h2>

    <form [formGroup]="filtros" class="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-5" aria-label="Filtros del historial">
      <select class="app-input" formControlName="idObra" aria-label="Filtrar por obra">
        <option [ngValue]="null">Todas las obras</option>
        @for (o of obras(); track o.idObra) {
          <option [ngValue]="o.idObra">{{ o.nombre }}</option>
        }
      </select>
      <select class="app-input" formControlName="idMaterial" aria-label="Filtrar por material">
        <option [ngValue]="null">Todos los materiales</option>
        @for (m of materiales(); track m.idMaterial) {
          <option [ngValue]="m.idMaterial">{{ m.nombre }}</option>
        }
      </select>
      <select class="app-input" formControlName="tipo" aria-label="Filtrar por tipo">
        <option value="">Todos los tipos</option>
        <option value="ENTRADA">Entrada</option>
        <option value="SALIDA">Salida</option>
        <option value="AJUSTE">Ajuste</option>
      </select>
      <input class="app-input" type="date" formControlName="desde" aria-label="Desde" title="Desde" />
      <input class="app-input" type="date" formControlName="hasta" aria-label="Hasta" title="Hasta" />
    </form>

    <app-tabla [columnas]="columnas" [filas]="historial()" vacio="No hay movimientos con esos filtros." />
  `,
})
export class MovimientosPage implements OnInit {
  private readonly movimientoService = inject(MovimientoService);
  private readonly obraService = inject(ObraService);
  private readonly materialService = inject(MaterialService);
  private readonly proveedorService = inject(ProveedorService);
  private readonly stockService = inject(StockService);

  protected readonly obras = signal<Obra[]>([]);
  protected readonly materiales = signal<Material[]>([]);
  protected readonly proveedores = signal<Proveedor[]>([]);
  protected readonly stock = signal<StockObra[]>([]);
  protected readonly historial = signal<Movimiento[]>([]);

  protected readonly exito = signal<string | null>(null);
  protected readonly errorRegistro = signal<string | null>(null);
  protected readonly registrando = signal(false);

  protected readonly tipos: { valor: TipoMovimiento; etiqueta: string; activo: string }[] = [
    { valor: 'ENTRADA', etiqueta: 'Entrada', activo: 'bg-emerald-500 text-white' },
    { valor: 'SALIDA', etiqueta: 'Salida', activo: 'bg-red-600 text-white' },
  ];

  protected readonly form = new FormGroup({
    tipo: new FormControl<TipoMovimiento>('ENTRADA', { nonNullable: true }),
    idObra: new FormControl<number | null>(null, { validators: [Validators.required] }),
    idMaterial: new FormControl<number | null>(null, { validators: [Validators.required] }),
    idProveedor: new FormControl<number | null>(null),
    cantidad: new FormControl<number | null>(null, {
      validators: [Validators.required, Validators.min(0.01), (c) => this.validarStock(c)],
    }),
    responsable: new FormControl('', { nonNullable: true, validators: [Validators.required, Validators.maxLength(80)] }),
    observacion: new FormControl('', { nonNullable: true, validators: [Validators.maxLength(250)] }),
  });

  protected readonly filtros = new FormGroup({
    idObra: new FormControl<number | null>(null),
    idMaterial: new FormControl<number | null>(null),
    tipo: new FormControl<TipoMovimiento | ''>('', { nonNullable: true }),
    desde: new FormControl(''),
    hasta: new FormControl(''),
  });

  // Valores del formulario como señal para recalcular el disponible.
  private readonly valor = toSignal(this.form.valueChanges, { initialValue: this.form.getRawValue() });

  protected readonly esEntrada = computed(() => this.valor().tipo === 'ENTRADA');

  protected readonly disponible = computed(() => {
    const { idObra, idMaterial } = this.valor();
    return this.stock().find((s) => s.idObra === idObra && s.idMaterial === idMaterial)?.cantidad ?? 0;
  });

  protected readonly unidadSeleccionada = computed(
    () => this.materiales().find((m) => m.idMaterial === this.valor().idMaterial)?.unidadMedida ?? '',
  );

  protected readonly columnas: Columna[] = [
    { clave: 'fecha', etiqueta: 'Fecha', tipo: 'fechaHora' },
    { clave: 'obraNombre', etiqueta: 'Obra' },
    { clave: 'materialNombre', etiqueta: 'Material' },
    {
      clave: 'tipo',
      etiqueta: 'Tipo',
      tipo: 'insignia',
      tono: (v) => (v === 'ENTRADA' ? 'exito' : v === 'SALIDA' ? 'peligro' : 'info'),
      texto: (v) => (v === 'ENTRADA' ? 'Entrada' : v === 'SALIDA' ? 'Salida' : 'Ajuste'),
    },
    { clave: 'cantidad', etiqueta: 'Cantidad', tipo: 'numero' },
    { clave: 'unidadMedida', etiqueta: 'Unidad' },
    { clave: 'proveedorNombre', etiqueta: 'Proveedor' },
    { clave: 'responsable', etiqueta: 'Responsable' },
    { clave: 'observacion', etiqueta: 'Observación' },
  ];

  constructor() {
    // Al cambiar tipo, obra o material se vuelve a validar la cantidad.
    this.form.valueChanges.subscribe(() => this.form.controls.cantidad.updateValueAndValidity({ emitEvent: false }));
    // Cada cambio de filtro vuelve a pedir el historial.
    this.filtros.valueChanges.subscribe(() => this.cargarHistorial());
  }

  ngOnInit(): void {
    this.obraService.listar().subscribe((o) => this.obras.set(o));
    this.materialService.listar().subscribe((m) => this.materiales.set(m));
    this.proveedorService.listar().subscribe((p) => this.proveedores.set(p));
    this.cargarStock();
    this.cargarHistorial();
  }

  // Una salida no puede superar el stock disponible.
  private validarStock(control: AbstractControl): ValidationErrors | null {
    const form = control.parent;
    if (!form || form.get('tipo')?.value !== 'SALIDA') return null;
    const cantidad = Number(control.value);
    if (!cantidad) return null;
    const idObra = form.get('idObra')?.value;
    const idMaterial = form.get('idMaterial')?.value;
    const disponible = this.stock().find((s) => s.idObra === idObra && s.idMaterial === idMaterial)?.cantidad ?? 0;
    return cantidad > disponible
      ? { superaStock: `La salida (${cantidad}) supera el stock disponible (${disponible}).` }
      : null;
  }

  protected registrar(): void {
    this.exito.set(null);
    this.errorRegistro.set(null);
    this.form.controls.cantidad.updateValueAndValidity();
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const v = this.form.getRawValue();
    this.registrando.set(true);
    this.movimientoService
      .registrar({
        idObra: v.idObra!,
        idMaterial: v.idMaterial!,
        idProveedor: v.tipo === 'ENTRADA' ? v.idProveedor : null,
        tipo: v.tipo,
        cantidad: Number(v.cantidad),
        responsable: v.responsable,
        observacion: v.observacion.trim() || null,
      })
      .subscribe({
        next: () => {
          this.registrando.set(false);
          this.exito.set(v.tipo === 'ENTRADA' ? 'Entrada registrada correctamente.' : 'Salida registrada correctamente.');
          this.form.patchValue({ idMaterial: null, idProveedor: null, cantidad: null, observacion: '' });
          this.form.markAsUntouched();
          this.cargarStock();
          this.cargarHistorial();
        },
        error: (e: unknown) => {
          this.registrando.set(false);
          this.errorRegistro.set(
            e instanceof HttpErrorResponse && e.status !== 0
              ? (e.error?.message ?? 'No se pudo registrar el movimiento.')
              : 'Error de conexión con el servidor.',
          );
        },
      });
  }

  private cargarStock(): void {
    this.stockService.consultar().subscribe((s) => this.stock.set(s));
  }

  private cargarHistorial(): void {
    const f = this.filtros.getRawValue();
    this.movimientoService
      .consultar({ idObra: f.idObra, idMaterial: f.idMaterial, tipo: f.tipo, desde: f.desde, hasta: f.hasta })
      .subscribe((m) => this.historial.set(m));
  }
}
