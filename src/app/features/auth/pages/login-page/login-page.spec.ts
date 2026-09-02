import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { AuthService } from '../../../../core/auth/auth.service';
import { API_URL } from '../../../../core/config/api-url.token';
import { LoginPage } from './login-page';

@Component({ template: '' })
class ProfileStub {}

describe('LoginPage', () => {
  it('submits valid credentials and starts a session', () => {
    TestBed.configureTestingModule({
      imports: [LoginPage],
      providers: [
        provideRouter([{ path: 'perfil', component: ProfileStub }]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: API_URL, useValue: 'http://api.test/api/v1' },
      ],
    });
    const fixture = TestBed.createComponent(LoginPage);
    const httpTesting = TestBed.inject(HttpTestingController);
    const auth = TestBed.inject(AuthService);
    fixture.detectChanges();

    const email = fixture.nativeElement.querySelector('[formControlName="email"]') as HTMLInputElement;
    const password = fixture.nativeElement.querySelector('[formControlName="password"]') as HTMLInputElement;
    email.value = 'cliente@example.com';
    email.dispatchEvent(new Event('input'));
    password.value = 'ClaveSegura123';
    password.dispatchEvent(new Event('input'));
    fixture.nativeElement.querySelector('form').dispatchEvent(new Event('submit'));

    httpTesting.expectOne('http://api.test/api/v1/auth/login').flush({
      access_token: 'jwt-token',
      token_type: 'bearer',
      user: {
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
      },
    });

    expect(auth.isAuthenticated()).toBe(true);
    httpTesting.verify();
  });
});
