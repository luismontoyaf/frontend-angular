import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { authGuardCanActivate, authGuardCanMatch } from './guards/auth.guard';

export const routes: Routes = [
    { path: '', // Ruta principal
    component: LoginComponent, // Componente contenedor
    },
      { path: 'dashboard', 
        loadComponent: () => import ("./shared/layout/layout.component"), 
        canMatch: [authGuardCanMatch],
        children: [ 
        // {
        //   path: 'home', 
        //   canActivate: [authGuardCanActivate],
        //   loadComponent: () => import('./components/home/home.component'),
        //   data: { title: 'Página Principal' }
        // },
        { 
          path: 'register', 
          canActivate: [authGuardCanActivate],
          loadComponent: () => import('./components/register/register.component'), 
          data: { title: 'Registro de Usuarios' }
        },
        { 
          path: 'products', 
          canActivate: [authGuardCanActivate],
          loadComponent: () => import('./components/products/products.component'),
          data: { title: 'Agrega Tus Productos' }
        },
        { 
          path: 'add-products', 
          canActivate: [authGuardCanActivate],
          loadComponent: () => import('./components/add-product/add-product.component'),
          data: { title: 'Agrega Tus Productos' }
        },
        { 
          path: 'add-products/:id', 
          canActivate: [authGuardCanActivate],
          loadComponent: () => import('./components/add-product/add-product.component'),
          data: { title: 'Agregar Tus Productos' }
        },
        { 
          path: 'sale', 
          canActivate: [authGuardCanActivate],
          loadComponent: () => import('./components/sale/sale.component'),
          data: { title: 'Facturación de Productos' }
        },
        { 
          path: 'manageUsers', 
          canActivate: [authGuardCanActivate],
          loadComponent: () => import('./components/manage-users/manage-users.component'),
          data: { title: 'Administrar Usuarios' }
        },
        { 
          path: 'invoices', 
          canActivate: [authGuardCanActivate],
          loadComponent: () => import('./components/invoices/invoices.component'),
          data: { title: 'Historico de Facturas' }
        },
        { 
          path: 'reports', 
          canActivate: [authGuardCanActivate],
          loadComponent: () => import('./components/reports/reports.component'),
          data: { title: 'Descargar Reportes' }
        },
        { 
          path: 'variants', 
          canActivate: [authGuardCanActivate],
          loadComponent: () => import('./components/variants/variants.component'),
          data: { title: 'Administrar Variantes' }
        },
        { 
          path: 'variants/adm-variants', 
          canActivate: [authGuardCanActivate],
          loadComponent: () => import('./components/adm-variants/adm-variants.component'),
          data: { title: 'Agregar Variantes' }
        },
        { 
          path: 'variants/adm-variants/:id', 
          canActivate: [authGuardCanActivate],
          loadComponent: () => import('./components/adm-variants/adm-variants.component'),
          data: { title: 'Agregar Variantes' }
        },
        { 
          path: '**', 
          loadComponent: () => import('./components/sale/sale.component'),
          data: { title: 'Página Principal' }
        },
        ]
      },
      { path: 'login', component: LoginComponent },
    { path: '**', redirectTo: 'dashboard' }
];