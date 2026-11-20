import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { PlanUpgradeRequest } from '../../services/Company/company-settings.service';
import { CreatorAuthService } from '../../services/creator/creator-auth.service';
import {
  CreateCompanyRequest,
  SubscriptionCompany,
  SubscriptionPeriod,
  SubscriptionsService
} from '../../services/creator/subscriptions.service';

@Component({
  selector: 'app-subscriptions',
  standalone: true,
  imports: [CommonModule, DatePipe, FormsModule],
  templateUrl: './subscriptions.component.html',
  styleUrl: './subscriptions.component.css'
})
export default class SubscriptionsComponent implements OnInit {
  companies: SubscriptionCompany[] = [];
  planUpgradeRequests: PlanUpgradeRequest[] = [];
  loading = true;
  loadingUpgradeRequests = true;
  busyAction = '';
  errorMessage = '';
  successMessage = '';
  search = '';
  startDates: Record<number, string> = {};
  showCreateForm = false;
  creatingCompany = false;
  adminPasswordConfirm = '';
  private branchNitCustomized = false;
  private branchEmailCustomized = false;
  newCompany: CreateCompanyRequest = this.emptyCompanyForm();

  constructor(
    private readonly subscriptionsService: SubscriptionsService,
    private readonly creatorAuth: CreatorAuthService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.loadCompanies();
    this.loadPlanUpgradeRequests();
  }

  get filteredCompanies(): SubscriptionCompany[] {
    const query = this.search.trim().toLocaleLowerCase();
    if (!query) return this.companies;
    return this.companies.filter(company =>
      `${company.name} ${company.nit} ${company.email} ${company.branches.map(branch => `${branch.name} ${branch.identifier}`).join(' ')}`
        .toLocaleLowerCase().includes(query)
    );
  }

  get delinquentPeriodCount(): number {
    return this.companies.reduce(
      (count, company) => count + company.periods.filter(period => period.status === 'En mora').length,
      0
    );
  }

  get inactiveCompanyCount(): number {
    return this.companies.filter(company => !company.isActive).length;
  }

  get sessionStorageEmail(): string {
    return sessionStorage.getItem('creatorEmail') ?? 'Creador';
  }

  get passwordsMatch(): boolean {
    return this.newCompany.adminPassword === this.adminPasswordConfirm;
  }

  get showPasswordMismatch(): boolean {
    return !!this.adminPasswordConfirm && !this.passwordsMatch;
  }

  loadCompanies(): void {
    this.loading = true;
    this.errorMessage = '';
    this.subscriptionsService.getCompanies().subscribe({
      next: companies => {
        this.companies = companies;
        this.loading = false;
      },
      error: error => {
        this.errorMessage = error.error?.message ?? 'No fue posible cargar las empresas y sus suscripciones.';
        this.loading = false;
      }
    });
  }

  loadPlanUpgradeRequests(): void {
    this.loadingUpgradeRequests = true;
    this.subscriptionsService.getPlanUpgradeRequests().subscribe({
      next: requests => {
        this.planUpgradeRequests = requests;
        this.loadingUpgradeRequests = false;
      },
      error: error => {
        this.errorMessage = error.error?.message ?? 'No fue posible cargar las solicitudes de mejora de plan.';
        this.loadingUpgradeRequests = false;
      }
    });
  }

  approvePlanUpgradeRequest(request: PlanUpgradeRequest): void {
    if (this.busyAction
      || !window.confirm(`¿Aprobar el cambio al plan Plus para ${request.companyName}?`)) return;

    this.busyAction = `approve-upgrade-${request.id}`;
    this.errorMessage = '';
    this.successMessage = '';
    this.subscriptionsService.approvePlanUpgradeRequest(request.id).subscribe({
      next: response => {
        this.successMessage = response.message;
        this.busyAction = '';
        this.loadCompanies();
        this.loadPlanUpgradeRequests();
      },
      error: error => {
        this.errorMessage = error.error?.message ?? 'No fue posible aprobar la solicitud de mejora.';
        this.busyAction = '';
      }
    });
  }

  rejectPlanUpgradeRequest(request: PlanUpgradeRequest): void {
    if (this.busyAction
      || !window.confirm(`¿Rechazar la solicitud de mejora a Plus para ${request.companyName}?`)) return;

    this.busyAction = `reject-upgrade-${request.id}`;
    this.errorMessage = '';
    this.successMessage = '';
    this.subscriptionsService.rejectPlanUpgradeRequest(request.id).subscribe({
      next: response => {
        this.successMessage = response.message;
        this.busyAction = '';
        this.loadCompanies();
        this.loadPlanUpgradeRequests();
      },
      error: error => {
        this.errorMessage = error.error?.message ?? 'No fue posible rechazar la solicitud de mejora.';
        this.busyAction = '';
      }
    });
  }

