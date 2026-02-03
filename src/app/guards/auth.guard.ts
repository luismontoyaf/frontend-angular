import { inject } from '@angular/core';
import { CanActivateFn, CanMatchFn, Router } from '@angular/router';
import { AuthService } from '../services/Auth/auth.service';
import { jwtDecode } from 'jwt-decode';

const checkAuth = (): boolean => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const token = sessionStorage.getItem('token');
  const refreshToken = sessionStorage.getItem('refreshToken');

  // Si no hay token, redirige al login
  if (!token) {
    router.navigate(['/login']);
    return false;
  }

  if(!refreshToken) return false;

  try {
    const decoded: any = jwtDecode(token);
    const now = Math.floor(Date.now() / 1000);

    // Si el token ha expirado, redirige al login
    if (decoded.exp < now) {
      authService.logout().subscribe(); // Limpia tokens y redirige
      return false;
    }

    return true;
  } catch (e) {
    // Token inválido o corrupto
    authService.logout().subscribe();
    return false;
  }
};

export const authGuardCanActivate: CanActivateFn = () => {
  return checkAuth();
};

export const authGuardCanMatch: CanMatchFn = () => {
  return checkAuth();
};
