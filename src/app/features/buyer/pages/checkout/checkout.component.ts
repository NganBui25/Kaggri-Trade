import { Component, inject, signal, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { CartService } from '../../services/cart.service';
import { BuyerDataService } from '../../services/buyer-data.service';
import { OrderService } from '../../services/order.service';
import { PaymentMethod, PaymentMethodId, BuyerOrder } from '../../../../shared/models/order.model';
import { PricePipe, NumberDotPipe } from '../../../../shared/pipes/price.pipe';
import { ToastService } from '../../../../shared/components/toast/toast.service';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, PricePipe, NumberDotPipe],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.scss'
})
export class CheckoutComponent implements OnDestroy {
  readonly cartService = inject(CartService);
  private readonly buyerData = inject(BuyerDataService);
  private readonly orderService = inject(OrderService);
  private readonly router = inject(Router);
  private readonly notification = inject(ToastService);

  paymentMethods = signal<PaymentMethod[]>([]);
  selectedMethod = signal<PaymentMethodId>('vietqr');
  
  // Step state: 'form' | 'payment_processing' | 'success'
  currentStep = signal<'form' | 'payment_processing' | 'success'>('form');

  // Fix BUY-20: VAT Invoice Options
  invoiceRequested = signal<boolean>(true);
  invoiceProfile = {
    companyName: 'HTX Bách Hóa Xanh',
    taxCode: '0312345678',
    billingAddress: '128 Đường số 7, Phường Bình Trị Đông B, Quận Bình Tân, TP. Hồ Chí Minh',
    invoiceEmail: 'hoadon@bachhoaxanh.example'
  };

  // Delivery Address
  deliveryInfo = {
    companyName: 'HTX Bách Hóa Xanh',
    recipientName: 'Nguyễn Minh Anh',
    phone: '090 123 4567',
    address: '128 Đường số 7, Phường Bình Trị Đông B, Quận Bình Tân, TP. Hồ Chí Minh',
    receivingWindow: '03:30 - 08:00 hàng ngày',
    deliveryNote: 'Giao trước 06:00 sáng tại cửa kho lạnh số 2.'
  };

  // Created Order snapshot
  createdOrder = signal<BuyerOrder | null>(null);

  // Fix BUY-23: Countdown timer (30 minutes)
  timeLeftSeconds = signal<number>(30 * 60);
  private timerInterval: any = null;

  constructor() {
    this.buyerData.getPaymentMethods().subscribe(methods => {
      this.paymentMethods.set(methods);
    });
  }

  // Format countdown mm:ss
  get formattedTimeLeft(): string {
    const mins = Math.floor(this.timeLeftSeconds() / 60);
    const secs = this.timeLeftSeconds() % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  onSubmitOrder(): void {
    if (this.cartService.items().length === 0) {
      this.notification.warning('Giỏ hàng trống!', 'Thông báo');
      return;
    }

    // Create Order
    this.orderService.createOrder(
      this.cartService.items(),
      this.deliveryInfo,
      this.selectedMethod(),
      this.invoiceRequested(),
      this.invoiceRequested() ? this.invoiceProfile : undefined
    ).subscribe(order => {
      this.createdOrder.set(order);
      this.cartService.clearCart();

      if (this.selectedMethod() === 'vietqr' || this.selectedMethod() === 'va') {
        this.currentStep.set('payment_processing');
        this.startTimer();
      } else {
        this.currentStep.set('success');
      }
    });
  }

  startTimer(): void {
    this.clearTimer();
    this.timeLeftSeconds.set(30 * 60);
    this.timerInterval = setInterval(() => {
      if (this.timeLeftSeconds() > 0) {
        this.timeLeftSeconds.update(t => t - 1);
      } else {
        this.clearTimer();
        this.notification.error('Phiên giữ hàng đã hết thời gian hiệu lực.', 'Hết hạn phiên');
      }
    }, 1000);
  }

  clearTimer(): void {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }
  }

  // Fix BUY-22: Cancel payment and go back
  cancelPayment(): void {
    this.clearTimer();
    this.currentStep.set('form');
    this.notification.info('Đã hủy phiên thanh toán. Bạn có thể chọn phương thức khác.', 'Đã hủy');
  }

  // Simulate payment completion
  confirmPaymentReceived(): void {
    this.clearTimer();
    const order = this.createdOrder();
    if (order) {
      order.paymentStatus = 'paid';
    }
    this.currentStep.set('success');
    this.notification.success('Thanh toán đơn hàng thành công qua VietQR!', 'Giao dịch thành công');
  }

  ngOnDestroy(): void {
    this.clearTimer();
  }
}

