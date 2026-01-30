import { Component, ElementRef, HostListener, OnInit, Output, signal, ViewChild } from '@angular/core';
import { MaterialModule } from '../../../material.module'; 
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarService } from '../../services/Sidebar/sidebar.service';
import { Product } from '../../interfaces/product';
import { MessageService } from '../../dialogs/services/message-service.service';
import { InvoiceService } from '../../services/Invoice/invoice.service';
import { Invoice } from '../../interfaces/invoice';
import { TitleService } from '../../shared/services/title.service';

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
    selectAllChecked = signal(false);

    quantities: { [productId: string]: number } = {};
  
    metodoSeleccionado: string = '';
    searchTerm: string = '';
    message: string = '';
    proccess: string = '';
    messageError: string = '';
  
    constructor(private sidebarService: SidebarService, 
      private messageService: MessageService,
      private invoiceService: InvoiceService,
      private titleService: TitleService
    ) {

    }

    ngOnInit(): void {
      this.invoiceService.getAllInvoicess().subscribe({
        next: (response: any) => {
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

      this.setTitle('Historico de Facturas');

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
        invoice.nombreCliente.toLowerCase().includes(term) ||
        invoice.fechaCreacion.toLowerCase().includes(term)
      ));
    }

  
    formatCurrency(value: number): string {
      return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(value);
    }
  
    downloadPDF(invoice: any) {
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
        })),
        sendEmail: false
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
    
    const current = this.selectedInvoices() ?? [];
    const index = current.findIndex(i => i.idFactura == invoice.idFactura);
      
    if (index > -1) {
      // Ya estaba, se elimina
      this.selectedInvoices.set(current.filter(i => i.idFactura !== invoice.idFactura));
    } else {
      // Se agrega
      this.selectedInvoices.set([...current, invoice]);
    }

    const allSelected = this.selectedInvoices().length == this.filteredInvoices().length;
    this.selectAllChecked.set(allSelected);
  }

  isSelected(invoice: any): boolean {
    return this.selectedInvoices().some(i => i.idFactura === invoice.idFactura);
  }

  selectAll(event: Event){

    const isChecked = (event.target as HTMLInputElement).checked;
    
    this.selectAllChecked.set(isChecked);

    if (isChecked) {
      this.selectedInvoices.set(this.filteredInvoices());
    }else{
      this.selectedInvoices.set([]);
    }
  }

  setMessage(message: string): void {
    this.messageService.setMessageSuccess(message);
  }
  
  setProccess(proccess: string): void {
    this.messageService.setProcess(proccess);
  }

  setTitle(title: string): void {
    this.titleService.setTitle(title);
  }
  
  trackByProduct(index: number, invoices: any): string {
    return invoices.idFactura.toString(); // Asegúrate de que cada producto tenga un `id` único
  }
}
