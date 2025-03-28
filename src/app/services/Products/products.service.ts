import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProductsService {
  private apiUrl = 'http://localhost:5000/api/products';
  
    constructor(private http: HttpClient) {}
  
    addProduct(nombreProducto: string, descripcion: string, precio: string, stock: number, imagen: File): Observable<any> {
      const formData = new FormData();
      formData.append('nombreProducto', nombreProducto);
      formData.append('descripcion', descripcion);
      formData.append('precio', precio.toString());
      formData.append('stock', stock.toString());
      formData.append('imagen', imagen);
    
      return this.http.post(this.apiUrl + "/addProduct", formData);
    }

    getProducts() : Observable<any> {
      return this.http.get(this.apiUrl + "/getProducts");
    }
}