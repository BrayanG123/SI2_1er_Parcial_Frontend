import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { API_URL } from '../../../core/config/api-url.token';
import { InventoryService } from './inventory.service';

describe('InventoryService', () => {
  let service: InventoryService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_URL, useValue: 'http://api.test/api/v1' },
      ],
    });
    service = TestBed.inject(InventoryService);
    http = TestBed.inject(HttpTestingController);
  });

  afterEach(() => http.verify());

  it('sends pagination and consolidated stock filters', () => {
    service
      .list(2, 20, {
        city_id: 'city-1',
        branch_id: 'branch-1',
        product_id: 'product-1',
        variant_id: 'variant-1',
        state: 'BAJO',
      })
      .subscribe();
    const request = http.expectOne(
      (candidate) => candidate.url === 'http://api.test/api/v1/inventory',
    );
    expect(request.request.params.get('page')).toBe('2');
    expect(request.request.params.get('city_id')).toBe('city-1');
    expect(request.request.params.get('branch_id')).toBe('branch-1');
    expect(request.request.params.get('product_id')).toBe('product-1');
    expect(request.request.params.get('variant_id')).toBe('variant-1');
    expect(request.request.params.get('state')).toBe('BAJO');
    request.flush({ items: [], page: 2, page_size: 20, total: 0 });
  });

  it('registers receipts through the inventory authority endpoint', () => {
    const payload = {
      sucursal_id: 'branch-1',
      variante_id: 'variant-1',
      cantidad: 12,
      observacion: 'Proveedor local',
    };
    service.receive(payload).subscribe();
    const request = http.expectOne('http://api.test/api/v1/inventory/receipts');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(payload);
    request.flush({});
  });

  it('loads the immutable movement history for one stock record', () => {
    service.movements('inventory-1').subscribe();
    const request = http.expectOne(
      (candidate) =>
        candidate.url === 'http://api.test/api/v1/inventory/inventory-1/movements',
    );
    expect(request.request.method).toBe('GET');
    expect(request.request.params.get('page_size')).toBe('50');
    request.flush({ items: [], page: 1, page_size: 50, total: 0 });
  });
});
