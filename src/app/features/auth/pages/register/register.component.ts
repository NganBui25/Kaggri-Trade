import { Component, inject, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { UserRole, ROLE_DEFINITIONS } from '../../../../core/models/role.model';
import { AuthService } from '../../../../core/auth/auth.service';
import { AuthFeatureService } from '../../services/auth-feature.service';
import { RegisterFormState, BusinessType, BUSINESS_TYPE_OPTIONS, UploadedLicenseFile } from '../../models/auth.model';
import { ToastService } from '../../../../shared/components/toast/toast.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.scss'
})
export class RegisterComponent implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly authService = inject(AuthService);
  private readonly authFeatureService = inject(AuthFeatureService);
  private readonly toastService = inject(ToastService);

  readonly roleDefinitions = ROLE_DEFINITIONS;
  readonly businessTypeOptions = BUSINESS_TYPE_OPTIONS;

  // Form State
  formState: RegisterFormState = {
    role: 'vendor',
    storeName: '',
    businessType: 'enterprise',
    licenseFile: null,
    companyName: '',
    taxCode: '',
    contactPerson: '',
    phoneOption: 'default',
    phoneNumber: '',
    email: '',
    otpCode: '',
    password: '',
    confirmPassword: '',
    agreeTerms: true
  };

  // UI State Signals
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);
  showPassword = signal(false);
  showConfirmPassword = signal(false);
  isSuccessModalOpen = signal(false);
  registeredRole = signal<'buyer' | 'vendor'>('vendor');

  // OTP Countdown Timer
  otpCountdown = signal<number>(0);
  otpSent = signal<boolean>(false);
  private countdownTimer: any = null;

  // Active Tooltip Info
  activeTooltip = signal<string | null>(null);

  // Validation Errors
  errors: Partial<Record<keyof RegisterFormState, string>> = {};

  // Drag and Drop state
  isDragging = signal(false);

  // Field length getters
  readonly storeNameLength = computed(() => this.formState.storeName?.length || 0);
  readonly companyNameLength = computed(() => this.formState.companyName?.length || 0);
  readonly taxCodeLength = computed(() => this.formState.taxCode?.length || 0);
  readonly contactPersonLength = computed(() => this.formState.contactPerson?.length || 0);

  // Password strength
  readonly passwordStrength = computed(() => {
    const pwd = this.formState.password || '';
    if (!pwd) return { score: 0, text: 'Chưa nhập', color: 'bg-stone-200' };
    if (pwd.length < 6) return { score: 1, text: 'Quá ngắn', color: 'bg-rose-500' };
    
    let score = 1;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd) && /[a-z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;

    if (score <= 2) return { score: 2, text: 'Trung bình', color: 'bg-amber-500' };
    if (score <= 4) return { score: 3, text: 'Khá an toàn', color: 'bg-emerald-600' };
    return { score: 4, text: 'Rất mạnh', color: 'bg-emerald-700' };
  });

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      const paramRole = params['role'] as UserRole;
      if (paramRole === 'buyer' || paramRole === 'vendor') {
        this.formState.role = paramRole;
      }
    });

    // Populate initial realistic sample data for quick preview if requested
    this.initMockDefaults();
  }

  ngOnDestroy(): void {
    if (this.countdownTimer) {
      clearInterval(this.countdownTimer);
    }
  }

  initMockDefaults(): void {
    this.formState.storeName = 'Nông Sản Xanh Lạc Dương';
    this.formState.businessType = 'enterprise';
    this.formState.companyName = 'Công ty TNHH Nông Nghiệp Công Nghệ Cao Lạc Dương';
    this.formState.taxCode = '0903909308';
    this.formState.contactPerson = 'Nguyễn Văn Nông';
    this.formState.phoneNumber = '+84 987 654 321';
    this.formState.email = 'contact@lacduongfarm.vn';
  }

  setRole(role: 'buyer' | 'vendor'): void {
    this.formState.role = role;
    this.errorMessage.set(null);
  }

  setBusinessType(type: BusinessType): void {
    this.formState.businessType = type;
    this.errors.businessType = undefined;
  }

  toggleTooltip(id: string): void {
    if (this.activeTooltip() === id) {
      this.activeTooltip.set(null);
    } else {
      this.activeTooltip.set(id);
    }
  }

  closeTooltip(): void {
    this.activeTooltip.set(null);
  }

  // File Upload Handlers
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.handleFile(input.files[0]);
    }
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(true);
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(false);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging.set(false);

    if (event.dataTransfer && event.dataTransfer.files.length > 0) {
      this.handleFile(event.dataTransfer.files[0]);
    }
  }

  private handleFile(file: File): void {
    // Validate file size (< 10MB)
    if (file.size > 10 * 1024 * 1024) {
      this.toastService.error('Dung lượng tệp không được vượt quá 10MB', 'Tệp quá lớn');
      return;
    }

    // Format file size
    const sizeInMB = (file.size / (1024 * 1024)).toFixed(1);
    const sizeStr = `${sizeInMB} MB`;

    this.formState.licenseFile = {
      name: file.name,
      size: sizeStr,
      type: file.type || 'application/pdf',
      uploadedAt: new Date()
    };

    this.toastService.success(`Đã tải lên tệp: ${file.name}`, 'Tải tệp thành công');
  }

  removeLicenseFile(): void {
    this.formState.licenseFile = null;
  }

  // OTP Handlers
  sendOtp(): void {
    if (!this.formState.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.formState.email.trim())) {
      this.errors.email = 'Vui lòng nhập địa chỉ email hợp lệ trước khi lấy mã OTP';
      this.toastService.warning('Vui lòng kiểm tra lại địa chỉ email', 'Email không hợp lệ');
      return;
    }

    this.errors.email = undefined;
    this.authFeatureService.sendEmailOtp(this.formState.email).subscribe({
      next: (res) => {
        this.otpSent.set(true);
        this.otpCountdown.set(60);
        this.formState.otpCode = '839201'; // auto-fill demo OTP code for convenient testing
        this.toastService.info(res.message, 'Đã gửi mã xác thực');

        if (this.countdownTimer) clearInterval(this.countdownTimer);
        this.countdownTimer = setInterval(() => {
          this.otpCountdown.update(v => {
            if (v <= 1) {
              clearInterval(this.countdownTimer);
              return 0;
            }
            return v - 1;
          });
        }, 1000);
      }
    });
  }

  togglePasswordVisibility(): void {
    this.showPassword.update(v => !v);
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword.update(v => !v);
  }

  // Submit Handler
  onSubmit(): void {
    this.errorMessage.set(null);

    // If password not set in demo, supply defaults if empty
    if (!this.formState.password) {
      this.formState.password = 'password123';
      this.formState.confirmPassword = 'password123';
    }

    const validation = this.authFeatureService.validateRegisterForm(this.formState);
    if (!validation.valid) {
      this.errors = validation.errors;
      // Scroll to first error or show toast
      const firstErrorKey = Object.keys(validation.errors)[0] as keyof RegisterFormState;
      this.toastService.warning(validation.errors[firstErrorKey] || 'Vui lòng kiểm tra lại thông tin', 'Thông tin chưa đầy đủ');
      return;
    }

    this.errors = {};
    this.isLoading.set(true);

    this.authFeatureService.submitRegister(this.formState).subscribe({
      next: (session) => {
        this.isLoading.set(false);
        this.registeredRole.set(this.formState.role);
        this.isSuccessModalOpen.set(true);
        this.toastService.success(
          `Chào mừng ${this.formState.contactPerson} đã đăng ký tài khoản thành công!`,
          'Đăng ký hoàn tất'
        );
      },
      error: (err) => {
        this.isLoading.set(false);
        const msg = err?.error?.message || 'Không thể hoàn tất đăng ký lúc này. Vui lòng thử lại!';
        this.errorMessage.set(msg);
        this.toastService.error(msg, 'Đăng ký thất bại');
      }
    });
  }

  navigateToLogin(): void {
    this.isSuccessModalOpen.set(false);
    this.router.navigate(['/auth/login'], { queryParams: { role: this.registeredRole() } });
  }

  navigateToDashboard(): void {
    this.isSuccessModalOpen.set(false);
    const dest = this.registeredRole() === 'vendor' ? '/vendor/dashboard' : '/buyer/catalog';
    this.router.navigateByUrl(dest);
  }
}

