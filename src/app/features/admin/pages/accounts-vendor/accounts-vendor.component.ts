import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminAuthService } from '../../services/admin-auth.service';
import { AdminDataService } from '../../services/admin-data.service';
import { VendorAccount } from '../../models/admin.model';
import { AdminReasonModalComponent } from '../../components/admin-reason-modal/admin-reason-modal.component';

@Component({
  selector: 'app-admin-accounts-vendor',
  standalone: true,
  imports: [CommonModule, FormsModule, AdminReasonModalComponent],
  templateUrl: './accounts-vendor.component.html',
  styleUrl: './accounts-vendor.component.scss'
})
export class AdminAccountsVendorComponent {
  readonly auth = inject(AdminAuthService);
  readonly data = inject(AdminDataService);

  readonly vendors = this.data.vendorAccounts;
  searchTerm = signal<string>('');
  statusFilter = signal<string>('ALL');

  selectedVendor = signal<VendorAccount | null>(null);
  modalAction = signal<'SUSPEND' | 'REACTIVATE' | 'TERMINATE' | null>(null);
  detailVendor = signal<VendorAccount | null>(null);

  // Permissions (Rule D3)
  readonly canSuspend = computed(() => this.auth.canPerformAction('accounts-vendor', 'SUSPEND'));
  readonly canTerminate = computed(() => this.auth.isSuperAdmin());

  readonly filteredVendors = computed(() => {
    let list = this.vendors();
    const term = this.searchTerm().trim().toLowerCase();
    const filter = this.statusFilter();

    if (term) {
      list = list.filter(v => v.company.toLowerCase().includes(term) || v.id.toLowerCase().includes(term) || v.region.toLowerCase().includes(term));
    }

    if (filter !== 'ALL') {
      list = list.filter(v => v.status === filter);
    }

    return list;
  });

  openDetail(v: VendorAccount): void {
    this.detailVendor.set(v);
  }

  closeDetail(): void {
    this.detailVendor.set(null);
  }

  openSuspendModal(v: VendorAccount): void {
    this.selectedVendor.set(v);
    this.modalAction.set('SUSPEND');
  }

  openReactivateModal(v: VendorAccount): void {
    this.selectedVendor.set(v);
    this.modalAction.set('REACTIVATE');
  }

  openTerminateModal(v: VendorAccount): void {
    this.selectedVendor.set(v);
    this.modalAction.set('TERMINATE');
  }

  closeModal(): void {
    this.modalAction.set(null);
  }

  onModalConfirm(reason: string): void {
    const v = this.selectedVendor();
    const action = this.modalAction();
    if (!v || !action) return;

    if (action === 'SUSPEND') {
      this.data.suspendVendor(v.id, reason);
    } else if (action === 'REACTIVATE') {
      this.data.reactivateVendor(v.id, reason);
    } else if (action === 'TERMINATE') {
      this.data.terminateVendor(v.id, reason);
    }

    this.closeModal();
  }

  getWarningText(): string | undefined {
    const v = this.selectedVendor();
    if (this.modalAction() === 'SUSPEND' && v && v.pendingOrdersCount > 0) {
      return `Cảnh báo nghiệp vụ: Người bán này hiện còn ${v.pendingOrdersCount} đơn hàng B2B đang giao hoặc chuẩn bị hàng. Việc tạm khóa sẽ giữ tiền ký quỹ và yêu cầu đối soát kỹ trước khi bàn giao.`;
    }
    if (this.modalAction() === 'TERMINATE' && v) {
      return `Hành động này sẽ chấm dứt vĩnh viễn tư cách Người bán của "${v.company}" trên nền tảng Kaggri-Trade. Toàn bộ sản phẩm sẽ bị ẩn và phong tỏa tài khoản đối soát.`;
    }
    return undefined;
  }
}

