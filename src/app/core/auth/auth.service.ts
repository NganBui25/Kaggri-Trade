import { Injectable, signal, computed, inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { delay, tap } from 'rxjs/operators';
import { User } from '../models/user.model';
import { UserRole, ROLE_DEFINITIONS } from '../models/role.model';
import { environment } from '../../../environments/environment';

export interface LoginCredentials {
  email: string;
  password?: string;
  role: UserRole;
  rememberMe?: boolean;
}

export interface AuthSession {
  token: string;
  user: User;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  private readonly TOKEN_KEY = 'kaggri_auth_token';
  private readonly USER_KEY = 'kaggri_auth_user';

  // Signals
  readonly currentUser = signal<User | null>(this.getInitialUser());
  readonly isAuthenticated = computed(() => !!this.currentUser());
  readonly currentRole = computed(() => this.currentUser()?.role ?? null);

  private getInitialUser(): User | null {
    if (!this.isBrowser) return null;
    try {
      const rawUser = localStorage.getItem(this.USER_KEY) || sessionStorage.getItem(this.USER_KEY);
      return rawUser ? JSON.parse(rawUser) : null;
    } catch {
      return null;
    }
  }

  getToken(): string | null {
    if (!this.isBrowser) return null;
    return localStorage.getItem(this.TOKEN_KEY) || sessionStorage.getItem(this.TOKEN_KEY);
  }

  login(credentials: LoginCredentials): Observable<AuthSession> {
    // If backend endpoint is available, call API. Otherwise, simulate robust authentication
    const mockSession: AuthSession = this.createMockSession(credentials);

    return of(mockSession).pipe(
      delay(600), // realistic network delay
      tap(session => {
        this.saveSession(session, !!credentials.rememberMe);
      })
    );
  }

  logout(): void {
    if (this.isBrowser) {
      localStorage.removeItem(this.TOKEN_KEY);
      localStorage.removeItem(this.USER_KEY);
      sessionStorage.removeItem(this.TOKEN_KEY);
      sessionStorage.removeItem(this.USER_KEY);
    }
    this.currentUser.set(null);
  }

  private saveSession(session: AuthSession, rememberMe: boolean): void {
    if (!this.isBrowser) return;

    const storage = rememberMe ? localStorage : sessionStorage;
    storage.setItem(this.TOKEN_KEY, session.token);
    storage.setItem(this.USER_KEY, JSON.stringify(session.user));

    this.currentUser.set(session.user);
  }

  private createMockSession(credentials: LoginCredentials): AuthSession {
    const roleInfo = ROLE_DEFINITIONS[credentials.role];
    let fullName = 'Người dùng Kaggri-Trade';
    let orgName = 'Doanh nghiệp đối tác';

    if (credentials.role === 'buyer') {
      fullName = 'Trần Minh Đức';
      orgName = 'HTX Bách Hóa Xanh';
    } else if (credentials.role === 'vendor') {
      fullName = 'Nguyễn Văn Nông';
      orgName = 'HTX Nông Sản Rau Sạch Lạc Dương';
    } else {
      fullName = 'Võ Thành Admin';
      orgName = 'Ban Quản Trị Sàn Kaggri-Trade';
    }

    const mockUser: User = {
      id: 'usr_' + Math.random().toString(36).substring(2, 9),
      email: credentials.email || `${credentials.role}@kaggritrade.vn`,
      fullName,
      role: credentials.role,
      organizationName: orgName,
      isVerified: true,
      avatarUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(fullName)}&background=0d623b&color=ffffff&bold=true`
    };

    return {
      token: 'jwt_mock_token_' + btoa(credentials.role + ':' + Date.now()),
      user: mockUser
    };
  }

  getRedirectUrlForRole(role: UserRole): string {
    return ROLE_DEFINITIONS[role]?.defaultRedirect || '/';
  }
}
