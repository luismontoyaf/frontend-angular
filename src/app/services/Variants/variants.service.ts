import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { VariantDTO, Variants } from '../../interfaces/variants';

@Injectable({
  providedIn: 'root'
})
export class VariantsService {

  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) { }

  createVariant(variantData: VariantDTO): Observable<any> {
    return this.http.post(`${this.apiUrl}/variant/createVariant`, variantData);
  }

  updateVariant(id: number, data: Variants): Observable<any> {
    return this.http.patch(`${this.apiUrl}variants/${id}`, data);
  }

  getVariants(): Observable<any>{
    return this.http.get(`${this.apiUrl}/variant/getVariants`)
  }

  getVariantById(id: number): Observable<any>{
    return this.http.get(`${this.apiUrl}/variant/getVariantById/${id}`)
  }

  changeStatusVariant(id: number): Observable<any>{
    return this.http.patch<Variants>(`${this.apiUrl}/variant/changeStatusVariant/${id}`,{
        headers: new HttpHeaders({ 'Content-Type': 'application/json-patch+json' })
      });
  }

  deleteVariant(id: number): Observable<any>{
    return this.http.delete<Variants>(`${this.apiUrl}/variant/${id}`,{
        headers: new HttpHeaders({ 'Content-Type': 'application/json-patch+json' })
      });
  }

}
