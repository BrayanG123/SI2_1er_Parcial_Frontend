import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { API_URL } from '../../../core/config/api-url.token';
import { SuppliersAdminService } from './suppliers-admin.service';

describe('SuppliersAdminService', () => {
  let service: SuppliersAdminService;
  let http: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting(), { provide: API_URL, useValue: 'http://api.test/api/v1' }] });
    service = TestBed.inject(SuppliersAdminService);
    http = TestBed.inject(HttpTestingController);
  });
  afterEach(() => http.verify());

  it('creates a basic generic supplier', () => {
    const data = { nombre: 'Textiles', nit: null, telefono: null, email: null, direccion: null, activo: true };
    service.create(data).subscribe();
    const request = http.expectOne('http://api.test/api/v1/suppliers');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(data);
    request.flush({});
  });

  it('deletes a supplier through its administrative endpoint', () => {
    service.delete('supplier-1').subscribe();
    const request = http.expectOne('http://api.test/api/v1/suppliers/supplier-1');
    expect(request.request.method).toBe('DELETE');
    request.flush(null);
  });
});
