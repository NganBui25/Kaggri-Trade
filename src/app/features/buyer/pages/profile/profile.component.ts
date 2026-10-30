import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../../core/auth/auth.service';
import { PricePipe } from '../../../../shared/pipes/price.pipe';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, PricePipe],
  templateUrl: './profile.component.html',
  styleUrl: './profile.component.scss'
})
export class ProfileComponent {
  readonly authService = inject(AuthService);
  private readonly notification = inject(NotificationService);

  profile = {
    companyName: 'HTX Bách Hóa Xanh',
    representative: 'Nguyễn Minh Anh',
    email: 'buyer@bachhoaxanh.vn',
    phone: '090 123 4567',
    taxCode: '0312345678',
    headquarters: '128 Đường số 7, Phường Bình Trị Đông B, Quận Bình Tân, TP. Hồ Chí Minh',
    creditLimit: 50000000,
    creditUsed: 12000000,
    creditAvailable: 38000000,
    creditTerm: 'NET 15 ngày từ ngày xuất hóa đơn VAT'
  };

  saveProfile(): void {
    this.notification.success('Thông tin doanh nghiệp đã được cập nhật thành công.', 'Đã lưu');
  }
}

