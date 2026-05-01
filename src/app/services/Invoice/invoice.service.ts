import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment.development';
import { Observable } from 'rxjs';
import { TenantService } from '../Tenant/tenant.service';

@Injectable({
  providedIn: 'root'
})
export class InvoiceService {

  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient, private tenantService: TenantService) {}

  private validateTenant() {
    this.tenantService.getTenantOrThrow();
  }

  generateInvoice(data: any): Observable<Blob> {
    this.validateTenant();

    return this.http.post(`${this.apiUrl}/invoice/generate`, data, {
      responseType: 'blob'
    });
  }

  generateMultipleInvoices(invoices: any[]): Observable<Blob> {
    this.validateTenant();

    return this.http.post(`${this.apiUrl}/invoice/generate-multiple-invoices`, invoices, {
      responseType: 'blob'
    });
  }

  getAllInvoices() {
    this.validateTenant();

    return this.http.get(`${this.apiUrl}/invoice/GetAllInvoices`);
  }
}
