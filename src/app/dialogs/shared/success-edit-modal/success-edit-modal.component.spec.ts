import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SuccessEditModalComponent } from './success-edit-modal.component';

describe('SuccessEditModalComponent', () => {
  let component: SuccessEditModalComponent;
  let fixture: ComponentFixture<SuccessEditModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SuccessEditModalComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SuccessEditModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
