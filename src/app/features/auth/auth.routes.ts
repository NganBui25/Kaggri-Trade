import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';

export const AUTH_ROUTES: Routes = [
  {
    path: 'login',
    component: LoginComponent,
    title: 'Đăng nhập · Kaggri-Trade'
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  }
];

