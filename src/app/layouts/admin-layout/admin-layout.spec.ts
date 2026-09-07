import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { AuthService } from '../../core/auth/auth.service';
import { AdminLayout } from './admin-layout';

describe('AdminLayout', () => {
  it('collapses on desktop and opens an expanded mobile menu', () => {
    const auth = {
      user: signal({ nombres: 'Ada', apellidos: 'Admin' }),
      roles: signal(['administrador']),
      hasAnyRole: vi.fn(() => true),
      logout: vi.fn(),
    };
    TestBed.configureTestingModule({
      imports: [AdminLayout],
      providers: [
        provideRouter([]),
        { provide: AuthService, useValue: auth },
      ],
    });
    const fixture = TestBed.createComponent(AdminLayout);
    const layout = fixture.componentInstance as any;
    fixture.detectChanges();

    expect(layout.sidebarCollapsed()).toBe(false);
    layout.toggleSidebar();
    expect(layout.sidebarCollapsed()).toBe(true);

    layout.openMobileSidebar();
    expect(layout.mobileSidebarOpen()).toBe(true);
    expect(layout.sidebarCollapsed()).toBe(false);
  });
});
