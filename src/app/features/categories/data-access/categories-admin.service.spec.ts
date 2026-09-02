import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { API_URL } from '../../../core/config/api-url.token';
import { CategoriesAdminService } from './categories-admin.service';

describe('CategoriesAdminService', () => {
  let service: CategoriesAdminService;
  let http: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting(), { provide: API_URL, useValue: 'http://api.test/api/v1' }] });
    service = TestBed.inject(CategoriesAdminService);
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());

  it('sends pagination and search', () => {
    service.list(2, 10, 'vestidos').subscribe();
    const request = http.expectOne((candidate) => candidate.url.endsWith('/categories'));
    expect(request.request.params.get('page')).toBe('2');
    expect(request.request.params.get('q')).toBe('vestidos');
    request.flush({ items: [], page: 2, page_size: 10, total: 0 });
  });

  it('deactivates a category with PATCH', () => {
    service.update('category-1', { activa: false }).subscribe();
    const request = http.expectOne('http://api.test/api/v1/categories/category-1');
    expect(request.request.method).toBe('PATCH');
    expect(request.request.body).toEqual({ activa: false });
    request.flush({});
  });
});
