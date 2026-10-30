import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VendorDataService } from '../../services/vendor-data.service';
import { NumberDotPipe } from '../../../../shared/pipes/price.pipe';

@Component({
  selector: 'app-vendor-inventory',
  standalone: true,
  imports: [CommonModule, FormsModule, NumberDotPipe],
  templateUrl: './inventory.component.html',
  styleUrl: './inventory.component.scss'
})
export class VendorInventoryComponent {
  readonly vendorData = inject(VendorDataService);

  // Inbound modal state (Fix VND-15)
  inboundModalOpen = signal(false);
  selectedProductId = signal<string>('SP-101');
  inboundQty = signal<number>(500);
  inboundNote = signal<string>('Thu hoạch đợt sáng sớm');

  openInboundModal(): void {
    const list = this.vendorData.products();
    if (list.length > 0) {
      this.selectedProductId.set(list[0].id);
    }
    this.inboundQty.set(500);
    this.inboundNote.set('Thu hoạch đợt sáng sớm luống A');
    this.inboundModalOpen.set(true);
  }

  closeInboundModal(): void {
    this.inboundModalOpen.set(false);
  }

  submitInbound(): void {
    if (this.inboundQty() <= 0) return;

    this.vendorData.recordInboundStock(
      this.selectedProductId(),
      this.inboundQty(),
      this.inboundNote()
    );
    this.inboundModalOpen.set(false);
  }
}

