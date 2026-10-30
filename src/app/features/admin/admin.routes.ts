import { Routes } from '@angular/router';
import { AdminLayoutComponent } from './components/admin-layout/admin-layout.component';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    component: AdminLayoutComponent,
    children: [
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      },
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./pages/dashboard/dashboard.component').then(m => m.AdminDashboardComponent)
      },
      {
        path: 'reports',
        loadComponent: () =>
          import('./pages/reports/reports.component').then(m => m.AdminReportsComponent)
      },
      {
        path: 'kyc',
        loadComponent: () =>
          import('./pages/kyc/kyc.component').then(m => m.AdminKycComponent)
      },
      {
        path: 'accounts-vendor',
        loadComponent: () =>
          import('./pages/accounts-vendor/accounts-vendor.component').then(m => m.AdminAccountsVendorComponent)
      },
      {
        path: 'accounts/vendors',
        redirectTo: 'accounts-vendor',
        pathMatch: 'full'
      },
      {
        path: 'accounts-buyer',
        loadComponent: () =>
          import('./pages/accounts-buyer/accounts-buyer.component').then(m => m.AdminAccountsBuyerComponent)
      },
      {
        path: 'accounts/buyers',
        redirectTo: 'accounts-buyer',
        pathMatch: 'full'
      },
      {
        path: 'transactions',
        loadComponent: () =>
          import('./pages/transactions/transactions.component').then(m => m.AdminTransactionsComponent)
      },
      {
        path: 'disputes',
        loadComponent: () =>
          import('./pages/disputes/disputes.component').then(m => m.AdminDisputesComponent)
      },
      {
        path: 'refunds',
        loadComponent: () =>
          import('./pages/refunds/refunds.component').then(m => m.AdminRefundsComponent)
      },
      {
        path: 'settlements',
        loadComponent: () =>
          import('./pages/settlements/settlements.component').then(m => m.AdminSettlementsComponent)
      },
      {
        path: 'moderation',
        loadComponent: () =>
          import('./pages/moderation/moderation.component').then(m => m.AdminModerationComponent)
      },
      {
        path: 'categories',
        loadComponent: () =>
          import('./pages/categories/categories.component').then(m => m.AdminCategoriesComponent)
      },
      {
        path: 'config',
        loadComponent: () =>
          import('./pages/config/config.component').then(m => m.AdminConfigComponent)
      },
      {
        path: 'rbac',
        loadComponent: () =>
          import('./pages/rbac/rbac.component').then(m => m.AdminRbacComponent)
      },
      {
        path: 'audit',
        loadComponent: () =>
          import('./pages/audit/audit.component').then(m => m.AdminAuditComponent)
      },
      {
        path: 'notifications',
        loadComponent: () =>
          import('./pages/notifications/notifications.component').then(m => m.AdminNotificationsComponent)
      },
      {
        path: 'forbidden',
        loadComponent: () =>
          import('./components/forbidden/forbidden.component').then(m => m.AdminForbiddenComponent)
      },
      {
        path: '**',
        redirectTo: 'dashboard'
      }
    ]
  }
];
