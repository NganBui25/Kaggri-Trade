import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PricePipe, NumberDotPipe } from '../../../../shared/pipes/price.pipe';
import { ToastService } from '../../../../shared/components/toast/toast.service';
import { BuyerSubscriptionModalComponent, SubscriptionFormData } from '../../components/subscription-modal/subscription-modal.component';

export interface SubscriptionPlan {
  id: string;
  vendorName: string;
  vendorAvatar: string;
  productName: string;
  productImage?: string;
  frequency: string;
  quantityPerDelivery: number;
  unit: string;
  unitPrice: number;
  deliveryWindow: string;
  status: 'active' | 'paused';
  nextDeliveryDate: string;
  startDate?: string;
  endDate?: string;
  warehouseAddress?: string;
  receiverContact?: string;
  packagingNotes?: string;
  estimatedMonthlyAmount?: number;
}

@Component({
  selector: 'app-subscriptions',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    FormsModule, 
    PricePipe, 
    NumberDotPipe, 
    BuyerSubscriptionModalComponent
  ],
  templateUrl: './subscriptions.component.html',
  styleUrl: './subscriptions.component.scss'
})
export class SubscriptionsComponent {
  private readonly toastService = inject(ToastService);

  // Modal states
  isModalOpen = signal<boolean>(false);
  isDetailOpen = signal<boolean>(false);
  selectedDetailPlan = signal<SubscriptionPlan | null>(null);

  // Status Filter: 'all' | 'active' | 'paused'
  statusFilter = signal<'all' | 'active' | 'paused'>('all');

  // Subscription list
  subscriptions = signal<SubscriptionPlan[]>([
    {
      id: 'SUB-2026-001',
      vendorName: 'Hợp tác xã Nông nghiệp Công nghệ cao Lạc Dương',
      vendorAvatar: 'LD',
      productName: 'Bắp cải sạch Đà Lạt VietGAP',
      productImage: 'https://images.unsplash.com/photo-1594282486552-05b4d80fbb9f?auto=format&fit=crop&w=800&q=80',
      frequency: 'Định kỳ Thứ 2 & Thứ 5 hàng tuần',
      quantityPerDelivery: 300,
      unit: 'kg',
      unitPrice: 16800,
      deliveryWindow: '04:00 - 06:00 sáng',
      status: 'active',
      nextDeliveryDate: '02/11/2026',
      startDate: '01/10/2026',
      endDate: '31/12/2026',
      warehouseAddress: 'Kho Trung chuyển Bách Hóa Xanh, 128 Đường số 7, P. Bình Trị Đông B, Q. Bình Tân, TP. HCM',
      receiverContact: 'Nguyễn Minh Anh • 090 123 4567',
      packagingNotes: 'Bao lưới 25kg, xe lạnh chuyên dụng ≤ 8°C.',
      estimatedMonthlyAmount: 40320000
    },
    {
      id: 'SUB-2026-002',
      vendorName: 'Hợp tác xã Rau sạch Hữu cơ Đơn Dương',
      vendorAvatar: 'DD',
      productName: 'Xà lách Lô Lô xanh thủy canh',
      productImage: 'https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?auto=format&fit=crop&w=800&q=80',
      frequency: 'Định kỳ Thứ 3 & Thứ 7 hàng tuần',
      quantityPerDelivery: 100,
      unit: 'kg',
      unitPrice: 45000,
      deliveryWindow: '05:00 - 07:00 sáng',
      status: 'active',
      nextDeliveryDate: '03/11/2026',
      startDate: '15/10/2026',
      endDate: '15/01/2027',
      warehouseAddress: 'Kho Trung chuyển Bách Hóa Xanh, 128 Đường số 7, P. Bình Trị Đông B, Q. Bình Tân, TP. HCM',
      receiverContact: 'Nguyễn Minh Anh • 090 123 4567',
      packagingNotes: 'Thùng carton 5kg nguyên rễ xốp giữ ẩm.',
      estimatedMonthlyAmount: 36000000
    }
  ]);

