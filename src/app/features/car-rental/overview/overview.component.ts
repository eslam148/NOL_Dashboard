import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-overview',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  template: `
    <div class="overview-container">
      <div class="welcome-section">
        <h2 class="text-2xl font-bold text-primary mb-4">{{ 'dashboard.welcome' | translate }}</h2>
        <p class="text-secondary mb-6">{{ 'dashboard.welcomeMessage' | translate }}</p>
        
        <div class="feature-grid">
          <div class="feature-card">
            <i class="bi bi-geo-alt-fill"></i>
            <h3>{{ 'dashboard.manageBranches' | translate }}</h3>
            <p>{{ 'dashboard.manageBranchesDesc' | translate }}</p>
          </div>
          
          <div class="feature-card">
            <i class="bi bi-car-front-fill"></i>
            <h3>{{ 'dashboard.manageVehicles' | translate }}</h3>
            <p>{{ 'dashboard.manageVehiclesDesc' | translate }}</p>
          </div>
          
          <div class="feature-card">
            <i class="bi bi-calendar-check-fill"></i>
            <h3>{{ 'dashboard.manageBookings' | translate }}</h3>
            <p>{{ 'dashboard.manageBookingsDesc' | translate }}</p>
          </div>
          
          <div class="feature-card">
            <i class="bi bi-people-fill"></i>
            <h3>{{ 'dashboard.manageCustomers' | translate }}</h3>
            <p>{{ 'dashboard.manageCustomersDesc' | translate }}</p>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .overview-container {
      padding: 2rem;
    }
    
    .welcome-section {
      max-width: 800px;
      margin: 0 auto;
      text-align: center;
    }
    
    .feature-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
      margin-top: 2rem;
    }
    
    .feature-card {
      background: var(--white);
      border: 1px solid var(--border-light);
      border-radius: var(--radius-xl);
      padding: 2rem;
      text-align: center;
      transition: all var(--transition-normal);
      box-shadow: var(--shadow-sm);
    }
    
    .feature-card:hover {
      transform: translateY(-4px);
      box-shadow: var(--shadow-lg);
    }
    
    .feature-card i {
      font-size: 2.5rem;
      color: var(--brand-primary);
      margin-bottom: 1rem;
    }
    
    .feature-card h3 {
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--text-primary);
      margin-bottom: 0.75rem;
    }
    
    .feature-card p {
      color: var(--text-secondary);
      font-size: 0.875rem;
      line-height: 1.5;
    }
  `]
})
export class OverviewComponent { }
