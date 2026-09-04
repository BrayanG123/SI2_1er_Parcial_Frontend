import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { API_URL } from '../../../core/config/api-url.token';
import { ReportsService } from './reports.service';

describe('ReportsService', () => {
  let service: ReportsService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_URL, useValue: 'http://api.test/api/v1' },
      ],
    });
    service = TestBed.inject(ReportsService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('loads dashboard filters without sending empty values', () => {
    service.dashboard({ branch_id: 'branch-1', date_from: '2026-09-01', date_to: '' }).subscribe();
    const request = http.expectOne(
      (candidate) => candidate.url === 'http://api.test/api/v1/reports/dashboard',
    );
    expect(request.request.method).toBe('GET');
    expect(request.request.params.get('branch_id')).toBe('branch-1');
    expect(request.request.params.get('date_from')).toBe('2026-09-01');
    expect(request.request.params.has('date_to')).toBe(false);
    request.flush({});
  });

  it('uses dedicated controlled endpoints for each report', () => {
    service.sales().subscribe();
    http.expectOne('http://api.test/api/v1/reports/sales').flush({});
    service.inventory('branch-1').subscribe();
    const inventory = http.expectOne(
      (candidate) => candidate.url === 'http://api.test/api/v1/reports/inventory',
    );
    expect(inventory.request.params.get('branch_id')).toBe('branch-1');
    inventory.flush({});
    service.reservations().subscribe();
    http.expectOne('http://api.test/api/v1/reports/reservations').flush({});
    service.returns().subscribe();
    http.expectOne('http://api.test/api/v1/reports/returns').flush({});
  });
});
