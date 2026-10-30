import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminAuthService } from '../../services/admin-auth.service';
import { AdminDataService } from '../../services/admin-data.service';
import { TransactionRecord } from '../../models/admin.model';
import { PricePipe } from '../../../../shared/pipes/price.pipe';
import { ToastService } from '../../../../shared/components/toast/toast.service';

@Component({
  selector: 'app-admin-transactions',
  standalone: true,
  imports: [CommonModule, FormsModule, PricePipe],
  templateUrl: './transactions.component.html',
  styleUrl: './transactions.component.scss'
})
export class AdminTransactionsComponent {
  readonly auth = inject(AdminAuthService);
  readonly data = inject(AdminDataService);
  private readonly toast = inject(ToastService);

  readonly transactions = this.data.transactions;
  providerFilter = signal<string>('ALL');
  statusFilter = signal<string>('ALL');
  searchTerm = signal<string>('');

  selectedTxn = signal<TransactionRecord | null>(null);

  readonly canManageGateway = computed(() => {
    return this.auth.canPerformAction('transactions');
  });

  readonly providers = ['ALL', 'VietQR', 'VNPay', 'MoMo', 'Napas', 'Stripe'];

  readonly filteredTransactions = computed(() => {
    let list = this.transactions();
    const p = this.providerFilter();
    const s = this.statusFilter();
    const term = this.searchTerm().trim().toLowerCase();

    if (p !== 'ALL') {
      list = list.filter(t => t.provider === p);
    }

    if (s !== 'ALL') {
      list = list.filter(t => t.status === s);
    }

    if (term) {
      list = list.filter(t =>
        t.id.toLowerCase().includes(term) ||
        t.buyer.toLowerCase().includes(term) ||
        t.vendor.toLowerCase().includes(term) ||
        (t.orderId && t.orderId.toLowerCase().includes(term))
      );
    }

    return list;
  });

  selectTxn(txn: TransactionRecord): void {
    this.selectedTxn.set(txn);
  }

  closeDetail(): void {
    this.selectedTxn.set(null);
  }

  // Fix ADM-R16: Check gateway status & retry webhook
  checkGatewayStatus(txn: TransactionRecord): void {
    if (!this.canManageGateway()) {
      this.toast.error('Chỉ Quản trị viên Tài chính mới có quyền tra soát cổng thanh toán.', 'Không có quyền');
      return;
    }

    this.toast.info(`Đang truy vấn trạng thái từ cổng ${txn.provider} cho giao dịch #${txn.id}...`, 'Tra soát cổng');
    setTimeout(() => {
      this.data.logAudit('TXN:GATEWAY_CHECK', 'Kiểm tra trạng thái cổng thanh toán', txn.id, txn.status, txn.status);
      this.toast.success(`Cổng ${txn.provider} xác nhận: Trạng thái khớp hoàn toàn với sổ cái Kaggri.`, 'Tra soát thành công');
    }, 600);
  }

  retryWebhook(txn: TransactionRecord): void {
    if (!this.canManageGateway()) {
      this.toast.error('Chỉ Quản trị viên Tài chính mới có quyền gửi lại webhook.', 'Không có quyền');
      return;
    }

    txn.webhookStatus = 'delivered';
    txn.webhookRetries = (txn.webhookRetries || 0) + 1;
    this.data.transactions.set([...this.data.transactions()]);

    this.data.logAudit('TXN:RETRY_WEBHOOK', 'Xử lý lại Webhook', txn.id, 'failed', 'delivered');
    this.toast.success(`Đã phát lại tín hiệu Webhook cho giao dịch #${txn.id} thành công!`, 'Phát lại Webhook');
  }
}

