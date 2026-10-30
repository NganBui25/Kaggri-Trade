import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminAuthService } from '../../services/admin-auth.service';
import { AdminDataService } from '../../services/admin-data.service';
import { RefundRecord } from '../../models/admin.model';
import { PricePipe } from '../../../../shared/pipes/price.pipe';
import { AdminForbiddenComponent } from '../../components/forbidden/forbidden.component';

@Component({
  selector: 'app-admin-refunds',
  standalone: true,
  imports: [CommonModule, PricePipe, AdminForbiddenComponent],
  templateUrl: './refunds.component.html',
  styleUrl: './refunds.component.scss'
})
export class AdminRefundsComponent {
  readonly auth = inject(AdminAuthService);
  readonly data = inject(AdminDataService);

  readonly refunds = this.data.refunds;
  activeTab = signal<'ALL' | 'PENDING_EXECUTION' | 'SUCCESS' | 'FAILED'>('PENDING_EXECUTION');

  // Check permission (Ops Admin is blocked - Section 0.2, ADM-R15)
  readonly canAccess = computed(() => {
    return this.auth.canAccessModule('refunds');
  });

  readonly canExecute = computed(() => {
    return this.auth.canPerformAction('refunds', 'EXECUTE');
  });

  readonly filteredRefunds = computed(() => {
    let list = this.refunds();
    const tab = this.activeTab();
    if (tab === 'ALL') return list;
    return list.filter(r => r.status === tab);
  });

  onExecute(ref: RefundRecord): void {
    this.data.executeRefund(ref.id);
  }

  onRetry(ref: RefundRecord): void {
    this.data.retryFailedRefund(ref.id);
  }
}

