import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, FormsModule, AbstractControl, ValidationErrors  } from '@angular/forms';
import { AuthService } from '../../services/Auth/auth.service';
import { RegisterService } from '../../services/Register/register.service';
import { Router } from '@angular/router';
import { MaterialModule } from '../../../material.module'; 

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  registerForm: FormGroup;
  loginForm: FormGroup;

  username = '';
  password = '';
  messageSuccess = '';
  messageError = '';
  message = '';

  selectedForm: string = 'form1';


   // Opciones de la lista desplegable
   tiposDocumento: string[] = ['Cédula de Ciudadanía', 'Pasaporte', 'Tarjeta de Identidad', 'Cédula de Extranjería'];

   tiposGenero: string[] = ['Masculino', 'Femenino', 'Otro'];

  constructor(private fb: FormBuilder, private authService: AuthService, private registerService: RegisterService, private router: Router) {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
    
    this.registerForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      lastname: ['', [Validators.required, Validators.minLength(3)]],
      tipoDocumento: ['', Validators.required],
      numDocumento: ['', [Validators.required, Validators.pattern(/^\d{5,10}$/)]],
      correo: ['', [Validators.required, Validators.email]],
      fechaNacimiento: ['', [Validators.required, this.mayorDeEdadValidator]],
      contrasena: ['', [Validators.required, Validators.minLength(6)]],
      confirmContrasena: ['', Validators.required],
      cell: ['', [Validators.required, Validators.pattern(/^\d{10}$/)]],
      direccion: ['', Validators.required],
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

  login() {

    const formLoginData = this.loginForm.value;

    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    
    // Validar formato de correo
    if (!emailPattern.test(formLoginData.username)) {
      this.message = 'Por favor, ingresa un correo electrónico válido.';
      return;
    }
  

    this.authService.login(formLoginData.username, formLoginData.password).subscribe(
      (response) => {
        this.message = 'Inicio de sesión exitoso';
        localStorage.setItem('token', response.token); // Almacenar el token
        localStorage.setItem('refreshToken', response.refreshToken);

        this.authService.startTokenMonitor();

        // Redirigir al componente Home
        this.router.navigate(['/dashboard/home']);
      },
      (error) => {
        console.error('Error:', error);
        this.message = 'Usuario o contraseña incorrectos';
      }
    );
  }

  register() {

    if (this.registerForm.invalid) {
      this.message = 'Por favor, corrige los errores en el formulario.';
      return;
    }

    const formData = this.registerForm.value;

    this.registerService.register(formData.name, formData.lastname, formData.tipoDocumento, formData.numDocumento, formData.correo, formData.fechaNacimiento, formData.contrasena, formData.cell, formData.direccion, formData.genero).subscribe(
      (response) => {
        this.message = 'Registro exitoso';

        // Redirigir al componente login
        this.router.navigate(['/login']);
      },
      (error) => {
        console.error('Error:', error);
        this.message = 'No se pudo crear el usuario';
      }
    );
  }
  goToRegister(){
    this.loginForm.reset();

    this.selectedForm = 'form2';
  }

  backToLogin(){
    this.registerForm.reset();

    this.selectedForm = 'form1';
  }
}
