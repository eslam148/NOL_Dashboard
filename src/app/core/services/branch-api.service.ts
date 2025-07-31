import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { 
  ApiResponse, 
  PaginatedResponse
} from '../models/api.models';

export interface BranchDto {
  id: number;
  nameAr: string;
  nameEn: string;
  addressAr: string;
  addressEn: string;
  phoneNumber: string;
  email?: string;
  latitude: number;
  longitude: number;
  isActive: boolean;
  workingHours: string;
  totalCars: number;
  availableCars: number;
  totalBookings: number;
  monthlyRevenue: number;
}

export interface CreateBranchDto {
  nameAr: string;
  nameEn: string;
  addressAr: string;
  addressEn: string;
  phoneNumber: string;
  email?: string;
  latitude: number;
  longitude: number;
  isActive?: boolean;
  workingHours: string;
}

export interface UpdateBranchDto {
  nameAr?: string;
  nameEn?: string;
  addressAr?: string;
  addressEn?: string;
  phoneNumber?: string;
  email?: string;
  latitude?: number;
  longitude?: number;
  isActive?: boolean;
  workingHours?: string;
}

export interface BranchFilterDto {
  name?: string;
  isActive?: boolean;
  city?: string;
  country?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

export interface BranchAnalyticsDto {
  totalBranches: number;
  activeBranches: number;
  totalCars: number;
  totalBookings: number;
  totalRevenue: number;
  branchPerformance: Array<{
    branchId: number;
    branchName: string;
    totalCars: number;
    availableCars: number;
    totalBookings: number;
    monthlyRevenue: number;
    utilizationRate: number;
  }>;
  topPerformingBranches: Array<{
    branchId: number;
    branchName: string;
    revenue: number;
    bookingCount: number;
    carCount: number;
  }>;
}

@Injectable({
  providedIn: 'root'
})
export class BranchApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.api.baseUrl}/admin/branches`;

  /**
   * Get all branches with filtering and pagination
   */
  getBranches(filter?: BranchFilterDto): Observable<PaginatedResponse<BranchDto>> {
    let params = new HttpParams();
    
    if (filter) {
      if (filter.name) params = params.set('name', filter.name);
      if (filter.isActive !== undefined) params = params.set('isActive', filter.isActive.toString());
      if (filter.city) params = params.set('city', filter.city);
      if (filter.country) params = params.set('country', filter.country);
      if (filter.sortBy) params = params.set('sortBy', filter.sortBy);
      if (filter.sortOrder) params = params.set('sortOrder', filter.sortOrder);
      if (filter.page) params = params.set('page', filter.page.toString());
      if (filter.pageSize) params = params.set('pageSize', filter.pageSize.toString());
    }

    return this.http.get<ApiResponse<BranchDto[]>>(this.baseUrl, { params }).pipe(
      map(response => {
        // Add debugging logs
        if (environment.logging.enableApiLogging) {
          console.log('Branch API Response:', response);
        }
        
        if (!response) {
          throw new Error('No response received from branch API');
        }
        
        if (!response.succeeded) {
          throw new Error(response.message || 'Failed to fetch branches');
        }
        
        if (!response.data) {
          console.warn('Branch API response succeeded but data is null/undefined:', response);
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
        const branchArray = Array.isArray(response.data) ? response.data : [];
        const pageSize = filter?.pageSize || 10;
        const pageNumber = filter?.page || 1;
        const totalCount = branchArray.length;
        const totalPages = Math.ceil(totalCount / pageSize);
        
        return {
          data: branchArray,
          totalCount: totalCount,
          pageNumber: pageNumber,
          pageSize: pageSize,
          totalPages: totalPages,
          hasPreviousPage: pageNumber > 1,
          hasNextPage: pageNumber < totalPages
        } as PaginatedResponse<BranchDto>;
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Get branch by ID
   */
  getBranchById(id: number): Observable<BranchDto> {
    return this.http.get<ApiResponse<BranchDto>>(`${this.baseUrl}/${id}`).pipe(
      map(response => {
        if (!response.succeeded) {
          throw new Error(response.message || 'Failed to fetch branch');
        }
        return response.data;
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Create new branch
   */
  createBranch(branch: CreateBranchDto): Observable<BranchDto> {
    return this.http.post<ApiResponse<BranchDto>>(this.baseUrl, branch).pipe(
      map(response => {
        if (!response.succeeded) {
          throw new Error(response.message || 'Failed to create branch');
        }
        return response.data;
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Update branch
   */
  updateBranch(id: number, branch: UpdateBranchDto): Observable<BranchDto> {
    return this.http.put<ApiResponse<BranchDto>>(`${this.baseUrl}/${id}`, branch).pipe(
      map(response => {
        if (!response.succeeded) {
          throw new Error(response.message || 'Failed to update branch');
        }
        return response.data;
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Delete branch
   */
  deleteBranch(id: number): Observable<boolean> {
    return this.http.delete<ApiResponse<any>>(`${this.baseUrl}/${id}`).pipe(
      map(response => {
        if (!response.succeeded) {
          throw new Error(response.message || 'Failed to delete branch');
        }
        return true;
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Activate branch
   */
  activateBranch(id: number): Observable<BranchDto> {
    return this.updateBranch(id, { isActive: true });
  }

  /**
   * Deactivate branch
   */
  deactivateBranch(id: number): Observable<BranchDto> {
    return this.updateBranch(id, { isActive: false });
  }

  /**
   * Get branch analytics
   */
  getBranchAnalytics(): Observable<BranchAnalyticsDto> {
    return this.http.get<ApiResponse<BranchAnalyticsDto>>(`${this.baseUrl}/analytics`).pipe(
      map(response => {
        if (!response.succeeded) {
          throw new Error(response.message || 'Failed to fetch branch analytics');
        }
        return response.data;
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Get branches by status
   */
  getBranchesByStatus(isActive: boolean): Observable<BranchDto[]> {
    return this.getBranches({ isActive }).pipe(
      map(paginatedResponse => paginatedResponse.data)
    );
  }

  /**
   * Get active branches
   */
  getActiveBranches(): Observable<BranchDto[]> {
    return this.getBranchesByStatus(true);
  }

  /**
   * Get inactive branches
   */
  getInactiveBranches(): Observable<BranchDto[]> {
    return this.getBranchesByStatus(false);
  }

  /**
   * Handle HTTP errors
   */
  private handleError(error: any): Observable<never> {
    let errorMessage = 'An unknown error occurred';
    
    if (environment.logging.enableApiLogging) {
      console.error('🔍 Full Branch API Error:', error);
      console.error('🔍 Error Status:', error.status);
      console.error('🔍 Error URL:', error.url);
    }
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Client Error: ${error.error.message}`;
    } else {
      // Server-side error
      if (error.status === 0) {
        errorMessage = 'Network error - Unable to connect to the Branch API server.';
      } else if (error.status === 401) {
        errorMessage = 'Unauthorized - Please check your authentication token.';
      } else if (error.status === 403) {
        errorMessage = 'Forbidden - You do not have permission to access this resource.';
      } else if (error.status === 404) {
        errorMessage = 'Not Found - The requested branch endpoint was not found.';
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
      console.error('❌ Branch API Error Message:', errorMessage);
    }
    
    return throwError(() => new Error(errorMessage));
  }
}
