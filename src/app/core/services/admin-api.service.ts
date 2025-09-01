import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { 
  ApiResponse, 
  PaginatedResponse,
  AdminUserDto, 
  CreateAdminUserDto,
  AdminFilterDto,
  BulkOperationResult,
  ActivityLogDto,
  SystemSettingsDto
} from '../models/api.models';

export interface UpdatePermissionsDto {
  permissions: string[];
}

export interface CreateSystemSettingDto {
  key: string;
  value: string;
  description?: string;
  category: string;
  isPublic?: boolean;
}

export interface UpdateSystemSettingDto {
  value: string;
  description?: string;
  category?: string;
  isPublic?: boolean;
}

export interface BulkAdminOperationDto {
  adminIds: string[];
  operation: 'activate' | 'deactivate' | 'delete' | 'updateRole';
  isActive?: boolean;
  newRole?: 'Employee' | 'BranchManager' | 'Admin' | 'SuperAdmin';
  assignedBranches?: number[];
}

export interface AuditLogFilterDto {
  adminId?: string;
  action?: string;
  entityType?: string;
  entityId?: string;
  dateFrom?: string;
  dateTo?: string;
  ipAddress?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  page?: number;
  pageSize?: number;
}

export interface AdminAnalyticsDto {
  totalAdmins: number;
  activeAdmins: number;
  inactiveAdmins: number;
  roleStats: Array<{
    role: string;
    roleName: string;
    count: number;
    percentage: number;
  }>;
  activityStats: Array<{
    date: string;
    loginCount: number;
    actionCount: number;
  }>;
  branchStats: Array<{
    branchId: number;
    branchName: string;
    adminCount: number;
  }>;
  loginStats: Array<{
    adminId: string;
    adminName: string;
    lastLogin: string;
    loginCount: number;
  }>;
}

