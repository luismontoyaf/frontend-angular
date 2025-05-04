import { Component, HostListener, OnInit, Output, signal } from '@angular/core';
import { MaterialModule } from '../../../material.module'; 
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarService } from '../../services/Sidebar/sidebar.service';
import { ProductsService } from '../../services/Products/products.service';
import { Product } from '../../interfaces/product';
import { GetInfoService } from '../../services/GetInfo/get-info.service';
import { SuccessEditModalComponent } from '../../dialogs/shared/success-edit-modal/success-edit-modal.component';
import { MatDialog } from '@angular/material/dialog';
import { MessageServiceService } from '../../dialogs/services/message-service.service';
import { InvoiceService } from '../../services/Invoice/invoice.service';

@Component({
  selector: 'app-sale',
  imports: [MaterialModule, CommonModule, FormsModule],
  templateUrl: './sale.component.html',
  styleUrl: './sale.component.css'
})
export default class SaleComponent{

  @Output() userEmail: string = ''; // Email del usuario
  user: any; // Property to store user information

  quantity: number = 1; // Cantidad inicial de productos a comprar
  totalValue: number = 0; // Valor total de la compra
  totalIva: number = 0; // IVA total de la compra
  valueWithoutIva: number = 0; // Valor total sin IVA
  
  isMenuOpen = false;
  content: boolean = false;
  showOptions: boolean = false;

  products: Product[] = [];

  addedProducts = signal<Product[]>([]);
  filteredProducts: Product[] = [];
  quantities: { [productId: string]: number } = {};

  metodoSeleccionado: string = '';
  searchTerm: string = '';
  message: string = '';
  proccess: string = '';
  messageError: string = '';

  constructor(private sidebarService: SidebarService, 
    private productsService: ProductsService,
    private getInfoService: GetInfoService,
    private messageService: MessageServiceService,
    private invoiceService: InvoiceService,
    private dialog: MatDialog,
  ) {
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
    this.addedProducts.set([...this.addedProducts(), { ...product }]); // Agregar el producto al carrito 

    this.quantities[product.id] = (this.quantities[product.id] || 1); // Inicializar la cantidad del producto en el carrito
    
    this.recalculateCartTotals();
  }

  recalculateCartTotals() {
    let total = 0;
  
    this.addedProducts().forEach((p) => {
      total += p.precio * (this.quantities[p.id] || 1);
    });
  
    this.totalValue = total;
    this.calculateValues(total);
  }

  calculateValues(totalValue: number) {
    this.totalValue = totalValue; // Actualizar el valor total
    this.totalIva = totalValue * 0.19; // Calcular el IVA total de la compra
    this.valueWithoutIva = totalValue / 1.19; // Calcular el valor total sin IVA
  }

  increaseQuantity(product: Product) {
    this.quantities[product.id] = (this.quantities[product.id] || 1) + 1;
    
    this.totalValue = product.precio * this.quantities[product.id]; // Aumentar el valor total al agregar un producto

    this.recalculateCartTotals();
  }
  
  decrementQuantity(product: Product) {
    this.quantities[product.id] = (this.quantities[product.id]) - 1;

    this.totalValue = product.precio * this.quantities[product.id]; // Aumentar el valor total al agregar un producto

    this.recalculateCartTotals();
  }

  formatCurrency(value: number): string {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(value);
  }

  removeFromCart(productId: number) { // Eliminar el producto del carrito
    this.addedProducts.set(this.addedProducts().filter(p => p.id !== productId)); // Eliminar el producto del carrito
    this.recalculateCartTotals();
  }

  searchUser(cedula: string) {
    this.getInfoService.getUserInfoByDocument(cedula).subscribe(user => {
      this.user = user; 
      this.userEmail = this.user.correo;
      console.log("Usuario:", this.user);
    }
    , error => {
      this.message = 'El cliente no existe en la base de datos. ¿Desea registrarlo?';
      this.setMessage(this.message);
      this.setProccess('openAddClientDialog'); 
      this.dialog.open(SuccessEditModalComponent, {
       });     
    });
  }

  saveSale() {
    if (this.addedProducts().length === 0) {
      this.messageError = 'Debe agregar al menos un producto.';
      return;
    }

    if (!this.user) {
      this.messageError = 'Debe buscar un cliente antes de continuar.';
      return;
      
    }

    if (!this.metodoSeleccionado) {
      this.messageError = 'Debe seleccionar un método de pago.';
      return;
    }

    this.message = '¿Estas seguro de finalizar esta venta?';
      this.setMessage(this.message);
      this.setProccess('openSuccesSaleDialog'); 
      
      
      this.dialog.open(SuccessEditModalComponent, {
        data: {
          userEmail: this.userEmail,
          clientName: this.user.nombre + ' ' + this.user.apellidos,
          clientEmail: this.user.correo,
          clientPhone: this.user.celular,
          ClientTypeDocument: this.user.tipoDocumento,
          clientDocument: this.user.numDocumento,
          PaymentMethod: this.metodoSeleccionado,
          items: this.addedProducts().map(product => ({
            ProductName: product.nombreProducto,
            Quantity: this.quantities[product.id] || 1,
            UnitPrice: product.precio,
          }))
        }
    }); 
  }

  setMessage(message: string): void {
    this.messageService.setMessageSuccess(message);
  }

  setProccess(proccess: string): void {
    this.messageService.setProcess(proccess);
  }

  trackByProduct(index: number, product: Product): string {
    return product.id.toString(); // Asegúrate de que cada producto tenga un `id` único
  }
  
}
