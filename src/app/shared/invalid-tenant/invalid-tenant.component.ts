import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-invalid-tenant',
  imports: [],
  templateUrl: './invalid-tenant.component.html',
  styleUrl: './invalid-tenant.component.css'
})
export default class InvalidTenantComponent {
  constructor(private router: Router) {}

  goHome() {
    this.router.navigate(['/']);
  }
}
