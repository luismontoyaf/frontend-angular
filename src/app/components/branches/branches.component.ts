import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { BranchesService, BranchRequest } from '../../services/Branches/branches.service';
import { CompanyBranch } from '../../services/creator/subscriptions.service';
import { TenantService } from '../../services/Tenant/tenant.service';

@Component({
  selector: 'app-branches',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './branches.component.html',
  styleUrl: './branches.component.css'
})
export default class BranchesComponent implements OnInit {
  branches: CompanyBranch[] = [];
  form = this.emptyForm();
  editingBranchId: number | null = null;
  loading = true;
  saving = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private readonly branchesService: BranchesService,
    private readonly tenantService: TenantService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.loadBranches();
  }

  loadBranches(): void {
    this.loading = true;
    this.errorMessage = '';
    this.branchesService.getBranches().subscribe({
      next: branches => {
        this.branches = branches;
        if (this.editingBranchId === null) this.form = this.emptyForm();
        this.loading = false;
      },
      error: error => {
        this.errorMessage = error.error?.message ?? 'No fue posible cargar las sedes de la empresa.';
        this.loading = false;
      }
    });
  }

  editBranch(branch: CompanyBranch): void {
    this.editingBranchId = branch.id;
    this.successMessage = '';
    this.errorMessage = '';
    this.form = {
      name: branch.name,
      identifier: branch.identifier,
      nit: branch.nit || branch.companyNit || '',
      email: branch.email || branch.companyEmail || '',
      phone: branch.phone,
      address: branch.address
    };
  }

  cancelEdit(): void {
    this.editingBranchId = null;
    this.form = this.emptyForm();
    this.errorMessage = '';
  }

  saveBranch(): void {
    if (this.saving) return;
    this.saving = true;
    this.errorMessage = '';
    this.successMessage = '';
    const previousIdentifier = this.branches.find(branch => branch.id === this.editingBranchId)?.identifier;
    const request = this.editingBranchId === null
      ? this.branchesService.createBranch(this.form)
      : this.branchesService.updateBranch(this.editingBranchId, this.form);

    request.subscribe({
      next: branch => {
        if (previousIdentifier && this.tenantService.getTenant() === previousIdentifier) {
          this.tenantService.setTenant(branch.identifier);
          void this.router.navigate(['/', branch.identifier, 'dashboard', 'branches']);
        }
        this.successMessage = this.editingBranchId === null
          ? 'La sede se creó correctamente.'
          : 'La configuración de la sede se guardó correctamente.';
        this.editingBranchId = null;
        this.form = this.emptyForm();
        this.saving = false;
        this.loadBranches();
      },
      error: error => {
        this.errorMessage = error.error?.message ?? 'No fue posible guardar la sede.';
        this.saving = false;
      }
    });
  }

  isEditing(branch: CompanyBranch): boolean {
    return this.editingBranchId === branch.id;
  }

  private emptyForm(): BranchRequest {
    const headquarters = this.branches.find(branch => branch.isHeadquarters);
    return {
      name: '',
      identifier: '',
      nit: headquarters?.companyNit || headquarters?.nit || '',
      email: headquarters?.companyEmail || headquarters?.email || '',
      phone: '',
      address: ''
    };
  }
}
