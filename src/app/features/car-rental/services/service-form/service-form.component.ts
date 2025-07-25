import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import { CarRentalService } from '../../../../core/services/car-rental.service';
import { AdditionalService, ServiceCategory, Branch } from '../../../../core/models/car-rental.models';

@Component({
  selector: 'app-service-form',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, TranslatePipe],
  templateUrl: './service-form.component.html',
  styleUrls: ['./service-form.component.css']
})
export class ServiceFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private carRentalService = inject(CarRentalService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  serviceForm!: FormGroup;
  branches = signal<Branch[]>([]);
  isLoading = signal(false);
  isSubmitting = signal(false);
  isEditMode = signal(false);
  serviceId = signal<string | null>(null);

  // Service categories and options
  serviceCategories: { value: ServiceCategory; label: string; icon: string }[] = [
    { value: 'navigation', label: 'services.navigation', icon: 'bi-compass' },
    { value: 'safety', label: 'services.safety', icon: 'bi-shield-check' },
    { value: 'comfort', label: 'services.comfort', icon: 'bi-heart' },
    { value: 'insurance', label: 'services.insurance', icon: 'bi-umbrella' },
    { value: 'equipment', label: 'services.equipment', icon: 'bi-tools' }
  ];

  popularIcons = [
    'bi-geo-alt', 'bi-shield-check', 'bi-heart', 'bi-umbrella', 'bi-tools',
    'bi-car-front', 'bi-phone', 'bi-wifi', 'bi-battery-charging', 'bi-camera',
    'bi-music-note', 'bi-sun', 'bi-snow', 'bi-fuel-pump', 'bi-wrench'
  ];

  ngOnInit() {
    this.initializeForm();
    this.loadBranches();
    this.checkEditMode();
  }

  private initializeForm() {
    this.serviceForm = this.fb.group({
      // Basic Information
      name: ['', [Validators.required, Validators.minLength(2)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      category: ['', Validators.required],
      icon: ['bi-plus-circle', Validators.required],
      image: [''],

      // Pricing
      dailyRate: ['', [Validators.required, Validators.min(0)]],
      weeklyRate: ['', [Validators.required, Validators.min(0)]],
      monthlyRate: ['', [Validators.required, Validators.min(0)]],
      discountPercentage: ['', [Validators.min(0), Validators.max(100)]],

      // Availability
      isAvailable: [true],
      maxQuantity: ['', [Validators.required, Validators.min(1)]],
      minimumRentalDays: ['1', [Validators.min(1)]],

      // Features and Details
      features: [''],
      restrictions: [''],
      tags: [''],
      notes: [''],

      // Branch Availability
      availableAtBranches: ['']
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
      this.serviceId.set(id);
      this.loadService(id);
    }
  }

  private loadService(id: string) {
    this.isLoading.set(true);
    this.carRentalService.getServiceById(id).subscribe({
      next: (service) => {
        if (service) {
          this.populateForm(service);
        }
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading service:', error);
        this.isLoading.set(false);
      }
    });
  }

  private populateForm(service: AdditionalService) {
    this.serviceForm.patchValue({
      name: service.name,
      description: service.description,
      category: service.category,
      icon: service.icon,
      image: service.image || '',
      dailyRate: service.dailyRate,
      weeklyRate: service.weeklyRate,
      monthlyRate: service.monthlyRate,
      discountPercentage: service.discountPercentage || '',
      isAvailable: service.isAvailable,
      maxQuantity: service.maxQuantity,
      minimumRentalDays: service.minimumRentalDays || 1,
      features: service.features?.join(', ') || '',
      restrictions: service.restrictions?.join(', ') || '',
      tags: service.tags?.join(', ') || '',
      notes: service.notes || '',
      availableAtBranches: service.availableAtBranches?.join(',') || ''
    });
  }

  onSubmit() {
    if (this.serviceForm.valid) {
      this.isSubmitting.set(true);
      const formData = this.prepareFormData();

      const operation = this.isEditMode()
        ? this.carRentalService.updateService(this.serviceId()!, formData)
        : this.carRentalService.createService(formData);

      operation.subscribe({
        next: (service) => {
          this.isSubmitting.set(false);
          this.router.navigate(['/car-rental/services']);
        },
        error: (error) => {
          console.error('Error saving service:', error);
          this.isSubmitting.set(false);
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  private prepareFormData(): any {
    const formValue = this.serviceForm.value;

    const features = formValue.features ?
      formValue.features.split(',').map((f: string) => f.trim()).filter((f: string) => f) : [];

    const restrictions = formValue.restrictions ?
      formValue.restrictions.split(',').map((r: string) => r.trim()).filter((r: string) => r) : [];

    const tags = formValue.tags ?
      formValue.tags.split(',').map((t: string) => t.trim()).filter((t: string) => t) : [];

    const availableAtBranches = formValue.availableAtBranches ?
      formValue.availableAtBranches.split(',').map((b: string) => b.trim()).filter((b: string) => b) : [];

    const data: any = {
      name: formValue.name,
      description: formValue.description,
      category: formValue.category,
      icon: formValue.icon,
      dailyRate: parseFloat(formValue.dailyRate),
      weeklyRate: parseFloat(formValue.weeklyRate),
      monthlyRate: parseFloat(formValue.monthlyRate),
      isAvailable: formValue.isAvailable,
      maxQuantity: parseInt(formValue.maxQuantity),
      minimumRentalDays: parseInt(formValue.minimumRentalDays),
      createdBy: '1' // This should come from auth service
    };

    // Optional fields
    if (formValue.image) data.image = formValue.image;
    if (formValue.discountPercentage) data.discountPercentage = parseFloat(formValue.discountPercentage);
    if (features.length > 0) data.features = features;
    if (restrictions.length > 0) data.restrictions = restrictions;
    if (tags.length > 0) data.tags = tags;
    if (formValue.notes) data.notes = formValue.notes;
    if (availableAtBranches.length > 0) data.availableAtBranches = availableAtBranches;

    return data;
  }

  private markFormGroupTouched() {
    Object.keys(this.serviceForm.controls).forEach(key => {
      const control = this.serviceForm.get(key);
      control?.markAsTouched();
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.serviceForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.serviceForm.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) return `${fieldName} is required`;
      if (field.errors['minlength']) return `${fieldName} is too short`;
      if (field.errors['min']) return `${fieldName} value is too low`;
      if (field.errors['max']) return `${fieldName} value is too high`;
    }
    return '';
  }

  // Calculate weekly and monthly rates based on daily rate
  onDailyRateChange() {
    const dailyRate = this.serviceForm.get('dailyRate')?.value;
    if (dailyRate && !isNaN(dailyRate)) {
      const daily = parseFloat(dailyRate);
      const weeklyRate = (daily * 7 * 0.85).toFixed(2); // 15% discount for weekly
      const monthlyRate = (daily * 30 * 0.75).toFixed(2); // 25% discount for monthly

      this.serviceForm.patchValue({
        weeklyRate: weeklyRate,
        monthlyRate: monthlyRate
      });
    }
  }

  onCancel() {
    this.router.navigate(['/car-rental/services']);
  }
}
