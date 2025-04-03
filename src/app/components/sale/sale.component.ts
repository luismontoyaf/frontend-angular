import { Component, HostListener, signal } from '@angular/core';
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

  quantity: number = 1; // Cantidad inicial de productos a comprar
  
  isMenuOpen = false;
  content: boolean = false;
  showOptions: boolean = false;

  products: Product[] = [];

  addedProducts = signal<Product[]>([]);
  filteredProducts: Product[] = [];
  quantities: { [productId: string]: number } = {};

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

  @HostListener('document:click', ['$event'])
  onClickOutside(event: Event) {
    const targetElement = event.target as HTMLElement;

    // Si el clic ocurre fuera del input o la lista de opciones, oculta las opciones
    if (!targetElement.closest('.search-container')) {
      this.showOptions = false;
    }
  }

  // Método para filtrar productos por nombre
  filterProducts() {
    const term = this.searchTerm.toLowerCase();
    this.filteredProducts = this.products.filter(product => 
      product.nombreProducto.toLowerCase().includes(term)
    );
  }

  addToCart(product: Product) { // Mostrar las opciones de compra
    this.addedProducts.set([...this.addedProducts(), { ...product }]) // Agregar el producto al carrito 
  }

  removeFromCart(productId: number) { // Eliminar el producto del carrito
    this.addedProducts.set(this.addedProducts().filter(p => p.id !== productId)); // Eliminar el producto del carrito
  }


  trackByProduct(index: number, product: Product): string {
    return product.id.toString(); // Asegúrate de que cada producto tenga un `id` único
  }

  increaseQuantity(product: Product) {
    this.quantities[product.id] = (this.quantities[product.id] || 1) + 1;
  }
  

  decrementQuantity(product: Product) {
    this.quantities[product.id] = (this.quantities[product.id]) - 1;
  }
  
  // Simular la acción de comprar un producto
  buyProduct(product: any) {
    alert(`Has comprado: ${product.nombreProducto}`);
  }
}
