import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import {
  MaterialService,
  MovimientoService,
  ObraService,
  StockService,
} from '../../core/services/entidades.service';
import { Material, Movimiento, Obra, StockObra } from '../../models';
import { Aviso } from '../../shared/ui/aviso';
import { EncabezadoPagina } from '../../shared/ui/encabezado-pagina';
import { Tabla, Columna } from '../../shared/ui/tabla';
import { Tarjeta } from '../../shared/ui/tarjeta';

/** Resumen general: contadores, alertas de stock bajo y últimos movimientos. */
@Component({
  selector: 'app-inicio',
  imports: [RouterLink, EncabezadoPagina, Tarjeta, Tabla, Aviso],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-encabezado-pagina titulo="Inicio" subtitulo="Resumen del inventario en tus obras." />

    @if (error()) {
      <div class="mb-4"><app-aviso tipo="error">{{ error() }}</app-aviso></div>
    }

    <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      <app-tarjeta>
        <p class="text-sm text-pizarra-500">Total de materiales</p>
        <p class="mt-1 text-4xl font-extrabold text-pizarra-900">{{ materiales().length }}</p>
        <a routerLink="/materiales" class="mt-2 inline-block text-sm font-semibold text-brand-700 hover:underline">
          Ver materiales →
        </a>
      </app-tarjeta>

      <app-tarjeta>
        <p class="text-sm text-pizarra-500">Obras activas</p>
        <p class="mt-1 text-4xl font-extrabold text-pizarra-900">{{ obrasActivas() }}</p>
        <a routerLink="/obras" class="mt-2 inline-block text-sm font-semibold text-brand-700 hover:underline">
          Ver obras →
        </a>
      </app-tarjeta>

      <app-tarjeta [class]="alertas().length ? 'sm:col-span-2 xl:col-span-1' : ''">
        <p class="text-sm text-pizarra-500">Materiales con stock bajo</p>
        <p [class]="'mt-1 text-4xl font-extrabold ' + (alertas().length ? 'text-red-600' : 'text-emerald-600')">
          {{ alertas().length }}
        </p>
        <a routerLink="/stock" class="mt-2 inline-block text-sm font-semibold text-brand-700 hover:underline">
          Ver stock por obra →
        </a>
      </app-tarjeta>
    </div>

    @if (alertas().length) {
      <div class="mt-6">
        <app-aviso tipo="alerta">
          <p class="mb-1 font-semibold">Atención: reponer estos materiales</p>
          <ul class="list-inside list-disc">
            @for (a of alertas(); track a.idObra + '-' + a.idMaterial) {
              <li>
                {{ a.materialNombre }} en {{ a.obraNombre }}: quedan {{ a.cantidad }} {{ a.unidadMedida }} (mínimo
                {{ a.stockMinimo }}).
              </li>
            }
          </ul>
        </app-aviso>
      </div>
    }

    <h2 class="mb-3 mt-8 text-lg font-bold text-pizarra-900">Últimos movimientos</h2>
    <app-tabla [columnas]="columnas" [filas]="ultimos()" vacio="Aún no hay movimientos registrados." />
  `,
})
export class InicioPage implements OnInit {
  private readonly materialService = inject(MaterialService);
  private readonly obraService = inject(ObraService);
  private readonly stockService = inject(StockService);
  private readonly movimientoService = inject(MovimientoService);

  protected readonly materiales = signal<Material[]>([]);
  protected readonly obras = signal<Obra[]>([]);
  protected readonly stock = signal<StockObra[]>([]);
  protected readonly movimientos = signal<Movimiento[]>([]);
  protected readonly error = signal<string | null>(null);

  protected readonly obrasActivas = computed(() => this.obras().filter((o) => o.estado === 'EN_EJECUCION').length);
  // Alerta: la cantidad en una obra está por debajo del stock mínimo del material.
  protected readonly alertas = computed(() => this.stock().filter((s) => s.cantidad < s.stockMinimo));
  protected readonly ultimos = computed(() => this.movimientos().slice(0, 5));

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
    { clave: 'responsable', etiqueta: 'Responsable' },
  ];

  ngOnInit(): void {
    forkJoin({
      materiales: this.materialService.listar(),
      obras: this.obraService.listar(),
      stock: this.stockService.consultar(),
      movimientos: this.movimientoService.consultar(),
    }).subscribe({
      next: (r) => {
        this.materiales.set(r.materiales);
        this.obras.set(r.obras);
        this.stock.set(r.stock);
        this.movimientos.set(r.movimientos);
      },
      error: () => this.error.set('No se pudo cargar el resumen. ¿Está encendido el backend?'),
    });
  }
}
