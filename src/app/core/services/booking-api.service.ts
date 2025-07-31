import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { 
  ApiResponse, 
  PaginatedResponse,
  AdminBookingDto, 
  AdminCreateBookingDto,
  BookingFilterDto,
  UpdateBookingStatusDto,
  CancelBookingDto,
  BulkBookingOperationDto,
  BulkOperationResult
} from '../models/api.models';

export interface BookingAnalyticsDto {
  totalBookings: number;
  totalRevenue: number;
  averageBookingValue: number;
  averageBookingDuration: number;
  statusBreakdown: Array<{
    status: string;
    count: number;
    percentage: number;
  }>;
  monthlyStats: Array<{
    year: number;
    month: number;
    monthName: string;
    bookingCount: number;
    revenue: number;
    averageValue: number;
  }>;
  popularCars: Array<{
    carId: number;
    carInfo: string;
    bookingCount: number;
    revenue: number;
  }>;
  branchStats: Array<{
    branchId: number;
    branchName: string;
    bookingCount: number;
    revenue: number;
  }>;
  peakTimes: Array<{
    period: string;
    periodName: string;
    bookingCount: number;
    revenue: number;
    percentage: number;
  }>;
}

export interface BookingReportRequestDto {
  startDate: string;
  endDate: string;
  filters?: BookingFilterDto;
  format: 'excel' | 'pdf';
  includeAnalytics?: boolean;
}

export interface BookingAnalyticsFilterDto {
  startDate?: string;
  endDate?: string;
  branchId?: number;
  carId?: number;
  customerId?: string;
}

