import { Routes } from '@angular/router';

export const BRANCHES_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/branches-admin-page/branches-admin-page').then(
        (component) => component.BranchesAdminPage,
      ),
  },
];
