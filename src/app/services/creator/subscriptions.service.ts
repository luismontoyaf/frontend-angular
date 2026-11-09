import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';

export interface SubscriptionPeriod {
  id: number;
  cycleNumber: number;
  monthNumber: number;
  dueDate: string;
  paidAt: string | null;
  status: 'Pendiente' | 'Pagado' | 'En mora';
  reminderCount: number;
  lastReminderSentAt: string | null;
}

export interface SubscriptionTenant {
  id: number;
  name: string;
  identifier: string;
  nit: string;
  email: string;
  isActive: boolean;
  suspendedForOverdue: boolean;
  startDate: string | null;
  periods: SubscriptionPeriod[];
}

@Injectable({ providedIn: 'root' })
export class SubscriptionsService {
  private readonly apiUrl = `${environment.apiUrl}/subscriptions`;

  constructor(private readonly http: HttpClient) {}

  getTenants(): Observable<SubscriptionTenant[]> {
    return this.http.get<SubscriptionTenant[]>(`${this.apiUrl}/tenants`);
  }

  initialize(tenantId: number, startDate: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/tenants/${tenantId}/initialize`, { startDate });
  }

  registerPayment(periodId: number): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/periods/${periodId}/payments`, {});
  }

  deactivate(tenantId: number): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/tenants/${tenantId}/deactivate`, {});
  }

  renew(tenantId: number): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/tenants/${tenantId}/renew`, {});
  }
}