@Injectable({
  providedIn: 'root'
})
export class BookingApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.api.baseUrl}/admin/bookings`;

  /**
   * Get all bookings with filtering and pagination
   */
  getBookings(filter?: BookingFilterDto): Observable<PaginatedResponse<AdminBookingDto>> {
    let params = new HttpParams();
    
    if (filter) {
      if (filter.status) params = params.set('status', filter.status);
      if (filter.customerId) params = params.set('customerId', filter.customerId);
      if (filter.carId) params = params.set('carId', filter.carId.toString());
      if (filter.branchId) params = params.set('branchId', filter.branchId.toString());
      if (filter.startDateFrom) params = params.set('startDateFrom', filter.startDateFrom);
      if (filter.startDateTo) params = params.set('startDateTo', filter.startDateTo);
      if (filter.endDateFrom) params = params.set('endDateFrom', filter.endDateFrom);
      if (filter.endDateTo) params = params.set('endDateTo', filter.endDateTo);
      if (filter.totalAmountFrom) params = params.set('totalAmountFrom', filter.totalAmountFrom.toString());
      if (filter.totalAmountTo) params = params.set('totalAmountTo', filter.totalAmountTo.toString());
      if (filter.sortBy) params = params.set('sortBy', filter.sortBy);
      if (filter.sortOrder) params = params.set('sortOrder', filter.sortOrder);
      if (filter.page) params = params.set('page', filter.page.toString());
      if (filter.pageSize) params = params.set('pageSize', filter.pageSize.toString());
    }

    return this.http.get<ApiResponse<AdminBookingDto[]>>(this.baseUrl, { params }).pipe(
      map(response => {
        // Add debugging logs
        if (environment.logging.enableApiLogging) {
          console.log('Booking API Response:', response);
        }
        
        if (!response) {
          throw new Error('No response received from booking API');
        }
        
        if (!response.succeeded) {
          throw new Error(response.message || 'Failed to fetch bookings');
        }
        
        if (!response.data) {
          console.warn('Booking API response succeeded but data is null/undefined:', response);
          // Return empty paginated response structure
          return {
            data: [],
            totalCount: 0,
            pageNumber: 1,
            pageSize: 10,
            totalPages: 0,
            hasPreviousPage: false,
            hasNextPage: false
          };
        }
        
        // The API returns an array directly, so we need to wrap it in a paginated response structure
        const bookingArray = Array.isArray(response.data) ? response.data : [];
        const pageSize = filter?.pageSize || 10;
        const pageNumber = filter?.page || 1;
        const totalCount = bookingArray.length;
        const totalPages = Math.ceil(totalCount / pageSize);
        
        return {
          data: bookingArray,
          totalCount: totalCount,
          pageNumber: pageNumber,
          pageSize: pageSize,
          totalPages: totalPages,
          hasPreviousPage: pageNumber > 1,
          hasNextPage: pageNumber < totalPages
        } as PaginatedResponse<AdminBookingDto>;
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Get booking by ID
   */
  getBookingById(id: number): Observable<AdminBookingDto> {
    return this.http.get<ApiResponse<AdminBookingDto>>(`${this.baseUrl}/${id}`).pipe(
      map(response => {
        if (!response.succeeded) {
          throw new Error(response.message || 'Failed to fetch booking');
        }
        return response.data;
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Create new booking
   */
  createBooking(booking: AdminCreateBookingDto): Observable<AdminBookingDto> {
    return this.http.post<ApiResponse<AdminBookingDto>>(this.baseUrl, booking).pipe(
      map(response => {
        if (!response.succeeded) {
          throw new Error(response.message || 'Failed to create booking');
        }
        return response.data;
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Update booking status
   */
  updateBookingStatus(id: number, statusUpdate: UpdateBookingStatusDto): Observable<AdminBookingDto> {
    return this.http.put<ApiResponse<AdminBookingDto>>(`${this.baseUrl}/${id}/status`, statusUpdate).pipe(
      map(response => {
        if (!response.succeeded) {
          throw new Error(response.message || 'Failed to update booking status');
        }
        return response.data;
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Confirm booking
   */
  confirmBooking(id: number): Observable<AdminBookingDto> {
    return this.http.post<ApiResponse<AdminBookingDto>>(`${this.baseUrl}/${id}/confirm`, {}).pipe(
      map(response => {
        if (!response.succeeded) {
          throw new Error(response.message || 'Failed to confirm booking');
        }
        return response.data;
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Start booking
   */
  startBooking(id: number): Observable<AdminBookingDto> {
    return this.http.post<ApiResponse<AdminBookingDto>>(`${this.baseUrl}/${id}/start`, {}).pipe(
      map(response => {
        if (!response.succeeded) {
          throw new Error(response.message || 'Failed to start booking');
        }
        return response.data;
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Complete booking
   */
  completeBooking(id: number): Observable<AdminBookingDto> {
    return this.http.post<ApiResponse<AdminBookingDto>>(`${this.baseUrl}/${id}/complete`, {}).pipe(
      map(response => {
        if (!response.succeeded) {
          throw new Error(response.message || 'Failed to complete booking');
        }
        return response.data;
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Cancel booking
   */
  cancelBooking(id: number, cancelData: CancelBookingDto): Observable<AdminBookingDto> {
    return this.http.post<ApiResponse<AdminBookingDto>>(`${this.baseUrl}/${id}/cancel`, cancelData).pipe(
      map(response => {
        if (!response.succeeded) {
          throw new Error(response.message || 'Failed to cancel booking');
        }
        return response.data;
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Get booking analytics
   */
  getBookingAnalytics(filter?: BookingAnalyticsFilterDto): Observable<BookingAnalyticsDto> {
    let params = new HttpParams();

    if (filter) {
      if (filter.startDate) params = params.set('startDate', filter.startDate);
      if (filter.endDate) params = params.set('endDate', filter.endDate);
      if (filter.branchId) params = params.set('branchId', filter.branchId.toString());
      if (filter.carId) params = params.set('carId', filter.carId.toString());
      if (filter.customerId) params = params.set('customerId', filter.customerId);
    }

    return this.http.get<ApiResponse<BookingAnalyticsDto>>(`${this.baseUrl}/analytics`, { params }).pipe(
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
   * Bulk booking operations
   */
  bulkBookingOperation(operation: BulkBookingOperationDto): Observable<BulkOperationResult> {
    return this.http.post<ApiResponse<BulkOperationResult>>(`${this.baseUrl}/bulk/operation`, operation).pipe(
      map(response => {
        if (!response.succeeded) {
          throw new Error(response.message || 'Failed to perform bulk booking operation');
        }
        return response.data;
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Export bookings to file
   */
  exportBookings(filter?: BookingFilterDto, format: 'excel' | 'pdf' = 'excel'): Observable<Blob> {
    let params = new HttpParams().set('format', format);

    if (filter) {
      if (filter.status) params = params.set('status', filter.status);
      if (filter.customerId) params = params.set('customerId', filter.customerId);
      if (filter.carId) params = params.set('carId', filter.carId.toString());
      if (filter.branchId) params = params.set('branchId', filter.branchId.toString());
      if (filter.startDateFrom) params = params.set('startDateFrom', filter.startDateFrom);
      if (filter.startDateTo) params = params.set('startDateTo', filter.startDateTo);
    }

    return this.http.get(`${this.baseUrl}/export`, {
      params,
      responseType: 'blob'
    }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Generate booking report
   */
  generateBookingReport(reportRequest: BookingReportRequestDto): Observable<Blob> {
    return this.http.post(`${this.baseUrl}/report`, reportRequest, {
      responseType: 'blob'
    }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Get booking revenue summary
   */
  getBookingRevenueSummary(filter?: BookingAnalyticsFilterDto): Observable<any> {
    let params = new HttpParams();

    if (filter) {
      if (filter.startDate) params = params.set('startDate', filter.startDate);
      if (filter.endDate) params = params.set('endDate', filter.endDate);
      if (filter.branchId) params = params.set('branchId', filter.branchId.toString());
    }

    return this.http.get<ApiResponse<any>>(`${this.baseUrl}/revenue-summary`, { params }).pipe(
      map(response => {
        if (!response.succeeded) {
          throw new Error(response.message || 'Failed to fetch booking revenue summary');
        }
        return response.data;
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Get booking status statistics
   */
  getBookingStatusStats(filter?: BookingAnalyticsFilterDto): Observable<any> {
    let params = new HttpParams();

    if (filter) {
      if (filter.startDate) params = params.set('startDate', filter.startDate);
      if (filter.endDate) params = params.set('endDate', filter.endDate);
      if (filter.branchId) params = params.set('branchId', filter.branchId.toString());
    }

    return this.http.get<ApiResponse<any>>(`${this.baseUrl}/status-stats`, { params }).pipe(
      map(response => {
        if (!response.succeeded) {
          throw new Error(response.message || 'Failed to fetch booking status statistics');
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

    if (environment.logging.enableApiLogging) {
      console.error('🔍 Full Booking API Error:', error);
      console.error('🔍 Error Status:', error.status);
      console.error('🔍 Error URL:', error.url);
    }

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Client Error: ${error.error.message}`;
    } else {
      // Server-side error
      if (error.status === 0) {
        errorMessage = 'Network error - Unable to connect to the Booking API server.';
      } else if (error.status === 401) {
        errorMessage = 'Unauthorized - Please check your authentication token.';
      } else if (error.status === 403) {
        errorMessage = 'Forbidden - You do not have permission to access this resource.';
      } else if (error.status === 404) {
        errorMessage = 'Not Found - The requested booking endpoint was not found.';
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
      console.error('❌ Booking API Error Message:', errorMessage);
    }

    return throwError(() => new Error(errorMessage));
  }
}
