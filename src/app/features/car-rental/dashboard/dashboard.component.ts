import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { LanguageSwitcherComponent } from '../../../shared/components/language-switcher/language-switcher.component';
import { CarRentalService } from '../../../core/services/car-rental.service';
import { DashboardStats } from '../../../core/models/car-rental.models';

@Component({
  selector: 'app-car-rental-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslatePipe, LanguageSwitcherComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class CarRentalDashboardComponent implements OnInit {
  private carRentalService = inject(CarRentalService);
  
  stats: DashboardStats | null = null;
  isLoading = false;

  ngOnInit() {
    this.loadDashboardStats();
  }

  private loadDashboardStats() {
    this.isLoading = true;
    this.carRentalService.getDashboardStats().subscribe({
      next: (stats) => {
        this.stats = stats;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading dashboard stats:', error);
        this.isLoading = false;
      }
    });
  }

  refreshStats() {
    this.loadDashboardStats();
  }
}
