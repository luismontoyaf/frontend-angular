import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';

export const routes: Routes = [
    { path: '', // Ruta principal
    component: LoginComponent, // Componente contenedor
    },
      { path: 'dashboard', loadComponent: () => import ("./shared/layout/layout.component"), 
        children: [ 
        {
          path: 'home', 
          loadComponent: () => import('./components/home/home.component'),
          data: { title: 'Página Principal' }
        },
        { 
          path: 'register', 
          loadComponent: () => import('./components/register/register.component'), 
          data: { title: 'Registro de Usuarios' }
        },
        { 
          path: 'products', 
          loadComponent: () => import('./components/products/products.component'),
          data: { title: 'Agrega Tus Productos' }
        },
        { 
          path: 'sale', 
          loadComponent: () => import('./components/sale/sale.component'),
          data: { title: 'Facturación de Productos' }
        },
        { 
          path: 'manageUsers', 
          loadComponent: () => import('./components/manage-users/manage-users.component'),
          data: { title: 'Administracion de Usuarios' }
        },
        { 
          path: 'invoices', 
          loadComponent: () => import('./components/sale/sale.component'),
          data: { title: 'Historico de Facturas' }
        },
        { 
          path: '**', 
          loadComponent: () => import('./components/home/home.component'),
          data: { title: 'Página Principal' }
        },
        ]
      },
      { path: 'login', component: LoginComponent },
    { path: '**', redirectTo: 'dashboard' }
];