export interface PriceTier {
  minQty: number;
  maxQty: number | null;
  unitPrice: number;
}

export interface ProductImage {
  id: string;
  src: string;
  icon?: string;
  label?: string;
  alt?: string;
  credit?: string;
}

export interface ProductQualityItem {
  key: string;
  value: string;
}

export interface VendorSummary {
  id: string;
  name: string;
  shortName: string;
  location: string;
  certification: string;
  status: 'verified' | 'pending' | 'unverified';
  avatarCode: string; // e.g. "LD", "DD" (Fix BUY-09)
  rating?: number;
  ordersFulfilled?: number;
}

export interface Product {
  id: string;
  vendorId: string;
  name: string;
  sku: string;
  category: string;
  unit: string;
  availableQty: number;
  minOrderQty: number; // MOQ
  basePrice: number;
  priceTiers: PriceTier[];
  images: ProductImage[];
  featuredImage: string;
  qualitySpecs: ProductQualityItem[];
  origin: string;
  harvestDate?: string;
  shelfLife?: string;
  description?: string;
  vendor?: VendorSummary;
}

