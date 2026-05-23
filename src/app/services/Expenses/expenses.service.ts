import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';

@Injectable({
  providedIn: 'root'
})
export class ExpensesService {

  private http = inject(HttpClient);

  private apiUrl = `${environment.apiUrl}/expenses`;

  createExpense(data: any): Observable<any> {
    return this.http.post(this.apiUrl, data);
  }

  getExpenses(): Observable<any[]> {
    return this.http.get<any[]>(this.apiUrl);
  }

  getExpensesTypes(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/expenses-types`);
  }
}