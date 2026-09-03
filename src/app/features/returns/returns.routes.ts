import { Routes } from '@angular/router';

export const CUSTOMER_RETURN_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/my-returns-page/my-returns-page').then(
        (component) => component.MyReturnsPage,
      ),
  },
];

export const MANAGE_RETURN_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/returns-admin-page/returns-admin-page').then(
        (component) => component.ReturnsAdminPage,
      ),
  },
];
