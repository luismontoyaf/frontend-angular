import { Component } from '@angular/core';
import { MaterialModule } from '../../../material.module'; 
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarService } from '../../services/Sidebar/sidebar.service';
import { ProductsService } from '../../services/Products/products.service';
import { GetInfoService } from '../../services/GetInfo/get-info.service';

interface Product {
  id: number;
  nombreProducto: string;
  descripcion: string;
  stock: number;
  precio: number;
  imagenBase64?: string; // Imagen como Base64 (cuando se obtiene)
  imagenFile?: File;     // Imagen como File (cuando se envía)
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
  user: any = null; // Variable para almacenar la información del usuario

  constructor(private sidebarService: SidebarService, private productsService: ProductsService, private getInfoService: GetInfoService) {
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
      product.nombreProducto.toLowerCase().includes(term)
    );
  }

  // Simular la acción de comprar un producto
  buyProduct(product: any) {
    alert(`Has comprado: ${product.nombreProducto}`);
  }
}
