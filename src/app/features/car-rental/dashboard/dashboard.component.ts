import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { finalize, take } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, NavigationStart, NavigationEnd, NavigationCancel, NavigationError } from '@angular/router';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { LanguageSwitcherComponent } from '../../../shared/components/language-switcher/language-switcher.component';
import { CarRentalService } from '../../../core/services/car-rental.service';
import { DashboardStats } from '../../../core/models/car-rental.models';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-car-rental-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslatePipe, LanguageSwitcherComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class CarRentalDashboardComponent implements OnInit, OnDestroy {
  private carRentalService = inject(CarRentalService);
  private router = inject(Router);
  private navSub?: Subscription;
  
  stats: DashboardStats | null = null;
  isLoading = false;

  ngOnInit() {
    this.loadDashboardStats();
    this.navSub = this.router.events.subscribe(evt => {
      if (evt instanceof NavigationStart || evt instanceof NavigationEnd || evt instanceof NavigationCancel || evt instanceof NavigationError) {
        this.isLoading = false;
      }
    });
  }

  private loadDashboardStats() {
    this.isLoading = true;
    this.carRentalService.getDashboardStats()
      .pipe(take(1), finalize(() => { this.isLoading = false; }))
      .subscribe({
        next: (stats) => {
          this.stats = stats;
        },
        error: (error) => {
          console.error('Error loading dashboard stats:', error);
        }
      });
  }

  refreshStats() {
    this.loadDashboardStats();
  }

  ngOnDestroy() {
    this.navSub?.unsubscribe();
  }
}
