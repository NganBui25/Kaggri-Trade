import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminAuthService } from '../../services/admin-auth.service';
import { AdminDataService } from '../../services/admin-data.service';
import { RoleDefinition, AdminUser, AdminRole } from '../../models/admin.model';
import { AdminForbiddenComponent } from '../../components/forbidden/forbidden.component';

interface ModulePermissionMeta {
  key: string;
  label: string;
  category: string;
}

@Component({
  selector: 'app-admin-rbac',
  standalone: true,
  imports: [CommonModule, FormsModule, AdminForbiddenComponent],
  templateUrl: './rbac.component.html',
  styleUrl: './rbac.component.scss'
})
export class AdminRbacComponent {
  readonly auth = inject(AdminAuthService);
  readonly data = inject(AdminDataService);

  readonly canAccess = computed(() => this.auth.canAccessModule('rbac'));
  readonly canEdit = computed(() => this.auth.isSuperAdmin());

  activeTab = signal<'matrix' | 'users' | 'roles'>('matrix');

  // Module metadata list for Role Matrix (Fix ADM-R23)
  readonly modules: ModulePermissionMeta[] = [
    { key: 'dashboard', label: 'Tổng quan & KPI', category: 'Chung' },
    { key: 'reports', label: 'Báo cáo số liệu', category: 'Chung' },
    { key: 'kyc', label: 'Xét duyệt hồ sơ KYC', category: 'Vận hành' },
    { key: 'accounts-vendor', label: 'Quản lý Người bán', category: 'Vận hành' },
    { key: 'accounts-buyer', label: 'Quản lý Người mua', category: 'Vận hành' },
    { key: 'transactions', label: 'Giao dịch thanh toán', category: 'Tài chính' },
    { key: 'disputes', label: 'Khiếu nại & Tranh chấp', category: 'Vận hành & Tài chính' },
    { key: 'refunds', label: 'Thực thi lệnh Hoàn tiền', category: 'Tài chính' },
    { key: 'settlements', label: 'Đối soát & Quyết toán', category: 'Tài chính' },
    { key: 'moderation', label: 'Kiểm duyệt nội dung', category: 'Vận hành' },
    { key: 'categories', label: 'Danh mục & Đơn vị tính', category: 'Cấu hình' },
    { key: 'config', label: 'Cấu hình thông số sàn', category: 'Cấu hình' },
    { key: 'rbac', label: 'Quản trị phân quyền (RBAC)', category: 'Bảo mật' },
    { key: 'audit', label: 'Nhật ký kiểm toán', category: 'Bảo mật' }
  ];

  // Role list from service
  readonly roles = this.data.roles;
  readonly adminUsers = this.auth.adminUsers;

  // New Role Modal
  showNewRoleModal = signal<boolean>(false);
  newRoleName = signal<string>('');
  newRoleDesc = signal<string>('');

  // Assign Role Modal (Fix ADM-R24, ADM-34)
  assignTargetUser = signal<AdminUser | null>(null);
  selectedNewRole = signal<AdminRole>('OPS_ADMIN');

  // Deactivate Role Target (Fix ADM-R25)
  deactivateTargetRole = signal<RoleDefinition | null>(null);

  // Helper to get permission badge text and styles
  getPermBadge(perm: 'FULL' | 'VIEW' | 'NONE') {
    switch (perm) {
      case 'FULL':
        return { label: 'Toàn quyền', class: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
      case 'VIEW':
        return { label: 'Chỉ xem', class: 'bg-blue-50 text-blue-700 border-blue-200' };
      case 'NONE':
      default:
        return { label: 'Không có quyền', class: 'bg-stone-100 text-stone-400 border-stone-200' };
    }
  }

  // CREATE ROLE
  openNewRoleModal(): void {
    this.newRoleName.set('');
    this.newRoleDesc.set('');
    this.showNewRoleModal.set(true);
  }

  closeNewRoleModal(): void {
    this.showNewRoleModal.set(false);
  }

  submitCreateRole(): void {
    if (!this.newRoleName().trim()) return;
    this.data.createRole(this.newRoleName().trim(), this.newRoleDesc().trim());
    this.closeNewRoleModal();
  }

  // DEACTIVATE ROLE (Fix ADM-R25)
  openDeactivateRoleModal(role: RoleDefinition): void {
    this.deactivateTargetRole.set(role);
  }

  closeDeactivateRoleModal(): void {
    this.deactivateTargetRole.set(null);
  }

  executeToggleRole(): void {
    const r = this.deactivateTargetRole();
    if (!r) return;
    this.data.deactivateRole(r.id);
    this.closeDeactivateRoleModal();
  }

  // ASSIGN USER ROLE (Fix ADM-34: Safety check on last Super Admin)
  openAssignUserModal(user: AdminUser): void {
    this.assignTargetUser.set(user);
    this.selectedNewRole.set(user.role);
  }

  closeAssignUserModal(): void {
    this.assignTargetUser.set(null);
  }

  submitAssignUserRole(): void {
    const user = this.assignTargetUser();
    if (!user) return;

    // Safety check ADM-34: Protect last Super Admin
    if (user.role === 'SUPER_ADMIN' && this.selectedNewRole() !== 'SUPER_ADMIN') {
      const superAdmins = this.auth.adminUsers().filter(u => u.role === 'SUPER_ADMIN');
      if (superAdmins.length <= 1) {
        alert('Không thể giáng cấp Quản trị viên Tối cao (Super Admin) cuối cùng trong hệ thống!');
        return;
      }
    }

    const prevRole = user.role;
    user.role = this.selectedNewRole();
    const roleMeta = this.roles().find(r => r.code === this.selectedNewRole());
    user.roleLabel = roleMeta ? roleMeta.name : this.selectedNewRole();

    this.data.logAudit(
      'RBAC:ASSIGN_ROLE',
      'Thay đổi vai trò quản trị viên',
      user.id,
      prevRole,
      user.role,
      `Chuyển vai trò của ${user.name} sang ${user.roleLabel}`
    );

    this.closeAssignUserModal();
  }
}

