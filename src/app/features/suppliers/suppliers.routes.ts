import { Routes } from '@angular/router';

export const SUPPLIERS_ROUTES: Routes = [{
  path: '',
  loadComponent: () => import('./pages/suppliers-admin-page/suppliers-admin-page').then((component) => component.SuppliersAdminPage),
}];
