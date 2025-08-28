import { Component, OnInit, Signal, signal } from '@angular/core';
import { MaterialModule } from '../../../material.module'; 
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarService } from '../../services/Sidebar/sidebar.service';
import { ProductsService } from '../../services/Products/products.service';
import { GetInfoService } from '../../services/GetInfo/get-info.service';
import { Product } from '../../interfaces/product'; // Asegúrate de que la ruta sea correcta
import { TitleService } from '../../shared/services/title.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [MaterialModule, CommonModule, FormsModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export default class HomeComponent implements OnInit{
  isMenuOpen = false;
  content: boolean = false;
  fechaDiaActual = signal<Date>(new Date());

  noStockProducts = signal<Product[]>([]);
  products: Product[] = [];
  filteredProducts: Product[] = [];

  searchTerm: string = '';
  user: any = null; // Variable para almacenar la información del usuario

  constructor(private sidebarService: SidebarService, 
    private productsService: ProductsService, 
    private getInfoService: GetInfoService,
    private titleService: TitleService) {
    this.sidebarService.isOpen$.subscribe(open => {
      this.isMenuOpen = open;
    });

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

  ngOnInit(): void {
    this.setTitle('Página Principal');

    this.getNonStockProducts();
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

  getNonStockProducts() {
    this.productsService.getProducts().subscribe({
      next: (response) => {
        const noStock = response//.filter((f: Product) => f.stock === 0);
        this.noStockProducts.set(noStock);
      },
      error(err) {
        console.log('No se pudieron obtener los productos');
      },
    })
  }

  setTitle(title: string): void {
    this.titleService.setTitle(title);
  }
}
