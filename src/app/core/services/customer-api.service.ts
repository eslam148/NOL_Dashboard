import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { 
  ApiResponse, 
  PaginatedResponse
} from '../models/api.models';

export interface AdminCustomerDto {
  id: string;
  email: string;
  fullName: string;
  phoneNumber?: string;
  userRole: string;
  preferredLanguage: string;
  isActive: boolean;
  emailConfirmed: boolean;
  createdAt: string;
  updatedAt: string;
  lastLoginDate?: string;
  lastBookingDate?: string;
  totalBookings: number;
  totalSpent: number;
  averageBookingValue: number;
  completedBookings: number;
  cancelledBookings: number;
  cancellationRate: number;
  totalLoyaltyPoints: number;
  availableLoyaltyPoints: number;
  lifetimePointsEarned: number;
  lifetimePointsRedeemed: number;
}

export interface CustomerFilterDto {
  name?: string;
  email?: string;
  phone?: string;
  userRole?: string;
  preferredLanguage?: 'Arabic' | 'English';
  isActive?: boolean;
  emailVerified?: boolean;
  createdDateFrom?: string;
  createdDateTo?: string;
  minBookings?: number;
  maxBookings?: number;
  minSpent?: number;
  maxSpent?: number;
  minLoyaltyPoints?: number;
  maxLoyaltyPoints?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

export interface AwardLoyaltyPointsDto {
  customerId: string;
  points: number;
  reason: string;
  expiryDate?: string;
}

export interface RedeemLoyaltyPointsDto {
  customerId: string;
  points: number;
  reason: string;
}

export interface CustomerAnalyticsDto {
  totalCustomers: number;
  activeCustomers: number;
  newCustomersThisMonth: number;
  customerRetentionRate: number;
  averageLifetimeValue: number;
  averageLoyaltyPoints: number;
  customerSegments: Array<{
    segment: string;
    count: number;
    percentage: number;
    averageValue: number;
  }>;
  topCustomers: Array<{
    customerId: string;
    customerName: string;
    totalSpent: number;
    totalBookings: number;
    loyaltyPoints: number;
  }>;
  churnRisk: Array<{
    customerId: string;
    customerName: string;
    lastBookingDate: string;
    riskScore: number;
    recommendedAction: string;
  }>;
}

export interface BulkCustomerNotificationDto {
  customerIds: string[];
  notificationType: 'email' | 'sms' | 'push';
  subject: string;
  message: string;
  templateId?: string;
}

@Injectable({
  providedIn: 'root'
})
export class CustomerApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.api.baseUrl}/admin/customers`;

  /**
   * Get all customers with filtering and pagination
   */
  getCustomers(filter?: CustomerFilterDto): Observable<PaginatedResponse<AdminCustomerDto>> {
    let params = new HttpParams();
    
    if (filter) {
      if (filter.name) params = params.set('name', filter.name);
      if (filter.email) params = params.set('email', filter.email);
      if (filter.phone) params = params.set('phone', filter.phone);
      if (filter.userRole) params = params.set('userRole', filter.userRole);
      if (filter.preferredLanguage) params = params.set('preferredLanguage', filter.preferredLanguage);
      if (filter.isActive !== undefined) params = params.set('isActive', filter.isActive.toString());
      if (filter.emailVerified !== undefined) params = params.set('emailVerified', filter.emailVerified.toString());
      if (filter.createdDateFrom) params = params.set('createdDateFrom', filter.createdDateFrom);
      if (filter.createdDateTo) params = params.set('createdDateTo', filter.createdDateTo);
      if (filter.minBookings) params = params.set('minBookings', filter.minBookings.toString());
      if (filter.maxBookings) params = params.set('maxBookings', filter.maxBookings.toString());
      if (filter.minSpent) params = params.set('minSpent', filter.minSpent.toString());
      if (filter.maxSpent) params = params.set('maxSpent', filter.maxSpent.toString());
      if (filter.minLoyaltyPoints) params = params.set('minLoyaltyPoints', filter.minLoyaltyPoints.toString());
      if (filter.maxLoyaltyPoints) params = params.set('maxLoyaltyPoints', filter.maxLoyaltyPoints.toString());
      if (filter.sortBy) params = params.set('sortBy', filter.sortBy);
      if (filter.sortOrder) params = params.set('sortOrder', filter.sortOrder);
      if (filter.page) params = params.set('page', filter.page.toString());
      if (filter.pageSize) params = params.set('pageSize', filter.pageSize.toString());
    }

    return this.http.get<ApiResponse<AdminCustomerDto[]>>(this.baseUrl, { params }).pipe(
      map(response => {
        // Add debugging logs
        if (environment.logging.enableApiLogging) {
          console.log('Customer API Response:', response);
        }
        
        if (!response) {
          throw new Error('No response received from customer API');
        }
        
        if (!response.succeeded) {
          throw new Error(response.message || 'Failed to fetch customers');
        }
        
        if (!response.data) {
          console.warn('Customer API response succeeded but data is null/undefined:', response);
          // Return empty paginated response structure
          return {
            data: [],
            totalCount: 0,
            currentPage: 1,
            pageSize: 10,
            totalPages: 0,
            hasPreviousPage: false,
            hasNextPage: false
          };
        }
        
        // The API returns an array directly, so we need to wrap it in a paginated response structure
        const customerArray = Array.isArray(response.data) ? response.data : [];
        const pageSize = filter?.pageSize || 10;
        const currentPage = filter?.page || 1;
        const totalCount = customerArray.length;
        const totalPages = Math.ceil(totalCount / pageSize);
        
        return {
          data: customerArray,
          totalCount: totalCount,
          currentPage: currentPage,
          pageSize: pageSize,
          totalPages: totalPages,
          hasPreviousPage: currentPage > 1,
          hasNextPage: currentPage < totalPages
        } as PaginatedResponse<AdminCustomerDto>;
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Get customer by ID
   */
  getCustomerById(id: string): Observable<AdminCustomerDto> {
    return this.http.get<ApiResponse<AdminCustomerDto>>(`${this.baseUrl}/${id}`).pipe(
      map(response => {
        if (!response.succeeded) {
          throw new Error(response.message || 'Failed to fetch customer');
        }
        return response.data;
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Award loyalty points to customer
   */
  awardLoyaltyPoints(awardData: AwardLoyaltyPointsDto): Observable<boolean> {
    return this.http.post<ApiResponse<any>>(`${this.baseUrl}/loyalty-points/award`, awardData).pipe(
      map(response => {
        if (!response.succeeded) {
          throw new Error(response.message || 'Failed to award loyalty points');
        }
        return true;
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Redeem loyalty points from customer
   */
  redeemLoyaltyPoints(redeemData: RedeemLoyaltyPointsDto): Observable<boolean> {
    return this.http.post<ApiResponse<any>>(`${this.baseUrl}/loyalty-points/redeem`, redeemData).pipe(
      map(response => {
        if (!response.succeeded) {
          throw new Error(response.message || 'Failed to redeem loyalty points');
        }
        return true;
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Get customer loyalty points summary
   */
  getCustomerLoyaltyPointsSummary(customerId: string): Observable<any> {
    return this.http.get<ApiResponse<any>>(`${this.baseUrl}/${customerId}/loyalty-points/summary`).pipe(
      map(response => {
        if (!response.succeeded) {
          throw new Error(response.message || 'Failed to fetch loyalty points summary');
        }
        return response.data;
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Get customer loyalty points transactions
   */
  getCustomerLoyaltyPointsTransactions(customerId: string): Observable<any[]> {
    return this.http.get<ApiResponse<any[]>>(`${this.baseUrl}/${customerId}/loyalty-points/transactions`).pipe(
      map(response => {
        if (!response.succeeded) {
          throw new Error(response.message || 'Failed to fetch loyalty points transactions');
        }
        return response.data || [];
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Get customer analytics
   */
  getCustomerAnalytics(): Observable<CustomerAnalyticsDto> {
    return this.http.get<ApiResponse<CustomerAnalyticsDto>>(`${this.baseUrl}/analytics`).pipe(
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
   * Get customers at churn risk
   */
  getCustomersAtChurnRisk(): Observable<any[]> {
    return this.http.get<ApiResponse<any[]>>(`${this.baseUrl}/churn-risk`).pipe(
      map(response => {
        if (!response.succeeded) {
          throw new Error(response.message || 'Failed to fetch customers at churn risk');
        }
        return response.data || [];
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Send bulk notification to customers
   */
  sendBulkNotification(notificationData: BulkCustomerNotificationDto): Observable<boolean> {
    return this.http.post<ApiResponse<any>>(`${this.baseUrl}/bulk/notification`, notificationData).pipe(
      map(response => {
        if (!response.succeeded) {
          throw new Error(response.message || 'Failed to send bulk notification');
        }
        return true;
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Export customers to file
   */
  exportCustomers(filter?: CustomerFilterDto, format: 'excel' | 'pdf' = 'excel'): Observable<Blob> {
    let params = new HttpParams().set('format', format);

    if (filter) {
      if (filter.name) params = params.set('name', filter.name);
      if (filter.email) params = params.set('email', filter.email);
      if (filter.phone) params = params.set('phone', filter.phone);
      if (filter.userRole) params = params.set('userRole', filter.userRole);
      if (filter.preferredLanguage) params = params.set('preferredLanguage', filter.preferredLanguage);
      if (filter.isActive !== undefined) params = params.set('isActive', filter.isActive.toString());
      if (filter.emailVerified !== undefined) params = params.set('emailVerified', filter.emailVerified.toString());
      if (filter.createdDateFrom) params = params.set('createdDateFrom', filter.createdDateFrom);
      if (filter.createdDateTo) params = params.set('createdDateTo', filter.createdDateTo);
    }

    return this.http.get(`${this.baseUrl}/export`, {
      params,
      responseType: 'blob'
    }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Generate customer report
   */
  generateCustomerReport(reportData: any): Observable<Blob> {
    return this.http.post(`${this.baseUrl}/report`, reportData, {
      responseType: 'blob'
    }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Get customers by status
   */
  getCustomersByStatus(isActive: boolean): Observable<AdminCustomerDto[]> {
    return this.getCustomers({ isActive }).pipe(
      map(paginatedResponse => paginatedResponse.data)
    );
  }

  /**
   * Get active customers
   */
  getActiveCustomers(): Observable<AdminCustomerDto[]> {
    return this.getCustomersByStatus(true);
  }

  /**
   * Get inactive customers
   */
  getInactiveCustomers(): Observable<AdminCustomerDto[]> {
    return this.getCustomersByStatus(false);
  }

  /**
   * Get top customers by spending
   */
  getTopCustomers(count: number = 10): Observable<AdminCustomerDto[]> {
    return this.getCustomers({
      sortBy: 'totalSpent',
      sortOrder: 'desc',
      pageSize: count
    }).pipe(
      map(paginatedResponse => paginatedResponse.data)
    );
  }

  /**
   * Handle HTTP errors
   */
  private handleError(error: any): Observable<never> {
    let errorMessage = 'An unknown error occurred';
    
    if (environment.logging.enableApiLogging) {
      console.error('🔍 Full Customer API Error:', error);
      console.error('🔍 Error Status:', error.status);
      console.error('🔍 Error URL:', error.url);
    }
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Client Error: ${error.error.message}`;
    } else {
      // Server-side error
      if (error.status === 0) {
        errorMessage = 'Network error - Unable to connect to the Customer API server.';
      } else if (error.status === 401) {
        errorMessage = 'Unauthorized - Please check your authentication token.';
      } else if (error.status === 403) {
        errorMessage = 'Forbidden - You do not have permission to access this resource.';
      } else if (error.status === 404) {
        errorMessage = 'Not Found - The requested customer endpoint was not found.';
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
      console.error('❌ Customer API Error Message:', errorMessage);
    }
    
    return throwError(() => new Error(errorMessage));
  }
}
