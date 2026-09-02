import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { API_URL } from '../../../../core/config/api-url.token';
import { apiErrorInterceptor } from '../../../../core/http/api-error.interceptor';
import { HomePage } from './home-page';

describe('HomePage', () => {
  let httpTesting: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HomePage],
      providers: [
        provideHttpClient(withInterceptors([apiErrorInterceptor])),
        provideHttpClientTesting(),
        { provide: API_URL, useValue: 'http://api.test/api/v1' },
      ],
    }).compileComponents();

    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => httpTesting.verify());

  it('shows FastAPI and PostgreSQL as available', () => {
    const fixture = TestBed.createComponent(HomePage);
    fixture.detectChanges();

    httpTesting.expectOne('http://api.test/api/v1/health').flush({
      status: 'ok',
      environment: 'test',
      services: { api: 'ok', database: 'ok' },
    });
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain(
      'Angular, FastAPI y PostgreSQL están comunicándose correctamente.',
    );
  });

  it('distinguishes an available API from a pending database', () => {
    const fixture = TestBed.createComponent(HomePage);
    fixture.detectChanges();

    httpTesting.expectOne('http://api.test/api/v1/health').flush(
      {
        error: {
          code: 'database_unavailable',
          message: 'La API está disponible, pero no puede conectarse a PostgreSQL.',
          details: { api: 'ok', database: 'unavailable' },
        },
      },
      { status: 503, statusText: 'Service Unavailable' },
    );
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain(
      'FastAPI está disponible. Crea PostgreSQL y revisa DATABASE_URL',
    );
  });
});
