import { PriceTier } from '../../../shared/models/product.model';

export type VendorProductStatus = 'active' | 'hidden';

export interface VendorProduct {
  id: string;
  sku: string;
  name: string;
  category: string;
  unit: string;
  basePrice: number;
  priceTiers: PriceTier[];
  onHandQty: number;      // Tồn vật lý trong kho
  reservedQty: number;    // Lượng đã cam kết giữ cho đơn hàng (Fix VND-07)
  availableQty: number;   // Lượng có thể bán = OnHand - Reserved
  minOrderQty: number;    // MOQ
  status: VendorProductStatus;
  featuredImage: string;
  images: string[];
  certificationName: string;
  certificationProofUrl?: string;
  origin: string;
  description: string;
  updatedAt: string;
}

export type VendorOrderStatus = 
  | 'pending_confirmation' 
  | 'confirmed' 
  | 'preparing' 
  | 'shipped' 
  | 'delivered' 
  | 'rejected';

export interface OrderTimelineEvent {
  title: string;
  description: string;
  timestamp: string;
  actor: string;
  isReject?: boolean;
}

export interface VendorOrderItem {
  productId: string;
  productName: string;
  sku: string;
  unit: string;
  quantity: number;
  unitPrice: number;
  amount: number;
  image: string;
}

export interface VendorOrder {
  id: string; // e.g. "VO-2048"
  parentOrderId: string; // e.g. "PO-20260917-8831"
  buyerName: string; // e.g. "Nguyễn Minh Anh" (Fix VND-05)
  buyerCompany: string; // e.g. "HTX Bách Hóa Xanh"
  buyerPhone: string; // e.g. "090 123 4567" (Fix VND-05)
  deliveryAddress: string; // e.g. "128 Đường số 7, P. Bình Trị Đông B, Q. Bình Tân, TP. HCM"
  receivingWindow: string; // e.g. "03:30 - 06:00 sáng mai"
  confirmationDeadline: string; // e.g. "Còn 2 giờ 15 phút (trước 12:00 hôm nay)" (Fix VND-05)
  status: VendorOrderStatus;
  statusLabel: string;
  statusBadgeClass: string;
  items: VendorOrderItem[];
  subtotal: number;
  shippingFee: number;
  totalAmount: number;
  rejectionReason?: string; // Fix VND-04
  rejectedAt?: string;
  trackingCode?: string;
  deliveryNotes?: string;
  timeline: OrderTimelineEvent[]; // Fix VND-02, VND-04
  createdAt: string;
}

export type InventoryMovementType = 
  | 'inbound' 
  | 'outbound_order' 
  | 'adjustment_spoilage' 
  | 'adjustment_audit';

export interface InventoryMovement {
  id: string;
  productId: string;
  productName: string;
  type: InventoryMovementType;
  typeLabel: string;
  quantityChange: number; // + or -
  balanceAfter: number;
  referenceDoc: string; // e.g. "Phiếu nhập PN-091", "Đơn hàng VO-2048"
  note: string;
  timestamp: string;
}

export interface HarvestPlan {
  id: string;
  productId: string;
  productName: string;
  harvestDate: string; // e.g. "2026-11-05"
  expectedQty: number;
  unit: string;
  confidence: 'high' | 'medium' | 'estimated';
  confidenceLabel: string;
  alreadyCommittedQty: number; // Đã cam kết cho đơn đặt trước
  availableForPreorder: number;
  notes?: string;
}

export interface VendorSubscriptionProposal {
  id: string; // e.g. "DK-032"
  buyerCompany: string;
  buyerContact: string;
  productName: string;
  frequency: string;
  quantityPerDelivery: number;
  unit: string;
  unitPrice: number;
  deliveryWindow: string;
  startDate: string;
  endDate: string; // Fix VND-16
  responseDeadline: string; // Fix VND-16
  status: 'pending' | 'accepted' | 'rejected' | 'counter_proposed';
  vendorProposedPrice?: number;
  vendorNotes?: string;
}

export interface VendorDisputeCase {
  id: string; // e.g. "DISP-20260915-01"
  orderId: string;
  subOrderId: string;
  buyerCompany: string;
  productName: string;
  affectedQty: number;
  unit: string;
  issueDescription: string;
  requestedSolution: string;
  claimAmount: number;
  responseDeadline: string; // Fix VND-17
  proofImages: string[]; // Fix VND-17
  vendorReply?: string;
  vendorRepliedAt?: string;
  status: 'pending_vendor' | 'vendor_replied' | 'admin_resolved';
  statusLabel: string;
  adminResolutionNote?: string;
  createdAt: string;
}

export interface SettlementPeriod {
  periodId: string; // e.g. "Kỳ 09/2026 (16/09 - 30/09)"
  periodType: 'bi-weekly' | 'monthly';
  totalGrossSales: number;
  platformFeeRate: number; // 5% (Fix VND-18)
  platformFeeAmount: number;
  escrowReserveRate: number; // 5% dự phòng rủi ro nông sản
  escrowReserveAmount: number;
  resolvedDisputeDeductions: number; // Đồng bộ khiếu nại (Fix VND-17)
  netPayoutAmount: number;
  status: 'settled' | 'pending_approval' | 'processing';
  statusLabel: string;
  payoutDueDate: string;
}

export type BusinessType = 'household' | 'enterprise' | 'individual';

export interface VendorKycProfile {
  businessType: BusinessType;
  farmDisplayName: string; // Fix VND-24: tên trang trại hiển thị kèm đếm ký tự
  legalName: string;       // Tên hộ KD hoặc tên doanh nghiệp
  registrationNo: string;  // Số giấy chứng nhận đăng ký HKD / MST DN
  taxCode: string;
  representativeName: string;
  representativeIdCard: string;
  province: string;
  address: string;
  contactPerson: string;   // Fix VND-27
  contactPhone: string;
  contactEmail: string;
  verificationCodeSent?: boolean;
  certDocumentName?: string;
  certDocumentUrl?: string;
  isApproved: boolean;
  approvalStatus: 'approved' | 'pending' | 'requires_update' | 'draft';
  approvalStatusLabel: string;
}

