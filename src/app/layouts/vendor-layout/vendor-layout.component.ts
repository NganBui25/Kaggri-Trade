import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { VendorDataService } from '../../features/vendor/services/vendor-data.service';

@Component({
  selector: 'app-vendor-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './vendor-layout.component.html',
  styleUrl: './vendor-layout.component.scss'
})
export class VendorLayoutComponent {
  readonly authService = inject(AuthService);
  readonly vendorData = inject(VendorDataService);
  private readonly router = inject(Router);

  isSidebarCollapsed = signal(false);
  isMobileSidebarOpen = signal(false);
  isUserDropdownOpen = signal(false);

  toggleSidebar(): void {
    this.isSidebarCollapsed.update(v => !v);
  }

  toggleMobileSidebar(): void {
    this.isMobileSidebarOpen.update(v => !v);
  }

  closeMobileSidebar(): void {
    this.isMobileSidebarOpen.set(false);
  }

  onLogout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}

