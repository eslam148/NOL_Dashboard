import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  template: `
    <div class="unauthorized-container">
      <div class="unauthorized-content">
        <div class="error-icon">
          <svg width="80" height="80" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" fill="currentColor"/>
            <path d="M12 7v6m0 4h.01" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          </svg>
        </div>
        
        <h1 class="error-title text-primary">{{ 'common.accessDenied' | translate }}</h1>
        <p class="error-message text-secondary">
          {{ 'common.noPermission' | translate }}
        </p>
        
        @if (authService.currentUser()) {
          <div class="user-info">
            <p class="text-muted">
              Signed in as: <strong>{{ authService.currentUser()?.email }}</strong><br>
              Role: <strong>{{ authService.currentUser()?.role }}</strong>
            </p>
          </div>
        }
        
        <div class="action-buttons">
          <button 
            class="btn btn-primary" 
            (click)="goToDashboard()"
          >
            Go to Dashboard
          </button>
          
          <button 
            class="btn btn-secondary" 
            (click)="goBack()"
          >
            Go Back
          </button>
          
          @if (authService.currentUser()) {
            <button 
              class="btn btn-dark" 
              (click)="logout()"
            >
              Sign Out
            </button>
          }
        </div>
        
        <div class="help-text">
          <p class="text-muted">
            If you believe this is an error, please contact your administrator.
          </p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .unauthorized-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, var(--primary-cream) 0%, var(--primary-white) 100%);
      padding: 2rem;
    }

    .unauthorized-content {
      text-align: center;
      max-width: 500px;
      width: 100%;
    }

    .error-icon {
      margin-bottom: 2rem;
      color: var(--primary-yellow);
      display: flex;
      justify-content: center;
    }

    .error-icon svg {
      filter: drop-shadow(0 4px 8px rgba(228, 182, 61, 0.2));
    }

    .error-title {
      font-size: 2.5rem;
      font-weight: 700;
      margin: 0 0 1rem 0;
      color: var(--primary-dark);
    }

    .error-message {
      font-size: 1.125rem;
      margin: 0 0 2rem 0;
      line-height: 1.6;
    }

    .user-info {
      background: var(--primary-white);
      border: 1px solid var(--border-light);
      border-radius: 0.75rem;
      padding: 1.5rem;
      margin-bottom: 2rem;
      box-shadow: 0 2px 8px var(--shadow-light);
    }

    .user-info p {
      margin: 0;
      line-height: 1.6;
    }

    .action-buttons {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .action-buttons .btn {
      padding: 0.875rem 1.5rem;
      font-size: 1rem;
      font-weight: 500;
      border-radius: 0.5rem;
      transition: all 0.2s ease;
    }

    .help-text {
      margin-top: 2rem;
    }

    .help-text p {
      margin: 0;
      font-size: 0.875rem;
      line-height: 1.5;
    }

    @media (min-width: 640px) {
      .action-buttons {
        flex-direction: row;
        justify-content: center;
        flex-wrap: wrap;
      }
      
      .action-buttons .btn {
        flex: 0 0 auto;
        min-width: 140px;
      }
    }

    @media (max-width: 480px) {
      .unauthorized-container {
        padding: 1rem;
      }
      
      .error-title {
        font-size: 2rem;
      }
      
      .error-message {
        font-size: 1rem;
      }
      
      .user-info {
        padding: 1rem;
      }
    }
  `]
})
export class UnauthorizedComponent {
  constructor(
    private router: Router,
    public authService: AuthService
  ) {}

  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  goBack(): void {
    window.history.back();
  }

  logout(): void {
    this.authService.logout();
  }
}
