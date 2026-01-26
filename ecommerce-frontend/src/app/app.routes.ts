import { Routes } from '@angular/router';
import { authGuard, roleGuard } from './core/guards';
import { AccessDeniedComponent } from './shared/components/access-denied/access-denied.component';

export const routes: Routes = [
  // Public routes (no guards)
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then(
        (m) => m.LoginComponent
      ),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./features/auth/register/register.component').then(
        (m) => m.RegisterComponent
      ),
  },

  // Access denied page
  { path: 'access-denied', component: AccessDeniedComponent },

  // Protected user routes (auth only)
  {
    path: 'products',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/products/products-page.component').then(
        (m) => m.ProductsPageComponent
      ),
  },

  // Admin routes (auth + role)
  {
    path: 'admin',
    canActivate: [authGuard, roleGuard],
    data: { roles: ['ADMIN'] },
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import(
            './features/admin/dashboard/admin-dashboard.component'
          ).then((m) => m.AdminDashboardComponent),
      },
      {
        path: 'products',
        loadComponent: () =>
          import(
            './features/admin/products/product-management.component'
          ).then((m) => m.ProductManagementComponent),
      },
      {
        path: 'orders',
        loadComponent: () =>
          import(
            './features/admin/orders/order-management.component'
          ).then((m) => m.OrderManagementComponent),
      },
      {
        path: 'users',
        loadComponent: () =>
          import('./features/admin/users/user-management.component').then(
            (m) => m.UserManagementComponent
          ),
      },
    ],
  },

  // Default redirect
  { path: '', redirectTo: '/login', pathMatch: 'full' },

  // Wildcard - redirect unknown routes
  { path: '**', redirectTo: '/login' },
];
