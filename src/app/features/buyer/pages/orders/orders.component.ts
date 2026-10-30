import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { OrderService } from '../../services/order.service';
import { BuyerOrder, SubOrder } from '../../../../shared/models/order.model';
import { PricePipe, NumberDotPipe } from '../../../../shared/pipes/price.pipe';
import { ToastService } from '../../../../shared/components/toast/toast.service';
import { OrderProgressStepperComponent } from '../../components/order-progress-stepper/order-progress-stepper.component';

export type OrderFilter = 'all' | 'processing' | 'shipping' | 'completed';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, RouterModule, PricePipe, NumberDotPipe, OrderProgressStepperComponent],
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.scss'
})
export class OrdersComponent {
  private readonly orderService = inject(OrderService);
  private readonly notification = inject(ToastService);

  readonly orders = this.orderService.orders;
  selectedOrder = signal<BuyerOrder | null>(null);

  // Active filter tab
  activeFilter = signal<OrderFilter>('all');

  // Active tab in order detail view: 'overview' | 'vendors' | 'payment' | 'invoice'
  activeDetailTab = signal<'overview' | 'vendors' | 'payment' | 'invoice'>('overview');

  // Filtered orders list
  filteredOrders = computed(() => {
    const list = this.orders();
    const filter = this.activeFilter();

    if (filter === 'all') return list;

    return list.filter(ord => {
      const step = this.getOrderStepNumber(ord);
      if (filter === 'processing') return step >= 1 && step <= 4;
      if (filter === 'shipping') return step === 5;
      if (filter === 'completed') return step === 6;
      return true;
    });
  });

  constructor() {
    const list = this.orders();
    if (list.length > 0) {
      this.selectedOrder.set(list[0]);
    }
  }

  selectOrder(order: BuyerOrder): void {
    this.selectedOrder.set(order);
  }

  setFilter(filter: OrderFilter): void {
    this.activeFilter.set(filter);
    const list = this.filteredOrders();
    if (list.length > 0 && (!this.selectedOrder() || !list.some(o => o.id === this.selectedOrder()?.id))) {
      this.selectedOrder.set(list[0]);
    }
  }

  // Calculate step number (1 to 6)
  getOrderStepNumber(order: BuyerOrder): number {
    if (order.paymentStatus === 'pending') return 2;
    if (!order.subOrders || order.subOrders.length === 0) return 2;

    const statuses = order.subOrders.map(s => s.status);
    if (statuses.every(s => s === 'completed' || s === 'delivered')) return 6;
    if (statuses.some(s => s === 'shipped')) return 5;
    if (statuses.some(s => s === 'preparing')) return 4;
    if (statuses.every(s => s === 'confirmed') || statuses.some(s => s === 'confirmed')) return 3;
    if (statuses.every(s => s === 'pending_confirmation')) return 3;

    return 2;
  }

  // Get human-readable step info for cards in the left list
  getOrderStepInfo(order: BuyerOrder): { step: number; label: string; badgeClass: string } {
    const step = this.getOrderStepNumber(order);
    switch (step) {
      case 1:
        return { step: 1, label: 'Đã tạo đơn', badgeClass: 'bg-stone-100 text-stone-700 border-stone-200' };
      case 2:
        return { step: 2, label: 'Chờ thanh toán', badgeClass: 'bg-amber-100 text-amber-800 border-amber-200' };
      case 3:
        return { step: 3, label: 'NCC xác nhận', badgeClass: 'bg-emerald-50 text-[#0d623b] border-emerald-200' };
      case 4:
        return { step: 4, label: 'Đang chuẩn bị', badgeClass: 'bg-amber-100 text-amber-900 border-amber-300' };
      case 5:
        return { step: 5, label: 'Đang vận chuyển', badgeClass: 'bg-sky-100 text-sky-800 border-sky-300' };
      case 6:
        return { step: 6, label: 'Đã hoàn tất', badgeClass: 'bg-emerald-100 text-emerald-900 border-emerald-300' };
      default:
        return { step: 2, label: 'Đang xử lý', badgeClass: 'bg-stone-100 text-stone-700 border-stone-200' };
    }
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
