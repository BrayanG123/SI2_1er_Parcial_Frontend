import { Routes } from '@angular/router';

export const CATALOG_ROUTES: Routes = [
  { path: '', loadComponent: () => import('./pages/catalog-page/catalog-page').then((component) => component.CatalogPage) },
  { path: ':id', loadComponent: () => import('./pages/product-detail-page/product-detail-page').then((component) => component.ProductDetailPage) },
];
