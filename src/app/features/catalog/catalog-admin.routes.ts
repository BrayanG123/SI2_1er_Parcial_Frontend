import { Routes } from '@angular/router';

export const CATALOG_ADMIN_ROUTES: Routes = [{ path: '', loadComponent: () => import('./pages/catalog-admin-page/catalog-admin-page').then((component) => component.CatalogAdminPage) }];
