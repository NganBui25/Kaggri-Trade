import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AdminAuthService } from '../../services/admin-auth.service';
import { AdminDataService } from '../../services/admin-data.service';
import { AdminNotification } from '../../models/admin.model';
import { ToastService } from '../../../../shared/components/toast/toast.service';

@Component({
  selector: 'app-admin-notifications',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './notifications.component.html',
  styleUrl: './notifications.component.scss'
})
export class AdminNotificationsComponent {
  readonly auth = inject(AdminAuthService);
  readonly data = inject(AdminDataService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  activeCategory = signal<'ALL' | 'UNREAD' | 'KYC' | 'FINANCE' | 'DISPUTE' | 'SYSTEM'>('ALL');

  // Filtered notifications scoped to current role and tab (Fix ADM-R29)
  filteredNotifications = computed(() => {
    const role = this.auth.currentRole();
    const all = this.data.notifications();
    const cat = this.activeCategory();

    // Base filter by role eligibility
    let list = all.filter(n => {
      if (role === 'SUPER_ADMIN') return true;
      if (!n.targetRole) return true;
      return n.targetRole === role;
    });

    if (cat === 'UNREAD') {
      return list.filter(n => !n.read);
    } else if (cat === 'KYC') {
      return list.filter(n => n.target === 'kyc');
    } else if (cat === 'FINANCE') {
      return list.filter(n => ['transactions', 'refunds', 'settlements'].includes(n.target));
    } else if (cat === 'DISPUTE') {
      return list.filter(n => n.target === 'disputes');
    } else if (cat === 'SYSTEM') {
      return list.filter(n => !['kyc', 'transactions', 'refunds', 'settlements', 'disputes'].includes(n.target));
    }

    return list;
  });

  unreadCount = computed(() => {
    return this.filteredNotifications().filter(n => !n.read).length;
  });

  markAsRead(item: AdminNotification): void {
    item.read = true;
    this.data.notifications.set([...this.data.notifications()]);
  }

  markAllAsRead(): void {
    const list = this.data.notifications();
    for (const n of list) {
      n.read = true;
    }
    this.data.notifications.set([...list]);
    this.toast.success('Đã đánh dấu toàn bộ thông báo là đã đọc!', 'Thông báo');
  }

  handleNavigate(item: AdminNotification): void {
    this.markAsRead(item);
    if (item.target) {
      const url = item.target.startsWith('/admin') ? item.target : `/admin/${item.target}`;
      this.router.navigateByUrl(url);
    }
  }
}
