import {
  HttpInterceptorFn,
  HttpErrorResponse,
} from '@angular/common/http';
import { inject } from '@angular/core';
import {
  catchError,
  switchMap,
  throwError,
} from 'rxjs';
import { AuthService } from '../services/Auth/auth.service';
import { TenantService } from '../services/Tenant/tenant.service';

export const AuthInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(AuthService);

  const isPlatformRequest = req.url.includes('/platform-auth/') || req.url.includes('/subscriptions/');
  const isCreatorLogin = req.url.endsWith('/platform-auth/login');
  const token = isPlatformRequest
    ? (isCreatorLogin ? null : sessionStorage.getItem('creatorToken'))
    : sessionStorage.getItem('token');
  const tenant = sessionStorage.getItem('tenantId');

  const isTenantValidation = req.url.includes('/info/validate');

  if (!tenant && !isTenantValidation && !isPlatformRequest) {
    window.location.href = '/invalid-tenant';
    return throwError(() => new Error('Tenant no definido'));
  }

  let headers: any = {};

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (tenant && !isPlatformRequest) {
    headers['X-Tenant-Id'] = tenant;
  }

  const authReq = req.clone({ setHeaders: headers });

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && isPlatformRequest) {
        if (!isCreatorLogin) {
          sessionStorage.removeItem('creatorToken');
          window.location.assign('/creator/login');
        }
        return throwError(() => error);
      }

      if (error.status === 401 && token) {
        return authService.refreshToken().pipe(
          switchMap((newToken) => {
            return next(
              req.clone({
                setHeaders: {
                  Authorization: `Bearer ${newToken}`,
                  'X-Tenant-Id': tenant || ''
                }
              })
            );
          }),
          catchError(() => {
            authService.logout().subscribe();
            return throwError(() => error);
          })
        );
      }

      return throwError(() => error);
    })
  );
};