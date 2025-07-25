import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';

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
      
      <div class="detail-placeholder">
        <div class="placeholder-icon">
          <i class="bi bi-calendar-check"></i>
        </div>
        <h3>{{ 'bookings.detailComingSoon' | translate }}</h3>
        <p>{{ 'bookings.detailComingSoonDesc' | translate }}</p>
        <a routerLink="/car-rental/bookings" class="btn btn-primary">
          <i class="bi bi-arrow-left"></i>
          {{ 'common.back' | translate }}
        </a>
      </div>
    </div>
  `,
  styles: [`
    .booking-detail-container {
      padding: 2rem;
      max-width: 1000px;
      margin: 0 auto;
    }
    
    .page-header {
      margin-bottom: 2rem;
    }
    
    .page-title {
      font-size: 1.875rem;
      font-weight: 700;
      color: var(--text-primary);
      margin: 0 0 0.5rem 0;
    }
    
    .page-subtitle {
      color: var(--text-secondary);
      margin: 0;
    }
    
    .detail-placeholder {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 4rem 2rem;
      text-align: center;
      background: var(--white);
      border: 1px solid var(--border-light);
      border-radius: var(--radius-xl);
      box-shadow: var(--shadow-sm);
    }
    
    .placeholder-icon {
      width: 4rem;
      height: 4rem;
      border-radius: var(--radius-full);
      background: var(--gray-100);
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 1.5rem;
    }
    
    .placeholder-icon i {
      font-size: 1.5rem;
      color: var(--text-muted);
    }
    
    .detail-placeholder h3 {
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--text-primary);
      margin: 0 0 0.75rem 0;
    }
    
    .detail-placeholder p {
      color: var(--text-secondary);
      margin: 0 0 2rem 0;
      max-width: 400px;
    }
  `]
})
export class BookingDetailComponent { }
