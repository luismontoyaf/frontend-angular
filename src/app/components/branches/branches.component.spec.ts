import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { of } from 'rxjs';
import { BranchesService } from '../../services/Branches/branches.service';
import { TenantService } from '../../services/Tenant/tenant.service';
import { CompanyBranch } from '../../services/creator/subscriptions.service';
import BranchesComponent from './branches.component';

describe('BranchesComponent', () => {
  let fixture: ComponentFixture<BranchesComponent>;
  let component: BranchesComponent;
  let branchesService: jasmine.SpyObj<BranchesService>;
  let tenantService: jasmine.SpyObj<TenantService>;
  let router: jasmine.SpyObj<Router>;

  const headquarters: CompanyBranch = {
    id: 8,
    name: 'Sede principal',
    identifier: 'principal',
    nit: '900123456',
    email: 'sede@example.com',
    companyNit: '800555111',
    companyEmail: 'empresa@example.com',
    phone: '3001234567',
    address: 'Calle 1',
    isActive: true,
    isHeadquarters: true
  };

  beforeEach(async () => {
    branchesService = jasmine.createSpyObj<BranchesService>('BranchesService', [
      'getBranches',
      'createBranch',
      'updateBranch'
    ]);
    branchesService.getBranches.and.returnValue(of([headquarters]));
    branchesService.createBranch.and.returnValue(of({ ...headquarters, id: 9, name: 'Sede nueva' }));
    branchesService.updateBranch.and.returnValue(of({ ...headquarters, identifier: 'principal-nuevo' }));
    tenantService = jasmine.createSpyObj<TenantService>('TenantService', ['getTenant', 'setTenant']);
    tenantService.getTenant.and.returnValue('principal');
    router = jasmine.createSpyObj<Router>('Router', ['navigate']);
    router.navigate.and.returnValue(Promise.resolve(true));

    await TestBed.configureTestingModule({
      imports: [BranchesComponent],
      providers: [
        { provide: BranchesService, useValue: branchesService },
        { provide: TenantService, useValue: tenantService },
        { provide: Router, useValue: router }
      ]
    }).compileComponents();
  });

  it('creates a new branch and reloads the company branches', () => {
    fixture = TestBed.createComponent(BranchesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    expect(component.form.nit).toBe('800555111');
    expect(component.form.email).toBe('empresa@example.com');
    component.form = {
      name: 'Sede nueva',
      identifier: 'sede-nueva',
      nit: '',
      email: '',
      phone: '',
      address: ''
    };

    component.saveBranch();

    expect(branchesService.createBranch).toHaveBeenCalledWith(component.form);
    expect(component.successMessage).toBe('La sede se creó correctamente.');
    expect(branchesService.getBranches).toHaveBeenCalledTimes(2);
  });

  it('updates the active route when the current branch identifier changes', () => {
    fixture = TestBed.createComponent(BranchesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    component.editBranch(headquarters);
    component.form.identifier = 'principal-nuevo';

    component.saveBranch();

    expect(branchesService.updateBranch).toHaveBeenCalledWith(headquarters.id, component.form);
    expect(tenantService.setTenant).toHaveBeenCalledWith('principal-nuevo');
    expect(router.navigate).toHaveBeenCalledWith(['/', 'principal-nuevo', 'dashboard', 'branches']);
  });
});
