import { Component } from '@angular/core';

@Component({
  selector: 'app-about-lumo',
  standalone: true,
  templateUrl: './about-lumo.component.html'
})
export default class AboutLumoComponent {
  readonly termsUrl = '/legal/terminos-y-condiciones.pdf';
  readonly dataPolicyUrl = '/legal/politica-tratamiento-datos-personales.pdf';
}
