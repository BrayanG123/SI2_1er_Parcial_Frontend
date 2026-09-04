import { Routes } from '@angular/router';

export const REPORT_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/reports-dashboard-page/reports-dashboard-page').then(
        (component) => component.ReportsDashboardPage,
      ),
  },
];
