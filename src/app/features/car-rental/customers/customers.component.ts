import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { CarRentalService } from '../../../core/services/car-rental.service';
import { Customer, CustomerType, RentalHistory } from '../../../core/models/car-rental.models';

@Component({
  selector: 'app-customers',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, TranslatePipe],
  templateUrl: './customers.component.html',
  styleUrls: ['./customers.component.css']
})
export class CustomersComponent implements OnInit {
  private carRentalService = inject(CarRentalService);

  customers = signal<Customer[]>([]);
  filteredCustomers = signal<Customer[]>([]);
  selectedCustomerHistory = signal<RentalHistory[]>([]);
  isLoading = signal(false);
  isLoadingHistory = signal(false);
  searchTerm = signal('');
  typeFilter = signal<string>('all');
  statusFilter = signal<string>('all');
  selectedTab = signal<'customers' | 'analytics'>('customers');
  selectedCustomerId = signal<string | null>(null);

  // Filter options
  typeOptions = [
    { value: 'all', label: 'customers.allTypes' },
    { value: 'regular', label: 'customers.regular' },
    { value: 'premium', label: 'customers.premium' },
    { value: 'corporate', label: 'customers.corporate' }
  ];

  statusOptions = [
    { value: 'all', label: 'customers.allStatuses' },
    { value: 'active', label: 'customers.active' },
    { value: 'inactive', label: 'customers.inactive' },
    { value: 'blacklisted', label: 'customers.blacklisted' }
  ];

  ngOnInit() {
    this.loadCustomers();
  }

  private loadCustomers() {
    this.isLoading.set(true);
    this.carRentalService.getCustomers().subscribe({
      next: (customers) => {
        this.customers.set(customers);
        this.applyFilters();
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading customers:', error);
        this.isLoading.set(false);
      }
    });
  }

  onSearchChange(term: string) {
    this.searchTerm.set(term);
    this.applyFilters();
  }

  onTypeFilterChange(type: string) {
    this.typeFilter.set(type);
    this.applyFilters();
  }

  onStatusFilterChange(status: string) {
    this.statusFilter.set(status);
    this.applyFilters();
  }

  private applyFilters() {
    let filtered = [...this.customers()];

    // Apply search filter
    const search = this.searchTerm().toLowerCase();
    if (search) {
      filtered = filtered.filter(customer =>
        customer.firstName.toLowerCase().includes(search) ||
        customer.lastName.toLowerCase().includes(search) ||
        customer.email.toLowerCase().includes(search) ||
        customer.phone.toLowerCase().includes(search) ||
        customer.driverLicense.number.toLowerCase().includes(search)
      );
    }

    // Apply type filter
    if (this.typeFilter() !== 'all') {
      filtered = filtered.filter(customer => customer.customerType === this.typeFilter());
    }

    // Apply status filter
    if (this.statusFilter() !== 'all') {
      if (this.statusFilter() === 'blocked') {
        filtered = filtered.filter(customer => customer.status === 'blocked');
      } else {
        filtered = filtered.filter(customer => customer.status === this.statusFilter());
      }
    }

    this.filteredCustomers.set(filtered);
  }

  getCustomerTypeBadgeClass(type: CustomerType): string {
    switch (type) {
      case 'premium': return 'badge badge-gold';
      case 'corporate': return 'badge badge-primary';
      case 'regular': return 'badge badge-success';
      default: return 'badge badge-gray';
    }
  }

  getCustomerTypeIcon(type: CustomerType): string {
    switch (type) {
      case 'premium': return 'bi-gem';
      case 'corporate': return 'bi-building';
      case 'regular': return 'bi-person';
      default: return 'bi-person';
    }
  }

  toggleCustomerStatus(customer: Customer) {
    this.carRentalService.toggleCustomerStatus(customer.id).subscribe({
      next: (updatedCustomer) => {
        // Update the customer in the list
        const customers = this.customers();
        const index = customers.findIndex(c => c.id === customer.id);
        if (index !== -1) {
          customers[index] = updatedCustomer;
          this.customers.set([...customers]);
          this.applyFilters();
        }
      },
      error: (error) => {
        console.error('Error updating customer status:', error);
      }
    });
  }

  toggleCustomerBlacklist(customer: Customer) {
    if (confirm(`Are you sure you want to ${customer.status === 'blocked' ? 'unblock' : 'block'} this customer?`)) {
      this.carRentalService.toggleCustomerBlacklist(customer.id).subscribe({
        next: (updatedCustomer) => {
          // Update the customer in the list
          const customers = this.customers();
          const index = customers.findIndex(c => c.id === customer.id);
          if (index !== -1) {
            customers[index] = updatedCustomer;
            this.customers.set([...customers]);
            this.applyFilters();
          }
        },
        error: (error) => {
          console.error('Error updating customer blacklist status:', error);
        }
      });
    }
  }

  viewCustomerHistory(customer: Customer) {
    this.selectedCustomerId.set(customer.id);
    this.isLoadingHistory.set(true);
    this.carRentalService.getCustomerRentalHistory(customer.id).subscribe({
      next: (history) => {
        this.selectedCustomerHistory.set(history);
        this.isLoadingHistory.set(false);
      },
      error: (error) => {
        console.error('Error loading rental history:', error);
        this.isLoadingHistory.set(false);
      }
    });
  }

  closeHistoryModal() {
    this.selectedCustomerId.set(null);
    this.selectedCustomerHistory.set([]);
  }

  deleteCustomer(customer: Customer) {
    if (confirm(`Are you sure you want to delete customer "${customer.firstName} ${customer.lastName}"?`)) {
      this.carRentalService.deleteCustomer(customer.id).subscribe({
        next: (success) => {
          if (success) {
            this.loadCustomers();
          }
        },
        error: (error) => {
          console.error('Error deleting customer:', error);
        }
      });
    }
  }

  switchTab(tab: 'customers' | 'analytics') {
    this.selectedTab.set(tab);
  }

  refreshCustomers() {
    this.loadCustomers();
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
    }).format(date);
  }

  getTimeSince(date: Date): string {
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInDays === 0) {
      return 'Today';
    } else if (diffInDays === 1) {
      return 'Yesterday';
    } else if (diffInDays < 30) {
      return `${diffInDays} days ago`;
    } else if (diffInDays < 365) {
      const months = Math.floor(diffInDays / 30);
      return `${months} month${months > 1 ? 's' : ''} ago`;
    } else {
      const years = Math.floor(diffInDays / 365);
      return `${years} year${years > 1 ? 's' : ''} ago`;
    }
  }

  getCustomerStats() {
    const customers = this.customers();
    return {
      total: customers.length,
      active: customers.filter(c => c.status === 'active').length,
      premium: customers.filter(c => c.customerType === 'premium').length,
      corporate: customers.filter(c => c.customerType === 'corporate').length,
      blocked: customers.filter(c => c.status === 'blocked').length,
      totalRevenue: customers.reduce((sum, c) => sum + c.totalSpent, 0),
      averageSpent: customers.length > 0 ? customers.reduce((sum, c) => sum + c.totalSpent, 0) / customers.length : 0
    };
  }
}
