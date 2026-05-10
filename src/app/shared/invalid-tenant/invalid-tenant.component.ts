import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-invalid-tenant',
  imports: [CommonModule],
  templateUrl: './invalid-tenant.component.html',
  styleUrl: './invalid-tenant.component.css'
})
export default class InvalidTenantComponent {
  constructor(private router: Router) {}

  goHome() {
    this.router.navigate(['/']);
  }
}
