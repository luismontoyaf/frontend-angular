import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { CompanyBranch } from '../creator/subscriptions.service';

export interface BranchRequest {
  name: string;
  identifier: string;
  nit: string;
  email: string;
  phone: string;
  address: string;
}

@Injectable({ providedIn: 'root' })
export class BranchesService {
  private readonly apiUrl = `${environment.apiUrl}/branches`;

  constructor(private readonly http: HttpClient) {}

  getBranches(): Observable<CompanyBranch[]> {
    return this.http.get<CompanyBranch[]>(this.apiUrl);
  }

  createBranch(request: BranchRequest): Observable<CompanyBranch> {
    return this.http.post<CompanyBranch>(this.apiUrl, request);
  }

  updateBranch(branchId: number, request: BranchRequest): Observable<CompanyBranch> {
    return this.http.put<CompanyBranch>(`${this.apiUrl}/${branchId}`, request);
  }
}
