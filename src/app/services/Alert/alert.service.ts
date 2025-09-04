import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';

@Injectable({
  providedIn: 'root'
})
export class AlertService {

  showError(message: string, title: string = 'Error') {
    Swal.fire({
      icon: 'error',
      title,
      text: message,
      confirmButtonText: 'Aceptar'
    });
  }

  showSuccess(message: string, title: string = 'Éxito') {
    Swal.fire({
      icon: 'success',
      title,
      text: message,
      confirmButtonText: 'Aceptar'
    });
  }

  showWarning(message: string, title: string = '¡Advertencia!') {
    Swal.fire({
      icon: 'warning',
      title,
      text: message,
      confirmButtonText: 'Aceptar'
    });
  }

  showInfo(message: string, title: string = 'Información') {
    Swal.fire({
      icon: 'info',
      title,
      text: message,
      confirmButtonText: 'Aceptar'
    });
  }
}
