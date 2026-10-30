import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { VendorDataService } from '../../services/vendor-data.service';
import { ToastService } from '../../../../shared/components/toast/toast.service';
import { VendorKycProfile } from '../../models/vendor.model';

@Component({
  selector: 'app-vendor-onboarding',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './onboarding.component.html',
  styleUrl: './onboarding.component.scss'
})
export class VendorOnboardingComponent {
  readonly vendorData = inject(VendorDataService);
  private readonly notification = inject(ToastService);

  // Active step in onboarding wizard (1: Gian hàng, 2: Pháp lý, 3: Liên hệ & OTP)
  currentStep = signal<number>(1);

  // Business type (Fix VND-22 & VND-32: individual | household | enterprise)
  businessType = signal<'individual' | 'household' | 'enterprise'>('household');

  // Form fields
  farmDisplayName = signal<string>('HTX Nông Nghiệp Công Nghệ Cao Lạc Dương');
  legalName = signal<string>('Hộ Kinh Doanh Trang Trại Lạc Dương Xanh');
  registrationNo = signal<string>('42A8019928');
  taxCode = signal<string>('5801452291');
  representativeName = signal<string>('Nguyễn Văn Nông');
  representativeIdCard = signal<string>('049088019284');
  province = signal<string>('Lâm Đồng');
  address = signal<string>('Thôn Đạ Nghịt, Xã Lát, Huyện Lạc Dương, Tỉnh Lâm Đồng');

  // Uploaded document preview (Fix VND-26)
  uploadedFileName = signal<string>('Giay_Chung_Nhan_HKD_Lac_Duong.pdf');
  uploadedFileSize = signal<string>('2.4 MB');

  // Additional contacts (Fix VND-27, VND-28, VND-29)
  contactPerson = signal<string>('Nguyễn Văn Nông (Chủ hộ kinh doanh)');
  useAccountPhone = signal<boolean>(true);
  accountPhoneMasked = signal<string>('+84 91 •••• 233');
  customPhone = signal<string>('');
  contactEmail = signal<string>('vendor@lacduongfarm.vn');
  otpCode = signal<string>('');
  isOtpSent = signal<boolean>(false);
  isOtpVerified = signal<boolean>(true);
  otpTimer = signal<number>(0);
  private timerInterval: any = null;

  // Validation errors (Fix VND-30: In-line red borders & text)
  errors = signal<Record<string, string>>({});

  // Character counter for Farm Display Name (Fix VND-24)
  displayNameLength = computed(() => this.farmDisplayName().length);

  // Check Step 1 completion (Fix VND-25)
  isStep1Complete = computed(() => {
    return this.farmDisplayName().trim().length >= 3 && this.farmDisplayName().trim().length <= 120;
  });

  // Check Step 2 completion (Fix VND-25)
  isStep2Complete = computed(() => {
    return (
      this.legalName().trim().length > 0 &&
      this.registrationNo().trim().length > 0 &&
      this.representativeName().trim().length > 0 &&
      this.uploadedFileName().length > 0
    );
  });

  // Check Step 3 completion (Fix VND-25)
  isStep3Complete = computed(() => {
    const hasPhone = this.useAccountPhone() || this.customPhone().trim().length >= 9;
    const hasEmail = this.contactEmail().includes('@');
    return this.contactPerson().trim().length > 0 && hasPhone && hasEmail && this.isOtpVerified();
  });

  // Business Type document label (Fix VND-26)
  documentLabel = computed(() => {
    switch (this.businessType()) {
      case 'enterprise':
        return 'Tải lên Giấy chứng nhận đăng ký doanh nghiệp / HTX (bản gốc hoặc sao y)';
      case 'household':
        return 'Tải lên Giấy chứng nhận đăng ký hộ kinh doanh';
      case 'individual':
        return 'Tải lên CCCD 2 mặt & Giấy chứng nhận vườn/chứng nhận nông dân giỏi';
    }
  });

  documentSampleName = computed(() => {
    switch (this.businessType()) {
      case 'enterprise':
        return 'GPKD_HopTacXa_DoanhNghiep.pdf';
      case 'household':
        return 'Giay_Chung_Nhan_HKD_Lac_Duong.pdf';
      case 'individual':
        return 'CCCD_GanChip_NhaVuon.pdf';
    }
  });

  selectBusinessType(type: 'individual' | 'household' | 'enterprise'): void {
    this.businessType.set(type);
    if (type === 'enterprise') {
      this.legalName.set('HỢP TÁC XÃ NÔNG NGHIỆP CÔNG NGHỆ CAO LẠC DƯƠNG');
      this.registrationNo.set('5801452291');
      this.uploadedFileName.set('GPKD_HopTacXa_DoanhNghiep.pdf');
    } else if (type === 'household') {
      this.legalName.set('Hộ Kinh Doanh Trang Trại Lạc Dương Xanh');
      this.registrationNo.set('42A8019928');
      this.uploadedFileName.set('Giay_Chung_Nhan_HKD_Lac_Duong.pdf');
    } else {
      this.legalName.set('Vườn rau gia đình Nguyễn Văn Nông');
      this.registrationNo.set('CCCD 049088019284');
      this.uploadedFileName.set('CCCD_GanChip_NhaVuon.pdf');
    }
    this.clearError('legalName');
    this.clearError('registrationNo');
  }

  // Clear specific error
  clearError(field: string): void {
    const cur = { ...this.errors() };
    delete cur[field];
    this.errors.set(cur);
  }

