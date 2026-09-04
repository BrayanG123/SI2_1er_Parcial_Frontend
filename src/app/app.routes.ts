import { Routes } from '@angular/router';

import { authGuard } from './core/auth/auth.guard';
import { roleGuard } from './core/auth/role.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./layouts/storefront-layout/storefront-layout').then(
        (component) => component.StorefrontLayout,
      ),
    children: [
      {
        path: '',
        title: 'Inicio | Tienda de ropa',
        loadComponent: () =>
          import('./features/home/pages/home-page/home-page').then(
            (component) => component.HomePage,
          ),
      },
      {
        path: 'auth/login',
        title: 'Iniciar sesión | Tienda de ropa',
        loadComponent: () =>
          import('./features/auth/pages/login-page/login-page').then(
            (component) => component.LoginPage,
          ),
      },
      {
        path: 'auth/registro',
        title: 'Crear cuenta | Tienda de ropa',
        loadComponent: () =>
          import('./features/auth/pages/register-page/register-page').then(
            (component) => component.RegisterPage,
          ),
      },
      {
        path: 'perfil',
        title: 'Mi perfil | Tienda de ropa',
        canActivate: [authGuard],
        loadComponent: () =>
          import('./features/users/pages/profile-page/profile-page').then(
            (component) => component.ProfilePage,
          ),
      },
      {
        path: 'catalogo',
        title: 'Catálogo | Tienda de ropa',
        loadChildren: () =>
          import('./features/catalog/catalog.routes').then((routes) => routes.CATALOG_ROUTES),
      },
      {
        path: 'carrito',
        title: 'Carrito | Tienda de ropa',
        canActivate: [authGuard, roleGuard],
        data: { roles: ['cliente'] },
        loadChildren: () =>
          import('./features/cart/cart.routes').then((routes) => routes.CART_ROUTES),
      },
      {
        path: 'pedidos',
        title: 'Mis pedidos | Tienda de ropa',
        canActivate: [authGuard, roleGuard],
        data: { roles: ['cliente'] },
        loadChildren: () =>
          import('./features/orders/orders.routes').then(
            (routes) => routes.CUSTOMER_ORDER_ROUTES,
          ),
      },
      {
        path: 'reservas',
        title: 'Mis reservas | Tienda de ropa',
        canActivate: [authGuard, roleGuard],
        data: { roles: ['cliente'] },
        loadChildren: () =>
          import('./features/reservations/reservations.routes').then(
            (routes) => routes.RESERVATION_ROUTES,
          ),
      },
      {
        path: 'devoluciones',
        title: 'Mis devoluciones | Tienda de ropa',
        canActivate: [authGuard, roleGuard],
        data: { roles: ['cliente'] },
        loadChildren: () =>
          import('./features/returns/returns.routes').then(
            (routes) => routes.CUSTOMER_RETURN_ROUTES,
          ),
      },
    ],
  },
  {
    path: 'admin',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['administrador'] },
    loadComponent: () =>
      import('./layouts/admin-layout/admin-layout').then(
        (component) => component.AdminLayout,
      ),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'usuarios' },
      {
        path: 'usuarios',
        title: 'Administrar usuarios | Tienda de ropa',
        loadComponent: () =>
          import('./features/users/pages/users-admin-page/users-admin-page').then(
            (component) => component.UsersAdminPage,
          ),
      },
      {
        path: 'roles',
        title: 'Administrar roles | Tienda de ropa',
        loadComponent: () =>
          import('./features/users/pages/roles-admin-page/roles-admin-page').then(
            (component) => component.RolesAdminPage,
          ),
      },
      {
        path: 'sucursales',
        title: 'Ciudades y sucursales | Tienda de ropa',
        loadChildren: () =>
          import('./features/branches/branches.routes').then((routes) => routes.BRANCHES_ROUTES),
      },
      {
        path: 'categorias',
        title: 'Categorías | Tienda de ropa',
        loadChildren: () =>
          import('./features/categories/categories.routes').then(
            (routes) => routes.CATEGORIES_ROUTES,
          ),
      },
      {
        path: 'proveedores',
        title: 'Proveedores | Tienda de ropa',
        loadChildren: () =>
          import('./features/suppliers/suppliers.routes').then(
            (routes) => routes.SUPPLIERS_ROUTES,
          ),
      },
      {
        path: 'catalogo',
        title: 'Administrar catálogo | Tienda de ropa',
        loadChildren: () =>
          import('./features/catalog/catalog-admin.routes').then(
            (routes) => routes.CATALOG_ADMIN_ROUTES,
          ),
      },
    ],
  },
  {
    path: 'inventario',
    title: 'Inventario | Tienda de ropa',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['administrador', 'encargado', 'cajero'] },
    loadComponent: () =>
      import('./layouts/admin-layout/admin-layout').then(
        (component) => component.AdminLayout,
      ),
    children: [
      {
        path: '',
        loadChildren: () =>
          import('./features/inventory/inventory.routes').then(
            (routes) => routes.INVENTORY_ROUTES,
          ),
      },
    ],
  },
  {
    path: 'reservas/sucursal',
    title: 'Reservas de sucursal | Tienda de ropa',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['administrador', 'encargado'] },
    loadComponent: () =>
      import('./layouts/admin-layout/admin-layout').then(
        (component) => component.AdminLayout,
      ),
    children: [
      {
        path: '',
        loadChildren: () =>
          import('./features/reservations/reservations.routes').then(
            (routes) => routes.BRANCH_RESERVATION_ROUTES,
          ),
      },
    ],
  },
  {
    path: 'pedidos/gestion',
    title: 'Gestión de pedidos | Tienda de ropa',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['administrador', 'encargado', 'cajero'] },
    loadComponent: () =>
      import('./layouts/admin-layout/admin-layout').then(
        (component) => component.AdminLayout,
      ),
    children: [
      {
        path: '',
        loadChildren: () =>
          import('./features/orders/orders.routes').then(
            (routes) => routes.MANAGE_ORDER_ROUTES,
          ),
      },
    ],
  },
  {
    path: 'pos',
    title: 'Punto de venta | Tienda de ropa',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['administrador', 'cajero'] },
    loadComponent: () =>
      import('./layouts/admin-layout/admin-layout').then(
        (component) => component.AdminLayout,
      ),
    children: [
      {
        path: '',
        loadChildren: () =>
          import('./features/orders/orders.routes').then((routes) => routes.POS_ROUTES),
      },
    ],
  },
  {
    path: 'devoluciones/gestion',
    title: 'Gestión de devoluciones | Tienda de ropa',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['administrador', 'encargado'] },
    loadComponent: () =>
      import('./layouts/admin-layout/admin-layout').then(
        (component) => component.AdminLayout,
      ),
    children: [
      {
        path: '',
        loadChildren: () =>
          import('./features/returns/returns.routes').then(
            (routes) => routes.MANAGE_RETURN_ROUTES,
          ),
      },
    ],
  },
  {
    path: 'reportes',
    title: 'Reportes y dashboard | Tienda de ropa',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['administrador', 'encargado'] },
    loadComponent: () =>
      import('./layouts/admin-layout/admin-layout').then(
        (component) => component.AdminLayout,
      ),
    children: [
      {
        path: '',
        loadChildren: () =>
          import('./features/reports/reports.routes').then(
            (routes) => routes.REPORT_ROUTES,
          ),
      },
    ],
  },
  {
    path: '**',
    title: 'Página no encontrada | Tienda de ropa',
    loadComponent: () =>
      import('./features/not-found/not-found-page').then(
        (component) => component.NotFoundPage,
      ),
  },
];
