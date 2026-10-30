import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/auth/auth.service';
import { CartService } from '../../features/buyer/services/cart.service';

@Component({
  selector: 'app-storefront-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './storefront-layout.component.html',
  styleUrl: './storefront-layout.component.scss'
})
export class StorefrontLayoutComponent {
  readonly authService = inject(AuthService);
  readonly cartService = inject(CartService);
  private readonly router = inject(Router);

  isMobileMenuOpen = signal(false);
  isUserDropdownOpen = signal(false);
  isNotificationsOpen = signal(false);
  searchKeyword = signal('');

  // Sample unread notifications count for Buyer
  unreadNotificationCount = signal(3);

  toggleMobileMenu(): void {
    this.isMobileMenuOpen.update(v => !v);
  }

  closeMobileMenu(): void {
    this.isMobileMenuOpen.set(false);
  }

  toggleUserDropdown(): void {
    this.isUserDropdownOpen.update(v => !v);
  }

  toggleNotifications(): void {
    this.isNotificationsOpen.update(v => !v);
  }

  onSearch(): void {
    const q = this.searchKeyword().trim();
    if (q) {
      this.router.navigate(['/buyer/catalog'], { queryParams: { q } });
      this.isMobileMenuOpen.set(false);
    }
  }

  onLogout(): void {
    this.authService.logout();
    this.isUserDropdownOpen.set(false);
    this.router.navigate(['/auth/login']);
  }
}
