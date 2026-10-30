import { Component, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminAuthService } from '../../services/admin-auth.service';
import { AdminDataService } from '../../services/admin-data.service';
import { AuditLog, AdminRole } from '../../models/admin.model';
import { AdminForbiddenComponent } from '../../components/forbidden/forbidden.component';

@Component({
  selector: 'app-admin-audit',
  standalone: true,
  imports: [CommonModule, FormsModule, AdminForbiddenComponent],
  templateUrl: './audit.component.html',
  styleUrl: './audit.component.scss'
})
export class AdminAuditComponent {
  readonly auth = inject(AdminAuthService);
  readonly data = inject(AdminDataService);

  readonly canAccess = computed(() => this.auth.canAccessModule('audit'));
  readonly canExport = computed(() => this.auth.canPerformAction('audit', 'EXPORT_AUDIT'));

  // Filters (Fix ADM-40)
  searchQuery = signal<string>('');
  selectedRole = signal<string>('ALL');
  selectedActionType = signal<string>('ALL');

  // Audit Logs scoped by Admin Role (Fix ADM-R10)
  scopedAuditLogs = computed(() => {
    const currentRole = this.auth.currentRole();
    const all = this.data.auditLogs();

    if (currentRole === 'OPS_ADMIN') {
      return all.filter(l =>
        l.action.startsWith('KYC:') ||
        l.action.startsWith('VND_MGMT:') ||
        l.action.startsWith('BUY_MGMT:') ||
        l.action.startsWith('DISPUTE:') ||
        l.action.startsWith('MOD:') ||
        l.action.startsWith('CAT:') ||
        l.role === 'OPS_ADMIN'
      );
    }

    if (currentRole === 'FIN_ADMIN') {
      return all.filter(l =>
        l.action.startsWith('TX:') ||
        l.action.startsWith('REFUND:') ||
        l.action.startsWith('SETTLEMENT:') ||
        l.role === 'FIN_ADMIN'
      );
    }

    // Super Admin & Compliance Admin see everything
    return all;
  });

  // Filtered by user input
  filteredLogs = computed(() => {
    let list = this.scopedAuditLogs();

    const role = this.selectedRole();
    if (role !== 'ALL') {
      list = list.filter(l => l.role === role);
    }

    const actionType = this.selectedActionType();
    if (actionType !== 'ALL') {
      list = list.filter(l => l.action.startsWith(actionType));
    }

    const q = this.searchQuery().toLowerCase().trim();
    if (q) {
      list = list.filter(l =>
        l.id.toLowerCase().includes(q) ||
        l.actor.toLowerCase().includes(q) ||
        l.object.toLowerCase().includes(q) ||
        l.actionLabel.toLowerCase().includes(q) ||
        (l.reason && l.reason.toLowerCase().includes(q)) ||
        l.ip.includes(q)
      );
    }

    return list;
  });

  // Export CSV (Fix ADM-R11)
  onExportCsv(): void {
    const csvContent = this.data.exportAuditCsv();
    if (!csvContent) return;

    // Trigger browser download
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `kaggri-audit-log-${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}

