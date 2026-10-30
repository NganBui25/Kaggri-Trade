import { Component, input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { Product } from '../../../../shared/models/product.model';
import { PricePipe, NumberDotPipe } from '../../../../shared/pipes/price.pipe';
import { CartService } from '../../services/cart.service';

@Component({
  selector: 'app-product-card',
  standalone: true,
  imports: [CommonModule, RouterModule, PricePipe, NumberDotPipe],
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.scss'
})
export class ProductCardComponent {
  readonly product = input.required<Product>();
  private readonly cartService = inject(CartService);

  // Fix BUY-01: Add to cart without redirecting to checkout
  onQuickAddToCart(event: Event): void {
    event.stopPropagation();
    event.preventDefault();
    const p = this.product();
    this.cartService.addToCart(p, p.minOrderQty);
  }
}

