import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { NotificationService } from '../../../../core/services/notification.service';
import { ReservationsService } from '../../data-access/reservations.service';
import { BranchReservationsPage } from './branch-reservations-page';

describe('BranchReservationsPage', () => {
  const reservation = { id: 'reservation-1', estado: 'PENDIENTE' };
  const service = { listBranch: vi.fn(), transition: vi.fn(), cancel: vi.fn() };
  const notifications = { confirm: vi.fn(() => Promise.resolve(true)) };

  beforeEach(() => {
    service.listBranch.mockReset();
    service.transition.mockReset();
    service.listBranch.mockReturnValue(
      of({ items: [reservation], page: 1, page_size: 100, total: 1 }),
    );
    service.transition.mockReturnValue(of({ ...reservation, estado: 'CONFIRMADA' }));
    TestBed.configureTestingModule({
      imports: [BranchReservationsPage],
      providers: [
        { provide: ReservationsService, useValue: service },
        { provide: NotificationService, useValue: notifications },
      ],
    });
  });

  it('loads the branch inbox with reproducible filters', () => {
    const fixture = TestBed.createComponent(BranchReservationsPage);
    const page = fixture.componentInstance as any;
    page.filters.setValue({ state: 'PENDIENTE', visit_from: '2026-09-10', visit_to: '' });
    page.applyFilters();
    expect(service.listBranch).toHaveBeenLastCalledWith(1, 100, {
      state: 'PENDIENTE', visit_from: '2026-09-10', visit_to: '',
    });
  });

  it('advances a reservation only to its next state', () => {
    const fixture = TestBed.createComponent(BranchReservationsPage);
    const page = fixture.componentInstance as any;
    page.transition(reservation);
    expect(service.transition).toHaveBeenCalledWith('reservation-1', 'CONFIRMADA');
  });
});
