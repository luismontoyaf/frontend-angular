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
import { Invoice } from '../../interfaces/invoice';

@Component({
  selector: 'app-invoices',
  imports: [MaterialModule, CommonModule, FormsModule],
  templateUrl: './invoices.component.html',
  styleUrl: './invoices.component.css'
})
export default class InvoicesComponent implements OnInit{
  @Output() userEmail: string = ''; // Email del usuario
    user: any; // Property to store user information
  
    quantity: number = 1; // Cantidad inicial de productos a comprar
    totalValue: number = 0; // Valor total de la compra
    totalIva: number = 0; // IVA total de la compra
    valueWithoutIva: number = 0; // Valor total sin IVA
    
    isMenuOpen = false;
    content: boolean = false;
    showOptions: boolean = false;
  
    invoices =  signal<Invoice[]>([]);
  
    addedProducts = signal<Product[]>([]);
    filteredInvoices = signal<any[]>([]);
    selectedInvoices = signal<any[]>([]);
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

    }

    ngOnInit(): void {
      this.invoiceService.getAllInvoicess().subscribe({
        next: (response: any) => {
          console.log('Productos obtenidos:', response);
          const invoicesParsed = response.map((inv: { jsonFactura: string; }) => ({
            ...inv,
            parsedFactura: JSON.parse(inv.jsonFactura)
          }))
          .sort((a: { fechaCreacion: string | number | Date; }, b: { fechaCreacion: string | number | Date; }) => new Date(b.fechaCreacion).getTime() - new Date(a.fechaCreacion).getTime());

          this.invoices.set(invoicesParsed);
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
        invoice.numeroFactura.toLowerCase().includes(term) ||
        invoice.nombreCliente.toLowerCase().includes(term)
      ));
    }

  
    formatCurrency(value: number): string {
      return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(value);
    }
  
    downloadPDF(invoice: any) {
      console.log('invoice : ' + JSON.stringify(invoice));

    const parsedFactura = JSON.parse(invoice.jsonFactura);
      
    const formattedDate = invoice.fechaCreacion.toLocaleString('sv-SE').replace(' ', '_').replace(/:/g, '-');
    
    this.invoiceService.generateInvoice({
        numInvoice: invoice.numeroFactura,
        idClient: invoice.idCliente,
        PaymentMethod: invoice.formaPago,
        items: parsedFactura.Productos.map((producto: any) => ({
          ProductName: producto.Nombre,
          Quantity: producto.Cantidad,
          UnitPrice: producto.ValorUnitario
        }))
      }).subscribe((blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `FacturaVenta_${formattedDate}.pdf`;
        a.click();
      });
  }

    downloadSelectedPDFs() {
    const selected = this.selectedInvoices();
  if (!selected.length) return;

  const invoiceRequests = selected.map(invoice => {
    const parsedFactura = JSON.parse(invoice.jsonFactura);
    return {
      numInvoice: invoice.numeroFactura,
      idClient: invoice.idCliente,
      PaymentMethod: invoice.formaPago,
      items: parsedFactura.Productos.map((producto: any) => ({
        ProductName: producto.Nombre,
        Quantity: producto.Cantidad,
        UnitPrice: producto.ValorUnitario
      }))
    };
  });

  this.invoiceService.generateMultipleInvoices(invoiceRequests).subscribe((zipBlob: Blob) => {
    const url = window.URL.createObjectURL(zipBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'FacturasSeleccionadas.zip';
    a.click();
  });
  }
  
  toggleSelection(invoice: any) {
    console.log('invoice ' + JSON.stringify(invoice));
    
  const current = this.selectedInvoices() ?? [];
  const index = current.findIndex(i => i.idFactura == invoice.idFactura);
    console.log('index ' + index);
    
  if (index > -1) {
    // Ya estaba, se elimina
    this.selectedInvoices.set(current.filter(i => i.idFactura !== invoice.idFactura));
  } else {
    // Se agrega
    this.selectedInvoices.set([...current, invoice]);
  }

  console.log('this.selectedInvoices ' + JSON.stringify(this.selectedInvoices()));
  
}

isSelected(invoice: any): boolean {
  return this.selectedInvoices().some(i => i.idFactura === invoice.idFactura);
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
