import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { BuyerDataService } from '../../services/buyer-data.service';
import { Product, VendorSummary } from '../../../../shared/models/product.model';
import { ProductCardComponent } from '../../components/product-card/product-card.component';

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, ProductCardComponent],
  templateUrl: './catalog.component.html',
  styleUrl: './catalog.component.scss'
})
export class CatalogComponent {
  private readonly buyerData = inject(BuyerDataService);
  private readonly route = inject(ActivatedRoute);

  products = signal<Product[]>([]);
  vendors = signal<VendorSummary[]>([]);
  isLoading = signal(true);

  // Filters
  selectedCategory = signal<string>('all');
  selectedVendorId = signal<string>('all');
  selectedCert = signal<string>('all');
  sortBy = signal<'default' | 'price_asc' | 'price_desc' | 'stock_desc'>('default');
  searchKeyword = signal<string>('');

  categories = ['Tất cả', 'Rau ăn lá', 'Củ quả', 'Rau ăn hoa'];
  certifications = ['Tất cả', 'VietGAP', 'GLOBALG.A.P.', 'Hữu cơ'];

  filteredProducts = computed(() => {
    let list = this.products();

    // Category filter
    if (this.selectedCategory() !== 'all' && this.selectedCategory() !== 'Tất cả') {
      list = list.filter(p => p.category === this.selectedCategory());
    }

    // Vendor filter
    if (this.selectedVendorId() !== 'all') {
      list = list.filter(p => p.vendorId === this.selectedVendorId());
    }

    // Certification filter
    if (this.selectedCert() !== 'all' && this.selectedCert() !== 'Tất cả') {
      const cert = this.selectedCert().toLowerCase();
      list = list.filter(p => p.vendor?.certification.toLowerCase().includes(cert));
    }

    // Search query filter (Fix BUY-04)
    const kw = this.searchKeyword().toLowerCase().trim();
    if (kw) {
      list = list.filter(p => 
        p.name.toLowerCase().includes(kw) || 
        p.sku.toLowerCase().includes(kw) ||
        (p.vendor?.name.toLowerCase().includes(kw)) ||
        p.origin.toLowerCase().includes(kw)
      );
    }

    // Sorting
    if (this.sortBy() === 'price_asc') {
      list = [...list].sort((a, b) => a.basePrice - b.basePrice);
    } else if (this.sortBy() === 'price_desc') {
      list = [...list].sort((a, b) => b.basePrice - a.basePrice);
    } else if (this.sortBy() === 'stock_desc') {
      list = [...list].sort((a, b) => b.availableQty - a.availableQty);
    }

    return list;
  });

  constructor() {
    this.route.queryParams.subscribe(params => {
      if (params['q']) {
        this.searchKeyword.set(params['q']);
      }
      if (params['vendor']) {
        this.selectedVendorId.set(params['vendor']);
      }
    });

    this.loadData();
  }

  private loadData(): void {
    this.isLoading.set(true);
    this.buyerData.getVendors().subscribe(v => this.vendors.set(v));
    this.buyerData.getProducts().subscribe(p => {
      this.products.set(p);
      this.isLoading.set(false);
    });
  }

  resetFilters(): void {
    this.selectedCategory.set('all');
    this.selectedVendorId.set('all');
    this.selectedCert.set('all');
    this.searchKeyword.set('');
    this.sortBy.set('default');
  }
}

