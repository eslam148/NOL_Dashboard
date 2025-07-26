import { Component, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import { CarRentalService } from '../../../../core/services/car-rental.service';
import { Vehicle, Customer, AdditionalService, Booking } from '../../../../core/models/car-rental.models';

@Component({
  selector: 'app-booking-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, TranslatePipe],
  templateUrl: './booking-form.component.html',
  styleUrl: './booking-form.component.css'
})
export class BookingFormComponent implements OnInit {
  bookingForm: FormGroup;
  isLoading = signal(false);
  isSubmitting = signal(false);
  bookingId = signal<string | null>(null);

  // Data for dropdowns
  vehicles = signal<Vehicle[]>([]);
  customers = signal<Customer[]>([]);
  additionalServices = signal<AdditionalService[]>([]);

  // Computed properties
  isEditMode = computed(() => !!this.bookingId());
  selectedVehicle = computed(() => {
    const vehicleId = this.bookingForm?.get('vehicleId')?.value;
    return this.vehicles().find(v => v.id === vehicleId) || null;
  });

  // Pricing calculations
  totalDays = computed(() => {
    const startDate = this.bookingForm?.get('startDate')?.value;
    const endDate = this.bookingForm?.get('endDate')?.value;
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      return Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;
    }
    return 1;
  });

  vehicleTotal = computed(() => {
    const vehicle = this.selectedVehicle();
    const days = this.totalDays();
    return vehicle ? vehicle.dailyRate * days : 0;
  });

  servicesTotal = computed(() => {
    const selectedServices = this.bookingForm?.get('selectedServices')?.value || [];
    const days = this.totalDays();
    return selectedServices.reduce((total: number, serviceId: string) => {
      const service = this.additionalServices().find(s => s.id === serviceId);
      return total + (service ? service.dailyRate * days : 0);
    }, 0);
  });

  grandTotal = computed(() => {
    return this.vehicleTotal() + this.servicesTotal();
  });

  // Status options
  statusOptions = [
    { value: 'pending', label: 'bookings.pending' },
    { value: 'confirmed', label: 'bookings.confirmed' },
    { value: 'active', label: 'bookings.active' },
    { value: 'completed', label: 'bookings.completed' },
    { value: 'cancelled', label: 'bookings.cancelled' }
  ];

  paymentStatusOptions = [
    { value: 'pending', label: 'bookings.paymentPending' },
    { value: 'partial', label: 'bookings.paymentPartial' },
    { value: 'paid', label: 'bookings.paymentPaid' },
    { value: 'refunded', label: 'bookings.paymentRefunded' }
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private carRentalService: CarRentalService
  ) {
    this.bookingForm = this.createForm();
  }

  ngOnInit() {
    this.loadInitialData();

    // Check if editing existing booking
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      this.bookingId.set(id);
      this.loadBooking(id);
    }

    // Watch for date changes to recalculate pricing
    this.bookingForm.get('startDate')?.valueChanges.subscribe(() => {
      this.updatePricing();
    });

    this.bookingForm.get('endDate')?.valueChanges.subscribe(() => {
      this.updatePricing();
    });

    this.bookingForm.get('vehicleId')?.valueChanges.subscribe(() => {
      this.updatePricing();
    });

    this.bookingForm.get('selectedServices')?.valueChanges.subscribe(() => {
      this.updatePricing();
    });
  }

  private createForm(): FormGroup {
    return this.fb.group({
      customerId: ['', Validators.required],
      vehicleId: ['', Validators.required],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      startTime: ['09:00', Validators.required],
      endTime: ['18:00', Validators.required],
      pickupLocation: ['', Validators.required],
      dropoffLocation: ['', Validators.required],
      selectedServices: [[]],
      status: ['pending', Validators.required],
      paymentStatus: ['pending', Validators.required],
      totalAmount: [0],
      paidAmount: [0],
      notes: [''],
      specialRequests: ['']
    });
  }

  private loadInitialData() {
    this.isLoading.set(true);

    // Load vehicles
    this.carRentalService.getVehicles().subscribe({
      next: (vehicles) => {
        this.vehicles.set(vehicles.filter(v => v.status === 'available'));
      }
    });

    // Load customers
    this.carRentalService.getCustomers().subscribe({
      next: (customers) => {
        this.customers.set(customers.filter(c => c.isActive));
      }
    });

    // Load additional services
    this.carRentalService.getAdditionalServices().subscribe({
      next: (services) => {
        this.additionalServices.set(services.filter(s => s.isAvailable));
        this.isLoading.set(false);
      }
    });
  }

  private loadBooking(id: string) {
    this.isLoading.set(true);
    this.carRentalService.getBookingById(id).subscribe({
      next: (booking) => {
        if (booking) {
          this.populateForm(booking);
        }
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading booking:', error);
        this.isLoading.set(false);
      }
    });
  }

  private populateForm(booking: Booking) {
    this.bookingForm.patchValue({
      customerId: booking.customerId,
      vehicleId: booking.vehicleId,
      startDate: this.formatDateForInput(booking.startDate),
      endDate: this.formatDateForInput(booking.endDate),
      startTime: this.formatTimeForInput(booking.startDate),
      endTime: this.formatTimeForInput(booking.endDate),
      pickupLocation: booking.pickupLocation,
      dropoffLocation: booking.dropoffLocation,
      selectedServices: booking.additionalServices?.map(s => s.serviceId) || [],
      status: booking.status,
      paymentStatus: booking.paymentStatus,
      totalAmount: booking.totalAmount,
      paidAmount: booking.paidAmount,
      notes: booking.notes || '',
      specialRequests: booking.specialRequests || ''
    });
  }

  private formatDateForInput(date: Date): string {
    return new Date(date).toISOString().split('T')[0];
  }

  private formatTimeForInput(date: Date): string {
    return new Date(date).toTimeString().slice(0, 5);
  }

  private updatePricing() {
    // Update total amount in form
    this.bookingForm.patchValue({
      totalAmount: this.grandTotal()
    }, { emitEvent: false });
  }

  onSubmit() {
    if (this.bookingForm.valid) {
      this.isSubmitting.set(true);
      const formData = this.prepareFormData();

      const operation = this.isEditMode()
        ? this.carRentalService.updateBooking(this.bookingId()!, formData)
        : this.carRentalService.createBooking(formData);

      operation.subscribe({
        next: (booking) => {
          this.isSubmitting.set(false);
          this.router.navigate(['/car-rental/bookings']);
        },
        error: (error) => {
          console.error('Error saving booking:', error);
          this.isSubmitting.set(false);
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  private prepareFormData(): any {
    const formValue = this.bookingForm.value;

    // Combine date and time
    const startDateTime = new Date(`${formValue.startDate}T${formValue.startTime}`);
    const endDateTime = new Date(`${formValue.endDate}T${formValue.endTime}`);

    // Prepare additional services
    const additionalServices = formValue.selectedServices.map((serviceId: string) => {
      const service = this.additionalServices().find(s => s.id === serviceId);
      return {
        serviceId,
        quantity: 1,
        unitPrice: service?.dailyRate || 0,
        totalPrice: (service?.dailyRate || 0) * this.totalDays()
      };
    });

    const data: any = {
      customerId: formValue.customerId,
      vehicleId: formValue.vehicleId,
      startDate: startDateTime,
      endDate: endDateTime,
      pickupLocation: formValue.pickupLocation,
      dropoffLocation: formValue.dropoffLocation,
      additionalServices,
      status: formValue.status,
      paymentStatus: formValue.paymentStatus,
      totalAmount: this.grandTotal(),
      paidAmount: formValue.paidAmount || 0,
      createdBy: '1' // This should come from auth service
    };

    // Optional fields
    if (formValue.notes) data.notes = formValue.notes;
    if (formValue.specialRequests) data.specialRequests = formValue.specialRequests;

    return data;
  }

  private markFormGroupTouched() {
    Object.keys(this.bookingForm.controls).forEach(key => {
      const control = this.bookingForm.get(key);
      control?.markAsTouched();
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.bookingForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.bookingForm.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) return `${fieldName} is required`;
      if (field.errors['email']) return 'Invalid email format';
      if (field.errors['minlength']) return `${fieldName} is too short`;
      if (field.errors['pattern']) return `${fieldName} format is invalid`;
    }
    return '';
  }

  onCancel() {
    this.router.navigate(['/car-rental/bookings']);
  }

  // Helper methods for templates
  getVehicleName(vehicleId: string): string {
    const vehicle = this.vehicles().find(v => v.id === vehicleId);
    return vehicle ? `${vehicle.make} ${vehicle.model} (${vehicle.year})` : '';
  }

  getCustomerName(customerId: string): string {
    const customer = this.customers().find(c => c.id === customerId);
    return customer ? `${customer.firstName} ${customer.lastName}` : '';
  }

  getServiceName(serviceId: string): string {
    const service = this.additionalServices().find(s => s.id === serviceId);
    return service ? service.name : '';
  }

  onServiceToggle(serviceId: string, event: any) {
    const currentServices = this.bookingForm.get('selectedServices')?.value || [];
    let updatedServices: string[];

    if (event.target.checked) {
      updatedServices = [...currentServices, serviceId];
    } else {
      updatedServices = currentServices.filter((id: string) => id !== serviceId);
    }

    this.bookingForm.patchValue({
      selectedServices: updatedServices
    });
  }
}
