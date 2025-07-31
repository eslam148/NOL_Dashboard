import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import { TranslationService } from '../../../../core/services/translation.service';
import { CarRentalService } from '../../../../core/services/car-rental.service';
import { Vehicle, VehicleCategory, VehicleStatus, Branch } from '../../../../core/models/car-rental.models';

@Component({
  selector: 'app-vehicle-form',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, TranslatePipe],
  templateUrl: './vehicle-form.component.html',
  styleUrls: ['./vehicle-form.component.css']
})
export class VehicleFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private carRentalService = inject(CarRentalService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private translationService = inject(TranslationService);

  vehicleForm!: FormGroup;
  branches = signal<Branch[]>([]);
  isLoading = signal(false);
  isSubmitting = signal(false);
  isEditMode = signal(false);
  vehicleId = signal<string | null>(null);

  // Vehicle categories and options
  categories: { value: VehicleCategory; label: string }[] = [
    { value: 'economy', label: 'vehicles.economy' },
    { value: 'compact', label: 'vehicles.compact' },
    { value: 'midsize', label: 'vehicles.midsize' },
    { value: 'fullsize', label: 'vehicles.fullsize' },
    { value: 'luxury', label: 'vehicles.luxury' },
    { value: 'suv', label: 'vehicles.suv' },
    { value: 'van', label: 'vehicles.van' },
    { value: 'truck', label: 'vehicles.truck' }
  ];

  fuelTypes = [
    { value: 'gasoline', label: 'vehicles.gasoline' },
    { value: 'diesel', label: 'vehicles.diesel' },
    { value: 'hybrid', label: 'vehicles.hybrid' },
    { value: 'electric', label: 'vehicles.electric' }
  ];

  transmissionTypes = [
    { value: 'manual', label: 'vehicles.manual' },
    { value: 'automatic', label: 'vehicles.automatic' },
    { value: 'cvt', label: 'vehicles.cvt' }
  ];

  ngOnInit() {
    this.initializeForm();
    this.loadBranches();
    this.checkEditMode();
  }

  private initializeForm() {
    this.vehicleForm = this.fb.group({
      // Basic Information
      make: ['', [Validators.required, Validators.minLength(2)]],
      model: ['', [Validators.required, Validators.minLength(2)]],
      year: ['', [Validators.required, Validators.min(2000), Validators.max(new Date().getFullYear() + 1)]],
      category: ['', Validators.required],

      // Identification
      vin: ['', [Validators.required, Validators.minLength(17), Validators.maxLength(17)]],
      licensePlate: ['', Validators.required],

      // Specifications
      fuelType: ['', Validators.required],
      transmission: ['', Validators.required],
      seats: ['', [Validators.required, Validators.min(2), Validators.max(9)]],
      doors: ['', [Validators.required, Validators.min(2), Validators.max(5)]],

      // Condition & Status
      mileage: ['', [Validators.required, Validators.min(0)]],
      color: ['', Validators.required],
      status: ['available', Validators.required],

      // Pricing
      dailyRate: ['', [Validators.required, Validators.min(1)]],
      weeklyRate: [''],
      monthlyRate: [''],

      // Location
      branchId: ['', Validators.required],

      // Additional Information
      features: [''],
      notes: [''],

      // Insurance & Registration
      insuranceExpiry: ['', Validators.required],
      registrationExpiry: ['', Validators.required]
    });
  }

  private loadBranches() {
    this.carRentalService.getBranches().subscribe({
      next: (branches) => {
        this.branches.set(branches.filter(b => b.status === 'active'));
      },
      error: (error) => {
        console.error('Error loading branches:', error);
      }
    });
  }

  private checkEditMode() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode.set(true);
      this.vehicleId.set(id);
      this.loadVehicle(id);
    }
  }

  private loadVehicle(id: string) {
    this.isLoading.set(true);
    this.carRentalService.getVehicleById(id).subscribe({
      next: (vehicle) => {
        if (vehicle) {
          this.populateForm(vehicle);
        }
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading vehicle:', error);
        this.isLoading.set(false);
      }
    });
  }

  private populateForm(vehicle: Vehicle) {
    this.vehicleForm.patchValue({
      make: vehicle.make,
      model: vehicle.model,
      year: vehicle.year,
      category: vehicle.category,
      vin: vehicle.vin,
      licensePlate: vehicle.licensePlate,
      fuelType: vehicle.fuelType,
      transmission: vehicle.transmission,
      seats: vehicle.seats,
      doors: vehicle.doors,
      mileage: vehicle.mileage,
      color: vehicle.color,
      status: vehicle.status,
      dailyRate: vehicle.dailyRate,
      weeklyRate: vehicle.weeklyRate || '',
      monthlyRate: vehicle.monthlyRate || '',
      branchId: vehicle.branchId,
      features: vehicle.features?.join(', ') || '',
      notes: vehicle.notes || '',
      insuranceExpiry: vehicle.insuranceExpiry ? this.formatDateForInput(vehicle.insuranceExpiry) : '',
      registrationExpiry: vehicle.registrationExpiry ? this.formatDateForInput(vehicle.registrationExpiry) : ''
    });
  }

  private formatDateForInput(date: Date): string {
    return date.toISOString().split('T')[0];
  }

  onSubmit() {
    if (this.vehicleForm.valid) {
      this.isSubmitting.set(true);
      const formData = this.prepareFormData();

      const operation = this.isEditMode()
        ? this.carRentalService.updateVehicle(this.vehicleId()!, formData)
        : this.carRentalService.createVehicle(formData);

      operation.subscribe({
        next: (vehicle) => {
          this.isSubmitting.set(false);
          this.router.navigate(['/car-rental/vehicles']);
        },
        error: (error) => {
          console.error('Error saving vehicle:', error);
          this.isSubmitting.set(false);
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  private prepareFormData(): Omit<Vehicle, 'id' | 'createdAt' | 'updatedAt'> {
    const formValue = this.vehicleForm.value;
    return {
      make: formValue.make,
      model: formValue.model,
      year: parseInt(formValue.year),
      category: formValue.category,
      vin: formValue.vin,
      licensePlate: formValue.licensePlate,
      fuelType: formValue.fuelType,
      transmission: formValue.transmission,
      seats: parseInt(formValue.seats),
      doors: parseInt(formValue.doors),
      mileage: parseInt(formValue.mileage),
      color: formValue.color,
      status: formValue.status,
      dailyRate: parseFloat(formValue.dailyRate),
      ...(formValue.weeklyRate && { weeklyRate: parseFloat(formValue.weeklyRate) }),
      ...(formValue.monthlyRate && { monthlyRate: parseFloat(formValue.monthlyRate) }),
      branchId: formValue.branchId,
      ...(formValue.features && { features: formValue.features.split(',').map((f: string) => f.trim()).filter((f: string) => f) }),
      ...(formValue.notes && { notes: formValue.notes }),
      ...(formValue.insuranceExpiry && { insuranceExpiry: new Date(formValue.insuranceExpiry) }),
      ...(formValue.registrationExpiry && { registrationExpiry: new Date(formValue.registrationExpiry) }),
      images: [],
      maintenanceHistory: []
    };
  }

  private markFormGroupTouched() {
    Object.keys(this.vehicleForm.controls).forEach(key => {
      const control = this.vehicleForm.get(key);
      control?.markAsTouched();
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.vehicleForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.vehicleForm.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) return this.translationService.translate('common.formValidation.required');
      if (field.errors['minlength']) return this.translationService.translate('common.formValidation.minLength');
      if (field.errors['maxlength']) return this.translationService.translate('common.formValidation.maxLength');
      if (field.errors['min']) return this.translationService.translate('common.formValidation.min');
      if (field.errors['max']) return this.translationService.translate('common.formValidation.max');
      if (field.errors['email']) return this.translationService.translate('common.formValidation.email');
      if (field.errors['pattern']) return this.translationService.translate('common.formValidation.pattern');
    }
    return '';
  }

  onCancel() {
    this.router.navigate(['/car-rental/vehicles']);
  }
}
