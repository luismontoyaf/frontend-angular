import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class GetInfoService {

  private apiUrl = environment.apiUrl;
  
  constructor(private http: HttpClient) {}

  getParameter(nombreParametro: string): Observable<string> {
    return this.http.post(`${this.apiUrl}/info/getParameter`, 
      { NombreParametro: nombreParametro }, 
      { headers: { 'Content-Type': 'application/json' }, responseType: 'text' } // Importante: responseType: 'text'
    );
  }

  getUserInfo(): Observable<any> {
    return this.http.get(`${this.apiUrl}/info/getUserInfo`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    });
  }

  getUserInfoByDocument(cedula: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/info/getUserInfoByDocument`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      params: { document: cedula }
    });
  }
}
