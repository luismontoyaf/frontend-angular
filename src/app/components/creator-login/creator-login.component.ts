import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { CreatorAuthService } from '../../services/creator/creator-auth.service';

@Component({
  selector: 'app-creator-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './creator-login.component.html',
  styleUrl: './creator-login.component.css'
})
export default class CreatorLoginComponent {
  private readonly formBuilder = inject(FormBuilder);
  readonly form = this.formBuilder.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });
  loading = false;
  errorMessage = '';

  constructor(
    private readonly creatorAuth: CreatorAuthService,
    private readonly router: Router,
    private readonly route: ActivatedRoute
  ) {}

  submit(): void {
    if (this.form.invalid || this.loading) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading = true;
    this.errorMessage = '';
    const { email, password } = this.form.getRawValue();

    this.creatorAuth.login(email, password).subscribe({
      next: () => {
        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
        void this.router.navigateByUrl(returnUrl?.startsWith('/creator/') ? returnUrl : '/creator/subscriptions');
      },
      error: error => {
        this.errorMessage = error.error?.message ?? 'No fue posible iniciar sesión. Inténtalo nuevamente.';
        this.loading = false;
      }
    });
  }
}
