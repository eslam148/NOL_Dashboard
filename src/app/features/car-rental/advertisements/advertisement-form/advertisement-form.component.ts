import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import { CarRentalService } from '../../../../core/services/car-rental.service';
import { Advertisement, AdvertisementType, AdvertisementStatus, Branch } from '../../../../core/models/car-rental.models';

@Component({
  selector: 'app-advertisement-form',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, TranslatePipe],
  templateUrl: './advertisement-form.component.html',
  styleUrls: ['./advertisement-form.component.css']
})
export class AdvertisementFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private carRentalService = inject(CarRentalService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  advertisementForm!: FormGroup;
  branches = signal<Branch[]>([]);
  isLoading = signal(false);
  isSubmitting = signal(false);
  isEditMode = signal(false);
  advertisementId = signal<string | null>(null);

  // Advertisement types and options
  advertisementTypes: { value: AdvertisementType; label: string }[] = [
    { value: 'banner', label: 'advertisements.banner' },
    { value: 'popup', label: 'advertisements.popup' },
    { value: 'sidebar', label: 'advertisements.sidebar' },
    { value: 'featured', label: 'advertisements.featured' },
    { value: 'promotion', label: 'advertisements.promotion' }
  ];

  genderOptions = [
    { value: 'all', label: 'advertisements.all' },
    { value: 'male', label: 'advertisements.male' },
    { value: 'female', label: 'advertisements.female' }
  ];

  ngOnInit() {
    this.initializeForm();
    this.loadBranches();
    this.checkEditMode();
  }

  private initializeForm() {
    this.advertisementForm = this.fb.group({
      // Basic Information
      title: ['', [Validators.required, Validators.minLength(3)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      type: ['', Validators.required],
      status: ['draft', Validators.required],
      
      // Campaign Duration
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      
      // Media
      imageUrl: ['', Validators.required],
      targetUrl: [''],
      
      // Budget & Priority
      budget: [''],
      priority: [1, [Validators.required, Validators.min(1), Validators.max(10)]],
      
      // Target Audience
      ageMin: [18, [Validators.min(18), Validators.max(100)]],
      ageMax: [65, [Validators.min(18), Validators.max(100)]],
      gender: ['all'],
      locations: [''],
      interests: [''],
      
      // Branch Selection
      branchIds: ['']
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
      this.advertisementId.set(id);
      this.loadAdvertisement(id);
    }
  }

  private loadAdvertisement(id: string) {
    this.isLoading.set(true);
    this.carRentalService.getAdvertisementById(id).subscribe({
      next: (advertisement) => {
        if (advertisement) {
          this.populateForm(advertisement);
        }
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading advertisement:', error);
        this.isLoading.set(false);
      }
    });
  }

  private populateForm(advertisement: Advertisement) {
    this.advertisementForm.patchValue({
      title: advertisement.title,
      description: advertisement.description,
      type: advertisement.type,
      status: advertisement.status,
      startDate: this.formatDateForInput(advertisement.startDate),
      endDate: this.formatDateForInput(advertisement.endDate),
      imageUrl: advertisement.imageUrl,
      targetUrl: advertisement.targetUrl || '',
      budget: advertisement.budget || '',
      priority: advertisement.priority,
      ageMin: advertisement.targetAudience?.ageRange?.min || 18,
      ageMax: advertisement.targetAudience?.ageRange?.max || 65,
      gender: advertisement.targetAudience?.gender || 'all',
      locations: advertisement.targetAudience?.location?.join(', ') || '',
      interests: advertisement.targetAudience?.interests?.join(', ') || '',
      branchIds: advertisement.branchIds?.join(',') || ''
    });
  }

  private formatDateForInput(date: Date): string {
    return new Date(date).toISOString().split('T')[0];
  }

  onSubmit() {
    if (this.advertisementForm.valid) {
      this.isSubmitting.set(true);
      const formData = this.prepareFormData();
      
      const operation = this.isEditMode() 
        ? this.carRentalService.updateAdvertisement(this.advertisementId()!, formData)
        : this.carRentalService.createAdvertisement(formData);

      operation.subscribe({
        next: (advertisement) => {
          this.isSubmitting.set(false);
          this.router.navigate(['/car-rental/advertisements']);
        },
        error: (error) => {
          console.error('Error saving advertisement:', error);
          this.isSubmitting.set(false);
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  private prepareFormData(): any {
    const formValue = this.advertisementForm.value;
    
    const locations = formValue.locations ? 
      formValue.locations.split(',').map((l: string) => l.trim()).filter((l: string) => l) : [];
    
    const interests = formValue.interests ? 
      formValue.interests.split(',').map((i: string) => i.trim()).filter((i: string) => i) : [];
    
    const branchIds = formValue.branchIds ? 
      formValue.branchIds.split(',').map((b: string) => b.trim()).filter((b: string) => b) : [];

    return {
      title: formValue.title,
      description: formValue.description,
      type: formValue.type,
      status: formValue.status,
      startDate: new Date(formValue.startDate),
      endDate: new Date(formValue.endDate),
      imageUrl: formValue.imageUrl,
      targetUrl: formValue.targetUrl || undefined,
      budget: formValue.budget ? parseFloat(formValue.budget) : undefined,
      priority: parseInt(formValue.priority),
      targetAudience: {
        ageRange: {
          min: parseInt(formValue.ageMin),
          max: parseInt(formValue.ageMax)
        },
        gender: formValue.gender,
        location: locations.length > 0 ? locations : undefined,
        interests: interests.length > 0 ? interests : undefined
      },
      branchIds: branchIds.length > 0 ? branchIds : undefined,
      createdBy: '1' // This should come from auth service
    };
  }

  private markFormGroupTouched() {
    Object.keys(this.advertisementForm.controls).forEach(key => {
      const control = this.advertisementForm.get(key);
      control?.markAsTouched();
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.advertisementForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.advertisementForm.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) return `${fieldName} is required`;
      if (field.errors['minlength']) return `${fieldName} is too short`;
      if (field.errors['min']) return `${fieldName} value is too low`;
      if (field.errors['max']) return `${fieldName} value is too high`;
    }
    return '';
  }

  onCancel() {
    this.router.navigate(['/car-rental/advertisements']);
  }
}
