import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { API_URL } from '../../../core/config/api-url.token';
import { PaymentsService } from './payments.service';

describe('PaymentsService', () => {
  let service: PaymentsService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(), provideHttpClientTesting(),
        { provide: API_URL, useValue: 'http://api.test/api/v1' },
      ],
    });
    service = TestBed.inject(PaymentsService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('loads the optional payment associated with an order', () => {
    service.getByOrder('order-1').subscribe();
    const request = http.expectOne('http://api.test/api/v1/payments/orders/order-1');
    expect(request.request.method).toBe('GET');
    request.flush(null);
  });

  it('initiates payment without sending an amount or sensitive information', () => {
    service.initiate('order-1').subscribe();
    const request = http.expectOne('http://api.test/api/v1/payments/orders/order-1');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toBeNull();
    request.flush({});
  });

  it('only sends the selected test outcome when confirming', () => {
    service.confirm('payment-1', 'RECHAZAR').subscribe();
    const request = http.expectOne('http://api.test/api/v1/payments/payment-1/confirm');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual({ resultado_prueba: 'RECHAZAR' });
    request.flush({});
  });
});
