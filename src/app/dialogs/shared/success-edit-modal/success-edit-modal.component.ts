import { Component, Inject, OnInit } from '@angular/core';
import { MessageServiceService } from '../../services/message-service.service';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ProductsService } from '../../../services/Products/products.service';
import { DeleteModalComponent } from '../delete-modal/delete-modal.component';
import { AddProductDialogComponent } from '../../add-product-dialog/add-product-dialog.component';

@Component({
  selector: 'app-success-edit-modal',
  imports: [],
  templateUrl: './success-edit-modal.component.html',
  styleUrl: './success-edit-modal.component.css'
})
export class SuccessEditModalComponent implements OnInit {
message: string = ''; // Mensaje de error o éxito
  //data: Product [] = []; // Datos del producto (puedes definirlo más específicamente si lo deseas)

constructor(private messageService: MessageServiceService, 
  private router: Router, 
  private productsService: ProductsService,
  private dialog: MatDialog,
  private dialogRef: MatDialogRef<DeleteModalComponent>  ) {}
  messageModal: string = '';
  ngOnInit() {
    this.messageService.message$.subscribe((message) => {
      this.messageModal = message;
    });
  }

  openAddProductDialog(): void {
      this.dialogRef.close();
      this.dialog.open(AddProductDialogComponent, {
        width: '400px'
      });
    };

  closeModal() {
    this.dialogRef.close();
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate(['/dashboard/products']); // Recarga la vista actual
    });
  }
}
