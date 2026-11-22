import { inject } from '@angular/core';
import { CanActivateFn, CanMatchFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { AuthService } from '../services/Auth/auth.service';
import { GetInfoService } from '../services/GetInfo/get-info.service';
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

export const plusPlanGuard: CanActivateFn = route => {
  const getInfoService = inject(GetInfoService);
  const router = inject(Router);
  const tenantId = route.pathFromRoot
    .map(snapshot => snapshot.paramMap.get('tenantId'))
    .find((value): value is string => !!value);

  if (!tenantId) return false;

  return getInfoService.getUserInfo().pipe(
    map((user: any) => {
      const isAdmin = ['1', 'Administrador'].includes(String(user.role));
      return isAdmin && user.subscriptionPlan === 'plus'
        ? true
        : router.createUrlTree(['/', tenantId, 'dashboard', 'home']);
    }),
    catchError(error => {
      console.error('No fue posible verificar el plan de la empresa:', error);
      return of(router.createUrlTree(['/', tenantId, 'dashboard', 'home']));
    })
  );
};

export const companyAdminGuard: CanActivateFn = route => {
  const getInfoService = inject(GetInfoService);
  const router = inject(Router);
  const tenantId = route.pathFromRoot
    .map(snapshot => snapshot.paramMap.get('tenantId'))
    .find((value): value is string => !!value);

  if (!tenantId) return false;

  return getInfoService.getUserInfo().pipe(
    map((user: any) => ['1', 'Administrador'].includes(String(user.role))
      ? true
      : router.createUrlTree(['/', tenantId, 'dashboard', 'home'])),
    catchError(error => {
      console.error('No fue posible verificar los permisos de configuración:', error);
      return of(router.createUrlTree(['/', tenantId, 'dashboard', 'home']));
    })
  );
};
