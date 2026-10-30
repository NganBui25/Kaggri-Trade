import { Injectable, signal, computed, inject } from '@angular/core';
import { AdminRole, AdminUser } from '../models/admin.model';
import { ToastService } from '../../../shared/components/toast/toast.service';
import { StorageService } from '../../../core/services/storage.service';

@Injectable({
  providedIn: 'root'
})
export class AdminAuthService {
  private readonly toast = inject(ToastService);
  private readonly storage = inject(StorageService);

  private readonly ADMIN_ROLE_STORAGE_KEY = 'kaggri_admin_active_role';

  readonly availableProfiles: Record<AdminRole, AdminUser> = {
    SUPER_ADMIN: {
      id: 'ADM-001',
      name: 'Phạm Hồng Sơn',
      role: 'SUPER_ADMIN',
      roleLabel: 'Super Admin (Quản trị cấp cao)',
      avatar: 'SH',
      email: 'son.pham@kaggri.vn',
      lastLogin: '18/09/2026 08:30'
    },
    OPS_ADMIN: {
      id: 'ADM-002',
      name: 'Lê Quốc Hưng',
      role: 'OPS_ADMIN',
      roleLabel: 'Vận hành (Operations Admin)',
      avatar: 'QH',
      email: 'hung.le@kaggri.vn',
      lastLogin: '18/09/2026 10:15'
    },
    FIN_ADMIN: {
      id: 'ADM-004',
      name: 'Nguyễn Thị Mai',
      role: 'FIN_ADMIN',
      roleLabel: 'Tài chính (Finance Admin)',
      avatar: 'TM',
      email: 'mai.nguyen@kaggri.vn',
      lastLogin: '18/09/2026 11:20'
    },
    COMP_ADMIN: {
      id: 'ADM-005',
      name: 'Trần Văn Tuấn',
      role: 'COMP_ADMIN',
      roleLabel: 'Tuân thủ (Compliance Admin)',
      avatar: 'VT',
      email: 'tuan.tran@kaggri.vn',
      lastLogin: '17/09/2026 16:45'
    }
  };

  readonly currentAdmin = signal<AdminUser>(this.initCurrentAdmin());
  readonly currentRole = computed<AdminRole>(() => this.currentAdmin().role);
  readonly adminUsers = signal<AdminUser[]>(Object.values(this.availableProfiles));

  private initCurrentAdmin(): AdminUser {
    const savedRole = this.storage.getItem<AdminRole>(this.ADMIN_ROLE_STORAGE_KEY);
    if (savedRole && this.availableProfiles[savedRole]) {
      return this.availableProfiles[savedRole];
    }
    return this.availableProfiles.SUPER_ADMIN;
  }

  // Switch role for test & review (Fix ADM-R02)
  switchRole(role: AdminRole): void {
    const profile = this.availableProfiles[role];
    if (profile) {
      this.currentAdmin.set(profile);
      this.storage.setItem(this.ADMIN_ROLE_STORAGE_KEY, role);
      this.toast.info(
        `Đã chuyển sang vai trò: ${profile.roleLabel}. Quyền hạn và giao diện đã được cập nhật tương ứng.`,
        'Chuyển vai trò quản trị'
      );
    }
  }

  // Helpers
  isSuperAdmin(): boolean {
    return this.currentAdmin().role === 'SUPER_ADMIN';
  }

  isOpsAdmin(): boolean {
    return this.currentAdmin().role === 'OPS_ADMIN';
  }

  isFinAdmin(): boolean {
    return this.currentAdmin().role === 'FIN_ADMIN';
  }

  isCompAdmin(): boolean {
    return this.currentAdmin().role === 'COMP_ADMIN';
  }

  // Core permissions matrix (D1 - D8, Section 0.2)
  canAccessModule(module: string): boolean {
    const role = this.currentAdmin().role;

    switch (module) {
      case 'dashboard':
      case 'reports':
      case 'kyc':
      case 'accounts-vendor':
      case 'accounts-buyer':
      case 'transactions':
      case 'disputes':
      case 'settlements':
      case 'categories':
      case 'config':
      case 'audit':
      case 'notifications':
        return true; // All roles can at least view these

      case 'moderation':
        // Finance has NO access to moderation (Fix D2, Section 0.2)
        return role !== 'FIN_ADMIN';

      case 'refunds':
        // Ops has NO access to refunds execution (Fix D2, ADM-R15)
        return role === 'SUPER_ADMIN' || role === 'FIN_ADMIN' || role === 'COMP_ADMIN';

      case 'rbac':
        // Ops and Finance have NO access to RBAC (Section 0.2)
        return role === 'SUPER_ADMIN' || role === 'COMP_ADMIN';

      default:
        return true;
    }
  }

  // Check if role has action permission (not read-only)
  canPerformAction(module: string, action?: string): boolean {
    const role = this.currentAdmin().role;

    if (role === 'SUPER_ADMIN') return true;
    if (role === 'COMP_ADMIN') return action === 'EXPORT_AUDIT'; // Compliance only has export audit

    switch (module) {
      case 'kyc':
        return role === 'OPS_ADMIN'; // Ops can approve/reject KYC

      case 'accounts-vendor':
        if (action === 'TERMINATE') return false; // Rule D3: Only Super Admin can terminate
        return role === 'OPS_ADMIN'; // Ops can suspend / reactivate

      case 'accounts-buyer':
        return role === 'OPS_ADMIN';

      case 'disputes':
        return role === 'OPS_ADMIN'; // Rule D2: Ops decides disputes

      case 'refunds':
        return role === 'FIN_ADMIN'; // Rule D2: Finance executes refunds

      case 'settlements':
        return role === 'FIN_ADMIN'; // Finance manages settlements

      case 'transactions':
        return role === 'FIN_ADMIN'; // Finance manages gateway webhooks

      case 'moderation':
        if (action === 'TERMINATE') return false;
        return role === 'OPS_ADMIN';

      case 'categories':
        return role === 'OPS_ADMIN';

      case 'config':
      case 'rbac':
        return false; // Only Super Admin

      default:
        return false;
    }
  }
}
