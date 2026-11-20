import { Component, ElementRef, HostListener, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../../material.module'; 
import { MatSelectModule } from '@angular/material/select';
import { GetInfoService } from '../../services/GetInfo/get-info.service';
import { AuthService } from '../../services/Auth/auth.service';
import { Router, RouterLink } from '@angular/router';
import { TenantService } from '../../services/Tenant/tenant.service';
import { BranchesService } from '../../services/Branches/branches.service';
import { CompanyBranch } from '../../services/creator/subscriptions.service';

@Component({
  selector: 'app-header',
  imports: [CommonModule, MaterialModule, MatSelectModule, RouterLink],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent implements OnInit{
  user: any = {};

  tenantId: string = '';
  isProfileMenuOpen = false;
  branches: CompanyBranch[] = [];
  isAdmin = false;
  isCompanyAdmin = false;
  isSwitchingBranch = false;
  branchErrorMessage = '';

  get activeBranch(): CompanyBranch | undefined {
    return this.branches.find(branch => branch.identifier === this.tenantId);
  }

  get activeBranchId(): number | null {
    return this.activeBranch?.id ?? null;
  }

  @ViewChild('profileTrigger') private profileTrigger?: ElementRef<HTMLButtonElement>;

  constructor(
    private getInfoService: GetInfoService,
    private authService: AuthService,
    private tenantService: TenantService,
    private branchesService: BranchesService,
    private router: Router,
  ) { }

  ngOnInit(): void {
  this.tenantService.tenantId$.subscribe(tenantId => this.tenantId = tenantId ?? '');

  this.getInfoService.getUserInfo().subscribe({
    next: (user) => {
      this.user = user;
      this.isAdmin = ['1', 'Administrador'].includes(String(user.role));
      this.isCompanyAdmin = this.isAdmin && user.subscriptionPlan === 'plus';
      if (this.isCompanyAdmin) {
        this.branchesService.getBranches().subscribe({
          next: branches => this.branches = branches,
          error: () => this.branchErrorMessage = 'No fue posible cargar las sedes disponibles.'
        });
      }
    },
    error: (err) => {
      console.error('Error obteniendo usuario:', err);
    }
  });
}

  switchBranch(branchId: number): void {
    const branch = this.branches.find(item => item.id === branchId);
    if (!branch || branch.identifier === this.tenantId || this.isSwitchingBranch || !branch.isActive) return;

    this.isSwitchingBranch = true;
    this.branchErrorMessage = '';
    this.authService.switchBranch(branch.id).subscribe({
      next: (response) => {
        const token = response.token ?? response.Token;
        const refreshToken = response.refreshToken ?? response.RefreshToken;
        if (typeof token !== 'string' || typeof refreshToken !== 'string') {
          this.branchErrorMessage = 'La respuesta al cambiar de sede no es válida.';
          this.isSwitchingBranch = false;
          return;
        }

        sessionStorage.setItem('token', token);
        sessionStorage.setItem('refreshToken', refreshToken);
        sessionStorage.setItem('tenantId', branch.identifier);
        this.tenantService.setTenant(branch.identifier);
        this.tenantId = branch.identifier;
        this.isSwitchingBranch = false;
        this.closeProfileMenu();
        void this.router.navigate(['/', branch.identifier, 'dashboard', 'home']);
      },
      error: error => {
        this.branchErrorMessage = error.error?.message ?? 'No fue posible cambiar de sede.';
        this.isSwitchingBranch = false;
      }
    });
  }

  toggleProfileMenu(): void {
    this.isProfileMenuOpen = !this.isProfileMenuOpen;
  }

  closeProfileMenu(): void {
    this.isProfileMenuOpen = false;
  }

  @HostListener('document:click', ['$event'])
  closeProfileMenuOnOutsideClick(event: MouseEvent): void {
    if (event.target instanceof Node && !this.elementContains(event.target)) {
      this.closeProfileMenu();
    }
  }

  @HostListener('document:keydown.escape')
  closeProfileMenuOnEscape(): void {
    if (this.isProfileMenuOpen) {
      this.closeProfileMenu();
      this.profileTrigger?.nativeElement.focus();
    }
  }

  private elementContains(target: Node): boolean {
    return this.profileTrigger?.nativeElement.parentElement?.contains(target) ?? false;
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
