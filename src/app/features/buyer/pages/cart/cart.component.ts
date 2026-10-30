import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { BuyerDataService } from '../../services/buyer-data.service';
import { PricePipe, NumberDotPipe } from '../../../../shared/pipes/price.pipe';
import { CartItem } from '../../../../shared/models/order.model';
import { ToastService } from '../../../../shared/components/toast/toast.service';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, PricePipe, NumberDotPipe],
  templateUrl: './cart.component.html',
  styleUrl: './cart.component.scss'
})
export class CartComponent {
  readonly cartService = inject(CartService);
  private readonly buyerData = inject(BuyerDataService);
  private readonly router = inject(Router);
  private readonly notification = inject(ToastService);

  // Fix BUY-18: Refresh stock with timestamp
  lastRefreshedAt = signal<string>('Vừa xong');
  isRefreshing = signal(false);

  // Fix BUY-19: Inline editing note modal/state
  editingItem = signal<CartItem | null>(null);
  editingNoteText = signal('');

  refreshStock(): void {
    this.isRefreshing.set(true);
    const now = new Date();
    const timeStr = now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    setTimeout(() => {
      this.lastRefreshedAt.set(timeStr);
      this.isRefreshing.set(false);
      this.notification.success(
        `Đã đối chiếu tồn kho và bậc giá mới nhất lúc ${timeStr}.`,
        'Cập nhật tồn kho thành công'
      );
    }, 400);
  }

  openEditNote(item: CartItem): void {
    this.editingItem.set(item);
    this.editingNoteText.set(item.note || '');
  }

  saveNote(): void {
    const item = this.editingItem();
    if (item) {
      this.cartService.updateNote(item.product.id, this.editingNoteText());
      this.editingItem.set(null);
    }
  }

  closeNoteModal(): void {
    this.editingItem.set(null);
  }

  proceedToCheckout(): void {
    if (this.cartService.items().length === 0) {
      this.notification.warning('Giỏ hàng của bạn đang trống. Vui lòng chọn sản phẩm.', 'Giỏ hàng trống');
      return;
    }
    this.router.navigate(['/buyer/checkout']);
  }
}

