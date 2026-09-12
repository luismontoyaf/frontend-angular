import { Component, OnInit } from '@angular/core';
import { MaterialModule } from '../../../material.module'; 
import { GetInfoService } from '../../services/GetInfo/get-info.service';
import { AuthService } from '../../services/Auth/auth.service';
import { RouterLink } from '@angular/router';
import { TenantService } from '../../services/Tenant/tenant.service';

@Component({
  selector: 'app-header',
  imports: [MaterialModule, RouterLink],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit{
  user: any = {};

  tenantId: string = '';

  constructor(
    private getInfoService: GetInfoService,
    private authService: AuthService,
    private tenantService: TenantService,
  ) { }

  ngOnInit(): void {
  this.tenantId = this.tenantService.getTenant() ?? '';

  this.getInfoService.getUserInfo().subscribe({
    next: (user) => {
      this.user = user;
    },
    error: (err) => {
      console.error('Error obteniendo usuario:', err);
    }
  });
}

  logout() {
    const tenant = sessionStorage.getItem('tenantId');

    this.authService.logout().subscribe({
      next: () => this.redirectAfterLogout(tenant),
      error: () => this.redirectAfterLogout(tenant)
    });
  }

  private redirectAfterLogout(tenant: string | null) {
    window.location.href = tenant ? `/${tenant}` : '/invalid-tenant';
  }
}
