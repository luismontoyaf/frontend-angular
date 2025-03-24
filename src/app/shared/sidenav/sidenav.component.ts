import { Component } from '@angular/core';
import { MaterialModule } from '../../../material.module';
import { SidebarService } from '../../services/Sidebar/sidebar.service';
import { CommonModule } from '@angular/common'; 
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-sidenav',
  imports: [MaterialModule, CommonModule, RouterModule],
  templateUrl: './sidenav.component.html',
  styleUrl: './sidenav.component.css'
})
export class SidenavComponent {

  isMenuOpen = false;

  constructor(public sidebarService: SidebarService) {}

  toggleMenu() {
    this.sidebarService.toggleMenu();
  }
}
