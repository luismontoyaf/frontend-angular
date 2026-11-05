import { ComponentFixture, TestBed } from '@angular/core/testing';
import AboutLumoComponent from './about-lumo.component';

describe('AboutLumoComponent', () => {
  let fixture: ComponentFixture<AboutLumoComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AboutLumoComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(AboutLumoComponent);
    fixture.detectChanges();
  });

  it('should provide links to both legal documents', () => {
    const links = Array.from(fixture.nativeElement.querySelectorAll('a')) as HTMLAnchorElement[];

    expect(links.some(link => link.href.endsWith('/legal/terminos-y-condiciones.pdf'))).toBeTrue();
    expect(links.some(link => link.href.endsWith('/legal/politica-tratamiento-datos-personales.pdf'))).toBeTrue();
  });
});
