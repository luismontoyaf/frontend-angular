import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';

export type CompanyPlan = 'standard' | 'plus';
export type PlanUpgradeRequestStatus = 'pending' | 'approved' | 'rejected';

export interface CompanySettings {
  id: number;
  name: string;
  nit: string;
  email: string;
  phone: string;
  address: string;
  subscriptionPlan: CompanyPlan;
  upgradeRequestStatus: PlanUpgradeRequestStatus | null;
  upgradeRequestedAt: string | null;
}

export type UpdateCompanySettingsRequest = Pick<
  CompanySettings,
  'name' | 'nit' | 'email' | 'phone' | 'address'
>;

export interface PlanUpgradeRequest {
  id: number;
  companyId: number;
  companyName: string;
  companyNit: string;
  requestedByEmail: string;
  requestedAt: string;
}

@Injectable({ providedIn: 'root' })
export class CompanySettingsService {
  private readonly apiUrl = `${environment.apiUrl}/company-settings`;

  constructor(private readonly http: HttpClient) {}

  getSettings(): Observable<CompanySettings> {
    return this.http.get<CompanySettings>(this.apiUrl);
  }

  updateSettings(request: UpdateCompanySettingsRequest): Observable<CompanySettings> {
    return this.http.put<CompanySettings>(this.apiUrl, request);
  }

  requestPlusUpgrade(): Observable<CompanySettings> {
    return this.http.post<CompanySettings>(`${this.apiUrl}/upgrade-request`, {});
  }
}
