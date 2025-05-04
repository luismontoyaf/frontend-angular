import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class InvoiceService {

  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  generateInvoice(data: any) {
    console.log("data:", JSON.stringify(data));
    return this.http.post(`${this.apiUrl}/invoice/generate`, data, {
      responseType: 'blob' // para recibir el PDF
    });
  }
}
