import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { AdminAuthService } from '../../services/admin-auth.service';

@Component({
  selector: 'app-admin-forbidden',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './forbidden.component.html',
  styleUrl: './forbidden.component.scss'
})
export class AdminForbiddenComponent {
  private readonly auth = inject(AdminAuthService);

  @Input() moduleName: string = 'Trang này';

  readonly currentAdmin = this.auth.currentAdmin;

  switchToSuperAdmin(): void {
    this.auth.switchRole('SUPER_ADMIN');
  }
}

