import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { API_URL } from '../config/api-url.token';
import { User } from './auth.models';
import { AuthService } from './auth.service';

const user: User = {
  id: 'user-1',
  email: 'cliente@example.com',
  nombres: 'Ana',
  apellidos: 'Pérez',
  telefono: null,
  activo: true,
  sucursal_id: null,
  creado_en: '2026-09-01T00:00:00Z',
  roles: [{ id: 'role-1', nombre: 'cliente', descripcion: null }],
  perfil_cliente: null,
};

describe('AuthService', () => {
  let service: AuthService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_URL, useValue: 'http://api.test/api/v1' },
      ],
    });
    service = TestBed.inject(AuthService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
    sessionStorage.clear();
  });

  it('stores the token and authenticated user after login', () => {
    service.login({ email: user.email, password: 'ClaveSegura123' }).subscribe();

    httpTesting.expectOne('http://api.test/api/v1/auth/login').flush({
      access_token: 'jwt-token',
      token_type: 'bearer',
      user,
    });

    expect(service.isAuthenticated()).toBe(true);
    expect(service.user()?.email).toBe(user.email);
    expect(service.token()).toBe('jwt-token');
  });

  it('clears all local session state on logout', () => {
    sessionStorage.setItem('ropa_access_token', 'jwt-token');

    service.logout();

    expect(service.isAuthenticated()).toBe(false);
    expect(service.token()).toBeNull();
  });
});
