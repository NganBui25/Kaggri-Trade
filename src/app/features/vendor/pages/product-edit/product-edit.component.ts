import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { VendorDataService } from '../../services/vendor-data.service';
import { VendorProduct } from '../../models/vendor.model';
import { PriceTier } from '../../../../shared/models/product.model';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-vendor-product-edit',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './product-edit.component.html',
  styleUrl: './product-edit.component.scss'
})
export class VendorProductEditComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly vendorData = inject(VendorDataService);
  private readonly notification = inject(NotificationService);

  isEditMode = signal(false);
  productId = signal<string | null>(null);

  form = {
    id: '',
    name: '',
    sku: '',
    category: 'Rau ăn lá',
    unit: 'kg',
    basePrice: 20000,
    minOrderQty: 50,
    onHandQty: 500,
    origin: 'Lạc Dương, Lâm Đồng',
    certificationName: 'VietGAP',
    description: '',
    featuredImage: '',
    status: 'active' as VendorProduct['status']
  };

  priceTiers = signal<PriceTier[]>([
    { minQty: 50, maxQty: 199, unitPrice: 20000 },
    { minQty: 200, maxQty: null, unitPrice: 18500 }
  ]);

  categories = ['Rau ăn lá', 'Củ quả', 'Rau ăn hoa', 'Nấm & Trái cây'];
  units = ['kg', 'thùng 10kg', 'bao 25kg', 'bó'];

  constructor() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id');
      if (id) {
        this.isEditMode.set(true);
        this.productId.set(id);
        this.loadProduct(id);
      }
    });
  }

  private loadProduct(id: string): void {
    const p = this.vendorData.products().find(item => item.id === id);
    if (p) {
      this.form = {
        id: p.id,
        name: p.name,
        sku: p.sku,
        category: p.category,
        unit: p.unit,
        basePrice: p.basePrice,
        minOrderQty: p.minOrderQty,
        onHandQty: p.onHandQty,
        origin: p.origin,
        certificationName: p.certificationName,
        description: p.description,
        featuredImage: p.featuredImage, // Keeps original photo (Fix VND-01)
        status: p.status
      };
      this.priceTiers.set([...p.priceTiers]);
    }
  }

  addTier(): void {
    const current = this.priceTiers();
    const last = current[current.length - 1];
    const nextMin = last ? (last.maxQty ? last.maxQty + 1 : last.minQty + 100) : 100;
    const nextPrice = last ? Math.max(1000, last.unitPrice - 1500) : 18000;

    this.priceTiers.set([
      ...current,
      { minQty: nextMin, maxQty: null, unitPrice: nextPrice }
    ]);
  }

  removeTier(index: number): void {
    const current = this.priceTiers();
    if (current.length > 1) {
      this.priceTiers.set(current.filter((_, i) => i !== index));
    }
  }

  // Fix VND-01: Does NOT reject existing products if image was already present!
  onSubmit(): void {
    if (!this.form.name.trim()) {
      this.notification.error('Vui lòng nhập tên nông sản', 'Lỗi nhập liệu');
      return;
    }

    if (this.form.basePrice <= 0) {
      this.notification.error('Đơn giá cơ bản phải lớn hơn 0', 'Lỗi nhập liệu');
      return;
    }

    // Default image if creating new and none provided
    const imageToSave = this.form.featuredImage || 
      'https://images.unsplash.com/photo-1594282486552-05b4d80fbb9f?auto=format&fit=crop&w=800&q=80';

    this.vendorData.saveProduct({
      ...this.form,
      featuredImage: imageToSave,
      priceTiers: this.priceTiers()
    }, this.isEditMode());

    this.router.navigate(['/vendor/products']);
  }
}

