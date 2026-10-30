import { Component, input, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { VendorOrderStatus } from '../../models/vendor.model';

@Component({
  selector: 'app-vendor-order-status-badge',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './order-status-badge.component.html',
  styleUrl: './order-status-badge.component.scss'
})
export class VendorOrderStatusBadgeComponent {
  status = input.required<VendorOrderStatus>();

  badgeConfig = computed(() => {
    switch (this.status()) {
      case 'pending_confirmation':
        return {
          label: 'Chờ xác nhận',
          classes: 'bg-amber-100 text-amber-800 border-amber-200'
        };
      case 'confirmed':
        return {
          label: 'Đã xác nhận',
          classes: 'bg-sky-100 text-sky-800 border-sky-200'
        };
      case 'preparing':
        return {
          label: 'Đang chuẩn bị',
          classes: 'bg-blue-100 text-blue-800 border-blue-200'
        };
      case 'shipped':
        return {
          label: 'Đang giao hàng',
          classes: 'bg-indigo-100 text-indigo-800 border-indigo-200'
        };
      case 'delivered':
        return {
          label: 'Đã giao thành công',
          classes: 'bg-emerald-100 text-emerald-800 border-emerald-200'
        };
      case 'rejected':
        return {
          label: 'Đã từ chối',
          classes: 'bg-rose-100 text-rose-800 border-rose-200'
        };
    }
  });
}
