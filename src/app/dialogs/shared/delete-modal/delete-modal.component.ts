import { Component, Inject, OnInit } from '@angular/core';
import { MessageService } from '../../services/message-service.service';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogRef,
} from '@angular/material/dialog';
import { ProductsService } from '../../../services/Products/products.service';
import { SuccessModalComponent } from '../success-modal/success-modal.component';
import { Product } from '../../../interfaces/product';
import { VariantsService } from '../../../services/Variants/variants.service';
import { DeleteModalData } from '../../../interfaces/delete-modal-data';

@Component({
  selector: 'app-delete-modal',
  imports: [],
  templateUrl: './delete-modal.component.html',
  styleUrl: './delete-modal.component.css',
})
export class DeleteModalComponent implements OnInit {
  message: string = ''; // Mensaje de error o éxito
  //data: Product [] = []; // Datos del producto (puedes definirlo más específicamente si lo deseas)

  constructor(
    private messageService: MessageService,
    private productsService: ProductsService,
    private variantService: VariantsService,
    private dialog: MatDialog,
    private dialogRef: MatDialogRef<DeleteModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DeleteModalData,
  ) {}

  messageModal: string = '';
  proccessKey: string = '';

  ngOnInit() {
    this.messageService.message$.subscribe((message) => {
      this.messageModal = message;
    });

    this.messageService.proccess$.subscribe((key) => {
      this.proccessKey = key;
    });
  }

  runProccess() {
    switch (this.proccessKey) {
      case 'deleteVariant':
        this.deleteVariant();
        break;
      default:
        this.deleteProduct();
    }
  }

  deleteProduct() {
    const cambios: Partial<Product> = {}; // Objeto para almacenar solo los cambios

    cambios.activo = 0;

    if (Object.keys(cambios).length === 0) {
      this.message = 'No se detectaron cambios.';
      return;
    }

    if (this.data.product) {
      this.productsService.removeProduct(this.data.product.id).subscribe(
        (response) => {
          this.message = 'El producto fue eliminado correctamente';
          this.setMessage(this.message);
          this.dialogRef.close(true);
          this.openSuccessDialog();
        },
        (error) => {
          console.error('Error:', error);
          this.message =
            'No se pudo editar el producto: ' + error.error.message;
        },
      );
    }
  }

  deleteVariant() {
    if (this.data.id) {
      this.variantService.deleteVariant(this.data.id).subscribe({
        next: (response: any) => {
          this.message = 'La variante fue eliminada correctamente';
          this.setMessage(this.message);
          this.dialogRef.close(true);
          this.openSuccessDialog();
        },
        error(err) {
          throw console.error('no se pudo eliminar la variante');
        },
      });
    }
  }

  openSuccessDialog(): void {
    this.dialog.open(SuccessModalComponent, {});
  }

  setMessage(message: string): void {
    this.messageService.setMessageSuccess(message);
  }

  closeModal() {
    this.dialogRef.close();
  }
}
