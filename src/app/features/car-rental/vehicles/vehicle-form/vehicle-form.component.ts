import { Component, OnInit, inject, signal, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { ReactiveFormsModule, FormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import { TranslationService } from '../../../../core/services/translation.service';
import { CarRentalService } from '../../../../core/services/car-rental.service';
import { CarApiService } from '../../../../core/services/car-api.service';
import { FileUploadService } from '../../../../core/services/file-upload.service';
import { Vehicle, VehicleCategory, VehicleStatus, Branch } from '../../../../core/models/car-rental.models';
import { 
  AdminCreateCarDto, 
  AdminCarDto,
  FuelType, 
  TransmissionType, 
  CarStatus, 
  CAR_VALIDATION, 
  DEFAULT_CAR_VALUES,
  FileUploadResultDto
} from '../../../../core/models/api.models';
import { ImageUploadComponent, UploadedImage, ImageUploadConfig } from '../../../../shared/components/image-upload/image-upload.component';

@Component({
  selector: 'app-vehicle-form',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, FormsModule, TranslatePipe, ImageUploadComponent],
  templateUrl: './vehicle-form.component.html',
  styleUrls: ['./vehicle-form.component.css']
})
export class VehicleFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private carRentalService = inject(CarRentalService);
  private carApiService = inject(CarApiService);
  private fileUploadService = inject(FileUploadService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private translationService = inject(TranslationService);
  private cdr = inject(ChangeDetectorRef);

  vehicleForm!: FormGroup;
  branches = signal<Branch[]>([]);
  isLoading = signal(false);
  isSubmitting = signal(false);
  isEditMode = signal(false);
  vehicleId = signal<string | null>(null);

  // Image upload properties
  uploadedImages = signal<UploadedImage[]>([]);
  isUploadingImage = signal(false);
  uploadError = signal<string>('');
  
  // Image upload configuration
  imageUploadConfig: ImageUploadConfig = {
    maxFiles: 1,
    maxFileSize: 5, // 5MB
    multiple: false,
    showPreview: true,
    showRemoveButton: true,
    allowedTypes: ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'],
    placeholder: 'vehicles.selectVehicleImage',
    accept: 'image/*'
  };

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
    { value: FuelType.Gasoline, label: 'vehicles.gasoline' },
    { value: FuelType.Diesel, label: 'vehicles.diesel' },
    { value: FuelType.Hybrid, label: 'vehicles.hybrid' },
    { value: FuelType.Electric, label: 'vehicles.electric' },
    { value: FuelType.PluginHybrid, label: 'vehicles.pluginHybrid' }
  ];

  transmissionTypes = [
    { value: TransmissionType.Manual, label: 'vehicles.manual' },
    { value: TransmissionType.Automatic, label: 'vehicles.automatic' }
  ];

  statusOptions = [
    { value: CarStatus.Available, label: 'vehicles.available' },
    { value: CarStatus.Rented, label: 'vehicles.rented' },
    { value: CarStatus.Maintenance, label: 'vehicles.maintenance' },
    { value: CarStatus.OutOfService, label: 'vehicles.outOfService' }
  ];

  ngOnInit() {
    console.log('🚗 VehicleFormComponent ngOnInit called');
    console.log('🚗 Current route URL:', this.router.url);
    console.log('🚗 Route params:', this.route.snapshot.paramMap);
    
    // Debug translations
    console.log('🚗 Testing status translations:');
    this.translationService.testVehicleStatusTranslations();
    
    this.initializeForm();
    this.loadBranches();
    this.checkEditMode();
    
    // Note: Sample data population disabled for production
    // if (!this.isEditMode()) {
    //   this.populateWithSampleData();
    // }
  }

  private initializeForm() {
    this.vehicleForm = this.fb.group({
      // Required bilingual brand information
      brandAr: [
        '', 
        [
          Validators.required, 
          Validators.minLength(CAR_VALIDATION.brandAr.minLength),
          Validators.maxLength(CAR_VALIDATION.brandAr.maxLength)
        ]
      ],
      brandEn: [
        '', 
        [
          Validators.required, 
          Validators.minLength(CAR_VALIDATION.brandEn.minLength),
          Validators.maxLength(CAR_VALIDATION.brandEn.maxLength)
        ]
      ],

      // Required bilingual model information
      modelAr: [
        '', 
        [
          Validators.required, 
          Validators.minLength(CAR_VALIDATION.modelAr.minLength),
          Validators.maxLength(CAR_VALIDATION.modelAr.maxLength)
        ]
      ],
      modelEn: [
        '', 
        [
          Validators.required, 
          Validators.minLength(CAR_VALIDATION.modelEn.minLength),
          Validators.maxLength(CAR_VALIDATION.modelEn.maxLength)
        ]
      ],

      // Required bilingual color information
      colorAr: [
        '', 
        [
          Validators.required, 
          Validators.minLength(CAR_VALIDATION.colorAr.minLength),
          Validators.maxLength(CAR_VALIDATION.colorAr.maxLength)
        ]
      ],
      colorEn: [
        '', 
        [
          Validators.required, 
          Validators.minLength(CAR_VALIDATION.colorEn.minLength),
          Validators.maxLength(CAR_VALIDATION.colorEn.maxLength)
        ]
      ],

      // Basic vehicle information
      year: [
        DEFAULT_CAR_VALUES.year, 
        [
          Validators.required, 
          Validators.min(CAR_VALIDATION.year.min), 
          Validators.max(CAR_VALIDATION.year.max)
        ]
      ],
      plateNumber: [
        '', 
        [
          Validators.required, 
          Validators.minLength(CAR_VALIDATION.plateNumber.minLength),
          Validators.maxLength(CAR_VALIDATION.plateNumber.maxLength)
        ]
      ],

      // Vehicle specifications
      seatingCapacity: [
        DEFAULT_CAR_VALUES.seatingCapacity, 
        [
          Validators.required, 
          Validators.min(CAR_VALIDATION.seatingCapacity.min),
          Validators.max(CAR_VALIDATION.seatingCapacity.max)
        ]
      ],
      numberOfDoors: [
        DEFAULT_CAR_VALUES.numberOfDoors, 
        [
          Validators.required, 
          Validators.min(CAR_VALIDATION.numberOfDoors.min),
          Validators.max(CAR_VALIDATION.numberOfDoors.max)
        ]
      ],
      maxSpeed: [
        DEFAULT_CAR_VALUES.maxSpeed, 
        [
          Validators.required, 
          Validators.min(CAR_VALIDATION.maxSpeed.min),
          Validators.max(CAR_VALIDATION.maxSpeed.max)
        ]
      ],
      engine: [
        '', 
        [
          Validators.required, 
          Validators.minLength(CAR_VALIDATION.engine.minLength),
          Validators.maxLength(CAR_VALIDATION.engine.maxLength)
        ]
      ],

      // Enum fields
      transmissionType: [DEFAULT_CAR_VALUES.transmissionType, Validators.required],
      fuelType: [DEFAULT_CAR_VALUES.fuelType, Validators.required],
      status: [DEFAULT_CAR_VALUES.status],

      // Pricing (all required)
      dailyRate: [
        DEFAULT_CAR_VALUES.dailyRate, 
        [
          Validators.required, 
          Validators.min(CAR_VALIDATION.dailyRate.min),
          Validators.max(CAR_VALIDATION.dailyRate.max)
        ]
      ],
      weeklyRate: [
        DEFAULT_CAR_VALUES.weeklyRate, 
        [
          Validators.required, 
          Validators.min(CAR_VALIDATION.weeklyRate.min),
          Validators.max(CAR_VALIDATION.weeklyRate.max)
        ]
      ],
      monthlyRate: [
        DEFAULT_CAR_VALUES.monthlyRate, 
        [
          Validators.required, 
          Validators.min(CAR_VALIDATION.monthlyRate.min),
          Validators.max(CAR_VALIDATION.monthlyRate.max)
        ]
      ],

      // Required IDs
      categoryId: [1, Validators.required],
      branchId: ['', Validators.required],

      // Optional fields
      imageUrl: [''],
      descriptionAr: [
        '', 
        [Validators.maxLength(CAR_VALIDATION.descriptionAr.maxLength)]
      ],
      descriptionEn: [
        '', 
        [Validators.maxLength(CAR_VALIDATION.descriptionEn.maxLength)]
      ],
      mileage: [
        DEFAULT_CAR_VALUES.mileage, 
        [
          Validators.min(CAR_VALIDATION.mileage.min),
          Validators.max(CAR_VALIDATION.mileage.max)
        ]
      ],
      features: ['']
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
    console.log('🚗 Checking edit mode - Route ID:', id);
    console.log('🚗 Route snapshot params:', this.route.snapshot.paramMap);
    console.log('🚗 Current URL:', this.router.url);
    
    if (id && id !== 'new') {
      console.log('🚗 Edit mode detected - Vehicle ID:', id);
      this.isEditMode.set(true);
      this.vehicleId.set(id);
      this.loadVehicle(id);
    } else {
      console.log('🚗 Create mode detected');
      this.isEditMode.set(false);
    }
  }

  private loadVehicle(id: string) {
    console.log('🚗 loadVehicle called with ID:', id);
    this.isLoading.set(true);
    
    // Load vehicle data directly from API service to get the correct structure
    console.log('🚗 CarApiService available, calling getCarById...');
    
    this.carApiService.getCarById(parseInt(id)).subscribe({
      next: (car) => {
        console.log('🚗 ✅ Car data received from API:', car);
        if (car) {
          console.log('🚗 Calling populateFormFromApiData...');
          this.populateFormFromApiData(car);
        } else {
          console.log('🚗 ❌ No car data received');
        }
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('🚗 ❌ Error loading vehicle from API:', error);
        console.error('🚗 Error details:', {
          status: error.status,
          statusText: error.statusText,
          url: error.url,
          message: error.message
        });
        this.isLoading.set(false);
      }
    });
  }

  private populateFormFromApiData(car: AdminCarDto) {
    console.log('🚗 Populating form with API car data:', car);
    
    // Map the actual API response structure to form fields
    this.vehicleForm.patchValue({
      // Map API fields to form fields
      brandAr: car.brand || '',  // API returns single brand field
      brandEn: car.brand || '',  // Use same value for both languages
      modelAr: car.model || '',  // API returns single model field  
      modelEn: car.model || '',  // Use same value for both languages
      year: car.year || new Date().getFullYear(),
      colorAr: car.color || '',  // API returns single color field
      colorEn: car.color || '',  // Use same value for both languages
      plateNumber: car.plateNumber || '',
      seatingCapacity: car.seatingCapacity || 5,
      numberOfDoors: car.numberOfDoors || 4,
      maxSpeed: car.maxSpeed || 180,
      engine: car.engine || '',
      transmissionType: this.mapTransmissionType(car.transmissionType),
      fuelType: this.mapFuelType(car.fuelType),
      dailyRate: car.dailyPrice || 0,
      weeklyRate: car.weeklyPrice || 0,
      monthlyRate: car.monthlyPrice || 0,
      status: this.mapCarStatus(car.status),
      imageUrl: car.imageUrl || '',
      descriptionAr: car.description || '',
      descriptionEn: car.description || '',
      mileage: car.mileage || 0,
      features: car.features || '',
      categoryId: car.category?.id || 1,
      branchId: car.branch?.id || 1
    });

    console.log('🚗 Form populated with values:', this.vehicleForm.value);
    console.log('🚗 Form field mapping details:', {
      'API brand': car.brand,
      'API model': car.model,
      'API fuelType': car.fuelType,
      'API transmissionType': car.transmissionType,
      'API status': car.status,
      'Form brandAr': this.vehicleForm.get('brandAr')?.value,
      'Form brandEn': this.vehicleForm.get('brandEn')?.value,
      'Form fuelType': this.vehicleForm.get('fuelType')?.value,
      'Form transmissionType': this.vehicleForm.get('transmissionType')?.value
    });

    // Initialize uploaded images if imageUrl exists
    this.initializeUploadedImages();
  }

  // Helper methods to map API values to form enum values
  private mapFuelType(fuelType: string): FuelType {
    switch (fuelType.toLowerCase()) {
      case 'gasoline': return FuelType.Gasoline;
      case 'diesel': return FuelType.Diesel;
      case 'hybrid': return FuelType.Hybrid;
      case 'electric': return FuelType.Electric;
      case 'pluginhybrid': return FuelType.PluginHybrid;
      default: return FuelType.Gasoline;
    }
  }

  private mapTransmissionType(transmission: string): TransmissionType {
    switch (transmission.toLowerCase()) {
      case 'manual': return TransmissionType.Manual;
      case 'automatic': return TransmissionType.Automatic;
      default: return TransmissionType.Automatic;
    }
  }

  private mapCarStatus(status: string): CarStatus {
    switch (status.toLowerCase()) {
      case 'available': return CarStatus.Available;
      case 'rented': return CarStatus.Rented;
      case 'maintenance': return CarStatus.Maintenance;
      case 'outofservice': return CarStatus.OutOfService;
      default: return CarStatus.Available;
    }
  }

  // Keep the old method for backward compatibility
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
    if (this.vehicleForm.invalid) {
      console.log('Form is invalid, marking all fields as touched');
      this.markFormGroupTouched();
      console.log('Form validation errors:', this.getFormValidationErrors());
      return;
    }

    this.isSubmitting.set(true);
    const formData = this.prepareFormData();

    const operation = this.isEditMode()
      ? this.carRentalService.updateCar(parseInt(this.vehicleId()!), formData)
      : this.carRentalService.createCar(formData);

    operation.subscribe({
      next: (vehicle) => {
        this.isSubmitting.set(false);
        this.router.navigate(['/car-rental/vehicles']);
      },
      error: (error) => {
        console.error('Error saving vehicle:', error);
        console.error('Error details:', error.error);
        this.isSubmitting.set(false);
      }
    });
  }

  private prepareFormData(): AdminCreateCarDto {
    const formValue = this.vehicleForm.value;
    
    const carDto: AdminCreateCarDto = {
      // Required bilingual fields
      brandAr: formValue.brandAr || '',
      brandEn: formValue.brandEn || '',
      modelAr: formValue.modelAr || '',
      modelEn: formValue.modelEn || '',
      colorAr: formValue.colorAr || '',
      colorEn: formValue.colorEn || '',
      
      // Required basic information
      year: parseInt(formValue.year) || DEFAULT_CAR_VALUES.year!,
      plateNumber: formValue.plateNumber || '',
      seatingCapacity: parseInt(formValue.seatingCapacity) || DEFAULT_CAR_VALUES.seatingCapacity!,
      numberOfDoors: parseInt(formValue.numberOfDoors) || DEFAULT_CAR_VALUES.numberOfDoors!,
      maxSpeed: parseInt(formValue.maxSpeed) || DEFAULT_CAR_VALUES.maxSpeed!,
      engine: formValue.engine || '',
      
      // Required enums
      transmissionType: formValue.transmissionType || DEFAULT_CAR_VALUES.transmissionType!,
      fuelType: formValue.fuelType || DEFAULT_CAR_VALUES.fuelType!,
      
      // Required pricing
      dailyRate: parseFloat(formValue.dailyRate) || DEFAULT_CAR_VALUES.dailyRate!,
      weeklyRate: parseFloat(formValue.weeklyRate) || DEFAULT_CAR_VALUES.weeklyRate!,
      monthlyRate: parseFloat(formValue.monthlyRate) || DEFAULT_CAR_VALUES.monthlyRate!,
      
      // Required IDs
      categoryId: parseInt(formValue.categoryId) || 1,
      branchId: parseInt(formValue.branchId) || 1,
      
      // Optional fields
      status: formValue.status || DEFAULT_CAR_VALUES.status,
      imageUrl: formValue.imageUrl || undefined,
      descriptionAr: formValue.descriptionAr || undefined,
      descriptionEn: formValue.descriptionEn || undefined,
      mileage: parseInt(formValue.mileage) || DEFAULT_CAR_VALUES.mileage,
      features: formValue.features || undefined
    };
    
    return carDto;
  }

  private getFormValidationErrors() {
    const formErrors: any = {};
    Object.keys(this.vehicleForm.controls).forEach(key => {
      const controlErrors = this.vehicleForm.get(key)?.errors;
      if (controlErrors) {
        formErrors[key] = controlErrors;
      }
    });
    return formErrors;
  }

  private populateWithSampleData() {
    console.log('Populating form with sample data');
    this.vehicleForm.patchValue({
      brandAr: 'تويوتا',
      brandEn: 'Toyota',
      modelAr: 'كامري',
      modelEn: 'Camry',
      year: 2024,
      colorAr: 'أبيض',
      colorEn: 'White',
      plateNumber: 'ABC-123',
      seatingCapacity: 5,
      numberOfDoors: 4,
      maxSpeed: 180,
      engine: '2.5L 4-Cylinder',
      transmissionType: TransmissionType.Automatic,
      fuelType: FuelType.Gasoline,
      dailyRate: 150.00,
      weeklyRate: 900.00,
      monthlyRate: 3500.00,
      status: CarStatus.Available,
      categoryId: 1,
      branchId: 1,
      mileage: 0,
      descriptionAr: 'سيارة ممتازة للإيجار',
      descriptionEn: 'Excellent car for rental',
      features: 'Air Conditioning, GPS, Bluetooth'
    });
    console.log('Sample data populated');
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

  // Image upload methods
  onImageFilesSelected(images: UploadedImage[]): void {
    this.uploadError.set('');
    
    if (images.length === 0) {
      this.uploadedImages.set([]);
      this.vehicleForm.patchValue({ imageUrl: '' });
      return;
    }

    const image = images[0]; // Since we only allow single image
    
    // Check if image has a file to upload
    if (!image.file) {
      console.log('🚗 Image does not have a file to upload');
      return;
    }
    
    this.isUploadingImage.set(true);

    // Upload the file to the server
    this.fileUploadService.uploadFile(image.file, 'vehicles').subscribe({
      next: (uploadResult) => {
        console.log('✅ Image uploaded successfully:', uploadResult);
        
        // Update the form with the uploaded image URL
        this.vehicleForm.patchValue({ imageUrl: uploadResult.fileUrl });
        
        // Create updated image object with server data
        const updatedImage: UploadedImage = {
          ...image,
          id: uploadResult.fileName,
          name: uploadResult.originalFileName,
          preview: uploadResult.fileUrl, // This should be the full URL from the service
          size: uploadResult.fileSize,
          type: image.type
        };
        
        // Update the uploaded images signal
        this.uploadedImages.set([updatedImage]);
        
        console.log('📸 Updated uploadedImages:', this.uploadedImages());
        console.log('📸 Form imageUrl:', this.vehicleForm.get('imageUrl')?.value);
        
        // Trigger change detection to update the UI
        this.cdr.detectChanges();
      },
      error: (error) => {
        console.error('❌ Image upload failed:', error);
        this.uploadError.set(error instanceof Error ? error.message : 'Upload failed');
        this.uploadedImages.set([]);
        
        // Trigger change detection to update the UI
        this.cdr.detectChanges();
      },
      complete: () => {
        this.isUploadingImage.set(false);
        
        // Trigger change detection to hide the loader
        this.cdr.detectChanges();
      }
    });
  }

  onImageFileRemoved(imageId: string): void {
    this.uploadedImages.set([]);
    this.vehicleForm.patchValue({ imageUrl: '' });
    this.uploadError.set('');
    this.cdr.detectChanges();
  }

  onImageUploadError(error: string): void {
    this.uploadError.set(error);
    console.error('Image upload error:', error);
    this.cdr.detectChanges();
  }


  // Initialize uploaded images from existing imageUrl
  private initializeUploadedImages(): void {
    const imageUrl = this.vehicleForm.get('imageUrl')?.value;
    
    if (imageUrl && this.fileUploadService.isValidFileUrl(imageUrl)) {
      // Create a mock UploadedImage for existing image
      const fileName = this.fileUploadService.getFileNameFromUrl(imageUrl);
      const mockImage: UploadedImage = {
        id: fileName,
        file: new File([], fileName, { type: 'image/jpeg' }), // Mock file
        preview: imageUrl,
        name: fileName,
        size: 0,
        type: 'image/jpeg'
      };
      
      this.uploadedImages.set([mockImage]);
      this.cdr.detectChanges();
    }
  }

  // Format file size for display
  formatFileSize(bytes: number): string {
    return this.fileUploadService.formatFileSize(bytes);
  }
}
