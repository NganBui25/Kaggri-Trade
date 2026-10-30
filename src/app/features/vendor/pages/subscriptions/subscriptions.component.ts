import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VendorDataService } from '../../services/vendor-data.service';
import { VendorSubscriptionProposal } from '../../models/vendor.model';
import { PricePipe, NumberDotPipe } from '../../../../shared/pipes/price.pipe';

@Component({
  selector: 'app-vendor-subscriptions',
  standalone: true,
  imports: [CommonModule, FormsModule, PricePipe, NumberDotPipe],
  templateUrl: './subscriptions.component.html',
  styleUrl: './subscriptions.component.scss'
})
export class VendorSubscriptionsComponent {
  readonly vendorData = inject(VendorDataService);

  // Counter proposal modal state (Fix VND-16)
  counterModalOpen = signal(false);
  selectedSubscription = signal<VendorSubscriptionProposal | null>(null);
  proposedPrice = signal<number>(18000);
  proposedNotes = signal<string>('Đề xuất tăng giá do chi phí xe lạnh mùa cao điểm');

  openCounterModal(sub: VendorSubscriptionProposal): void {
    this.selectedSubscription.set(sub);
    this.proposedPrice.set(sub.unitPrice + 1000);
    this.counterModalOpen.set(true);
  }

  closeCounterModal(): void {
    this.counterModalOpen.set(false);
    this.selectedSubscription.set(null);
  }

  // Fix VND-16: Action handlers
  acceptSubscription(id: string): void {
    this.vendorData.respondSubscription(id, 'accepted');
  }

  rejectSubscription(id: string): void {
    this.vendorData.respondSubscription(id, 'rejected');
  }

  submitCounterProposal(): void {
    const s = this.selectedSubscription();
    if (!s) return;

    this.vendorData.respondSubscription(
      s.id,
      'counter_proposed',
      this.proposedPrice(),
      this.proposedNotes()
    );
    this.closeCounterModal();
  }
}

