import { Component } from '@angular/core';
import { MaterialModule } from '../../../material.module'; 
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarService } from '../../services/Sidebar/sidebar.service';
import { ProductsService } from '../../services/Products/products.service';

interface Product {
  name: string;
  description: string;
  stock: number;
  price: number;
  image: File;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [MaterialModule, CommonModule, FormsModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export default class HomeComponent {
  isMenuOpen = false;
  content: boolean = false;
  products: Product[] = [];
  filteredProducts: Product[] = [];

  searchTerm: string = '';

  constructor(private sidebarService: SidebarService, private productsService: ProductsService) {
    this.sidebarService.isOpen$.subscribe(open => {
      this.isMenuOpen = open;
    });

    this.productsService.getProducts().subscribe(
      (response: Product[]) => { 
        this.products = response;
        this.filteredProducts = response;
      }
    );
  }
  // Lista de productos simulada
  // products = [
  //   {
  //     name: 'Producto 1',
  //     description: 'Descripción corta del producto 1',
  //     price: 100,
  //     image: 'https://via.placeholder.com/150'
  //   },
  //   {
  //     name: 'Producto 2',
  //     description: 'Descripción corta del producto 2',
  //     price: 200,
  //     image: 'https://via.placeholder.com/150'
  //   },
  //   {
  //     name: 'Producto 3',
  //     description: 'Descripción corta del producto 3',
  //     price: 300,
  //     image: 'https://via.placeholder.com/150'
  //   },
  //   {
  //     name: 'Producto 4',
  //     description: 'Descripción corta del producto 3',
  //     price: 300,
  //     image: 'https://via.placeholder.com/150'
  //   },
  //   {
  //     name: 'Producto 2',
  //     description: 'Descripción corta del producto 2',
  //     price: 200,
  //     image: 'https://via.placeholder.com/150'
  //   },
  //   {
  //     name: 'Producto 3',
  //     description: 'Descripción corta del producto 3',
  //     price: 300,
  //     image: 'https://via.placeholder.com/150'
  //   },
  //   {
  //     name: 'Producto 4',
  //     description: 'Descripción corta del producto 3',
  //     price: 300,
  //     image: 'https://via.placeholder.com/150'
  //   }
  // ];

  // Método para filtrar productos por nombre
  filterProducts() {
    const term = this.searchTerm.toLowerCase();
    this.filteredProducts = this.products.filter(product => 
      product.name.toLowerCase().includes(term)
    );
  }

  // Simular la acción de comprar un producto
  buyProduct(product: any) {
    alert(`Has comprado: ${product.name}`);
  }
}
