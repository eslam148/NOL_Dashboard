import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import { CarRentalService } from '../../../../core/services/car-rental.service';
import { Vehicle, VehicleFilter, VehicleCategory, VehicleStatus } from '../../../../core/models/car-rental.models';

@Component({
  selector: 'app-vehicles-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, TranslatePipe],
  templateUrl: './vehicles-list.component.html',
  styleUrls: ['./vehicles-list.component.css']
})
export class VehiclesListComponent implements OnInit {
  private carRentalService = inject(CarRentalService);
  
  vehicles = signal<Vehicle[]>([]);
  filteredVehicles = signal<Vehicle[]>([]);
  isLoading = signal(false);
  searchTerm = signal('');
  categoryFilter = signal<string>('all');
  statusFilter = signal<string>('all');
  makeFilter = signal<string>('all');
  
  // Filter options
  categoryOptions = [
    { value: 'all', label: 'vehicles.allCategories' },
    { value: 'economy', label: 'vehicles.economy' },
    { value: 'compact', label: 'vehicles.compact' },
    { value: 'midsize', label: 'vehicles.midsize' },
    { value: 'fullsize', label: 'vehicles.fullsize' },
    { value: 'luxury', label: 'vehicles.luxury' },
    { value: 'suv', label: 'vehicles.suv' },
    { value: 'van', label: 'vehicles.van' },
    { value: 'truck', label: 'vehicles.truck' }
  ];

  statusOptions = [
    { value: 'all', label: 'vehicles.allStatuses' },
    { value: 'available', label: 'vehicles.available' },
    { value: 'rented', label: 'vehicles.rented' },
    { value: 'maintenance', label: 'vehicles.maintenance' },
    { value: 'out_of_service', label: 'vehicles.outOfService' },
    { value: 'reserved', label: 'vehicles.reserved' }
  ];

  ngOnInit() {
    this.loadVehicles();
  }

  private loadVehicles() {
    this.isLoading.set(true);
    this.carRentalService.getVehicles().subscribe({
      next: (vehicles) => {
        this.vehicles.set(vehicles);
        this.applyFilters();
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading vehicles:', error);
        this.isLoading.set(false);
      }
    });
  }

  onSearchChange(term: string) {
    this.searchTerm.set(term);
    this.applyFilters();
  }

  onCategoryFilterChange(category: string) {
    this.categoryFilter.set(category);
    this.applyFilters();
  }

  onStatusFilterChange(status: string) {
    this.statusFilter.set(status);
    this.applyFilters();
  }

  onMakeFilterChange(make: string) {
    this.makeFilter.set(make);
    this.applyFilters();
  }

  private applyFilters() {
    let filtered = [...this.vehicles()];
    
    // Apply search filter
    const search = this.searchTerm().toLowerCase();
    if (search) {
      filtered = filtered.filter(vehicle => 
        vehicle.make.toLowerCase().includes(search) ||
        vehicle.model.toLowerCase().includes(search) ||
        vehicle.licensePlate.toLowerCase().includes(search) ||
        vehicle.year.toString().includes(search)
      );
    }
    
    // Apply category filter
    if (this.categoryFilter() !== 'all') {
      filtered = filtered.filter(vehicle => vehicle.category === this.categoryFilter());
    }
    
    // Apply status filter
    if (this.statusFilter() !== 'all') {
      filtered = filtered.filter(vehicle => vehicle.status === this.statusFilter());
    }
    
    // Apply make filter
    if (this.makeFilter() !== 'all') {
      filtered = filtered.filter(vehicle => vehicle.make === this.makeFilter());
    }
    
    this.filteredVehicles.set(filtered);
  }

  getUniqueMakes(): string[] {
    const makes = this.vehicles().map(vehicle => vehicle.make);
    return [...new Set(makes)].sort();
  }

  getStatusBadgeClass(status: VehicleStatus): string {
    switch (status) {
      case 'available': return 'badge badge-success';
      case 'rented': return 'badge badge-primary';
      case 'maintenance': return 'badge badge-warning';
      case 'out_of_service': return 'badge badge-error';
      case 'reserved': return 'badge badge-info';
      default: return 'badge badge-gray';
    }
  }

  getCategoryIcon(category: VehicleCategory): string {
    switch (category) {
      case 'economy': return 'bi-car-front';
      case 'compact': return 'bi-car-front';
      case 'midsize': return 'bi-car-front-fill';
      case 'fullsize': return 'bi-car-front-fill';
      case 'luxury': return 'bi-gem';
      case 'suv': return 'bi-truck';
      case 'van': return 'bi-bus-front';
      case 'truck': return 'bi-truck-flatbed';
      default: return 'bi-car-front';
    }
  }

  updateVehicleStatus(vehicle: Vehicle, newStatus: VehicleStatus) {
    this.carRentalService.updateVehicleStatus(vehicle.id, newStatus).subscribe({
      next: (updatedVehicle) => {
        // Update the vehicle in the list
        const vehicles = this.vehicles();
        const index = vehicles.findIndex(v => v.id === vehicle.id);
        if (index !== -1) {
          vehicles[index] = updatedVehicle;
          this.vehicles.set([...vehicles]);
          this.applyFilters();
        }
      },
      error: (error) => {
        console.error('Error updating vehicle status:', error);
      }
    });
  }

  deleteVehicle(vehicle: Vehicle) {
    if (confirm(`Are you sure you want to delete ${vehicle.make} ${vehicle.model}?`)) {
      this.carRentalService.deleteVehicle(vehicle.id).subscribe({
        next: (success) => {
          if (success) {
            this.loadVehicles();
          }
        },
        error: (error) => {
          console.error('Error deleting vehicle:', error);
        }
      });
    }
  }

  refreshList() {
    this.loadVehicles();
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }
}
