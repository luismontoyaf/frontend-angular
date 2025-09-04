import { Component } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { RegisterService } from '../../services/Register/register.service';
import { Router } from '@angular/router';
import { MaterialModule } from '../../../material.module';
import { CommonModule } from '@angular/common';
import { MatDialog, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { SuccessModalComponent } from '../shared/success-modal/success-modal.component';
import { MessageService } from '../services/message-service.service';

@Component({
  selector: 'app-add-client-dialog',
  imports: [CommonModule, FormsModule, MaterialModule, ReactiveFormsModule, MatDialogModule,
      MatFormFieldModule],
  templateUrl: './add-client-dialog.component.html',
  styleUrl: './add-client-dialog.component.css'
})
export class AddClientDialogComponent {
  registerForm: FormGroup;
  
    username = '';
    password = '';
    messageSuccess = '';
    messageError = '';
    message = '';
  
    selectedForm: string = 'form1';
  
  
     // Opciones de la lista desplegable
     tiposDocumento: string[] = ['Cédula de Ciudadanía', 'Pasaporte', 'Tarjeta de Identidad', 'Cédula de Extranjería'];
  
     tiposGenero: string[] = ['Masculino', 'Femenino', 'Otro'];
  
    constructor(private fb: FormBuilder, 
      private registerService: RegisterService, 
      private router: Router,
      private messageService: MessageService,
          private dialog: MatDialog,
      private dialogRef: MatDialogRef<AddClientDialogComponent>
    ) {
     this.registerForm = this.fb.group({
        name: ['', [Validators.required, Validators.minLength(3)]],
        lastname: ['', [Validators.required, Validators.minLength(3)]],
        tipoDocumento: ['', Validators.required],
        numDocumento: ['', [Validators.required, Validators.pattern(/^\d{5,10}$/)]],
        correo: ['', [Validators.required, Validators.email]],
        fechaNacimiento: ['', [Validators.required, this.mayorDeEdadValidator]],
        contrasena: ['', [Validators.minLength(6)]],
        confirmContrasena: [''],
        cell: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
        direccion: ['', Validators.required],
        genero: [''],
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
  
    register() {
  
      if (this.registerForm.invalid) {
        this.message = 'Por favor, corrige los errores en el formulario.';
        return;
      }
  
      const formData = this.registerForm.value;
  
      this.registerService.register(formData.name, formData.lastname, formData.tipoDocumento, formData.numDocumento, formData.correo, formData.fechaNacimiento, formData.contrasena ?? '', formData.cell, formData.direccion, formData.genero).subscribe(
        (response) => {
          this.message = 'El cliente ha sido registrado exitosamente';
          this.setMessage(this.message); // Llamar al servicio para mostrar el mensaje
          this.setProccess('closeModalSuccess'); 
          this.dialogRef.close(true); // Cerrar diálogo y recargar datos en la vista principal
          this.openSuccessDialog(); // Abrir el diálogo de éxito
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
