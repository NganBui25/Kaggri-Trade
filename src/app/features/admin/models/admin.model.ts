export type AdminRole = 'SUPER_ADMIN' | 'OPS_ADMIN' | 'FIN_ADMIN' | 'COMP_ADMIN';

export interface AdminUser {
  id: string;
  name: string;
  role: AdminRole;
  roleLabel: string;
  avatar: string;
  email: string;
  lastLogin?: string;
}

export type SlaStatus = 'on-track' | 'at-risk' | 'breached';

export interface KycRecord {
  id: string;
  vendorName: string;
  representative: string;
  taxCode: string;
  address: string;
  submittedAt: string;
  slaDeadline: string;
  slaHoursLeft: number; // Positive number; negative means breached
  slaStatus: SlaStatus;
  tier: 'BASIC' | 'STANDARD' | 'PREMIUM';
  documents: string[];
  priority: 'Bình thường' | 'Cao' | 'Khẩn';
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'NEEDS_DOC';
  statusLabel: string;
  rejectionReason?: string;
  requestedDocReason?: string;
  reviewedBy?: string;
  reviewedAt?: string;
}

export interface BusinessDocument {
  id: string;
  name: string;
  docNumber: string;
  issuedBy: string;
  issuedDate: string;
  expiryDate?: string;
  status: 'valid' | 'pending' | 'expired';
  statusLabel: string;
  fileName: string;
  fileSize: string;
  fileType: 'pdf' | 'img';
  fileUrl?: string;
  verifiedAt?: string;
}

export interface VendorAccount {
  id: string;
  company: string;
  tier: 'BASIC' | 'STANDARD' | 'PREMIUM';
  status: 'active' | 'suspended' | 'terminated' | 'pending_kyc';
  createdAt: string;
  lastActive: string;
  region: string;
  score: number | null;
  pendingOrdersCount: number;
  suspendReason?: string;
  terminatedReason?: string;
  taxCode?: string;
  businessType?: string;
  representative?: string;
  representativeRole?: string;
  phone?: string;
  email?: string;
  address?: string;
  bankAccount?: {
    bankName: string;
    accountNumber: string;
    accountHolder: string;
  };
  documents?: BusinessDocument[];
}

export interface BuyerAccount {
  id: string;
  company: string;
  type: string;
  status: 'active' | 'suspended';
  createdAt: string;
  lastActive: string;
  region: string;
  creditLimit: number;
  pendingOrdersCount: number;
  suspendReason?: string;
  taxCode?: string;
  businessType?: string;
  representative?: string;
  representativeRole?: string;
  phone?: string;
  email?: string;
  address?: string;
  bankAccount?: {
    bankName: string;
    accountNumber: string;
    accountHolder: string;
  };
  documents?: BusinessDocument[];
}

export type TransactionType =
  | 'ORDER_PAYMENT'
  | 'ESCROW_RELEASE'
  | 'ESCROW_HOLD'
  | 'COMMISSION'
  | 'REFUND_PARTIAL'
  | 'REFUND_FULL'
  | 'SETTLEMENT_PAYOUT';

export interface TransactionRecord {
  id: string;
  buyer: string;
  vendor: string;
  amount: number;
  type: TransactionType;
  typeLabel: string;
  status: 'success' | 'processing' | 'failed' | 'flagged';
  statusLabel: string;
  provider: 'VNPay' | 'MoMo' | 'Napas' | 'VietQR' | 'Stripe';
  createdAt: string;
  orderId?: string;
  reason?: string;
  webhookStatus?: 'delivered' | 'pending' | 'failed';
  webhookRetries?: number;
}

export type DisputeStatus =
  | 'OPENED'
  | 'AWAITING_VENDOR'
  | 'UNDER_REVIEW'
  | 'MORE_EVIDENCE_REQUIRED'
  | 'PENDING_REFUND_EXECUTION' // Ops approved refund; waiting for Finance execution (Rule D2)
  | 'RESOLVED_REFUND_FULL'
  | 'RESOLVED_REFUND_PARTIAL'
  | 'RESOLVED_REJECTED'
  | 'CLOSED';

export interface DisputeRecord {
  id: string;
  orderId: string;
  buyer: string;
  vendor: string;
  product: string;
  qty: number;
  affected: number;
  reason: string;
  description: string;
  status: DisputeStatus;
  statusLabel: string;
  slaDeadline: string;
  slaHoursLeft: number;
  slaStatus: SlaStatus;
  assignedTo: string | null;
  escrowAmount: number;
  unitPrice: number;
  alreadyRefunded: number;
  refundableAmount: number;
  evidenceBuyer: string[];
  evidenceVendor?: string[];
  openedAt: string;
  resolvedAt?: string;
  decision?: string;
  decisionReason?: string;
  proposedRefundAmount?: number;
}

