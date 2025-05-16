import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class SaleService {

  private apiUrl = environment.apiUrl;
  
    constructor(private http: HttpClient) { }
  
    saveSale(data: any) {
      console.log("data:", JSON.stringify(data));
      
      const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
      return this.http.post(`${this.apiUrl}/sale/saveSale`, data, {headers});
    }
}
