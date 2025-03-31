import { Component, OnInit } from '@angular/core';
import { MessageServiceService } from '../../services/message-service.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { Router } from '@angular/router';

@Component({
  selector: 'app-success-modal',
  imports: [],
  templateUrl: './success-modal.component.html',
  styleUrl: './success-modal.component.css'
})
export class SuccessModalComponent implements OnInit {
  
  constructor(private messageService: MessageServiceService, private router: Router, private dialogRef: MatDialogRef<SuccessModalComponent>) {}
  messageModal: string = '';
  ngOnInit() {
    this.messageService.message$.subscribe((message) => {
      this.messageModal = message;
    });
  }

  closeModal() {
    this.dialogRef.close();
    
    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate(['/dashboard/products']); // Recarga la vista actual
    });
  }
}
