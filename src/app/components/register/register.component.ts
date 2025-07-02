import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule, AbstractControl, ValidationErrors  } from '@angular/forms';
import { RegisterService } from '../../services/Register/register.service';
import { Router } from '@angular/router';
import { MaterialModule } from '../../../material.module'; 

@Component({
  selector: 'app-register',
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export default class RegisterComponent {
registerForm: FormGroup;

  username = '';
  password = '';
  messageSuccess = '';
  messageError = '';
  message = '';

  selectedForm: string = 'form1';


   // Opciones de la lista desplegable
   tiposDocumento: string[] = ['Cédula de Ciudadanía', 'Pasaporte', 'Tarjeta de Identidad', 'Cédula de Extranjería'];

   tiposUsuario: string[] = ['Colaborador', 'Administrador'];

   tiposGenero: string[] = ['Masculino', 'Femenino', 'Otro'];

  constructor(private fb: FormBuilder, private registerService: RegisterService, private router: Router) {
    
    this.registerForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      lastname: ['', [Validators.required, Validators.minLength(3)]],
      tipoDocumento: ['', Validators.required],
      numDocumento: ['', [Validators.required, Validators.pattern(/^\d{5,10}$/)]],
      correo: ['', [Validators.required, Validators.email]],
      fechaNacimiento: ['',  this.mayorDeEdadValidator],
      fechaIngreso: ['', Validators.required],
      tipoUsuario: ['', Validators.required],
      contrasena: ['', [Validators.required, Validators.minLength(6)]],
      confirmContrasena: ['', Validators.required],
      cell: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      direccion: [''],
      genero: [''],
    }, {
      validators: this.passwordMatchValidator
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

    this.registerService.registerUser(formData.name, formData.lastname, formData.tipoDocumento, formData.numDocumento, formData.correo, formData.fechaNacimiento, formData.fechaIngreso, formData.tipoUsuario, formData.contrasena, formData.cell, formData.direccion, formData.genero).subscribe(
      (response) => {
        this.messageSuccess = 'Registro exitoso';
      },
      (error) => {
        console.error('Error:', error);
        this.messageError = 'No se pudo crear el usuario';
      }
    );
  }
  
}
