import { Component } from '@angular/core';
import { MaterialModule } from '../../../material.module'; 
import { GetInfoService } from '../../services/GetInfo/get-info.service';
import { AuthService } from '../../services/Auth/auth.service';

@Component({
  selector: 'app-header',
  imports: [MaterialModule],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  user: any = {}; // Declare the user property


  constructor(private getInfoService: GetInfoService,
    private authService: AuthService
  ) { 
    this.getInfoService.getUserInfo().subscribe(user => {
      this.user = user; 
    });
  }
    


  // Método para cerrar sesión
  logout() {
    const refreshToken = localStorage.getItem('refreshToken');
    
    if (!refreshToken) return;
    this.authService.logout(refreshToken).subscribe(
      (response) => {
      localStorage.removeItem('token');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('userInfo');
        window.location.href = '/login';
    },
    (error) => {
      
    });
  }
}
