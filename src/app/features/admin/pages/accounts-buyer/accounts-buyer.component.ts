import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { AdminAuthService } from '../../services/admin-auth.service';
import { AdminDataService } from '../../services/admin-data.service';
import { BuyerAccount, BusinessDocument } from '../../models/admin.model';
import { PricePipe } from '../../../../shared/pipes/price.pipe';
import { AdminReasonModalComponent } from '../../components/admin-reason-modal/admin-reason-modal.component';

@Component({
  selector: 'app-admin-accounts-buyer',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, PricePipe, AdminReasonModalComponent],
  templateUrl: './accounts-buyer.component.html',
  styleUrl: './accounts-buyer.component.scss'
})
export class AdminAccountsBuyerComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  readonly auth = inject(AdminAuthService);
  readonly data = inject(AdminDataService);

  readonly buyers = this.data.buyerAccounts;
  searchTerm = signal<string>('');
  statusFilter = signal<string>('ALL');

  selectedBuyer = signal<BuyerAccount | null>(null);
  activeDocPreview = signal<BusinessDocument | null>(null);
  modalAction = signal<'SUSPEND' | 'REACTIVATE' | null>(null);

  readonly canSuspend = computed(() => this.auth.canPerformAction('accounts-buyer', 'SUSPEND'));

  readonly filteredBuyers = computed(() => {
    let list = this.buyers();
    const term = this.searchTerm().trim().toLowerCase();
    const filter = this.statusFilter();

    if (term) {
      list = list.filter(b => b.company.toLowerCase().includes(term) || b.id.toLowerCase().includes(term) || b.region.toLowerCase().includes(term));
    }

    if (filter !== 'ALL') {
      list = list.filter(b => b.status === filter);
    }

    return list;
  });

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const id = params['id'];
      if (id) {
        const found = this.buyers().find(b => b.id === id);
        if (found) {
          this.selectedBuyer.set(found);
        }
      }
    });
  }

  viewBuyerDetail(b: BuyerAccount): void {
    this.selectedBuyer.set(b);
    this.router.navigate([], { queryParams: { id: b.id }, queryParamsHandling: 'merge' });
  }

  backToList(): void {
    this.selectedBuyer.set(null);
    this.activeDocPreview.set(null);
    this.router.navigate([], { queryParams: { id: null }, queryParamsHandling: 'merge' });
  }

  previewDoc(doc: BusinessDocument): void {
    this.activeDocPreview.set(doc);
  }

  closeDocPreview(): void {
    this.activeDocPreview.set(null);
  }

  openSuspendModal(b: BuyerAccount): void {
    this.selectedBuyer.set(b);
    this.modalAction.set('SUSPEND');
  }

  openReactivateModal(b: BuyerAccount): void {
    this.selectedBuyer.set(b);
    this.modalAction.set('REACTIVATE');
  }

  closeModal(): void {
    this.modalAction.set(null);
  }

  onModalConfirm(reason: string): void {
    const b = this.selectedBuyer();
    const action = this.modalAction();
    if (!b || !action) return;

    if (action === 'SUSPEND') {
      this.data.suspendBuyer(b.id, reason);
    } else if (action === 'REACTIVATE') {
      this.data.reactivateBuyer(b.id, reason);
    }

    // Refresh selected buyer reference
    const updated = this.buyers().find(item => item.id === b.id);
    if (updated) {
      this.selectedBuyer.set(updated);
    }

    this.closeModal();
  }
}
