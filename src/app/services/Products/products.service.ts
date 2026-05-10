import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { Product } from '../../interfaces/product';

@Injectable({
  providedIn: 'root'
})
export class ProductsService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  addProduct(
    nombreProducto: string,
    descripcion: string,
    precio: string,
    stock: number,
    imagen: File
  ): Observable<any> {
    const precioLimpio = Number(
      precio.toString().replace(/\./g, '')
    );

    const formData = new FormData();
    formData.append('nombreProducto', nombreProducto);
    formData.append('descripcion', descripcion);
    formData.append('precio', precioLimpio.toString());
    formData.append('stock', stock.toString());
    formData.append('ImagenFile', imagen);

    return this.http.post(`${this.apiUrl}/products`, formData);
  }

  getProducts(): Observable<any> {
    return this.http.get(`${this.apiUrl}/products`);
  }

  getProductById(id: number): Observable<Product> {
    return this.http.get<Product>(`${this.apiUrl}/products/${id}`);
  }

  editProduct(id: number, cambios: Partial<Product>) {
    const patchData = Object.keys(cambios).map(key => ({
      op: "replace",
      path: `/${key}`,
      value: cambios[key as keyof Product]
    }));

    return this.http.patch<Product>(
      `${this.apiUrl}/products/${id}`,
      patchData,
      { headers: new HttpHeaders({ 'Content-Type': 'application/json-patch+json' }) }
    );
  }

  removeProduct(id: number) {
    return this.http.delete(`${this.apiUrl}/products/${id}`);
  }

  updateProductImage(id: number, imagen: File): Observable<any> {
    const formData = new FormData();
    formData.append('imagen', imagen);

    return this.http.put(`${this.apiUrl}/products/${id}/image`, formData);
  }
}