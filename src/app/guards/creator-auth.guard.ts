import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { jwtDecode } from 'jwt-decode';

export const creatorAuthGuard: CanActivateFn = (_route, state) => {
  const router = inject(Router);
  const token = sessionStorage.getItem('creatorToken');

  if (!token) {
    return router.createUrlTree(['/creator/login'], { queryParams: { returnUrl: state.url } });
  }

  try {
    const claims = jwtDecode<Record<string, unknown>>(token);
    const role = claims['role'] ?? claims['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'];
    if (role === 'platform_creator' && typeof claims['exp'] === 'number' && claims['exp'] > Date.now() / 1000) {
      return true;
    }
  } catch {
    // Invalid tokens are treated as unauthenticated.
  }

  sessionStorage.removeItem('creatorToken');
  sessionStorage.removeItem('creatorEmail');
  return router.createUrlTree(['/creator/login'], { queryParams: { returnUrl: state.url } });
};
