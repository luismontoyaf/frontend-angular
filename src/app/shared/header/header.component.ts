import { Component } from '@angular/core';
import { MaterialModule } from '../../../material.module'; 
import { GetInfoService } from '../../services/GetInfo/get-info.service';

@Component({
  selector: 'app-header',
  imports: [MaterialModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  user: any; // Declare the user property


  constructor(private getInfoService: GetInfoService) { 
    this.getInfoService.getUserInfo().subscribe(user => {
      console.log("Datos del usuario:", user);
      this.user = user; 
      console.log("Usuario:", this.user);
      
    });
  }
    


  // Método para cerrar sesión
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('userInfo');
    window.location.href = '/login';
  }
}
