import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import { CarRentalService } from '../../../../core/services/car-rental.service';
import { Advertisement } from '../../../../core/models/car-rental.models';

@Component({
  selector: 'app-advertisement-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslatePipe],
  template: `
    <div class="advertisement-detail-container">
      <div class="page-header">
        <div class="flex items-center gap-4">
          <a routerLink="/car-rental/advertisements" class="btn btn-ghost btn-sm">
            <i class="bi bi-arrow-left"></i>
            {{ 'common.back' | translate }}
          </a>
          <div>
            <h1 class="page-title">{{ 'advertisements.advertisementDetails' | translate }}</h1>
            <p class="page-subtitle">{{ 'advertisements.advertisementDetailsDesc' | translate }}</p>
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

      <div class="content" *ngIf="ad() && !isLoading()">
        <div class="grid">
          <div class="card span-2">
            <h3>{{ 'advertisements.overview' | translate }}</h3>
            <div class="row"><span>{{ 'advertisements.title' | translate }}</span><strong>{{ ad()!.title }}</strong></div>
            <div class="row"><span>{{ 'advertisements.type' | translate }}</span><strong>{{ ad()!.type }}</strong></div>
            <div class="row"><span>{{ 'advertisements.status' | translate }}</span><strong>{{ ad()!.status }}</strong></div>
            <div class="row"><span>{{ 'advertisements.startDate' | translate }}</span><strong>{{ ad()!.startDate | date:'mediumDate' }}</strong></div>
            <div class="row"><span>{{ 'advertisements.endDate' | translate }}</span><strong>{{ ad()!.endDate | date:'mediumDate' }}</strong></div>
            <div class="row" *ngIf="ad()!.imageUrl"><span>{{ 'advertisements.imageUrl' | translate }}</span><a [href]="ad()!.imageUrl" target="_blank">{{ ad()!.imageUrl }}</a></div>
          </div>

          <div class="card span-2" *ngIf="ad()!.description">
            <h3>{{ 'advertisements.description' | translate }}</h3>
            <p class="description">{{ ad()!.description }}</p>
          </div>

          <div class="card">
            <h3>{{ 'advertisements.metrics' | translate }}</h3>
            <div class="row"><span>{{ 'advertisements.impressions' | translate }}</span><strong>{{ ad()!.impressions || 0 }}</strong></div>
            <div class="row"><span>{{ 'advertisements.clicks' | translate }}</span><strong>{{ ad()!.clicks || 0 }}</strong></div>
            <div class="row"><span>{{ 'advertisements.priority' | translate }}</span><strong>{{ ad()!.priority }}</strong></div>
          </div>

          <div class="card">
            <h3>{{ 'advertisements.actions' | translate }}</h3>
            <div class="actions">
              <a [routerLink]="['/car-rental/advertisements', ad()!.id, 'edit']" class="btn btn-primary">
                <i class="bi bi-pencil"></i>
                {{ 'common.edit' | translate }}
              </a>
              <a routerLink="/car-rental/advertisements" class="btn btn-secondary">
                {{ 'common.back' | translate }}
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .advertisement-detail-container {
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
    
    .loading, .error { display: flex; gap: .75rem; align-items: center; color: var(--text-secondary); }
    .grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1rem; }
    .card { background: var(--white); border: 1px solid var(--border-light); border-radius: var(--radius-lg); padding: 1rem 1.25rem; box-shadow: var(--shadow-sm); }
    .card h3 { margin: 0 0 .75rem 0; font-size: 1rem; font-weight: 600; color: var(--text-primary); }
    .row { display: flex; justify-content: space-between; padding: .4rem 0; border-bottom: 1px dashed var(--border-light); }
    .row:last-child { border-bottom: 0; }
    .row span { color: var(--text-secondary); }
    .row strong { color: var(--text-primary); }
    .description { color: var(--text-primary); white-space: pre-wrap; }
    .actions { display: flex; gap: .5rem; }
    .span-2 { grid-column: span 2; }
    @media (max-width: 900px) { .grid { grid-template-columns: 1fr; } .span-2 { grid-column: auto; } }
  `]
})
export class AdvertisementDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private carRentalService = inject(CarRentalService);

  isLoading = signal(false);
  error = signal<string | null>(null);
  ad = signal<Advertisement | null>(null);

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.error.set('Invalid advertisement id');
      return;
    }
    this.loadAd(id);
  }

  private loadAd(id: string) {
    this.isLoading.set(true);
    this.error.set(null);
    this.carRentalService.getAdvertisementById(id).subscribe({
      next: (a) => {
        if (!a) this.error.set('Advertisement not found');
        this.ad.set(a);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading advertisement:', err);
        this.error.set('Failed to load advertisement');
        this.isLoading.set(false);
      }
    });
  }
}
