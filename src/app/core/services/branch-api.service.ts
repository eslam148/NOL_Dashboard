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
  name: string;
  description?: string;
  address: string;
  city: string;
  country: string;
  phone: string;
  email?: string;
  latitude: number;
  longitude: number;
  workingHours: string;
  isActive: boolean;
  // Additional fields from API response
  createdAt?: string;
  updatedAt?: string;
  createdByAdmin?: string;
  updatedByAdmin?: string;
  totalCars?: number;
  availableCars?: number;
  rentedCars?: number;
  maintenanceCars?: number;
  carUtilizationRate?: number;
  totalBookings?: number;
  activeBookings?: number;
  completedBookings?: number;
  cancelledBookings?: number;
  monthlyRevenue?: number;
  yearlyRevenue?: number;
  totalRevenue?: number;
  averageBookingValue?: number;
  totalStaff?: number;
  activeStaff?: number;
  staff?: any[];
  customerSatisfactionRate?: number;
  onTimeDeliveryRate?: number;
  maintenanceRequestsCount?: number;
  lastBookingDate?: string;
  lastMaintenanceDate?: string;
  recentActivities?: any[];
}

export interface CreateBranchDto {
  // Required fields matching backend AdminCreateBranchDto
  nameAr: string;           // Required, StringLength(100, MinimumLength = 2)
  nameEn: string;           // Required, StringLength(100, MinimumLength = 2)
  address: string;          // Required, StringLength(200, MinimumLength = 5)
  city: string;             // Required, StringLength(50, MinimumLength = 2)
  country: string;          // Required, StringLength(50, MinimumLength = 2)
  latitude: number;         // Required, Range(-90, 90)
  longitude: number;        // Required, Range(-180, 180)
  
  // Optional fields
  descriptionAr?: string;   // Optional, StringLength(500)
  descriptionEn?: string;   // Optional, StringLength(500)
  phone?: string;           // Optional, [Phone] attribute
  email?: string;           // Optional, [EmailAddress] attribute
  workingHours?: string;    // Optional, StringLength(500)
  isActive?: boolean;       // Optional, defaults to true
  assignedStaffIds?: string[]; // Optional, List<string>
  notes?: string;           // Optional, StringLength(1000)
}

export interface UpdateBranchDto {
  nameAr?: string;
  nameEn?: string;
  descriptionAr?: string;
  descriptionEn?: string;
  address?: string;
  city?: string;
  country?: string;
  phone?: string;
  email?: string;
  latitude?: number;
  longitude?: number;
  workingHours?: string;
  isActive?: boolean;
  assignedStaffIds?: string[];
  notes?: string;
}

// Interface for the paginated API response structure
export interface BranchPaginatedApiResponse {
  data: BranchDto[];
  currentPage: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
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

    return this.http.get<ApiResponse<any>>(this.baseUrl, { params }).pipe(
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
            currentPage: 1,
            pageSize: 10,
            totalPages: 0,
            hasPreviousPage: false,
            hasNextPage: false
          };
        }

        // Check if the response.data contains pagination info (new API structure)
        if (response.data && typeof response.data === 'object' && 'data' in response.data && Array.isArray(response.data.data)) {
          console.log('🎉 API supports server-side pagination with proper structure!');
          const paginatedData = response.data as BranchPaginatedApiResponse;
          console.log(`📊 Page ${paginatedData.currentPage}/${paginatedData.totalPages} with ${paginatedData.data.length} items (total: ${paginatedData.totalCount})`);

          return {
            data: paginatedData.data,
            totalCount: paginatedData.totalCount,
            currentPage: paginatedData.currentPage,
            pageSize: paginatedData.pageSize,
            totalPages: paginatedData.totalPages,
            hasPreviousPage: paginatedData.hasPreviousPage,
            hasNextPage: paginatedData.hasNextPage
          } as PaginatedResponse<BranchDto>;
        }

        // Fallback: API returns array directly (old structure)
        const branchArray = Array.isArray(response.data) ? response.data : [];
        const pageSize = filter?.pageSize || 10;
        const currentPage = filter?.page || 1;

        console.log(`📊 Branch API returned ${branchArray.length} branches for page ${currentPage}, pageSize ${pageSize} (legacy structure)`);

        // Check if API supports server-side pagination
        let paginatedData: any[];
        let totalCount: number;
        let totalPages: number;
        let hasPreviousPage: boolean;
        let hasNextPage: boolean;

        if (branchArray.length <= pageSize || branchArray.length === pageSize) {
          // Assume API supports server-side pagination
          console.log('🔄 Assuming server-side pagination is supported');
          paginatedData = branchArray;
          totalCount = branchArray.length; // This should ideally come from API headers or response
          totalPages = Math.ceil(totalCount / pageSize);
          hasPreviousPage = currentPage > 1;
          hasNextPage = currentPage < totalPages;
        } else {
          // API returns all data, simulate pagination client-side
          console.log('🎭 Simulating client-side pagination');
          const startIndex = (currentPage - 1) * pageSize;
          const endIndex = startIndex + pageSize;
          paginatedData = branchArray.slice(startIndex, endIndex);
          totalCount = branchArray.length;
          totalPages = Math.ceil(totalCount / pageSize);
          hasPreviousPage = currentPage > 1;
          hasNextPage = currentPage < totalPages;
        }

        console.log(`📄 Returning page ${currentPage}/${totalPages} with ${paginatedData.length} items (total: ${totalCount})`);

        return {
          data: paginatedData,
          totalCount: totalCount,
          currentPage: currentPage,
          pageSize: pageSize,
          totalPages: totalPages,
          hasPreviousPage: hasPreviousPage,
          hasNextPage: hasNextPage
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
    // Log the request data for debugging
    if (environment.logging.enableApiLogging) {
      console.log('🏢 Branch API - Creating branch with data:', branch);
      console.log('🏢 Branch API - Request URL:', this.baseUrl);
      console.log('🏢 Branch API - Data types:', {
        nameAr: typeof branch.nameAr,
        nameEn: typeof branch.nameEn,
        isActive: typeof branch.isActive,
        latitude: typeof branch.latitude,
        longitude: typeof branch.longitude
      });
    }

    // Try sending the data directly first, but if that fails, we might need to wrap it
    return this.http.post<ApiResponse<BranchDto>>(this.baseUrl, branch).pipe(
      map(response => {
        if (environment.logging.enableApiLogging) {
          console.log('🏢 Branch API - Response:', response);
        }
        
        if (!response.succeeded) {
          throw new Error(response.message || 'Failed to create branch');
        }
        return response.data;
      }),
      catchError((error) => {
        if (environment.logging.enableApiLogging) {
          console.error('🏢 Branch API - Error details:', {
            status: error.status,
            statusText: error.statusText,
            url: error.url,
            error: error.error
          });
        }
        return this.handleError(error);
      })
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
