import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '../../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {

  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getDashboardInfo(): Observable<any> {
    return this.http.get(`${this.apiUrl}/dashboard/getDashboardInfo`);
  }
}
