import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { API_URL } from '../../../core/config/api-url.token';
import { BranchesAdminService } from './branches-admin.service';

describe('BranchesAdminService', () => {
  let service: BranchesAdminService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_URL, useValue: 'http://api.test/api/v1' },
      ],
    });
    service = TestBed.inject(BranchesAdminService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpTesting.verify());

  it('sends city pagination and search parameters', () => {
    service.listCities(2, 10, 'Cruz').subscribe();
    const request = httpTesting.expectOne(
      (candidate) => candidate.url === 'http://api.test/api/v1/cities',
    );
    expect(request.request.params.get('page')).toBe('2');
    expect(request.request.params.get('page_size')).toBe('10');
    expect(request.request.params.get('q')).toBe('Cruz');
    request.flush({ items: [], page: 2, page_size: 10, total: 0 });
  });

  it('updates only the requested branch fields', () => {
    service.updateBranch('branch-1', { activa: false }).subscribe();
    const request = httpTesting.expectOne('http://api.test/api/v1/branches/branch-1');
    expect(request.request.method).toBe('PATCH');
    expect(request.request.body).toEqual({ activa: false });
    request.flush({});
  });
});
