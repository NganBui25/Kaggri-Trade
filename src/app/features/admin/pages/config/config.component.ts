import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminAuthService } from '../../services/admin-auth.service';
import { AdminDataService } from '../../services/admin-data.service';
import { SystemConfigItem } from '../../models/admin.model';
import { AdminForbiddenComponent } from '../../components/forbidden/forbidden.component';

@Component({
  selector: 'app-admin-config',
  standalone: true,
  imports: [CommonModule, FormsModule, AdminForbiddenComponent],
  templateUrl: './config.component.html',
  styleUrl: './config.component.scss'
})
export class AdminConfigComponent {
  readonly auth = inject(AdminAuthService);
  readonly data = inject(AdminDataService);

  readonly canAccess = computed(() => this.auth.canAccessModule('config'));
  readonly canEdit = computed(() => this.auth.isSuperAdmin());

  // Edit State
  editTarget = signal<SystemConfigItem | null>(null);
  editNewValue = signal<any>('');
  editReason = signal<string>('');
  editReasonError = signal<string>('');

  // Active Category Filter
  activeCategoryFilter = signal<'ALL' | 'FINANCE' | 'OPS'>('ALL');

  // Filter configs based on admin role (ADM-R21, ADM-R22)
  visibleConfigs = computed(() => {
    const role = this.auth.currentRole();
    const all = this.data.systemConfigs();
    const filter = this.activeCategoryFilter();

    let scoped = all;
    if (role === 'FIN_ADMIN') {
      scoped = all.filter(c => c.group === 'finance');
    } else if (role === 'OPS_ADMIN') {
      scoped = all.filter(c => c.group === 'ops' || c.group === 'formula');
    }

    if (filter === 'FINANCE') {
      return scoped.filter(c => c.group === 'finance');
    } else if (filter === 'OPS') {
      return scoped.filter(c => c.group === 'ops' || c.group === 'formula');
    }

    return scoped;
  });

  // History list
  historyList = computed(() => this.data.configHistory());

  isNumberValue(val: any): boolean {
    return typeof val === 'number';
  }

  openEditModal(item: SystemConfigItem): void {
    if (!this.canEdit()) return;
    this.editTarget.set(item);
    this.editNewValue.set(item.value);
    this.editReason.set('');
    this.editReasonError.set('');
  }

  closeEditModal(): void {
    this.editTarget.set(null);
    this.editReason.set('');
    this.editReasonError.set('');
  }

  submitUpdate(): void {
    const item = this.editTarget();
    if (!item) return;

    const reason = this.editReason().trim();
    if (!reason || reason.length < 10) {
      this.editReasonError.set('Lý do thay đổi cấu hình bắt buộc có tối thiểu 10 ký tự.');
      return;
    }

    const success = this.data.updateConfig(item.key, this.editNewValue(), reason);
    if (success) {
      this.closeEditModal();
    }
  }
}
