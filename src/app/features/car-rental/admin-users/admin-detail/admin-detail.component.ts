import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import { CarRentalService } from '../../../../core/services/car-rental.service';
import { TranslationService } from '../../../../core/services/translation.service';
import { AdminUser } from '../../../../core/models/car-rental.models';

@Component({
  selector: 'app-admin-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslatePipe],
  template: `
    <div class="admin-detail-container">
      <div class="page-header">
        <div class="flex items-center gap-4">
          <a routerLink="/car-rental/admin-users" class="btn btn-ghost btn-sm">
            <i class="bi bi-arrow-left"></i>
            {{ 'common.back' | translate }}
          </a>
          <div>
            <h1 class="page-title">{{ 'adminUsers.adminDetails' | translate }}</h1>
            <p class="page-subtitle">{{ 'adminUsers.adminDetailsDesc' | translate }}</p>
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div class="loading-container" *ngIf="isLoading()">
        <div class="spinner"></div>
        <p class="text-muted">{{ 'common.loading' | translate }}</p>
      </div>

      <!-- Not Found -->
      <div class="empty-state" *ngIf="!isLoading() && !admin()">
        <div class="empty-icon">
          <i class="bi bi-person-gear"></i>
        </div>
        <h3 class="empty-title">{{ 'common.error' | translate }}</h3>
        <p class="empty-description">{{ 'adminUsers.noUsersFound' | translate }}</p>
        <a routerLink="/car-rental/admin-users" class="btn btn-primary">
          <i class="bi bi-arrow-left"></i>
          {{ 'common.back' | translate }}
        </a>
      </div>

      <!-- Details -->
      <div *ngIf="!isLoading() && admin()" class="detail-card">
        <div class="header">
          <div class="avatar"><i class="bi bi-person-circle"></i></div>
          <div class="info">
            <h2>{{ admin()!.firstName }} {{ admin()!.lastName }}</h2>
            <div class="meta">
              <span class="email">{{ admin()!.email }}</span>
              <span class="badge" [class.active]="admin()!.isActive" [class.inactive]="!admin()!.isActive">
                {{ admin()!.isActive ? ('adminUsers.active' | translate) : ('adminUsers.inactive' | translate) }}
              </span>
            </div>
          </div>
          <div class="actions">
            <a [routerLink]="['/car-rental/admin-users', admin()!.id, 'edit']" class="btn btn-primary btn-sm">
              <i class="bi bi-pencil"></i>
              {{ 'common.edit' | translate }}
            </a>
          </div>
        </div>

        <div class="grid">
          <div class="section">
            <h3>{{ 'adminUsers.basicInformation' | translate }}</h3>
            <div class="row"><span class="label">{{ 'adminUsers.username' | translate }}</span><span class="value">{{ '@' + admin()!.username }}</span></div>
            <div class="row"><span class="label">{{ 'adminUsers.role' | translate }}</span><span class="value">{{ 'adminUsers.' + admin()!.role | translate }}</span></div>
            <div class="row"><span class="label">{{ 'adminUsers.phone' | translate }}</span><span class="value">{{ admin()!.phone }}</span></div>
          </div>

          <div class="section">
            <h3>{{ 'adminUsers.addressInformation' | translate }}</h3>
            <div class="muted" *ngIf="!admin()!.branchIds || admin()!.branchIds.length === 0">{{ 'adminUsers.allBranches' | translate }}</div>
            <ul *ngIf="admin()!.branchIds && admin()!.branchIds.length > 0">
              <li *ngFor="let id of admin()!.branchIds">#{{ id }}</li>
            </ul>
          </div>

          <div class="section">
            <h3>{{ 'adminUsers.activityLogs' | translate }}</h3>
            <div class="muted">{{ 'adminUsers.detailComingSoonDesc' | translate }}</div>
          </div>
        </div>

        <div class="footer">
          <div class="row"><span class="label">{{ 'adminUsers.joined' | translate }}</span><span class="value">{{ getJoinedDisplay() }}</span></div>
          <div class="row"><span class="label">{{ 'adminUsers.lastLogin' | translate }}</span><span class="value">{{ getLastLoginDisplay() }}</span></div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .admin-detail-container { padding: 2rem; max-width: 1000px; margin: 0 auto; }
    .page-header { margin-bottom: 2rem; }
    .page-title { font-size: 1.875rem; font-weight: 700; color: var(--text-primary); margin: 0 0 0.5rem 0; }
    .page-subtitle { color: var(--text-secondary); margin: 0; }
    .loading-container { display:flex; gap:.75rem; align-items:center; color: var(--text-secondary); }
    .spinner { width: 16px; height: 16px; border-radius: 50%; border: 2px solid var(--border-light); border-top-color: var(--brand-primary); animation: spin 1s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }
    .empty-state { text-align:center; background: var(--white); border:1px solid var(--border-light); border-radius: var(--radius-xl); padding: 3rem 1.5rem; box-shadow: var(--shadow-sm); }
    .empty-icon { width:4rem; height:4rem; border-radius: var(--radius-full); background: var(--gray-100); display:flex; align-items:center; justify-content:center; margin: 0 auto 1rem; }
    .detail-card { background: var(--white); border:1px solid var(--border-light); border-radius: var(--radius-xl); box-shadow: var(--shadow-sm); }
    .header { display:flex; gap:1rem; align-items:center; padding: 1rem 1.25rem; border-bottom:1px solid var(--border-light); }
    .avatar { width:3rem; height:3rem; border-radius: var(--radius-full); background: var(--gray-100); display:flex; align-items:center; justify-content:center; }
    .info { flex:1; }
    .meta { display:flex; gap:.5rem; align-items:center; color: var(--text-secondary); }
    .badge { padding: 0.125rem 0.5rem; border-radius: 9999px; font-size:.75rem; background: var(--gray-100); }
    .badge.active { background:#dcfce7; color:#16a34a }
    .badge.inactive { background:var(--gray-200); color:var(--text-secondary) }
    .actions { display:flex; gap:.5rem; }
    .grid { display:grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; padding: 1rem 1.25rem; }
    .section { background: var(--gray-50); border:1px solid var(--border-light); border-radius: var(--radius-lg); padding: .75rem 1rem; }
    .row { display:flex; justify-content: space-between; padding: .25rem 0; }
    .label { color: var(--text-secondary); }
    .value { color: var(--text-primary); font-weight: 500; }
    .muted { color: var(--text-secondary); font-size: .875rem; }
    .footer { border-top:1px solid var(--border-light); padding: .75rem 1.25rem; display:grid; grid-template-columns: 1fr 1fr; gap: .5rem; }
    @media (max-width: 900px) { .grid { grid-template-columns: 1fr; } .footer { grid-template-columns: 1fr; } }
  `]
})
export class AdminDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private carRentalService = inject(CarRentalService);
  private translationService = inject(TranslationService);

  isLoading = signal(false);
  admin = signal<AdminUser | null>(null);

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) return;
    this.fetchAdmin(id);
  }

  private fetchAdmin(id: string) {
    this.isLoading.set(true);
    this.carRentalService.getAdminUserById(id).subscribe({
      next: (user) => {
        this.admin.set(user);
        this.isLoading.set(false);
      },
      error: () => {
        this.admin.set(null);
        this.isLoading.set(false);
      }
    });
  }

  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'short', day: 'numeric' }).format(date);
  }

  getTimeSince(date: Date): string {
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays > 0) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    if (diffInHours > 0) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
  }

  getJoinedDisplay(): string {
    const user = this.admin();
    if (!user || !user.createdAt) return this.translationService.translate('common.never');
    return this.formatDate(user.createdAt as Date);
    }

  getLastLoginDisplay(): string {
    const user = this.admin();
    if (!user || !user.lastLogin) return this.translationService.translate('common.never');
    return this.getTimeSince(user.lastLogin as Date);
  }
}
