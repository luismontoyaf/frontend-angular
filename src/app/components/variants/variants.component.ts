import { Component, HostListener, Output, signal } from '@angular/core';
import { MessageService } from '../../dialogs/services/message-service.service';
import { TitleService } from '../../shared/services/title.service';
import { MaterialModule } from '../../../material.module';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { VariantsService } from '../../services/Variants/variants.service';
import { Variants } from '../../interfaces/variants';
import { SuccessModalComponent } from '../../dialogs/shared/success-modal/success-modal.component';
import { MatDialog } from '@angular/material/dialog';
import { DeleteModalComponent } from '../../dialogs/shared/delete-modal/delete-modal.component';

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
  showOptions: boolean = false;

  variants = signal<Variants[]>([]);
  addedVariants = signal<Variants[]>([]);
  filteredVariants = signal<Variants[]>([]);
  selectedVariant = signal<Variants[]>([]);
  selectAllChecked = signal(false);

  searchTerm: string = '';
  message: string = '';
  proccess: string = '';
  messageError: string = '';

  constructor(
    private messageService: MessageService,
    private variantService: VariantsService,
    private titleService: TitleService,
    private dialog: MatDialog,
  ) {}

  ngOnInit(): void {
    this.variantService.getVariants().subscribe({
      next: (response: Variants) => {
        const variantsParsed = Array.isArray(response) ? response : [response];

        this.variants.set(variantsParsed);
        this.filteredVariants.set(variantsParsed);
      },
      error: (err) => {
        console.error('Error al obtener variantes:', err);
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
      this.variants().filter((variant) =>
        variant.name.toLowerCase().includes(term),
      ),
    );
  }

  getAtributesText(atributes: { value: string }[]): string {
    if (!atributes) return '';

    const parsed =
      typeof atributes === 'string' ? JSON.parse(atributes) : atributes;

    return parsed.map((a: any) => a.Value).join(', ');
  }

  editVariant(id: number) {}

  changeStatusVariant(id: number) {
    this.variantService.changeStatusVariant(id).subscribe({
      next: (response: any) => {
        this.handleSuccess('update');
      },
      error(err) {
        throw console.error('no se pudo cambiar estado de la variante');
      },
    });
  }

  deleteVariant(id: number) {
    this.messageService.setDeleteMessage('¿Está seguro de que desea eliminar la variante?');
    this.messageService.setProcess('deleteVariant');
    this.dialog.open(DeleteModalComponent, {
      data: { id },
    });
  }

  handleSuccess(flag: string) {
    this.message =
      flag == 'update'
        ? 'El estado de la variante ha sido modificado exitosamente'
        : 'La variante se ha eliminado correctamente.';
    this.setMessage(this.message);
    this.setProccess('');
    this.openSuccessDialog();
  }

  openSuccessDialog(): void {
    this.dialog.open(SuccessModalComponent, {});
  }

  openDeleteProductDialog(product: any) {
    this.messageService.setDeleteMessage(
      '¿Está seguro de que desea eliminar el producto?',
    );
    this.dialog.open(DeleteModalComponent, {
      data: { product },
    });
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
    return invoices.idFactura.toString();
  }
}
