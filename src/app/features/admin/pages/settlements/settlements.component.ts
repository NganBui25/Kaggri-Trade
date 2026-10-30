import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminAuthService } from '../../services/admin-auth.service';
import { AdminDataService } from '../../services/admin-data.service';
import { SettlementPeriod, SettlementVendorRow } from '../../models/admin.model';
import { PricePipe } from '../../../../shared/pipes/price.pipe';
import { AdminReasonModalComponent } from '../../components/admin-reason-modal/admin-reason-modal.component';

@Component({
  selector: 'app-admin-settlements',
  standalone: true,
  imports: [CommonModule, FormsModule, PricePipe, AdminReasonModalComponent],
  templateUrl: './settlements.component.html',
  styleUrl: './settlements.component.scss'
})
export class AdminSettlementsComponent {
  readonly auth = inject(AdminAuthService);
  readonly data = inject(AdminDataService);

  readonly settlements = this.data.settlements;
  selectedPeriod = signal<SettlementPeriod | null>(null);

  // Adjustment Modal State
  adjustmentModalOpen = signal<boolean>(false);
  selectedVendorForAdj = signal<SettlementVendorRow | null>(null);
  adjAmountInput = signal<number>(500000);

  readonly canManage = computed(() => {
    return this.auth.canPerformAction('settlements');
  });

  constructor() {
    const list = this.settlements();
    if (list.length > 0) {
      this.selectedPeriod.set(list[0]);
    }
  }

  selectPeriod(p: SettlementPeriod): void {
    this.selectedPeriod.set(p);
  }

  // Summary Row Calculations (Fix ADM-25, ADM-R18)
  getTotals(period: SettlementPeriod) {
    let gross = 0;
    let refunds = 0;
    let comm = 0;
    let escrow = 0;
    let net = 0;

    for (const v of period.vendors) {
      gross += v.grossGMV;
      refunds += v.refunds;
      comm += v.commission;
      escrow += v.escrowReserve;
      net += v.netPayout;
    }

    return { gross, refunds, comm, escrow, net };
  }

  // Step transitions (Fix ADM-R17)
  onCalculate(): void {
    const p = this.selectedPeriod();
    if (p) this.data.calculateSettlement(p.id);
  }

  onReview(): void {
    const p = this.selectedPeriod();
    if (p) this.data.reviewSettlement(p.id);
  }

  onFinalize(): void {
    const p = this.selectedPeriod();
    if (p) this.data.finalizeSettlement(p.id);
  }

  onPayout(): void {
    const p = this.selectedPeriod();
    if (p) this.data.payoutSettlement(p.id);
  }

  onCreatePeriod(): void {
    this.data.createSettlementPeriod();
    this.selectedPeriod.set(this.settlements()[0]);
  }

  openAdjustmentModal(row: SettlementVendorRow): void {
    this.selectedVendorForAdj.set(row);
    this.adjustmentModalOpen.set(true);
  }

  closeAdjustmentModal(): void {
    this.adjustmentModalOpen.set(false);
    this.selectedVendorForAdj.set(null);
  }

  onAdjustmentConfirm(reason: string): void {
    const p = this.selectedPeriod();
    const row = this.selectedVendorForAdj();
    if (!p || !row) return;

    this.data.addSettlementAdjustment(p.id, row.vendorId, this.adjAmountInput(), reason);
    this.closeAdjustmentModal();
  }
}

