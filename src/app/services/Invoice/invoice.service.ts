import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment.development';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class InvoiceService {

  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  generateInvoice(data: any) {
    return this.http.post(`${this.apiUrl}/invoice/generate`, data, {
      responseType: 'blob' // para recibir el PDF
    });
  }

  generateMultipleInvoices(invoices: any[]): Observable<Blob> {
    return this.http.post(`${this.apiUrl}/invoice/generate-multiple-invoices`, invoices, {
      responseType: 'blob'
    });
  }

  getAllInvoicess() {
    return this.http.get(`${this.apiUrl}/invoice/GetAllInvoices`, {   
    })
  }
}
