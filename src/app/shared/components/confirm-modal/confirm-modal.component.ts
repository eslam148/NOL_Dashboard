import { Component, computed, inject, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConfirmService } from '../../services/confirm.service';
import { TranslationService } from '../../../core/services/translation.service';

@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="confirm-backdrop" *ngIf="isOpen()" (click)="onBackdrop($event)"></div>
    <div class="confirm-wrap" *ngIf="isOpen()" role="dialog" aria-modal="true" aria-labelledby="confirm-title" aria-describedby="confirm-desc">
      <div class="confirm-panel" [class.danger]="confirmBtnClass() === 'btn-danger'">
        <div class="confirm-header">
          <div class="confirm-icon" [class.error]="confirmBtnClass() === 'btn-danger'">
            <i class="bi" [ngClass]="confirmBtnClass() === 'btn-danger' ? 'bi-exclamation-triangle-fill' : 'bi-question-circle-fill'"></i>
          </div>
          <h3 class="confirm-title" id="confirm-title">{{ translatedTitle() }}</h3>
        </div>
        <div class="confirm-body" id="confirm-desc">
          <p class="confirm-message">{{ translatedMessage() }}</p>
        </div>
        <div class="confirm-footer">
          <button class="btn btn-secondary" (click)="cancel()">{{ translatedCancelText() }}</button>
          <button class="btn" [ngClass]="confirmBtnClass()" (click)="accept()">{{ translatedConfirmText() }}</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .confirm-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,.45); backdrop-filter: blur(2px); }
    .confirm-wrap { position: fixed; inset: 0; display: grid; place-items: center; padding: 1rem; z-index: 1000; }
    .confirm-panel { width: 100%; max-width: 520px; background: var(--white); border: 1px solid var(--border-light); border-radius: var(--radius-2xl); box-shadow: var(--shadow-xl); overflow: hidden; animation: pop-in .16s ease-out; }
    .confirm-panel.danger { border-color: var(--error-light); box-shadow: 0 20px 30px -10px rgba(220,38,38,.25), var(--shadow-md); }
    .confirm-header { display:flex; align-items:center; gap:.75rem; padding: 1rem 1.25rem; border-bottom: 1px solid var(--border-light); }
    .confirm-icon { width: 2.25rem; height: 2.25rem; border-radius: var(--radius-full); display:flex; align-items:center; justify-content:center; background: var(--gray-100); color: var(--text-secondary); }
    .confirm-icon.error { background: var(--error-light); color: var(--error-dark); }
    .confirm-title { margin:0; font-size: 1.125rem; font-weight: 600; color: var(--text-primary); }
    .confirm-body { padding: 1rem 1.25rem; }
    .confirm-message { color: var(--text-primary); }
    .confirm-footer { padding: .75rem 1.25rem; border-top: 1px solid var(--border-light); display:flex; gap:.5rem; justify-content:flex-end; }
    .btn-danger { background: var(--error); color: var(--white); border-color: var(--error); }
    .btn-danger:hover { background: var(--error-dark); }
    .btn-primary { background: var(--brand-primary); color: var(--gray-900); border-color: var(--brand-primary); }
    @keyframes pop-in { from { transform: translateY(8px) scale(.98); opacity: 0; } to { transform: translateY(0) scale(1); opacity: 1; } }
    @media (max-width: 480px) { .confirm-panel { max-width: 100%; border-radius: var(--radius-xl); } .confirm-footer { flex-direction: column-reverse; } .confirm-header { align-items: flex-start; } }
  `]
})
export class ConfirmModalComponent {
  private confirm = inject(ConfirmService);
  private i18n = inject(TranslationService);

  isOpen = computed(() => !!this.confirm.dialog());
  title = computed(() => this.confirm.dialog()?.options.title || 'Confirm Action');
  message = computed(() => this.confirm.dialog()?.options.message || 'Are you sure?');
  confirmText = computed(() => this.confirm.dialog()?.options.confirmText || 'common.confirm');
  cancelText = computed(() => this.confirm.dialog()?.options.cancelText || 'common.cancel');
  confirmBtnClass = computed(() => {
    const variant = this.confirm.dialog()?.options.variant || 'danger';
    return variant === 'danger' ? 'btn-danger' : 'btn-primary';
  });

  // Translated outputs (safe if plain text is provided; unknown keys fall back)
  translatedTitle = computed(() => this.i18n.translate(this.title() as string));
  translatedMessage = computed(() => this.i18n.translate(this.message() as string));
  translatedConfirmText = computed(() => this.i18n.translate(this.confirmText() as string));
  translatedCancelText = computed(() => this.i18n.translate(this.cancelText() as string));

  onBackdrop(event: MouseEvent) {
    // Click on backdrop closes as cancel
    this.cancel();
  }

  accept() { this.confirm.accept(); }
  cancel() { this.confirm.cancel(); }

  @HostListener('document:keydown', ['$event'])
  onKeydown(e: KeyboardEvent) {
    if (!this.isOpen()) return;
    if (e.key === 'Escape') { e.preventDefault(); this.cancel(); }
    if (e.key === 'Enter') { e.preventDefault(); this.accept(); }
  }
}


