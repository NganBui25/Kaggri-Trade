export type UserRole = 'buyer' | 'vendor' | 'admin';

export interface RoleInfo {
  role: UserRole;
  label: string;
  subLabel: string;
  description: string;
  icon: string;
  badgeClass: string;
  defaultRedirect: string;
}

export const ROLE_DEFINITIONS: Record<UserRole, RoleInfo> = {
  buyer: {
    role: 'buyer',
    label: 'Người mua',
    subLabel: 'Doanh nghiệp / HTX / F&B',
    description: 'Mua sỉ nông sản trực tiếp từ nguồn sản xuất với chứng nhận an toàn, giá sỉ theo bậc và giao định kỳ.',
    icon: '🛒',
    badgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    defaultRedirect: '/buyer'
  },
  vendor: {
    role: 'vendor',
    label: 'Người bán',
    subLabel: 'Trang trại / HTX sản xuất',
    description: 'Quản lý nông sản, cập nhật lô thu hoạch, kho hàng, tiếp nhận đơn đặt trước và đối soát doanh thu.',
    icon: '🌾',
    badgeClass: 'bg-amber-100 text-amber-800 border-amber-200',
    defaultRedirect: '/vendor'
  },
  admin: {
    role: 'admin',
    label: 'Quản trị viên',
    subLabel: 'Vận hành & Giám sát',
    description: 'Xét duyệt hồ sơ KYC, xử lý tranh chấp nông sản, quản lý dòng tiền Escrow và cấu hình tham số hệ thống.',
    icon: '🛡️',
    badgeClass: 'bg-blue-100 text-blue-800 border-blue-200',
    defaultRedirect: '/admin'
  }
};

