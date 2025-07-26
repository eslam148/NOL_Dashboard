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
        path: 'bookings/new',
        loadComponent: () => import('./features/car-rental/bookings/booking-form/booking-form.component').then(m => m.BookingFormComponent)
      },
      {
        path: 'bookings/:id/edit',
        loadComponent: () => import('./features/car-rental/bookings/booking-form/booking-form.component').then(m => m.BookingFormComponent)
      },
      {
        path: 'bookings/new',
        loadComponent: () => import('./features/car-rental/bookings/booking-form/booking-form.component').then(m => m.BookingFormComponent)
      },
      {
        path: 'bookings/:id',
        loadComponent: () => import('./features/car-rental/bookings/booking-detail/booking-detail.component').then(m => m.BookingDetailComponent)
      },
      {
        path: 'bookings/:id/edit',
        loadComponent: () => import('./features/car-rental/bookings/booking-form/booking-form.component').then(m => m.BookingFormComponent)
      },
      {
        path: 'advertisements',
        loadComponent: () => import('./features/car-rental/advertisements/advertisements-list/advertisements-list.component').then(m => m.AdvertisementsListComponent)
      },
      {
        path: 'advertisements/new',
        loadComponent: () => import('./features/car-rental/advertisements/advertisement-form/advertisement-form.component').then(m => m.AdvertisementFormComponent)
      },
      {
        path: 'advertisements/:id',
        loadComponent: () => import('./features/car-rental/advertisements/advertisement-detail/advertisement-detail.component').then(m => m.AdvertisementDetailComponent)
      },
      {
        path: 'advertisements/:id/edit',
        loadComponent: () => import('./features/car-rental/advertisements/advertisement-form/advertisement-form.component').then(m => m.AdvertisementFormComponent)
      },
      {
        path: 'customers',
        loadComponent: () => import('./features/car-rental/customers/customers.component').then(m => m.CustomersComponent)
      },
      {
        path: 'customers/new',
        loadComponent: () => import('./features/car-rental/customers/customer-form/customer-form.component').then(m => m.CustomerFormComponent)
      },
      {
        path: 'customers/:id',
        loadComponent: () => import('./features/car-rental/customers/customer-detail/customer-detail.component').then(m => m.CustomerDetailComponent)
      },
      {
        path: 'customers/:id/edit',
        loadComponent: () => import('./features/car-rental/customers/customer-form/customer-form.component').then(m => m.CustomerFormComponent)
      },
      {
        path: 'customers/new',
        loadComponent: () => import('./features/car-rental/customers/customer-form/customer-form.component').then(m => m.CustomerFormComponent)
      },
      {
        path: 'customers/:id',
        loadComponent: () => import('./features/car-rental/customers/customer-detail/customer-detail.component').then(m => m.CustomerDetailComponent)
      },
      {
        path: 'customers/:id/edit',
        loadComponent: () => import('./features/car-rental/customers/customer-form/customer-form.component').then(m => m.CustomerFormComponent)
      },
      {
        path: 'services',
        loadComponent: () => import('./features/car-rental/services/services.component').then(m => m.ServicesComponent)
      },
      {
        path: 'services/new',
        loadComponent: () => import('./features/car-rental/services/service-form/service-form.component').then(m => m.ServiceFormComponent)
      },
      {
        path: 'services/:id',
        loadComponent: () => import('./features/car-rental/services/service-detail/service-detail.component').then(m => m.ServiceDetailComponent)
      },
      {
        path: 'services/:id/edit',
        loadComponent: () => import('./features/car-rental/services/service-form/service-form.component').then(m => m.ServiceFormComponent)
      },
      {
        path: 'admin-users',
        loadComponent: () => import('./features/car-rental/admin-users/admin-users.component').then(m => m.AdminUsersComponent)
      },
      {
        path: 'admin-users/new',
        loadComponent: () => import('./features/car-rental/admin-users/admin-user-form/admin-user-form.component').then(m => m.AdminUserFormComponent)
      },
      {
        path: 'admin-users/:id',
        loadComponent: () => import('./features/car-rental/admin-users/admin-user-detail/admin-user-detail.component').then(m => m.AdminUserDetailComponent)
      },
      {
        path: 'admin-users/:id/edit',
        loadComponent: () => import('./features/car-rental/admin-users/admin-user-form/admin-user-form.component').then(m => m.AdminUserFormComponent)
      },
      {
        path: 'admin-users/new',
        loadComponent: () => import('./features/car-rental/admin-users/admin-form/admin-form.component').then(m => m.AdminFormComponent)
      },
      {
        path: 'admin-users/:id',
        loadComponent: () => import('./features/car-rental/admin-users/admin-detail/admin-detail.component').then(m => m.AdminDetailComponent)
      },
      {
        path: 'admin-users/:id/edit',
        loadComponent: () => import('./features/car-rental/admin-users/admin-form/admin-form.component').then(m => m.AdminFormComponent)
      }
    ]
  },

  // Catch-all route - must be last
  {
    path: '**',
    redirectTo: '/dashboard'
  }
];
