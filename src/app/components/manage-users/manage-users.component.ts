import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Product } from '../../interfaces/product';
import { FormsModule } from '@angular/forms';
import { MaterialModule } from '../../../material.module'; 
import { RegisterService } from '../../services/Register/register.service';
import { SuccessModalComponent } from '../../dialogs/shared/success-modal/success-modal.component';
import { MessageServiceService } from '../../dialogs/services/message-service.service';
import { MatDialog } from '@angular/material/dialog';
import { EditUserDialogComponent } from '../../dialogs/edit-user-dialog/edit-user-dialog.component';

@Component({
  selector: 'app-manage-users',
  imports: [CommonModule, FormsModule, MaterialModule],
  templateUrl: './manage-users.component.html',
  styleUrl: './manage-users.component.css'
})
export default class ManageUsersComponent implements OnInit {

  content: boolean = false;

  activeTab: string = 'users';
  message: string = '';
  process: string = '';
  
    filteredUsers: any[] = []; 
    filteredClients: any[] = []; 
  
    searchTerm: string = '';
    users: any[] = []; // Cambiado a any[] para evitar errores de tipo
    clients: any[] = []; // Cambiado a any[] para evitar errores de tipo

    constructor(private registerServices: RegisterService,
      private messageService: MessageServiceService,
      private dialog: MatDialog
    ) {

    }

  ngOnInit(): void {
    this.registerServices.getUsers().subscribe({
      next: (response: any[]) => {
        if (response) {
          this.users = response.filter(user => user.rol != "2");
          this.filteredUsers = response.filter(user => user.rol != "2");
            this.users.forEach(user => {
              user.rol = user.rol == 1 ? "Administrador" : "Colaborador";
              user.estado = user.estado == 1 ? "Activo" : "Inactivo";
            });
          this.clients = response.filter(client => client.rol == "2");
          this.filteredClients = response.filter(client => client.rol == "2");
            this.clients.forEach(client => {
              client.rol =  "Cliente";
              client.estado = client.estado == 1 ? "Activo" : "Bloqueado";
            });
        }
      }
    });
  }

  openEditUserDialog(user: any) {
    this.dialog.open(EditUserDialogComponent, {
        data: { user }
      });
  }

  filterUsers() {
    const term = this.searchTerm.toLowerCase();
    this.filteredUsers = this.users.filter(user => 
      user.nombre.toLowerCase().includes(term) || user.apellidos.toLowerCase().includes(term)
    );
  }

  filterClients() {
    const term = this.searchTerm.toLowerCase();
    this.filteredClients = this.clients.filter(client => 
      client.nombre.toLowerCase().includes(term) || client.apellidos.toLowerCase().includes(term)
    );
  }

  changeStatusUser(userId: number) {
    this.registerServices.changeStatusUser(userId).subscribe({
      next: (response) => {
        this.message = 'El estado del usuario fue modificado correctamente';
        this.process = 'closeModalSuccess'
        this.setMessage(this.message);
        this.setProcess(this.process);
        this.openSuccessDialog();
      },
      error: (error) => {
        console.error("Error al modificar el usuario:", error);
        alert("Error al modificar el usuario");
      }
    });
  }

  openSuccessDialog(): void {
      this.dialog.open(SuccessModalComponent, {
      });
    };

    setMessage(message: string): void {
      this.messageService.setMessageSuccess(message);
    }

    setProcess(process: string): void {
      this.messageService.setProcess(process);
    }

}