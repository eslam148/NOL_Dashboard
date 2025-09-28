import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { 
  ApiResponse, 
  PaginatedResponse
} from '../models/api.models';

export interface AdminAdvertisementDto {
  id: number;
  title: string;
  description: string;
  price?: number;
  discountPrice?: number;
  discountPercentage?: number;
  startDate: string;
  endDate: string;
  imageUrl: string;
  type: string; // e.g., Discount, Seasonal
  status: string; // Draft, Active, Paused, Expired, Canceled
  viewCount?: number;
  clickCount?: number;
  isFeatured?: boolean;
  sortOrder?: number;
  createdAt: string;
  updatedAt: string;
  createdByAdminName?: string;
  clickThroughRate?: number;
  conversionCount?: number;
  conversionRate?: number;
  revenueGenerated?: number;
  performanceScore?: number;
}

export interface AdminCreateAdvertisementDto {
  titleAr: string;
  titleEn: string;
  descriptionAr?: string;
  descriptionEn?: string;
  type: 'Special' | 'Discount' | 'Seasonal' | 'Flash' | 'Weekend' | 'Holiday' | 'NewArrival' | 'Popular';
  startDate: string;
  endDate: string;
  price?: number;
  imageUrl: string;
  discountPercentage?: number;
  discountPrice?: number;
  isFeatured?: boolean;
  sortOrder?: number;
  isActive?: boolean;
  carId?: number;
  categoryId?: number;
  notes?: string;
}

export interface AdvertisementFilterDto {
  type?: string;
  status?: string;
  isActive?: boolean;
  isFeatured?: boolean;
  carId?: number;
  categoryId?: number;
  createdByAdminId?: string;
  startDateFrom?: string;
  startDateTo?: string;
  endDateFrom?: string;
  endDateTo?: string;
  createdDateFrom?: string;
  createdDateTo?: string;
  minDiscountPercentage?: number;
  maxDiscountPercentage?: number;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  searchTerm?: string;
}

export interface UpdateAdvertisementStatusDto {
  status: 'Active' | 'Inactive' | 'Scheduled' | 'Expired';
}

export interface ScheduleAdvertisementDto {
  startDate: string;
  endDate: string;
  targetAudience?: string;
}

export interface AdvertisementAnalyticsDto {
  totalAdvertisements: number;
  activeAdvertisements: number;
  totalImpressions: number;
  totalClicks: number;
  averageClickThroughRate: number;
  topPerforming: Array<{
    id: number;
    title: string;
    impressions: number;
    clicks: number;
    clickThroughRate: number;
    revenue?: number;
  }>;
  performanceByType: Array<{
    type: string;
    count: number;
    impressions: number;
    clicks: number;
    clickThroughRate: number;
  }>;
}

