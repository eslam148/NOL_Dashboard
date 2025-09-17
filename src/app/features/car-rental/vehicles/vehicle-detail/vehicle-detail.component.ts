import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import { CarApiService } from '../../../../core/services/car-api.service';
import { AdminCarDto } from '../../../../core/models/api.models';

@Component({
  selector: 'app-vehicle-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslatePipe],
  templateUrl: './vehicle-detail.component.html',
  styleUrls: ['./vehicle-detail.component.css']
})
export class VehicleDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private carApiService = inject(CarApiService);

  car = signal<AdminCarDto | null>(null);
  isLoading = signal(false);
  errorMessage = signal<string>('');
  carId = signal<number | null>(null);

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.carId.set(parseInt(id));
      this.loadCarDetails(parseInt(id));
    } else {
      this.errorMessage.set('No car ID provided');
    }
  }

  private loadCarDetails(id: number) {
    this.isLoading.set(true);
    this.errorMessage.set('');

    this.carApiService.getCarById(id).subscribe({
      next: (car) => {
        console.log('🚗 Car details loaded:', car);
        this.car.set(car);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('❌ Error loading car details:', error);
        this.errorMessage.set('Failed to load car details');
        this.isLoading.set(false);
      }
    });
  }

  getStatusBadgeClass(status: string): string {
    switch (status.toLowerCase()) {
      case 'available': return 'badge badge-success';
      case 'rented': return 'badge badge-primary';
      case 'maintenance': return 'badge badge-warning';
      case 'outofservice': return 'badge badge-error';
      case 'reserved': return 'badge badge-info';
      default: return 'badge badge-gray';
    }
  }

  getFuelTypeIcon(fuelType: string): string {
    switch (fuelType.toLowerCase()) {
      case 'gasoline': return 'bi-fuel-pump';
      case 'diesel': return 'bi-fuel-pump-diesel';
      case 'electric': return 'bi-lightning-charge';
      case 'hybrid': return 'bi-battery-half';
      case 'pluginhybrid': return 'bi-plug';
      default: return 'bi-fuel-pump';
    }
  }

  getTransmissionIcon(transmission: string): string {
    switch (transmission.toLowerCase()) {
      case 'manual': return 'bi-gear';
      case 'automatic': return 'bi-gear-fill';
      default: return 'bi-gear';
    }
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  formatDate(dateString: string | undefined): string {
    if (!dateString) {
      return 'N/A';
    }
    return new Date(dateString).toLocaleDateString();
  }

  onEdit() {
    const id = this.carId();
    if (id) {
      this.router.navigate(['/car-rental/vehicles', id, 'edit']);
    }
  }

  onDelete() {
    const car = this.car();
    const id = this.carId();
    
    if (car && id && confirm(`Are you sure you want to delete ${car.brand} ${car.model}?`)) {
      this.carApiService.deleteCar(id).subscribe({
        next: () => {
          console.log('✅ Car deleted successfully');
          this.router.navigate(['/car-rental/vehicles']);
        },
        error: (error) => {
          console.error('❌ Error deleting car:', error);
          this.errorMessage.set('Failed to delete car');
        }
      });
    }
  }

  onBack() {
    this.router.navigate(['/car-rental/vehicles']);
  }
}
