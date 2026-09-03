import { Routes } from '@angular/router';

export const RESERVATION_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/my-reservations-page/my-reservations-page').then(
        (component) => component.MyReservationsPage,
      ),
  },
  {
    path: 'nueva',
    loadComponent: () =>
      import('./pages/reservation-create-page/reservation-create-page').then(
        (component) => component.ReservationCreatePage,
      ),
  },
];

export const BRANCH_RESERVATION_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./pages/branch-reservations-page/branch-reservations-page').then(
        (component) => component.BranchReservationsPage,
      ),
  },
];
