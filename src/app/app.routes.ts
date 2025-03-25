import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';

export const routes: Routes = [
    { path: '', // Ruta principal
    component: LoginComponent, // Componente contenedor
    },
      { path: 'dashboard', loadComponent: () => import ("./shared/layout/layout.component"), 
        children: [ 
        {
          path: 'home', loadComponent: () => import('./components/home/home.component'),
        },
        { 
          path: 'register', loadComponent: () => import('./components/register/register.component'), 
        },
        { 
          path: 'products', loadComponent: () => import('./components/products/products.component'),
        },
        ]
      },
      { path: 'login', component: LoginComponent },
    { path: '**', redirectTo: 'dashboard' }
];