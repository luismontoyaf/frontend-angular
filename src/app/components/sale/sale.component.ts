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
import { MessageService } from '../../dialogs/services/message-service.service';
import { TitleService } from '../../shared/services/title.service';
import { AlertService } from '../../services/Alert/alert.service';

@Component({
  selector: 'app-sale',
  imports: [MaterialModule, CommonModule, FormsModule],
  templateUrl: './sale.component.html',
  styleUrl: './sale.component.css'
})
export default class SaleComponent implements OnInit{

  @Output() userEmail: string = ''; // Email del usuario
  user: any; // Property to store user information

  quantity: number = 1; // Cantidad inicial de productos a comprar
  totalValue: number = 0; // Valor total de la compra
  originalValue: number = 0; // Valor original de la compra
  totalIva: number = 0; // IVA total de la compra
  valueWithoutIva: number = 0; // Valor total sin IVA
  discount: number =0;
  
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
  finalCustomerDocument: string = '';

  constructor(private sidebarService: SidebarService, 
    private productsService: ProductsService,
    private getInfoService: GetInfoService,
    private messageService: MessageService,
    private alertService: AlertService,
    private dialog: MatDialog,
    private titleService: TitleService
  ) {
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

  async ngOnInit(){
    this.setTitle('Facturación de Productos');

    await this.GetParameters();

    setTimeout(() => {
      this.searchUser(this.finalCustomerDocument);
    }, 300);
  }

  async GetParameters(){
    await this.getInfoService.getParameter('DOCUMENT_NUMBER_FINAL_CUSTOMER').subscribe((res) => {
      this.finalCustomerDocument = res;
    })
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

  addToCart(product: Product) { 
    const productosActuales = this.addedProducts();

    const yaExiste = productosActuales.some(p => p.id === product.id);
    if (yaExiste) {
      this.alertService.showWarning('No se puede agregar este producto. Ya se encuentra en el carrito.');
      return;
    }

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
    this.originalValue = this.totalValue;

    if (this.discount != 0) {
      this.calculateWithDiscount(this.discount)
    }

    // this.totalIva = totalValue * 0.19; // Calcular el IVA total de la compra
    // this.valueWithoutIva = totalValue / 1.19; // Calcular el valor total sin IVA
  }

  calculateWithDiscount(discount: number) {
    // Calcular el porcentaje
  const discountFactor = discount / 100;

  // Aplicar el descuento al valor original
  const discountAmount = this.originalValue * discountFactor;
  const finalValue = this.originalValue - discountAmount;

  this.totalValue = finalValue;
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

  updateQuantity(product: Product){
  // Si no hay cantidad, la dejamos en 1 por seguridad
    const newQuantity = this.quantities[product.id] || 1;

    // Actualiza el total del producto
    this.totalValue = product.precio * newQuantity;

    // Recalcula totales generales
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

    this.message = '¿Estas seguro de confirmar esta venta?';
      this.setMessage(this.message);
      this.setProccess('openSuccesSaleDialog'); 
      this.dialog.open(SuccessEditModalComponent, {
        data: {
          userEmail: this.userEmail,
          idClient: this.user.id,
          clientDocument: this.user.numDocumento,
          PaymentMethod: this.metodoSeleccionado,
          items: this.addedProducts().map(product => ({
            Id: product.id,
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

  setTitle(title: string): void {
    this.titleService.setTitle(title);
  }
  
}
