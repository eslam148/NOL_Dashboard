import { Component, signal } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService, LoginCredentials } from '../../../core/services/auth.service';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { LanguageSwitcherComponent } from '../../../shared/components/language-switcher/language-switcher.component';
import { TranslationService } from '../../../core/services/translation.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe, LanguageSwitcherComponent],
  templateUrl: './login.component.html'
})
export class LoginComponent {
  loginForm: FormGroup;
  errorMessage = signal<string>('');
  showPassword = signal<boolean>(false);

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    public authService: AuthService,
    public translationService: TranslationService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  onSubmit(): void {
    if (this.loginForm.valid) {
      this.errorMessage.set('');
      
      const credentials: LoginCredentials = {
        email: this.loginForm.value.email,
        password: this.loginForm.value.password
      };

      this.authService.login(credentials).subscribe({
        next: () => {
          // Get return URL from query params or default to dashboard
          const returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
          this.router.navigate([returnUrl]);
        },
        error: (error) => {
          this.errorMessage.set(error.message || 'Login failed. Please try again.');
        }
      });
    } else {
      this.markFormGroupTouched();
    }
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.loginForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  togglePasswordVisibility(): void {
    this.showPassword.set(!this.showPassword());

    // إضافة تأثير بصري عند النقر
    const button = document.querySelector('.password-toggle-btn');
    if (button) {
      button.classList.add('clicked');
      setTimeout(() => {
        button.classList.remove('clicked');
      }, 200);
    }

    // تحديث حالة الحاوية
    const container = document.querySelector('.password-input-container');
    if (container) {
      if (this.showPassword()) {
        container.classList.add('password-visible');
      } else {
        container.classList.remove('password-visible');
      }
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.loginForm.controls).forEach(key => {
      const control = this.loginForm.get(key);
      control?.markAsTouched();
    });
  }
}
