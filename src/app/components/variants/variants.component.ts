import { Component, HostListener, Output, signal } from '@angular/core';
import { SidebarService } from '../../services/Sidebar/sidebar.service';
import { MessageService } from '../../dialogs/services/message-service.service';
import { InvoiceService } from '../../services/Invoice/invoice.service';
import { TitleService } from '../../shared/services/title.service';
import { Invoice } from '../../interfaces/invoice';
import { Product } from '../../interfaces/product';
import { MaterialModule } from '../../../material.module';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-variants',
  imports: [MaterialModule, CommonModule, FormsModule, RouterLink],
  templateUrl: './variants.component.html',
  styleUrl: './variants.component.css',
})
export default class VariantsComponent {
  @Output() userEmail: string = ''; // Email del usuario
  user: any; // Property to store user information

  isMenuOpen = false;
  content: boolean = false;
  showOptions: boolean = false;

  variants = signal<Invoice[]>([]);
  addedVariants = signal<Product[]>([]);
  filteredVariants = signal<any[]>([]);
  selectedVariants = signal<any[]>([]);
  selectAllChecked = signal(false);

  searchTerm: string = '';
  message: string = '';
  proccess: string = '';
  messageError: string = '';

  constructor(
    private sidebarService: SidebarService,
    private messageService: MessageService,
    private invoiceService: InvoiceService,
    private titleService: TitleService
  ) {}

  ngOnInit(): void {
    this.invoiceService.getAllInvoicess().subscribe({
      next: (response: any) => {
        const invoicesParsed = response
          .map((inv: { jsonFactura: string }) => ({
            ...inv,
            parsedFactura: JSON.parse(inv.jsonFactura),
          }))
          .sort(
            (
              a: { fechaCreacion: string | number | Date },
              b: { fechaCreacion: string | number | Date }
            ) =>
              new Date(b.fechaCreacion).getTime() -
              new Date(a.fechaCreacion).getTime()
          );

        this.variants.set(invoicesParsed);
        this.filteredVariants.set(invoicesParsed);
      },
      error: (err) => {
        console.error('Error al obtener variantes:', err);
        this.content = true; // Mostrar mensaje de "No hay productos"
      },
    });

    this.setTitle('Administrar Variantes');
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
  filterVariants() {
    const term = this.searchTerm.toLowerCase();
    this.filteredVariants.set(
      this.variants().filter(
        (variant) =>
          variant.numeroFactura.toLowerCase().includes(term) ||
          variant.nombreCliente.toLowerCase().includes(term) ||
          variant.fechaCreacion.toLowerCase().includes(term)
      )
    );
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
