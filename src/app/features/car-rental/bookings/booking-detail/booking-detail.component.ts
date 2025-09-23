import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import { CarRentalService } from '../../../../core/services/car-rental.service';
import { Booking } from '../../../../core/models/car-rental.models';
import { BookingApiService } from '../../../../core/services/booking-api.service';
import { AdminBookingDto } from '../../../../core/models/api.models';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-booking-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslatePipe],
  template: `
    <div class="booking-detail-container">
      <div class="page-header">
        <div class="flex items-center gap-4">
          <a routerLink="/car-rental/bookings" class="btn btn-ghost btn-sm">
            <i class="bi bi-arrow-left"></i>
            {{ 'common.back' | translate }}
          </a>
          <div>
            <h1 class="page-title">{{ 'bookings.bookingDetails' | translate }}</h1>
            <p class="page-subtitle">{{ 'bookings.bookingDetailsDesc' | translate }}</p>
          </div>
        </div>
      </div>

      <div class="loading" *ngIf="isLoading()">
        <div class="spinner"></div>
        <p class="text-muted">{{ 'common.loading' | translate }}</p>
      </div>

      <div class="error" *ngIf="error() && !isLoading()">
        <p>{{ error() }}</p>
      </div>

      <div class="booking-content" *ngIf="booking() && !isLoading()">
        <div class="grid">
          <div class="card">
            <h3>{{ 'bookings.overview' | translate }}</h3>
            <div class="row"><span>{{ 'bookings.bookingId' | translate }}</span><strong>#{{ booking()!.id }}</strong></div>
            <div class="row"><span>{{ 'bookings.status' | translate }}</span><strong>{{ booking()!.status }}</strong></div>
            <div class="row"><span>{{ 'bookings.startDate' | translate }}</span><strong>{{ booking()!.startDate | date: 'mediumDate' }}</strong></div>
            <div class="row"><span>{{ 'bookings.endDate' | translate }}</span><strong>{{ booking()!.endDate | date: 'mediumDate' }}</strong></div>
            <div class="row"><span>{{ 'bookings.totalDays' | translate }}</span><strong>{{ booking()!.totalDays }}</strong></div>
          </div>

          <div class="card">
            <h3>{{ 'bookings.customer' | translate }}</h3>
            <div class="row"><span>{{ 'customers.name' | translate }}</span><strong>{{ customerName() }}</strong></div>
            <div class="row"><span>{{ 'customers.phone' | translate }}</span><strong>{{ customerPhone() }}</strong></div>
            <div class="row" *ngIf="customerEmail()"><span>{{ 'customers.email' | translate }}</span><strong>{{ customerEmail() }}</strong></div>
          </div>

          <div class="card">
            <h3>{{ 'vehicles.vehicle' | translate }}</h3>
            <div class="row"><span>{{ 'vehicles.vehicle' | translate }}</span><strong>{{ vehicleDisplay() }}</strong></div>
            <div class="row"><span>{{ 'vehicles.plateNumber' | translate }}</span><strong>{{ vehiclePlate() }}</strong></div>
          </div>

          <div class="card">
            <h3>{{ 'bookings.pickupDropoff' | translate }}</h3>
            <div class="row"><span>{{ 'bookings.pickupBranch' | translate }}</span><strong>{{ receivingBranchName() }}</strong></div>
            <div class="row"><span>{{ 'bookings.dropoffBranch' | translate }}</span><strong>{{ deliveryBranchName() }}</strong></div>
          </div>

          <div class="card">
            <h3>{{ 'bookings.billing' | translate }}</h3>
            <div class="row"><span>{{ 'bookings.subtotal' | translate }}</span><strong>{{ subtotal() | number:'1.2-2' }}</strong></div>
            <div class="row"><span>{{ 'bookings.taxes' | translate }}</span><strong>{{ taxes() | number:'1.2-2' }}</strong></div>
            <div class="row"><span>{{ 'bookings.fees' | translate }}</span><strong>{{ fees() | number:'1.2-2' }}</strong></div>
            <div class="row total"><span>{{ 'bookings.total' | translate }}</span><strong>{{ totalAmount() | number:'1.2-2' }}</strong></div>
          </div>
        </div>

        <div class="actions">
          <a [routerLink]="['/car-rental/bookings', booking()!.id, 'edit']" class="btn btn-primary">
            <i class="bi bi-pencil"></i>
            {{ 'common.edit' | translate }}
          </a>
          <a routerLink="/car-rental/bookings" class="btn btn-secondary">
            {{ 'common.back' | translate }}
          </a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .booking-detail-container { padding: 2rem; max-width: 1100px; margin: 0 auto; }
    .page-header { margin-bottom: 2rem; }
    .page-title { font-size: 1.875rem; font-weight: 700; color: var(--text-primary); margin: 0 0 0.5rem 0; }
    .page-subtitle { color: var(--text-secondary); margin: 0; }
    .loading, .error { display: flex; gap: .75rem; align-items: center; color: var(--text-secondary); }
    .grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1rem; }
    @media (max-width: 900px) { .grid { grid-template-columns: 1fr; } }
    .card { background: var(--white); border: 1px solid var(--border-light); border-radius: var(--radius-lg); padding: 1rem 1.25rem; box-shadow: var(--shadow-sm); }
    .card h3 { margin: 0 0 .75rem 0; font-size: 1rem; font-weight: 600; color: var(--text-primary); }
    .row { display: flex; justify-content: space-between; padding: .4rem 0; border-bottom: 1px dashed var(--border-light); }
    .row:last-child { border-bottom: 0; }
    .row span { color: var(--text-secondary); }
    .row strong { color: var(--text-primary); }
    .row.total { font-weight: 700; }
    .actions { display: flex; gap: .75rem; margin-top: 1.25rem; }
  `]
})
export class BookingDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private carRentalService = inject(CarRentalService);
  private bookingApiService = inject(BookingApiService);

  isLoading = signal(false);
  error = signal<string | null>(null);

  // Unified display state derived from either AdminBookingDto or Booking
  booking = signal<{
    id: string;
    status: string;
    startDate: Date;
    endDate: Date;
    totalDays: number;
    customerName?: string;
    customerPhone?: string;
    customerEmail?: string;
    vehicleBrand?: string;
    vehicleModel?: string;
    vehiclePlate?: string;
    receivingBranchName?: string;
    deliveryBranchName?: string;
    subtotal?: number;
    taxes?: number;
    fees?: number;
    totalAmount?: number;
  } | null>(null);

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.error.set('Invalid booking id');
      return;
    }
    this.loadBooking(id);
  }

  private loadBooking(id: string) {
    this.isLoading.set(true);
    this.error.set(null);

    const useRealApi = !environment.features?.mockData;

    if (useRealApi) {
      this.bookingApiService.getBookingById(parseInt(id)).subscribe({
        next: (dto: AdminBookingDto) => {
          this.booking.set(this.mapAdminBookingDto(dto));
          this.isLoading.set(false);
        },
        error: (err) => {
          console.error('Error loading booking:', err);
          this.error.set('Failed to load booking');
          this.isLoading.set(false);
        }
      });
      return;
    }

    this.carRentalService.getBookingById(id).subscribe({
      next: (b: Booking | null) => {
        if (!b) {
          this.error.set('Booking not found');
        } else {
          this.booking.set(this.mapBooking(b));
        }
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading booking:', err);
        this.error.set('Failed to load booking');
        this.isLoading.set(false);
      }
    });
  }

  private mapAdminBookingDto(dto: AdminBookingDto) {
    const start = new Date(dto.startDate);
    const end = new Date(dto.endDate);
    const oneDayMs = 24 * 60 * 60 * 1000;
    const totalDays = Math.max(1, Math.round((end.getTime() - start.getTime()) / oneDayMs));

    // Taxes/fees not provided in DTO; default to 0
    return {
      id: dto.id.toString(),
      status: dto.status,
      startDate: start,
      endDate: end,
      totalDays,
      customerName: dto.customerName,
      customerPhone: dto.customerPhone,
      customerEmail: dto.customerEmail,
      vehicleBrand: dto.carBrand,
      vehicleModel: dto.carModel,
      vehiclePlate: dto.carPlateNumber,
      receivingBranchName: dto.receivingBranchName,
      deliveryBranchName: dto.deliveryBranchName,
      subtotal: dto.totalAmount,
      taxes: 0,
      fees: 0,
      totalAmount: dto.totalAmount
    };
  }

  private mapBooking(b: Booking) {
    return {
      id: b.id,
      status: b.status,
      startDate: new Date(b.startDate),
      endDate: new Date(b.endDate),
      totalDays: b.totalDays,
      customerName: `${b.customer.firstName} ${b.customer.lastName}`,
      customerPhone: b.customer.phone,
      customerEmail: b.customer.email,
      vehicleBrand: b.vehicle.make,
      vehicleModel: b.vehicle.model,
      vehiclePlate: b.vehicle.licensePlate,
      receivingBranchName: b.pickupLocation,
      deliveryBranchName: b.dropoffLocation,
      subtotal: b.subtotal,
      taxes: b.taxes,
      fees: b.fees,
      totalAmount: b.totalAmount
    };
  }

  // Template helpers
  customerName = () => this.booking()?.customerName || '';
  customerPhone = () => this.booking()?.customerPhone || '';
  customerEmail = () => this.booking()?.customerEmail || '';
  vehicleDisplay = () => `${this.booking()?.vehicleBrand || ''} ${this.booking()?.vehicleModel || ''}`.trim();
  vehiclePlate = () => this.booking()?.vehiclePlate || '';
  receivingBranchName = () => this.booking()?.receivingBranchName || '';
  deliveryBranchName = () => this.booking()?.deliveryBranchName || '';
  subtotal = () => this.booking()?.subtotal || 0;
  taxes = () => this.booking()?.taxes || 0;
  fees = () => this.booking()?.fees || 0;
  totalAmount = () => this.booking()?.totalAmount || 0;
}
