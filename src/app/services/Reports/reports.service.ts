import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class ReportsService {

  apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getListReports(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/reports/getListReports`);
  }

  getReport(Id: number, startDate?: string, endDate?: string): Observable<any> {
    let params = new HttpParams().set('id', Id);

    if (startDate) params = params.set('startDate', startDate);
    if (endDate) params = params.set('endDate', endDate);

    return this.http.get<any>(`${this.apiUrl}/reports/getReport`, { params });
  }
}
