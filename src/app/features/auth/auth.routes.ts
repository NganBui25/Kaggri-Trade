import { Routes } from '@angular/router';
import { LoginComponent } from './pages/login/login.component';

export const AUTH_ROUTES: Routes = [
  {
    path: 'login',
    component: LoginComponent,
    title: 'Đăng nhập · Kaggri-Trade'
  },
  {
    path: 'register',
    loadComponent: () => import('./pages/register/register.component').then(m => m.RegisterComponent),
    title: 'Đăng ký tài khoản đối tác · Kaggri-Trade'
  },
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  }
];

