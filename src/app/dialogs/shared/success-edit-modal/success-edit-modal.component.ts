import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MessageService } from '../../services/message-service.service';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ProductsService } from '../../../services/Products/products.service';
import { DeleteModalComponent } from '../delete-modal/delete-modal.component';
import { AddProductDialogComponent } from '../../add-product-dialog/add-product-dialog.component';
import { AddClientDialogComponent } from '../../add-client-dialog/add-client-dialog.component';
import { SuccessSaleModalComponent } from '../success-sale-modal/success-sale-modal.component';
import { SaleService } from '../../../services/Sale/sale.service';
import { LoaderComponent } from '../../../shared/loader/loader.component';

@Component({
  selector: 'app-success-edit-modal',
  imports: [CommonModule, LoaderComponent],
  templateUrl: './success-edit-modal.component.html',
  styleUrl: './success-edit-modal.component.css'
})
export class SuccessEditModalComponent implements OnInit {
message: string = ''; // Mensaje de error o éxito
userEmail: string = ''; // Email del usuario
clientName: string = ''; // Nombre del cliente
clientEmail: string = ''; // Email del cliente
clientPhone: string = ''; // Teléfono del cliente
clientTypeDocument: string = ''; // Tipo de documento del cliente
clientDocument: string = ''; // Número de documento del cliente
idClient: string = ''; // id del cliente
PaymentMethod: string = ''; // Método de pago
items: any[] = []; // Productos añadidos a la venta

isLoading: boolean = false; // Estado de carga

constructor(private messageService: MessageService, 
  private router: Router, 
  private productsService: ProductsService,
  private saleService: SaleService,
  private dialog: MatDialog,
  private dialogRef: MatDialogRef<DeleteModalComponent>,
  @Inject(MAT_DIALOG_DATA) public data: any,  ) {
    this.userEmail = data?.userEmail;
    this.idClient = data?.idClient;
    this.PaymentMethod = data?.PaymentMethod;
    this.items = data?.items;
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

    openSuccesSaleDialog(): void {
      this.isLoading = true;
      this.saleService.saveSale({
        idClient: this.idClient,
        PaymentMethod: this.PaymentMethod,
        items: this.items
      }).subscribe((response) => {
        this.isLoading = false;
        this.dialogRef.close();

        this.dialog.open(SuccessSaleModalComponent, {
          width: '600px',
          data: {
            idClient: this.idClient
            ,userEmail: this.userEmail
            , clientName: this.clientName
            , clientEmail: this.clientEmail
            , clientPhone: this.clientPhone
            , clientTypeDocument: this.clientTypeDocument
            , clientDocument: this.clientDocument
            , PaymentMethod: this.PaymentMethod
            , items: this.items
          }
        });
      }, (error) => {
        this.isLoading = false;
        alert('Error al generar la factura. Por favor, inténtelo de nuevo.');
        console.error('Error al generar la factura:', error);
      });
    };
    
    runProccess() {
      switch (this.proccessKey) {
        case 'openAddClientDialog':
          this.openAddClientDialog();
          break;
        case 'openAddProductDialog':
          this.openAddProductDialog();
          break;
        case 'openSuccesSaleDialog':
          this.openSuccesSaleDialog();
          break;
        default:
          console.warn('No se reconoció el proceso');
      }
    }

    openAddClientDialog(): void {
      this.dialogRef.close();
      this.dialog.open(AddClientDialogComponent, {
        // width: '750px'
      });
    };

  closeModal() {
    const currentUrl = this.router.url;

    this.dialogRef.close();
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate([currentUrl]); // Recarga la vista actual
    });
  }
}
