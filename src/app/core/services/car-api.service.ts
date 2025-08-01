import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { 
  ApiResponse, 
  PaginatedResponse,
  AdminCarDto, 
  AdminCreateCarDto,
  CarFilterDto,
  UpdateCarStatusDto,
  BulkCarOperationDto,
  BulkOperationResult,
  ImportResult
} from '../models/api.models';

@Injectable({
  providedIn: 'root'
})
export class CarApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.api.baseUrl}/admin/cars`;

  /**
   * Get all cars with filtering and pagination
   */
  getCars(filter?: CarFilterDto): Observable<PaginatedResponse<AdminCarDto>> {
    let params = new HttpParams();
    
    if (filter) {
      if (filter.status) params = params.set('status', filter.status);
      if (filter.categoryId) params = params.set('categoryId', filter.categoryId.toString());
      if (filter.branchId) params = params.set('branchId', filter.branchId.toString());
      if (filter.brand) params = params.set('brand', filter.brand);
      if (filter.model) params = params.set('model', filter.model);
      if (filter.yearFrom) params = params.set('yearFrom', filter.yearFrom.toString());
      if (filter.yearTo) params = params.set('yearTo', filter.yearTo.toString());
      if (filter.dailyRateFrom) params = params.set('dailyRateFrom', filter.dailyRateFrom.toString());
      if (filter.dailyRateTo) params = params.set('dailyRateTo', filter.dailyRateTo.toString());
      if (filter.transmissionType) params = params.set('transmissionType', filter.transmissionType);
      if (filter.fuelType) params = params.set('fuelType', filter.fuelType);
      if (filter.sortBy) params = params.set('sortBy', filter.sortBy);
      if (filter.sortOrder) params = params.set('sortOrder', filter.sortOrder);
      if (filter.page) params = params.set('page', filter.page.toString());
      if (filter.pageSize) params = params.set('pageSize', filter.pageSize.toString());
    }

    return this.http.get<ApiResponse<AdminCarDto[]>>(this.baseUrl, { params }).pipe(
      map(response => {
        // Add debugging logs
        if (environment.logging.enableApiLogging) {
          console.log('Car API Response:', response);
        }

        if (!response) {
          throw new Error('No response received from car API');
        }

        if (!response.succeeded) {
          throw new Error(response.message || 'Failed to fetch cars');
        }

        if (!response.data) {
          console.warn('Car API response succeeded but data is null/undefined:', response);
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
        const carArray = Array.isArray(response.data) ? response.data : [];
        const pageSize = filter?.pageSize || 10;
        const pageNumber = filter?.page || 1;
        const totalCount = carArray.length;
        const totalPages = Math.ceil(totalCount / pageSize);

        return {
          data: carArray,
          totalCount: totalCount,
          pageNumber: pageNumber,
          pageSize: pageSize,
          totalPages: totalPages,
          hasPreviousPage: pageNumber > 1,
          hasNextPage: pageNumber < totalPages
        } as PaginatedResponse<AdminCarDto>;
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Get car by ID
   */
  getCarById(id: number): Observable<AdminCarDto> {
    return this.http.get<ApiResponse<AdminCarDto>>(`${this.baseUrl}/${id}`).pipe(
      map(response => {
        if (!response.succeeded) {
          throw new Error(response.message || 'Failed to fetch car');
        }
        return response.data;
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Create new car
   */
  createCar(car: AdminCreateCarDto): Observable<AdminCarDto> {
    return this.http.post<ApiResponse<AdminCarDto>>(this.baseUrl, car).pipe(
      map(response => {
        if (!response.succeeded) {
          throw new Error(response.message || 'Failed to create car');
        }
        return response.data;
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Update existing car
   */
  updateCar(id: number, car: Partial<AdminCreateCarDto>): Observable<AdminCarDto> {
    return this.http.put<ApiResponse<AdminCarDto>>(`${this.baseUrl}/${id}`, car).pipe(
      map(response => {
        if (!response.succeeded) {
          throw new Error(response.message || 'Failed to update car');
        }
        return response.data;
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Delete car
   */
  deleteCar(id: number): Observable<void> {
    return this.http.delete<ApiResponse<void>>(`${this.baseUrl}/${id}`).pipe(
      map(response => {
        if (!response.succeeded) {
          throw new Error(response.message || 'Failed to delete car');
        }
        return response.data;
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Update car status
   */
  updateCarStatus(id: number, statusUpdate: UpdateCarStatusDto): Observable<AdminCarDto> {
    return this.http.patch<ApiResponse<AdminCarDto>>(`${this.baseUrl}/${id}/status`, statusUpdate).pipe(
      map(response => {
        if (!response.succeeded) {
          throw new Error(response.message || 'Failed to update car status');
        }
        return response.data;
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Bulk operations on cars
   */
  bulkOperation(operation: BulkCarOperationDto): Observable<BulkOperationResult> {
    return this.http.post<ApiResponse<BulkOperationResult>>(`${this.baseUrl}/bulk`, operation).pipe(
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
   * Import cars from file
   */
  importCars(file: File): Observable<ImportResult<AdminCarDto>> {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<ApiResponse<ImportResult<AdminCarDto>>>(`${this.baseUrl}/import`, formData).pipe(
      map(response => {
        if (!response.succeeded) {
          throw new Error(response.message || 'Failed to import cars');
        }
        return response.data;
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Export cars to file
   */
  exportCars(filter?: CarFilterDto, format: 'excel' | 'pdf' = 'excel'): Observable<Blob> {
    let params = new HttpParams().set('format', format);
    
    if (filter) {
      if (filter.status) params = params.set('status', filter.status);
      if (filter.categoryId) params = params.set('categoryId', filter.categoryId.toString());
      if (filter.branchId) params = params.set('branchId', filter.branchId.toString());
      if (filter.brand) params = params.set('brand', filter.brand);
      if (filter.model) params = params.set('model', filter.model);
    }

    return this.http.get(`${this.baseUrl}/export`, { 
      params, 
      responseType: 'blob' 
    }).pipe(
      catchError(this.handleError)
    );
  }

  /**
   * Get car analytics
   */
  getCarAnalytics(filter?: CarFilterDto): Observable<any> {
    let params = new HttpParams();
    
    if (filter) {
      if (filter.branchId) params = params.set('branchId', filter.branchId.toString());
      if (filter.categoryId) params = params.set('categoryId', filter.categoryId.toString());
    }

    return this.http.get<ApiResponse<any>>(`${this.baseUrl}/analytics`, { params }).pipe(
      map(response => {
        if (!response.succeeded) {
          throw new Error(response.message || 'Failed to fetch car analytics');
        }
        return response.data;
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Get available cars for booking
   */
  getAvailableCars(startDate: string, endDate: string, branchId?: number): Observable<AdminCarDto[]> {
    let params = new HttpParams()
      .set('startDate', startDate)
      .set('endDate', endDate);
    
    if (branchId) {
      params = params.set('branchId', branchId.toString());
    }

    return this.http.get<ApiResponse<AdminCarDto[]>>(`${this.baseUrl}/available`, { params }).pipe(
      map(response => {
        if (!response.succeeded) {
          throw new Error(response.message || 'Failed to fetch available cars');
        }
        return response.data;
      }),
      catchError(this.handleError)
    );
  }

  /**
   * Get car booking history
   */
  getCarBookingHistory(carId: number): Observable<any[]> {
    return this.http.get<ApiResponse<any[]>>(`${this.baseUrl}/${carId}/bookings`).pipe(
      map(response => {
        if (!response.succeeded) {
          throw new Error(response.message || 'Failed to fetch car booking history');
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
      console.error('🔍 Full Car API Error:', error);
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
        errorMessage = 'Network error - Unable to connect to the Car API server. Please check if the server is running.';
      } else if (error.status === 401) {
        errorMessage = 'Unauthorized - Please check your authentication token.';
      } else if (error.status === 403) {
        errorMessage = 'Forbidden - You do not have permission to access this resource.';
      } else if (error.status === 404) {
        errorMessage = 'Not Found - The requested car endpoint was not found.';
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
      console.error('❌ Car API Error Message:', errorMessage);
    }

    return throwError(() => new Error(errorMessage));
  }
}
