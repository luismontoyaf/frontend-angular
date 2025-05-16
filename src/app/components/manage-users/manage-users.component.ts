import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Product } from '../../interfaces/product';
import { ProductsService } from '../../services/Products/products.service';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from '../../../material.module'; 

@Component({
  selector: 'app-manage-users',
  imports: [CommonModule, FormsModule, MaterialModule],
  templateUrl: './manage-users.component.html',
  styleUrl: './manage-users.component.css'
})
export default class ManageUsersComponent {

  content: boolean = false;
  
    products: Product[] = []; // Cambiado a any[] para evitar errores de tipo
    filteredProducts: Product[] = []; // Cambiado a any[] para evitar errores de tipo
  
    searchTerm: string = '';

    constructor(private productsService: ProductsService) {
       this.productsService.getProducts().subscribe({
      next: (response: Product[]) => {
        if (response && response.length > 0) {
          this.products = response;
          this.filteredProducts = response;
          this.content = false; // Si hay productos, mostramos la lista
        } else {
          this.content = true; // Si no hay productos, mostramos el mensaje vacío
        }
      },
      error: (err) => {
        console.error('Error al obtener productos:', err);
        this.content = true; // Mostrar mensaje de "No hay productos"
      }
    });
    }
    

  filterProducts() {
    const term = this.searchTerm.toLowerCase();
    this.filteredProducts = this.products.filter(product => 
      product.nombreProducto.toLowerCase().includes(term)
    );
  }
}
