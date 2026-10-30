import { UserRole } from './role.model';

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  phone?: string;
  avatarUrl?: string;
  organizationName?: string;
  businessLicenseNo?: string;
  isVerified?: boolean;
  createdAt?: string;
}

