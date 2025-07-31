import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslationService, SupportedLanguage } from '../../../core/services/translation.service';
import { TranslatePipe } from '../../pipes/translate.pipe';

@Component({
  selector: 'app-language-switcher',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  template: `
    <div class="language-switcher">
      <button
        type="button"
        class="language-btn"
        [class.active]="translationService.getCurrentLanguage() === 'en'"
        (click)="switchLanguage('en')"
        [attr.aria-label]="'common.switchToEnglish' | translate"
      >
        <span class="flag-icon">🇺🇸</span>
        <span class="lang-text">EN</span>
      </button>
      
      <button
        type="button"
        class="language-btn"
        [class.active]="translationService.getCurrentLanguage() === 'ar'"
        (click)="switchLanguage('ar')"
        [attr.aria-label]="'common.switchToArabic' | translate"
      >
        <span class="flag-icon">🇸🇦</span>
        <span class="lang-text">العربية</span>
      </button>
    </div>
  `,
  styles: [`
    .language-switcher {
      display: flex;
      gap: 0.5rem;
      align-items: center;
    }

    .language-btn {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 0.75rem;
      border: 1px solid var(--border-medium);
      border-radius: var(--radius-lg);
      background: var(--white);
      color: var(--text-secondary);
      font-size: 0.875rem;
      font-weight: 500;
      cursor: pointer;
      transition: all var(--transition-fast);
      text-decoration: none;
    }

    .language-btn:hover {
      background: var(--gray-50);
      border-color: var(--border-dark);
      color: var(--text-primary);
    }

    .language-btn.active {
      background: var(--brand-primary);
      border-color: var(--brand-primary);
      color: var(--gray-900);
    }

    .language-btn:focus {
      outline: none;
      box-shadow: 0 0 0 3px rgba(228, 182, 61, 0.2);
    }

    .flag-icon {
      font-size: 1rem;
      line-height: 1;
    }

    .lang-text {
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.025em;
    }

    /* Mobile responsive */
    @media (max-width: 480px) {
      .language-switcher {
        gap: 0.25rem;
      }
      
      .language-btn {
        padding: 0.375rem 0.5rem;
        font-size: 0.75rem;
      }
      
      .lang-text {
        display: none;
      }
    }
  `]
})
export class LanguageSwitcherComponent {
  translationService = inject(TranslationService);

  switchLanguage(language: SupportedLanguage): void {
    this.translationService.setLanguage(language);
  }
}
