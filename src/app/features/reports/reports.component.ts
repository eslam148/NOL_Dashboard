import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="reports-container">
      <div class="reports-header">
        <h1 class="text-primary">Reports & Analytics</h1>
        <p class="text-secondary">View detailed reports and analytics data</p>
      </div>

      <div class="reports-content">
        <div class="reports-grid">
          <div class="card">
            <h3 class="text-primary">Sales Report</h3>
            <div class="report-summary">
              <div class="summary-item">
                <span class="summary-value text-accent">$45,230</span>
                <span class="summary-label text-secondary">Total Revenue</span>
              </div>
              <div class="summary-item">
                <span class="summary-value text-accent">+12.5%</span>
                <span class="summary-label text-secondary">Growth</span>
              </div>
            </div>
            <button class="btn btn-primary">View Details</button>
          </div>

          <div class="card">
            <h3 class="text-primary">User Analytics</h3>
            <div class="report-summary">
              <div class="summary-item">
                <span class="summary-value text-accent">1,234</span>
                <span class="summary-label text-secondary">Active Users</span>
              </div>
              <div class="summary-item">
                <span class="summary-value text-accent">+8.3%</span>
                <span class="summary-label text-secondary">Monthly Growth</span>
              </div>
            </div>
            <button class="btn btn-primary">View Details</button>
          </div>

          <div class="card">
            <h3 class="text-primary">Performance Metrics</h3>
            <div class="report-summary">
              <div class="summary-item">
                <span class="summary-value text-accent">99.8%</span>
                <span class="summary-label text-secondary">Uptime</span>
              </div>
              <div class="summary-item">
                <span class="summary-value text-accent">1.2s</span>
                <span class="summary-label text-secondary">Avg Response</span>
              </div>
            </div>
            <button class="btn btn-primary">View Details</button>
          </div>

          @if (authService.hasRole('admin')) {
            <div class="card">
              <h3 class="text-primary">Admin Reports</h3>
              <p class="text-secondary">Advanced administrative reports and system analytics.</p>
              <div class="admin-reports">
                <button class="btn btn-secondary">System Logs</button>
                <button class="btn btn-secondary">Security Report</button>
                <button class="btn btn-secondary">Audit Trail</button>
              </div>
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .reports-container {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    .reports-header {
      margin-bottom: 2rem;
    }

    .reports-header h1 {
      margin: 0 0 0.5rem 0;
      font-size: 2rem;
      font-weight: 700;
    }

    .reports-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1.5rem;
    }

    .report-summary {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 1rem;
      margin-bottom: 1.5rem;
    }

    .summary-item {
      text-align: center;
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .summary-value {
      font-size: 1.5rem;
      font-weight: 700;
    }

    .summary-label {
      font-size: 0.875rem;
    }

    .admin-reports {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      margin-top: 1rem;
    }

    @media (max-width: 768px) {
      .reports-container {
        padding: 1rem;
      }

      .reports-grid {
        grid-template-columns: 1fr;
      }

      .report-summary {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class ReportsComponent {
  constructor(public authService: AuthService) {}
}
