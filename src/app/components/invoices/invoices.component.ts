import { Component, HostListener, Output, signal } from '@angular/core';
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
  selector: 'app-invoices',
  imports: [MaterialModule, CommonModule, FormsModule],
  templateUrl: './invoices.component.html',
  styleUrl: './invoices.component.css'
})
export default class InvoicesComponent {
  @Output() userEmail: string = ''; // Email del usuario
    user: any; // Property to store user information
  
    quantity: number = 1; // Cantidad inicial de productos a comprar
    totalValue: number = 0; // Valor total de la compra
    totalIva: number = 0; // IVA total de la compra
    valueWithoutIva: number = 0; // Valor total sin IVA
    
    isMenuOpen = false;
    content: boolean = false;
    showOptions: boolean = false;
  
    invoices =  signal<any[]>([]);
  
    addedProducts = signal<Product[]>([]);
    filteredInvoices = signal<any[]>([]);
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
  
      this.invoiceService.getAllInvoicess().subscribe({
        next: (response: any) => {
          console.log('Productos obtenidos:', response);
          const invoicesParsed = response.map((inv: { jsonFactura: string; }) => ({
            ...inv,
            parsedFactura: JSON.parse(inv.jsonFactura)
          }));

          this.filteredInvoices.set(invoicesParsed);
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
      this.filteredInvoices.set( this.invoices().filter(invoice => 
        invoice.numeroFactura.toLowerCase().includes(term)
      ));
    }

  
    formatCurrency(value: number): string {
      return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(value);
    }
  
    downloadPDF(invoice: any) {
      console.log('invoice : ' + JSON.stringify(invoice));
      
    const formattedDate = new Date().toLocaleString('sv-SE').replace(' ', '_').replace(/:/g, '-');
    
    // this.invoiceService.generateInvoice({
    //     ClientDocument: invoice.,
    //     PaymentMethod: '',
    //     Items: ''//this.item0s
    //   }).subscribe((blob: Blob) => {
    //     const url = window.URL.createObjectURL(blob);
    //     const a = document.createElement('a');
    //     a.href = url;
    //     a.download = `FacturaVenta_${formattedDate}.pdf`;
    //     a.click();
    //   });
  }
  
    setMessage(message: string): void {
      this.messageService.setMessageSuccess(message);
    }
  
    setProccess(proccess: string): void {
      this.messageService.setProcess(proccess);
    }
  
    trackByProduct(index: number, invoices: any): string {
      return invoices.idFactura.toString(); // Asegúrate de que cada producto tenga un `id` único
    }
}
