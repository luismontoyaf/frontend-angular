import { inject } from '@angular/core';
import { CanActivateFn, CanMatchFn, Router } from '@angular/router';
import { AuthService } from '../services/Auth/auth.service';

const checkAuth = (): boolean => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  router.navigate(['/login']);
  return false;
};

export const authGuardCanActivate: CanActivateFn = () => {
  return checkAuth();
};

export const authGuardCanMatch: CanMatchFn = () => {
  return checkAuth();
};
