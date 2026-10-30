import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VendorDataService } from '../../services/vendor-data.service';
import { VendorDisputeCase } from '../../models/vendor.model';
import { PricePipe } from '../../../../shared/pipes/price.pipe';

@Component({
  selector: 'app-vendor-disputes',
  standalone: true,
  imports: [CommonModule, FormsModule, PricePipe],
  templateUrl: './disputes.component.html',
  styleUrl: './disputes.component.scss'
})
export class VendorDisputesComponent {
  readonly vendorData = inject(VendorDataService);

  replyModalOpen = signal(false);
  selectedDispute = signal<VendorDisputeCase | null>(null);
  replyMessage = signal('Trang trại đồng ý bồi hoàn phần hư hỏng do vận chuyển xe lạnh.');
  acceptRefund = signal(true);

  openReplyModal(d: VendorDisputeCase): void {
    this.selectedDispute.set(d);
    this.replyModalOpen.set(true);
  }

  closeReplyModal(): void {
    this.replyModalOpen.set(false);
    this.selectedDispute.set(null);
  }

  // Fix VND-17: Reply dispute & sync with Settlement
  submitReply(): void {
    const d = this.selectedDispute();
    if (!d) return;

    this.vendorData.replyDispute(d.id, this.replyMessage(), this.acceptRefund());
    this.closeReplyModal();
  }
}

