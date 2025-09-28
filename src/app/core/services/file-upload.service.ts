import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpEvent, HttpEventType, HttpProgressEvent, HttpHeaders } from '@angular/common/http';
import { Observable, map, catchError, throwError, filter } from 'rxjs';
import { FileUploadResultDto } from '../models/api.models';
import { environment } from '../../../environments/environment';

export interface ApiResponse<T> {
  success?: boolean;
  succeeded?: boolean;
  data: T;
  message?: string;
  internalMessage?: string;
  errors?: string[];
  stackTrace?: string;
  statusCode?: string;
  statusCodeValue?: number;
}

export interface UploadProgress {
  loaded: number;
  total: number;
  percentage: number;
}

@Injectable({
  providedIn: 'root'
})
export class FileUploadService {
  private http = inject(HttpClient);
  
  // Base URL for file uploads - adjust according to your API
  private readonly baseUrl = environment.api.baseUrl; // Replace with your actual API base URL

  /**
   * Upload a single file to the server
   * @param file The file to upload
   * @param folder Optional folder to organize files
   * @returns Observable with upload result
   */
  uploadFile(file: File, folder?: string): Observable<FileUploadResultDto> {
    const formData = new FormData();
    formData.append('file', file);

    const params: any = {};
    if (folder) {
      params.folder = folder;
    }

    return this.http.post<ApiResponse<FileUploadResultDto>>(
      `${this.baseUrl}/Files/upload`,
      formData,
      {
        params,
        reportProgress: false, // Set to true if you need progress tracking
        headers: {
          'Accept': 'application/json, text/plain, */*'
          // Explicitly don't set Content-Type - Angular will set it correctly for FormData
        }
      }
    ).pipe(
      map(response => {
        console.log('📁 Upload response:', response);
        
        // Handle different response formats
        if (response && typeof response === 'object') {
          // If response has succeeded/data structure (actual API format)
          if ('succeeded' in response && 'data' in response) {
            if (response.succeeded && response.data) {
              // Convert relative fileUrl to full URL if needed
              const fileData = response.data as any;
              if (fileData.fileUrl && fileData.fileUrl.startsWith('/')) {
                fileData.fileUrl = `${this.baseUrl.replace('/api', '')}${fileData.fileUrl}`;
              }
              return fileData;
            } else {
              throw new Error(response.message || 'Upload failed');
            }
          }
          // If response has success/data structure (ApiResponse format)
          else if ('success' in response && 'data' in response) {
            if (response.success && response.data) {
              return response.data;
            } else {
              throw new Error(response.message || 'Upload failed');
            }
          }
          // If response is directly the FileUploadResultDto
          else if ('fileName' in response && 'fileUrl' in response) {
            return response as unknown as FileUploadResultDto;
          }
        }
        
        throw new Error('Invalid response format');
      }),
      catchError(error => {
        console.error('File upload error:', error);
        return throwError(() => this.handleUploadError(error));
      })
    );
  }

  /**
   * Upload a file with progress tracking
   * @param file The file to upload
   * @param folder Optional folder to organize files
   * @returns Observable with upload progress and result
   */
  uploadFileWithProgress(file: File, folder?: string): Observable<UploadProgress | FileUploadResultDto> {
    const formData = new FormData();
    formData.append('file', file);

    const params: any = {};
    if (folder) {
      params.folder = folder;
    }

    return this.http.post<FileUploadResultDto>(
      `${this.baseUrl}/Files/upload`,
      formData,
      {
        params,
        reportProgress: true,
        observe: 'events',
        headers: {
          'Accept': 'application/json, text/plain, */*'
          // Explicitly don't set Content-Type - Angular will set it correctly for FormData
        }
      }
    ).pipe(
      map((event: HttpEvent<FileUploadResultDto>) => {
        switch (event.type) {
          case HttpEventType.UploadProgress:
            const progress = event as HttpProgressEvent;
            return {
              loaded: progress.loaded,
              total: progress.total || 0,
              percentage: Math.round(100 * progress.loaded / (progress.total || 1))
            } as UploadProgress;
          
          case HttpEventType.Response:
            return event.body as FileUploadResultDto;
          
          default:
            // Filter out other event types by throwing an error that will be caught
            throw new Error('Unexpected event type');
        }
      }),
      filter((result): result is UploadProgress | FileUploadResultDto => result !== null),
      catchError(error => {
        console.error('File upload with progress error:', error);
        return throwError(() => this.handleUploadError(error));
      })
    );
  }

