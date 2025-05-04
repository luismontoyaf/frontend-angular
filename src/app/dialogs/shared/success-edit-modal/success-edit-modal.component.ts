import { Component, Inject, OnInit } from '@angular/core';
import { MessageServiceService } from '../../services/message-service.service';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { ProductsService } from '../../../services/Products/products.service';
import { DeleteModalComponent } from '../delete-modal/delete-modal.component';
import { AddProductDialogComponent } from '../../add-product-dialog/add-product-dialog.component';
import { AddClientDialogComponent } from '../../add-client-dialog/add-client-dialog.component';
import { SuccessSaleModalComponent } from '../success-sale-modal/success-sale-modal.component';

@Component({
  selector: 'app-success-edit-modal',
  imports: [],
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
PaymentMethod: string = ''; // Método de pago
items: any[] = []; // Productos añadidos a la venta
  //data: Product [] = []; // Datos del producto (puedes definirlo más específicamente si lo deseas)

constructor(private messageService: MessageServiceService, 
  private router: Router, 
  private productsService: ProductsService,
  private dialog: MatDialog,
  private dialogRef: MatDialogRef<DeleteModalComponent>,
  @Inject(MAT_DIALOG_DATA) public data: any,  ) {
    this.userEmail = data.userEmail;
    this.clientName = data.clientName;
    this.clientEmail = data.clientEmail;
    this.clientPhone = data.clientPhone;
    this.clientTypeDocument = data.ClientTypeDocument;
    this.clientDocument = data.clientDocument;
    this.PaymentMethod = data.PaymentMethod;
    this.items = data.items;
  }
  messageModal: string = '';
  proccessKey: string = ''; // Clave del proceso
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
      this.dialogRef.close();
      
      this.dialog.open(SuccessSaleModalComponent, {
        width: '600px',
        data: {
          userEmail: this.userEmail
          , clientName: this.clientName
          , clientEmail: this.clientEmail
          , clientPhone: this.clientPhone
          , clientTypeDocument: this.clientTypeDocument
          , clientDocument: this.clientDocument
          , PaymentMethod: this.PaymentMethod
          , items: this.items
        }
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
        // podrías agregar más casos aquí
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
