import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthApiService } from '../services/auth-api.service';
import { environment } from '../../../environments/environment';

/**
 * Auth Interceptor - Automatically adds auth token to HTTP requests
 * and handles token refresh on 401 errors
 */
export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  const authService = inject(AuthApiService);
  const router = inject(Router);

  // Skip auth for certain URLs (login, register, public APIs)
  const skipAuth = shouldSkipAuth(req.url);
  
  if (skipAuth) {
    return next(req);
  }

  // Add auth token to request
  const token = authService.getToken();
  const authReq = token ? addAuthHeader(req, token) : req;

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      // Handle 401 Unauthorized errors
      if (error.status === 401 && token) {
        return handleUnauthorizedError(authReq, next, authService);
      }

      // Handle 403 Forbidden errors
      if (error.status === 403) {
        router.navigate(['/auth/unauthorized']);
      }

      return throwError(() => error);
    })
  );
};

/**
 * Add Authorization header to request
 */
function addAuthHeader(req: HttpRequest<unknown>, token: string): HttpRequest<unknown> {
  const headers: { [key: string]: string } = {
    'Authorization': `Bearer ${token}`,
    'Accept-Language': localStorage.getItem(environment.auth.languageKey) || 'en',
    'Accept': 'application/json'
  };

  // Only set Content-Type if it's not FormData (for file uploads)
  if (!(req.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  return req.clone({
    setHeaders: headers
  });
}

/**
 * Check if request should skip authentication
 */
function shouldSkipAuth(url: string): boolean {
  const skipUrls = [
    '/auth/login',
    '/auth/register',
    '/auth/refresh',
    '/auth/forgot-password',
    '/public'
  ];

  return skipUrls.some(skipUrl => url.includes(skipUrl));
}

/**
 * Handle 401 Unauthorized errors by attempting token refresh
 */
function handleUnauthorizedError(
  req: HttpRequest<unknown>, 
  next: HttpHandlerFn, 
  authService: AuthApiService
) {
  return authService.refreshToken().pipe(
    switchMap((authResponse) => {
      // Retry original request with new token
      const newAuthReq = addAuthHeader(req, authResponse.token);
      return next(newAuthReq);
    }),
    catchError((refreshError) => {
      // Refresh failed, logout user
      authService.logout();
      return throwError(() => refreshError);
    })
  );
}
