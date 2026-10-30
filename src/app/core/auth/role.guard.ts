import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';
import { UserRole } from '../models/role.model';

export const roleGuard = (allowedRoles: UserRole[]): CanActivateFn => {
  return (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    const currentUser = authService.currentUser();
    if (!currentUser) {
      return router.createUrlTree(['/auth/login'], {
        queryParams: { returnUrl: state.url }
      });
    }

    if (allowedRoles.includes(currentUser.role)) {
      return true;
    }

    // Role not authorized, redirect to their role home
    const targetUrl = authService.getRedirectUrlForRole(currentUser.role);
    return router.createUrlTree([targetUrl]);
  };
};

