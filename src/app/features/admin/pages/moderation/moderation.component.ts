import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AdminAuthService } from '../../services/admin-auth.service';
import { AdminDataService } from '../../services/admin-data.service';
import { ModerationProduct, ModerationReview } from '../../models/admin.model';
import { AdminForbiddenComponent } from '../../components/forbidden/forbidden.component';
import { AdminReasonModalComponent } from '../../components/admin-reason-modal/admin-reason-modal.component';

@Component({
  selector: 'app-admin-moderation',
  standalone: true,
  imports: [CommonModule, AdminForbiddenComponent, AdminReasonModalComponent],
  templateUrl: './moderation.component.html',
  styleUrl: './moderation.component.scss'
})
export class AdminModerationComponent {
  readonly auth = inject(AdminAuthService);
  readonly data = inject(AdminDataService);

  readonly products = this.data.moderationProducts;
  readonly reviews = this.data.moderationReviews;

  activeTab = signal<'products' | 'reviews'>('products');

  // Modal State
  hideTarget = signal<{ type: 'product' | 'review'; id: string; name: string } | null>(null);

  readonly canAccess = computed(() => this.auth.canAccessModule('moderation'));
  readonly canModerate = computed(() => this.auth.canPerformAction('moderation'));
  readonly canTerminate = computed(() => this.auth.isSuperAdmin());

  onApproveProduct(id: string): void {
    this.data.approveProduct(id);
  }

  onUnhideProduct(id: string): void {
    this.data.unhideProduct(id);
  }

  openHideModal(type: 'product' | 'review', id: string, name: string): void {
    this.hideTarget.set({ type, id, name });
  }

  closeHideModal(): void {
    this.hideTarget.set(null);
  }

  onHideConfirm(reason: string): void {
    const target = this.hideTarget();
    if (!target) return;

    if (target.type === 'product') {
      this.data.hideProduct(target.id, reason);
    } else {
      this.data.hideReview(target.id, reason);
    }

    this.closeHideModal();
  }

  onApproveReview(id: string): void {
    this.data.approveReview(id);
  }

  terminateVendor(vendorId: string, company: string): void {
    this.data.terminateVendor(vendorId, `Chấm dứt do vi phạm kiểm duyệt nội dung nghiêm trọng liên quan đến ${company}`);
  }
}

