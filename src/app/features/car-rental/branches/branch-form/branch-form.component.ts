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
      isActive: [true, [Validators.required]]
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
    console.log('🏢 Populating form with branch data:', branch);
    console.log('🏢 Branch data type:', typeof branch);
    console.log('🏢 Branch keys:', Object.keys(branch || {}));
    
    // Enhanced debugging for description fields specifically
    console.log('🏢 Description field analysis:', {
      'branch.descriptionAr': branch.descriptionAr,
      'branch.descriptionEn': branch.descriptionEn,
      'branch.description': branch.description,
      'descriptionAr exists': 'descriptionAr' in branch,
      'descriptionEn exists': 'descriptionEn' in branch,
      'description exists': 'description' in branch,
      'descriptionAr type': typeof branch.descriptionAr,
      'descriptionEn type': typeof branch.descriptionEn,
      'descriptionAr value': JSON.stringify(branch.descriptionAr),
      'descriptionEn value': JSON.stringify(branch.descriptionEn)
    });
    
    this.branchForm.patchValue({
      // API returns 'name' field - use it for both nameAr and nameEn since API doesn't have separate fields
      nameAr: branch.nameAr || branch.name || '',
      nameEn: branch.nameEn || branch.name || '',
      
      // Enhanced description mapping with explicit handling
      descriptionAr: branch.descriptionAr !== undefined && branch.descriptionAr !== null ? branch.descriptionAr : 
                    (branch.description !== undefined && branch.description !== null ? branch.description : ''),
      descriptionEn: branch.descriptionEn !== undefined && branch.descriptionEn !== null ? branch.descriptionEn : 
                    (branch.description !== undefined && branch.description !== null ? branch.description : ''),
      
      // Direct field mappings from API response
      address: branch.address || '',
      city: branch.city || '',
      country: branch.country || '',
      phone: branch.phone || '',
      email: branch.email || '',
      latitude: branch.latitude || 25.2048,
      longitude: branch.longitude || 55.2708,
      isActive: branch.isActive !== undefined ? branch.isActive : true
    });

    console.log('🏢 Form populated with values:', this.branchForm.value);
    console.log('🏢 After population - Form control values:', {
      'Form nameAr': this.branchForm.get('nameAr')?.value,
      'Form nameEn': this.branchForm.get('nameEn')?.value,
      'Form descriptionAr': this.branchForm.get('descriptionAr')?.value,
      'Form descriptionEn': this.branchForm.get('descriptionEn')?.value,
      'Form descriptionAr control': this.branchForm.get('descriptionAr'),
      'Form descriptionEn control': this.branchForm.get('descriptionEn')
    });
    
    // Force update description fields if they're still empty
    if (!this.branchForm.get('descriptionAr')?.value && branch.descriptionAr) {
      console.log('🔧 Force setting descriptionAr:', branch.descriptionAr);
      this.branchForm.get('descriptionAr')?.setValue(branch.descriptionAr);
    }
    if (!this.branchForm.get('descriptionEn')?.value && branch.descriptionEn) {
      console.log('🔧 Force setting descriptionEn:', branch.descriptionEn);
      this.branchForm.get('descriptionEn')?.setValue(branch.descriptionEn);
    }
    
    console.log('🏢 Final form values after force update:', {
      'descriptionAr': this.branchForm.get('descriptionAr')?.value,
      'descriptionEn': this.branchForm.get('descriptionEn')?.value
    });
  }

  onSubmit() {
    if (this.branchForm.valid) {
      this.isSaving.set(true);
      this.errorMessage.set('');

      const formData = this.branchForm.value;

      // Process the form data to match API structure
      const processedData = {
        ...formData
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
