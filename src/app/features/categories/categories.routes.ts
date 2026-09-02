import { Routes } from '@angular/router';

export const CATEGORIES_ROUTES: Routes = [{
  path: '',
  loadComponent: () => import('./pages/categories-admin-page/categories-admin-page').then((component) => component.CategoriesAdminPage),
}];
