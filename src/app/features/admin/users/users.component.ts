import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [CommonModule],
  templateUrl: `./users.component.html`,
  styleUrl: `./users.component.css`
})
export class UsersComponent {
  constructor(public authService: AuthService) {}
}
