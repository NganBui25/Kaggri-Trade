import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { OrderService } from '../../services/order.service';
import { DisputeRecord } from '../../../../shared/models/order.model';
import { PricePipe, NumberDotPipe } from '../../../../shared/pipes/price.pipe';

@Component({
  selector: 'app-dispute',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, PricePipe, NumberDotPipe],
  templateUrl: './dispute.component.html',
  styleUrl: './dispute.component.scss'
})
export class DisputeComponent {
  private readonly orderService = inject(OrderService);
  private readonly route = inject(ActivatedRoute);

  readonly disputes = this.orderService.disputes;
  readonly orders = this.orderService.orders;

  isCreateModalOpen = signal(false);

  // New dispute form state
  newDispute = {
    orderId: 'PO-20260917-8831',
    subOrderId: 'VO-20260917-01',
    productName: 'Bắp cải sạch Đà Lạt VietGAP',
    affectedQty: 25,
    unit: 'kg',
    issueType: 'damaged' as DisputeRecord['issueType'],
    issueLabel: 'Nông sản bị dập nát do đóng thùng',
    requestedSolution: 'refund_partial' as DisputeRecord['requestedSolution'],
    solutionLabel: 'Hoàn tiền phần hư hỏng',
    description: 'Khoảng 25kg bắp cải ở lớp đáy thùng bị dập nát do xếp chồng quá tải trong xe tải lạnh.',
    evidenceImages: [
      'https://images.unsplash.com/photo-1594282486552-05b4d80fbb9f?auto=format&fit=crop&w=400&q=80'
    ]
  };

  constructor() {
    this.route.queryParams.subscribe(params => {
      if (params['orderId']) {
        this.newDispute.orderId = params['orderId'];
      }
      if (params['subOrderId']) {
        this.newDispute.subOrderId = params['subOrderId'];
      }
    });
  }

  openCreateModal(): void {
    this.isCreateModalOpen.set(true);
  }

  closeCreateModal(): void {
    this.isCreateModalOpen.set(false);
  }

  submitDispute(): void {
    const issueLabels: Record<string, string> = {
      damaged: 'Nông sản bị dập nát do vận chuyển',
      spoiled: 'Nông sản bị thối hỏng do nhiệt độ lạnh không đạt',
      missing: 'Thiếu hụt số lượng so với phiếu cân',
      quality_unmet: 'Không đạt tiêu chuẩn VietGAP công bố',
      wrong_item: 'Giao sai quy cách / loại nông sản'
    };

    const solutionLabels: Record<string, string> = {
      refund_partial: 'Hoàn tiền phần hàng bị ảnh hưởng',
      refund_full: 'Hoàn tiền toàn bộ mặt hàng',
      redelivery: 'Người bán giao bù vào chuyến xe kế tiếp',
      credit: 'Tín dụng đối trừ công nợ đơn sau'
    };

    this.orderService.createDispute({
      orderId: this.newDispute.orderId,
      subOrderId: this.newDispute.subOrderId,
      productName: this.newDispute.productName,
      affectedQty: this.newDispute.affectedQty,
      unit: this.newDispute.unit,
      issueType: this.newDispute.issueType,
      issueLabel: issueLabels[this.newDispute.issueType] || 'Khiếu nại nông sản',
      requestedSolution: this.newDispute.requestedSolution,
      solutionLabel: solutionLabels[this.newDispute.requestedSolution] || 'Hoàn tiền',
      description: this.newDispute.description,
      evidenceImages: this.newDispute.evidenceImages,
      refundAmount: this.newDispute.affectedQty * 16800
    }).subscribe(() => {
      this.isCreateModalOpen.set(false);
    });
  }
}

