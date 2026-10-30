import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService, AuthSession } from '../../../core/auth/auth.service';
import { UserRole } from '../../../core/models/role.model';
import { LoginFormState, MOCK_ACCOUNTS, MockAccount } from '../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthFeatureService {
  private readonly coreAuth = inject(AuthService);

  getMockAccounts(): MockAccount[] {
    return MOCK_ACCOUNTS;
  }

  getMockAccountByRole(role: UserRole): MockAccount | undefined {
    return MOCK_ACCOUNTS.find(acc => acc.role === role);
  }

  validateLoginForm(form: LoginFormState): { valid: boolean; errors: Partial<Record<keyof LoginFormState, string>> } {
    const errors: Partial<Record<keyof LoginFormState, string>> = {};

    if (!form.email || !form.email.trim()) {
      errors.email = 'Vui lòng nhập địa chỉ email';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      errors.email = 'Địa chỉ email không đúng định dạng';
    }

    if (!form.password) {
      errors.password = 'Vui lòng nhập mật khẩu';
    } else if (form.password.length < 6) {
      errors.password = 'Mật khẩu phải có ít nhất 6 ký tự';
    }

    if (!form.role) {
      errors.role = 'Vui lòng chọn vai trò truy cập';
    }

    return {
      valid: Object.keys(errors).length === 0,
      errors
    };
  }

  submitLogin(form: LoginFormState): Observable<AuthSession> {
    return this.coreAuth.login({
      email: form.email,
      password: form.password,
      role: form.role,
      rememberMe: form.rememberMe
    });
  }
}

