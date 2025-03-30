import { Component, OnInit } from '@angular/core';
import { HeaderComponent } from '../header/header.component';
import { SidenavComponent } from '../sidenav/sidenav.component';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, NavigationStart, NavigationEnd, NavigationCancel, NavigationError } from '@angular/router';
import { LoaderService } from '../../services/Loader/loader.service';
import { MaterialModule } from '../../../material.module';
import { TitleService } from '../services/title.service';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, HeaderComponent, SidenavComponent, MaterialModule],
  templateUrl: './layout.component.html',
  styleUrls: ['./layout.component.css']
})
export default class LayoutComponent implements OnInit {
  loading = false;
  pageTitle: string = '';

  constructor(private router: Router, private loaderService: LoaderService, private titleService: TitleService) {
    this.router.events.subscribe(event => {
      if (event instanceof NavigationStart) {
        this.loaderService.show();
      }
      if (event instanceof NavigationEnd || event instanceof NavigationCancel || event instanceof NavigationError) {
        this.loaderService.hide();
      }
    });

    // Subscribe to the loaderService
    this.loaderService.loading$.subscribe(isLoading => {
      this.loading = isLoading;
    });
  }

  ngOnInit(): void {
    this.titleService.title$.subscribe((title) => {
      this.pageTitle = title;
    });
  }
}
