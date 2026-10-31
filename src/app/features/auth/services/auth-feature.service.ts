import { Injectable, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay, tap } from 'rxjs/operators';
import { AuthService, AuthSession } from '../../../core/auth/auth.service';
import { UserRole } from '../../../core/models/role.model';
import { LoginFormState, MOCK_ACCOUNTS, MockAccount, RegisterFormState } from '../models/auth.model';

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

  validateRegisterForm(form: RegisterFormState): { valid: boolean; errors: Partial<Record<keyof RegisterFormState, string>> } {
    const errors: Partial<Record<keyof RegisterFormState, string>> = {};

    if (!form.storeName || !form.storeName.trim()) {
      errors.storeName = 'Vui lòng nhập tên cửa hàng / thương hiệu';
    } else if (form.storeName.length > 120) {
      errors.storeName = 'Tên cửa hàng không được vượt quá 120 ký tự';
    }

    if (!form.businessType) {
      errors.businessType = 'Vui lòng chọn loại hình kinh doanh';
    }

    if (form.businessType === 'enterprise' && (!form.companyName || !form.companyName.trim())) {
      errors.companyName = 'Doanh nghiệp bắt buộc phải có tên công ty';
    } else if (form.companyName && form.companyName.length > 300) {
      errors.companyName = 'Tên công ty không được vượt quá 300 ký tự';
    }

    if ((form.businessType === 'enterprise' || form.businessType === 'household') && (!form.taxCode || !form.taxCode.trim())) {
      errors.taxCode = 'Vui lòng nhập mã doanh nghiệp / mã số thuế';
    } else if (form.taxCode && form.taxCode.length > 100) {
      errors.taxCode = 'Mã doanh nghiệp không được vượt quá 100 ký tự';
    }

    if (!form.contactPerson || !form.contactPerson.trim()) {
      errors.contactPerson = 'Vui lòng nhập họ tên người liên hệ';
    } else if (form.contactPerson.length > 100) {
      errors.contactPerson = 'Tên người liên hệ không được vượt quá 100 ký tự';
    }

    if (!form.phoneNumber || !form.phoneNumber.trim()) {
      errors.phoneNumber = 'Vui lòng nhập số điện thoại liên hệ';
    } else if (!/(0|\+84)[0-9]{8,11}$/.test(form.phoneNumber.replace(/[\s-]/g, ''))) {
      errors.phoneNumber = 'Số điện thoại không hợp lệ (9 - 11 chữ số)';
    }

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

    if (!form.confirmPassword) {
      errors.confirmPassword = 'Vui lòng xác nhận lại mật khẩu';
    } else if (form.password !== form.confirmPassword) {
      errors.confirmPassword = 'Mật khẩu xác nhận không khớp';
    }

    if (!form.agreeTerms) {
      errors.agreeTerms = 'Bạn cần đồng ý với điều khoản dịch vụ để tiếp tục';
    }

    return {
      valid: Object.keys(errors).length === 0,
      errors
    };
  }

  sendEmailOtp(email: string): Observable<{ success: boolean; message: string }> {
    return of({
      success: true,
      message: `Mã xác thực OTP gồm 6 chữ số đã được gửi đến hộp thư ${email}`
    }).pipe(delay(800));
  }

  submitRegister(form: RegisterFormState): Observable<AuthSession> {
    const mockUser = {
      id: 'usr_' + Math.random().toString(36).substring(2, 9),
      email: form.email,
      fullName: form.contactPerson,
      role: form.role,
      organizationName: form.companyName || form.storeName,
      isVerified: !!form.licenseFile,
      avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(form.contactPerson)}&background=0d623b&color=ffffff&bold=true`
    };

    const session: AuthSession = {
      token: 'jwt_mock_token_' + btoa(form.role + ':' + Date.now()),
      user: mockUser
    };

    return of(session).pipe(
      delay(900),
      tap(s => {
        // Automatically save session on registration
        if (typeof localStorage !== 'undefined') {
          localStorage.setItem('kaggri_auth_token', s.token);
          localStorage.setItem('kaggri_auth_user', JSON.stringify(s.user));
        }
      })
    );
  }
}

