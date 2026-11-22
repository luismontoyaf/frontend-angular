import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class TenantService {
  private readonly tenantSubject = new BehaviorSubject<string | null>(this.getTenant());
  readonly tenantId$ = this.tenantSubject.asObservable();

  getTenant(): string | null {
    return sessionStorage.getItem('tenantId');
  }

  setTenant(tenantId: string): void {
    sessionStorage.setItem('tenantId', tenantId);
    this.tenantSubject.next(tenantId);
  }

  getTenantOrThrow(): string {
    const tenant = this.getTenant();

    if (!tenant) {
      throw new Error('Tenant no definido');
    }

    return tenant;
  }

  clearTenant(): void {
    sessionStorage.removeItem('tenantId');
    this.tenantSubject.next(null);
  }
}
