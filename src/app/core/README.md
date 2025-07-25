# NOL Dashboard Authentication System

This document provides a comprehensive guide to the authentication system implemented in the NOL Dashboard application.

## Overview

The authentication system includes:
- JWT-based authentication with refresh tokens
- Role-based access control (RBAC)
- Permission-based authorization
- Route guards for protecting pages
- HTTP interceptor for automatic token handling
- Reactive state management using Angular signals

## Architecture

### Core Components

1. **AuthService** (`src/app/core/services/auth.service.ts`)
   - Manages authentication state
   - Handles login/logout operations
   - Token management and refresh
   - User permissions and roles

2. **Auth Guards** (`src/app/core/guards/auth.guard.ts`)
   - Route protection
   - Role-based access control
   - Permission-based access control

3. **Auth Interceptor** (`src/app/core/interceptors/auth.interceptor.ts`)
   - Automatic token attachment
   - Token refresh on 401 errors

## User Roles and Permissions

### Roles
- **Admin**: Full system access
- **Manager**: Management tools and reports
- **User**: Basic read access

### Permissions
- `read`: View content
- `write`: Create/edit content
- `delete`: Delete content
- `manage_users`: User management
- `view_analytics`: Access to analytics

## Demo Credentials

For testing purposes, use these credentials:

```
Admin User:
Email: admin@nol.com
Password: password123
Permissions: read, write, delete, manage_users, view_analytics

Manager User:
Email: manager@nol.com
Password: password123
Permissions: read, write, view_analytics

Regular User:
Email: user@nol.com
Password: password123
Permissions: read
```

## Usage Examples

### Protecting Routes

```typescript
// Basic authentication
{
  path: 'dashboard',
  component: DashboardComponent,
  canActivate: [authGuard]
}

// Role-based protection
{
  path: 'admin',
  component: AdminComponent,
  canActivate: [adminGuard]
}

// Multiple roles
{
  path: 'reports',
  component: ReportsComponent,
  canActivate: [managerGuard] // Allows admin and manager
}

// Permission-based protection
{
  path: 'users',
  component: UsersComponent,
  canActivate: [permissionGuard(['manage_users'])]
}

// Custom role guard
{
  path: 'special',
  component: SpecialComponent,
  canActivate: [roleGuard(['admin', 'special_role'])]
}
```

### Using AuthService in Components

```typescript
import { Component } from '@angular/core';
import { AuthService } from '../core/services/auth.service';

@Component({
  template: `
    @if (authService.isAuthenticated()) {
      <p>Welcome, {{ authService.currentUser()?.name }}!</p>
      
      @if (authService.hasRole('admin')) {
        <button>Admin Panel</button>
      }
      
      @if (authService.hasPermission('write')) {
        <button>Create Content</button>
      }
    }
  `
})
export class MyComponent {
  constructor(public authService: AuthService) {}
}
```

### Login Implementation

```typescript
import { AuthService, LoginCredentials } from '../core/services/auth.service';

export class LoginComponent {
  constructor(private authService: AuthService) {}

  login(credentials: LoginCredentials) {
    this.authService.login(credentials).subscribe({
      next: (response) => {
        console.log('Login successful', response);
        // Redirect to dashboard
      },
      error: (error) => {
        console.error('Login failed', error);
      }
    });
  }
}
```

## Available Guards

### Basic Guards
- `authGuard`: Requires authentication
- `guestGuard`: Redirects authenticated users
- `authMatchGuard`: For lazy-loaded modules

### Role-based Guards
- `adminGuard`: Admin role only
- `managerGuard`: Admin or Manager roles
- `roleGuard(roles)`: Custom role guard factory

### Permission-based Guards
- `permissionGuard(permissions)`: Custom permission guard factory

### Utility Guards
- `canDeactivateGuard`: Prevents navigation with unsaved changes
- `routeDataGuard`: Uses route data for access control

## HTTP Interceptor

The auth interceptor automatically:
- Adds Bearer token to requests
- Handles 401 errors with token refresh
- Skips auth for public endpoints

### Configuring Skip URLs

Modify the `shouldSkipAuth` function in the interceptor:

```typescript
function shouldSkipAuth(url: string): boolean {
  const skipUrls = [
    '/auth/login',
    '/auth/register',
    '/public',
    // Add your public endpoints here
  ];
  return skipUrls.some(skipUrl => url.includes(skipUrl));
}
```

## State Management

The AuthService uses Angular signals for reactive state:

```typescript
// Reactive state
authService.isAuthenticated() // boolean signal
authService.currentUser()     // User | null signal
authService.isLoading()       // boolean signal

// Observable compatibility
authService.authState$        // BehaviorSubject<boolean>
```

## Security Features

1. **JWT Token Validation**: Basic client-side token expiry check
2. **Automatic Token Refresh**: Handles token renewal on 401 errors
3. **Secure Storage**: Uses localStorage (consider httpOnly cookies for production)
4. **Route Protection**: Multiple levels of access control
5. **Permission System**: Granular access control

## Production Considerations

### Security Enhancements
1. Replace localStorage with httpOnly cookies
2. Implement proper JWT validation on the server
3. Add CSRF protection
4. Use HTTPS in production
5. Implement rate limiting for login attempts

### API Integration
Replace the mock authentication in AuthService with real HTTP calls:

```typescript
login(credentials: LoginCredentials): Observable<AuthResponse> {
  return this.http.post<AuthResponse>('/api/auth/login', credentials);
}

refreshToken(): Observable<AuthResponse> {
  const refreshToken = this.getRefreshToken();
  return this.http.post<AuthResponse>('/api/auth/refresh', { refreshToken });
}
```

## Testing

### Unit Testing Guards

```typescript
describe('AuthGuard', () => {
  it('should allow access for authenticated users', () => {
    // Test implementation
  });

  it('should redirect unauthenticated users to login', () => {
    // Test implementation
  });
});
```

### Testing AuthService

```typescript
describe('AuthService', () => {
  it('should login successfully with valid credentials', () => {
    // Test implementation
  });

  it('should handle login errors', () => {
    // Test implementation
  });
});
```

## Troubleshooting

### Common Issues

1. **Infinite redirect loops**: Check guard logic and route configuration
2. **Token not attached**: Verify interceptor configuration
3. **Permission denied**: Check user roles and permissions
4. **Login not working**: Verify credentials and API endpoints

### Debug Tips

1. Check browser console for errors
2. Verify token in localStorage
3. Check network requests in DevTools
4. Use Angular DevTools for state inspection

## Migration Guide

If migrating from an existing auth system:

1. Update route guards to use new guard functions
2. Replace old auth service calls with new AuthService
3. Update components to use signals instead of observables
4. Configure the HTTP interceptor
5. Test all protected routes and permissions
