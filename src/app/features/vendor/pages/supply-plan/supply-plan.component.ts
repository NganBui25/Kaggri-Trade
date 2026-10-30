import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VendorDataService } from '../../services/vendor-data.service';
import { HarvestPlan } from '../../models/vendor.model';
import { NumberDotPipe } from '../../../../shared/pipes/price.pipe';

@Component({
  selector: 'app-vendor-supply-plan',
  standalone: true,
  imports: [CommonModule, FormsModule, NumberDotPipe],
  templateUrl: './supply-plan.component.html',
  styleUrl: './supply-plan.component.scss'
})
export class VendorSupplyPlanComponent {
  readonly vendorData = inject(VendorDataService);

  modalOpen = signal(false);
  isEdit = signal(false);

  form: Partial<HarvestPlan> = {
    productId: 'SP-101',
    productName: 'Bắp cải sạch Đà Lạt VietGAP',
    harvestDate: '05/11/2026',
    expectedQty: 2500,
    unit: 'kg',
    confidence: 'high',
    notes: ''
  };

  // Dynamic calculations based on real harvest plans (Fix VND-14: No fixed numbers)
  totalExpectedYield = computed(() => {
    return this.vendorData.harvestPlans().reduce((sum, h) => sum + h.expectedQty, 0);
  });

  totalCommittedPreorders = computed(() => {
    return this.vendorData.harvestPlans().reduce((sum, h) => sum + h.alreadyCommittedQty, 0);
  });

  totalAvailableForPreorder = computed(() => {
    return this.totalExpectedYield() - this.totalCommittedPreorders();
  });

  openAddModal(): void {
    this.isEdit.set(false);
    this.form = {
      productId: 'SP-101',
      productName: 'Bắp cải sạch Đà Lạt VietGAP',
      harvestDate: '08/11/2026',
      expectedQty: 1500,
      unit: 'kg',
      confidence: 'high',
      notes: 'Thu hoạch luống mới'
    };
    this.modalOpen.set(true);
  }

  // Fix VND-14: Edit harvest plan action
  openEditModal(plan: HarvestPlan): void {
    this.isEdit.set(true);
    this.form = { ...plan };
    this.modalOpen.set(true);
  }

  closeModal(): void {
    this.modalOpen.set(false);
  }

  savePlan(): void {
    const p = this.vendorData.products().find(item => item.id === this.form.productId);
    if (p) this.form.productName = p.name;

    this.vendorData.saveHarvestPlan(this.form, this.isEdit());
    this.modalOpen.set(false);
  }

  // Fix VND-14: Delete harvest plan action
  deletePlan(id: string): void {
    this.vendorData.deleteHarvestPlan(id);
  }
}

