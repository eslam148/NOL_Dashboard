import { Component, OnDestroy, signal, inject } from '@angular/core';
import { Router, RouterEvent, RouterOutlet, NavigationEnd, NavigationCancel, NavigationError } from '@angular/router';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { CarRentalService } from './core/services/car-rental.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnDestroy {
  protected readonly title = signal('Nol_Dashboard');
  private router = inject(Router);
  private carRentalService = inject(CarRentalService);
  private navSub: Subscription;

  constructor() {
    // Ensure any lingering global loading state is cleared on navigation changes
    this.navSub = this.router.events
      .pipe(filter((e: any) => e instanceof NavigationEnd || e instanceof NavigationCancel || e instanceof NavigationError))
      .subscribe(() => {
        try {
          // Clear service-level loading flag that can persist between routes
          (this.carRentalService as any).isLoading?.set?.(false);
        } catch {}
      });
  }

  ngOnDestroy() {
    this.navSub?.unsubscribe();
  }
}
