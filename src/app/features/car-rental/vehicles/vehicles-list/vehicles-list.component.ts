import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import { CarRentalService } from '../../../../core/services/car-rental.service';
import { CarApiService } from '../../../../core/services/car-api.service';
import { Vehicle, VehicleFilter, VehicleCategory, VehicleStatus } from '../../../../core/models/car-rental.models';
import { AdminCarDto, CarFilterDto, PaginatedResponse } from '../../../../core/models/api.models';

@Component({
  selector: 'app-vehicles-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, TranslatePipe],
  templateUrl: './vehicles-list.component.html',
  styleUrls: ['./vehicles-list.component.css']
})
export class VehiclesListComponent implements OnInit {
  private carRentalService = inject(CarRentalService);
  private carApiService = inject(CarApiService);
  
  vehicles = signal<AdminCarDto[]>([]);
  filteredVehicles = signal<AdminCarDto[]>([]);
  paginationInfo = signal<PaginatedResponse<AdminCarDto> | null>(null);
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
    
    const filter: CarFilterDto = {
      page: 1,
      pageSize: 50, // Load more items for better user experience
      sortBy: 'createdAt',
      sortOrder: 'desc'
    };
    
    this.carApiService.getCars(filter).subscribe({
      next: (paginatedResponse) => {
        console.log('🚗 Vehicles API Response:', paginatedResponse);
        console.log('🚗 Vehicles Data Array:', paginatedResponse.data);
        console.log('🚗 Total Count:', paginatedResponse.totalCount);
        
        this.vehicles.set(paginatedResponse.data || []);
        this.paginationInfo.set(paginatedResponse);
        this.applyFilters();
        this.isLoading.set(false);
        
        console.log('🚗 Vehicles Set:', this.vehicles());
        console.log('🚗 Filtered Vehicles:', this.filteredVehicles());
      },
      error: (error) => {
        console.error('❌ Error loading vehicles:', error);
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
    console.log('🔍 Applying filters...');
    console.log('🔍 Original vehicles count:', this.vehicles().length);
    
    let filtered = [...this.vehicles()];
    
    // Apply search filter
    const search = this.searchTerm().toLowerCase();
    if (search) {
      console.log('🔍 Applying search filter:', search);
      filtered = filtered.filter(vehicle => 
        vehicle.brand.toLowerCase().includes(search) ||
        vehicle.model.toLowerCase().includes(search) ||
        vehicle.year.toString().includes(search) ||
        vehicle.category.name.toLowerCase().includes(search) ||
        vehicle.branch.name.toLowerCase().includes(search)
      );
      console.log('🔍 After search filter:', filtered.length);
    }
    
    // Apply category filter
    if (this.categoryFilter() !== 'all') {
      console.log('🔍 Applying category filter:', this.categoryFilter());
      filtered = filtered.filter(vehicle => 
        vehicle.category.name.toLowerCase() === this.categoryFilter().toLowerCase()
      );
      console.log('🔍 After category filter:', filtered.length);
    }
    
    // Apply status filter
    if (this.statusFilter() !== 'all') {
      console.log('🔍 Applying status filter:', this.statusFilter());
      filtered = filtered.filter(vehicle => 
        vehicle.status.toLowerCase() === this.statusFilter().toLowerCase()
      );
      console.log('🔍 After status filter:', filtered.length);
    }
    
    // Apply make filter
    if (this.makeFilter() !== 'all') {
      console.log('🔍 Applying make filter:', this.makeFilter());
      filtered = filtered.filter(vehicle => 
        vehicle.brand.toLowerCase() === this.makeFilter().toLowerCase()
      );
      console.log('🔍 After make filter:', filtered.length);
    }
    
    console.log('🔍 Final filtered count:', filtered.length);
    this.filteredVehicles.set(filtered);
  }

  getUniqueMakes(): string[] {
    const makes = this.vehicles().map(vehicle => vehicle.brand);
    return [...new Set(makes)].sort();
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

  getCategoryIcon(categoryName: string): string {
    switch (categoryName.toLowerCase()) {
      case 'economy': return 'bi-car-front';
      case 'compact': return 'bi-car-front';
      case 'mid-size': return 'bi-car-front-fill';
      case 'midsize': return 'bi-car-front-fill';
      case 'fullsize': return 'bi-car-front-fill';
      case 'luxury': return 'bi-gem';
      case 'sports': return 'bi-speedometer2';
      case 'suv': return 'bi-truck';
      case 'van': return 'bi-bus-front';
      case 'truck': return 'bi-truck-flatbed';
      default: return 'bi-car-front';
    }
  }

  updateVehicleStatus(vehicle: AdminCarDto, newStatus: string) {
    // For now, just reload the list since we don't have a direct status update API
    // In a real implementation, you'd call the appropriate API endpoint
    console.log('Updating vehicle status:', vehicle.id, newStatus);
    this.loadVehicles();
  }

  deleteVehicle(vehicle: AdminCarDto) {
    if (confirm(`Are you sure you want to delete ${vehicle.brand} ${vehicle.model}?`)) {
      this.carApiService.deleteCar(vehicle.id).subscribe({
        next: () => {
          console.log('Vehicle deleted successfully');
          this.loadVehicles();
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
