import { Component, Inject, OnInit } from '@angular/core';
import { MessageServiceService } from '../../services/message-service.service';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ProductsService } from '../../../services/Products/products.service';
import { SuccessModalComponent } from '../success-modal/success-modal.component';
import { Product } from '../../../interfaces/product';

@Component({
  selector: 'app-delete-modal',
  imports: [],
  templateUrl: './delete-modal.component.html',
  styleUrl: './delete-modal.component.css'
})
export class DeleteModalComponent implements OnInit {

  message: string = ''; // Mensaje de error o éxito
  //data: Product [] = []; // Datos del producto (puedes definirlo más específicamente si lo deseas)

constructor(private messageService: MessageServiceService, 
  private router: Router, 
  private productsService: ProductsService,
  private dialog: MatDialog,
  private dialogRef: MatDialogRef<DeleteModalComponent>,
  @Inject(MAT_DIALOG_DATA) public data: { product: Product }  ) {}
  messageModal: string = '';
  ngOnInit() {
    this.messageService.message$.subscribe((message) => {
      this.messageModal = message;
    });
  }

  deleteProduct() {
    const cambios: Partial<Product> = {}; // Objeto para almacenar solo los cambios

    cambios.activo = 0;

    if (Object.keys(cambios).length === 0) {
      this.message = 'No se detectaron cambios.';
      return;
    }
  
    // Enviar solo los cambios detectados en la solicitud PATCH
    this.productsService.editProduct(this.data.product.id, cambios).subscribe(
      (response) => {
        this.message = 'El producto fue eliminado correctamente';
        this.setMessage(this.message);
        this.dialogRef.close(true); // Cerrar diálogo y recargar datos en la vista principal
        this.openSuccessDialog(); // Abrir el diálogo de éxito
      },
      (error) => {
        console.error('Error:', error);
        this.message = 'No se pudo editar el producto: ' + error.error.message;
      }
    );
  }

  openSuccessDialog(): void {
      this.dialog.open(SuccessModalComponent, {
      });
    };

    setMessage(message: string): void {
      this.messageService.setMessageSuccess(message);
    }

  closeModal() {
    this.dialogRef.close();
  }
}
