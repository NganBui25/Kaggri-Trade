import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminAuthService } from '../../services/admin-auth.service';
import { AdminDataService } from '../../services/admin-data.service';
import { DisputeRecord } from '../../models/admin.model';
import { PricePipe } from '../../../../shared/pipes/price.pipe';
import { ToastService } from '../../../../shared/components/toast/toast.service';
import { AdminReasonModalComponent } from '../../components/admin-reason-modal/admin-reason-modal.component';

@Component({
  selector: 'app-admin-disputes',
  standalone: true,
  imports: [CommonModule, FormsModule, PricePipe, AdminReasonModalComponent],
  templateUrl: './disputes.component.html',
  styleUrl: './disputes.component.scss'
})
export class AdminDisputesComponent {
  readonly auth = inject(AdminAuthService);
  readonly data = inject(AdminDataService);
  private readonly toast = inject(ToastService);

  readonly disputes = this.data.disputes;
  selectedDispute = signal<DisputeRecord | null>(null);
  activeStatusTab = signal<string>('ALL');

  // Decision Modal State
  decisionType = signal<'REFUND_FULL' | 'REFUND_PARTIAL' | 'REJECT' | null>(null);
  partialQtyInput = signal<number>(1);

  readonly canDecide = computed(() => {
    return this.auth.canPerformAction('disputes', 'DECIDE');
  });

  readonly filteredDisputes = computed(() => {
    let list = this.disputes();
    const tab = this.activeStatusTab();

    if (tab === 'PENDING') {
      list = list.filter(d => d.status === 'OPENED' || d.status === 'AWAITING_VENDOR' || d.status === 'UNDER_REVIEW' || d.status === 'MORE_EVIDENCE_REQUIRED');
    } else if (tab === 'PENDING_REFUND') {
      list = list.filter(d => d.status === 'PENDING_REFUND_EXECUTION');
    } else if (tab === 'RESOLVED') {
      list = list.filter(d => d.status === 'RESOLVED_REFUND_FULL' || d.status === 'RESOLVED_REFUND_PARTIAL' || d.status === 'RESOLVED_REJECTED' || d.status === 'CLOSED');
    }

    return list;
  });

  selectDispute(d: DisputeRecord): void {
    this.selectedDispute.set(d);
    this.partialQtyInput.set(d.affected || 1);
  }

  closeDetail(): void {
    this.selectedDispute.set(null);
  }

  assignToMe(d: DisputeRecord): void {
    this.data.assignDispute(d.id);
  }

  // Calculated partial refund amount (Fix ADM-R13)
  getCalculatedPartialAmount(): number {
    const d = this.selectedDispute();
    if (!d) return 0;
    return Math.min(this.partialQtyInput() * d.unitPrice, d.refundableAmount);
  }

  openDecisionModal(type: 'REFUND_FULL' | 'REFUND_PARTIAL' | 'REJECT'): void {
    const d = this.selectedDispute();
    if (!d) return;

    if (type === 'REFUND_PARTIAL' && (this.partialQtyInput() <= 0 || this.partialQtyInput() > d.qty)) {
      this.toast.error(`Số lượng ảnh hưởng không hợp lệ (tối đa ${d.qty} kg).`, 'Lỗi nhập');
      return;
    }

    this.decisionType.set(type);
  }

  closeDecisionModal(): void {
    this.decisionType.set(null);
  }

  onDecisionConfirm(reason: string): void {
    const d = this.selectedDispute();
    const type = this.decisionType();
    if (!d || !type) return;

    this.data.decideDispute(d.id, type, this.partialQtyInput(), reason);
    this.closeDecisionModal();
  }

  getSlaBadge(d: DisputeRecord): { text: string; badgeClass: string } {
    // If closed/resolved, do NOT show countdown (Fix ADM-16)
    if (d.status.startsWith('RESOLVED') || d.status === 'CLOSED') {
      return { text: 'Đã giải quyết', badgeClass: 'bg-stone-100 text-stone-600' };
    }

    if (d.slaHoursLeft <= 24) {
      return { text: `Sắp hạn (${d.slaHoursLeft}h)`, badgeClass: 'bg-rose-100 text-rose-800 border-rose-300' };
    }

    return { text: `Còn ${d.slaHoursLeft}h`, badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-300' };
  }
}
