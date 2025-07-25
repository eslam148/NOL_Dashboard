import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-vehicle-form',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslatePipe],
  template: `
    <div class="vehicle-form-container">
      <div class="page-header">
        <h1 class="page-title">{{ 'vehicles.addVehicle' | translate }}</h1>
        <p class="page-subtitle">{{ 'vehicles.addVehicleDesc' | translate }}</p>
      </div>
      
      <div class="form-placeholder">
        <div class="placeholder-icon">
          <i class="bi bi-car-front"></i>
        </div>
        <h3>{{ 'vehicles.formComingSoon' | translate }}</h3>
        <p>{{ 'vehicles.formComingSoonDesc' | translate }}</p>
        <a routerLink="/car-rental/vehicles" class="btn btn-primary">
          <i class="bi bi-arrow-left"></i>
          {{ 'common.back' | translate }}
        </a>
      </div>
    </div>
  `,
  styles: [`
    .vehicle-form-container {
      padding: 2rem;
      max-width: 800px;
      margin: 0 auto;
    }
    
    .page-title {
      font-size: 1.875rem;
      font-weight: 700;
      color: var(--text-primary);
      margin: 0 0 0.5rem 0;
    }
    
    .page-subtitle {
      color: var(--text-secondary);
      margin: 0 0 2rem 0;
    }
    
    .form-placeholder {
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
    
    .form-placeholder h3 {
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--text-primary);
      margin: 0 0 0.75rem 0;
    }
    
    .form-placeholder p {
      color: var(--text-secondary);
      margin: 0 0 2rem 0;
      max-width: 400px;
    }
  `]
})
export class VehicleFormComponent { }
