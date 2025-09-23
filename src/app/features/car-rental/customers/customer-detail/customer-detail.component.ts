import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TranslatePipe } from '../../../../shared/pipes/translate.pipe';
import { CarRentalService } from '../../../../core/services/car-rental.service';
import { Customer } from '../../../../core/models/car-rental.models';
import { CustomerApiService } from '../../../../core/services/customer-api.service';
import { environment } from '../../../../../environments/environment';

@Component({
  selector: 'app-customer-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslatePipe],
  template: `
    <div class="customer-detail-container">
      <div class="page-header">
        <div class="flex items-center gap-4">
          <a routerLink="/car-rental/customers" class="btn btn-ghost btn-sm">
            <i class="bi bi-arrow-left"></i>
            {{ 'common.back' | translate }}
          </a>
          <div>
            <h1 class="page-title">{{ 'customers.customerDetails' | translate }}</h1>
            <p class="page-subtitle">{{ 'customers.customerDetailsDesc' | translate }}</p>
          </div>
        </div>
      </div>

      <div class="loading" *ngIf="isLoading()">
        <div class="spinner"></div>
        <p class="text-muted">{{ 'common.loading' | translate }}</p>
      </div>

      <div class="error" *ngIf="error() && !isLoading()">
        <p>{{ error() }}</p>
      </div>

      <div class="content" *ngIf="customer() && !isLoading()">
        <div class="grid">
          <div class="card span-2">
            <h3>{{ 'customers.profile' | translate }}</h3>
            <div class="row"><span>{{ 'customers.name' | translate }}</span><strong>{{ fullName() }}</strong></div>
            <div class="row"><span>{{ 'customers.email' | translate }}</span><strong>{{ customer()!.email }}</strong></div>
            <div class="row"><span>{{ 'customers.phone' | translate }}</span><strong>{{ customer()!.phone }}</strong></div>
            <div class="row"><span>{{ 'customers.status' | translate }}</span><strong>{{ customer()!.status }}</strong></div>
            <div class="row"><span>{{ 'customers.verificationStatus' | translate }}</span><strong>{{ customer()!.verificationStatus }}</strong></div>
          </div>

          <div class="card">
            <h3>{{ 'customers.address' | translate }}</h3>
            <div class="row"><span>{{ 'customers.street' | translate }}</span><strong>{{ customer()!.address.street }}</strong></div>
            <div class="row"><span>{{ 'customers.city' | translate }}</span><strong>{{ customer()!.address.city }}</strong></div>
            <div class="row"><span>{{ 'customers.state' | translate }}</span><strong>{{ customer()!.address.state }}</strong></div>
            <div class="row"><span>{{ 'customers.country' | translate }}</span><strong>{{ customer()!.address.country }}</strong></div>
            <div class="row"><span>{{ 'customers.zipCode' | translate }}</span><strong>{{ customer()!.address.zipCode }}</strong></div>
          </div>

          <div class="card">
            <h3>{{ 'customers.license' | translate }}</h3>
            <div class="row"><span>{{ 'customers.licenseNumber' | translate }}</span><strong>{{ customer()!.driverLicense.number }}</strong></div>
            <div class="row"><span>{{ 'customers.licenseClass' | translate }}</span><strong>{{ customer()!.driverLicense.licenseClass }}</strong></div>
            <div class="row"><span>{{ 'customers.issueDate' | translate }}</span><strong>{{ customer()!.driverLicense.issueDate | date: 'mediumDate' }}</strong></div>
            <div class="row"><span>{{ 'customers.expiryDate' | translate }}</span><strong>{{ customer()!.driverLicense.expiryDate | date: 'mediumDate' }}</strong></div>
          </div>

          <div class="card">
            <h3>{{ 'customers.metrics' | translate }}</h3>
            <div class="row"><span>{{ 'customers.totalRentals' | translate }}</span><strong>{{ customer()!.totalRentals }}</strong></div>
            <div class="row"><span>{{ 'customers.totalSpent' | translate }}</span><strong>{{ customer()!.totalSpent | number:'1.2-2' }}</strong></div>
            <div class="row"><span>{{ 'customers.loyaltyPoints' | translate }}</span><strong>{{ customer()!.loyaltyPoints }}</strong></div>
          </div>
        </div>

        <div class="actions">
          <a [routerLink]="['/car-rental/customers', customer()!.id, 'edit']" class="btn btn-primary">
            <i class="bi bi-pencil"></i>
            {{ 'common.edit' | translate }}
          </a>
          <a routerLink="/car-rental/customers" class="btn btn-secondary">
            {{ 'common.back' | translate }}
          </a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .customer-detail-container { padding: 2rem; max-width: 1100px; margin: 0 auto; }
    .page-header { margin-bottom: 2rem; }
    .page-title { font-size: 1.875rem; font-weight: 700; color: var(--text-primary); margin: 0 0 0.5rem 0; }
    .page-subtitle { color: var(--text-secondary); margin: 0; }
    .loading, .error { display: flex; gap: .75rem; align-items: center; color: var(--text-secondary); }
    .grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1rem; }
    .card { background: var(--white); border: 1px solid var(--border-light); border-radius: var(--radius-lg); padding: 1rem 1.25rem; box-shadow: var(--shadow-sm); }
    .card h3 { margin: 0 0 .75rem 0; font-size: 1rem; font-weight: 600; color: var(--text-primary); }
    .row { display: flex; justify-content: space-between; padding: .4rem 0; border-bottom: 1px dashed var(--border-light); }
    .row:last-child { border-bottom: 0; }
    .row span { color: var(--text-secondary); }
    .row strong { color: var(--text-primary); }
    .actions { display: flex; gap: .75rem; margin-top: 1.25rem; }
    .span-2 { grid-column: span 2; }
    @media (max-width: 900px) { .grid { grid-template-columns: 1fr; } .span-2 { grid-column: auto; } }
  `]
})
export class CustomerDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private carRentalService = inject(CarRentalService);
  private customerApiService = inject(CustomerApiService);

  isLoading = signal(false);
  error = signal<string | null>(null);
  customer = signal<Customer | null>(null);

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.error.set('Invalid customer id');
      return;
    }
    this.loadCustomer(id);
  }

  private loadCustomer(id: string) {
    this.isLoading.set(true);
    this.error.set(null);

    const useRealApi = !environment.features?.mockData;
    if (useRealApi) {
      // The API returns AdminCustomerDto; map already exists in CarRentalService
      this.customerApiService.getCustomerById(id).subscribe({
        next: (dto: any) => {
          try {
            // Reuse the existing mapping logic in CarRentalService for consistency
            const mapped = (this.carRentalService as any).convertAdminCustomerDtoToCustomer(dto);
            this.customer.set(mapped);
          } catch (e) {
            console.error('Mapping error:', e);
            this.error.set('Failed to map customer');
          }
          this.isLoading.set(false);
        },
        error: (err) => {
          console.error('Error loading customer:', err);
          this.error.set('Failed to load customer');
          this.isLoading.set(false);
        }
      });
      return;
    }

    this.carRentalService.getCustomerById(id).subscribe({
      next: (c: Customer | null) => {
        if (!c) this.error.set('Customer not found');
        this.customer.set(c);
        this.isLoading.set(false);
      },
      error: (err) => {
        console.error('Error loading customer:', err);
        this.error.set('Failed to load customer');
        this.isLoading.set(false);
      }
    });
  }

  fullName = () => this.customer() ? `${this.customer()!.firstName} ${this.customer()!.lastName}`.trim() : '';
}
