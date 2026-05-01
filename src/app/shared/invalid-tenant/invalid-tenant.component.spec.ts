import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InvalidTenantComponent } from './invalid-tenant.component';

describe('InvalidTenantComponent', () => {
  let component: InvalidTenantComponent;
  let fixture: ComponentFixture<InvalidTenantComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InvalidTenantComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InvalidTenantComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
