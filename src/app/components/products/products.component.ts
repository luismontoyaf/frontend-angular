import { Component, OnInit } from '@angular/core';
import { MaterialModule } from '../../../material.module'; 
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarService } from '../../services/Sidebar/sidebar.service';
import { MatDialogModule } from '@angular/material/dialog';
import { AddProductDialogComponent } from '../../dialogs/add-product-dialog/add-product-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { ProductsService } from '../../services/Products/products.service';
import { EditProductDialogComponent } from '../../dialogs/edit-product-dialog/edit-product-dialog.component';
import { MessageServiceService } from '../../dialogs/services/message-service.service';
import { DeleteModalComponent } from '../../dialogs/shared/delete-modal/delete-modal.component';
import { Product } from '../../interfaces/product';
import { TitleService } from '../../shared/services/title.service';

@Component({
  selector: 'app-products',
  imports: [MaterialModule, CommonModule, FormsModule,MatDialogModule],
  templateUrl: './products.component.html',
  styleUrl: './products.component.css'
})
export default class ProductsComponent implements OnInit{
  isMenuOpen = false;
  content: boolean = false;

  products: Product[] = []; // Cambiado a any[] para evitar errores de tipo
  filteredProducts: Product[] = []; // Cambiado a any[] para evitar errores de tipo

  searchTerm: string = '';

constructor(private sidebarService: SidebarService, 
  private productsService: ProductsService,
  private messageService: MessageServiceService,
  private dialog: MatDialog,
  private titleService: TitleService) {
    // this.sidebarService.isOpen$.subscribe(open => {
    //   this.isMenuOpen = open;
    // });

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
  this.setTitle('Agrega Tus Productos');
}

openAddProductDialog(): void {
  this.dialog.open(AddProductDialogComponent, {
    width: '400px'
  });
};

openEditProductDialog(product: Product): void {
  this.dialog.open(EditProductDialogComponent, {
    width: '400px',
    data: { product }
  });
};

  // toggleMenu() {
  //   this.isMenuOpen = !this.isMenuOpen;
  // }

  // Método para filtrar productos por nombre
  filterProducts() {
    const term = this.searchTerm.toLowerCase();
    this.filteredProducts = this.products.filter(product => 
      product.nombreProducto.toLowerCase().includes(term)
    );
  }

  openDeleteProductDialog(product: any) {
    this.messageService.setDeleteMessage('¿Está seguro de que desea eliminar el producto?');
    this.dialog.open(DeleteModalComponent, {
      data: { product },
    });
  }

  setTitle(title: string): void {
    this.titleService.setTitle(title);
  }
}
