import { Component, OnInit } from '@angular/core';
import { MaterialModule } from '../../../material.module'; 
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarService } from '../../services/Sidebar/sidebar.service';
import { MatDialogModule } from '@angular/material/dialog';
import { AddProductDialogComponent } from '../../dialogs/add-product-dialog/add-product-dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { ProductsService } from '../../services/Products/products.service';
import { MessageService } from '../../dialogs/services/message-service.service';
import { DeleteModalComponent } from '../../dialogs/shared/delete-modal/delete-modal.component';
import { Product} from '../../interfaces/product';
import { TitleService } from '../../shared/services/title.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-products',
  imports: [MaterialModule, CommonModule, FormsModule,MatDialogModule],
  templateUrl: './products.component.html',
  styleUrl: './products.component.css'
})
export default class ProductsComponent implements OnInit{
  isMenuOpen = false;
  content: boolean = false;

  products: Product[] = [];   
  filteredProducts: Product[] = []; 

  searchTerm: string = '';

constructor(private sidebarService: SidebarService, 
  private productsService: ProductsService,
  private messageService: MessageService,
  private dialog: MatDialog,
  private titleService: TitleService,
private router: Router) {
    // this.sidebarService.isOpen$.subscribe(open => {
    //   this.isMenuOpen = open;
    // });

    this.productsService.getProducts().subscribe({
      next: (response: Product[]) => {
        if (response && response.length > 0) {
          this.products = response;
          this.filteredProducts = response;
          this.content = false; 
        } else {
          this.content = true; 
        }
      },
      error: (err) => {
        console.error('Error al obtener productos:', err);
        this.content = true;
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

openAddProductComponent(): void{
  this.router.navigate(['/dashboard/add-products'])
}

openEditProductComponent(product: Product): void {
  
  this.router.navigate(['/dashboard/add-products', product.id]);

  // this.dialog.open(EditProductDialogComponent, {
  //   width: '400px',
  //   data: { product }
  // });
};

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
