import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { OrderService } from '../../services/order.service';
import { BuyerOrder, SubOrder } from '../../../../shared/models/order.model';
import { PricePipe, NumberDotPipe } from '../../../../shared/pipes/price.pipe';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, RouterModule, PricePipe, NumberDotPipe],
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.scss'
})
export class OrdersComponent {
  private readonly orderService = inject(OrderService);
  private readonly notification = inject(NotificationService);

  readonly orders = this.orderService.orders;
  selectedOrder = signal<BuyerOrder | null>(null);

  // Active tab in order detail modal / view: 'overview' | 'vendors' | 'payment' | 'invoice'
  activeDetailTab = signal<'overview' | 'vendors' | 'payment' | 'invoice'>('overview');

  constructor() {
    const list = this.orders();
    if (list.length > 0) {
      this.selectedOrder.set(list[0]);
    }
  }

  selectOrder(order: BuyerOrder): void {
    this.selectedOrder.set(order);
  }

  // Count distinct vendors for an order (Fix BUY-31)
  getVendorCount(order: BuyerOrder): number {
    const set = new Set(order.subOrders.map(s => s.vendorId));
    return set.size;
  }

  // Confirm receipt of goods
  confirmReceipt(subOrder: SubOrder): void {
    subOrder.status = 'delivered';
    subOrder.statusLabel = 'Đã nhận hàng (Chờ kiểm tra)';
    subOrder.statusBadgeClass = 'bg-blue-100 text-blue-800 border-blue-200';
    this.notification.success(
      `Đã xác nhận nhận hàng từ ${subOrder.vendorShortName}. Vui lòng kiểm tra chất lượng trong 24h.`,
      'Đã nhận hàng'
    );
  }
}

