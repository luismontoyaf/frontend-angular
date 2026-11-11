import { CommonModule, DatePipe } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CreatorAuthService } from '../../services/creator/creator-auth.service';
import { SubscriptionPeriod, SubscriptionTenant, SubscriptionsService } from '../../services/creator/subscriptions.service';

@Component({
  selector: 'app-subscriptions',
  standalone: true,
  imports: [CommonModule, DatePipe, FormsModule],
  templateUrl: './subscriptions.component.html',
  styleUrl: './subscriptions.component.css'
})
export default class SubscriptionsComponent implements OnInit {
  tenants: SubscriptionTenant[] = [];
  loading = true;
  busyAction = '';
  errorMessage = '';
  successMessage = '';
  search = '';
  startDates: Record<number, string> = {};

  constructor(
    private readonly subscriptionsService: SubscriptionsService,
    private readonly creatorAuth: CreatorAuthService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.loadTenants();
  }

  get filteredTenants(): SubscriptionTenant[] {
    const query = this.search.trim().toLocaleLowerCase();
    if (!query) return this.tenants;
    return this.tenants.filter(tenant =>
      `${tenant.name} ${tenant.identifier} ${tenant.nit} ${tenant.email}`.toLocaleLowerCase().includes(query)
    );
  }

  get delinquentPeriodCount(): number {
    return this.tenants.reduce(
      (count, tenant) => count + tenant.periods.filter(period => period.status === 'En mora').length,
      0
    );
  }

  get inactiveTenantCount(): number {
    return this.tenants.filter(tenant => !tenant.isActive).length;
  }

  get sessionStorageEmail(): string {
    return sessionStorage.getItem('creatorEmail') ?? 'Creador';
  }

  loadTenants(): void {
    this.loading = true;
    this.errorMessage = '';
    this.subscriptionsService.getTenants().subscribe({
      next: tenants => {
        this.tenants = tenants;
        this.loading = false;
      },
      error: error => {
        this.errorMessage = error.error?.message ?? 'No fue posible cargar las empresas y sus suscripciones.';
        this.loading = false;
      }
    });
  }

  initializeSubscription(tenant: SubscriptionTenant): void {
    const startDate = this.startDates[tenant.id];
    if (!startDate || this.busyAction) return;

    this.runAction(`initialize-${tenant.id}`, () =>
      this.subscriptionsService.initialize(tenant.id, startDate)
    );
  }

  registerPayment(period: SubscriptionPeriod): void {
    if (this.busyAction) return;
    this.runAction(`payment-${period.id}`, () =>
      this.subscriptionsService.registerPayment(period.id)
    );
  }

  deactivate(tenant: SubscriptionTenant): void {
    if (this.busyAction || !window.confirm(`¿Desactivar la empresa ${tenant.name}?`)) return;
    this.runAction(`deactivate-${tenant.id}`, () =>
      this.subscriptionsService.deactivate(tenant.id)
    );
  }

  activate(tenant: SubscriptionTenant): void {
    if (this.busyAction || !window.confirm(`¿Volver a activar la empresa ${tenant.name}?`)) return;
    this.runAction(`activate-${tenant.id}`, () =>
      this.subscriptionsService.activate(tenant.id)
    );
  }

  renew(tenant: SubscriptionTenant): void {
    if (this.busyAction) return;
    this.runAction(`renew-${tenant.id}`, () =>
      this.subscriptionsService.renew(tenant.id)
    );
  }

  canRenew(tenant: SubscriptionTenant): boolean {
    if (!tenant.periods.length) return false;
    const lastCycle = Math.max(...tenant.periods.map(period => period.cycleNumber));
    const periods = tenant.periods.filter(period => period.cycleNumber === lastCycle);
    return periods.length === 12 && periods.every(period => period.status === 'Pagado');
  }

  hasOverduePeriod(tenant: SubscriptionTenant): boolean {
    return tenant.periods.some(period => period.status === 'En mora');
  }

  overduePeriodCount(tenant: SubscriptionTenant): number {
    return tenant.periods.filter(period => period.status === 'En mora').length;
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
        this.loadTenants();
      },
      error: error => {
        this.errorMessage = error.error?.message ?? 'No fue posible completar la operación.';
        this.busyAction = '';
      }
    });
  }
}
