import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { API_URL } from '../../../core/config/api-url.token';
import { CatalogService } from './catalog.service';

describe('CatalogService', () => {
  let service: CatalogService;
  let http: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting(), { provide: API_URL, useValue: 'http://api.test/api/v1' }] });
    service = TestBed.inject(CatalogService);
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());

  it('sends public catalog filters and pagination', () => {
    service.listPublicProducts(2, 12, { q: 'vestido', category_id: 'cat-1', size_id: 'size-1' }).subscribe();
    const request = http.expectOne((candidate) => candidate.url.endsWith('/catalog/products'));
    expect(request.request.params.get('page')).toBe('2');
    expect(request.request.params.get('q')).toBe('vestido');
    expect(request.request.params.get('category_id')).toBe('cat-1');
    expect(request.request.params.get('size_id')).toBe('size-1');
    request.flush({ items: [], page: 2, page_size: 12, total: 0 });
  });

  it('loads a public product detail without authentication-specific paths', () => {
    service.getPublicProduct('product-1').subscribe();
    const request = http.expectOne('http://api.test/api/v1/catalog/products/product-1');
    expect(request.request.method).toBe('GET');
    request.flush({});
  });

  it('loads public availability for a product by branch', () => {
    service.getPublicAvailability('product-1').subscribe();
    const request = http.expectOne(
      'http://api.test/api/v1/catalog/products/product-1/availability',
    );
    expect(request.request.method).toBe('GET');
    request.flush([]);
  });

  it('creates variants through the administrative endpoint', () => {
    const variant = { talla_id: 'size-1', color_id: 'color-1', sku: 'SKU-1', precio: null, activa: true };
    service.createVariant('product-1', variant).subscribe();
    const request = http.expectOne('http://api.test/api/v1/admin/catalog/products/product-1/variants');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(variant);
    request.flush({});
  });
});
