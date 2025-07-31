import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import { TranslationService } from '../../../../core/services/translation.service';
import { CarRentalService } from '../../../../core/services/car-rental.service';
import { Branch } from '../../../../core/models/car-rental.models';

@Component({
  selector: 'app-branch-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe],
  templateUrl: './branch-form.component.html',
  styleUrls: ['./branch-form.component.css']
})
export class BranchFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private carRentalService = inject(CarRentalService);
  private translationService = inject(TranslationService);

  branchForm: FormGroup;
  isEditMode = signal(false);
  isLoading = signal(false);
  isSaving = signal(false);
  branchId = signal<string | null>(null);
  errorMessage = signal<string>('');

  // Operating hours for each day
  daysOfWeek = [
    { key: 'monday', label: 'branches.monday' },
    { key: 'tuesday', label: 'branches.tuesday' },
    { key: 'wednesday', label: 'branches.wednesday' },
    { key: 'thursday', label: 'branches.thursday' },
    { key: 'friday', label: 'branches.friday' },
    { key: 'saturday', label: 'branches.saturday' },
    { key: 'sunday', label: 'branches.sunday' }
  ];

  constructor() {
    this.branchForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      address: ['', [Validators.required]],
      city: ['', [Validators.required]],
      country: ['', [Validators.required]],
      phone: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      manager: ['', [Validators.required]],
      status: ['active', [Validators.required]],
      coordinates: this.fb.group({
        lat: [25.2048, [Validators.required, Validators.min(-90), Validators.max(90)]],
        lng: [55.2708, [Validators.required, Validators.min(-180), Validators.max(180)]]
      }),
      operatingHours: this.fb.group({
        monday: this.createDayGroup(),
        tuesday: this.createDayGroup(),
        wednesday: this.createDayGroup(),
        thursday: this.createDayGroup(),
        friday: this.createDayGroup(),
        saturday: this.createDayGroup(),
        sunday: this.createDayGroup()
      })
    });
  }

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id && id !== 'new') {
      this.isEditMode.set(true);
      this.branchId.set(id);
      this.loadBranch(id);
    }
  }

  private createDayGroup() {
    return this.fb.group({
      isOpen: [true],
      open: ['08:00', [Validators.required]],
      close: ['20:00', [Validators.required]]
    });
  }

  private loadBranch(id: string) {
    this.isLoading.set(true);
    this.carRentalService.getBranchById(id).subscribe({
      next: (branch) => {
        if (branch) {
          this.populateForm(branch);
        } else {
          this.errorMessage.set('Branch not found');
        }
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading branch:', error);
        this.errorMessage.set('Error loading branch');
        this.isLoading.set(false);
      }
    });
  }

  private populateForm(branch: Branch) {
    this.branchForm.patchValue({
      name: branch.name,
      address: branch.address,
      city: branch.city,
      country: branch.country,
      phone: branch.phone,
      email: branch.email,
      manager: branch.manager,
      status: branch.status,
      coordinates: {
        lat: branch.coordinates.lat,
        lng: branch.coordinates.lng
      }
    });

    // Populate operating hours
    Object.keys(branch.operatingHours).forEach(day => {
      const dayData = branch.operatingHours[day];
      this.branchForm.get(`operatingHours.${day}`)?.patchValue({
        isOpen: dayData.isOpen,
        open: dayData.open,
        close: dayData.close
      });
    });
  }

  onSubmit() {
    if (this.branchForm.valid) {
      this.isSaving.set(true);
      this.errorMessage.set('');

      const formData = this.branchForm.value;
      
      if (this.isEditMode()) {
        this.updateBranch(formData);
      } else {
        this.createBranch(formData);
      }
    } else {
      this.markFormGroupTouched();
    }
  }

  private createBranch(branchData: any) {
    this.carRentalService.createBranch(branchData).subscribe({
      next: (branch) => {
        this.isSaving.set(false);
        this.router.navigate(['/car-rental/branches']);
      },
      error: (error) => {
        console.error('Error creating branch:', error);
        this.errorMessage.set('Error creating branch');
        this.isSaving.set(false);
      }
    });
  }

  private updateBranch(branchData: any) {
    const id = this.branchId();
    if (id) {
      this.carRentalService.updateBranch(id, branchData).subscribe({
        next: (branch) => {
          this.isSaving.set(false);
          this.router.navigate(['/car-rental/branches']);
        },
        error: (error) => {
          console.error('Error updating branch:', error);
          this.errorMessage.set('Error updating branch');
          this.isSaving.set(false);
        }
      });
    }
  }

  private markFormGroupTouched() {
    Object.keys(this.branchForm.controls).forEach(key => {
      const control = this.branchForm.get(key);
      control?.markAsTouched();
      
      if (control instanceof FormGroup) {
        Object.keys(control.controls).forEach(nestedKey => {
          control.get(nestedKey)?.markAsTouched();
        });
      }
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.branchForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.branchForm.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) return this.translationService.translate('common.formValidation.required');
      if (field.errors['email']) return this.translationService.translate('common.formValidation.email');
      if (field.errors['minlength']) return this.translationService.translate('common.formValidation.minLength');
      if (field.errors['min']) return this.translationService.translate('common.formValidation.min');
      if (field.errors['max']) return this.translationService.translate('common.formValidation.max');
      if (field.errors['pattern']) return this.translationService.translate('common.formValidation.pattern');
    }
    return '';
  }

  onCancel() {
    this.router.navigate(['/car-rental/branches']);
  }

  // Map integration methods (placeholder for future implementation)
  onMapClick(event: any) {
    // Update coordinates when user clicks on map
    this.branchForm.patchValue({
      coordinates: {
        lat: event.lat,
        lng: event.lng
      }
    });
  }

  getCurrentLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.branchForm.patchValue({
            coordinates: {
              lat: position.coords.latitude,
              lng: position.coords.longitude
            }
          });
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  }
}
