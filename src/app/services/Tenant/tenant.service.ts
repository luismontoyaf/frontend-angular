import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class TenantService {
  getTenant(): string | null {
    return sessionStorage.getItem('tenantId');
  }

  setTenant(tenantId: string): void {
    sessionStorage.setItem('tenantId', tenantId);
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
  }
}