  initializeSubscription(company: SubscriptionCompany): void {
    const startDate = this.startDates[company.id];
    if (!startDate || this.busyAction) return;

    this.runAction(`initialize-${company.id}`, () =>
      this.subscriptionsService.initialize(company.id, startDate)
    );
  }

  registerPayment(period: SubscriptionPeriod): void {
    if (this.busyAction) return;
    this.runAction(`payment-${period.id}`, () =>
      this.subscriptionsService.registerPayment(period.id)
    );
  }

  deactivate(company: SubscriptionCompany): void {
    if (this.busyAction || !window.confirm(`¿Desactivar la empresa ${company.name} y todas sus sedes?`)) return;
    this.runAction(`deactivate-${company.id}`, () =>
      this.subscriptionsService.deactivate(company.id)
    );
  }

  activate(company: SubscriptionCompany): void {
    if (this.busyAction || !window.confirm(`¿Volver a activar la empresa ${company.name} y todas sus sedes?`)) return;
    this.runAction(`activate-${company.id}`, () =>
      this.subscriptionsService.activate(company.id)
    );
  }

  renew(company: SubscriptionCompany): void {
    if (this.busyAction) return;
    this.runAction(`renew-${company.id}`, () =>
      this.subscriptionsService.renew(company.id)
    );
  }

  canRenew(company: SubscriptionCompany): boolean {
    if (!company.periods.length) return false;
    const lastCycle = Math.max(...company.periods.map(period => period.cycleNumber));
    const periods = company.periods.filter(period => period.cycleNumber === lastCycle);
    return periods.length === 12 && periods.every(period => period.status === 'Pagado');
  }

  hasOverduePeriod(company: SubscriptionCompany): boolean {
    return company.periods.some(period => period.status === 'En mora');
  }

  overduePeriodCount(company: SubscriptionCompany): number {
    return company.periods.filter(period => period.status === 'En mora').length;
  }

  companyNitChanged(value: string): void {
    if (!this.branchNitCustomized) this.newCompany.branchNit = value;
  }

  branchNitChanged(value: string): void {
    this.branchNitCustomized = !!value && value.trim() !== this.newCompany.nit.trim();
  }

  companyEmailChanged(value: string): void {
    if (!this.branchEmailCustomized) this.newCompany.branchEmail = value;
  }

  branchEmailChanged(value: string): void {
    this.branchEmailCustomized = !!value
      && value.trim().toLocaleLowerCase() !== this.newCompany.email.trim().toLocaleLowerCase();
  }

  createCompany(): void {
    if (this.creatingCompany || this.busyAction) return;
    if (!this.passwordsMatch) {
      this.errorMessage = 'Las contraseñas del administrador no coinciden.';
      return;
    }

    this.creatingCompany = true;
    this.errorMessage = '';
    this.successMessage = '';
    const request: CreateCompanyRequest = {
      ...this.newCompany,
      branchNit: this.newCompany.branchNit || this.newCompany.nit,
      branchEmail: this.newCompany.branchEmail || this.newCompany.email
    };
    this.subscriptionsService.createCompany(request).subscribe({
      next: () => {
        this.successMessage = 'La empresa, su sede principal, el administrador y la suscripción se crearon correctamente.';
        this.newCompany = this.emptyCompanyForm();
        this.adminPasswordConfirm = '';
        this.branchNitCustomized = false;
        this.branchEmailCustomized = false;
        this.showCreateForm = false;
        this.creatingCompany = false;
        this.loadCompanies();
      },
      error: error => {
        this.errorMessage = error.error?.message ?? 'No fue posible registrar la empresa.';
        this.creatingCompany = false;
      }
    });
  }

  logout(): void {
    this.creatorAuth.logout();
    void this.router.navigate(['/creator/login']);
  }

  private runAction(
    key: string,
    request: () => ReturnType<SubscriptionsService['initialize']>
  ): void {
    this.busyAction = key;
    this.errorMessage = '';
    this.successMessage = '';
    request().subscribe({
      next: response => {
        this.successMessage = response.message;
        this.busyAction = '';
        this.loadCompanies();
      },
      error: error => {
        this.errorMessage = error.error?.message ?? 'No fue posible completar la operación.';
        this.busyAction = '';
      }
    });
  }

  private emptyCompanyForm(): CreateCompanyRequest {
    return {
      name: '',
      nit: '',
      email: '',
      subscriptionPlan: 'standard',
      phone: '',
      address: '',
      branchName: '',
      branchNit: '',
      branchIdentifier: '',
      branchAddress: '',
      branchPhone: '',
      branchEmail: '',
      startDate: new Date().toISOString().slice(0, 10),
      adminFirstName: '',
      adminLastName: '',
      adminEmail: '',
      adminDocumentType: '',
      adminDocumentNumber: '',
      adminPhone: '',
      adminPassword: ''
    };
  }
}
