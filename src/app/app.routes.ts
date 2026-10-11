import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    loadComponent: () => import('./features/home/home-page').then((m) => m.HomePage),
    title: 'نوبتیفا | صفحه اصلی',
  },
  {
    path: 'about',
    loadComponent: () => import('./features/about/about-page').then((m) => m.AboutPage),
    title: 'نوبتیفا | درباره ما',
  },
  {
    path: 'profile/appointments',
    canMatch: [authGuard],
    loadComponent: () =>
      import('./features/appointments/appointments-page').then((m) => m.AppointmentsPage),
    title: 'نوبتیفا | نوبت‌های من',
  },
  {
    path: 'profile/cars',
    canMatch: [authGuard],
    loadComponent: () => import('./features/cars/cars-page').then((m) => m.CarsPage),
    title: 'نوبتیفا | خودروهای من',
  },
  {
    path: 'profile/invoice/:id',
    canMatch: [authGuard],
    loadComponent: () => import('./features/invoice/invoice-page').then((m) => m.InvoicePage),
    title: 'نوبتیفا | فاکتور',
  },
  { path: '**', redirectTo: '' },
];
