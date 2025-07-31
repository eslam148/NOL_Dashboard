import { Injectable, signal, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, BehaviorSubject, of, throwError } from 'rxjs';
import { delay, map, catchError, tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { ApiResponse, LoginDto, AuthResponseDto } from '../models/api.models';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: string;
  preferredLanguage: 'Arabic' | 'English';
  permissions?: string[];
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refreshToken: string;
  expiresAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthApiService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  
  private readonly TOKEN_KEY = environment.auth.tokenKey;
  private readonly REFRESH_TOKEN_KEY = environment.auth.refreshTokenKey;
  private readonly USER_KEY = 'nol_user';
  private readonly API_URL = environment.api.baseUrl;

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

  constructor() {
    this.initializeAuth();
  }

  /**
   * Initialize authentication state from stored data
   */
  private initializeAuth(): void {
    const token = this.getToken();
    const userData = localStorage.getItem(this.USER_KEY);
    
    if (token && userData && this.isTokenValid(token)) {
      try {
        const user: User = JSON.parse(userData);
        this._currentUser.set(user);
        this.authStateSubject.next(true);
      } catch (error) {
        this.clearAuthData();
      }
    } else {
      this.clearAuthData();
    }
  }

  /**
   * Login user with credentials
   */
  login(credentials: LoginCredentials): Observable<AuthResponse> {
    this._isLoading.set(true);

    const loginDto: LoginDto = {
      email: credentials.email,
      password: credentials.password
    };

    return this.http.post<ApiResponse<AuthResponseDto>>(`${this.API_URL}/auth/login`, loginDto).pipe(
      map((apiResponse) => {
        if (!apiResponse.succeeded) {
          throw new Error(apiResponse.message || 'Login failed');
        }
        
        const authData = apiResponse.data;
        const user: User = {
          id: authData.user.id,
          email: authData.user.email,
          fullName: authData.user.fullName,
          role: authData.user.role,
          preferredLanguage: authData.user.preferredLanguage
        };
        
        const response: AuthResponse = {
          user,
          token: authData.token,
          refreshToken: authData.refreshToken,
          expiresAt: authData.expiresAt
        };
        
        this.setAuthData(response);
        this._currentUser.set(response.user);
        this._isLoading.set(false);
        this.authStateSubject.next(true);
        return response;
      }),
      catchError((error: HttpErrorResponse) => {
        this._isLoading.set(false);
        const errorMessage = error.error?.message || error.message || 'Login failed';
        return throwError(() => new Error(errorMessage));
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

    return this.http.post<ApiResponse<AuthResponseDto>>(`${this.API_URL}/auth/refresh`, { refreshToken }).pipe(
      map((apiResponse) => {
        if (!apiResponse.succeeded) {
          throw new Error(apiResponse.message || 'Token refresh failed');
        }
        
        const authData = apiResponse.data;
        const user: User = {
          id: authData.user.id,
          email: authData.user.email,
          fullName: authData.user.fullName,
          role: authData.user.role,
          preferredLanguage: authData.user.preferredLanguage
        };
        
        const response: AuthResponse = {
          user,
          token: authData.token,
          refreshToken: authData.refreshToken,
          expiresAt: authData.expiresAt
        };
        
        this.setAuthData(response);
        this._currentUser.set(response.user);
        this.authStateSubject.next(true);
        return response;
      }),
      catchError((error: HttpErrorResponse) => {
        this.logout();
        const errorMessage = error.error?.message || error.message || 'Token refresh failed';
        return throwError(() => new Error(errorMessage));
      })
    );
  }

  /**
   * Check if user has specific permission
   */
  hasPermission(permission: string): boolean {
    const user = this._currentUser();
    return user?.permissions?.includes(permission) || false;
  }

  /**
   * Check if user has specific role
   */
  hasRole(role: string): boolean {
    const user = this._currentUser();
    return user?.role === role;
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
  getRefreshToken(): string | null {
    return localStorage.getItem(this.REFRESH_TOKEN_KEY);
  }

  /**
   * Set authentication data in storage
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
   * Check if token is valid (not expired)
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
   * Check if token is expired
   */
  private isTokenExpired(token: string): boolean {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Math.floor(Date.now() / 1000);
      return payload.exp < currentTime;
    } catch {
      return true;
    }
  }

  /**
   * Get user role from token
   */
  getUserRole(): string | null {
    const token = this.getToken();
    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload.role || null;
    } catch {
      return null;
    }
  }
}
