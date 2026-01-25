import { Routes } from '@angular/router';
import { authGuard, roleGuard } from './core/guards';
import { AccessDeniedComponent } from './shared/components/access-denied/access-denied.component';

export const routes: Routes = [
  // Public routes (no guards) - components to be created in Phase 4
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

  // Admin routes (auth + role) - to be fully configured in Phase 5
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
    ],
  },

  // Default redirect
  { path: '', redirectTo: '/login', pathMatch: 'full' },

  // Wildcard - redirect unknown routes
  { path: '**', redirectTo: '/login' },
];
