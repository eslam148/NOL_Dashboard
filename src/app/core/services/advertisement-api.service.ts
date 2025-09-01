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
  titleAr: string;
  titleEn: string;
  descriptionAr?: string;
  descriptionEn?: string;
  imageUrl: string;
  linkUrl?: string;
  type: string;
  status: string;
  startDate: string;
  endDate: string;
  displayOrder: number;
  targetAudience?: string;
  clickCount: number;
  impressionCount: number;
  clickThroughRate: number;
  createdAt: string;
  updatedAt: string;
}

export interface AdminCreateAdvertisementDto {
  titleAr: string;
  titleEn: string;
  descriptionAr?: string;
  descriptionEn?: string;
  imageUrl: string;
  linkUrl?: string;
  type: 'Banner' | 'Popup' | 'Sidebar';
  status: 'Active' | 'Inactive' | 'Scheduled';
  startDate: string;
  endDate: string;
  displayOrder?: number;
  targetAudience?: string;
}

export interface AdvertisementFilterDto {
  title?: string;
  status?: 'Active' | 'Inactive' | 'Scheduled' | 'Expired';
  type?: 'Banner' | 'Popup' | 'Sidebar';
  startDateFrom?: string;
  startDateTo?: string;
  endDateFrom?: string;
  endDateTo?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
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
      if (filter.title) params = params.set('title', filter.title);
      if (filter.status) params = params.set('status', filter.status);
      if (filter.type) params = params.set('type', filter.type);
      if (filter.startDateFrom) params = params.set('startDateFrom', filter.startDateFrom);
      if (filter.startDateTo) params = params.set('startDateTo', filter.startDateTo);
      if (filter.endDateFrom) params = params.set('endDateFrom', filter.endDateFrom);
      if (filter.endDateTo) params = params.set('endDateTo', filter.endDateTo);
      if (filter.sortBy) params = params.set('sortBy', filter.sortBy);
      if (filter.sortOrder) params = params.set('sortOrder', filter.sortOrder);
      if (filter.page) params = params.set('page', filter.page.toString());
      if (filter.pageSize) params = params.set('pageSize', filter.pageSize.toString());
    }

    return this.http.get<ApiResponse<AdminAdvertisementDto[]>>(this.baseUrl, { params }).pipe(
      map(response => {
        // Add debugging logs
        if (environment.logging.enableApiLogging) {
          console.log('Advertisement API Response:', response);
        }
        
        if (!response) {
          throw new Error('No response received from advertisement API');
        }
        
        if (!response.succeeded) {
          throw new Error(response.message || 'Failed to fetch advertisements');
        }
        
        if (!response.data) {
          console.warn('Advertisement API response succeeded but data is null/undefined:', response);
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
        const advertisementArray = Array.isArray(response.data) ? response.data : [];
        const pageSize = filter?.pageSize || 10;
        const currentPage = filter?.page || 1;
        const totalCount = advertisementArray.length;
        const totalPages = Math.ceil(totalCount / pageSize);
        
        return {
          data: advertisementArray,
          totalCount: totalCount,
          currentPage: currentPage,
          pageSize: pageSize,
          totalPages: totalPages,
          hasPreviousPage: currentPage > 1,
          hasNextPage: currentPage < totalPages
        } as PaginatedResponse<AdminAdvertisementDto>;
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
