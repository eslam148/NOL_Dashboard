import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { 
  ApiResponse, 
  DashboardStatsDto, 
  DashboardFilterDto,
  ExportRequestDto,
  ReportUrlResponse
} from '../models/api.models';

@Injectable({
  providedIn: 'root'
})
export class DashboardApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.api.baseUrl}/admin/dashboard`;

  /**
   * Get dashboard statistics
   */
  getDashboardStats(filter?: DashboardFilterDto): Observable<DashboardStatsDto> {
    let params = new HttpParams();
    
    if (filter) {
      if (filter.startDate) params = params.set('startDate', filter.startDate);
      if (filter.endDate) params = params.set('endDate', filter.endDate);
      if (filter.branchId) params = params.set('branchId', filter.branchId.toString());
    }

    return this.http.get<ApiResponse<DashboardStatsDto>>(`${this.baseUrl}/stats`, { params }).pipe(
      map(response => {
        if (!response.succeeded) {
          throw new Error(response.message || 'Failed to fetch dashboard stats');
        }
        return response.data;
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Export dashboard report
   */
  exportDashboardReport(exportRequest: ExportRequestDto): Observable<ReportUrlResponse> {
    return this.http.post<ApiResponse<ReportUrlResponse>>(`${this.baseUrl}/export`, exportRequest).pipe(
      map(response => {
        if (!response.succeeded) {
          throw new Error(response.message || 'Failed to export dashboard report');
        }
        return response.data;
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Get revenue analytics
   */
  getRevenueAnalytics(filter?: DashboardFilterDto): Observable<any> {
    let params = new HttpParams();
    
    if (filter) {
      if (filter.startDate) params = params.set('startDate', filter.startDate);
      if (filter.endDate) params = params.set('endDate', filter.endDate);
      if (filter.branchId) params = params.set('branchId', filter.branchId.toString());
    }

    return this.http.get<ApiResponse<any>>(`${this.baseUrl}/revenue-analytics`, { params }).pipe(
      map(response => {
        if (!response.succeeded) {
          throw new Error(response.message || 'Failed to fetch revenue analytics');
        }
        return response.data;
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Get booking analytics
   */
  getBookingAnalytics(filter?: DashboardFilterDto): Observable<any> {
    let params = new HttpParams();
    
    if (filter) {
      if (filter.startDate) params = params.set('startDate', filter.startDate);
      if (filter.endDate) params = params.set('endDate', filter.endDate);
      if (filter.branchId) params = params.set('branchId', filter.branchId.toString());
    }

    return this.http.get<ApiResponse<any>>(`${this.baseUrl}/booking-analytics`, { params }).pipe(
      map(response => {
        if (!response.succeeded) {
          throw new Error(response.message || 'Failed to fetch booking analytics');
        }
        return response.data;
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Get car utilization analytics
   */
  getCarUtilizationAnalytics(filter?: DashboardFilterDto): Observable<any> {
    let params = new HttpParams();
    
    if (filter) {
      if (filter.startDate) params = params.set('startDate', filter.startDate);
      if (filter.endDate) params = params.set('endDate', filter.endDate);
      if (filter.branchId) params = params.set('branchId', filter.branchId.toString());
    }

    return this.http.get<ApiResponse<any>>(`${this.baseUrl}/car-utilization`, { params }).pipe(
      map(response => {
        if (!response.succeeded) {
          throw new Error(response.message || 'Failed to fetch car utilization analytics');
        }
        return response.data;
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Get customer analytics
   */
  getCustomerAnalytics(filter?: DashboardFilterDto): Observable<any> {
    let params = new HttpParams();
    
    if (filter) {
      if (filter.startDate) params = params.set('startDate', filter.startDate);
      if (filter.endDate) params = params.set('endDate', filter.endDate);
      if (filter.branchId) params = params.set('branchId', filter.branchId.toString());
    }

    return this.http.get<ApiResponse<any>>(`${this.baseUrl}/customer-analytics`, { params }).pipe(
      map(response => {
        if (!response.succeeded) {
          throw new Error(response.message || 'Failed to fetch customer analytics');
        }
        return response.data;
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Get real-time dashboard updates
   */
  getRealTimeUpdates(): Observable<any> {
    return this.http.get<ApiResponse<any>>(`${this.baseUrl}/real-time-updates`).pipe(
      map(response => {
        if (!response.succeeded) {
          throw new Error(response.message || 'Failed to fetch real-time updates');
        }
        return response.data;
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Get dashboard notifications
   */
  getDashboardNotifications(): Observable<any[]> {
    return this.http.get<ApiResponse<any[]>>(`${this.baseUrl}/notifications`).pipe(
      map(response => {
        if (!response.succeeded) {
          throw new Error(response.message || 'Failed to fetch notifications');
        }
        return response.data;
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Mark notification as read
   */
  markNotificationAsRead(notificationId: string): Observable<void> {
    return this.http.patch<ApiResponse<void>>(`${this.baseUrl}/notifications/${notificationId}/read`, {}).pipe(
      map(response => {
        if (!response.succeeded) {
          throw new Error(response.message || 'Failed to mark notification as read');
        }
        return response.data;
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Get system health status
   */
  getSystemHealth(): Observable<any> {
    return this.http.get<ApiResponse<any>>(`${this.baseUrl}/system-health`).pipe(
      map(response => {
        if (!response.succeeded) {
          throw new Error(response.message || 'Failed to fetch system health');
        }
        return response.data;
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Handle HTTP errors
   */
  private handleError(error: any): Observable<never> {
    let errorMessage = 'An unknown error occurred';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Error: ${error.error.message}`;
    } else {
      // Server-side error
      errorMessage = `Error Code: ${error.status}\nMessage: ${error.message}`;
      if (error.error && error.error.message) {
        errorMessage = error.error.message;
      }
    }
    
    if (environment.logging.enableApiLogging) {
      console.error('Dashboard API Error:', error);
    }
    
    return throwError(() => new Error(errorMessage));
  }
}
