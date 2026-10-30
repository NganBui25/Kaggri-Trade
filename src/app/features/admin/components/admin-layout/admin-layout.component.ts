import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { AdminAuthService } from '../../services/admin-auth.service';
import { AdminDataService } from '../../services/admin-data.service';
import { AdminRole } from '../../models/admin.model';
import { ToastService } from '../../../../shared/components/toast/toast.service';

interface MenuItem {
  id: string;
  label: string;
  route: string;
  badge?: () => number;
  badgeClass?: string;
  visible: () => boolean;
}

interface MenuGroup {
  title: string;
  items: MenuItem[];
  visible: () => boolean;
}

@Component({
  selector: 'app-admin-layout',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-layout.component.html',
  styleUrl: './admin-layout.component.scss'
})
export class AdminLayoutComponent {
  readonly auth = inject(AdminAuthService);
  readonly data = inject(AdminDataService);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  readonly currentAdmin = this.auth.currentAdmin;
  readonly roleDropdownOpen = signal<boolean>(false);
  readonly mobileSidebarOpen = signal<boolean>(false);

  // Available roles for switcher
  readonly roleOptions: { code: AdminRole; label: string; desc: string }[] = [
    { code: 'SUPER_ADMIN', label: 'Super Admin', desc: 'Toàn quyền cấu hình & RBAC' },
    { code: 'OPS_ADMIN', label: 'Vận hành (Ops Admin)', desc: 'KYC, Vendor, Dispute, Moderation' },
    { code: 'FIN_ADMIN', label: 'Tài chính (Fin Admin)', desc: 'Giao dịch, Hoàn tiền, Đối soát' },
    { code: 'COMP_ADMIN', label: 'Tuân thủ (Comp Admin)', desc: 'Chỉ xem & Xuất Audit Log' }
  ];

  // Dynamic badge counts (Fix ADM-R27: Only for authorized roles)
  readonly pendingKycCount = computed(() => {
    if (this.auth.isOpsAdmin() || this.auth.isSuperAdmin()) {
      return this.data.kycList().filter(k => k.status === 'PENDING').length;
    }
    return 0;
  });

  readonly pendingDisputeCount = computed(() => {
    if (this.auth.isOpsAdmin() || this.auth.isSuperAdmin()) {
      return this.data.disputes().filter(d => d.status === 'OPENED' || d.status === 'UNDER_REVIEW').length;
    }
    return 0;
  });

  readonly pendingRefundCount = computed(() => {
    if (this.auth.isFinAdmin() || this.auth.isSuperAdmin()) {
      return this.data.refunds().filter(r => r.status === 'PENDING_EXECUTION' || r.status === 'FAILED').length;
    }
    return 0;
  });

  readonly unreadNotificationCount = computed(() => {
    const role = this.auth.currentAdmin().role;
    return this.data.notifications().filter(n => !n.read && (!n.targetRole || n.targetRole === role || role === 'SUPER_ADMIN')).length;
  });

  // Navigation menu grouped & filtered by role (Fix ADM-R01)
  readonly menuGroups = computed<MenuGroup[]>(() => {
    const role = this.auth.currentAdmin().role;

    const groups: MenuGroup[] = [
      {
        title: 'Tổng Quan',
        visible: () => true,
        items: [
          {
            id: 'dashboard',
            label: 'Tổng quan nền tảng',
            route: '/admin/dashboard',
            visible: () => true
          },
          {
            id: 'reports',
            label: 'Báo cáo thống kê',
            route: '/admin/reports',
            visible: () => true
          }
        ]
      },
      {
        title: 'Vận Hành',
        visible: () => role !== 'FIN_ADMIN', // Hide if Finance has zero actionable items
        items: [
          {
            id: 'kyc',
            label: 'Hồ sơ Người bán (KYC)',
            route: '/admin/kyc',
            badge: () => this.pendingKycCount(),
            badgeClass: 'bg-amber-100 text-amber-900 border border-amber-300',
            visible: () => true
          },
          {
            id: 'accounts-vendor',
            label: 'Quản lý Người bán',
            route: '/admin/accounts-vendor',
            visible: () => true
          },
          {
            id: 'accounts-buyer',
            label: 'Quản lý Người mua',
            route: '/admin/accounts-buyer',
            visible: () => true
          },
          {
            id: 'disputes',
            label: 'Giải quyết tranh chấp',
            route: '/admin/disputes',
            badge: () => this.pendingDisputeCount(),
            badgeClass: 'bg-rose-100 text-rose-900 border border-rose-300',
            visible: () => true
          },
          {
            id: 'moderation',
            label: 'Kiểm duyệt nội dung',
            route: '/admin/moderation',
            visible: () => role !== 'FIN_ADMIN' // Section 0.2: Finance blocked from moderation
          }
        ]
      },
      {
        title: 'Tài Chính',
        visible: () => true,
        items: [
          {
            id: 'transactions',
            label: 'Giám sát giao dịch',
            route: '/admin/transactions',
            visible: () => true
          },
          {
            id: 'refunds',
            label: 'Thực thi hoàn tiền',
            route: '/admin/refunds',
            badge: () => this.pendingRefundCount(),
            badgeClass: 'bg-emerald-100 text-emerald-900 border border-emerald-300',
            visible: () => role === 'SUPER_ADMIN' || role === 'FIN_ADMIN' || role === 'COMP_ADMIN' // Section 0.2: Ops blocked
          },
          {
            id: 'settlements',
            label: 'Đối soát & Thanh toán',
            route: '/admin/settlements',
            visible: () => true
          }
        ]
      },
      {
        title: 'Nội Dung & Cấu Hình',
        visible: () => true,
        items: [
          {
            id: 'categories',
            label: 'Danh mục & Đơn vị tính',
            route: '/admin/categories',
            visible: () => true
          },
          {
            id: 'config',
            label: 'Cấu hình hệ thống',
            route: '/admin/config',
            visible: () => true
          }
        ]
      },
      {
        title: 'Bảo Mật & Tuân Thủ',
        visible: () => role === 'SUPER_ADMIN' || role === 'COMP_ADMIN', // Section 0.2: Ops and Finance hidden
        items: [
          {
            id: 'rbac',
            label: 'Quản trị phân quyền (RBAC)',
            route: '/admin/rbac',
            visible: () => role === 'SUPER_ADMIN' || role === 'COMP_ADMIN'
          },
          {
            id: 'audit',
            label: 'Nhật ký kiểm toán',
            route: '/admin/audit',
            visible: () => true
          }
        ]
      }
    ];

    // Filter each group's items and hide empty groups (Fix ADM-R01)
    return groups
      .map(g => ({
        ...g,
        items: g.items.filter(item => item.visible())
      }))
      .filter(g => g.visible() && g.items.length > 0);
  });

  selectRole(role: AdminRole): void {
    this.auth.switchRole(role);
    this.roleDropdownOpen.set(false);
  }

  logout(): void {
    this.toast.info('Đã đăng xuất khỏi tài khoản Quản trị viên.', 'Đăng xuất');
    this.router.navigate(['/auth/login']);
  }
}

