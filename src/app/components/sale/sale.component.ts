import { Component } from '@angular/core';
import { MaterialModule } from '../../../material.module'; 
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarService } from '../../services/Sidebar/sidebar.service';
import { ProductsService } from '../../services/Products/products.service';
import { Product } from '../../interfaces/product';

@Component({
  selector: 'app-sale',
  imports: [MaterialModule, CommonModule, FormsModule],
  templateUrl: './sale.component.html',
  styleUrl: './sale.component.css'
})
export default class SaleComponent {
 isMenuOpen = false;
  content: boolean = false;
  products: Product[] = [];
  filteredProducts: Product[] = [];

  searchTerm: string = '';

  constructor(private sidebarService: SidebarService, private productsService: ProductsService) {
    this.sidebarService.isOpen$.subscribe(open => {
      this.isMenuOpen = open;
    });

    this.productsService.getProducts().subscribe({
      next: (response: Product[]) => {
        console.log('Productos obtenidos:', response);
    
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

  // Método para filtrar productos por nombre
  filterProducts() {
    const term = this.searchTerm.toLowerCase();
    this.filteredProducts = this.products.filter(product => 
      product.nombreProducto.toLowerCase().includes(term)
    );
  }

  // Simular la acción de comprar un producto
  buyProduct(product: any) {
    alert(`Has comprado: ${product.nombreProducto}`);
  }
}
