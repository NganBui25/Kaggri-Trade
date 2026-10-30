import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { BuyerDataService } from '../../services/buyer-data.service';
import { CartService } from '../../services/cart.service';
import { Product, ProductImage } from '../../../../shared/models/product.model';
import { PricePipe, NumberDotPipe } from '../../../../shared/pipes/price.pipe';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, PricePipe, NumberDotPipe],
  templateUrl: './product-detail.component.html',
  styleUrl: './product-detail.component.scss'
})
export class ProductDetailComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly buyerData = inject(BuyerDataService);
  private readonly cartService = inject(CartService);
  private readonly notification = inject(NotificationService);

  product = signal<Product | undefined>(undefined);
  selectedImage = signal<string>('');
  orderQty = signal<number>(100);
  quantityWarning = signal<string | null>(null);
  orderNote = signal<string>('');
  isLoading = signal(true);

  // Computed current tier unit price
  currentUnitPrice = computed(() => {
    const p = this.product();
    if (!p) return 0;
    return this.buyerData.calculateTierPrice(p, this.orderQty());
  });

  // Computed line total
  totalEstimatedAmount = computed(() => {
    return this.orderQty() * this.currentUnitPrice();
  });

  constructor() {
    this.route.paramMap.subscribe(params => {
      const id = params.get('id') || 'p1';
      this.loadProduct(id);
    });
  }

  private loadProduct(id: string): void {
    this.isLoading.set(true);
    this.buyerData.getProductById(id).subscribe(p => {
      if (p) {
        this.product.set(p);
        this.selectedImage.set(p.featuredImage);
        this.orderQty.set(p.minOrderQty);
      }
      this.isLoading.set(false);
    });
  }

  selectGalleryImage(img: ProductImage): void {
    this.selectedImage.set(img.src);
  }

  // Fix BUY-14: Explicit quantity validation with explanation
  onQtyChange(newVal: number): void {
    const p = this.product();
    if (!p) return;

    this.quantityWarning.set(null);
    const validation = this.buyerData.validateQuantity(p, newVal);

    if (!validation.valid && validation.message) {
      this.quantityWarning.set(validation.message);
      this.orderQty.set(validation.adjustedQty);
    } else {
      this.orderQty.set(newVal);
    }
  }

  increaseQty(step = 50): void {
    const current = this.orderQty();
    this.onQtyChange(current + step);
  }

  decreaseQty(step = 50): void {
    const current = this.orderQty();
    this.onQtyChange(Math.max(0, current - step));
  }

  // Fix BUY-01: Add to cart stays on page and alerts
  addToCart(): void {
    const p = this.product();
    if (!p) return;

    this.cartService.addToCart(p, this.orderQty(), this.orderNote());
  }

  // Buy Now: Add to cart and immediately proceed to Checkout
  buyNow(): void {
    const p = this.product();
    if (!p) return;

    this.cartService.addToCart(p, this.orderQty(), this.orderNote());
    this.router.navigate(['/buyer/checkout']);
  }
}

