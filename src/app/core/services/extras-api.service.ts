import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export type ExtraType =
  | 'GPS' | 'ChildSeat' | 'AdditionalDriver' | 'Insurance'
  | 'WifiHotspot' | 'PhoneCharger' | 'Bluetooth' | 'RoofRack'
  | 'SkiRack' | 'BikeRack';

export interface ExtraDto {
  id: number;
  extraType: ExtraType;
  name: string;
  description: string;
  dailyPrice: number;
  weeklyPrice: number;
  monthlyPrice: number;
}

export interface ApiResponse<T> {
  succeeded: boolean;
  message: string;
  internalMessage?: string | null;
  errors: any[];
  stackTrace?: string | null;
  data: T;
  statusCode: string;
  statusCodeValue: number;
}

@Injectable({ providedIn: 'root' })
export class ExtrasApiService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.api.baseUrl.replace(/\/$/, '')}/extras`;

  getAll(): Observable<ExtraDto[]> {
    return this.http.get<ApiResponse<ExtraDto[]>>(this.baseUrl).pipe(
      map(res => {
        if (!res.succeeded) throw new Error(res.message || 'Failed to load extras');
        return res.data || [];
      }),
      catchError(err => { throw err; })
    );
  }

  getActive(): Observable<ExtraDto[]> {
    return this.http.get<ApiResponse<ExtraDto[]>>(`${this.baseUrl}/active`).pipe(
      map(res => {
        if (!res.succeeded) throw new Error(res.message || 'Failed to load active extras');
        return res.data || [];
      }),
      catchError(err => { throw err; })
    );
  }

  getById(id: number): Observable<ExtraDto> {
    return this.http.get<ApiResponse<ExtraDto>>(`${this.baseUrl}/${id}`).pipe(
      map(res => {
        if (!res.succeeded || !res.data) throw new Error(res.message || 'Extra not found');
        return res.data;
      }),
      catchError(err => { throw err; })
    );
  }

  getByType(type: ExtraType): Observable<ExtraDto[]> {
    return this.http.get<ApiResponse<ExtraDto[]>>(`${this.baseUrl}/type/${type}`).pipe(
      map(res => {
        if (!res.succeeded) throw new Error(res.message || 'Failed to load extras by type');
        return res.data || [];
      }),
      catchError(err => { throw err; })
    );
  }
}


