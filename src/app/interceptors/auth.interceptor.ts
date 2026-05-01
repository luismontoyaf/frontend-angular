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

  const token = sessionStorage.getItem('token');
  const tenant = sessionStorage.getItem('tenantId');

  const isTenantValidation = req.url.includes('/info/validate');

  if (!tenant && !isTenantValidation) {
    window.location.href = '/invalid-tenant';
    return throwError(() => new Error('Tenant no definido'));
  }

  let headers: any = {};

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (tenant) {
    headers['X-Tenant-Id'] = tenant;
  }

  const authReq = req.clone({ setHeaders: headers });

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
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