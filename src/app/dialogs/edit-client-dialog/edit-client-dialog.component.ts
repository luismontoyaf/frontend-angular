import { Component, Inject } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { RegisterService } from '../../services/Register/register.service';
import { Router } from '@angular/router';
import { MaterialModule } from '../../../material.module';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { SuccessModalComponent } from '../shared/success-modal/success-modal.component';
import { MessageService } from '../services/message-service.service';
import { Client } from '../../interfaces/client';

@Component({
  selector: 'app-edit-client-dialog',
  imports: [CommonModule, FormsModule, MaterialModule, ReactiveFormsModule, MatDialogModule,
      MatFormFieldModule],
  templateUrl: './edit-client-dialog.component.html',
  styleUrl: './edit-client-dialog.component.css'
})
export class EditClientDialogComponent {
  registerForm: FormGroup;
    
      username = '';
      password = '';
      messageSuccess = '';
      messageError = '';
      message = '';
    
      selectedForm: string = 'form1';
    
    
       // Opciones de la lista desplegable
       tiposDocumento: string[] = ['Cédula de Ciudadanía', 'Nit', 'Pasaporte', 'Tarjeta de Identidad', 'Cédula de Extranjería'];
    
       tiposGenero: string[] = ['Masculino', 'Femenino', 'Otro'];
    
      constructor(private fb: FormBuilder, 
        private registerService: RegisterService, 
        private router: Router,
        private messageService: MessageService,
            private dialog: MatDialog,
        private dialogRef: MatDialogRef<EditClientDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public data: { client: Client }
      ) {
        const formatDate = (date: string | Date): string => {
      if (typeof date === 'string') {
        return date.split('T')[0];
      }

      // Si es un objeto Date
      if (date instanceof Date) {
        return date.toISOString().split('T')[0];
      }

      return '';
    };

    const fechaNacimientoFormateada = formatDate(data.client.fechaNacimiento);

       this.registerForm = this.fb.group({
          id: [data.client.id],
          name: [data.client.nombre, [Validators.required, Validators.minLength(3)]],
          lastname: [data.client.apellidos, [Validators.required, Validators.minLength(3)]],
          tipoDocumento: [data.client.tipoDocumento, Validators.required],
          numDocumento: [data.client.numDocumento, [Validators.required, Validators.pattern(/^\d{5,10}$/)]],
          correo: [data.client.correo, [Validators.required, Validators.email]],
          fechaNacimiento: [data.client.fechaNacimiento, [Validators.required, this.mayorDeEdadValidator]],
          // contrasena: [data.user.contrasena, [Validators.minLength(6)]],
          // confirmContrasena: [data.user.confirmContrasena],
          cell: [data.client.celular, [Validators.required, Validators.pattern(/^\d{10}$/)]],
          direccion: [data.client.direccion, Validators.required],
          genero: [data.client.genero],
        }, {
          // validators: this.passwordMatchValidator
        });
      }
    
      // Validador personalizado para confirmar contraseñas
      passwordMatchValidator(form: FormGroup) {
        const password = form.get('contrasena')?.value;
        const confirmPassword = form.get('confirmContrasena')?.value;
        return password === confirmPassword ? null : { mismatch: true };
      }
    
      // Validador personalizado para verificar si el usuario es mayor de edad
      mayorDeEdadValidator(control: AbstractControl): ValidationErrors | null {
        const fechaNacimiento = control.value;
        if (!fechaNacimiento) {
          return null; // Si no hay fecha ingresada, no se valida
        }
    
        const fechaNacimientoDate = new Date(fechaNacimiento);
        const hoy = new Date();
        const edad = hoy.getFullYear() - fechaNacimientoDate.getFullYear();
    
        const esMenor =
          hoy.getMonth() < fechaNacimientoDate.getMonth() ||
          (hoy.getMonth() === fechaNacimientoDate.getMonth() && hoy.getDate() < fechaNacimientoDate.getDate());
    
        const edadReal = esMenor ? edad - 1 : edad;
    
        return edadReal >= 18 ? null : { menorDeEdad: true }; // Retorna un error si es menor de 18
      }
    
      emailError = '';
    
      validateEmail() {
        const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        this.emailError = emailPattern.test(this.username)
          ? ''
          : 'El correo electrónico no es válido.';
      }
    
      saveData() {
    
        if (this.registerForm.invalid) {
          this.message = 'Por favor, corrige los errores en el formulario.';
          return;
        }
    
        const formData = this.registerForm.value;
    
        this.registerService.updateClient(formData).subscribe(
          (response) => {
            this.message = 'El cliente ha sido editado exitosamente';
            this.setMessage(this.message);
            this.setProccess('closeModalSuccess'); 
            this.dialogRef.close(true); 
            this.openSuccessDialog();
          },
          (error) => {
            console.error('Error:', error);
            this.message = 'No se pudo crear el usuario';
          }
        );
      }
  
      setMessage(message: string): void {
          this.messageService.setMessageSuccess(message);
        }
        
        setProccess(proccess: string): void {
          this.messageService.setProcess(proccess);
        }
        openSuccessDialog(): void {
          this.dialog.open(SuccessModalComponent, {
          });
        };
  
}
