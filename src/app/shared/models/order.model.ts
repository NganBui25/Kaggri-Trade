import { Product } from './product.model';

export interface CartItem {
  product: Product;
  quantity: number;
  selectedTierPrice: number;
  totalPrice: number;
  note?: string;
  isPreorder?: boolean;
  preorderDeliveryDate?: string;
}

export interface VendorCartGroup {
  vendorId: string;
  vendorName: string;
  vendorShortName: string;
  vendorAvatarCode: string;
  items: CartItem[];
  subtotal: number;
  shippingFee: number;
  total: number;
}

export type PaymentMethodId = 'vietqr' | 'va' | 'napas' | 'cod' | 'credit';

export interface PaymentMethod {
  id: PaymentMethodId;
  title: string;
  description: string;
  badge: string;
  isEligible: boolean;
  settlementType: 'PREPAID' | 'COD' | 'CREDIT';
  icon: string;
}

export type SubOrderStatus = 
  | 'pending_confirmation' 
  | 'confirmed' 
  | 'preparing' 
  | 'shipped' 
  | 'delivered' 
  | 'completed' 
  | 'rejected' 
  | 'cancelled'
  | 'disputed';

export interface SubOrder {
  id: string; // e.g. "VO-20260917-01"
  vendorId: string;
  vendorName: string;
  vendorShortName: string;
  vendorAvatarCode: string;
  status: SubOrderStatus;
  statusLabel: string;
  statusBadgeClass: string;
  items: {
    productName: string;
    sku: string;
    unit: string;
    quantity: number;
    unitPrice: number;
    amount: number;
    image: string;
  }[];
  subtotal: number;
  shippingFee: number;
  totalAmount: number;
  trackingCode?: string;
  estimatedDelivery?: string;
  deliveredAt?: string;
  rejectionReason?: string;
  notes?: string;
}

export interface BuyerOrder {
  id: string; // Parent Order ID e.g. "PO-20260917-8831"
  paymentId: string;
  createdAt: string;
  totalAmount: number;
  paymentMethod: PaymentMethodId;
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  deliveryAddress: {
    companyName: string;
    recipientName: string;
    phone: string;
    address: string;
    receivingWindow: string;
    deliveryNote?: string;
  };
  invoiceRequested: boolean;
  invoiceProfile?: {
    companyName: string;
    taxCode: string;
    billingAddress: string;
    invoiceEmail: string;
  };
  subOrders: SubOrder[];
}

export interface DisputeRecord {
  id: string;
  orderId: string;
  subOrderId: string;
  productName: string;
  affectedQty: number;
  unit: string;
  issueType: 'damaged' | 'spoiled' | 'missing' | 'quality_unmet' | 'wrong_item';
  issueLabel: string;
  requestedSolution: 'refund_partial' | 'refund_full' | 'redelivery' | 'credit';
  solutionLabel: string;
  status: 'pending' | 'vendor_reviewing' | 'admin_arbitrating' | 'resolved' | 'rejected';
  statusLabel: string;
  statusBadgeClass: string;
  evidenceImages: string[];
  description: string;
  refundAmount?: number;
  createdAt: string;
  resolvedAt?: string;
}

