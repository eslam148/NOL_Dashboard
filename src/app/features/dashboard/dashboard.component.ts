import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="dashboard-container">
      <header class="dashboard-header">
        <div class="header-content">
          <h1 class="text-primary">NOL Dashboard</h1>
          <div class="user-menu">
            <div class="user-info">
              <span class="text-secondary">Welcome, </span>
              <strong class="text-primary">{{ authService.currentUser()?.fullName }}</strong>
              <span class="user-role bg-accent text-dark">{{ authService.currentUser()?.role }}</span>
            </div>
            <button class="btn btn-secondary" (click)="logout()">
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main class="dashboard-main">
        <div class="dashboard-grid">
          <!-- User Info Card -->
          <div class="card user-card">
            <h3 class="text-primary">User Information</h3>
            <div class="user-details">
              <p><strong>Email:</strong> {{ authService.currentUser()?.email }}</p>
              <p><strong>Role:</strong> {{ authService.currentUser()?.role }}</p>
              <p><strong>User ID:</strong> {{ authService.currentUser()?.id }}</p>
            </div>
          </div>

          <!-- Permissions Card -->
          <div class="card permissions-card">
            <h3 class="text-primary">Your Permissions</h3>
            <div class="permissions-list">
              @for (permission of authService.currentUser()?.permissions; track permission) {
                <span class="permission-badge bg-secondary text-dark">{{ permission }}</span>
              }
            </div>
          </div>

          <!-- Quick Actions Card -->
          <div class="card actions-card">
            <h3 class="text-primary">Quick Actions</h3>
            <div class="action-buttons">
              <a routerLink="/car-rental" class="btn btn-primary">
                <i class="bi bi-car-front"></i>
                Car Rental System
              </a>
              @if (authService.hasPermission('read')) {
                <button class="btn btn-primary">View Reports</button>
              }
              @if (authService.hasPermission('write')) {
                <button class="btn btn-primary">Create Content</button>
              }
              @if (authService.hasPermission('manage_users')) {
                <button class="btn btn-primary">Manage Users</button>
              }
              @if (authService.hasPermission('view_analytics')) {
                <button class="btn btn-primary">View Analytics</button>
              }
            </div>
          </div>

          <!-- Role-based Content -->
          @if (authService.hasRole('admin')) {
            <div class="card admin-card">
              <h3 class="text-primary">Admin Panel</h3>
              <p class="text-secondary">You have administrative privileges.</p>
              <div class="admin-actions">
                <button class="btn btn-dark">System Settings</button>
                <button class="btn btn-dark">User Management</button>
                <button class="btn btn-dark">Security Logs</button>
              </div>
            </div>
          }

          @if (authService.hasRole('manager')) {
            <div class="card manager-card">
              <h3 class="text-primary">Manager Tools</h3>
              <p class="text-secondary">Access your management tools and reports.</p>
              <div class="manager-actions">
                <button class="btn btn-secondary">Team Reports</button>
                <button class="btn btn-secondary">Performance Metrics</button>
              </div>
            </div>
          }

          <!-- Stats Card -->
          <div class="card stats-card">
            <h3 class="text-primary">Dashboard Stats</h3>
            <div class="stats-grid">
              <div class="stat-item">
                <div class="stat-value text-accent">42</div>
                <div class="stat-label text-secondary">Total Items</div>
              </div>
              <div class="stat-item">
                <div class="stat-value text-accent">18</div>
                <div class="stat-label text-secondary">Active Projects</div>
              </div>
              <div class="stat-item">
                <div class="stat-value text-accent">7</div>
                <div class="stat-label text-secondary">Pending Tasks</div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  `,
  styles: [`
    .dashboard-container {
      min-height: 100vh;
      background-color: var(--background-secondary);
    }

    .dashboard-header {
      background-color: var(--background-primary);
      border-bottom: 1px solid var(--border-light);
      padding: 1rem 0;
      box-shadow: 0 2px 4px var(--shadow-light);
    }

    .header-content {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 2rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .header-content h1 {
      margin: 0;
      font-size: 1.75rem;
      font-weight: 700;
      color: var(--primary-yellow);
    }

    .user-menu {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .user-role {
      padding: 0.25rem 0.75rem;
      border-radius: 1rem;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
    }

    .dashboard-main {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
    }

    .dashboard-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1.5rem;
    }

    .card {
      background-color: var(--background-primary);
      border: 1px solid var(--border-light);
      border-radius: 0.75rem;
      padding: 1.5rem;
      box-shadow: 0 2px 8px var(--shadow-light);
      transition: box-shadow 0.2s ease;
    }

    .card:hover {
      box-shadow: 0 4px 12px var(--shadow-medium);
    }

    .card h3 {
      margin: 0 0 1rem 0;
      font-size: 1.25rem;
      font-weight: 600;
    }

    .user-details p {
      margin: 0.5rem 0;
      line-height: 1.5;
    }

    .permissions-list {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }

    .permission-badge {
      padding: 0.375rem 0.75rem;
      border-radius: 0.5rem;
      font-size: 0.875rem;
      font-weight: 500;
    }

    .action-buttons,
    .admin-actions,
    .manager-actions {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .action-buttons .btn,
    .admin-actions .btn,
    .manager-actions .btn {
      justify-self: start;
      width: fit-content;
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
      gap: 1rem;
    }

    .stat-item {
      text-align: center;
    }

    .stat-value {
      font-size: 2rem;
      font-weight: 700;
      line-height: 1;
    }

    .stat-label {
      font-size: 0.875rem;
      margin-top: 0.25rem;
    }

    @media (max-width: 768px) {
      .header-content {
        padding: 0 1rem;
        flex-direction: column;
        gap: 1rem;
        text-align: center;
      }

      .user-menu {
        flex-direction: column;
        gap: 0.75rem;
      }

      .dashboard-main {
        padding: 1rem;
      }

      .dashboard-grid {
        grid-template-columns: 1fr;
      }

      .action-buttons,
      .admin-actions,
      .manager-actions {
        flex-direction: row;
        flex-wrap: wrap;
      }

      .stats-grid {
        grid-template-columns: repeat(3, 1fr);
      }
    }

    @media (max-width: 480px) {
      .user-info {
        flex-direction: column;
        text-align: center;
      }

      .stats-grid {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class DashboardComponent {
  constructor(public authService: AuthService) {}

  logout(): void {
    this.authService.logout();
  }
}
