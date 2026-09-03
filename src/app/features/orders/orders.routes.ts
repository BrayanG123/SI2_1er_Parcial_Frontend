import { Routes } from '@angular/router';

export const CUSTOMER_ORDER_ROUTES: Routes = [
  {
    path: ':id/pago',
    loadComponent: () =>
      import('../payments/pages/payment-page/payment-page').then(
        (component) => component.PaymentPage,
      ),
  },
  {
    path: ':id/devolucion',
    loadComponent: () =>
      import('../returns/pages/return-create-page/return-create-page').then(
        (component) => component.ReturnCreatePage,
      ),
  },
  {
    path: '',
    loadComponent: () =>
      import('./pages/my-orders-page/my-orders-page').then(
        (component) => component.MyOrdersPage,
      ),
  },
];

export const MANAGE_ORDER_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/orders-admin-page/orders-admin-page').then(
        (component) => component.OrdersAdminPage,
      ),
  },
];

export const POS_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/pos-page/pos-page').then((component) => component.PosPage),
  },
];
