import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AdminAuthService } from '../../services/admin-auth.service';
import { AdminDataService } from '../../services/admin-data.service';
import { KycRecord } from '../../models/admin.model';
import { AdminReasonModalComponent } from '../../components/admin-reason-modal/admin-reason-modal.component';

@Component({
  selector: 'app-admin-kyc',
  standalone: true,
  imports: [CommonModule, RouterModule, AdminReasonModalComponent],
  templateUrl: './kyc.component.html',
  styleUrl: './kyc.component.scss'
})
export class AdminKycComponent {
  readonly auth = inject(AdminAuthService);
  readonly data = inject(AdminDataService);

  readonly kycList = this.data.kycList;
  selectedKyc = signal<KycRecord | null>(null);
  activeFilter = signal<'ALL' | 'PENDING' | 'NEEDS_DOC' | 'APPROVED' | 'REJECTED'>('ALL');

  // Reason modal control
  modalAction = signal<'REJECT' | 'REQUEST_DOC' | null>(null);

  readonly canDecide = computed(() => {
    return this.auth.canPerformAction('kyc', 'DECIDE');
  });

  readonly filteredList = computed(() => {
    const list = this.kycList();
    const filter = this.activeFilter();
    if (filter === 'ALL') return list;
    return list.filter(k => k.status === filter);
  });

  selectKyc(record: KycRecord): void {
    this.selectedKyc.set(record);
  }

  closeDetail(): void {
    this.selectedKyc.set(null);
  }

  // Open modals
  openRejectModal(record: KycRecord): void {
    this.selectedKyc.set(record);
    this.modalAction.set('REJECT');
  }

  openRequestDocModal(record: KycRecord): void {
    this.selectedKyc.set(record);
    this.modalAction.set('REQUEST_DOC');
  }

  closeModal(): void {
    this.modalAction.set(null);
  }

  // Handle modal confirmations (Fix ADM-R07, ADM-R08)
  onModalConfirm(reason: string): void {
    const record = this.selectedKyc();
    const action = this.modalAction();
    if (!record || !action) return;

    if (action === 'REJECT') {
      this.data.rejectKyc(record.id, reason);
    } else if (action === 'REQUEST_DOC') {
      this.data.requestKycDocs(record.id, reason);
    }

    this.closeModal();
  }

  onApprove(record: KycRecord): void {
    this.data.approveKyc(record.id);
  }

  getSlaDisplay(item: KycRecord): { text: string; badgeClass: string } {
    if (item.status !== 'PENDING') {
      return { text: 'Đã hoàn tất', badgeClass: 'bg-stone-100 text-stone-600' };
    }

    if (item.slaHoursLeft < 0) {
      // Breached: Positive number with label "Vi phạm (Xh)" (Fix ADM-15)
      return {
        text: `Vi phạm (${Math.abs(item.slaHoursLeft)}h)`,
        badgeClass: 'bg-rose-100 text-rose-800 border-rose-300'
      };
    }

    if (item.slaHoursLeft <= 12) {
      // At risk: "Sắp hạn (Xh)"
      return {
        text: `Sắp hạn (${item.slaHoursLeft}h)`,
        badgeClass: 'bg-amber-100 text-amber-800 border-amber-300'
      };
    }

    return {
      text: `Đúng hạn (${item.slaHoursLeft}h)`,
      badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300'
    };
  }
}

