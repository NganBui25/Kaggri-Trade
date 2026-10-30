import { Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { UserRole, ROLE_DEFINITIONS, RoleInfo } from '../../../../core/models/role.model';

@Component({
  selector: 'app-role-selector',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './role-selector.component.html',
  styleUrl: './role-selector.component.scss'
})
export class RoleSelectorComponent {
  readonly selectedRole = input.required<UserRole>();
  readonly roleChanged = output<UserRole>();

  readonly roles: RoleInfo[] = [
    ROLE_DEFINITIONS.buyer,
    ROLE_DEFINITIONS.vendor,
    ROLE_DEFINITIONS.admin
  ];

  selectRole(role: UserRole): void {
    if (this.selectedRole() !== role) {
      this.roleChanged.emit(role);
    }
  }
}