  // Filtered List
  filteredSubscriptions = computed(() => {
    const filter = this.statusFilter();
    if (filter === 'all') return this.subscriptions();
    return this.subscriptions().filter(s => s.status === filter);
  });

  // Active Count
  activeCount = computed(() => {
    return this.subscriptions().filter(s => s.status === 'active').length;
  });

  // Paused Count
  pausedCount = computed(() => {
    return this.subscriptions().filter(s => s.status === 'paused').length;
  });

  // Total monthly estimated volume
  totalMonthlyVolume = computed(() => {
    return this.subscriptions().reduce((sum, s) => {
      if (s.status !== 'active') return sum;
      return sum + (s.quantityPerDelivery * 8); // approximate 8 times/month
    }, 0);
  });

  // Open & Close Modal
  openCreateModal(): void {
    this.isModalOpen.set(true);
  }

  closeCreateModal(): void {
    this.isModalOpen.set(false);
  }

  // Handle Create Subscription
  handleCreateSubscription(newPlan: SubscriptionFormData): void {
    const plan: SubscriptionPlan = {
      id: newPlan.id,
      vendorName: newPlan.vendorName,
      vendorAvatar: newPlan.vendorAvatar,
      productName: newPlan.productName,
      productImage: newPlan.productImage,
      frequency: newPlan.frequency,
      quantityPerDelivery: newPlan.quantityPerDelivery,
      unit: newPlan.unit,
      unitPrice: newPlan.unitPrice,
      deliveryWindow: newPlan.deliveryWindow,
      status: 'active',
      nextDeliveryDate: newPlan.nextDeliveryDate,
      startDate: newPlan.startDate,
      endDate: newPlan.endDate,
      warehouseAddress: newPlan.warehouseAddress,
      receiverContact: newPlan.receiverContact,
      packagingNotes: newPlan.packagingNotes,
      estimatedMonthlyAmount: newPlan.estimatedMonthlyAmount
    };

    this.subscriptions.update(list => [plan, ...list]);
    this.isModalOpen.set(false);

    this.toastService.success(
      `Đã đăng ký hợp đồng cung ứng định kỳ cho "${plan.productName}" với ${plan.vendorName}!`,
      'Đăng ký thành công'
    );
  }

  // Toggle status
  toggleStatus(plan: SubscriptionPlan): void {
    const nextStatus = plan.status === 'active' ? 'paused' : 'active';
    this.subscriptions.update(list => 
      list.map(item => item.id === plan.id ? { ...item, status: nextStatus } : item)
    );

    if (nextStatus === 'active') {
      this.toastService.success(`Đã kích hoạt lại lịch giao hàng cho hợp đồng ${plan.id}.`, 'Kích hoạt thành công');
    } else {
      this.toastService.warning(`Đã tạm dừng lịch giao hàng cho hợp đồng ${plan.id}.`, 'Tạm dừng');
    }
  }

  // Cancel / Delete plan
  cancelSubscription(id: string): void {
    const plan = this.subscriptions().find(s => s.id === id);
    if (!plan) return;

    if (confirm(`Bạn có chắc chắn muốn kết thúc và hủy hợp đồng cung ứng định kỳ ${id} (${plan.productName}) không?`)) {
      this.subscriptions.update(list => list.filter(s => s.id !== id));
      if (this.selectedDetailPlan()?.id === id) {
        this.closeDetail();
      }
      this.toastService.info(`Đã hủy hợp đồng cung ứng định kỳ ${id}.`, 'Đã chấm dứt');
    }
  }

  // Open Detail modal
  openDetail(plan: SubscriptionPlan): void {
    this.selectedDetailPlan.set(plan);
    this.isDetailOpen.set(true);
  }

  closeDetail(): void {
    this.isDetailOpen.set(false);
    this.selectedDetailPlan.set(null);
  }
}
