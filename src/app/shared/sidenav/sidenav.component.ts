import { Component, OnInit } from '@angular/core';
import { MaterialModule } from '../../../material.module';
import { SidebarService } from '../../services/Sidebar/sidebar.service';
import { CommonModule } from '@angular/common'; 
import { RouterLink, RouterLinkActive, RouterModule } from '@angular/router';
import { GetInfoService } from '../../services/GetInfo/get-info.service';
import { TitleService } from '../services/title.service';
import { forkJoin } from 'rxjs';
import { TenantService } from '../../services/Tenant/tenant.service';

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
  tenantId: string = '';
  isAdmin: boolean = false;

  constructor(public sidebarService: SidebarService, 
    private _getInfoService: GetInfoService, 
    private tenantService: TenantService,
    private titleService: TitleService) {}

  ngOnInit() {
  this.tenantId = this.tenantService.getTenant() ?? '';

  this._getInfoService.getUserInfo().subscribe(response => {
      this.isAdmin = response.role !== '0';
    });
  
  console.log('this.isAdmin ', this.isAdmin);
  

  forkJoin({
    logo: this._getInfoService.getParameter("LogoEmpresa"),
    menu: this._getInfoService.getParameter("OPCIONES_MENU")
  }).subscribe({
    next: ({ logo, menu }) => {
      this.imageLogo = logo;

      try {
        this.opcionesMenu = JSON.parse(menu).Opciones;
      } catch {
        console.error('Error parseando OPCIONES_MENU');
        this.opcionesMenu = [];
      }
    },
    error: (err) => {
      console.error('Error cargando configuración:', err);

      // fallback seguro
      this.imageLogo = '';
      this.opcionesMenu = [];
    }
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
