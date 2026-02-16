import { Component, OnInit } from '@angular/core';
import { MessageService } from '../../services/message-service.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';

@Component({
  selector: 'app-success-modal',
  imports: [],
  templateUrl: './success-modal.component.html',
  styleUrl: './success-modal.component.css'
})
export class SuccessModalComponent implements OnInit {
  
  constructor(private messageService: MessageService, private router: Router, private dialogRef: MatDialogRef<SuccessModalComponent>) {}
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
      case 'closeModalSuccess':
        this.closeModalSuccess();
        break;
      case 'closeModalFromEditProduct':
        this.closeModal();
        break;
      case 'goToLogin':
        this.goToLogin();
        break;
      case 'goToAdminVariants':
        this.goToAdminVariants();
        break;
      default:
        this.closeModalSuccess();
    }
  }

  closeModalSuccess() {
    const currentUrl = this.router.url;

    this.dialogRef.close();
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate([currentUrl]); // Recarga la vista actual
    });
  }

  closeModal() {
    this.dialogRef.close();
    
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate(['/dashboard/products']); // Recarga la vista actual
    });
  }

  goToLogin() {
    this.dialogRef.close();

    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate(['/login']); 
    });
  }

  goToAdminVariants(){
    this.dialogRef.close();

    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate(['/dashboard/variants']); 
    });
  }
}
