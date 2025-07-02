import { Component, Inject, Input, OnInit } from '@angular/core';
import { MessageServiceService } from '../../services/message-service.service';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { InvoiceService } from '../../../services/Invoice/invoice.service';

@Component({
  selector: 'app-success-sale-modal',
  imports: [],
  templateUrl: './success-sale-modal.component.html',
  styleUrl: './success-sale-modal.component.css'
})
export class SuccessSaleModalComponent implements OnInit {
  
  @Input() userEmail: string = ''; // Email del usuario
  clientName: any;
  clientEmail: any;
  clientPhone: any;
  clientTypeDocument: any;
  clientDocument: any;
  idClient: any;
  PaymentMethod: any;
  items: any;
  user: any;
  metodoSeleccionado: any;
  products: any;
  quantities: any;
  constructor(private messageService: MessageServiceService, 
    private router: Router, 
    private dialogRef: MatDialogRef<SuccessSaleModalComponent>,
    private invoiceService: InvoiceService,
    @Inject(MAT_DIALOG_DATA) public data: any) {
      this.userEmail = data.userEmail;
      this.idClient = data.idClient;
      this.PaymentMethod = data.PaymentMethod;
      this.items = data.items;
    }
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

  downloadPDF() {
    const formattedDate = new Date().toLocaleString('sv-SE').replace(' ', '_').replace(/:/g, '-');
    
    this.invoiceService.generateInvoice({
        idCLient: this.idClient,
        PaymentMethod: this.PaymentMethod,
        Items: this.items
      }).subscribe((blob: Blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `FacturaVenta_${formattedDate}.pdf`;
        a.click();
      });
  }

  closeModal() {
    this.dialogRef.close();
    
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate(['/dashboard/sale']); // Recarga la vista actual
    });
  }
}
