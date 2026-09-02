import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRouteSnapshot, provideRouter, Router, RouterStateSnapshot, UrlTree } from '@angular/router';

import { authGuard } from './auth.guard';
import { roleGuard } from './role.guard';
import { AuthService } from './auth.service';

describe('authentication guards', () => {
  const authStub = {
    isAuthenticated: signal(false),
    hasAnyRole: vi.fn<(roles: readonly string[]) => boolean>(),
  };

  beforeEach(() => {
    authStub.isAuthenticated.set(false);
    authStub.hasAnyRole.mockReset();
    TestBed.configureTestingModule({
      providers: [provideRouter([]), { provide: AuthService, useValue: authStub }],
    });
  });

  it('redirects anonymous users to login preserving the destination', () => {
    const result = TestBed.runInInjectionContext(() =>
      authGuard({} as ActivatedRouteSnapshot, { url: '/perfil' } as RouterStateSnapshot),
    );
    const router = TestBed.inject(Router);

    expect(router.serializeUrl(result as UrlTree)).toBe('/auth/login?returnUrl=%2Fperfil');
  });

  it('rejects a user without the required role', () => {
    authStub.hasAnyRole.mockReturnValue(false);
    const route = { data: { roles: ['administrador'] } } as unknown as ActivatedRouteSnapshot;
    const result = TestBed.runInInjectionContext(() =>
      roleGuard(route, {} as RouterStateSnapshot),
    );
    const router = TestBed.inject(Router);

    expect(router.serializeUrl(result as UrlTree)).toBe('/?forbidden=true');
  });
});
