import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { VendorDataService } from '../../services/vendor-data.service';
import { VendorOrder, VendorOrderStatus } from '../../models/vendor.model';
import { PricePipe, NumberDotPipe } from '../../../../shared/pipes/price.pipe';

@Component({
  selector: 'app-vendor-orders',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, PricePipe, NumberDotPipe],
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.scss'
})
export class VendorOrdersComponent {
  readonly vendorData = inject(VendorDataService);

  // Filter with ALL statuses (Fix VND-06)
  selectedStatus = signal<string>('all');
  searchQuery = signal<string>('');

  selectedOrder = signal<VendorOrder | null>(null);

  // Modal Reject Order
  rejectModalOpen = signal(false);
  rejectReasonText = signal('');

  // Modal Ship Order
  shipModalOpen = signal(false);
  trackingCodeInput = signal('TRK-LD-2026-991');

  filteredOrders = computed(() => {
    let list = this.vendorData.orders();

    if (this.selectedStatus() !== 'all') {
      list = list.filter(o => o.status === this.selectedStatus());
    }

    const q = this.searchQuery().toLowerCase().trim();
    if (q) {
      list = list.filter(o => 
        o.id.toLowerCase().includes(q) || 
        o.buyerCompany.toLowerCase().includes(q) ||
        o.buyerName.toLowerCase().includes(q)
      );
    }

    return list;
  });

  constructor() {
    const list = this.vendorData.orders();
    if (list.length > 0) {
      this.selectedOrder.set(list[0]);
    }
  }

  selectOrder(order: VendorOrder): void {
    this.selectedOrder.set(order);
  }

  // Fix VND-07: Confirm order updates reserved stock
  onConfirmOrder(orderId: string): void {
    this.vendorData.confirmOrder(orderId);
    const updated = this.vendorData.orders().find(o => o.id === orderId);
    if (updated) this.selectedOrder.set(updated);
  }

  openRejectModal(): void {
    this.rejectReasonText.set('');
    this.rejectModalOpen.set(true);
  }

  closeRejectModal(): void {
    this.rejectModalOpen.set(false);
  }

  // Fix VND-02, VND-03, VND-04: Reject order with reason & proper timeline
  submitReject(): void {
    const ord = this.selectedOrder();
    if (!ord) return;

    const reason = this.rejectReasonText().trim() || 'Hàng tại luống chưa đạt quy cách chất lượng hoặc thiếu hụt tồn';
    this.vendorData.rejectOrder(ord.id, reason);
    this.rejectModalOpen.set(false);

    const updated = this.vendorData.orders().find(o => o.id === ord.id);
    if (updated) this.selectedOrder.set(updated);
  }

  openShipModal(): void {
    this.shipModalOpen.set(true);
  }

  closeShipModal(): void {
    this.shipModalOpen.set(false);
  }

  // Fix VND-08: Ship order
  submitShip(): void {
    const ord = this.selectedOrder();
    if (!ord) return;

    this.vendorData.updateShippingStatus(ord.id, 'shipped', this.trackingCodeInput());
    this.shipModalOpen.set(false);

    const updated = this.vendorData.orders().find(o => o.id === ord.id);
    if (updated) this.selectedOrder.set(updated);
  }

  onPrepareOrder(orderId: string): void {
    this.vendorData.updateShippingStatus(orderId, 'preparing');
    const updated = this.vendorData.orders().find(o => o.id === orderId);
    if (updated) this.selectedOrder.set(updated);
  }
}

