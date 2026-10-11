import { Routes } from '@angular/router';

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
    loadComponent: () =>
      import('./features/appointments/appointments-page').then((m) => m.AppointmentsPage),
    title: 'نوبتیفا | نوبت‌های من',
  },
  {
    path: 'profile/cars',
    loadComponent: () => import('./features/cars/cars-page').then((m) => m.CarsPage),
    title: 'نوبتیفا | خودروهای من',
  },
  {
    path: 'profile/invoice/:id',
    loadComponent: () => import('./features/invoice/invoice-page').then((m) => m.InvoicePage),
    title: 'نوبتیفا | فاکتور',
  },
  { path: '**', redirectTo: '' },
];
