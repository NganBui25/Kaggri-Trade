import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES)
  },
  {
    path: 'buyer',
    loadChildren: () => import('./features/buyer/buyer.routes').then(m => m.BUYER_ROUTES)
  },
  {
    path: 'vendor',
    loadChildren: () => import('./features/vendor/vendor.routes').then(m => m.VENDOR_ROUTES)
  },
  {
    path: 'admin',
    loadChildren: () => import('./features/admin/admin.routes').then(m => m.ADMIN_ROUTES)
  },
  {
    path: '',
    redirectTo: 'buyer/catalog',
    pathMatch: 'full'
  },
  {
    path: '**',
    redirectTo: 'buyer/catalog'
  }
];
