import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { API_URL } from '../../../core/config/api-url.token';
import { ReturnsService } from './returns.service';

describe('ReturnsService', () => {
  let service: ReturnsService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(), provideHttpClientTesting(),
        { provide: API_URL, useValue: 'http://api.test/api/v1' },
      ],
    });
    service = TestBed.inject(ReturnsService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('creates a partial return with quantities and reasons', () => {
    const payload = {
      pedido_id: 'order-1', motivo_general: 'Talla incorrecta',
      detalles: [{ detalle_pedido_id: 'detail-1', cantidad: 1, motivo: 'Grande' }],
    };
    service.create(payload).subscribe();
    const request = http.expectOne('http://api.test/api/v1/returns');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(payload);
    request.flush({});
  });

  it('loads customer history and cancels one requested return', () => {
    service.listMine(2, 10).subscribe();
    const list = http.expectOne((request) => request.url === 'http://api.test/api/v1/returns/mine');
    expect(list.request.params.get('page')).toBe('2');
    expect(list.request.params.get('page_size')).toBe('10');
    list.flush({ items: [], page: 2, page_size: 10, total: 0 });

    service.cancel('return-1').subscribe();
    const cancel = http.expectOne('http://api.test/api/v1/returns/return-1/cancel');
    expect(cancel.request.method).toBe('POST');
    cancel.flush({});
  });

  it('filters the operational inbox by branch and state', () => {
    service.listManage(1, 20, { branch_id: 'branch-1', state: 'SOLICITADA' }).subscribe();
    const request = http.expectOne((candidate) => candidate.url === 'http://api.test/api/v1/returns/manage');
    expect(request.request.params.get('branch_id')).toBe('branch-1');
    expect(request.request.params.get('state')).toBe('SOLICITADA');
    request.flush({ items: [], page: 1, page_size: 20, total: 0 });
  });

  it('sends explicit inventory and refund decisions when completing', () => {
    service.transition('return-1', 'COMPLETADA', {
      reingresar_stock: false, generar_reembolso: true,
    }).subscribe();
    const request = http.expectOne('http://api.test/api/v1/returns/manage/return-1/status');
    expect(request.request.method).toBe('PATCH');
    expect(request.request.body).toEqual({
      estado: 'COMPLETADA', reingresar_stock: false, generar_reembolso: true,
    });
    request.flush({});
  });
});