  // Send OTP
  sendOtp(): void {
    if (!this.contactEmail().includes('@')) {
      this.errors.set({ ...this.errors(), contactEmail: 'Địa chỉ email không hợp lệ.' });
      return;
    }
    this.clearError('contactEmail');
    this.isOtpSent.set(true);
    this.otpTimer.set(60);
    this.notification.info(`Mã xác thực OTP gồm 6 chữ số đã được gửi tới email ${this.contactEmail()}.`, 'Gửi mã OTP');

    if (this.timerInterval) clearInterval(this.timerInterval);
    this.timerInterval = setInterval(() => {
      const current = this.otpTimer();
      if (current <= 1) {
        clearInterval(this.timerInterval);
        this.otpTimer.set(0);
      } else {
        this.otpTimer.set(current - 1);
      }
    }, 1000);
  }

  // Verify OTP
  verifyOtp(): void {
    if (this.otpCode().trim().length !== 6 && this.otpCode().trim() !== '888888') {
      this.errors.set({ ...this.errors(), otpCode: 'Không thể hoàn tất xác minh. Mã OTP không chính xác hoặc đã hết hạn.' });
      return;
    }
    this.clearError('otpCode');
    this.isOtpVerified.set(true);
    this.notification.success('Xác minh địa chỉ email thành công!', 'Xác minh OTP');
  }

  // File Upload simulation
  handleFileUpload(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.uploadedFileName.set(file.name);
      const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
      this.uploadedFileSize.set(`${sizeMb} MB`);
      this.notification.success(`Đã đính kèm tệp "${file.name}"`, 'Tải lên tệp thành công');
    }
  }

  removeFile(): void {
    this.uploadedFileName.set('');
    this.uploadedFileSize.set('');
  }

  // Go to step
  goToStep(step: number): void {
    this.currentStep.set(step);
  }

  // Submit KYC Profile
  submitForm(): void {
    const errs: Record<string, string> = {};

    if (!this.farmDisplayName().trim()) {
      errs['farmDisplayName'] = 'Tên trang trại hiển thị không được để trống.';
    } else if (this.farmDisplayName().length > 120) {
      errs['farmDisplayName'] = 'Tên trang trại không vượt quá 120 ký tự.';
    }

    if (!this.legalName().trim()) {
      errs['legalName'] = 'Vui lòng nhập tên công ty hoặc hộ kinh doanh pháp lý.';
    }

    if (!this.registrationNo().trim()) {
      errs['registrationNo'] = 'Vui lòng nhập mã số doanh nghiệp hoặc số giấy chứng nhận.';
    }

    if (!this.uploadedFileName()) {
      errs['uploadedFile'] = 'Vui lòng tải lên ảnh hoặc tài liệu giấy chứng nhận.';
    }

    if (!this.contactPerson().trim()) {
      errs['contactPerson'] = 'Vui lòng nhập họ tên người liên hệ.';
    }

    if (!this.useAccountPhone() && !this.customPhone().trim()) {
      errs['customPhone'] = 'Vui lòng nhập số điện thoại liên hệ.';
    }

    if (!this.contactEmail().includes('@')) {
      errs['contactEmail'] = 'Vui lòng nhập địa chỉ email hợp lệ.';
    }

    if (!this.isOtpVerified()) {
      errs['otpCode'] = 'Vui lòng xác minh địa chỉ email bằng mã OTP trước khi nộp.';
    }

    if (Object.keys(errs).length > 0) {
      this.errors.set(errs);
      this.notification.error('Vui lòng kiểm tra và điền đầy đủ các thông tin bắt buộc còn thiếu!', 'Lỗi biểu mẫu');
      return;
    }

    // Call service
    const profile: Partial<VendorKycProfile> = {
      businessType: this.businessType(),
      farmDisplayName: this.farmDisplayName(),
      legalName: this.legalName(),
      registrationNo: this.registrationNo(),
      taxCode: this.taxCode(),
      representativeName: this.representativeName(),
      representativeIdCard: this.representativeIdCard(),
      province: this.province(),
      address: this.address(),
      contactPerson: this.contactPerson(),
      contactPhone: this.useAccountPhone() ? '0918892233' : this.customPhone(),
      contactEmail: this.contactEmail(),
      certDocumentName: this.uploadedFileName()
    };

    this.vendorData.updateKycProfile(profile);
  }

  // Toggle simulated approval state for review (Fix VND-12 & VND-21)
  simulateStatus(status: 'approved' | 'pending' | 'draft'): void {
    const cur = this.vendorData.kycProfile();
    if (status === 'approved') {
      this.vendorData.kycProfile.set({
        ...cur,
        isApproved: true,
        approvalStatus: 'approved',
        approvalStatusLabel: 'Hồ sơ đã được phê duyệt'
      });
      this.notification.success('Đã chuyển trạng thái: Đã phê duyệt (Trang trại chính thức).', 'Mô phỏng');
    } else if (status === 'pending') {
      this.vendorData.kycProfile.set({
        ...cur,
        isApproved: false,
        approvalStatus: 'pending',
        approvalStatusLabel: 'Hồ sơ đang chờ Admin xét duyệt'
      });
      this.notification.info('Đã chuyển trạng thái: Đang chờ Admin xét duyệt.', 'Mô phỏng');
    } else {
      this.vendorData.kycProfile.set({
        ...cur,
        isApproved: false,
        approvalStatus: 'draft',
        approvalStatusLabel: 'Chưa nộp hồ sơ đăng ký'
      });
      this.notification.warning('Đã chuyển trạng thái: Bản thảo hồ sơ mới.', 'Mô phỏng');
    }
  }
}

