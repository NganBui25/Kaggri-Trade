import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminAuthService } from '../../services/admin-auth.service';
import { AdminDataService } from '../../services/admin-data.service';
import { AdminForbiddenComponent } from '../../components/forbidden/forbidden.component';
import { ToastService } from '../../../../shared/components/toast/toast.service';

@Component({
  selector: 'app-admin-reports',
  standalone: true,
  imports: [CommonModule, FormsModule, AdminForbiddenComponent],
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.scss'
})
export class AdminReportsComponent {
  readonly auth = inject(AdminAuthService);
  readonly data = inject(AdminDataService);
  private readonly toast = inject(ToastService);

  readonly canAccess = computed(() => this.auth.canAccessModule('reports'));

  selectedPeriod = signal<'7d' | '30d' | '90d' | 'all'>('30d');

  // GMV Summary based on period
  readonly summaryMetrics = computed(() => {
    const p = this.selectedPeriod();
    if (p === '7d') {
      return {
        gmv: 492000000,
        orders: 142,
        feeRevenue: 24600000,
        disputeRate: 1.1,
        avgResolutionHours: 14.2,
        growthGmv: '+18.4%',
        growthOrders: '+12.0%'
      };
    } else if (p === '30d') {
      return {
        gmv: 2180000000,
        orders: 685,
        feeRevenue: 109000000,
        disputeRate: 1.4,
        avgResolutionHours: 16.5,
        growthGmv: '+14.2%',
        growthOrders: '+9.8%'
      };
    } else {
      return {
        gmv: 6450000000,
        orders: 1980,
        feeRevenue: 322500000,
        disputeRate: 1.6,
        avgResolutionHours: 18.0,
        growthGmv: '+22.5%',
        growthOrders: '+15.4%'
      };
    }
  });

  // Top Categories Share
  readonly categoriesShare = [
    { name: 'Rau củ hữu cơ & Đà Lạt', percent: 38, gmv: 828400000, color: 'bg-emerald-600' },
    { name: 'Trái cây đặc sản VietGAP', percent: 28, gmv: 610400000, color: 'bg-teal-600' },
    { name: 'Gạo sạch & Các loại hạt', percent: 20, gmv: 436000000, color: 'bg-amber-600' },
    { name: 'Nông sản chế biến & Khác', percent: 14, gmv: 305200000, color: 'bg-stone-500' }
  ];

  // Vendor Score Distribution Buckets (Fix ADM-44)
  readonly vendorScoreBuckets = [
    { label: 'Xuất sắc (90 - 100 điểm)', count: 48, percent: 40, status: 'emerald' },
    { label: 'Đạt chuẩn (75 - 89 điểm)', count: 46, percent: 38, status: 'teal' },
    { label: 'Cần cải thiện (50 - 74 điểm)', count: 20, percent: 17, status: 'amber' },
    { label: 'Cảnh báo vi phạm (< 50 điểm)', count: 6, percent: 5, status: 'rose' }
  ];

  // Dispute by classification
  readonly disputeBreakdown = [
    { reason: 'Chất lượng nông sản không đúng cam kết (Héo, dập)', count: 12, percent: 55, color: 'bg-rose-500' },
    { reason: 'Thiếu số lượng / Trọng lượng sai lệch', count: 6, percent: 27, color: 'bg-amber-500' },
    { reason: 'Giao hàng trễ hạn thỏa thuận', count: 3, percent: 14, color: 'bg-blue-500' },
    { reason: 'Bao bì, quy cách đóng gói không đạt', count: 1, percent: 4, color: 'bg-stone-400' }
  ];

  // Monthly GMV Bar chart items
  readonly trendBars = [
    { label: 'Tuần 1', gmv: 480, height: '65%' },
    { label: 'Tuần 2', gmv: 520, height: '72%' },
    { label: 'Tuần 3', gmv: 490, height: '68%' },
    { label: 'Tuần 4', gmv: 690, height: '95%' }
  ];

  exportReport(): void {
    this.toast.success(
      `Đã tạo báo cáo thống kê kỳ ${this.selectedPeriod()}. Đang tải xuống tệp dữ liệu...`,
      'Xuất báo cáo thành công'
    );
  }
}

