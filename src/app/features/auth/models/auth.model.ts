import { UserRole } from '../../../core/models/role.model';

export interface LoginFormState {
  email: string;
  password: string;
  role: UserRole;
  rememberMe: boolean;
}

export interface MockAccount {
  role: UserRole;
  name: string;
  org: string;
  email: string;
  password: string;
  badge: string;
  description: string;
}

export const MOCK_ACCOUNTS: MockAccount[] = [
  {
    role: 'buyer',
    name: 'Trần Minh Đức',
    org: 'HTX Bách Hóa Xanh (Bên Mua)',
    email: 'buyer@bachhoaxanh.vn',
    password: 'password123',
    badge: 'Người mua B2B',
    description: 'Tài khoản thu mua nông sản số lượng lớn, theo dõi đơn giao và thanh toán Escrow.'
  },
  {
    role: 'vendor',
    name: 'Nguyễn Văn Nông',
    org: 'Trang Trại HTX Lạc Dương (Bên Bán)',
    email: 'vendor@lacduongfarm.vn',
    password: 'password123',
    badge: 'Người bán / Nhà vườn',
    description: 'Chủ hộ kinh doanh nông sản Đà Lạt đã xác minh chứng nhận an toàn, quản lý kho & lô hàng.'
  },
  {
    role: 'admin',
    name: 'Võ Thành Admin',
    org: 'Ban Quản Trị Hệ Thống Kaggri-Trade',
    email: 'admin@kaggritrade.vn',
    password: 'password123',
    badge: 'Quản trị viên',
    description: 'Duyệt hồ sơ hộ kinh doanh, xử lý khiếu nại chất lượng nông sản và kiểm soát đối soát.'
  }
];

