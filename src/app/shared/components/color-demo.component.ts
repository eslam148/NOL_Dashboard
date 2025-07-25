import { Component } from '@angular/core';

@Component({
  selector: 'app-color-demo',
  standalone: true,
  template: `
    <div class="color-demo">
      <h2 class="text-primary">NOL Dashboard Color System Demo</h2>
      
      <!-- Color Swatches -->
      <section class="color-section">
        <h3 class="text-secondary">Primary Colors</h3>
        <div class="color-grid">
          <div class="color-swatch bg-yellow">
            <span class="text-dark">#E4B63D</span>
            <small class="text-dark">Primary Yellow</small>
          </div>
          <div class="color-swatch bg-cream">
            <span class="text-dark">#FEFCE8</span>
            <small class="text-dark">Primary Cream</small>
          </div>
          <div class="color-swatch bg-primary">
            <span class="text-dark">#FFFFFF</span>
            <small class="text-dark">Primary White</small>
          </div>
          <div class="color-swatch bg-dark">
            <span class="text-light">#1E1E1E</span>
            <small class="text-light">Primary Dark</small>
          </div>
          <div class="color-swatch bg-gray">
            <span class="text-light">#414042</span>
            <small class="text-light">Primary Gray</small>
          </div>
        </div>
      </section>

      <!-- Button Examples -->
      <section class="color-section">
        <h3 class="text-secondary">Button Styles</h3>
        <div class="button-grid">
          <button class="btn btn-primary">Primary Button</button>
          <button class="btn btn-secondary">Secondary Button</button>
          <button class="btn btn-dark">Dark Button</button>
        </div>
      </section>

      <!-- Card Examples -->
      <section class="color-section">
        <h3 class="text-secondary">Card Components</h3>
        <div class="card-grid">
          <div class="card">
            <h4 class="text-primary">Default Card</h4>
            <p class="text-secondary">This is a default card with the standard color scheme.</p>
          </div>
          <div class="card bg-secondary">
            <h4 class="text-primary">Secondary Card</h4>
            <p class="text-secondary">This card uses the secondary background color.</p>
          </div>
        </div>
      </section>

      <!-- Form Examples -->
      <section class="color-section">
        <h3 class="text-secondary">Form Elements</h3>
        <div class="form-demo">
          <input type="text" class="form-input" placeholder="Enter your text here">
          <input type="email" class="form-input" placeholder="Enter your email">
        </div>
      </section>
    </div>
  `,
  styles: [`
    .color-demo {
      padding: 2rem;
      max-width: 1200px;
      margin: 0 auto;
    }

    .color-section {
      margin-bottom: 3rem;
    }

    .color-section h3 {
      margin-bottom: 1rem;
      font-size: 1.25rem;
      font-weight: 600;
    }

    .color-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin-bottom: 2rem;
    }

    .color-swatch {
      padding: 2rem 1rem;
      border-radius: 0.5rem;
      text-align: center;
      border: 1px solid var(--border-light);
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .color-swatch span {
      font-weight: 600;
      font-size: 1rem;
    }

    .color-swatch small {
      font-size: 0.875rem;
      opacity: 0.8;
    }

    .button-grid {
      display: flex;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .card-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 1rem;
    }

    .card h4 {
      margin: 0 0 0.5rem 0;
      font-size: 1.125rem;
      font-weight: 600;
    }

    .card p {
      margin: 0;
      line-height: 1.5;
    }

    .form-demo {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      max-width: 400px;
    }

    @media (max-width: 768px) {
      .color-demo {
        padding: 1rem;
      }
      
      .color-grid {
        grid-template-columns: 1fr;
      }
      
      .button-grid {
        flex-direction: column;
        align-items: flex-start;
      }
    }
  `]
})
export class ColorDemoComponent {}
