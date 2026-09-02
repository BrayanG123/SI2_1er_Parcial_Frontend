import { Component, computed, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';

import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-admin-layout',
  imports: [RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './admin-layout.html',
})
export class AdminLayout {
  protected readonly auth = inject(AuthService);
  protected readonly isAdmin = computed(() => this.auth.hasAnyRole(['administrador']));
  protected readonly roleLabel = computed(() => {
    const roles = this.auth.roles();
    if (roles.includes('administrador')) return 'Administrador';
    if (roles.includes('encargado')) return 'Encargado de sucursal';
    if (roles.includes('cajero')) return 'Cajero';
    return 'Usuario';
  });
  private readonly router = inject(Router);

  protected logout(): void {
    this.auth.logout();
    void this.router.navigate(['/']);
  }
}
