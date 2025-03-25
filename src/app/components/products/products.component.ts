import { Component } from '@angular/core';
import { MaterialModule } from '../../../material.module'; 
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarService } from '../../services/Sidebar/sidebar.service';
import { MatDialogModule } from '@angular/material/dialog';
import { AddProductDialogComponent } from '../../dialogs/add-product-dialog/add-product-dialog.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-products',
  imports: [MaterialModule, CommonModule, FormsModule,MatDialogModule],
  templateUrl: './products.component.html',
  styleUrl: './products.component.css'
})
export default class ProductsComponent {
  isMenuOpen = false;
  content: boolean = false;

  searchTerm: string = '';

constructor(private sidebarService: SidebarService, private dialog: MatDialog) {
    this.sidebarService.isOpen$.subscribe(open => {
      this.isMenuOpen = open;
    });
}

openAddProductDialog(): void {
  this.dialog.open(AddProductDialogComponent, {
    width: '400px'
  });
};


  // Lista de productos simulada
  products = [
    {
      name: 'Producto 1',
      description: 'Descripción corta del producto 1',
      price: 100,
      image: 'https://via.placeholder.com/150'
    },
    {
      name: 'Producto 2',
      description: 'Descripción corta del producto 2',
      price: 200,
      image: 'https://via.placeholder.com/150'
    },
    {
      name: 'Producto 3',
      description: 'Descripción corta del producto 3',
      price: 300,
      image: 'https://via.placeholder.com/150'
    }
  ];

  filteredProducts = [...this.products];

  // toggleMenu() {
  //   this.isMenuOpen = !this.isMenuOpen;
  // }

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
