import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { HomeComponent } from './components/home/home.component';
import { ProductsComponent } from './components/products/products.component';
import { LayoutComponent } from './shared/layout/layout.component';
import { RegisterComponent } from './components/register/register.component';

export const routes: Routes = [
    { path: '', // Ruta principal
    component: LayoutComponent, // Componente contenedor
    children: [
      { path: 'home', component: HomeComponent },
      { path: 'products', component: ProductsComponent },
      { path: 'users', component: LoginComponent },
      { path: 'register', component: RegisterComponent }
    ]
    },
    { path: '**', redirectTo: 'home' }
];