import { Component, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AdminAuthService } from '../../services/admin-auth.service';
import { AdminDataService } from '../../services/admin-data.service';
import { PricePipe, NumberDotPipe } from '../../../../shared/pipes/price.pipe';
import { AdminKpi } from '../../models/admin.model';

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, PricePipe, NumberDotPipe],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class AdminDashboardComponent {
  readonly auth = inject(AdminAuthService);
  readonly data = inject(AdminDataService);

  readonly currentAdmin = this.auth.currentAdmin;

  // Filtered KPIs by role (Fix ADM-R26, ADM-11, ADM-12)
  readonly displayedKpis = computed<AdminKpi[]>(() => {
    const role = this.currentAdmin().role;

    const allKpis: AdminKpi[] = [
      {
        key: 'gmv',
        label: 'GMV tháng này',
        value: 4258000000,
        change: '+12,4%',
        changeDir: 'up', // ↗ (Fix ADM-11)
        icon: 'gmv',
        category: 'fin',
        targetModule: '/admin/transactions'
      },
      {
        key: 'commission',
        label: 'Hoa hồng nền tảng (5%)',
        value: 212900000,
        change: '+11,8%',
        changeDir: 'up', // ↗ (Fix ADM-11)
        icon: 'commission',
        category: 'fin',
        targetModule: '/admin/settlements'
      },
      {
        key: 'netRevenue',
        label: 'Doanh thu ròng Kaggri',
        value: 184000000,
        change: '+9,3%',
        changeDir: 'up',
        icon: 'netRevenue',
        category: 'fin',
        targetModule: '/admin/settlements'
      },
      {
        key: 'vendorsActive',
        label: 'Người bán hoạt động (30 ngày)',
        value: 248,
        unit: 'nhà vườn',
        change: '+6',
        changeDir: 'up',
        icon: 'vendorsActive',
        category: 'ops',
        targetModule: '/admin/accounts-vendor'
      },
      {
        key: 'buyersActive',
        label: 'Người mua hoạt động',
        value: 184,
        unit: 'doanh nghiệp',
        change: '+12',
        changeDir: 'up',
        icon: 'buyersActive',
        category: 'ops',
        targetModule: '/admin/accounts-buyer'
      },
      {
        key: 'paymentSuccess',
        label: 'Tỷ lệ thanh toán thành công',
        value: 98.4,
        unit: '%',
        change: '+0,3%',
        changeDir: 'up',
        icon: 'paymentSuccess',
        category: 'fin',
        targetModule: '/admin/transactions'
      },
      {
        key: 'orderComplete',
        label: 'Tỷ lệ hoàn thành đơn',
        value: 95.7,
        unit: '%',
        change: '-0,4%',
        changeDir: 'down', // ↘ (Fix ADM-11)
        icon: 'orderComplete',
        category: 'ops',
        targetModule: '/admin/reports'
      },
      {
        key: 'disputeRate',
        label: 'Tỷ lệ tranh chấp',
        value: 1.8,
        unit: '%',
        change: '+0,2%',
        changeDir: 'up', // Tranh chấp tăng là cảnh báo
        icon: 'disputeRate',
        category: 'ops',
        targetModule: '/admin/disputes'
      }
    ];

    if (role === 'SUPER_ADMIN' || role === 'COMP_ADMIN') {
      return allKpis;
    }
    if (role === 'OPS_ADMIN') {
      return allKpis.filter(k => k.category === 'ops' || k.key === 'gmv');
    }
    if (role === 'FIN_ADMIN') {
      return allKpis.filter(k => k.category === 'fin');
    }
    return allKpis;
  });

  // Actionable tasks ("Việc cần xử lý") for current role (Fix ADM-14)
  readonly pendingTasks = computed(() => {
    const role = this.currentAdmin().role;
    const tasks = [];

    const pendingKyc = this.data.kycList().filter(k => k.status === 'PENDING').length;
    if (pendingKyc > 0 && (role === 'OPS_ADMIN' || role === 'SUPER_ADMIN')) {
      tasks.push({
        title: `${pendingKyc} hồ sơ Người bán (KYC) đang chờ xét duyệt`,
        desc: 'Có hồ sơ vượt SLA 48h, cần thẩm định giấy phép kinh doanh & VietGAP.',
        route: '/admin/kyc',
        badge: 'Khẩn',
        badgeClass: 'bg-rose-100 text-rose-800'
      });
    }

    const pendingDisp = this.data.disputes().filter(d => d.status === 'OPENED' || d.status === 'UNDER_REVIEW').length;
    if (pendingDisp > 0 && (role === 'OPS_ADMIN' || role === 'SUPER_ADMIN')) {
      tasks.push({
        title: `${pendingDisp} tranh chấp cần ra phán quyết`,
        desc: 'Tranh chấp bắp cải dập lạnh & sai sản phẩm cam kết đang chờ Ops đánh giá.',
        route: '/admin/disputes',
        badge: 'Ưu tiên',
        badgeClass: 'bg-amber-100 text-amber-800'
      });
    }

    const pendingRef = this.data.refunds().filter(r => r.status === 'PENDING_EXECUTION' || r.status === 'FAILED').length;
    if (pendingRef > 0 && (role === 'FIN_ADMIN' || role === 'SUPER_ADMIN')) {
      tasks.push({
        title: `${pendingRef} lệnh hoàn tiền Escrow cần thực thi`,
        desc: 'Đội Vận hành đã duyệt hoàn tiền, đang chờ Tài chính bấm chuyển khoản cho khách.',
        route: '/admin/refunds',
        badge: 'Tài chính',
        badgeClass: 'bg-emerald-100 text-emerald-800'
      });
    }

    const pendingSettlement = this.data.settlements().filter(s => s.status === 'CALCULATED' || s.status === 'REVIEWED').length;
    if (pendingSettlement > 0 && (role === 'FIN_ADMIN' || role === 'SUPER_ADMIN')) {
      tasks.push({
        title: `Kỳ đối soát tuần 3 cần rà soát & chốt thanh toán`,
        desc: 'Bảng đối chiếu 2 nhà vườn liên kết đã tính toán xong Net Payout.',
        route: '/admin/settlements',
        badge: 'Đối soát',
        badgeClass: 'bg-sky-100 text-sky-800'
      });
    }

    return tasks;
  });

  // Recent 7-day GMV data (Fix ADM-13: Matching monthly total)
  readonly gmvSeries = [
    { date: '12/09', gmv: 520000000 },
    { date: '13/09', gmv: 580000000 },
    { date: '14/09', gmv: 610000000 },
    { date: '15/09', gmv: 640000000 },
    { date: '16/09', gmv: 690000000 },
    { date: '17/09', gmv: 740000000 },
    { date: '18/09', gmv: 790000000 }
  ];

  readonly maxGmv = 800000000;

  readonly topVendors = [
    { name: 'HTX Nông nghiệp CNC Lạc Dương', gmv: 528000000, region: 'Lâm Đồng' },
    { name: 'HTX Rau sạch Hữu cơ Đơn Dương', gmv: 412000000, region: 'Lâm Đồng' },
    { name: 'Hộ KD Cam Cao Phong Hòa Bình', gmv: 287000000, region: 'Hòa Bình' }
  ];
}

