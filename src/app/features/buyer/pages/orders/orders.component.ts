import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { OrderService } from '../../services/order.service';
import { BuyerOrder, SubOrder } from '../../../../shared/models/order.model';
import { PricePipe, NumberDotPipe } from '../../../../shared/pipes/price.pipe';
import { ToastService } from '../../../../shared/components/toast/toast.service';
import { OrderProgressStepperComponent } from '../../components/order-progress-stepper/order-progress-stepper.component';

export type OrderFilter = 'all' | 'pending' | 'confirmed' | 'preparing' | 'shipping' | 'delivered';

@Component({
  selector: 'app-orders',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, PricePipe, NumberDotPipe, OrderProgressStepperComponent],
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.scss'
})
export class OrdersComponent {
  private readonly orderService = inject(OrderService);
  private readonly notification = inject(ToastService);

  readonly orders = this.orderService.orders;
  
  // Selected order for detail view (null means viewing the orders table)
  selectedOrder = signal<BuyerOrder | null>(null);

  // Search query & filter tab
  searchQuery = signal<string>('');
  activeFilter = signal<OrderFilter>('all');

  // Detail view active tab
  activeDetailTab = signal<'overview' | 'vendors' | 'payment' | 'invoice'>('overview');

  // Filtered orders list
  filteredOrders = computed(() => {
    let list = this.orders();
    const filter = this.activeFilter();
    const q = this.searchQuery().toLowerCase().trim();

    if (filter !== 'all') {
      list = list.filter(ord => {
        const step = this.getOrderStepNumber(ord);
        if (filter === 'pending') return step <= 2;
        if (filter === 'confirmed') return step === 3;
        if (filter === 'preparing') return step === 4;
        if (filter === 'shipping') return step === 5;
        if (filter === 'delivered') return step === 6;
        return true;
      });
    }

    if (q) {
      list = list.filter(ord => {
        const matchId = ord.id.toLowerCase().includes(q);
        const matchVendor = (ord.subOrders || []).some(s => 
          s.vendorName.toLowerCase().includes(q) || 
          s.vendorShortName.toLowerCase().includes(q)
        );
        const matchProduct = (ord.subOrders || []).some(s => 
          (s.items || []).some(i => i.productName.toLowerCase().includes(q))
        );
        return matchId || matchVendor || matchProduct;
      });
    }

    return list;
  });

  selectOrder(order: BuyerOrder): void {
    this.selectedOrder.set(order);
    this.activeDetailTab.set('overview');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  backToList(): void {
    this.selectedOrder.set(null);
  }

  setFilter(filter: OrderFilter): void {
    this.activeFilter.set(filter);
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

  // Status badge matching reference prototype
  getOrderStatusInfo(order: BuyerOrder): { label: string; class: string } {
    const step = this.getOrderStepNumber(order);
    switch (step) {
      case 1:
      case 2:
        return { label: 'Chờ xác nhận', class: 'bg-[#fef9c3] text-[#854d0e] border-[#fef08a]' };
      case 3:
        return { label: 'Đã xác nhận', class: 'bg-[#dcfce7] text-[#166534] border-[#bbf7d0]' };
      case 4:
        return { label: 'Đang chuẩn bị', class: 'bg-[#ccfbf1] text-[#115e59] border-[#99f6e4]' };
      case 5:
        return { label: 'Đang vận chuyển', class: 'bg-[#e0f2fe] text-[#0369a1] border-[#bae6fd]' };
      case 6:
        return { label: 'Đã giao', class: 'bg-[#eaf4ee] text-[#0d623b] border-[#c2e1cd]' };
      default:
        return { label: 'Đang xử lý', class: 'bg-stone-100 text-stone-700 border-stone-200' };
    }
  }

  getVendorNames(order: BuyerOrder): string {
    if (!order.subOrders || order.subOrders.length === 0) return 'Đang kết nối';
    const names = order.subOrders.map(s => s.vendorShortName || s.vendorName);
    if (names.length <= 2) return names.join(', ');
    return `${names[0]}, ${names[1]} (+${names.length - 2} NCC)`;
  }

  getProductSummary(order: BuyerOrder): string {
    const allItems = (order.subOrders || []).flatMap(s => s.items || []);
    if (allItems.length === 0) return 'Nông sản sỉ Kaggri';
    const first = allItems[0];
    const firstStr = `${first.quantity} ${first.unit} ${first.productName}`;
    if (allItems.length === 1) return firstStr;
    return `${firstStr} (+${allItems.length - 1} loại khác)`;
  }

  getDeliveryDate(order: BuyerOrder): string {
    const firstSub = order.subOrders?.[0];
    if (firstSub?.estimatedDelivery) {
      return firstSub.estimatedDelivery.split(' ')[0] || firstSub.estimatedDelivery;
    }
    return order.createdAt?.split(' ')[0] || order.createdAt;
  }

  getVendorCount(order: BuyerOrder): number {
    const set = new Set(order.subOrders.map(s => s.vendorId));
    return set.size;
  }

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
