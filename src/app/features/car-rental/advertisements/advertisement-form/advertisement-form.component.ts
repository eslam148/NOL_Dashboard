import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import { TranslationService } from '../../../../core/services/translation.service';
import { CarRentalService } from '../../../../core/services/car-rental.service';
import { Advertisement, AdvertisementType, AdvertisementStatus, Branch } from '../../../../core/models/car-rental.models';
import { ImageUploadComponent, UploadedImage, ImageUploadConfig } from '../../../../shared/components/image-upload';
import { FileUploadService } from '../../../../core/services/file-upload.service';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-advertisement-form',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, TranslatePipe, ImageUploadComponent],
  templateUrl: './advertisement-form.component.html',
  styleUrls: ['./advertisement-form.component.css']
})
export class AdvertisementFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private carRentalService = inject(CarRentalService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private translationService = inject(TranslationService);
  private fileUploadService = inject(FileUploadService);
  private cdr = inject(ChangeDetectorRef);

  advertisementForm!: FormGroup;
  branches = signal<Branch[]>([]);
  isLoading = signal(false);
  isSubmitting = signal(false);
  isEditMode = signal(false);
  advertisementId = signal<string | null>(null);

  // Image upload properties
  uploadedImages = signal<UploadedImage[]>([]);
  isUploadingImage = signal(false);
  uploadError = signal<string | null>(null);
  
  imageUploadConfig: ImageUploadConfig = {
    maxFiles: 1,
    allowedTypes: ['image/jpeg', 'image/png', 'image/webp'],
    maxFileSize: 5 * 1024 * 1024, // 5MB
    showPreview: true,
    showRemoveButton: true
  };

  // Advertisement types and options
  // Use server enums for type to match API exactly
  advertisementTypes = [
    { value: 'Special', label: 'advertisements.special' },
    { value: 'Discount', label: 'advertisements.discount' },
    { value: 'Seasonal', label: 'advertisements.seasonal' },
    { value: 'Flash', label: 'advertisements.flash' },
    { value: 'Weekend', label: 'advertisements.weekend' },
    { value: 'Holiday', label: 'advertisements.holiday' },
    { value: 'NewArrival', label: 'advertisements.newArrival' },
    { value: 'Popular', label: 'advertisements.popular' }
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
      type: ['Discount', Validators.required],
      status: ['draft', Validators.required],
      
      // Campaign Duration
      startDate: [this.formatDateForInput(new Date()), Validators.required],
      endDate: [this.formatDateForInput(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)), Validators.required],
      
      // Media
      imageUrl: ['', Validators.required],
      targetUrl: [''],
      
      // Budget & Priority
      budget: [''],
      priority: [1, [Validators.required, Validators.min(1), Validators.max(10)]],
      // Pricing & Flags to match API
      price: [0, [Validators.min(0), Validators.max(10000)]],
      discountPercentage: [null, [Validators.min(0), Validators.max(100)]],
      discountPrice: [null, [Validators.min(0), Validators.max(10000)]],
      isFeatured: [false],
      isActive: [true],
      carId: [null],
      categoryId: [null],
      notes: ['', [Validators.maxLength(500)]],
      
      // Target Audience
      ageMin: [18, [Validators.min(18), Validators.max(100)]],
      ageMax: [65, [Validators.min(18), Validators.max(100)]],
      gender: ['all'],
      locations: [''],
      interests: [''],
      
      // Branch Selection (multi-select)
      branchIds: [[]]
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

    // Initialize uploaded images if imageUrl exists
    this.initializeUploadedImages(advertisement.imageUrl);
  }

  private initializeUploadedImages(imageUrl: string) {
    if (imageUrl) {
      const fileName = this.fileUploadService.getFileNameFromUrl(imageUrl);
      const uploadedImage: UploadedImage = {
        id: 'existing',
        url: imageUrl,
        name: fileName || 'Existing Image',
        size: 0,
        preview: imageUrl,
        type: 'image/jpeg'
      };
      this.uploadedImages.set([uploadedImage]);
      this.cdr.detectChanges();
    }
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
    
    // branchIds may be an array (from multi-select) or a comma-separated string; normalize to string[]
    let branchIds: string[] = [];
    if (Array.isArray(formValue.branchIds)) {
      branchIds = formValue.branchIds.map((b: any) => String(b)).filter((b: string) => b);
    } else if (typeof formValue.branchIds === 'string') {
      branchIds = formValue.branchIds.split(',').map((b: string) => b.trim()).filter((b: string) => b);
    }

    return {
      title: formValue.title,
      description: formValue.description,
      type: formValue.type,
      status: formValue.isActive ? 'active' : 'paused',
      startDate: new Date(formValue.startDate),
      endDate: new Date(formValue.endDate),
      imageUrl: formValue.imageUrl,
      targetUrl: formValue.targetUrl || undefined,
      budget: formValue.price ?? (formValue.budget ? parseFloat(formValue.budget) : undefined),
      priority: parseInt(formValue.priority),
      targetAudience: {
        ageRange: {
          min: parseInt(formValue.ageMin),
          max: parseInt(formValue.ageMax)
        },
        gender: formValue.gender,
        location: locations.length > 0 ? locations : undefined,
        interests: [
          ...(interests.length > 0 ? interests : []),
          ...(formValue.isFeatured ? ['featured'] : [])
        ]
      },
      branchIds: branchIds.length > 0 ? branchIds : undefined,
      // Extra metadata (unused in mapping but kept for future)
      discountPercentage: formValue.discountPercentage ?? undefined,
      discountPrice: formValue.discountPrice ?? undefined,
      carId: formValue.carId ?? undefined,
      categoryId: formValue.categoryId ?? undefined,
      notes: formValue.notes || undefined,
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
      if (field.errors['required']) return this.translationService.translate('common.formValidation.required');
      if (field.errors['minlength']) return this.translationService.translate('common.formValidation.minLength');
      if (field.errors['min']) return this.translationService.translate('common.formValidation.min');
      if (field.errors['max']) return this.translationService.translate('common.formValidation.max');
      if (field.errors['email']) return this.translationService.translate('common.formValidation.email');
      if (field.errors['pattern']) return this.translationService.translate('common.formValidation.pattern');
    }
    return '';
  }

  onCancel() {
    this.router.navigate(['/car-rental/advertisements']);
  }

  // Image upload event handlers
  onImageFilesSelected(images: UploadedImage[]) {
    if (images.length > 0 && images[0].file) {
      this.isUploadingImage.set(true);
      this.uploadError.set(null);
      
      this.fileUploadService.uploadFile(images[0].file, 'advertisements').subscribe({
        next: (result) => {
          if (result && result.fileUrl) {
            // Update form control with the uploaded image URL
            this.advertisementForm.patchValue({ imageUrl: result.fileUrl });
            this.uploadedImages.set([{
              id: result.fileName,
              url: result.fileUrl,
              name: result.originalFileName,
              size: result.fileSize,
              file: images[0].file,
              preview: result.fileUrl,
              type: images[0].file?.type || 'image/jpeg'
            }]);
            this.isUploadingImage.set(false);
            this.cdr.detectChanges();
          }
        },
        error: (error) => {
          console.error('Image upload error:', error);
          this.uploadError.set('Failed to upload image. Please try again.');
          this.isUploadingImage.set(false);
          this.cdr.detectChanges();
        }
      });
    }
  }

  onImageFileRemoved() {
    this.advertisementForm.patchValue({ imageUrl: '' });
    this.uploadedImages.set([]);
    this.uploadError.set(null);
    this.cdr.detectChanges();
  }

  onImageUploadError(error: string) {
    this.uploadError.set(error);
    this.isUploadingImage.set(false);
    this.cdr.detectChanges();
  }
}
