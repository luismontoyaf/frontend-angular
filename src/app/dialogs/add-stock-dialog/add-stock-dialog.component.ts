import { CommonModule } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { Product } from '../../interfaces/product';
import { ProductsService } from '../../services/Products/products.service';
import { MessageService } from '../services/message-service.service';
import { SuccessModalComponent } from '../shared/success-modal/success-modal.component';

@Component({
  selector: 'app-add-stock-dialog',
  standalone: true,
  imports: [CommonModule, FormsModule, MatDialogModule],
  templateUrl: './add-stock-dialog.component.html',
  styleUrl: './add-stock-dialog.component.css'
})
export class AddStockDialogComponent {
  quantity = 1;
  isSaving = false;
  errorMessage = '';

  messageSuccess = '';
  messageError = '';
  message = '';

  constructor(
    @Inject(MAT_DIALOG_DATA) public product: Product,
    private dialogRef: MatDialogRef<AddStockDialogComponent>,
    private productsService: ProductsService,
    private messageService: MessageService,
    private dialog: MatDialog,
  ) {}

  save(): void {
    if (!Number.isInteger(this.quantity) || this.quantity < 1 || this.isSaving) {
      return;
    }

    this.isSaving = true;
    this.errorMessage = '';

    this.productsService.updateStock(this.product.id, this.quantity).subscribe({
      next: () => {this.dialogRef.close(this.quantity),
      this.dialogRef.close();
        this.messageSuccess = 'Stock actualizado correctamente';
        this.message = 'El stock del producto fue actualizado correctamente';
        this.setMessage(this.message);
        this.openSuccesModal();
      },
      error: () => {
        this.isSaving = false;
        this.errorMessage = 'No se pudo actualizar el stock. Inténtalo de nuevo.';
      }
    });
  }

  openSuccesModal(): void {
      this.dialog.open(SuccessModalComponent, {
        width: '400px',
      });
    }
  
    setMessage(message: string): void {
      this.messageService.setMessageSuccess(message);
    }
}