import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class ReportsService {

  apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  getReport(Id: number, startDate: any, endDate: any, spinner = false): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/reports/getReport?id=${Id}&startDate=${startDate}&endDate=${endDate}`, {
    });
  }
}
