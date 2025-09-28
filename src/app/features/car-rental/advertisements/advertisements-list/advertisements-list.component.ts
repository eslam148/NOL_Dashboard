import { Component, OnInit, inject, signal, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import { CarRentalService } from '../../../../core/services/car-rental.service';
import { Advertisement, AdvertisementFilter, AdvertisementType, AdvertisementStatus } from '../../../../core/models/car-rental.models';

@Component({
  selector: 'app-advertisements-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, TranslatePipe],
  templateUrl: './advertisements-list.component.html',
  styleUrls: ['./advertisements-list.component.css']
})
export class AdvertisementsListComponent implements OnInit {
  private carRentalService = inject(CarRentalService);

  advertisements = signal<Advertisement[]>([]);
  filteredAdvertisements = signal<Advertisement[]>([]);
  isLoading = signal(false);
  searchQuery = signal('');
  selectedType = signal<AdvertisementType | ''>('');
  selectedStatus = signal<AdvertisementStatus | ''>('');
  
  // Dropdown state management
  openDropdowns = signal<Set<string>>(new Set());

  // Advertisement types and statuses
  advertisementTypes: { value: AdvertisementType | ''; label: string }[] = [
    { value: '', label: 'advertisements.allTypes' },
    { value: 'banner', label: 'advertisements.banner' },
    { value: 'popup', label: 'advertisements.popup' },
    { value: 'sidebar', label: 'advertisements.sidebar' },
    { value: 'featured', label: 'advertisements.featured' },
    { value: 'promotion', label: 'advertisements.promotion' }
  ];

  advertisementStatuses: { value: AdvertisementStatus | ''; label: string }[] = [
    { value: '', label: 'advertisements.allStatuses' },
    { value: 'draft', label: 'advertisements.draft' },
    { value: 'active', label: 'advertisements.active' },
    { value: 'paused', label: 'advertisements.paused' },
    { value: 'expired', label: 'advertisements.expired' },
    { value: 'archived', label: 'advertisements.archived' }
  ];

  ngOnInit() {
    this.loadAdvertisements();
  }

  loadAdvertisements() {
    this.isLoading.set(true);
    
    const filter: AdvertisementFilter = {};
    if (this.selectedType()) filter.type = this.selectedType() as AdvertisementType;
    if (this.selectedStatus()) filter.status = this.selectedStatus() as AdvertisementStatus;

    this.carRentalService.getAdvertisements(filter).subscribe({
      next: (advertisements) => {
        this.advertisements.set(advertisements);
        this.applyFilters();
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading advertisements:', error);
        this.isLoading.set(false);
      }
    });
  }

  applyFilters() {
    let filtered = this.advertisements();

    // Apply search filter
    if (this.searchQuery()) {
      const query = this.searchQuery().toLowerCase();
      filtered = filtered.filter(ad =>
        ad.title.toLowerCase().includes(query) ||
        ad.description.toLowerCase().includes(query) ||
        ad.type.toLowerCase().includes(query)
      );
    }

    this.filteredAdvertisements.set(filtered);
  }

  onSearchChange(event: Event) {
    const target = event.target as HTMLInputElement;
    this.searchQuery.set(target.value);
    this.applyFilters();
  }

  onTypeChange() {
    this.loadAdvertisements();
  }

  onStatusChange() {
    this.loadAdvertisements();
  }

  onRefresh() {
    this.loadAdvertisements();
  }

  // Dropdown methods
  toggleDropdown(advertisementId: string) {
    const current = new Set(this.openDropdowns());
    if (current.has(advertisementId)) {
      current.delete(advertisementId);
    } else {
      current.clear(); // Close other dropdowns
      current.add(advertisementId);
    }
    this.openDropdowns.set(current);
  }

  isDropdownOpen(advertisementId: string): boolean {
    return this.openDropdowns().has(advertisementId);
  }

  closeAllDropdowns() {
    this.openDropdowns.set(new Set());
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: Event) {
    const target = event.target as HTMLElement;
    // Close dropdown if clicking outside of dropdown elements
    if (!target.closest('.dropdown')) {
      this.closeAllDropdowns();
    }
  }

  updateAdvertisementStatus(advertisement: Advertisement, newStatus: AdvertisementStatus) {
    this.carRentalService.updateAdvertisementStatus(advertisement.id, newStatus).subscribe({
      next: (updatedAd) => {
        if (updatedAd) {
          const ads = this.advertisements();
          const index = ads.findIndex(ad => ad.id === advertisement.id);
          if (index !== -1) {
            ads[index] = updatedAd;
            this.advertisements.set([...ads]);
            this.applyFilters();
          }
        }
      },
      error: (error) => {
        console.error('Error updating advertisement status:', error);
      }
    });
  }

  deleteAdvertisement(advertisement: Advertisement) {
    if (confirm(`Are you sure you want to delete "${advertisement.title}"?`)) {
      this.carRentalService.deleteAdvertisement(advertisement.id).subscribe({
        next: (success) => {
          if (success) {
            const ads = this.advertisements().filter(ad => ad.id !== advertisement.id);
            this.advertisements.set(ads);
            this.applyFilters();
          }
        },
        error: (error) => {
          console.error('Error deleting advertisement:', error);
        }
      });
    }
  }

  getStatusBadgeClass(status: AdvertisementStatus): string {
    const statusClasses = {
      draft: 'badge-gray',
      active: 'badge-success',
      paused: 'badge-warning',
      expired: 'badge-error',
      archived: 'badge-gray'
    };
    return statusClasses[status] || 'badge-gray';
  }

  getTypeBadgeClass(type: AdvertisementType): string {
    const typeClasses = {
      banner: 'badge-primary',
      popup: 'badge-warning',
      sidebar: 'badge-info',
      featured: 'badge-success',
      promotion: 'badge-error'
    };
    return typeClasses[type] || 'badge-gray';
  }

  formatCurrency(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }).format(new Date(date));
  }

  calculateCTR(clicks: number, impressions: number): number {
    return impressions > 0 ? (clicks / impressions) * 100 : 0;
  }

  calculateConversionRate(conversions: number, clicks: number): number {
    return clicks > 0 ? (conversions / clicks) * 100 : 0;
  }

  isExpired(endDate: Date): boolean {
    return new Date(endDate) < new Date();
  }

  isActive(advertisement: Advertisement): boolean {
    const now = new Date();
    return advertisement.status === 'active' && 
           new Date(advertisement.startDate) <= now && 
           new Date(advertisement.endDate) >= now;
  }
}
