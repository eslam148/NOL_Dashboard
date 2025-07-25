import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import { CarRentalService } from '../../../../core/services/car-rental.service';
import { Branch, BranchFilter } from '../../../../core/models/car-rental.models';

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
  filteredBranches = signal<Branch[]>([]);
  isLoading = signal(false);
  searchTerm = signal('');
  statusFilter = signal<string>('all');
  cityFilter = signal<string>('all');
  
  // Available filter options
  statusOptions = [
    { value: 'all', label: 'branches.allStatuses' },
    { value: 'active', label: 'branches.active' },
    { value: 'inactive', label: 'branches.inactive' },
    { value: 'maintenance', label: 'branches.maintenance' }
  ];

  ngOnInit() {
    this.loadBranches();
  }

  private loadBranches() {
    this.isLoading.set(true);
    this.carRentalService.getBranches().subscribe({
      next: (branches) => {
        this.branches.set(branches);
        this.applyFilters();
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading branches:', error);
        this.isLoading.set(false);
      }
    });
  }

  onSearchChange(term: string) {
    this.searchTerm.set(term);
    this.applyFilters();
  }

  onStatusFilterChange(status: string) {
    this.statusFilter.set(status);
    this.applyFilters();
  }

  onCityFilterChange(city: string) {
    this.cityFilter.set(city);
    this.applyFilters();
  }

  private applyFilters() {
    let filtered = [...this.branches()];
    
    // Apply search filter
    const search = this.searchTerm().toLowerCase();
    if (search) {
      filtered = filtered.filter(branch => 
        branch.name.toLowerCase().includes(search) ||
        branch.address.toLowerCase().includes(search) ||
        branch.city.toLowerCase().includes(search) ||
        branch.manager.toLowerCase().includes(search)
      );
    }
    
    // Apply status filter
    if (this.statusFilter() !== 'all') {
      filtered = filtered.filter(branch => branch.status === this.statusFilter());
    }
    
    // Apply city filter
    if (this.cityFilter() !== 'all') {
      filtered = filtered.filter(branch => branch.city === this.cityFilter());
    }
    
    this.filteredBranches.set(filtered);
  }

  getUniqueCities(): string[] {
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
    this.loadBranches();
  }
}
