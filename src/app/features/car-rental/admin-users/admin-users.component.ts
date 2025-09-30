import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { CarRentalService } from '../../../core/services/car-rental.service';
import { AdminUser, AdminRole, ActivityLog } from '../../../core/models/car-rental.models';
import { AdminFilterDto } from '../../../core/models/api.models';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule, TranslatePipe],
  templateUrl: './admin-users.component.html',
  styleUrls: ['./admin-users.component.css']
})
export class AdminUsersComponent implements OnInit {
  private carRentalService = inject(CarRentalService);

  adminUsers = signal<AdminUser[]>([]);
  filteredUsers = signal<AdminUser[]>([]);
  activityLogs = signal<ActivityLog[]>([]);
  isLoading = signal(false);
  isLoadingLogs = signal(false);
  searchTerm = signal('');
  roleFilter = signal<string>('all');
  statusFilter = signal<string>('all');
  selectedTab = signal<'users' | 'logs'>('users');

  // Filter options
  roleOptions = [
    { value: 'all', label: 'adminUsers.allRoles' },
    { value: 'super_admin', label: 'adminUsers.superAdmin' },
    { value: 'branch_manager', label: 'adminUsers.branchManager' },
    { value: 'staff', label: 'adminUsers.staff' },
    { value: 'viewer', label: 'adminUsers.viewer' }
  ];

  statusOptions = [
    { value: 'all', label: 'adminUsers.allStatuses' },
    { value: 'active', label: 'adminUsers.active' },
    { value: 'inactive', label: 'adminUsers.inactive' }
  ];

  ngOnInit() {
    this.loadAdminUsers();
  }

  private loadAdminUsers(filter?: AdminFilterDto) {
    this.isLoading.set(true);
    this.carRentalService.getAdminUsers(filter).subscribe({
      next: (users) => {
        this.adminUsers.set(users);
        this.applyFilters();
        this.isLoading.set(false);
      },
      error: (error) => {
        console.error('Error loading admin users:', error);
        this.isLoading.set(false);
      }
    });
  }

  // Activity logs disabled/hidden

  onSearchChange(term: string) {
    this.searchTerm.set(term);
    this.applyFilters();
  }

  onRoleFilterChange(role: string) {
    this.roleFilter.set(role);
    const apiFilter: AdminFilterDto = {};
    // Map UI role to API role
    if (role !== 'all') {
      apiFilter.userRole = this.mapUiRoleToApiRole(role);
    }
    // Preserve current status filter in the API request
    if (this.statusFilter() !== 'all') {
      apiFilter.isActive = this.statusFilter() === 'active';
    }
    this.loadAdminUsers(apiFilter);
  }

  onStatusFilterChange(status: string) {
    this.statusFilter.set(status);
    const apiFilter: AdminFilterDto = {};
    // Preserve current role filter in the API request
    if (this.roleFilter() !== 'all') {
      apiFilter.userRole = this.mapUiRoleToApiRole(this.roleFilter());
    }
    if (status !== 'all') {
      apiFilter.isActive = status === 'active';
    }
    this.loadAdminUsers(apiFilter);
  }

  private mapUiRoleToApiRole(role: string | undefined): AdminFilterDto['userRole'] | undefined {
    switch (role) {
      case 'super_admin':
        return 'SuperAdmin';
      case 'branch_manager':
        return 'BranchManager';
      case 'staff':
        return 'Employee';
      case 'viewer':
        // No direct API role; treat as Employee or omit to broaden results
        return 'Employee';
      default:
        return undefined;
    }
  }

  private applyFilters() {
    let filtered = [...this.adminUsers()];

    // Apply search filter
    const search = this.searchTerm().toLowerCase();
    if (search) {
      filtered = filtered.filter(user =>
        user.firstName.toLowerCase().includes(search) ||
        user.lastName.toLowerCase().includes(search) ||
        user.username.toLowerCase().includes(search) ||
        user.email.toLowerCase().includes(search)
      );
    }

    // Apply role filter
    if (this.roleFilter() !== 'all') {
      filtered = filtered.filter(user => user.role === this.roleFilter());
    }

    // Apply status filter
    if (this.statusFilter() !== 'all') {
      filtered = filtered.filter(user => user.status === this.statusFilter());
    }

    this.filteredUsers.set(filtered);
  }

  getRoleBadgeClass(role: AdminRole): string {
    switch (role) {
      case 'super_admin': return 'badge badge-error';
      case 'branch_manager': return 'badge badge-primary';
      case 'staff': return 'badge badge-success';
      case 'viewer': return 'badge badge-gray';
      default: return 'badge badge-gray';
    }
  }

  getRoleIcon(role: AdminRole): string {
    switch (role) {
      case 'super_admin': return 'bi-shield-fill-check';
      case 'branch_manager': return 'bi-person-gear';
      case 'staff': return 'bi-person-check';
      case 'viewer': return 'bi-eye';
      default: return 'bi-person';
    }
  }

  getActionIcon(action: string): string {
    switch (action.toLowerCase()) {
      case 'create': return 'bi-plus-circle';
      case 'update': return 'bi-pencil';
      case 'delete': return 'bi-trash';
      case 'read': return 'bi-eye';
      default: return 'bi-activity';
    }
  }

  getActionBadgeClass(action: string): string {
    switch (action.toLowerCase()) {
      case 'create': return 'badge badge-success';
      case 'update': return 'badge badge-warning';
      case 'delete': return 'badge badge-error';
      case 'read': return 'badge badge-info';
      default: return 'badge badge-gray';
    }
  }

  toggleUserStatus(user: AdminUser) {
    this.carRentalService.toggleAdminUserStatus(user.id).subscribe({
      next: (updatedUser) => {
        // Update the user in the list
        const users = this.adminUsers();
        const index = users.findIndex(u => u.id === user.id);
        if (index !== -1) {
          users[index] = updatedUser;
          this.adminUsers.set([...users]);
          this.applyFilters();
        }
      },
      error: (error) => {
        console.error('Error updating user status:', error);
      }
    });
  }

  deleteUser(user: AdminUser) {
    if (confirm(`Are you sure you want to delete user "${user.username}"?`)) {
      this.carRentalService.deleteAdminUser(user.id).subscribe({
        next: (success) => {
          if (success) {
            this.loadAdminUsers();
          }
        },
        error: (error) => {
          console.error('Error deleting user:', error);
        }
      });
    }
  }

  switchTab(tab: 'users' | 'logs') {
    this.selectedTab.set(tab);
  }

  refreshUsers() {
    this.loadAdminUsers();
  }

  // refreshLogs removed with activity logs feature hidden

  formatDate(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  }

  getTimeSince(date: Date): string {
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInDays > 0) {
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    } else if (diffInHours > 0) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    } else {
      const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
      return `${diffInMinutes} minute${diffInMinutes > 1 ? 's' : ''} ago`;
    }
  }
}