@Injectable({
  providedIn: 'root'
})
export class AdminApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.api.baseUrl}/admin/admins`;

  /**
   * Get all admins with filtering and pagination
   */
  getAdmins(filter?: AdminFilterDto): Observable<PaginatedResponse<AdminUserDto>> {
    let params = new HttpParams();
    
    if (filter) {
      if (filter.name) params = params.set('name', filter.name);
      if (filter.email) params = params.set('email', filter.email);
      if (filter.userRole) params = params.set('userRole', filter.userRole);
      if (filter.isActive !== undefined) params = params.set('isActive', filter.isActive.toString());
      if (filter.branchId) params = params.set('branchId', filter.branchId.toString());
      if (filter.createdDateFrom) params = params.set('createdDateFrom', filter.createdDateFrom);
      if (filter.createdDateTo) params = params.set('createdDateTo', filter.createdDateTo);
      if (filter.sortBy) params = params.set('sortBy', filter.sortBy);
      if (filter.sortOrder) params = params.set('sortOrder', filter.sortOrder);
      if (filter.page) params = params.set('page', filter.page.toString());
      if (filter.pageSize) params = params.set('pageSize', filter.pageSize.toString());
    }

    return this.http.get<ApiResponse<AdminUserDto[]>>(this.baseUrl, { params }).pipe(
      map(response => {
        // Add debugging logs
        if (environment.logging.enableApiLogging) {
          console.log('Admin API Response:', response);
        }

        if (!response) {
          throw new Error('No response received from admin API');
        }

        if (!response.succeeded) {
          throw new Error(response.message || 'Failed to fetch admins');
        }

        if (!response.data) {
          console.warn('API response succeeded but data is null/undefined:', response);
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
        const adminArray = Array.isArray(response.data) ? response.data : [];
        const pageSize = filter?.pageSize || 10;
        const currentPage = filter?.page || 1;
        const totalCount = adminArray.length;
        const totalPages = Math.ceil(totalCount / pageSize);

        return {
          data: adminArray,
          totalCount: totalCount,
          currentPage: currentPage,
          pageSize: pageSize,
          totalPages: totalPages,
          hasPreviousPage: currentPage > 1,
          hasNextPage: currentPage < totalPages
        } as PaginatedResponse<AdminUserDto>;
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Get admin by ID
   */
  getAdminById(id: string): Observable<AdminUserDto> {
    return this.http.get<ApiResponse<AdminUserDto>>(`${this.baseUrl}/${id}`).pipe(
      map(response => {
        if (!response.succeeded) {
          throw new Error(response.message || 'Failed to fetch admin');
        }
        return response.data;
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Create new admin (SuperAdmin only)
   */
  createAdmin(admin: CreateAdminUserDto): Observable<AdminUserDto> {
    return this.http.post<ApiResponse<AdminUserDto>>(this.baseUrl, admin).pipe(
      map(response => {
        if (!response.succeeded) {
          throw new Error(response.message || 'Failed to create admin');
        }
        return response.data;
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Update existing admin
   */
  updateAdmin(id: string, admin: Partial<CreateAdminUserDto>): Observable<AdminUserDto> {
    return this.http.put<ApiResponse<AdminUserDto>>(`${this.baseUrl}/${id}`, admin).pipe(
      map(response => {
        if (!response.succeeded) {
          throw new Error(response.message || 'Failed to update admin');
        }
        return response.data;
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Activate admin
   */
  activateAdmin(id: string): Observable<AdminUserDto> {
    return this.http.post<ApiResponse<AdminUserDto>>(`${this.baseUrl}/${id}/activate`, {}).pipe(
      map(response => {
        if (!response.succeeded) {
          throw new Error(response.message || 'Failed to activate admin');
        }
        return response.data;
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Deactivate admin
   */
  deactivateAdmin(id: string): Observable<AdminUserDto> {
    return this.http.post<ApiResponse<AdminUserDto>>(`${this.baseUrl}/${id}/deactivate`, {}).pipe(
      map(response => {
        if (!response.succeeded) {
          throw new Error(response.message || 'Failed to deactivate admin');
        }
        return response.data;
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Update admin permissions
   */
  updateAdminPermissions(id: string, permissions: UpdatePermissionsDto): Observable<AdminUserDto> {
    return this.http.put<ApiResponse<AdminUserDto>>(`${this.baseUrl}/${id}/permissions`, permissions).pipe(
      map(response => {
        if (!response.succeeded) {
          throw new Error(response.message || 'Failed to update admin permissions');
        }
        return response.data;
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Get admin activity logs
   */
  getActivityLogs(filter?: AuditLogFilterDto): Observable<PaginatedResponse<ActivityLogDto>> {
    let params = new HttpParams();
    
    if (filter) {
      if (filter.adminId) params = params.set('adminId', filter.adminId);
      if (filter.action) params = params.set('action', filter.action);
      if (filter.entityType) params = params.set('entityType', filter.entityType);
      if (filter.entityId) params = params.set('entityId', filter.entityId);
      if (filter.dateFrom) params = params.set('dateFrom', filter.dateFrom);
      if (filter.dateTo) params = params.set('dateTo', filter.dateTo);
      if (filter.ipAddress) params = params.set('ipAddress', filter.ipAddress);
      if (filter.sortBy) params = params.set('sortBy', filter.sortBy);
      if (filter.sortOrder) params = params.set('sortOrder', filter.sortOrder);
      if (filter.page) params = params.set('page', filter.page.toString());
      if (filter.pageSize) params = params.set('pageSize', filter.pageSize.toString());
    }

    return this.http.get<ApiResponse<PaginatedResponse<ActivityLogDto>>>(`${this.baseUrl}/activity-logs`, { params }).pipe(
      map(response => {
        if (!response.succeeded) {
          throw new Error(response.message || 'Failed to fetch activity logs');
        }
        return response.data;
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Get admin activity logs by admin ID
   */
  getAdminActivityLogs(adminId: string, filter?: AuditLogFilterDto): Observable<PaginatedResponse<ActivityLogDto>> {
    let params = new HttpParams();
    
    if (filter) {
      if (filter.action) params = params.set('action', filter.action);
      if (filter.entityType) params = params.set('entityType', filter.entityType);
      if (filter.dateFrom) params = params.set('dateFrom', filter.dateFrom);
      if (filter.dateTo) params = params.set('dateTo', filter.dateTo);
      if (filter.page) params = params.set('page', filter.page.toString());
      if (filter.pageSize) params = params.set('pageSize', filter.pageSize.toString());
    }

    return this.http.get<ApiResponse<PaginatedResponse<ActivityLogDto>>>(`${this.baseUrl}/${adminId}/activity-logs`, { params }).pipe(
      map(response => {
        if (!response.succeeded) {
          throw new Error(response.message || 'Failed to fetch admin activity logs');
        }
        return response.data;
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Get all system settings
   */
  getSystemSettings(): Observable<SystemSettingsDto[]> {
    return this.http.get<ApiResponse<SystemSettingsDto[]>>(`${this.baseUrl}/system-settings`).pipe(
      map(response => {
        if (!response.succeeded) {
          throw new Error(response.message || 'Failed to fetch system settings');
        }
        return response.data;
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Get system setting by key
   */
  getSystemSetting(key: string): Observable<SystemSettingsDto> {
    return this.http.get<ApiResponse<SystemSettingsDto>>(`${this.baseUrl}/system-settings/${key}`).pipe(
      map(response => {
        if (!response.succeeded) {
          throw new Error(response.message || 'Failed to fetch system setting');
        }
        return response.data;
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Create system setting (SuperAdmin only)
   */
  createSystemSetting(setting: CreateSystemSettingDto): Observable<SystemSettingsDto> {
    return this.http.post<ApiResponse<SystemSettingsDto>>(`${this.baseUrl}/system-settings`, setting).pipe(
      map(response => {
        if (!response.succeeded) {
          throw new Error(response.message || 'Failed to create system setting');
        }
        return response.data;
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Update system setting (SuperAdmin only)
   */
  updateSystemSetting(key: string, setting: UpdateSystemSettingDto): Observable<SystemSettingsDto> {
    return this.http.put<ApiResponse<SystemSettingsDto>>(`${this.baseUrl}/system-settings/${key}`, setting).pipe(
      map(response => {
        if (!response.succeeded) {
          throw new Error(response.message || 'Failed to update system setting');
        }
        return response.data;
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Delete system setting (SuperAdmin only)
   */
  deleteSystemSetting(key: string): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${this.baseUrl}/system-settings/${key}`).pipe(
      map(response => {
        if (!response.succeeded) {
          throw new Error(response.message || 'Failed to delete system setting');
        }
        return response.data;
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Bulk admin operations (SuperAdmin only)
   */
  bulkAdminOperation(operation: BulkAdminOperationDto): Observable<BulkOperationResult> {
    return this.http.post<ApiResponse<BulkOperationResult>>(`${this.baseUrl}/bulk/operation`, operation).pipe(
      map(response => {
        if (!response.succeeded) {
          throw new Error(response.message || 'Failed to perform bulk operation');
        }
        return response.data;
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Send password reset email
   */
  sendPasswordReset(adminId: string): Observable<void> {
    return this.http.post<ApiResponse<void>>(`${this.baseUrl}/${adminId}/send-password-reset`, {}).pipe(
      map(response => {
        if (!response.succeeded) {
          throw new Error(response.message || 'Failed to send password reset email');
        }
        return response.data;
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Get admin analytics
   */
  getAdminAnalytics(): Observable<AdminAnalyticsDto> {
    return this.http.get<ApiResponse<AdminAnalyticsDto>>(`${this.baseUrl}/analytics`).pipe(
      map(response => {
        if (!response.succeeded) {
          throw new Error(response.message || 'Failed to fetch admin analytics');
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
      console.error('🔍 Full Admin API Error:', error);
      console.error('🔍 Error Status:', error.status);
      console.error('🔍 Error URL:', error.url);
      console.error('🔍 Error Headers:', error.headers);
    }

    if (error.error instanceof ErrorEvent) {
      // Client-side error
      errorMessage = `Client Error: ${error.error.message}`;
    } else {
      // Server-side error
      if (error.status === 0) {
        errorMessage = 'Network error - Unable to connect to the API server. Please check if the server is running.';
      } else if (error.status === 401) {
        errorMessage = 'Unauthorized - Please check your authentication token.';
      } else if (error.status === 403) {
        errorMessage = 'Forbidden - You do not have permission to access this resource.';
      } else if (error.status === 404) {
        errorMessage = 'Not Found - The requested endpoint was not found.';
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
      console.error('❌ Admin API Error Message:', errorMessage);
    }

    return throwError(() => new Error(errorMessage));
  }
}
