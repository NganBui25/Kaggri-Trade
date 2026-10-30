import { Routes } from '@angular/router';
import { StorefrontLayoutComponent } from '../../layouts/storefront-layout/storefront-layout.component';
import { CatalogComponent } from './pages/catalog/catalog.component';
import { ProductDetailComponent } from './pages/product-detail/product-detail.component';
import { CartComponent } from './pages/cart/cart.component';
import { CheckoutComponent } from './pages/checkout/checkout.component';
import { OrdersComponent } from './pages/orders/orders.component';
import { DisputeComponent } from './pages/dispute/dispute.component';
import { SubscriptionsComponent } from './pages/subscriptions/subscriptions.component';
import { ProfileComponent } from './pages/profile/profile.component';

export const BUYER_ROUTES: Routes = [
  {
    path: '',
    component: StorefrontLayoutComponent,
    children: [
      {
        path: 'catalog',
        component: CatalogComponent,
        title: 'Sàn Nông Sản · Kaggri-Trade'
      },
      {
        path: 'product/:id',
        component: ProductDetailComponent,
        title: 'Chi Tiết Nông Sản · Kaggri-Trade'
      },
      {
        path: 'cart',
        component: CartComponent,
        title: 'Giỏ Hàng Người Mua · Kaggri-Trade'
      },
      {
        path: 'checkout',
        component: CheckoutComponent,
        title: 'Thanh Toán & Đặt Hàng · Kaggri-Trade'
      },
      {
        path: 'orders',
        component: OrdersComponent,
        title: 'Đơn Mua Của Tôi · Kaggri-Trade'
      },
      {
        path: 'dispute',
        component: DisputeComponent,
        title: 'Khiếu Nại & Tranh Chấp · Kaggri-Trade'
      },
      {
        path: 'subscriptions',
        component: SubscriptionsComponent,
        title: 'Đơn Giao Định Kỳ · Kaggri-Trade'
      },
      {
        path: 'profile',
        component: ProfileComponent,
        title: 'Hồ Sơ Doanh Nghiệp · Kaggri-Trade'
      },
      {
        path: '',
        redirectTo: 'catalog',
        pathMatch: 'full'
      }
    ]
  }
];
