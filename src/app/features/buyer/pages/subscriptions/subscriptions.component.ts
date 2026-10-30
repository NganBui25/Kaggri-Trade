import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { PricePipe, NumberDotPipe } from '../../../../shared/pipes/price.pipe';

interface SubscriptionPlan {
  id: string;
  vendorName: string;
  vendorAvatar: string;
  productName: string;
  frequency: string;
  quantityPerDelivery: number;
  unit: string;
  unitPrice: number;
  deliveryWindow: string;
  status: 'active' | 'paused';
  nextDeliveryDate: string;
}

@Component({
  selector: 'app-subscriptions',
  standalone: true,
  imports: [CommonModule, RouterModule, PricePipe, NumberDotPipe],
  templateUrl: './subscriptions.component.html',
  styleUrl: './subscriptions.component.scss'
})
export class SubscriptionsComponent {
  subscriptions: SubscriptionPlan[] = [
    {
      id: 'SUB-2026-001',
      vendorName: 'Hợp tác xã Nông nghiệp Công nghệ cao Lạc Dương',
      vendorAvatar: 'LD',
      productName: 'Bắp cải sạch Đà Lạt VietGAP',
      frequency: 'Định kỳ Thứ 2 & Thứ 5 hàng tuần',
      quantityPerDelivery: 300,
      unit: 'kg',
      unitPrice: 16800,
      deliveryWindow: '04:00 - 06:00 sáng',
      status: 'active',
      nextDeliveryDate: '02/11/2026'
    },
    {
      id: 'SUB-2026-002',
      vendorName: 'Hợp tác xã Rau sạch Hữu cơ Đơn Dương',
      vendorAvatar: 'DD',
      productName: 'Xà lách Lô Lô xanh thủy canh',
      frequency: 'Định kỳ Thứ 3 & Thứ 7 hàng tuần',
      quantityPerDelivery: 100,
      unit: 'kg',
      unitPrice: 45000,
      deliveryWindow: '05:00 - 07:00 sáng',
      status: 'active',
      nextDeliveryDate: '03/11/2026'
    }
  ];

  toggleStatus(plan: SubscriptionPlan): void {
    plan.status = plan.status === 'active' ? 'paused' : 'active';
  }
}

