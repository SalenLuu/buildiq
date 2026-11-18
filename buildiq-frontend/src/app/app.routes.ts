import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'inicio' },
  {
    path: 'inicio',
    title: 'Inicio · BuildIQ',
    loadComponent: () => import('./pages/inicio/inicio').then((m) => m.InicioPage),
  },
  {
    path: 'materiales',
    title: 'Materiales · BuildIQ',
    loadComponent: () => import('./pages/materiales/materiales').then((m) => m.MaterialesPage),
  },
  {
    path: 'categorias',
    title: 'Categorías · BuildIQ',
    loadComponent: () => import('./pages/categorias/categorias').then((m) => m.CategoriasPage),
  },
  {
    path: 'proveedores',
    title: 'Proveedores · BuildIQ',
    loadComponent: () => import('./pages/proveedores/proveedores').then((m) => m.ProveedoresPage),
  },
  {
    path: 'obras',
    title: 'Obras · BuildIQ',
    loadComponent: () => import('./pages/obras/obras').then((m) => m.ObrasPage),
  },
  {
    path: 'movimientos',
    title: 'Movimientos · BuildIQ',
    loadComponent: () => import('./pages/movimientos/movimientos').then((m) => m.MovimientosPage),
  },
  {
    path: 'stock',
    title: 'Stock por obra · BuildIQ',
    loadComponent: () => import('./pages/stock/stock').then((m) => m.StockPage),
  },
  {
    path: 'informes',
    title: 'Informes · BuildIQ',
    loadComponent: () => import('./pages/informes/informes').then((m) => m.InformesPage),
  },
  { path: '**', redirectTo: 'inicio' },
];
