import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import { TranslationService } from '../../../../core/services/translation.service';
import { CarRentalService } from '../../../../core/services/car-rental.service';


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



  constructor() {
    this.branchForm = this.fb.group({
      nameAr: ['', [Validators.required, Validators.minLength(2)]],
      nameEn: ['', [Validators.required, Validators.minLength(2)]],
      descriptionAr: [''],
      descriptionEn: [''],
      address: ['', [Validators.required]],
      city: ['', [Validators.required]],
      country: ['UAE', [Validators.required]],
      phone: ['', [Validators.required, Validators.pattern(/^\+?[1-9]\d{1,14}$/)]],
      email: ['', [Validators.required, Validators.email]],
      latitude: [25.2048, [Validators.required, Validators.min(-90), Validators.max(90)]],
      longitude: [55.2708, [Validators.required, Validators.min(-180), Validators.max(180)]],
      workingHours: ['', [Validators.required]],
      isActive: [true, [Validators.required]],
      assignedStaffIds: [[]],
      notes: ['']
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

  private populateForm(branch: any) {
    this.branchForm.patchValue({
      nameAr: branch.nameAr || '',
      nameEn: branch.nameEn || '',
      descriptionAr: branch.descriptionAr || '',
      descriptionEn: branch.descriptionEn || '',
      address: branch.address || '',
      city: branch.city || '',
      country: branch.country || '',
      phone: branch.phone || '',
      email: branch.email || '',
      latitude: branch.latitude || 25.2048,
      longitude: branch.longitude || 55.2708,
      workingHours: branch.workingHours || '',
      isActive: branch.isActive !== undefined ? branch.isActive : true,
      assignedStaffIds: branch.assignedStaffIds || [],
      notes: branch.notes || ''
    });
  }

  onSubmit() {
    if (this.branchForm.valid) {
      this.isSaving.set(true);
      this.errorMessage.set('');

      const formData = this.branchForm.value;

      // Process the form data to match API structure
      const processedData = {
        ...formData,
        // Ensure assignedStaffIds is an array
        assignedStaffIds: Array.isArray(formData.assignedStaffIds)
          ? formData.assignedStaffIds
          : formData.assignedStaffIds
            ? [formData.assignedStaffIds]
            : []
      };

      console.log('Form data to submit:', processedData);

      if (this.isEditMode()) {
        this.updateBranch(processedData);
      } else {
        this.createBranch(processedData);
      }
    } else {
      this.markFormGroupTouched();
    }
  }

  private createBranch(branchData: any) {
    // The form data is already in the correct API format
    console.log('Creating branch with data:', branchData);

    this.carRentalService.createBranchDirect(branchData).subscribe({
      next: () => {
        this.isSaving.set(false);
        this.router.navigate(['/car-rental/branches']);
      },
      error: (error: any) => {
        console.error('Error creating branch:', error);
        this.errorMessage.set('Error creating branch');
        this.isSaving.set(false);
      }
    });
  }

  private updateBranch(branchData: any) {
    const id = this.branchId();
    if (id) {
      // The form data is already in the correct API format
      console.log('Updating branch with data:', branchData);

      this.carRentalService.updateBranchDirect(id, branchData).subscribe({
        next: () => {
          this.isSaving.set(false);
          this.router.navigate(['/car-rental/branches']);
        },
        error: (error: any) => {
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
      latitude: event.lat,
      longitude: event.lng
    });
  }

  getCurrentLocation() {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          this.branchForm.patchValue({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
          });
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    }
  }
}
