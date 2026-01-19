import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { Product } from '../../interfaces/product';

@Injectable({
  providedIn: 'root'
})
export class ProductsService {
  private apiUrl = environment.apiUrl; // URL de la API
  
    constructor(private http: HttpClient) {}
    
    addProduct(nombreProducto: string, descripcion: string, precio: string, stock: number, imagen: File): Observable<any> {
      const formData = new FormData();
      formData.append('nombreProducto', nombreProducto);
      formData.append('descripcion', descripcion);
      formData.append('precio', precio.toString());
      formData.append('stock', stock.toString());
      formData.append('ImagenFile', imagen);
    
      return this.http.post(this.apiUrl + "/products/addProduct", formData);
    }

    getProducts() : Observable<any> {
      return this.http.get(`${this.apiUrl}/products/getProducts`);
    }

    editProduct(id: number, cambios: Partial<Product>) {
      // Convertimos el objeto de cambios en formato JSON Patch
      const patchData = Object.keys(cambios).map(key => ({
        op: "replace",
        path: `/${key}`,
        value: cambios[key as keyof Product]
      }));

      return this.http.patch<Product>(`${this.apiUrl}/products/${id}`, patchData, {
        headers: new HttpHeaders({ 'Content-Type': 'application/json-patch+json' })
      });
    }

    removeProduct(id: number) {
      return this.http.delete<Product>(`${this.apiUrl}/products/${id}`, {
        headers: new HttpHeaders({ 'Content-Type': 'application/json-patch+json' })
      });
    }

    updateProductImage(id: number, formData: FormData): Observable<any> {  
      return this.http.put(`${this.apiUrl}/products/${id}/image`, formData);
    }

    deleteProduct(id: number, cambios: Partial<any>) {
      // Convertimos el objeto de cambios en formato JSON Patch
      const patchData = Object.keys(cambios).map(key => ({
        op: "replace",
        path: `/${key}`,
        value: cambios[key as keyof Product]
      }));
    
      return this.http.patch<Product>(`${this.apiUrl}/products/delete/${id}`, patchData, {
        headers: new HttpHeaders({ 'Content-Type': 'application/json-patch+json' })
      });
    }

    getProductById(id:number): Observable<Product>{
      return this.http.get<Product>(`${this.apiUrl}/products/GetProductById/${id}`);
    }
}