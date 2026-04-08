import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', pathMatch: 'full', redirectTo: 'fondos' },
  {
    path: 'fondos',
    loadComponent: () => import('./features/funds/fund-list.page').then((m) => m.FundListPage),
    title: 'Fondos disponibles',
  },
  {
    path: 'fondos/:id',
    loadComponent: () => import('./features/funds/fund-detail.page').then((m) => m.FundDetailPage),
    title: 'Detalle del fondo',
  },
  {
    path: 'portafolio',
    loadComponent: () =>
      import('./features/portfolio/portfolio.page').then((m) => m.PortfolioPage),
    title: 'Mi portafolio',
  },
  {
    path: 'historial',
    loadComponent: () =>
      import('./features/transactions/transactions.page').then((m) => m.TransactionsPage),
    title: 'Historial de transacciones',
  },
  { path: '**', redirectTo: 'fondos' },
];
