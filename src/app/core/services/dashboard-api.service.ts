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
      if (filter.period) params = params.set('period', filter.period);
    }

    return this.http.get<ApiResponse<DashboardStatsDto>>(`${this.baseUrl}/stats`, { params }).pipe(
      map(response => {
        // Add debugging logs
        if (environment.logging.enableApiLogging) {
          console.log('Dashboard Stats API Response:', response);
        }

        if (!response) {
          throw new Error('No response received from dashboard stats API');
        }

        if (!response.succeeded) {
          throw new Error(response.message || 'Failed to fetch dashboard stats');
        }

        return response.data;
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Get real-time dashboard data
   */
  getRealTimeData(): Observable<DashboardStatsDto> {
    return this.http.get<ApiResponse<DashboardStatsDto>>(`${this.baseUrl}/realtime`).pipe(
      map(response => {
        if (!response.succeeded) {
          throw new Error(response.message || 'Failed to fetch real-time data');
        }
        return response.data;
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Export dashboard report
   */
  exportDashboardReport(exportRequest: ExportRequestDto): Observable<Blob> {
    return this.http.post(`${this.baseUrl}/export`, exportRequest, {
      responseType: 'blob'
    }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Get dashboard report URL
   */
  getDashboardReportUrl(format: 'pdf' | 'excel', filter?: DashboardFilterDto): Observable<ReportUrlResponse> {
    let params = new HttpParams().set('format', format);

    const requestBody = filter || {};

    return this.http.post<ApiResponse<ReportUrlResponse>>(`${this.baseUrl}/report-url`, requestBody, { params }).pipe(
      map(response => {
        if (!response.succeeded) {
          throw new Error(response.message || 'Failed to get report URL');
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
      if (filter.period) params = params.set('period', filter.period);
    }

    return this.http.get<ApiResponse<any>>(`${this.baseUrl}/stats/revenue`, { params }).pipe(
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
   * Get popular cars
   */
  getPopularCars(count: number = 10, filter?: DashboardFilterDto): Observable<any[]> {
    let params = new HttpParams().set('count', count.toString());

    if (filter) {
      if (filter.startDate) params = params.set('startDate', filter.startDate);
      if (filter.endDate) params = params.set('endDate', filter.endDate);
      if (filter.branchId) params = params.set('branchId', filter.branchId.toString());
    }

    return this.http.get<ApiResponse<any[]>>(`${this.baseUrl}/popular-cars`, { params }).pipe(
      map(response => {
        if (!response.succeeded) {
          throw new Error(response.message || 'Failed to fetch popular cars');
        }
        return response.data || [];
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Get recent bookings
   */
  getRecentBookings(count: number = 10): Observable<any[]> {
    let params = new HttpParams().set('count', count.toString());

    return this.http.get<ApiResponse<any[]>>(`${this.baseUrl}/recent-bookings`, { params }).pipe(
      map(response => {
        if (!response.succeeded) {
          throw new Error(response.message || 'Failed to fetch recent bookings');
        }
        return response.data || [];
      }),
      catchError(this.handleError)
    );
  }



  /**
   * Handle HTTP errors
   */
  private handleError(error: any): Observable<never> {
    let errorMessage = 'An unknown error occurred';

    if (environment.logging.enableApiLogging) {
      console.error('🔍 Full Dashboard API Error:', error);
      console.error('🔍 Error Status:', error.status);
      console.error('🔍 Error URL:', error.url);
    }

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Client Error: ${error.error.message}`;
    } else {
      // Server-side error
      if (error.status === 0) {
        errorMessage = 'Network error - Unable to connect to the Dashboard API server.';
      } else if (error.status === 401) {
        errorMessage = 'Unauthorized - Please check your authentication token.';
      } else if (error.status === 403) {
        errorMessage = 'Forbidden - You do not have permission to access this resource.';
      } else if (error.status === 404) {
        errorMessage = 'Not Found - The requested dashboard endpoint was not found.';
      } else if (error.status >= 500) {
        errorMessage = `Server Error (${error.status}) - ${error.message || 'Internal server error'}`;
      } else {
        errorMessage = `HTTP Error ${error.status}: ${error.message}`;
        if (error.error && error.error.message) {
          errorMessage = error.error.message;
        }
      }
    }

    if (environment.logging.enableApiLogging) {
      console.error('❌ Dashboard API Error Message:', errorMessage);
    }

    return throwError(() => new Error(errorMessage));
  }
}
