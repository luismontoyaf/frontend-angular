import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class GetInfoService {

  private apiUrl = 'http://localhost:5000/api/info';
  
  constructor(private http: HttpClient) {}

  getParameter(nombreParametro: string): Observable<string> {
    return this.http.post('http://localhost:5000/api/info/getParameter', 
      { NombreParametro: nombreParametro }, 
      { headers: { 'Content-Type': 'application/json' }, responseType: 'text' } // Importante: responseType: 'text'
    );
  }

  getUserInfo(): Observable<any> {
    return this.http.get("http://localhost:5000/api/info/getUserInfo", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }
    });
  }
}
