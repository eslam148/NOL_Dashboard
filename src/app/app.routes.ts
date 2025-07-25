import { Routes } from '@angular/router';
import { authGuard, guestGuard, adminGuard, managerGuard } from './core/guards';
import { LoginComponent } from './features/auth/login/login.component';
import { UnauthorizedComponent } from './features/auth/unauthorized/unauthorized.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';

export const routes: Routes = [
  // Default redirect to dashboard
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },

  // Auth routes (accessible only to guests)
  {
    path: 'auth/login',
    component: LoginComponent,
    canActivate: [guestGuard],
    title: 'Login - NOL Dashboard'
  },

  // Dashboard route (requires authentication)
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [authGuard],
    title: 'Dashboard - NOL Dashboard'
  },

  // Unauthorized page
  {
    path: 'unauthorized',
    component: UnauthorizedComponent,
    title: 'Access Denied - NOL Dashboard'
  },

  // Example protected routes with different access levels
  {
    path: 'admin',
    canActivate: [adminGuard],
    children: [
      {
        path: '',
        loadComponent: () => import('./features/admin/admin.component').then(m => m.AdminComponent),
        title: 'Admin Panel - NOL Dashboard'
      },
      {
        path: 'users',
        loadComponent: () => import('./features/admin/users/users.component').then(m => m.UsersComponent),
        title: 'User Management - NOL Dashboard'
      }
    ]
  },

  {
    path: 'reports',
    canActivate: [managerGuard], // Accessible to both admin and manager
    loadComponent: () => import('./features/reports/reports.component').then(m => m.ReportsComponent),
    title: 'Reports - NOL Dashboard'
  },

  // Catch-all route - must be last
  {
    path: '**',
    redirectTo: '/dashboard'
  }
];
