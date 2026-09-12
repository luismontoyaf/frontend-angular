import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { authGuardCanActivate, authGuardCanMatch } from './guards/auth.guard';

export const routes: Routes = [

  {
    path: '',
    loadComponent: () => import('./landing-lumo/landing-lumo.component')
  },
  {
    path: 'invalid-tenant',
    loadComponent: () => import('./shared/invalid-tenant/invalid-tenant.component')
  },
  {
    path: ':tenantId',
    children: [
      {
        path: '',
        component: LoginComponent
      },
      {
        path: 'dashboard',
        loadComponent: () => import("./shared/layout/layout.component"),
        canMatch: [authGuardCanMatch],
        children: [
          {
            path: 'home',
            canActivate: [authGuardCanActivate],
            loadComponent: () => import('./components/home/home.component'),
          },
          {
            path: 'register/registerEmployee',
            canActivate: [authGuardCanActivate],
            loadComponent: () => import('./components/register/register.component'),
          },
          {
            path: 'register/registerClient',
            canActivate: [authGuardCanActivate],
            loadComponent: () => import('./components/register-client/register-client.component'),
          },
          {
            path: 'products',
            canActivate: [authGuardCanActivate],
            loadComponent: () => import('./components/products/products.component'),
          },
          {
            path: 'add-products',
            canActivate: [authGuardCanActivate],
            loadComponent: () => import('./components/add-product/add-product.component'),
          },
          {
            path: 'add-products/:id',
            canActivate: [authGuardCanActivate],
            loadComponent: () => import('./components/add-product/add-product.component'),
          },
          {
            path: 'sale',
            canActivate: [authGuardCanActivate],
            loadComponent: () => import('./components/sale/sale.component'),
          },
          {
            path: 'manageUsers',
            canActivate: [authGuardCanActivate],
            loadComponent: () => import('./components/manage-users/manage-users.component'),
          },
          {
            path: 'invoices',
            canActivate: [authGuardCanActivate],
            loadComponent: () => import('./components/invoices/invoices.component'),
          },
          {
            path: 'reports',
            canActivate: [authGuardCanActivate],
            loadComponent: () => import('./components/reports/reports.component'),
          },
          {
            path: 'variants',
            canActivate: [authGuardCanActivate],
            loadComponent: () => import('./components/variants/variants.component'),
          },
          {
            path: 'variants/adm-variants',
            canActivate: [authGuardCanActivate],
            loadComponent: () => import('./components/adm-variants/adm-variants.component'),
          },
          {
            path: 'variants/adm-variants/:id',
            canActivate: [authGuardCanActivate],
            loadComponent: () => import('./components/adm-variants/adm-variants.component'),
          },
          {
            path: 'expenses',
            canActivate: [authGuardCanActivate],
            loadComponent: () => import('./components/expenses/expenses.component'),
          },
          {
            path: 'support',
            canActivate: [authGuardCanActivate],
            loadComponent: () => import('./components/support/support.component'),
          },
          {
            path: '**',
            redirectTo: 'sale'
          }
        ]
      }
    ]
  },

  {
    path: '**',
    redirectTo: ''
  }
];