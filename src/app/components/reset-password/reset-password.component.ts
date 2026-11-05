import { Component, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, FormGroup, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../../services/Auth/auth.service';
import { GetInfoService } from '../../services/GetInfo/get-info.service';
import { TenantService } from '../../services/Tenant/tenant.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.css'
})
export default class ResetPasswordComponent implements OnInit {
  readonly requestForm: FormGroup<{ email: FormControl<string> }>;
  readonly resetForm: FormGroup<{ password: FormControl<string>; confirmPassword: FormControl<string> }>;

  tenantId = '';
  resetToken = '';
  ready = false;
  loading = false;
  completed = false;
  message = '';
  errorMessage = '';

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private route: ActivatedRoute,
    private router: Router,
    private getInfoService: GetInfoService,
    private tenantService: TenantService
  ) {
    this.requestForm = this.formBuilder.nonNullable.group({
      email: ['', [Validators.required, Validators.email]]
    });

    this.resetForm = this.formBuilder.nonNullable.group({
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  ngOnInit(): void {
    this.tenantId = this.route.snapshot.paramMap.get('tenantId') ?? '';
    this.resetToken = this.route.snapshot.queryParamMap.get('token') ?? '';

    if (this.resetToken) {
      void this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { token: null },
        queryParamsHandling: 'merge',
        replaceUrl: true
      });
    }

    if (!this.tenantId) {
      this.router.navigate(['/invalid-tenant']);
      return;
    }

    this.getInfoService.validateTenant(this.tenantId).subscribe({
      next: () => {
        this.tenantService.setTenant(this.tenantId);
        this.ready = true;
      },
      error: () => this.router.navigate(['/invalid-tenant'])
    });
  }

  requestReset(): void {
    if (this.requestForm.invalid || this.loading) {
      this.requestForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.message = '';
    this.errorMessage = '';

    this.authService.requestPasswordReset(this.requestForm.getRawValue().email, this.tenantId).subscribe({
      next: () => {
        this.message = 'Si existe una cuenta asociada a este correo, recibirás instrucciones para restablecer tu contraseña.';
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'No fue posible procesar la solicitud. Inténtalo nuevamente más tarde.';
        this.loading = false;
      }
    });
  }

  confirmReset(): void {
    if (!this.resetToken) {
      this.errorMessage = 'El enlace de recuperación no es válido o ha expirado. Solicita uno nuevo.';
      return;
    }

    if (this.resetForm.invalid || this.loading) {
      this.resetForm.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.message = '';
    this.errorMessage = '';

    this.authService.resetPassword(
      this.resetToken,
      this.resetForm.getRawValue().password,
      this.tenantId
    ).subscribe({
      next: () => {
        this.completed = true;
        this.message = 'Tu contraseña fue actualizada. Ya puedes iniciar sesión.';
        this.loading = false;
      },
      error: () => {
        this.errorMessage = 'El enlace de recuperación no es válido o ha expirado. Solicita uno nuevo.';
        this.loading = false;
      }
    });
  }

  backToLogin(): void {
    this.router.navigate([`/${this.tenantId}`]);
  }

  requestAnotherLink(): void {
    this.router.navigate([`/${this.tenantId}/reset-password`]);
    this.resetToken = '';
    this.message = '';
    this.errorMessage = '';
  }

  private passwordMatchValidator(control: AbstractControl): ValidationErrors | null {
    const password = control.get('password')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { mismatch: true };
  }
}
