import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import { TranslationService } from '../../../../core/services/translation.service';
import { CarRentalService } from '../../../../core/services/car-rental.service';
import { AdminUser, AdminRole, Permission, Branch } from '../../../../core/models/car-rental.models';

@Component({
  selector: 'app-admin-user-form',
  standalone: true,
  imports: [CommonModule, RouterModule, ReactiveFormsModule, TranslatePipe],
  templateUrl: './admin-user-form.component.html',
  styleUrls: ['./admin-user-form.component.css']
})
export class AdminUserFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private carRentalService = inject(CarRentalService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private translationService = inject(TranslationService);

  adminUserForm!: FormGroup;
  branches = signal<Branch[]>([]);
  isLoading = signal(false);
  isSubmitting = signal(false);
  isEditMode = signal(false);
  adminUserId = signal<string | null>(null);

  // Admin roles and options
  adminRoles: { value: AdminRole; label: string }[] = [
    { value: 'super_admin', label: 'adminUsers.super_admin' },
    { value: 'branch_manager', label: 'adminUsers.branch_manager' },
    { value: 'staff', label: 'adminUsers.staff' },
    { value: 'viewer', label: 'adminUsers.viewer' }
  ];

  departments = [
    { value: 'operations', label: 'adminUsers.operations' },
    { value: 'customer_service', label: 'adminUsers.customerService' },
    { value: 'finance', label: 'adminUsers.finance' },
    { value: 'marketing', label: 'adminUsers.marketing' },
    { value: 'hr', label: 'adminUsers.hr' },
    { value: 'it', label: 'adminUsers.it' }
  ];

  relationships = [
    { value: 'spouse', label: 'adminUsers.spouse' },
    { value: 'parent', label: 'adminUsers.parent' },
    { value: 'sibling', label: 'adminUsers.sibling' },
    { value: 'friend', label: 'adminUsers.friend' },
    { value: 'colleague', label: 'adminUsers.colleague' }
  ];

  ngOnInit() {
    this.initializeForm();
    this.loadBranches();
    this.checkEditMode();
  }

  private initializeForm() {
    this.adminUserForm = this.fb.group({
      // Basic Information
      firstName: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      username: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^\+?[1-9]\d{1,14}$/)]],
      alternatePhone: ['', [Validators.pattern(/^\+?[1-9]\d{1,14}$/)]],
      
      // Role and Access
      role: ['', Validators.required],
      status: ['active', Validators.required],
      branchIds: [[], Validators.required],
      
      // Employment Information
      employeeId: [''],
      department: [''],
      hireDate: [''],
      salary: ['', [Validators.min(0)]],
      
      // Address Information
      street: [''],
      city: [''],
      state: [''],
      zipCode: [''],
      country: ['UAE'],
      
      // Emergency Contact
      emergencyContactName: [''],
      emergencyContactRelationship: [''],
      emergencyContactPhone: ['', [Validators.pattern(/^\+?[1-9]\d{1,14}$/)]],
      
      // Additional Information
      profileImage: [''],
      notes: [''],
      
      // Password (for new users)
      password: [''],
      confirmPassword: ['']
    });

    // Add password validation for new users
    if (!this.isEditMode()) {
      this.adminUserForm.get('password')?.setValidators([Validators.required, Validators.minLength(8)]);
      this.adminUserForm.get('confirmPassword')?.setValidators([Validators.required]);
    }
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
      this.adminUserId.set(id);
      this.loadAdminUser(id);
    }
  }

  private loadAdminUser(id: string) {
    this.isLoading.set(true);
    this.carRentalService.getAdminUserById(id).subscribe({
      next: (adminUser) => {
        if (adminUser) {
          this.populateForm(adminUser);
        }
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading admin user:', error);
        this.isLoading.set(false);
      }
    });
  }

  private populateForm(adminUser: AdminUser) {
    this.adminUserForm.patchValue({
      firstName: adminUser.firstName,
      lastName: adminUser.lastName,
      username: adminUser.username,
      email: adminUser.email,
      phone: adminUser.phone,
      alternatePhone: adminUser.alternatePhone || '',
      role: adminUser.role,
      status: adminUser.status,
      branchIds: adminUser.branchIds,
      employeeId: adminUser.employeeId || '',
      department: adminUser.department || '',
      hireDate: adminUser.hireDate ? this.formatDateForInput(adminUser.hireDate) : '',
      salary: adminUser.salary || '',
      street: adminUser.address?.street || '',
      city: adminUser.address?.city || '',
      state: adminUser.address?.state || '',
      zipCode: adminUser.address?.zipCode || '',
      country: adminUser.address?.country || 'UAE',
      emergencyContactName: adminUser.emergencyContact?.name || '',
      emergencyContactRelationship: adminUser.emergencyContact?.relationship || '',
      emergencyContactPhone: adminUser.emergencyContact?.phone || '',
      profileImage: adminUser.profileImage || '',
      notes: adminUser.notes || ''
    });
  }

  private formatDateForInput(date: Date): string {
    return new Date(date).toISOString().split('T')[0];
  }

  onSubmit() {
    if (this.adminUserForm.valid && this.validatePasswords()) {
      this.isSubmitting.set(true);
      const formData = this.prepareFormData();
      
      const operation = this.isEditMode() 
        ? this.carRentalService.updateAdminUser(this.adminUserId()!, formData)
        : this.carRentalService.createAdminUser(formData);

      operation.subscribe({
        next: (adminUser) => {
          this.isSubmitting.set(false);
          this.router.navigate(['/car-rental/admin-users']);
        },
        error: (error) => {
          console.error('Error saving admin user:', error);
          this.isSubmitting.set(false);
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  private validatePasswords(): boolean {
    if (!this.isEditMode()) {
      const password = this.adminUserForm.get('password')?.value;
      const confirmPassword = this.adminUserForm.get('confirmPassword')?.value;
      return password === confirmPassword;
    }
    return true;
  }

  private prepareFormData(): any {
    const formValue = this.adminUserForm.value;
    
    const branchIds = Array.isArray(formValue.branchIds) ? formValue.branchIds : [formValue.branchIds];

    const data: any = {
      firstName: formValue.firstName,
      lastName: formValue.lastName,
      username: formValue.username,
      email: formValue.email,
      phone: formValue.phone,
      role: formValue.role,
      status: formValue.status,
      branchIds: branchIds.filter((id: string) => id),
      permissions: this.getPermissionsForRole(formValue.role),
      createdBy: '1' // This should come from auth service
    };

    // Optional fields
    if (formValue.alternatePhone) data.alternatePhone = formValue.alternatePhone;
    if (formValue.employeeId) data.employeeId = formValue.employeeId;
    if (formValue.department) data.department = formValue.department;
    if (formValue.hireDate) data.hireDate = new Date(formValue.hireDate);
    if (formValue.salary) data.salary = parseFloat(formValue.salary);
    if (formValue.profileImage) data.profileImage = formValue.profileImage;
    if (formValue.notes) data.notes = formValue.notes;

    // Address
    if (formValue.street || formValue.city) {
      data.address = {
        street: formValue.street || '',
        city: formValue.city || '',
        state: formValue.state || '',
        zipCode: formValue.zipCode || '',
        country: formValue.country || 'UAE'
      };
    }

    // Emergency Contact
    if (formValue.emergencyContactName) {
      data.emergencyContact = {
        name: formValue.emergencyContactName,
        relationship: formValue.emergencyContactRelationship || '',
        phone: formValue.emergencyContactPhone || ''
      };
    }

    // Password for new users
    if (!this.isEditMode() && formValue.password) {
      data.password = formValue.password;
    }

    return data;
  }

  private getPermissionsForRole(role: AdminRole): Permission[] {
    const permissions: Permission[] = [];
    
    switch (role) {
      case 'super_admin':
        permissions.push(
          { resource: 'all', actions: ['create', 'read', 'update', 'delete'] }
        );
        break;
      case 'branch_manager':
        permissions.push(
          { resource: 'vehicles', actions: ['create', 'read', 'update', 'delete'] },
          { resource: 'bookings', actions: ['create', 'read', 'update', 'delete'] },
          { resource: 'customers', actions: ['create', 'read', 'update'] },
          { resource: 'services', actions: ['read', 'update'] },
          { resource: 'staff', actions: ['read', 'update'] }
        );
        break;
      case 'staff':
        permissions.push(
          { resource: 'vehicles', actions: ['read', 'update'] },
          { resource: 'bookings', actions: ['create', 'read', 'update'] },
          { resource: 'customers', actions: ['create', 'read', 'update'] }
        );
        break;
      case 'viewer':
        permissions.push(
          { resource: 'vehicles', actions: ['read'] },
          { resource: 'bookings', actions: ['read'] },
          { resource: 'customers', actions: ['read'] }
        );
        break;
    }
    
    return permissions;
  }

  private markFormGroupTouched() {
    Object.keys(this.adminUserForm.controls).forEach(key => {
      const control = this.adminUserForm.get(key);
      control?.markAsTouched();
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.adminUserForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  getFieldError(fieldName: string): string {
    const field = this.adminUserForm.get(fieldName);
    if (field?.errors) {
      if (field.errors['required']) return this.translationService.translate('common.formValidation.required');
      if (field.errors['email']) return this.translationService.translate('common.formValidation.email');
      if (field.errors['minlength']) return this.translationService.translate('common.formValidation.minLength');
      if (field.errors['pattern']) return this.translationService.translate('common.formValidation.pattern');
      if (field.errors['min']) return this.translationService.translate('common.formValidation.min');
      if (field.errors['max']) return this.translationService.translate('common.formValidation.max');
    }
    return '';
  }

  passwordsMatch(): boolean {
    if (this.isEditMode()) return true;
    const password = this.adminUserForm.get('password')?.value;
    const confirmPassword = this.adminUserForm.get('confirmPassword')?.value;
    return password === confirmPassword;
  }

  onCancel() {
    this.router.navigate(['/car-rental/admin-users']);
  }
}
