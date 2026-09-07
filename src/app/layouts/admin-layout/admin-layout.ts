import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faAnglesLeft, faAnglesRight, faBars, faBoxesStacked, faCalendarCheck,
  faCashRegister, faChartLine, faReceipt, faRightFromBracket, faRotateLeft,
  faShirt, faStore, faTags, faTruck, faUserShield, faUsers, faWarehouse, faXmark,
} from '@fortawesome/free-solid-svg-icons';

import { AuthService } from '../../core/auth/auth.service';

@Component({
  selector: 'app-admin-layout',
  imports: [RouterLink, RouterLinkActive, RouterOutlet, FontAwesomeModule],
  templateUrl: './admin-layout.html',
})
export class AdminLayout {
  protected readonly auth = inject(AuthService);
  protected readonly mobileSidebarOpen = signal(false);
  protected readonly sidebarCollapsed = signal(false);
  protected readonly isAdmin = computed(() => this.auth.hasAnyRole(['administrador']));
  protected readonly roleLabel = computed(() => {
    const roles = this.auth.roles();
    if (roles.includes('administrador')) return 'Administrador';
    if (roles.includes('encargado')) return 'Encargado de sucursal';
    if (roles.includes('cajero')) return 'Cajero';
    return 'Usuario';
  });
  private readonly router = inject(Router);

  protected readonly faAnglesLeft = faAnglesLeft;
  protected readonly faAnglesRight = faAnglesRight;
  protected readonly faBars = faBars;
  protected readonly faBoxesStacked = faBoxesStacked;
  protected readonly faCalendarCheck = faCalendarCheck;
  protected readonly faCashRegister = faCashRegister;
  protected readonly faChartLine = faChartLine;
  protected readonly faReceipt = faReceipt;
  protected readonly faRightFromBracket = faRightFromBracket;
  protected readonly faRotateLeft = faRotateLeft;
  protected readonly faShirt = faShirt;
  protected readonly faStore = faStore;
  protected readonly faTags = faTags;
  protected readonly faTruck = faTruck;
  protected readonly faUserShield = faUserShield;
  protected readonly faUsers = faUsers;
  protected readonly faWarehouse = faWarehouse;
  protected readonly faXmark = faXmark;

  protected openMobileSidebar(): void {
    this.sidebarCollapsed.set(false);
    this.mobileSidebarOpen.set(true);
  }
  protected closeMobileSidebar(): void { this.mobileSidebarOpen.set(false); }
  protected toggleSidebar(): void { this.sidebarCollapsed.update((value) => !value); }

  protected logout(): void {
    this.auth.logout();
    void this.router.navigate(['/']);
  }
}
