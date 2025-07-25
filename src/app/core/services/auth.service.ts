import { Injectable, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, BehaviorSubject, of, throwError } from 'rxjs';
import { delay, map, catchError } from 'rxjs/operators';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user' | 'manager';
  permissions: string[];
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
  expiresIn: number;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly TOKEN_KEY = 'nol_auth_token';
  private readonly REFRESH_TOKEN_KEY = 'nol_refresh_token';
  private readonly USER_KEY = 'nol_user';

  // Signals for reactive state management
  private _currentUser = signal<User | null>(null);
  private _isLoading = signal<boolean>(false);
  private _isAuthenticated = computed(() => !!this._currentUser());

  // Public readonly signals
  public readonly currentUser = this._currentUser.asReadonly();
  public readonly isLoading = this._isLoading.asReadonly();
  public readonly isAuthenticated = this._isAuthenticated;

  // BehaviorSubject for compatibility with observables
  private authStateSubject = new BehaviorSubject<boolean>(false);
  public authState$ = this.authStateSubject.asObservable();

  constructor(private router: Router) {
    this.initializeAuth();
  }

  /**
   * Initialize authentication state from localStorage
   */
  private initializeAuth(): void {
    const token = this.getToken();
    const user = this.getStoredUser();

    if (token && user && this.isTokenValid(token)) {
      this._currentUser.set(user);
      this.authStateSubject.next(true);
    } else {
      this.clearAuthData();
    }
  }

  /**
   * Login with email and password
   */
  login(credentials: LoginCredentials): Observable<AuthResponse> {
    this._isLoading.set(true);

    // Simulate API call - replace with actual HTTP call
    return this.simulateLogin(credentials).pipe(
      map((response: AuthResponse) => {
        this.setAuthData(response);
        this._currentUser.set(response.user);
        this._isLoading.set(false);
        this.authStateSubject.next(true);
        return response;
      }),
      catchError((error) => {
        this._isLoading.set(false);
        return throwError(() => error);
      })
    );
  }

  /**
   * Logout user and clear authentication data
   */
  logout(): void {
    this.clearAuthData();
    this._currentUser.set(null);
    this.authStateSubject.next(false);
    this.router.navigate(['/auth/login']);
  }

  /**
   * Refresh authentication token
   */
  refreshToken(): Observable<AuthResponse> {
    const refreshToken = this.getRefreshToken();
    
    if (!refreshToken) {
      return throwError(() => new Error('No refresh token available'));
    }

    // Simulate refresh token API call
    return this.simulateRefreshToken(refreshToken).pipe(
      map((response: AuthResponse) => {
        this.setAuthData(response);
        this._currentUser.set(response.user);
        this.authStateSubject.next(true);
        return response;
      }),
      catchError((error) => {
        this.logout();
        return throwError(() => error);
      })
    );
  }

  /**
   * Check if user has specific permission
   */
  hasPermission(permission: string): boolean {
    const user = this._currentUser();
    return user?.permissions.includes(permission) || false;
  }

  /**
   * Check if user has specific role
   */
  hasRole(role: string): boolean {
    const user = this._currentUser();
    return user?.role === role;
  }

  /**
   * Check if user has any of the specified roles
   */
  hasAnyRole(roles: string[]): boolean {
    const user = this._currentUser();
    return user ? roles.includes(user.role) : false;
  }

  /**
   * Get current authentication token
   */
  getToken(): string | null {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  /**
   * Get refresh token
   */
  private getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  /**
   * Get stored user data
   */
  private getStoredUser(): User | null {
    const userData = localStorage.getItem(this.USER_KEY);
    return userData ? JSON.parse(userData) : null;
  }

  /**
   * Set authentication data in localStorage
   */
  private setAuthData(authResponse: AuthResponse): void {
    localStorage.setItem(this.TOKEN_KEY, authResponse.token);
    localStorage.setItem(this.REFRESH_TOKEN_KEY, authResponse.refreshToken);
    localStorage.setItem(this.USER_KEY, JSON.stringify(authResponse.user));
  }

  /**
   * Clear all authentication data
   */
  private clearAuthData(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.REFRESH_TOKEN_KEY);
    localStorage.removeItem(this.USER_KEY);
  }

  /**
   * Check if token is valid (basic check - in real app, verify with server)
   */
  private isTokenValid(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      return payload.exp > currentTime;
    } catch {
      return false;
    }
  }

  /**
   * Simulate login API call - replace with actual HTTP service
   */
  private simulateLogin(credentials: LoginCredentials): Observable<AuthResponse> {
    // Mock users for demonstration
    const mockUsers: { [key: string]: User } = {
      'admin@nol.com': {
        id: '1',
        email: 'admin@nol.com',
        name: 'Admin User',
        role: 'admin',
        permissions: ['read', 'write', 'delete', 'manage_users', 'view_analytics']
      },
      'user@nol.com': {
        id: '2',
        email: 'user@nol.com',
        name: 'Regular User',
        role: 'user',
        permissions: ['read']
      },
      'manager@nol.com': {
        id: '3',
        email: 'manager@nol.com',
        name: 'Manager User',
        role: 'manager',
        permissions: ['read', 'write', 'view_analytics']
      }
    };

    return of(null).pipe(
      delay(1000), // Simulate network delay
      map(() => {
        const user = mockUsers[credentials.email];
        
        if (!user || credentials.password !== 'password123') {
          throw new Error('Invalid credentials');
        }

        // Generate mock JWT token
        const token = this.generateMockToken(user);
        const refreshToken = this.generateMockRefreshToken(user);

        return {
          user,
          token,
          refreshToken,
          expiresIn: 3600 // 1 hour
        };
      })
    );
  }

  /**
   * Simulate refresh token API call
   */
  private simulateRefreshToken(refreshToken: string): Observable<AuthResponse> {
    return of(null).pipe(
      delay(500),
      map(() => {
        // In real app, validate refresh token with server
        const user = this._currentUser();
        if (!user) {
          throw new Error('Invalid refresh token');
        }

        const newToken = this.generateMockToken(user);
        const newRefreshToken = this.generateMockRefreshToken(user);

        return {
          user,
          token: newToken,
          refreshToken: newRefreshToken,
          expiresIn: 3600
        };
      })
    );
  }

  /**
   * Generate mock JWT token for demonstration
   */
  private generateMockToken(user: User): string {
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payload = btoa(JSON.stringify({
      sub: user.id,
      email: user.email,
      role: user.role,
      exp: Math.floor(Date.now() / 1000) + 3600 // 1 hour
    }));
    const signature = btoa('mock-signature');
    
    return `${header}.${payload}.${signature}`;
  }

  /**
   * Generate mock refresh token
   */
  private generateMockRefreshToken(user: User): string {
    return btoa(`refresh-${user.id}-${Date.now()}`);
  }
}