@Injectable({
  providedIn: 'root'
})
export class AdvertisementApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.api.baseUrl}/admin/advertisements`;

  /**
   * Get all advertisements with filtering and pagination
   */
  getAdvertisements(filter?: AdvertisementFilterDto): Observable<PaginatedResponse<AdminAdvertisementDto>> {
    let params = new HttpParams();
    
    if (filter) {
      const setIfString = (key: string, value?: string) => {
        const v = (value ?? '').trim();
        if (v) params = params.set(key, v);
      };
      const setIfBool = (key: string, value?: boolean) => {
        if (value === true || value === false) params = params.set(key, String(value));
      };
      const setIfNumber = (key: string, value?: number) => {
        if (value !== undefined && value !== null && !Number.isNaN(value)) params = params.set(key, String(value));
      };

      setIfString('searchTerm', filter.searchTerm);
     
       setIfBool('isFeatured', filter.isFeatured);
      setIfNumber('carId', filter.carId);
      setIfNumber('categoryId', filter.categoryId);
      setIfString('createdByAdminId', filter.createdByAdminId);

      setIfString('startDateFrom', filter.startDateFrom);
      setIfString('startDateTo', filter.startDateTo);
      setIfString('endDateFrom', filter.endDateFrom);
      setIfString('endDateTo', filter.endDateTo);
      setIfString('createdDateFrom', filter.createdDateFrom);
      setIfString('createdDateTo', filter.createdDateTo);

      setIfNumber('minDiscountPercentage', filter.minDiscountPercentage);
      setIfNumber('maxDiscountPercentage', filter.maxDiscountPercentage);

      setIfString('sortBy', filter.sortBy);
      setIfString('sortOrder', filter.sortOrder);
      setIfNumber('page', filter.page);
      setIfNumber('pageSize', filter.pageSize);
    }

    return this.http.get<ApiResponse<PaginatedResponse<AdminAdvertisementDto>>>(this.baseUrl, { params }).pipe(
      map(response => {
        
        if (!response) {
          throw new Error('No response received from advertisement API');
        }
        if (!response.succeeded) {
          throw new Error(response.message || 'Failed to fetch advertisements');
        }
        if (!response.data) {
          return {
            data: [],
            totalCount: 0,
            currentPage: 1,
            pageSize: filter?.pageSize || 10,
            totalPages: 0,
            hasPreviousPage: false,
            hasNextPage: false
          } as PaginatedResponse<AdminAdvertisementDto>;
        }
        return response.data as PaginatedResponse<AdminAdvertisementDto>;
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Get advertisement by ID
   */
  getAdvertisementById(id: number): Observable<AdminAdvertisementDto> {
    return this.http.get<ApiResponse<AdminAdvertisementDto>>(`${this.baseUrl}/${id}`).pipe(
      map(response => {
        if (!response.succeeded) {
          throw new Error(response.message || 'Failed to fetch advertisement');
        }
        return response.data;
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Create new advertisement
   */
  createAdvertisement(advertisement: AdminCreateAdvertisementDto): Observable<AdminAdvertisementDto> {
    return this.http.post<ApiResponse<AdminAdvertisementDto>>(this.baseUrl, advertisement).pipe(
      map(response => {
        if (!response.succeeded) {
          throw new Error(response.message || 'Failed to create advertisement');
        }
        return response.data;
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Update advertisement
   */
  updateAdvertisement(id: number, advertisement: Partial<AdminCreateAdvertisementDto>): Observable<AdminAdvertisementDto> {
    return this.http.put<ApiResponse<AdminAdvertisementDto>>(`${this.baseUrl}/${id}`, advertisement).pipe(
      map(response => {
        if (!response.succeeded) {
          throw new Error(response.message || 'Failed to update advertisement');
        }
        return response.data;
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Delete advertisement
   */
  deleteAdvertisement(id: number): Observable<boolean> {
    return this.http.delete<ApiResponse<any>>(`${this.baseUrl}/${id}`).pipe(
      map(response => {
        if (!response.succeeded) {
          throw new Error(response.message || 'Failed to delete advertisement');
        }
        return true;
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Update advertisement status
   */
  updateAdvertisementStatus(id: number, statusUpdate: UpdateAdvertisementStatusDto): Observable<AdminAdvertisementDto> {
    return this.http.put<ApiResponse<AdminAdvertisementDto>>(`${this.baseUrl}/${id}/status`, statusUpdate).pipe(
      map(response => {
        if (!response.succeeded) {
          throw new Error(response.message || 'Failed to update advertisement status');
        }
        return response.data;
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Get advertisement analytics
   */
  getAdvertisementAnalytics(): Observable<AdvertisementAnalyticsDto> {
    return this.http.get<ApiResponse<AdvertisementAnalyticsDto>>(`${this.baseUrl}/analytics`).pipe(
      map(response => {
        if (!response.succeeded) {
          throw new Error(response.message || 'Failed to fetch advertisement analytics');
        }
        return response.data;
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Get top performing advertisements
   */
  getTopPerformingAdvertisements(): Observable<any[]> {
    return this.http.get<ApiResponse<any[]>>(`${this.baseUrl}/analytics/top-performing`).pipe(
      map(response => {
        if (!response.succeeded) {
          throw new Error(response.message || 'Failed to fetch top performing advertisements');
        }
        return response.data;
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Schedule advertisement
   */
  scheduleAdvertisement(id: number, scheduleData: ScheduleAdvertisementDto): Observable<AdminAdvertisementDto> {
    return this.http.post<ApiResponse<AdminAdvertisementDto>>(`${this.baseUrl}/${id}/schedule`, scheduleData).pipe(
      map(response => {
        if (!response.succeeded) {
          throw new Error(response.message || 'Failed to schedule advertisement');
        }
        return response.data;
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Track advertisement view
   */
  trackAdvertisementView(id: number): Observable<boolean> {
    return this.http.post<ApiResponse<any>>(`${this.baseUrl}/${id}/view`, {}).pipe(
      map(response => {
        if (!response.succeeded) {
          throw new Error(response.message || 'Failed to track advertisement view');
        }
        return true;
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Track advertisement click
   */
  trackAdvertisementClick(id: number): Observable<boolean> {
    return this.http.post<ApiResponse<any>>(`${this.baseUrl}/${id}/click`, {}).pipe(
      map(response => {
        if (!response.succeeded) {
          throw new Error(response.message || 'Failed to track advertisement click');
        }
        return true;
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Get advertisement performance metrics
   */
  getAdvertisementPerformance(id: number): Observable<any> {
    return this.http.get<ApiResponse<any>>(`${this.baseUrl}/${id}/performance`).pipe(
      map(response => {
        if (!response.succeeded) {
          throw new Error(response.message || 'Failed to fetch advertisement performance');
        }
        return response.data;
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Get advertisements by status
   */
  getAdvertisementsByStatus(status: 'Active' | 'Inactive' | 'Scheduled' | 'Expired'): Observable<AdminAdvertisementDto[]> {
    return this.getAdvertisements({ status }).pipe(
      map(paginatedResponse => paginatedResponse.data)
    );
  }

  /**
   * Get advertisements by type
   */
  getAdvertisementsByType(type: 'Banner' | 'Popup' | 'Sidebar'): Observable<AdminAdvertisementDto[]> {
    return this.getAdvertisements({ type }).pipe(
      map(paginatedResponse => paginatedResponse.data)
    );
  }

  /**
   * Activate advertisement
   */
  activateAdvertisement(id: number): Observable<AdminAdvertisementDto> {
    return this.updateAdvertisementStatus(id, { status: 'Active' });
  }

  /**
   * Deactivate advertisement
   */
  deactivateAdvertisement(id: number): Observable<AdminAdvertisementDto> {
    return this.updateAdvertisementStatus(id, { status: 'Inactive' });
  }

  /**
   * Handle HTTP errors
   */
  private handleError(error: any): Observable<never> {
    let errorMessage = 'An unknown error occurred';
    
    if (environment.logging.enableApiLogging) {
      console.error('🔍 Full Advertisement API Error:', error);
      console.error('🔍 Error Status:', error.status);
      console.error('🔍 Error URL:', error.url);
    }
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Client Error: ${error.error.message}`;
    } else {
      // Server-side error
      if (error.status === 0) {
        errorMessage = 'Network error - Unable to connect to the Advertisement API server.';
      } else if (error.status === 401) {
        errorMessage = 'Unauthorized - Please check your authentication token.';
      } else if (error.status === 403) {
        errorMessage = 'Forbidden - You do not have permission to access this resource.';
      } else if (error.status === 404) {
        errorMessage = 'Not Found - The requested advertisement endpoint was not found.';
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
      console.error('❌ Advertisement API Error Message:', errorMessage);
    }
    
    return throwError(() => new Error(errorMessage));
  }
}
