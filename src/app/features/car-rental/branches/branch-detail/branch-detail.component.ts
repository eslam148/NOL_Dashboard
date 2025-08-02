import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import { CarRentalService } from '../../../../core/services/car-rental.service';
import { Branch } from '../../../../core/models/car-rental.models';

@Component({
  selector: 'app-branch-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslatePipe],
  template: `
    <div class="branch-detail-container">
      <!-- Header -->
      <div class="page-header">
        <div class="flex items-center gap-4">
          <a routerLink="/car-rental/branches" class="btn btn-ghost btn-sm">
            <i class="bi bi-arrow-left"></i>
            {{ 'common.back' | translate }}
          </a>
          <div>
            <h1 class="page-title">{{ 'branches.branchDetails' | translate }}</h1>
            <p class="page-subtitle" *ngIf="branch()">{{ branch()!.name }}</p>
          </div>
        </div>
        <div class="flex gap-3" *ngIf="branch()">
          <a [routerLink]="['/car-rental/branches', branch()!.id, 'edit']" class="btn btn-primary">
            <i class="bi bi-pencil"></i>
            {{ 'common.edit' | translate }}
          </a>
        </div>
      </div>

      <!-- Loading State -->
      <div class="loading-container" *ngIf="isLoading()">
        <div class="spinner"></div>
        <p class="text-muted">{{ 'common.loading' | translate }}</p>
      </div>

      <!-- Error State -->
      <div class="alert alert-error" *ngIf="errorMessage()">
        <i class="bi bi-exclamation-triangle-fill"></i>
        <span>{{ errorMessage() }}</span>
      </div>

      <!-- Branch Details -->
      <div class="branch-details" *ngIf="!isLoading() && branch()">
        <div class="details-grid">
          <!-- Basic Information -->
          <div class="detail-section">
            <h2 class="section-title">{{ 'branches.basicInfo' | translate }}</h2>
            <div class="detail-items">
              <div class="detail-item">
                <span class="detail-label">{{ 'branches.name' | translate }}</span>
                <span class="detail-value">{{ branch()!.name }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">{{ 'branches.status' | translate }}</span>
                <span [class]="getStatusBadgeClass(branch()!.status)">
                  <i class="bi bi-circle-fill status-icon"></i>
                  {{ 'branches.' + branch()!.status | translate }}
                </span>
              </div>
              <div class="detail-item" *ngIf="branch()!.manager && branch()!.manager !== 'Unknown'">
                <span class="detail-label">{{ 'branches.manager' | translate }}</span>
                <span class="detail-value">{{ branch()!.manager }}</span>
              </div>
            </div>
          </div>

          <!-- Contact Information -->
          <div class="detail-section">
            <h2 class="section-title">{{ 'branches.contactInfo' | translate }}</h2>
            <div class="detail-items">
              <div class="detail-item">
                <span class="detail-label">{{ 'branches.phone' | translate }}</span>
                <a [href]="'tel:' + branch()!.phone" class="detail-link">{{ branch()!.phone }}</a>
              </div>
              <div class="detail-item">
                <span class="detail-label">{{ 'branches.email' | translate }}</span>
                <a [href]="'mailto:' + branch()!.email" class="detail-link">{{ branch()!.email }}</a>
              </div>
            </div>
          </div>

          <!-- Location -->
          <div class="detail-section span-2">
            <h2 class="section-title">{{ 'branches.location' | translate }}</h2>
            <div class="detail-items">
              <div class="detail-item">
                <span class="detail-label">{{ 'branches.address' | translate }}</span>
                <span class="detail-value">{{ branch()!.address }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">{{ 'branches.city' | translate }}</span>
                <span class="detail-value">{{ branch()!.city }}, {{ branch()!.country }}</span>
              </div>
              <div class="detail-item">
                <span class="detail-label">{{ 'branches.coordinates' | translate }}</span>
                <span class="detail-value">{{ branch()!.coordinates.lat }}, {{ branch()!.coordinates.lng }}</span>
              </div>
            </div>
          </div>

          <!-- Working Hours -->
          <div class="detail-section span-2">
            <h2 class="section-title">{{ 'branches.workingHours' | translate }}</h2>
            <div class="detail-items">
              <div class="detail-item">
                <span class="detail-label">{{ 'branches.schedule' | translate }}</span>
                <span class="detail-value">{{ getWorkingHoursDisplay() }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .branch-detail-container {
      padding: 2rem;
      max-width: 1000px;
      margin: 0 auto;
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
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

    .loading-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 4rem 2rem;
      gap: 1rem;
    }

    .details-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 2rem;
    }

    .detail-section {
      background: var(--white);
      border: 1px solid var(--border-light);
      border-radius: var(--radius-xl);
      padding: 2rem;
      box-shadow: var(--shadow-sm);
    }

    .detail-section.span-2 {
      grid-column: span 2;
    }

    .section-title {
      font-size: 1.25rem;
      font-weight: 600;
      color: var(--text-primary);
      margin: 0 0 1.5rem 0;
      padding-bottom: 0.75rem;
      border-bottom: 1px solid var(--border-light);
    }

    .detail-items {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .detail-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.75rem 0;
      border-bottom: 1px solid var(--border-light);
    }

    .detail-item:last-child {
      border-bottom: none;
    }

    .detail-label {
      font-weight: 500;
      color: var(--text-secondary);
    }

    .detail-value {
      color: var(--text-primary);
      font-weight: 500;
    }

    .detail-link {
      color: var(--brand-primary);
      text-decoration: none;
      font-weight: 500;
    }

    .detail-link:hover {
      text-decoration: underline;
    }

    .operating-hours {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
    }

    .day-schedule {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.75rem 1rem;
      background: var(--gray-50);
      border-radius: var(--radius-lg);
    }

    .day-name {
      font-weight: 500;
      color: var(--text-primary);
    }

    .day-hours {
      color: var(--text-secondary);
      font-size: 0.875rem;
    }

    .day-closed {
      color: var(--text-muted);
      font-size: 0.875rem;
      font-style: italic;
    }

    .badge {
      display: inline-flex;
      align-items: center;
      padding: 0.25rem 0.75rem;
      border-radius: var(--radius-full);
      font-size: 0.75rem;
      font-weight: 500;
      text-transform: uppercase;
      letter-spacing: 0.025em;
    }

    .badge-success {
      background: #dcfce7;
      color: #16a34a;
    }

    .badge-warning {
      background: #fef3c7;
      color: #d97706;
    }

    .badge-gray {
      background: var(--gray-100);
      color: var(--text-secondary);
    }

    .status-icon {
      font-size: 0.5rem;
      margin-right: 0.25rem;
    }

    @media (max-width: 768px) {
      .branch-detail-container {
        padding: 1rem;
      }
      
      .details-grid {
        grid-template-columns: 1fr;
      }
      
      .detail-section.span-2 {
        grid-column: span 1;
      }
      
      .page-header {
        flex-direction: column;
        gap: 1rem;
        align-items: flex-start;
      }
      
      .operating-hours {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class BranchDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private carRentalService = inject(CarRentalService);

  branch = signal<Branch | null>(null);
  isLoading = signal(false);
  errorMessage = signal<string>('');

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.loadBranch(id);
    }
  }

  private loadBranch(id: string) {
    this.isLoading.set(true);
    this.carRentalService.getBranchById(id).subscribe({
      next: (branch) => {
        if (branch) {
          this.branch.set(branch);
        } else {
          this.errorMessage.set('Branch not found');
        }
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading branch:', error);
        this.errorMessage.set('Error loading branch');
        this.isLoading.set(false);
      }
    });
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'active': return 'badge badge-success';
      case 'inactive': return 'badge badge-gray';
      case 'maintenance': return 'badge badge-warning';
      default: return 'badge badge-gray';
    }
  }

  getWorkingHoursDisplay(): string {
    const branch = this.branch();
    if (!branch) return 'Not available';

    // Try to get working hours from operatingHours first (complex structure)
    if (branch.operatingHours) {
      const days = Object.keys(branch.operatingHours);
      if (days.length > 0) {
        const firstDay = branch.operatingHours[days[0]];
        if (firstDay && firstDay.isOpen) {
          return `${firstDay.open} - ${firstDay.close}`;
        }
      }
    }

    // Fallback to simple working hours string (from API)
    return 'Standard business hours';
  }
}
