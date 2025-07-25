import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { CanActivateFn, CanMatchFn, CanDeactivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

/**
 * Auth Guard - Protects routes that require authentication
 * Usage: { path: 'dashboard', component: DashboardComponent, canActivate: [authGuard] }
 */
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  // Store the attempted URL for redirecting after login
  const returnUrl = state.url;
  router.navigate(['/auth/login'], { 
    queryParams: { returnUrl },
    replaceUrl: true 
  });
  
  return false;
};

/**
 * Auth Guard for lazy-loaded modules
 * Usage: { path: 'admin', loadChildren: () => import('./admin/admin.module'), canMatch: [authMatchGuard] }
 */
export const authMatchGuard: CanMatchFn = (route, segments) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated()) {
    return true;
  }

  // Construct the attempted URL from segments
  const attemptedUrl = '/' + segments.map(segment => segment.path).join('/');
  router.navigate(['/auth/login'], { 
    queryParams: { returnUrl: attemptedUrl },
    replaceUrl: true 
  });
  
  return false;
};

/**
 * Guest Guard - Redirects authenticated users away from auth pages
 * Usage: { path: 'login', component: LoginComponent, canActivate: [guestGuard] }
 */
export const guestGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    return true;
  }

  // Redirect authenticated users to dashboard
  router.navigate(['/dashboard'], { replaceUrl: true });
  return false;
};

/**
 * Role-based Guard Factory - Creates guards for specific roles
 * Usage: { path: 'admin', component: AdminComponent, canActivate: [roleGuard(['admin'])] }
 */
export function roleGuard(allowedRoles: string[]): CanActivateFn {
  return (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (!authService.isAuthenticated()) {
      router.navigate(['/auth/login'], { 
        queryParams: { returnUrl: state.url },
        replaceUrl: true 
      });
      return false;
    }

    if (authService.hasAnyRole(allowedRoles)) {
      return true;
    }

    // Redirect to unauthorized page or dashboard
    router.navigate(['/unauthorized'], { replaceUrl: true });
    return false;
  };
}

/**
 * Permission-based Guard Factory - Creates guards for specific permissions
 * Usage: { path: 'users', component: UsersComponent, canActivate: [permissionGuard(['manage_users'])] }
 */
export function permissionGuard(requiredPermissions: string[]): CanActivateFn {
  return (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (!authService.isAuthenticated()) {
      router.navigate(['/auth/login'], { 
        queryParams: { returnUrl: state.url },
        replaceUrl: true 
      });
      return false;
    }

    // Check if user has all required permissions
    const hasAllPermissions = requiredPermissions.every(permission => 
      authService.hasPermission(permission)
    );

    if (hasAllPermissions) {
      return true;
    }

    // Redirect to unauthorized page
    router.navigate(['/unauthorized'], { replaceUrl: true });
    return false;
  };
}

/**
 * Admin Guard - Shorthand for admin role guard
 * Usage: { path: 'admin', component: AdminComponent, canActivate: [adminGuard] }
 */
export const adminGuard: CanActivateFn = roleGuard(['admin']);

/**
 * Manager Guard - Allows both admin and manager roles
 * Usage: { path: 'reports', component: ReportsComponent, canActivate: [managerGuard] }
 */
export const managerGuard: CanActivateFn = roleGuard(['admin', 'manager']);

/**
 * Can Deactivate Guard for forms with unsaved changes
 * Usage: { path: 'edit', component: EditComponent, canDeactivate: [canDeactivateGuard] }
 */
export interface CanComponentDeactivate {
  canDeactivate(): boolean | Promise<boolean>;
}

export const canDeactivateGuard: CanDeactivateFn<CanComponentDeactivate> = (component) => {
  if (component && typeof component.canDeactivate === 'function') {
    return component.canDeactivate();
  }
  return true;
};

/**
 * Route Data Guard - Checks route data for additional security
 * Usage in route: { path: 'secure', component: SecureComponent, data: { requiresAuth: true, roles: ['admin'] } }
 */
export const routeDataGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const routeData = route.data;

  // Check if route requires authentication
  if (routeData['requiresAuth'] && !authService.isAuthenticated()) {
    router.navigate(['/auth/login'], { 
      queryParams: { returnUrl: state.url },
      replaceUrl: true 
    });
    return false;
  }

  // Check role requirements
  if (routeData['roles'] && !authService.hasAnyRole(routeData['roles'])) {
    router.navigate(['/unauthorized'], { replaceUrl: true });
    return false;
  }

  // Check permission requirements
  if (routeData['permissions']) {
    const hasAllPermissions = routeData['permissions'].every((permission: string) => 
      authService.hasPermission(permission)
    );
    
    if (!hasAllPermissions) {
      router.navigate(['/unauthorized'], { replaceUrl: true });
      return false;
    }
  }

  return true;
};
