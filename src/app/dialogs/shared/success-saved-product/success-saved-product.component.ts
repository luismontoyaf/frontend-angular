import { Component, OnInit } from '@angular/core';
import { MessageService } from '../../services/message-service.service';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { DeleteModalComponent } from '../delete-modal/delete-modal.component';
import { AddProductDialogComponent } from '../../add-product-dialog/add-product-dialog.component';
import { AddClientDialogComponent } from '../../add-client-dialog/add-client-dialog.component';
import { SaleService } from '../../../services/Sale/sale.service';
import { LoaderComponent } from '../../../shared/loader/loader.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-success-saved-product',
  imports: [CommonModule, LoaderComponent],
  templateUrl: './success-saved-product.component.html',
  styleUrl: './success-saved-product.component.css'
})
export class SuccessSavedProductComponent implements OnInit{
  message: string = ''; // Mensaje de error o éxito
  
  isLoading: boolean = false; // Estado de carga
  
  constructor(private messageService: MessageService, 
    private router: Router, 
    private saleService: SaleService,
    private dialog: MatDialog,
    private dialogRef: MatDialogRef<DeleteModalComponent>) {
    }
    messageModal: string = '';
    proccessKey: string = ''; 
    proccessModal!: () => void;
  
    ngOnInit() {
      this.messageService.message$.subscribe((message) => {
        this.messageModal = message;
      });
  
      this.messageService.proccess$.subscribe((key) => {
        this.proccessKey = key;
      });
    }

    openAddProductDialog(): void {
      this.dialogRef.close();
      this.dialog.open(AddProductDialogComponent, {
        width: '400px'
      });
    };
      
  
    addNewProduct(): void {
        const currentUrl = this.router.url;
  
        this.dialogRef.close();
        this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
          this.router.navigate([currentUrl]);
        });
      };
  
    closeModal() {
      const currentUrl = this.router.url;
  
      this.dialogRef.close();
      this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
        this.router.navigate(['/dashboard/products']);
      });
    }
}