  /**
   * Upload multiple files
   * @param files Array of files to upload
   * @param folder Optional folder to organize files
   * @returns Observable with array of upload results
   */
  uploadMultipleFiles(files: File[], folder?: string): Observable<FileUploadResultDto[]> {
    const uploadObservables = files.map(file => this.uploadFile(file, folder));
    
    return new Observable(observer => {
      const results: FileUploadResultDto[] = [];
      let completed = 0;
      
      uploadObservables.forEach((upload$, index) => {
        upload$.subscribe({
          next: (result) => {
            results[index] = result;
            completed++;
            
            if (completed === files.length) {
              observer.next(results);
              observer.complete();
            }
          },
          error: (error) => {
            observer.error(error);
          }
        });
      });
    });
  }

  /**
   * Delete an uploaded file
   * @param fileUrl The URL of the file to delete
   * @returns Observable with deletion result
   */
  deleteFile(fileUrl: string): Observable<boolean> {
    return this.http.delete<ApiResponse<boolean>>(`${this.baseUrl}/Files/delete`, {
      params: { fileUrl }
    }).pipe(
      map(response => response.success || response.succeeded || false),
      catchError(error => {
        console.error('File deletion error:', error);
        return throwError(() => this.handleUploadError(error));
      })
    );
  }

  /**
   * Get file information
   * @param fileUrl The URL of the file
   * @returns Observable with file information
   */
  getFileInfo(fileUrl: string): Observable<FileUploadResultDto> {
    return this.http.get<ApiResponse<FileUploadResultDto>>(`${this.baseUrl}/Files/info`, {
      params: { fileUrl }
    }).pipe(
      map(response => {
        if ((response.success || response.succeeded) && response.data) {
          return response.data;
        } else {
          throw new Error(response.message || 'Failed to get file info');
        }
      }),
      catchError(error => {
        console.error('Get file info error:', error);
        return throwError(() => this.handleUploadError(error));
      })
    );
  }

  /**
   * Validate file before upload
   * @param file The file to validate
   * @param maxSizeMB Maximum file size in MB
   * @param allowedTypes Array of allowed MIME types
   * @returns Validation result
   */
  validateFile(file: File, maxSizeMB: number = 5, allowedTypes: string[] = ['image/jpeg', 'image/png', 'image/webp']): { isValid: boolean; error?: string } {
    // Check file type
    if (!allowedTypes.includes(file.type)) {
      return { isValid: false, error: 'Invalid file type' };
    }

    // Check file size
    const maxSizeBytes = maxSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return { isValid: false, error: `File size exceeds ${maxSizeMB}MB limit` };
    }

    return { isValid: true };
  }

  /**
   * Format file size for display
   * @param bytes File size in bytes
   * @returns Formatted file size string
   */
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Extract file name from URL
   * @param fileUrl The file URL
   * @returns File name
   */
  getFileNameFromUrl(fileUrl: string): string {
    try {
      const url = new URL(fileUrl);
      const pathname = url.pathname;
      return pathname.substring(pathname.lastIndexOf('/') + 1);
    } catch {
      return 'unknown-file';
    }
  }

  /**
   * Handle upload errors
   * @param error The error object
   * @returns Formatted error message
   */
  private handleUploadError(error: any): string {
    console.error('📁 Upload error details:', error);
    
    if (error.error?.message) {
      return error.error.message;
    } else if (error.message) {
      return error.message;
    } else if (error.status === 413) {
      return 'File size too large';
    } else if (error.status === 415) {
      return 'Unsupported file type or media type. Please ensure you are uploading an image file.';
    } else if (error.status === 400) {
      return 'Bad request - please check your file and try again';
    } else if (error.status === 401) {
      return 'Unauthorized - please check your authentication';
    } else if (error.status === 0) {
      return 'Network error - please check your connection';
    } else {
      return `Upload failed (Status: ${error.status}) - please try again`;
    }
  }

  /**
   * Check if URL is a valid file URL
   * @param url The URL to check
   * @returns True if valid file URL
   */
  isValidFileUrl(url: string): boolean {
    try {
      const urlObj = new URL(url);
      return ['http:', 'https:'].includes(urlObj.protocol);
    } catch {
      return false;
    }
  }
}
