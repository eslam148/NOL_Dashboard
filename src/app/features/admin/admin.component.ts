import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: `./admin.component.html` ,
  styleUrl: `./admin.component.css`
})
export class AdminComponent {
  constructor(public authService: AuthService) {}
}
