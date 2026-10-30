import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { VendorDataService } from '../../services/vendor-data.service';
import { VendorProduct } from '../../models/vendor.model';
import { PricePipe, NumberDotPipe } from '../../../../shared/pipes/price.pipe';

@Component({
  selector: 'app-vendor-products',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, PricePipe, NumberDotPipe],
  templateUrl: './products.component.html',
  styleUrl: './products.component.scss'
})
export class VendorProductsComponent {
  readonly vendorData = inject(VendorDataService);

  searchQuery = signal('');
  filterStatus = signal<'all' | 'active' | 'hidden'>('all');
  selectedProductToDelete = signal<VendorProduct | null>(null);
  deleteErrorMessage = signal<string | null>(null);

  filteredProducts = computed(() => {
    let list = this.vendorData.products();

    if (this.filterStatus() !== 'all') {
      list = list.filter(p => p.status === this.filterStatus());
    }

    const q = this.searchQuery().toLowerCase().trim();
    if (q) {
      list = list.filter(p => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q));
    }

    return list;
  });

  toggleStatus(productId: string): void {
    this.vendorData.toggleProductStatus(productId);
  }

  // Fix VND-19: Open delete modal with clean single-action handling
  openDeleteModal(product: VendorProduct): void {
    this.selectedProductToDelete.set(product);
    this.deleteErrorMessage.set(null);
  }

  closeDeleteModal(): void {
    this.selectedProductToDelete.set(null);
    this.deleteErrorMessage.set(null);
  }

  confirmDelete(): void {
    const p = this.selectedProductToDelete();
    if (!p) return;

    const res = this.vendorData.deleteProduct(p.id);
    if (!res.success && res.message) {
      this.deleteErrorMessage.set(res.message);
    } else {
      this.closeDeleteModal();
    }
  }
}