export interface RefundRecord {
  id: string;
  disputeId: string;
  orderId: string;
  buyer: string;
  vendor: string;
  amount: number;
  status: 'PENDING_EXECUTION' | 'PROCESSING' | 'SUCCESS' | 'FAILED';
  statusLabel: string;
  gateway: string;
  retryCount: number;
  maxRetries: number;
  errorReason?: string;
  createdAt: string;
  executedAt?: string;
  executedBy?: string;
  decisionReason?: string;
}

export interface SettlementVendorRow {
  vendorId: string;
  name: string;
  grossGMV: number;
  refunds: number;
  commission: number; // 5% of (grossGMV - refunds)
  escrowReserve: number; // 5% of (grossGMV - refunds)
  adjustments: number;
  netPayout: number; // grossGMV - refunds - commission - escrowReserve + adjustments
}

export interface SettlementAdjustment {
  id: string;
  vendorId: string;
  vendorName: string;
  amount: number;
  reason: string;
  linkedPeriod: string;
  createdAt: string;
  createdBy: string;
}

export type SettlementStatus = 'DRAFT' | 'CALCULATED' | 'REVIEWED' | 'FINALIZED' | 'PAYING' | 'PAID' | 'FAILED';

export interface SettlementPeriod {
  id: string;
  period: string;
  cutOffDate: string;
  calcDate: string;
  payDate: string;
  status: SettlementStatus;
  statusLabel: string;
  vendors: SettlementVendorRow[];
  adjustments: SettlementAdjustment[];
}

export interface ModerationProduct {
  id: string;
  vendor: string;
  vendorId: string;
  product: string;
  flag: string;
  severity: 'Thấp' | 'Trung bình' | 'Cao' | 'Nghiêm trọng';
  status: 'PENDING' | 'APPROVED' | 'HIDDEN';
  statusLabel: string;
  reportedAt: string;
  reason?: string;
}

export interface ModerationReview {
  id: string;
  fromBuyer: string;
  toVendor: string;
  vendorId: string;
  rating: number;
  content: string;
  severity: 'Thấp' | 'Trung bình' | 'Cao' | 'Nghiêm trọng';
  status: 'PENDING' | 'APPROVED' | 'HIDDEN';
  statusLabel: string;
  reportedAt: string;
  reason?: string;
}

export interface CategoryItem {
  id: string;
  name: string;
  parent: string | null;
  parentName?: string;
  products: number;
  status: 'active' | 'disabled';
}

export interface UnitItem {
  id: string;
  name: string;
  symbol: string;
  status: 'active' | 'disabled';
}

export interface SystemConfigItem {
  key: string;
  label: string;
  value: any;
  unit: string;
  group: 'finance' | 'ops' | 'formula';
  groupLabel: string;
  category?: 'FINANCE' | 'OPS' | 'GENERAL';
  type?: 'number' | 'string' | 'boolean';
  description: string;
  impactScope: string;
}

export interface ConfigHistoryRecord {
  id: string;
  paramKey: string;
  paramLabel: string;
  oldValue: string;
  newValue: string;
  changedBy: string;
  changedAt: string;
  reason: string;
}

export interface AuditLog {
  id: string;
  actor: string;
  role: AdminRole;
  action: string;
  actionLabel: string;
  object: string;
  before: string;
  after: string;
  reason?: string;
  ip: string;
  createdAt: string;
}

export interface AdminNotification {
  id: string;
  title: string;
  detail: string;
  message?: string;
  type?: string;
  read: boolean;
  level: 'critical' | 'warning' | 'info';
  target: string;
  link?: string;
  targetRole?: AdminRole;
  roleTarget?: string;
  createdAt: string;
}

export interface RoleDefinition {
  id: string;
  code: AdminRole;
  name: string;
  description: string;
  users: { id: string; name: string }[];
  status: 'active' | 'disabled';
  permissions: {
    dashboard: 'FULL' | 'VIEW' | 'NONE';
    reports: 'FULL' | 'VIEW' | 'NONE';
    kyc: 'FULL' | 'VIEW' | 'NONE';
    accounts: 'FULL' | 'LIMITED' | 'VIEW' | 'NONE';
    transactions: 'FULL' | 'VIEW' | 'NONE';
    disputes: 'FULL' | 'VIEW' | 'NONE';
    refunds: 'FULL' | 'VIEW' | 'NONE';
    settlements: 'FULL' | 'VIEW' | 'NONE';
    moderation: 'FULL' | 'VIEW' | 'NONE';
    categories: 'FULL' | 'VIEW' | 'NONE';
    config: 'FULL' | 'VIEW' | 'NONE';
    rbac: 'FULL' | 'VIEW' | 'NONE';
    audit: 'FULL' | 'VIEW' | 'NONE';
  };
}

export interface AdminKpi {
  key: string;
  label: string;
  value: number;
  unit?: string;
  change: string;
  changeDir: 'up' | 'down';
  icon: string;
  category: 'ops' | 'fin' | 'general';
  targetModule?: string;
}
