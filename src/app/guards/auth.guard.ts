import { inject } from '@angular/core';
import { CanActivateFn, CanMatchFn, Router } from '@angular/router';
import { AuthService } from '../services/Auth/auth.service';
import { jwtDecode } from 'jwt-decode';

const checkAuth = (): boolean => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const token = sessionStorage.getItem('token');
  const refreshToken = sessionStorage.getItem('refreshToken');
  const tenant = sessionStorage.getItem('tenantId');

  if (!tenant) {
    router.navigate(['/invalid-tenant']);
    return false;
  }

  if (!token) {
    router.navigate([`/${tenant}`]);
    return false;
  }

  if (!refreshToken) {
    authService.logout().subscribe({
      complete: () => router.navigate([`/${tenant}`])
    });
    return false;
  }

  try {
    const decoded: any = jwtDecode(token);
    const now = Math.floor(Date.now() / 1000);

    if (decoded.exp < now) {
      authService.logout().subscribe({
        complete: () => router.navigate([`/${tenant}`])
      });
      return false;
    }

    return true;
  } catch (e) {
    authService.logout().subscribe({
      complete: () => router.navigate([`/${tenant}`])
    });
    return false;
  }
};

export const authGuardCanActivate: CanActivateFn = () => {
  return checkAuth();
};

export const authGuardCanMatch: CanMatchFn = () => {
  return checkAuth();
};
