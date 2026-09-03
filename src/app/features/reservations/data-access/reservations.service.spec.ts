import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { API_URL } from '../../../core/config/api-url.token';
import { ReservationsService } from './reservations.service';

describe('ReservationsService', () => {
  let service: ReservationsService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_URL, useValue: 'http://api.test/api/v1' },
      ],
    });
    service = TestBed.inject(ReservationsService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('creates one reservation with several garments from one branch', () => {
    const payload = {
      sucursal_id: 'branch-1',
      fecha_visita: '2026-09-10',
      hora_aproximada: '16:30',
      detalles: [
        { variante_id: 'variant-1', cantidad: 2 },
        { variante_id: 'variant-2', cantidad: 1 },
      ],
    };
    service.create(payload).subscribe();
    const request = http.expectOne('http://api.test/api/v1/reservations');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(payload);
    request.flush({});
  });

  it('loads the customer reservation history', () => {
    service.listMine(2, 10).subscribe();
    const request = http.expectOne(
      (candidate) => candidate.url === 'http://api.test/api/v1/reservations/mine',
    );
    expect(request.request.params.get('page')).toBe('2');
    expect(request.request.params.get('page_size')).toBe('10');
    request.flush({ items: [], page: 2, page_size: 10, total: 0 });
  });

  it('filters the branch inbox and sends state transitions', () => {
    service.listBranch(1, 20, { state: 'PENDIENTE', visit_from: '2026-09-10' }).subscribe();
    const listRequest = http.expectOne(
      (candidate) => candidate.url === 'http://api.test/api/v1/reservations/branch',
    );
    expect(listRequest.request.params.get('state')).toBe('PENDIENTE');
    expect(listRequest.request.params.get('visit_from')).toBe('2026-09-10');
    listRequest.flush({ items: [], page: 1, page_size: 20, total: 0 });

    service.transition('reservation-1', 'CONFIRMADA').subscribe();
    const transition = http.expectOne(
      'http://api.test/api/v1/reservations/branch/reservation-1/status',
    );
    expect(transition.request.method).toBe('PATCH');
    expect(transition.request.body).toEqual({ estado: 'CONFIRMADA' });
    transition.flush({});
  });

  it('cancels through the shared customer and staff endpoint', () => {
    service.cancel('reservation-1').subscribe();
    const request = http.expectOne(
      'http://api.test/api/v1/reservations/reservation-1/cancel',
    );
    expect(request.request.method).toBe('POST');
    request.flush({});
  });
});
