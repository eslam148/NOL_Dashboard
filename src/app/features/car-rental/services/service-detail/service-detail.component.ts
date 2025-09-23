import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import { CarRentalService } from '../../../../core/services/car-rental.service';
import { AdditionalService } from '../../../../core/models/car-rental.models';

@Component({
  selector: 'app-service-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslatePipe],
  template: `
    <div class="service-detail-container">
      <div class="page-header">
        <div class="flex items-center gap-4">
          <a routerLink="/car-rental/services" class="btn btn-ghost btn-sm">
            <i class="bi bi-arrow-left"></i>
            {{ 'common.back' | translate }}
          </a>
          <div>
            <h1 class="page-title">{{ 'services.serviceDetails' | translate }}</h1>
            <p class="page-subtitle">{{ 'services.serviceDetailsDesc' | translate }}</p>
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

      <div class="content" *ngIf="service() && !isLoading()">
        <div class="grid">
          <div class="card span-2">
            <h3>{{ 'services.overview' | translate }}</h3>
            <div class="row"><span>{{ 'services.name' | translate }}</span><strong>{{ service()!.name }}</strong></div>
            <div class="row"><span>{{ 'services.category' | translate }}</span><strong>{{ service()!.category }}</strong></div>
            <div class="row"><span>{{ 'services.availability' | translate }}</span><strong>{{ service()!.isAvailable ? ('services.available' | translate) : ('services.unavailable' | translate) }}</strong></div>
          </div>

          <div class="card">
            <h3>{{ 'services.pricing' | translate }}</h3>
            <div class="row"><span>{{ 'services.dailyRate' | translate }}</span><strong>{{ service()!.dailyRate | number:'1.2-2' }}</strong></div>
            <div class="row"><span>{{ 'services.weeklyRate' | translate }}</span><strong>{{ service()!.weeklyRate | number:'1.2-2' }}</strong></div>
            <div class="row"><span>{{ 'services.monthlyRate' | translate }}</span><strong>{{ service()!.monthlyRate | number:'1.2-2' }}</strong></div>
          </div>

          <div class="card">
            <h3>{{ 'services.details' | translate }}</h3>
            <div class="row"><span>{{ 'services.maxQuantity' | translate }}</span><strong>{{ service()!.maxQuantity }}</strong></div>
            <div class="row" *ngIf="service()!.minimumRentalDays"><span>{{ 'services.minimumRentalDays' | translate }}</span><strong>{{ service()!.minimumRentalDays }}</strong></div>
          </div>

          <div class="card span-2" *ngIf="service()!.description">
            <h3>{{ 'services.description' | translate }}</h3>
            <p class="description">{{ service()!.description }}</p>
          </div>
        </div>

        <div class="actions">
          <a [routerLink]="['/car-rental/services', service()!.id, 'edit']" class="btn btn-primary">
            <i class="bi bi-pencil"></i>
            {{ 'common.edit' | translate }}
          </a>
          <a routerLink="/car-rental/services" class="btn btn-secondary">
            {{ 'common.back' | translate }}
          </a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .service-detail-container { padding: 2rem; max-width: 1100px; margin: 0 auto; }
    .page-header { margin-bottom: 2rem; }
    .page-title { font-size: 1.875rem; font-weight: 700; color: var(--text-primary); margin: 0 0 0.5rem 0; }
    .page-subtitle { color: var(--text-secondary); margin: 0; }
    .loading, .error { display: flex; gap: .75rem; align-items: center; color: var(--text-secondary); }
    .grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1rem; }
    .card { background: var(--white); border: 1px solid var(--border-light); border-radius: var(--radius-lg); padding: 1rem 1.25rem; box-shadow: var(--shadow-sm); }
    .card h3 { margin: 0 0 .75rem 0; font-size: 1rem; font-weight: 600; color: var(--text-primary); }
    .row { display: flex; justify-content: space-between; padding: .4rem 0; border-bottom: 1px dashed var(--border-light); }
    .row:last-child { border-bottom: 0; }
    .row span { color: var(--text-secondary); }
    .row strong { color: var(--text-primary); }
    .description { color: var(--text-primary); }
    .actions { display: flex; gap: .75rem; margin-top: 1.25rem; }
    .span-2 { grid-column: span 2; }
    @media (max-width: 900px) { .grid { grid-template-columns: 1fr; } .span-2 { grid-column: auto; } }
  `]
})
export class ServiceDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private carRentalService = inject(CarRentalService);

  isLoading = signal(false);
  error = signal<string | null>(null);
  service = signal<AdditionalService | null>(null);

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.error.set('Invalid service id');
      return;
    }
    this.loadService(id);
  }

  private loadService(id: string) {
    this.isLoading.set(true);
    this.error.set(null);

    this.carRentalService.getServiceById(id).subscribe({
      next: (s: AdditionalService | null) => {
        if (!s) this.error.set('Service not found');
        this.service.set(s);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading service:', err);
        this.error.set('Failed to load service');
        this.isLoading.set(false);
      }
    });
  }
}
