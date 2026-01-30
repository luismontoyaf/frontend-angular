import { Component, OnInit } from '@angular/core';
import { MaterialModule } from '../../../material.module';
import { SidebarService } from '../../services/Sidebar/sidebar.service';
import { CommonModule } from '@angular/common'; 
import { RouterLink, RouterLinkActive, RouterModule } from '@angular/router';
import { GetInfoService } from '../../services/GetInfo/get-info.service';
import { TitleService } from '../services/title.service';

@Component({
  selector: 'app-sidenav',
  imports: [MaterialModule, CommonModule, RouterModule, RouterLink, RouterLinkActive],
  templateUrl: './sidenav.component.html',
  styleUrls: ['./sidenav.component.css']
})
export class SidenavComponent implements OnInit {

  isMenuOpen = false;
  isProductsMenuOpen = false;
  isUsersMenuOpen = false;
  imageLogo: any;
  opcionesMenu: any[] = [];

  constructor(public sidebarService: SidebarService, private _getInfoService: GetInfoService, private titleService: TitleService) {}

  ngOnInit() {
    this._getInfoService.getParameter("LogoEmpresa").subscribe((data: string) => {
      this.imageLogo = data; // Asignar directamente el string a la variable
    });
    this._getInfoService.getParameter("OPCIONES_MENU").subscribe((data: string) => {
      this.opcionesMenu = JSON.parse(data).Opciones; // Asignar directamente el string a la variable
      
    });
  }
  
  toggleMenu() {
    this.sidebarService.toggleMenu();
  }

  setTitle(title: string): void {
    // this.titleService.setTitle(title);
  }

  closeMenuOnMobile() {
  if (this.isMobile()) {
    this.sidebarService.toggleMenu();
  }
}

toggleProductsMenu() {
  this.isProductsMenuOpen = !this.isProductsMenuOpen;
}

toggleUsersMenu() {
  this.isUsersMenuOpen = !this.isUsersMenuOpen;
}

  isMobile(): boolean {
  return window.innerWidth < 768; // Tailwind "md"
}
}
