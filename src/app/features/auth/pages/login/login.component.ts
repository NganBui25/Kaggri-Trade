import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { UserRole, ROLE_DEFINITIONS } from '../../../../core/models/role.model';
import { AuthService } from '../../../../core/auth/auth.service';
import { AuthFeatureService } from '../../services/auth-feature.service';
import { LoginFormState, MockAccount } from '../../models/auth.model';
import { RoleSelectorComponent } from '../../components/role-selector/role-selector.component';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, RoleSelectorComponent],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly authService = inject(AuthService);
  private readonly authFeatureService = inject(AuthFeatureService);
  private readonly notificationService = inject(NotificationService);

  readonly roleDefinitions = ROLE_DEFINITIONS;
  readonly mockAccounts = this.authFeatureService.getMockAccounts();

  // Form State
  formState: LoginFormState = {
    email: '',
    password: '',
    role: 'buyer',
    rememberMe: true
  };

  errors: Partial<Record<keyof LoginFormState, string>> = {};
  showPassword = signal(false);
  isLoading = signal(false);
  errorMessage = signal<string | null>(null);

  constructor() {
    // Check query params for role or mode
    this.route.queryParams.subscribe(params => {
      const paramRole = params['role'] as UserRole;
      if (paramRole && ['buyer', 'vendor', 'admin'].includes(paramRole)) {
        this.formState.role = paramRole;
      }
      this.applyMockCredentials(this.formState.role);
    });
  }

  onRoleChange(newRole: UserRole): void {
    this.formState.role = newRole;
    this.errors.role = undefined;
    this.errorMessage.set(null);
    this.applyMockCredentials(newRole);
  }

  togglePasswordVisibility(): void {
    this.showPassword.update(v => !v);
  }

  applyMockCredentials(role: UserRole): void {
    const mock = this.authFeatureService.getMockAccountByRole(role);
    if (mock) {
      this.formState.email = mock.email;
      this.formState.password = mock.password;
    }
  }

  onSubmit(): void {
    this.errorMessage.set(null);

    // Validation
    const validation = this.authFeatureService.validateLoginForm(this.formState);
    if (!validation.valid) {
      this.errors = validation.errors;
      return;
    }

    this.errors = {};
    this.isLoading.set(true);

    this.authFeatureService.submitLogin(this.formState).subscribe({
      next: (session) => {
        this.isLoading.set(false);
        this.notificationService.success(
          `Chào mừng ${session.user.fullName} (${session.user.organizationName || 'Kaggri-Trade'}) đã đăng nhập thành công!`,
          'Đăng nhập thành công'
        );

        // Check returnUrl
        const returnUrl = this.route.snapshot.queryParams['returnUrl'];
        const destination = returnUrl || this.authService.getRedirectUrlForRole(session.user.role);

        this.router.navigateByUrl(destination);
      },
      error: (err) => {
        this.isLoading.set(false);
        const msg = err?.error?.message || 'Email hoặc mật khẩu không chính xác. Vui lòng thử lại!';
        this.errorMessage.set(msg);
        this.notificationService.error(msg, 'Đăng nhập thất bại');
      }
    });
  }
}

