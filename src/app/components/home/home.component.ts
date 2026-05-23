import { Component, OnInit, Signal, signal } from '@angular/core';
import { MaterialModule } from '../../../material.module'; 
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SidebarService } from '../../services/Sidebar/sidebar.service';
import { ProductsService } from '../../services/Products/products.service';
import { GetInfoService } from '../../services/GetInfo/get-info.service';
import { Product } from '../../interfaces/product'; // Asegúrate de que la ruta sea correcta
import { TitleService } from '../../shared/services/title.service';
import { DashboardService } from '../../services/Dashboard/dashboard.service';
import { DashboardResponse, VentaSemana } from '../../interfaces/dashboard';
import { TenantService } from '../../services/Tenant/tenant.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [MaterialModule, CommonModule, FormsModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export default class HomeComponent implements OnInit{
  isMenuOpen = false;
  content: boolean = false;
  fechaDiaActual = signal<Date>(new Date());

  noStockProducts = signal<Product[]>([]);
  products: Product[] = [];
  filteredProducts: Product[] = [];

  searchTerm: string = '';
  user: any = null;

  tenantId: string = '0';

  //----------------------------------------------------------------------------
  totalVentasHoy = 0;
  totalPedidos = 0;
  totalClientes = 0;
  stockBajo = 0;
  
  ventasSemana: VentaSemana[] = [];  

  constructor(private sidebarService: SidebarService, 
    private productsService: ProductsService, 
    private getInfoService: GetInfoService,
    private dashboardService: DashboardService,
    private tenantService: TenantService,
    private router: Router,
    private titleService: TitleService) {
    this.sidebarService.isOpen$.subscribe(open => {
      this.isMenuOpen = open;
    });

    this.productsService.getProducts().subscribe({
      next: (response: Product[]) => {
    
        if (response && response.length > 0) {
          this.products = response;
          this.filteredProducts = response;
          this.content = false; // Si hay productos, mostramos la lista
        } else {
          this.content = true; // Si no hay productos, mostramos el mensaje vacío
        }
      },
      error: (err) => {
        console.error('Error al obtener productos:', err);
        this.content = true; // Mostrar mensaje de "No hay productos"
      }
    });
  }

  async ngOnInit() {
    this.tenantId = this.tenantService.getTenant() ?? '';

    this.setTitle('Página Principal');

    await this.getDashboardInfo();

    // this.getNonStockProducts();
  }
  
  // Método para filtrar productos por nombre
  filterProducts() {
    const term = this.searchTerm.toLowerCase();
    this.filteredProducts = this.products.filter(product => 
      product.nombreProducto.toLowerCase().includes(term)
    );
  }

  // Simular la acción de comprar un producto
  buyProduct(product: any) {
    alert(`Has comprado: ${product.nombreProducto}`);
  }

  async getDashboardInfo(){
    this.dashboardService.getDashboardInfo()
    .subscribe({
      next: (response: DashboardResponse) => {

        const max = Math.max(
          ...response.ventasSemana.map(x => x.total),
          1
        );

        this.ventasSemana = response.ventasSemana.map(x => ({
          ...x,
          valor: (x.total / max) * 220
        }));

        this.totalVentasHoy = response.ventasHoy;
        this.totalPedidos = response.totalVentas;
        this.totalClientes = response.totalClientes;
        this.stockBajo = response.stockBajo;
      }

      
    });
  }

  getNonStockProducts() {
    this.productsService.getProducts().subscribe({
      next: (response) => {
        const noStock = response.filter((f: Product) => f.stock === 0);
        this.noStockProducts.set(noStock);
      },
      error(err) {
        console.log('No se pudieron obtener los productos');
      },
    })
  }

  goToReports(){
    const tenant = sessionStorage.getItem('tenantId');

    if (!tenant) {
      window.location.href = '/invalid-tenant';
      return;
    }

    this.router.navigateByUrl('/', { skipLocationChange: true }).then(() => {
      this.router.navigate([`/${tenant}/dashboard/reports`]);
    });
  }
  setTitle(title: string): void {
    this.titleService.setTitle(title);
  }
}
