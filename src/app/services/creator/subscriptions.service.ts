import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import type { PlanUpgradeRequest } from '../Company/company-settings.service';

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

export type SubscriptionPlan = 'standard' | 'plus';

export interface CompanyBranch {
  id: number;
  name: string;
  identifier: string;
  nit: string;
  email: string;
  companyNit?: string;
  companyEmail?: string;
  phone: string;
  address: string;
  isActive: boolean;
  isHeadquarters: boolean;
}

export interface SubscriptionCompany {
  id: number;
  name: string;
  nit: string;
  email: string;
  subscriptionPlan: SubscriptionPlan;
  isActive: boolean;
  suspendedForOverdue: boolean;
  startDate: string | null;
  periods: SubscriptionPeriod[];
  branches: CompanyBranch[];
}

export interface CreateCompanyRequest {
  name: string;
  nit: string;
  email: string;
  subscriptionPlan: SubscriptionPlan;
  phone: string;
  address: string;
  branchName: string;
  branchNit: string;
  branchIdentifier: string;
  branchAddress: string;
  branchPhone: string;
  branchEmail: string;
  startDate: string;
  adminFirstName: string;
  adminLastName: string;
  adminEmail: string;
  adminDocumentType: string;
  adminDocumentNumber: string;
  adminPhone: string;
  adminPassword: string;
}

@Injectable({ providedIn: 'root' })
export class SubscriptionsService {
  private readonly apiUrl = `${environment.apiUrl}/subscriptions`;

  constructor(private readonly http: HttpClient) {}

  getCompanies(): Observable<SubscriptionCompany[]> {
    return this.http.get<SubscriptionCompany[]>(`${this.apiUrl}/companies`);
  }

  getPlanUpgradeRequests(): Observable<PlanUpgradeRequest[]> {
    return this.http.get<PlanUpgradeRequest[]>(`${this.apiUrl}/plan-upgrade-requests`);
  }

  approvePlanUpgradeRequest(requestId: number): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(
      `${this.apiUrl}/plan-upgrade-requests/${requestId}/approve`,
      {}
    );
  }

  rejectPlanUpgradeRequest(requestId: number): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(
      `${this.apiUrl}/plan-upgrade-requests/${requestId}/reject`,
      {}
    );
  }

  createCompany(request: CreateCompanyRequest): Observable<CompanyBranch> {
    return this.http.post<CompanyBranch>(`${this.apiUrl}/companies`, request);
  }

  initialize(companyId: number, startDate: string): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/companies/${companyId}/initialize`, { startDate });
  }

  registerPayment(periodId: number): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/periods/${periodId}/payments`, {});
  }

  deactivate(companyId: number): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/companies/${companyId}/deactivate`, {});
  }

  activate(companyId: number): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/companies/${companyId}/activate`, {});
  }

  renew(companyId: number): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.apiUrl}/companies/${companyId}/renew`, {});
  }
}
