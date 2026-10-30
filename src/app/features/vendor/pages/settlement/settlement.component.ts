import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VendorDataService } from '../../services/vendor-data.service';
import { PricePipe } from '../../../../shared/pipes/price.pipe';
import { ToastService } from '../../../../shared/components/toast/toast.service';

interface HistoricalSettlement {
  periodId: string;
  dateRange: string;
  grossSales: number;
  platformFee: number;
  escrowReserve: number;
  deductions: number;
  netPayout: number;
  paidDate: string;
  bankTxRef: string;
  status: 'paid' | 'processing';
}

@Component({
  selector: 'app-vendor-settlement',
  standalone: true,
  imports: [CommonModule, FormsModule, PricePipe],
  templateUrl: './settlement.component.html',
  styleUrl: './settlement.component.scss'
})
export class VendorSettlementComponent {
  readonly vendorData = inject(VendorDataService);
  private readonly notification = inject(ToastService);

  activeTab = signal<'current' | 'history'>('current');
  showBankModal = signal(false);

  // Bank beneficiary details
  bankInfo = signal({
    bankName: 'Ngân hàng TMCP Ngoại Thương Việt Nam (Vietcombank)',
    branch: 'Chi nhánh Lâm Đồng',
    accountNumber: '0071001928492',
    accountHolder: 'NGUYEN VAN NONG - HTX LAC DUONG',
    isVerified: true
  });

  // History periods (Fix VND-18: Khớp chu kỳ bán nguyệt và công thức 5% phí sàn + 5% ký quỹ)
  historicalPeriods = signal<HistoricalSettlement[]>([
    {
      periodId: 'KS-2026-10-A',
      dateRange: '01/10/2026 - 15/10/2026',
      grossSales: 42500000,
      platformFee: 2125000,
      escrowReserve: 2125000,
      deductions: 0,
      netPayout: 38250000,
      paidDate: '20/10/2026',
      bankTxRef: 'VCB-FT26294829103',
      status: 'paid'
    },
    {
      periodId: 'KS-2026-09-B',
      dateRange: '16/09/2026 - 30/09/2026',
      grossSales: 36800000,
      platformFee: 1840000,
      escrowReserve: 1840000,
      deductions: 256000,
      netPayout: 32864000,
      paidDate: '05/10/2026',
      bankTxRef: 'VCB-FT26279182049',
      status: 'paid'
    },
    {
      periodId: 'KS-2026-09-A',
      dateRange: '01/09/2026 - 15/09/2026',
      grossSales: 29400000,
      platformFee: 1470000,
      escrowReserve: 1470000,
      deductions: 0,
      netPayout: 26460000,
      paidDate: '20/09/2026',
      bankTxRef: 'VCB-FT26259019283',
      status: 'paid'
    }
  ]);

  exportStatement(): void {
    this.notification.success('Đang tạo và tải về file bảng kê đối soát chi tiết: "Bang_Ke_Doi_Soat_T10_2026.xlsx".', 'Tải bảng kê');
  }

  openBankModal(): void {
    this.showBankModal.set(true);
  }

  closeBankModal(): void {
    this.showBankModal.set(false);
  }

  saveBankDetails(): void {
    this.notification.success('Đã cập nhật thông tin tài khoản ngân hàng nhận thanh toán.', 'Cập nhật thành công');
    this.closeBankModal();
  }
}

