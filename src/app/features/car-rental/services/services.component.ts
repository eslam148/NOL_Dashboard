import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  template: `
    <div class="services-container">
      <div class="page-header">
        <h1 class="page-title">{{ 'services.title' | translate }}</h1>
        <p class="page-subtitle">{{ 'services.subtitle' | translate }}</p>
      </div>
      
      <div class="coming-soon">
        <div class="coming-soon-icon">
          <i class="bi bi-plus-circle"></i>
        </div>
        <h3>{{ 'services.comingSoon' | translate }}</h3>
        <p>{{ 'services.comingSoonDesc' | translate }}</p>
        <div class="features-preview">
          <div class="feature-item">
            <i class="bi bi-compass"></i>
            <span>{{ 'services.gpsNavigation' | translate }}</span>
          </div>
          <div class="feature-item">
            <i class="bi bi-shield-check"></i>
            <span>{{ 'services.insurance' | translate }}</span>
          </div>
          <div class="feature-item">
            <i class="bi bi-person-hearts"></i>
            <span>{{ 'services.childSeats' | translate }}</span>
          </div>
          <div class="feature-item">
            <i class="bi bi-tools"></i>
            <span>{{ 'services.equipment' | translate }}</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .services-container {
      padding: 2rem;
      max-width: 1200px;
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
    
    .coming-soon {
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
    
    .coming-soon-icon {
      width: 5rem;
      height: 5rem;
      border-radius: var(--radius-full);
      background: linear-gradient(135deg, var(--brand-primary), var(--brand-secondary));
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 2rem;
    }
    
    .coming-soon-icon i {
      font-size: 2rem;
      color: var(--gray-900);
    }
    
    .coming-soon h3 {
      font-size: 1.5rem;
      font-weight: 600;
      color: var(--text-primary);
      margin: 0 0 1rem 0;
    }
    
    .coming-soon p {
      color: var(--text-secondary);
      margin: 0 0 3rem 0;
      max-width: 500px;
      line-height: 1.6;
    }
    
    .features-preview {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1.5rem;
      width: 100%;
      max-width: 600px;
    }
    
    .feature-item {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.75rem;
      padding: 1.5rem;
      background: var(--gray-50);
      border-radius: var(--radius-lg);
      transition: all var(--transition-normal);
    }
    
    .feature-item:hover {
      background: var(--brand-secondary);
      transform: translateY(-2px);
    }
    
    .feature-item i {
      font-size: 1.5rem;
      color: var(--brand-primary);
    }
    
    .feature-item span {
      font-size: 0.875rem;
      font-weight: 500;
      color: var(--text-primary);
      text-align: center;
    }
    
    @media (max-width: 768px) {
      .services-container {
        padding: 1rem;
      }
      
      .features-preview {
        grid-template-columns: repeat(2, 1fr);
        gap: 1rem;
      }
      
      .feature-item {
        padding: 1rem;
      }
    }
    
    @media (max-width: 480px) {
      .features-preview {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class ServicesComponent { }
