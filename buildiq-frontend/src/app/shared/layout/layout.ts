import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

interface ItemMenu {
  ruta: string;
  etiqueta: string;
  icono: string;
}

/**
 * Estructura común de la app: menú lateral en pantallas grandes y barra superior con
 * botón de menú en móviles. Las páginas se pintan dentro de <router-outlet>.
 */
@Component({
  selector: 'app-layout',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="min-h-screen lg:flex">
      <header class="flex items-center justify-between bg-pizarra-900 px-4 py-3 text-white lg:hidden">
        <a routerLink="/inicio" class="text-lg font-extrabold tracking-tight">
          Build<span class="text-brand-400">IQ</span>
        </a>
        <button
          type="button"
          class="rounded-lg p-2 hover:bg-pizarra-800"
          [attr.aria-expanded]="menuAbierto()"
          aria-controls="menu-principal"
          aria-label="Abrir menú"
          (click)="menuAbierto.set(!menuAbierto())"
        >
          ☰
        </button>
      </header>

      <!-- Menú lateral -->
      <nav
        id="menu-principal"
        class="bg-pizarra-900 text-pizarra-200 lg:sticky lg:top-0 lg:block lg:h-screen lg:w-64 lg:shrink-0"
        [class.hidden]="!menuAbierto()"
        aria-label="Navegación principal"
      >
        <div class="hidden px-6 py-6 lg:block">
          <a routerLink="/inicio" class="text-2xl font-extrabold tracking-tight text-white">
            Build<span class="text-brand-400">IQ</span>
          </a>
          <p class="mt-1 text-xs text-pizarra-400">Inventario en obra</p>
        </div>
        <ul class="space-y-1 px-3 pb-4 pt-2 lg:pt-0">
          @for (item of items; track item.ruta) {
            <li>
              <a
                [routerLink]="item.ruta"
                routerLinkActive="bg-brand-500 !text-pizarra-950"
                class="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-pizarra-200 transition-colors hover:bg-pizarra-800"
                (click)="menuAbierto.set(false)"
              >
                <span aria-hidden="true" class="w-5 text-center">{{ item.icono }}</span>
                {{ item.etiqueta }}
              </a>
            </li>
          }
        </ul>
      </nav>

      <main class="min-w-0 flex-1 px-4 py-6 sm:px-8 lg:py-8">
        <div class="mx-auto max-w-6xl">
          <router-outlet />
        </div>
      </main>
    </div>
  `,
})
export class Layout {
  protected readonly menuAbierto = signal(false);

  protected readonly items: ItemMenu[] = [
    { ruta: '/inicio', etiqueta: 'Inicio', icono: '⌂' },
    { ruta: '/materiales', etiqueta: 'Materiales', icono: '▦' },
    { ruta: '/categorias', etiqueta: 'Categorías', icono: '☷' },
    { ruta: '/proveedores', etiqueta: 'Proveedores', icono: '⚑' },
    { ruta: '/obras', etiqueta: 'Obras', icono: '▣' },
    { ruta: '/movimientos', etiqueta: 'Movimientos', icono: '⇄' },
    { ruta: '/stock', etiqueta: 'Stock por obra', icono: '▤' },
    { ruta: '/informes', etiqueta: 'Informes', icono: '⎙' },
  ];
}
