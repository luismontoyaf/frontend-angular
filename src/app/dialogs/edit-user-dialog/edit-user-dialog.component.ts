import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, Validators, ReactiveFormsModule } from '@angular/forms';
import { RegisterService } from '../../services/Register/register.service';
import { User } from '../../interfaces/user';
import { GetInfoService } from '../../services/GetInfo/get-info.service';
import { SuccessModalComponent } from '../shared/success-modal/success-modal.component';
import { MessageServiceService } from '../services/message-service.service';

@Component({
  selector: 'app-edit-user-dialog',
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: './edit-user-dialog.component.html',
  styleUrl: './edit-user-dialog.component.css'
})
export class EditUserDialogComponent implements OnInit {

  registerForm: FormGroup;

  userInfo: any = {};
  
    username = '';
    password = '';
    messageSuccess = '';
    messageError = '';
    message = '';
  
    selectedForm: string = 'form1';

    tiposDocumento: string[] = ['Cédula de Ciudadanía', 'Pasaporte', 'Tarjeta de Identidad', 'Cédula de Extranjería'];

   tiposUsuario: string[] = ['Colaborador', 'Administrador'];

   tiposGenero: string[] = ['Masculino', 'Femenino', 'Otro'];
    
  constructor(private fb: FormBuilder,
    private registerService: RegisterService,
    private getInfoService: GetInfoService,
    private messageService: MessageServiceService,
    private dialog: MatDialog,
    private dialogRef: MatDialogRef<EditUserDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { user: User })
    {
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

    const fechaNacimientoFormateada = formatDate(data.user.fechaNacimiento);
    const fechaIngresoFormateada = formatDate(data.user.fechaIngreso);
      console.log('dataUser ' + JSON.stringify(data.user));
      
      this.registerForm = this.fb.group({
            id: [data.user.id],
            nombre: [data.user.nombre || '', [Validators.required, Validators.minLength(3)]],
            apellidos: [data.user.apellidos || '', [Validators.required, Validators.minLength(3)]],
            tipoDocumento: [{value: data.user.tipoDocumento || '', disabled: true}, Validators.required],
            numDocumento: [{value:data.user.numDocumento || '', disabled: true}, [Validators.required, Validators.pattern(/^\d{5,10}$/)]],
            correo: [{value: data.user.correo || '', disabled: true}, [Validators.required, Validators.email]],
            fechaNacimiento: [fechaNacimientoFormateada || '',  this.mayorDeEdadValidator],
            fechaIngreso: [fechaIngresoFormateada || '', Validators.required],
            rol: [data.user.rol || '', Validators.required],
            contrasena: ['', [Validators.minLength(6)]],
            confirmContrasena: [''],
            celular: [data.user.celular || '', [Validators.required, Validators.pattern(/^\d{10}$/)]],
            direccion: [data.user.direccion || ''],
            genero: [data.user.genero || ''],
            changePassword: [''],
          }, {
            validators: this.passwordMatchValidator
          });
  }

  ngOnInit(): void {
    this.getInfoService.getUserInfo().subscribe(user => {
      this.userInfo = user; 
      console.log('userInfo ' + JSON.stringify(this.userInfo));
      
    });

    if (this.userInfo.role == "2") {
      this.registerForm.get('fechaIngreso')?.disable();
    }
  }
  

  get changePassword(): string {
    return this.registerForm.get('changePassword')?.value;
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('contrasena')?.value;
    const confirmPassword = form.get('confirmContrasena')?.value;
    return password === confirmPassword ? null : { mismatch: true };
  }

  updateUser() {

    if (this.registerForm.invalid) {
      this.message = 'Por favor, corrige los errores en el formulario.';
      return;
    }

    if (this.userInfo.role != "1" && this.registerForm.get('contrasena')?.value != '') {
      this.messageError = 'No puedes modificar la contraseña de un administrador.'
    }
    
    const formValue = this.registerForm.value;

    if (formValue.changePassword !== 'Si') {
      delete formValue.contrasena;
      delete formValue.confirmContrasena;
    } 

    const formData = formValue;

    this.registerService.updateUser(formData).subscribe(
      (response) => {
        this.dialogRef.close();
        this.messageSuccess = 'Usuario actualizado correctamente';
        this.message = 'El usuario fue actualizado correctamente';
        this.setMessage(this.message);
        this.openSuccesModal();
      },
      (error) => {
        console.error('Error:', error);
        this.messageError = 'No se pudo actualizar el usuario';
      }
    );
  }

  openSuccesModal(): void {
    this.dialog.open(SuccessModalComponent, {
      width: '400px',
    });
  }

  setMessage(message: string): void {
    this.messageService.setMessageSuccess(message);
  }

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
    
  close(){
    this.dialogRef.close();
  }
}
