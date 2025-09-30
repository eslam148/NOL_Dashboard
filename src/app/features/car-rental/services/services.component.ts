import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { ConfirmService } from '../../../shared/services/confirm.service';
import { CarRentalService } from '../../../core/services/car-rental.service';
import { AdditionalService, ServiceCategory } from '../../../core/models/car-rental.models';

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, TranslatePipe],
  templateUrl: './services.component.html',
  styleUrls: ['./services.component.css']
})
export class ServicesComponent implements OnInit {
  private carRentalService = inject(CarRentalService);
  private confirm = inject(ConfirmService);

  services = signal<AdditionalService[]>([]);
  filteredServices = signal<AdditionalService[]>([]);
  isLoading = signal(false);
  searchTerm = signal('');
  categoryFilter = signal<string>('all');
  availabilityFilter = signal<string>('all');

  // Filter options
  categoryOptions = [
    { value: 'all', label: 'services.allCategories' },
    { value: 'navigation', label: 'services.navigation' },
    { value: 'safety', label: 'services.safety' },
    { value: 'comfort', label: 'services.comfort' },
    { value: 'insurance', label: 'services.insurance' },
    { value: 'equipment', label: 'services.equipment' }
  ];

  availabilityOptions = [
    { value: 'all', label: 'services.allAvailability' },
    { value: 'available', label: 'services.available' },
    { value: 'unavailable', label: 'services.unavailable' }
  ];

  ngOnInit() {
    this.loadServices();
  }

  private loadServices() {
    this.isLoading.set(true);
    this.carRentalService.getAdditionalServices().subscribe({
      next: (services) => {
        this.services.set(services);
        this.applyFilters();
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading services:', error);
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

  onAvailabilityFilterChange(availability: string) {
    this.availabilityFilter.set(availability);
    this.applyFilters();
  }

  private applyFilters() {
    let filtered = [...this.services()];

    // Apply search filter
    const search = this.searchTerm().toLowerCase();
    if (search) {
      filtered = filtered.filter(service =>
        service.name.toLowerCase().includes(search) ||
        service.description.toLowerCase().includes(search)
      );
    }

    // Apply category filter
    if (this.categoryFilter() !== 'all') {
      filtered = filtered.filter(service => service.category === this.categoryFilter());
    }

    // Apply availability filter
    if (this.availabilityFilter() !== 'all') {
      const isAvailable = this.availabilityFilter() === 'available';
      filtered = filtered.filter(service => service.isAvailable === isAvailable);
    }

    this.filteredServices.set(filtered);
  }

  getCategoryIcon(category: ServiceCategory): string {
    switch (category) {
      case 'navigation': return 'bi-compass';
      case 'safety': return 'bi-shield-check';
      case 'comfort': return 'bi-star';
      case 'insurance': return 'bi-shield-fill-check';
      case 'equipment': return 'bi-tools';
      default: return 'bi-plus-circle';
    }
  }

  getCategoryBadgeClass(category: ServiceCategory): string {
    switch (category) {
      case 'navigation': return 'badge badge-info';
      case 'safety': return 'badge badge-success';
      case 'comfort': return 'badge badge-purple';
      case 'insurance': return 'badge badge-warning';
      case 'equipment': return 'badge badge-primary';
      default: return 'badge badge-gray';
    }
  }

  toggleServiceAvailability(service: AdditionalService) {
    this.carRentalService.toggleServiceAvailability(service.id).subscribe({
      next: (updatedService) => {
        // Update the service in the list
        const services = this.services();
        const index = services.findIndex(s => s.id === service.id);
        if (index !== -1) {
          services[index] = updatedService;
          this.services.set([...services]);
          this.applyFilters();
        }
      },
      error: (error) => {
        console.error('Error updating service availability:', error);
      }
    });
  }

  async deleteService(service: AdditionalService) {
    const ok = await this.confirm.confirm({
      title: 'Confirm Deletion',
      message: `Are you sure you want to delete "${service.name}"?`,
      confirmText: 'Delete',
      cancelText: 'Cancel',
      variant: 'danger'
    });
    if (!ok) return;
    this.carRentalService.deleteService(service.id).subscribe({
      next: (success) => { if (success) this.loadServices(); },
      error: (error) => console.error('Error deleting service:', error)
    });
  }

  refreshList() {
    this.loadServices();
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }
}
