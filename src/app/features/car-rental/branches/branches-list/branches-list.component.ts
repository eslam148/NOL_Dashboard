import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import { CarRentalService } from '../../../../core/services/car-rental.service';
import { Branch, BranchFilter } from '../../../../core/models/car-rental.models';
import { PaginatedResponse } from '../../../../core/models/api.models';

@Component({
  selector: 'app-branches-list',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, TranslatePipe],
  templateUrl: './branches-list.component.html',
  styleUrls: ['./branches-list.component.css']
})
export class BranchesListComponent implements OnInit {
  private carRentalService = inject(CarRentalService);

  branches = signal<Branch[]>([]);
  isLoading = signal(false);
  searchTerm = signal('');
  statusFilter = signal<string>('all');
  cityFilter = signal<string>('all');

  // Pagination properties
  currentPage = signal(1);
  pageSize = signal(10);
  totalCount = signal(0);
  totalPages = signal(0);
  hasPreviousPage = signal(false);
  hasNextPage = signal(false);

  // Available filter options
  statusOptions = [
    { value: 'all', label: 'branches.allStatuses' },
    { value: 'active', label: 'branches.active' },
    { value: 'inactive', label: 'branches.inactive' },
    { value: 'maintenance', label: 'branches.maintenance' }
  ];

  // Page size options
  pageSizeOptions = [
    { value: 5, label: '5' },
    { value: 10, label: '10' },
    { value: 20, label: '20' },
    { value: 50, label: '50' }
  ];

  ngOnInit() {
    this.loadBranches();
  }

  private loadBranches() {
    this.isLoading.set(true);

    const filter = this.buildFilter();

    this.carRentalService.getBranchesPaginated(filter).subscribe({
      next: (paginatedResponse: PaginatedResponse<Branch>) => {
        this.branches.set(paginatedResponse.data);
        this.updatePaginationInfo(paginatedResponse);
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading branches:', error);
        this.isLoading.set(false);
      }
    });
  }

  private buildFilter(): any {
    const filter: any = {
      page: this.currentPage(),
      pageSize: this.pageSize()
    };

    // Add search filter
    if (this.searchTerm()) {
      filter.name = this.searchTerm();
    }

    // Add status filter
    if (this.statusFilter() !== 'all') {
      filter.isActive = this.statusFilter() === 'active';
    }

    // Add city filter
    if (this.cityFilter() !== 'all') {
      filter.city = this.cityFilter();
    }

    return filter;
  }

  private updatePaginationInfo(paginatedResponse: PaginatedResponse<Branch>) {
    this.totalCount.set(paginatedResponse.totalCount);
    this.totalPages.set(paginatedResponse.totalPages);
    this.hasPreviousPage.set(paginatedResponse.hasPreviousPage);
    this.hasNextPage.set(paginatedResponse.hasNextPage);
  }

  onSearchChange(term: string) {
    this.searchTerm.set(term);
    this.currentPage.set(1); // Reset to first page when searching
    this.loadBranches();
  }

  onStatusFilterChange(status: string) {
    this.statusFilter.set(status);
    this.currentPage.set(1); // Reset to first page when filtering
    this.loadBranches();
  }

  onCityFilterChange(city: string) {
    this.cityFilter.set(city);
    this.currentPage.set(1); // Reset to first page when filtering
    this.loadBranches();
  }

  onPageSizeChange(newPageSize: number) {
    this.pageSize.set(newPageSize);
    this.currentPage.set(1); // Reset to first page when changing page size
    this.loadBranches();
  }

  onPageChange(newPage: number) {
    if (newPage >= 1 && newPage <= this.totalPages()) {
      this.currentPage.set(newPage);
      this.loadBranches();
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

  getUniqueCities(): string[] {
    // Note: This will only show cities from current page
    // For full city list, consider a separate API call
    const cities = this.branches().map(branch => branch.city);
    return [...new Set(cities)].sort();
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'active': return 'badge badge-success';
      case 'inactive': return 'badge badge-gray';
      case 'maintenance': return 'badge badge-warning';
      default: return 'badge badge-gray';
    }
  }

  deleteBranch(branch: Branch) {
    if (confirm(`Are you sure you want to delete ${branch.name}?`)) {
      this.carRentalService.deleteBranch(branch.id).subscribe({
        next: (success) => {
          if (success) {
            this.loadBranches();
          }
        },
        error: (error) => {
          console.error('Error deleting branch:', error);
        }
      });
    }
  }

  refreshList() {
    this.currentPage.set(1);
    this.loadBranches();
  }

  // Helper methods for pagination display
  getStartIndex(): number {
    return (this.currentPage() - 1) * this.pageSize() + 1;
  }

  getEndIndex(): number {
    return Math.min(this.currentPage() * this.pageSize(), this.totalCount());
  }

  getOperatingHoursDisplay(branch: Branch): string {
    if (!branch.operatingHours) {
      return 'Not specified';
    }

    // Try to find a typical day's hours (Monday or first available day)
    const days = Object.keys(branch.operatingHours);
    if (days.length === 0) {
      return 'Not specified';
    }

    const firstDay = branch.operatingHours[days[0]];
    if (firstDay && firstDay.isOpen) {
      return `${firstDay.open} - ${firstDay.close}`;
    }

    return 'Closed';
  }
}
