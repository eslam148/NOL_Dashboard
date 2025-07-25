import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import { CarRentalService } from '../../../../core/services/car-rental.service';
import { Customer, CustomerType } from '../../../../core/models/car-rental.models';

@Component({
  selector: 'app-customer-form',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, TranslatePipe],
  templateUrl: './customer-form.component.html',
  styleUrls: ['./customer-form.component.css']
})
export class CustomerFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private carRentalService = inject(CarRentalService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  customerForm!: FormGroup;
  isLoading = signal(false);
  isSubmitting = signal(false);
  isEditMode = signal(false);
  customerId = signal<string | null>(null);

  // Customer types and options
  customerTypes: { value: CustomerType; label: string }[] = [
    { value: 'regular', label: 'customers.regular' },
    { value: 'premium', label: 'customers.premium' },
    { value: 'corporate', label: 'customers.corporate' }
  ];

  genderOptions = [
    { value: 'male', label: 'customers.male' },
    { value: 'female', label: 'customers.female' },
    { value: 'other', label: 'customers.other' }
  ];

  languageOptions = [
    { value: 'en', label: 'customers.english' },
    { value: 'ar', label: 'customers.arabic' }
  ];

  relationshipOptions = [
    { value: 'spouse', label: 'customers.spouse' },
    { value: 'parent', label: 'customers.parent' },
    { value: 'sibling', label: 'customers.sibling' },
    { value: 'friend', label: 'customers.friend' },
    { value: 'colleague', label: 'customers.colleague' }
  ];

  licenseClasses = [
    { value: 'A', label: 'customers.classA' },
    { value: 'B', label: 'customers.classB' },
    { value: 'C', label: 'customers.classC' },
    { value: 'D', label: 'customers.classD' }
  ];

  ngOnInit() {
    this.initializeForm();
    this.checkEditMode();
  }

  private initializeForm() {
    this.customerForm = this.fb.group({
      // Personal Information
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^\+?[1-9]\d{1,14}$/)]],
      alternatePhone: ['', [Validators.pattern(/^\+?[1-9]\d{1,14}$/)]],
      dateOfBirth: ['', Validators.required],
      nationality: ['', Validators.required],
      gender: [''],
      preferredLanguage: ['en'],

      // Driver License Information
      licenseNumber: ['', Validators.required],
      issuingCountry: ['', Validators.required],
      issueDate: ['', Validators.required],
      expiryDate: ['', Validators.required],
      licenseClass: ['', Validators.required],

      // Address Information
      street: ['', Validators.required],
      city: ['', Validators.required],
      state: ['', Validators.required],
      zipCode: ['', Validators.required],
      country: ['UAE', Validators.required],

      // Emergency Contact
      emergencyContactName: ['', Validators.required],
      emergencyContactPhone: ['', [Validators.required, Validators.pattern(/^\+?[1-9]\d{1,14}$/)]],
      emergencyContactRelationship: ['', Validators.required],

      // Customer Details
      customerType: ['regular', Validators.required],
      marketingConsent: [false],
      profileImage: [''],
      notes: [''],

      // Document URLs
      driverLicenseFront: [''],
      driverLicenseBack: [''],
      passport: [''],
      nationalId: [''],

      // Preferences
      preferredVehicleTypes: [''],
      preferredFeatures: [''],
      emailNotifications: [true],
      smsNotifications: [true],
      pushNotifications: [true]
    });
  }

  private checkEditMode() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEditMode.set(true);
      this.customerId.set(id);
      this.loadCustomer(id);
    }
  }

  private loadCustomer(id: string) {
    this.isLoading.set(true);
    this.carRentalService.getCustomerById(id).subscribe({
      next: (customer) => {
        if (customer) {
          this.populateForm(customer);
        }
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading customer:', error);
        this.isLoading.set(false);
      }
    });
  }

  private populateForm(customer: Customer) {
    this.customerForm.patchValue({
      firstName: customer.firstName,
      lastName: customer.lastName,
      email: customer.email,
      phone: customer.phone,
      alternatePhone: customer.alternatePhone || '',
      dateOfBirth: this.formatDateForInput(customer.dateOfBirth),
      nationality: customer.nationality,
      gender: customer.gender || '',
      preferredLanguage: customer.preferredLanguage || 'en',
      licenseNumber: customer.driverLicense.number,
      issuingCountry: customer.driverLicense.issuingCountry,
      issueDate: this.formatDateForInput(customer.driverLicense.issueDate),
      expiryDate: this.formatDateForInput(customer.driverLicense.expiryDate),
      licenseClass: customer.driverLicense.licenseClass,
      street: customer.address.street,
      city: customer.address.city,
      state: customer.address.state,
      zipCode: customer.address.zipCode,
      country: customer.address.country,
      emergencyContactName: customer.emergencyContact.name,
      emergencyContactPhone: customer.emergencyContact.phone,
      emergencyContactRelationship: customer.emergencyContact.relationship,
      customerType: customer.customerType,
      marketingConsent: customer.marketingConsent,
      profileImage: customer.profileImage || '',
      notes: customer.notes || '',
      driverLicenseFront: customer.documents?.driverLicenseFront || '',
      driverLicenseBack: customer.documents?.driverLicenseBack || '',
      passport: customer.documents?.passport || '',
      nationalId: customer.documents?.nationalId || '',
      preferredVehicleTypes: customer.preferences?.vehicleType?.join(', ') || '',
      preferredFeatures: customer.preferences?.features?.join(', ') || '',
      emailNotifications: customer.preferences?.notifications?.email ?? true,
      smsNotifications: customer.preferences?.notifications?.sms ?? true,
      pushNotifications: customer.preferences?.notifications?.push ?? true
    });
  }

  private formatDateForInput(date: Date): string {
    return new Date(date).toISOString().split('T')[0];
  }

  onSubmit() {
    if (this.customerForm.valid) {
      this.isSubmitting.set(true);
      const formData = this.prepareFormData();

      const operation = this.isEditMode()
        ? this.carRentalService.updateCustomer(this.customerId()!, formData)
        : this.carRentalService.createCustomer(formData);

      operation.subscribe({
        next: (customer) => {
          this.isSubmitting.set(false);
          this.router.navigate(['/car-rental/customers']);
        },
        error: (error) => {
          console.error('Error saving customer:', error);
          this.isSubmitting.set(false);
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  private prepareFormData(): any {
    const formValue = this.customerForm.value;

    const preferredVehicleTypes = formValue.preferredVehicleTypes ?
      formValue.preferredVehicleTypes.split(',').map((t: string) => t.trim()).filter((t: string) => t) : [];

    const preferredFeatures = formValue.preferredFeatures ?
      formValue.preferredFeatures.split(',').map((f: string) => f.trim()).filter((f: string) => f) : [];

    const data: any = {
      firstName: formValue.firstName,
      lastName: formValue.lastName,
      email: formValue.email,
      phone: formValue.phone,
      dateOfBirth: new Date(formValue.dateOfBirth),
      nationality: formValue.nationality,
      driverLicense: {
        number: formValue.licenseNumber,
        issuingCountry: formValue.issuingCountry,
        issueDate: new Date(formValue.issueDate),
        expiryDate: new Date(formValue.expiryDate),
        licenseClass: formValue.licenseClass
      },
      address: {
        street: formValue.street,
        city: formValue.city,
        state: formValue.state,
        zipCode: formValue.zipCode,
        country: formValue.country
      },
      emergencyContact: {
        name: formValue.emergencyContactName,
        phone: formValue.emergencyContactPhone,
        relationship: formValue.emergencyContactRelationship
      },
      customerType: formValue.customerType,
      marketingConsent: formValue.marketingConsent,
      status: 'active',
      verificationStatus: 'pending',
      loyaltyPoints: 0,
      totalRentals: 0,
      totalSpent: 0,
      averageRating: 0,
      createdBy: '1' // This should come from auth service
    };

    // Optional fields
    if (formValue.alternatePhone) data.alternatePhone = formValue.alternatePhone;
    if (formValue.gender) data.gender = formValue.gender;
    if (formValue.preferredLanguage) data.preferredLanguage = formValue.preferredLanguage;
    if (formValue.profileImage) data.profileImage = formValue.profileImage;
    if (formValue.notes) data.notes = formValue.notes;

    // Documents
    const documents: any = {};
    if (formValue.driverLicenseFront) documents.driverLicenseFront = formValue.driverLicenseFront;
    if (formValue.driverLicenseBack) documents.driverLicenseBack = formValue.driverLicenseBack;
    if (formValue.passport) documents.passport = formValue.passport;
    if (formValue.nationalId) documents.nationalId = formValue.nationalId;
    if (Object.keys(documents).length > 0) data.documents = documents;

    // Preferences
    data.preferences = {
      vehicleType: preferredVehicleTypes.length > 0 ? preferredVehicleTypes : undefined,
      features: preferredFeatures.length > 0 ? preferredFeatures : undefined,
      notifications: {
        email: formValue.emailNotifications,
        sms: formValue.smsNotifications,
        push: formValue.pushNotifications
      }
    };

    return data;
  }

  private markFormGroupTouched() {
    Object.keys(this.customerForm.controls).forEach(key => {
      const control = this.customerForm.get(key);
      control?.markAsTouched();
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.customerForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.customerForm.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) return `${fieldName} is required`;
      if (field.errors['email']) return 'Invalid email format';
      if (field.errors['minlength']) return `${fieldName} is too short`;
      if (field.errors['pattern']) return `${fieldName} format is invalid`;
    }
    return '';
  }

  onCancel() {
    this.router.navigate(['/car-rental/customers']);
  }
}
