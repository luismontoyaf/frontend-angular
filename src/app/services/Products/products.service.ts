import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

interface Product {
  id: number;
  nombreProducto: string;
  descripcion: string;
  stock: number;
  precio: number;
  imagenBase64?: string; // Imagen como Base64 (cuando se obtiene)
  imagenFile?: File;     // Imagen como File (cuando se envía)
}

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
      formData.append('ImagenFile', imagen);
    
      return this.http.post(this.apiUrl + "/addProduct", formData);
    }

    getProducts() : Observable<any> {
      return this.http.get(this.apiUrl + "/getProducts");
    }

    editProduct(id: number, cambios: Partial<Product>) {
      // Convertimos el objeto de cambios en formato JSON Patch
      const patchData = Object.keys(cambios).map(key => ({
        op: "replace",
        path: `/${key}`,
        value: cambios[key as keyof Product]
      }));

      console.log('patchData', JSON.stringify(patchData));
      
    
      return this.http.patch<Product>(`${this.apiUrl}/${id}`, patchData, {
        headers: new HttpHeaders({ 'Content-Type': 'application/json-patch+json' })
      });
    }

    deleteProduct(id: number, cambios: Partial<any>) {
      // Convertimos el objeto de cambios en formato JSON Patch
      const patchData = Object.keys(cambios).map(key => ({
        op: "replace",
        path: `/${key}`,
        value: cambios[key as keyof Product]
      }));

      console.log('patchData', JSON.stringify(patchData));
      
    
      return this.http.patch<Product>(`${this.apiUrl}/delete/${id}`, patchData, {
        headers: new HttpHeaders({ 'Content-Type': 'application/json-patch+json' })
      });
    }
}