import { ChangeDetectionStrategy, Component, computed, inject, OnInit, signal } from '@angular/core';
import { CategoriaService, ObraService, StockService } from '../../core/services/entidades.service';
import { Categoria, Obra, StockObra } from '../../models';
import { Aviso } from '../../shared/ui/aviso';
import { EncabezadoPagina } from '../../shared/ui/encabezado-pagina';
import { Columna, Tabla } from '../../shared/ui/tabla';

/** Stock actual por obra. Las filas bajo el mínimo se resaltan en ámbar. */
@Component({
  selector: 'app-stock',
  imports: [EncabezadoPagina, Tabla, Aviso],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-encabezado-pagina titulo="Stock por obra" subtitulo="Cantidad disponible de cada material en cada obra." />

    <div class="mb-4 grid gap-3 sm:grid-cols-3">
      <select class="app-input" aria-label="Filtrar por obra" (change)="cambiarObra($any($event.target).value)">
        <option value="">Todas las obras</option>
        @for (o of obras(); track o.idObra) {
          <option [value]="o.idObra">{{ o.nombre }}</option>
        }
      </select>
      <select class="app-input" aria-label="Filtrar por categoría" (change)="cambiarCategoria($any($event.target).value)">
        <option value="">Todas las categorías</option>
        @for (c of categorias(); track c.idCategoria) {
          <option [value]="c.idCategoria">{{ c.nombre }}</option>
        }
      </select>
      <input
        type="search"
        class="app-input"
        placeholder="Buscar material o código…"
        aria-label="Buscar"
        (input)="busqueda.set($any($event.target).value)"
      />
    </div>

    @if (error()) {
      <div class="mb-4"><app-aviso tipo="error">{{ error() }}</app-aviso></div>
    }

    @if (bajos() > 0) {
      <p class="mb-3 text-sm font-medium text-brand-800">
        {{ bajos() }} {{ bajos() === 1 ? 'material está' : 'materiales están' }} por debajo del stock mínimo.
      </p>
    }

    <app-tabla
      [columnas]="columnas"
      [filas]="visibles()"
      [claseFila]="resaltar"
      vacio="No hay stock registrado con esos filtros."
    />
  `,
})
export class StockPage implements OnInit {
  private readonly stockService = inject(StockService);
  private readonly obraService = inject(ObraService);
  private readonly categoriaService = inject(CategoriaService);

  protected readonly obras = signal<Obra[]>([]);
  protected readonly categorias = signal<Categoria[]>([]);
  protected readonly filas = signal<StockObra[]>([]);
  protected readonly busqueda = signal('');
  protected readonly error = signal<string | null>(null);

  private idObra: number | null = null;
  private idCategoria: number | null = null;

  protected readonly visibles = computed(() => {
    const q = this.busqueda().trim().toLowerCase();
    if (!q) return this.filas();
    return this.filas().filter((f) =>
      `${f.materialNombre} ${f.materialCodigo} ${f.obraNombre}`.toLowerCase().includes(q),
    );
  });

  protected readonly bajos = computed(() => this.visibles().filter((f) => f.cantidad < f.stockMinimo).length);

  protected readonly columnas: Columna[] = [
    { clave: 'obraNombre', etiqueta: 'Obra' },
    { clave: 'materialCodigo', etiqueta: 'Código' },
    { clave: 'materialNombre', etiqueta: 'Material' },
    { clave: 'categoriaNombre', etiqueta: 'Categoría' },
    { clave: 'cantidad', etiqueta: 'Cantidad', tipo: 'numero' },
    { clave: 'unidadMedida', etiqueta: 'Unidad' },
    { clave: 'stockMinimo', etiqueta: 'Mínimo', tipo: 'numero' },
  ];

  /** Fila bajo el mínimo = fondo ámbar y texto en negrita. */
  protected readonly resaltar = (f: StockObra): string =>
    f.cantidad < f.stockMinimo ? 'bg-brand-50 font-semibold' : '';

  ngOnInit(): void {
    this.obraService.listar().subscribe((o) => this.obras.set(o));
    this.categoriaService.listar().subscribe((c) => this.categorias.set(c));
    this.cargar();
  }

  protected cambiarObra(valor: string): void {
    this.idObra = valor ? Number(valor) : null;
    this.cargar();
  }

  protected cambiarCategoria(valor: string): void {
    this.idCategoria = valor ? Number(valor) : null;
    this.cargar();
  }

  private cargar(): void {
    this.stockService.consultar({ idObra: this.idObra, idCategoria: this.idCategoria }).subscribe({
      next: (datos) => {
        this.filas.set(datos);
        this.error.set(null);
      },
      error: () => this.error.set('No se pudo cargar el stock. ¿Está encendido el backend?'),
    });
  }
}
