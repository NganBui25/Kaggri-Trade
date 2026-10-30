import { Routes } from '@angular/router';
import { VendorLayoutComponent } from '../../layouts/vendor-layout/vendor-layout.component';

export const VENDOR_ROUTES: Routes = [
  {
    path: '',
    component: VendorLayoutComponent,
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./pages/dashboard/dashboard.component').then(m => m.VendorDashboardComponent)
      },
      {
        path: 'products',
        loadComponent: () => import('./pages/products/products.component').then(m => m.VendorProductsComponent)
      },
      {
        path: 'products/new',
        loadComponent: () => import('./pages/product-edit/product-edit.component').then(m => m.VendorProductEditComponent)
      },
      {
        path: 'products/edit/:id',
        loadComponent: () => import('./pages/product-edit/product-edit.component').then(m => m.VendorProductEditComponent)
      },
      {
        path: 'orders',
        loadComponent: () => import('./pages/orders/orders.component').then(m => m.VendorOrdersComponent)
      },
      {
        path: 'inventory',
        loadComponent: () => import('./pages/inventory/inventory.component').then(m => m.VendorInventoryComponent)
      },
      {
        path: 'supply-plan',
        loadComponent: () => import('./pages/supply-plan/supply-plan.component').then(m => m.VendorSupplyPlanComponent)
      },
      {
        path: 'subscriptions',
        loadComponent: () => import('./pages/subscriptions/subscriptions.component').then(m => m.VendorSubscriptionsComponent)
      },
      {
        path: 'disputes',
        loadComponent: () => import('./pages/disputes/disputes.component').then(m => m.VendorDisputesComponent)
      },
      {
        path: 'settlement',
        loadComponent: () => import('./pages/settlement/settlement.component').then(m => m.VendorSettlementComponent)
      },
      {
        path: 'onboarding',
        loadComponent: () => import('./pages/onboarding/onboarding.component').then(m => m.VendorOnboardingComponent)
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }
    ]
  }
];
