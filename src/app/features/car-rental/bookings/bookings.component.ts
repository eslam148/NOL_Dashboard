import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { CarRentalService } from '../../../core/services/car-rental.service';
import { Booking, BookingStatus, PaymentStatus } from '../../../core/models/car-rental.models';

@Component({
  selector: 'app-bookings',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, TranslatePipe],
  templateUrl: './bookings.component.html',
  styleUrls: ['./bookings.component.css']
})
export class BookingsComponent implements OnInit {
  private carRentalService = inject(CarRentalService);

  bookings = signal<Booking[]>([]);
  filteredBookings = signal<Booking[]>([]);
  isLoading = signal(false);
  searchTerm = signal('');
  statusFilter = signal<string>('all');
  paymentFilter = signal<string>('all');
  selectedTab = signal<'bookings' | 'calendar' | 'analytics'>('bookings');

  // Filter options
  statusOptions = [
    { value: 'all', label: 'bookings.allStatuses' },
    { value: 'pending', label: 'bookings.pending' },
    { value: 'confirmed', label: 'bookings.confirmed' },
    { value: 'active', label: 'bookings.active' },
    { value: 'completed', label: 'bookings.completed' },
    { value: 'cancelled', label: 'bookings.cancelled' },
    { value: 'no_show', label: 'bookings.noShow' }
  ];

  paymentOptions = [
    { value: 'all', label: 'bookings.allPayments' },
    { value: 'pending', label: 'bookings.paymentPending' },
    { value: 'partial', label: 'bookings.paymentPartial' },
    { value: 'paid', label: 'bookings.paymentPaid' },
    { value: 'refunded', label: 'bookings.paymentRefunded' },
    { value: 'failed', label: 'bookings.paymentFailed' }
  ];

  ngOnInit() {
    this.loadBookings();
  }

  private loadBookings() {
    this.isLoading.set(true);
    this.carRentalService.getBookings().subscribe({
      next: (bookings) => {
        this.bookings.set(bookings);
        this.applyFilters();
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading bookings:', error);
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

  onPaymentFilterChange(payment: string) {
    this.paymentFilter.set(payment);
    this.applyFilters();
  }

  private applyFilters() {
    let filtered = [...this.bookings()];

    // Apply search filter
    const search = this.searchTerm().toLowerCase();
    if (search) {
      filtered = filtered.filter(booking =>
        booking.bookingNumber.toLowerCase().includes(search) ||
        booking.customer.firstName.toLowerCase().includes(search) ||
        booking.customer.lastName.toLowerCase().includes(search) ||
        booking.customer.email.toLowerCase().includes(search) ||
        booking.vehicle.make.toLowerCase().includes(search) ||
        booking.vehicle.model.toLowerCase().includes(search) ||
        booking.vehicle.licensePlate.toLowerCase().includes(search)
      );
    }

    // Apply status filter
    if (this.statusFilter() !== 'all') {
      filtered = filtered.filter(booking => booking.status === this.statusFilter());
    }

    // Apply payment filter
    if (this.paymentFilter() !== 'all') {
      filtered = filtered.filter(booking => booking.paymentStatus === this.paymentFilter());
    }

    this.filteredBookings.set(filtered);
  }

  getStatusBadgeClass(status: BookingStatus): string {
    switch (status) {
      case 'pending': return 'badge badge-warning';
      case 'confirmed': return 'badge badge-info';
      case 'Open': return 'badge badge-success';
      case 'completed': return 'badge badge-primary';
      case 'Canceled': return 'badge badge-error';
      default: return 'badge badge-gray';
    }
  }

  getPaymentBadgeClass(status: PaymentStatus): string {
    switch (status) {
      case 'pending': return 'badge badge-warning';
      case 'partial': return 'badge badge-info';
      case 'paid': return 'badge badge-success';
      case 'refunded': return 'badge badge-primary';
      case 'failed': return 'badge badge-error';
      default: return 'badge badge-gray';
    }
  }

  getStatusIcon(status: BookingStatus): string {
    switch (status) {
      case 'pending': return 'bi-clock';
      case 'confirmed': return 'bi-check-circle';
      case 'Open': return 'bi-play-circle';
      case 'completed': return 'bi-check-circle-fill';
      case 'Canceled': return 'bi-x-circle';
      default: return 'bi-question-circle';
    }
  }

  updateBookingStatus(booking: Booking, newStatus: BookingStatus) {
    this.carRentalService.updateBookingStatus(booking.id, newStatus).subscribe({
      next: (updatedBooking) => {
        // Update the booking in the list
        if (updatedBooking) {
          const bookings = this.bookings();
          const index = bookings.findIndex(b => b.id === booking.id);
          if (index !== -1) {
            bookings[index] = updatedBooking as Booking;
            this.bookings.set([...bookings]);
            this.applyFilters();
          }
        }
      },
      error: (error) => {
        console.error('Error updating booking status:', error);
      }
    });
  }

  updatePaymentStatus(booking: Booking, newStatus: PaymentStatus) {
    this.carRentalService.updatePaymentStatus(booking.id, newStatus).subscribe({
      next: (updatedBooking) => {
        // Update the booking in the list
        if (updatedBooking) {
          const bookings = this.bookings();
          const index = bookings.findIndex(b => b.id === booking.id);
          if (index !== -1) {
            bookings[index] = updatedBooking as Booking;
            this.bookings.set([...bookings]);
            this.applyFilters();
          }
        }
      },
      error: (error) => {
        console.error('Error updating payment status:', error);
      }
    });
  }

  deleteBooking(booking: Booking) {
    if (confirm(`Are you sure you want to delete booking "${booking.bookingNumber}"?`)) {
      this.carRentalService.deleteBooking(booking.id).subscribe({
        next: (success) => {
          if (success) {
            this.loadBookings();
          }
        },
        error: (error) => {
          console.error('Error deleting booking:', error);
        }
      });
    }
  }

  switchTab(tab: 'bookings' | 'calendar' | 'analytics') {
    this.selectedTab.set(tab);
  }

  refreshBookings() {
    this.loadBookings();
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

  formatDateTime(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }

  getDaysUntil(date: Date): number {
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }

  getBookingStats() {
    const bookings = this.bookings();
    return {
      total: bookings.length,
      pending: bookings.filter(b => b.status === 'pending').length,
      confirmed: bookings.filter(b => b.status === 'confirmed').length,
      active: bookings.filter(b => b.status === 'Open').length,
      completed: bookings.filter(b => b.status === 'completed').length,
      cancelled: bookings.filter(b => b.status === 'Canceled').length,
      totalRevenue: bookings.filter(b => b.paymentStatus === 'paid').reduce((sum, b) => sum + b.totalAmount, 0),
      pendingPayments: bookings.filter(b => b.paymentStatus === 'pending').reduce((sum, b) => sum + b.totalAmount, 0)
    };
  }
}
