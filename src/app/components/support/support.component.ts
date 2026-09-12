import { Component } from '@angular/core';
import { environment } from '../../../environments/environment.development';

@Component({
  selector: 'app-support',
  imports: [],
  templateUrl: './support.component.html',
  styleUrl: './support.component.css'
})
export default class SupportComponent {
  versionSistema = environment.version;
  currentYear = new Date().getFullYear();

  openWhatsApp(): void {
    const phone = '573226444646';
    const message = encodeURIComponent(
      'Hola, necesito ayuda con el sistema.'
    );

    window.open(
      `https://wa.me/${phone}?text=${message}`,
      '_blank'
    );
  }
}
