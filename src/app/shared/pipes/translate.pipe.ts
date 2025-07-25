import { Pipe, PipeTransform, inject, ChangeDetectorRef, OnDestroy } from '@angular/core';
import { TranslationService } from '../../core/services/translation.service';
import { effect } from '@angular/core';

@Pipe({
  name: 'translate',
  standalone: true,
  pure: false
})
export class TranslatePipe implements PipeTransform, OnDestroy {
  private translationService = inject(TranslationService);
  private cdr = inject(ChangeDetectorRef);
  private effectRef: any;

  constructor() {
    // Watch for language changes and trigger change detection
    this.effectRef = effect(() => {
      this.translationService.getCurrentLanguage();
      this.cdr.markForCheck();
    });
  }

  ngOnDestroy(): void {
    if (this.effectRef) {
      this.effectRef.destroy();
    }
  }

  transform(key: string): string {
    return this.translationService.translate(key);
  }
}
