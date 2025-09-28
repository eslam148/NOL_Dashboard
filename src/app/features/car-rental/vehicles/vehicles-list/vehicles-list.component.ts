import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import { CarRentalService } from '../../../../core/services/car-rental.service';
import { CarApiService } from '../../../../core/services/car-api.service';
import { TranslationService } from '../../../../core/services/translation.service';
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
  private translationService = inject(TranslationService);
  
  vehicles = signal<AdminCarDto[]>([]);
  filteredVehicles = signal<AdminCarDto[]>([]);
  paginationInfo = signal<PaginatedResponse<AdminCarDto> | null>(null);
  isLoading = signal(false);
  searchTerm = signal('');
  categoryFilter = signal<string>('all');
  statusFilter = signal<string>('all');
  makeFilter = signal<string>('all');
  
  // Pagination properties
  currentPage = signal(1);
  pageSize = signal(10);
  totalCount = signal(0);
  totalPages = signal(0);
  hasPreviousPage = signal(false);
  hasNextPage = signal(false);
  
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
  
  // Page size options
  pageSizeOptions = [
    { value: 5, label: '5' },
    { value: 10, label: '10' },
    { value: 20, label: '20' },
    { value: 50, label: '50' }
  ];

  ngOnInit() {
    this.loadVehicles();
  }

  private loadVehicles() {
    this.isLoading.set(true);
    
    const filter: CarFilterDto = {
      page: this.currentPage(),
      pageSize: this.pageSize(),
      sortBy: 'createdAt',
      sortOrder: 'desc'
    };
    
    this.carApiService.getCars(filter).subscribe({
      next: (paginatedResponse) => {
        this.vehicles.set(paginatedResponse.data || []);
        this.paginationInfo.set(paginatedResponse);
        this.updatePaginationInfo(paginatedResponse);
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
    this.currentPage.set(1); // Reset to first page when searching
    this.loadVehicles();
  }

  onCategoryFilterChange(category: string) {
    this.categoryFilter.set(category);
    this.currentPage.set(1); // Reset to first page when filtering
    this.loadVehicles();
  }

  onStatusFilterChange(status: string) {
    this.statusFilter.set(status);
    this.currentPage.set(1); // Reset to first page when filtering
    this.loadVehicles();
  }

  onMakeFilterChange(make: string) {
    this.makeFilter.set(make);
    this.currentPage.set(1); // Reset to first page when filtering
    this.loadVehicles();
  }
  
  onPageSizeChange(newPageSize: number) {
    this.pageSize.set(newPageSize);
    this.currentPage.set(1); // Reset to first page when changing page size
    this.loadVehicles();
  }

  private updatePaginationInfo(paginatedResponse: PaginatedResponse<AdminCarDto>) {
    this.totalCount.set(paginatedResponse.totalCount);
    this.totalPages.set(paginatedResponse.totalPages);
    this.hasPreviousPage.set(paginatedResponse.hasPreviousPage);
    this.hasNextPage.set(paginatedResponse.hasNextPage);
  }

  private applyFilters() {
    // For server-side pagination, we don't need client-side filtering
    // The API should handle filtering and return the filtered results
    this.filteredVehicles.set(this.vehicles());
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
    this.currentPage.set(1);
    this.loadVehicles();
  }
  
  // Pagination methods
  onPageChange(newPage: number) {
    if (newPage >= 1 && newPage <= this.totalPages()) {
      this.currentPage.set(newPage);
      this.loadVehicles();
    }
  }

  goToFirstPage() {
    this.onPageChange(1);
  }

  goToPreviousPage() {
    if (this.hasPreviousPage()) {
      this.onPageChange(this.currentPage() - 1);
    }
  }

  goToNextPage() {
    if (this.hasNextPage()) {
      this.onPageChange(this.currentPage() + 1);
    }
  }

  goToLastPage() {
    this.onPageChange(this.totalPages());
  }

  getPageNumbers(): number[] {
    const totalPages = this.totalPages();
    const currentPage = this.currentPage();
    const pages: number[] = [];

    // Show up to 5 page numbers around current page
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  }
  
  // Helper methods for pagination display
  getStartIndex(): number {
    return (this.currentPage() - 1) * this.pageSize() + 1;
  }

  getEndIndex(): number {
    return Math.min(this.currentPage() * this.pageSize(), this.totalCount());
  }
  
  // RTL/LTR Arrow Direction Methods
  getFirstPageIcon(): string {
    return this.translationService.isRTL() ? 'bi-chevron-double-right' : 'bi-chevron-double-left';
  }
  
  getPreviousPageIcon(): string {
    return this.translationService.isRTL() ? 'bi-chevron-right' : 'bi-chevron-left';
  }
  
  getNextPageIcon(): string {
    return this.translationService.isRTL() ? 'bi-chevron-left' : 'bi-chevron-right';
  }
  
  getLastPageIcon(): string {
    return this.translationService.isRTL() ? 'bi-chevron-double-left' : 'bi-chevron-double-right';
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  getRatingDisplay(rating: number): string {
    if (!rating || rating === 0) {
      return 'No rating';
    }
    return `${rating.toFixed(1)}/5`;
  }

  getRatingStars(rating: number): string[] {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    // Add full stars
    for (let i = 0; i < fullStars; i++) {
      stars.push('bi-star-fill');
    }
    
    // Add half star if needed
    if (hasHalfStar) {
      stars.push('bi-star-half');
    }
    
    // Add empty stars to make 5 total
    while (stars.length < 5) {
      stars.push('bi-star');
    }
    
    return stars;
  }
}
