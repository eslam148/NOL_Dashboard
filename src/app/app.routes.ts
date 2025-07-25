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

  // Car Rental Management System
  {
    path: 'car-rental',
    canActivate: [authGuard],
    loadComponent: () => import('./features/car-rental/dashboard/dashboard.component').then(m => m.CarRentalDashboardComponent),
    title: 'Car Rental Management - NOL Dashboard',
    children: [
      {
        path: '',
        redirectTo: 'overview',
        pathMatch: 'full'
      },
      {
        path: 'overview',
        loadComponent: () => import('./features/car-rental/overview/overview.component').then(m => m.OverviewComponent)
      },
      {
        path: 'branches',
        loadComponent: () => import('./features/car-rental/branches/branches-list/branches-list.component').then(m => m.BranchesListComponent)
      },
      {
        path: 'branches/new',
        loadComponent: () => import('./features/car-rental/branches/branch-form/branch-form.component').then(m => m.BranchFormComponent)
      },
      {
        path: 'branches/:id',
        loadComponent: () => import('./features/car-rental/branches/branch-detail/branch-detail.component').then(m => m.BranchDetailComponent)
      },
      {
        path: 'branches/:id/edit',
        loadComponent: () => import('./features/car-rental/branches/branch-form/branch-form.component').then(m => m.BranchFormComponent)
      },
      {
        path: 'vehicles',
        loadComponent: () => import('./features/car-rental/vehicles/vehicles-list/vehicles-list.component').then(m => m.VehiclesListComponent)
      },
      {
        path: 'vehicles/new',
        loadComponent: () => import('./features/car-rental/vehicles/vehicle-form/vehicle-form.component').then(m => m.VehicleFormComponent)
      },
      {
        path: 'vehicles/:id',
        loadComponent: () => import('./features/car-rental/vehicles/vehicle-detail/vehicle-detail.component').then(m => m.VehicleDetailComponent)
      },
      {
        path: 'vehicles/:id/edit',
        loadComponent: () => import('./features/car-rental/vehicles/vehicle-form/vehicle-form.component').then(m => m.VehicleFormComponent)
      },
      {
        path: 'bookings',
        loadComponent: () => import('./features/car-rental/bookings/bookings.component').then(m => m.BookingsComponent)
      },
      {
        path: 'customers',
        loadComponent: () => import('./features/car-rental/customers/customers.component').then(m => m.CustomersComponent)
      },
      {
        path: 'services',
        loadComponent: () => import('./features/car-rental/services/services.component').then(m => m.ServicesComponent)
      },
      {
        path: 'admin-users',
        loadComponent: () => import('./features/car-rental/admin-users/admin-users.component').then(m => m.AdminUsersComponent)
      }
    ]
  },

  // Catch-all route - must be last
  {
    path: '**',
    redirectTo: '/dashboard'
  }
];
