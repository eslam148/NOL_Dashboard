import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';
import { TranslatePipe } from '../../../shared/pipes/translate.pipe';
import { LanguageSwitcherComponent } from '../../../shared/components/language-switcher/language-switcher.component';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule, TranslatePipe, LanguageSwitcherComponent],
  templateUrl: `./users.component.html`
})
export class UsersComponent {
  constructor(public authService: AuthService) {}
}
