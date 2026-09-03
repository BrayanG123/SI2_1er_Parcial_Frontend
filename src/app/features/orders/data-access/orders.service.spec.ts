import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { API_URL } from '../../../core/config/api-url.token';
import { OrdersService } from './orders.service';

describe('OrdersService', () => {
  let service: OrdersService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_URL, useValue: 'http://api.test/api/v1' },
      ],
    });
    service = TestBed.inject(OrdersService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('checks out the cart through the unified WEB order contract', () => {
    service.checkoutCart('branch-1').subscribe();
    const request = http.expectOne('http://api.test/api/v1/orders/checkout');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({ sucursal_id: 'branch-1', canal: 'WEB' });
    request.flush({});
  });

  it('converts selected reservation quantities into an order', () => {
    const details = [{ variante_id: 'variant-1', cantidad: 2 }];
    service.checkoutReservation('reservation-1', details).subscribe();
    const request = http.expectOne(
      'http://api.test/api/v1/orders/from-reservation/reservation-1',
    );
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({ canal: 'WEB', detalles: details });
    request.flush({});
  });

  it('loads the customer history and filters the operational history', () => {
    service.listMine(2, 10).subscribe();
    const mine = http.expectOne(
      (candidate) => candidate.url === 'http://api.test/api/v1/orders/mine',
    );
    expect(mine.request.params.get('page')).toBe('2');
    expect(mine.request.params.get('page_size')).toBe('10');
    mine.flush({ items: [], page: 2, page_size: 10, total: 0 });

    service.listManage(1, 20, {
      branch_id: 'branch-1', channel: 'POS', state: 'COMPLETADO', date_from: '2026-09-01',
    }).subscribe();
    const manage = http.expectOne(
      (candidate) => candidate.url === 'http://api.test/api/v1/orders/manage',
    );
    expect(manage.request.params.get('branch_id')).toBe('branch-1');
    expect(manage.request.params.get('channel')).toBe('POS');
    expect(manage.request.params.get('state')).toBe('COMPLETADO');
    expect(manage.request.params.get('date_from')).toBe('2026-09-01');
    manage.flush({ items: [], page: 1, page_size: 20, total: 0 });
  });

  it('loads one customer order for payment or return', () => {
    service.getMine('order-1').subscribe();
    const request = http.expectOne('http://api.test/api/v1/orders/mine/order-1');
    expect(request.request.method).toBe('GET');
    request.flush({});
  });

  it('searches saleable POS inventory by normalized SKU and branch', () => {
    service.searchPosVariants('  pol-m  ', 'branch-1').subscribe();
    const request = http.expectOne(
      (candidate) => candidate.url === 'http://api.test/api/v1/orders/pos/variants',
    );
    expect(request.request.method).toBe('GET');
    expect(request.request.params.get('sku')).toBe('pol-m');
    expect(request.request.params.get('branch_id')).toBe('branch-1');
    request.flush([]);
  });

  it('creates a POS order with an optional customer', () => {
    const payload = {
      sucursal_id: 'branch-1',
      cliente_id: null,
      detalles: [{ variante_id: 'variant-1', cantidad: 1 }],
    };
    service.createPos(payload).subscribe();
    const request = http.expectOne('http://api.test/api/v1/orders/pos');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(payload);
    request.flush({});
  });
});
