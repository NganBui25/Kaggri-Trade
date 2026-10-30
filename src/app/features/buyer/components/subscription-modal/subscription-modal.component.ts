import { Component, inject, signal, computed, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BuyerDataService } from '../../services/buyer-data.service';
import { Product, VendorSummary } from '../../../../shared/models/product.model';
import { PricePipe, NumberDotPipe } from '../../../../shared/pipes/price.pipe';

export interface SubscriptionFormData {
  id: string;
  vendorId: string;
  vendorName: string;
  vendorAvatar: string;
  productId: string;
  productName: string;
  productImage: string;
  frequency: string;
  quantityPerDelivery: number;
  unit: string;
  unitPrice: number;
  deliveryWindow: string;
  startDate: string;
  endDate: string;
  warehouseAddress: string;
  receiverContact: string;
  packagingNotes: string;
  estimatedMonthlyAmount: number;
  status: 'active';
  nextDeliveryDate: string;
}

@Component({
  selector: 'app-buyer-subscription-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, PricePipe, NumberDotPipe],
  templateUrl: './subscription-modal.component.html',
  styleUrl: './subscription-modal.component.scss'
})
export class BuyerSubscriptionModalComponent {
  private readonly buyerData = inject(BuyerDataService);

  // Events
  close = output<void>();
  submitPlan = output<SubscriptionFormData>();

  // Data lists
  vendors = signal<VendorSummary[]>([]);
  products = signal<Product[]>([]);

  // Form Signals
  selectedVendorId = signal<string>('v1');
  selectedProductId = signal<string>('p1');
  frequency = signal<string>('Thứ 2 & Thứ 5 hàng tuần');
  quantityPerDelivery = signal<number>(300);
  deliveryWindow = signal<string>('04:00 - 06:00 sáng');
  startDate = signal<string>('2026-11-05');
  contractDurationMonths = signal<number>(3);
  warehouseAddress = signal<string>('Kho Trung chuyển Bách Hóa Xanh, 128 Đường số 7, Phường Bình Trị Đông B, Quận Bình Tân, TP. Hồ Chí Minh');
  receiverName = signal<string>('Nguyễn Minh Anh');
  receiverPhone = signal<string>('090 123 4567');
  packagingNotes = signal<string>('Đóng bao lưới 25kg, xe tải lạnh nhiệt độ ≤ 8°C.');

  // Preset Frequencies
  readonly frequencyOptions = [
    { label: 'Thứ 2 & Thứ 5 hàng tuần (2 lần/tuần)', value: 'Thứ 2 & Thứ 5 hàng tuần', timesPerMonth: 8 },
    { label: 'Thứ 3 & Thứ 7 hàng tuần (2 lần/tuần)', value: 'Thứ 3 & Thứ 7 hàng tuần', timesPerMonth: 8 },
    { label: 'Thứ 2, 4, 6 hàng tuần (3 lần/tuần)', value: 'Thứ 2, Thứ 4, Thứ 6 hàng tuần', timesPerMonth: 12 },
    { label: 'Mỗi Thứ 2 đầu tuần (1 lần/tuần)', value: 'Mỗi Thứ 2 đầu tuần', timesPerMonth: 4 },
    { label: 'Giao hàng ngày (Sáng sớm 7 ngày/tuần)', value: 'Hàng ngày', timesPerMonth: 30 }
  ];

  // Preset Windows
  readonly windowOptions = [
    '03:30 - 06:00 sáng (Trước giờ mở cửa)',
    '05:00 - 07:00 sáng (Đầu giờ sáng)',
    '14:00 - 16:00 chiều (Nhập ca chiều)',
    '18:00 - 20:00 tối (Sau giờ đóng cửa)'
  ];

  // Computed Vendors Products
  availableProductsForVendor = computed(() => {
    return this.products().filter(p => p.vendorId === this.selectedVendorId());
  });

  // Selected Product Details
  currentProduct = computed(() => {
    return this.products().find(p => p.id === this.selectedProductId());
  });

  // Selected Vendor Details
  currentVendor = computed(() => {
    return this.vendors().find(v => v.id === this.selectedVendorId());
  });

  // Computed Tier Unit Price based on quantity
  calculatedUnitPrice = computed(() => {
    const prod = this.currentProduct();
    if (!prod) return 0;

    const qty = this.quantityPerDelivery();
    if (!prod.priceTiers || prod.priceTiers.length === 0) {
      return prod.basePrice;
    }

    // Find applicable tier
    const matched = prod.priceTiers.find(tier => {
      const gte = qty >= tier.minQty;
      const lte = tier.maxQty === null || qty <= tier.maxQty;
      return gte && lte;
    });

    return matched ? matched.unitPrice : prod.basePrice;
  });

  // Frequency Times per month
  currentTimesPerMonth = computed(() => {
    const opt = this.frequencyOptions.find(o => o.value === this.frequency());
    return opt ? opt.timesPerMonth : 8;
  });

  // Monthly Estimates
  estimatedMonthlyQuantity = computed(() => {
    return this.quantityPerDelivery() * this.currentTimesPerMonth();
  });

  estimatedPerDeliveryAmount = computed(() => {
    return this.quantityPerDelivery() * this.calculatedUnitPrice();
  });

  estimatedMonthlyTotalAmount = computed(() => {
    return this.estimatedPerDeliveryAmount() * this.currentTimesPerMonth();
  });

  // Computed End Date
  calculatedEndDate = computed(() => {
    if (!this.startDate()) return '';
    const parts = this.startDate().split('-');
    if (parts.length !== 3) return '';
    const d = new Date(Number(parts[0]), Number(parts[1]) - 1, Number(parts[2]));
    d.setMonth(d.getMonth() + this.contractDurationMonths());
    return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
  });

  formattedStartDate = computed(() => {
    if (!this.startDate()) return '';
    const parts = this.startDate().split('-');
    if (parts.length !== 3) return '';
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  });

  constructor() {
    this.buyerData.getVendors().subscribe(v => this.vendors.set(v));
    this.buyerData.getProducts().subscribe(p => {
      this.products.set(p);
      if (p.length > 0) {
        this.selectedVendorId.set(p[0].vendorId);
        this.selectedProductId.set(p[0].id);
      }
    });
  }

  onVendorChange(vendorId: string): void {
    this.selectedVendorId.set(vendorId);
    const list = this.products().filter(p => p.vendorId === vendorId);
    if (list.length > 0) {
      this.selectedProductId.set(list[0].id);
      this.quantityPerDelivery.set(Math.max(100, list[0].minOrderQty));
    }
  }

  onProductChange(prodId: string): void {
    this.selectedProductId.set(prodId);
    const p = this.products().find(item => item.id === prodId);
    if (p) {
      this.quantityPerDelivery.set(Math.max(100, p.minOrderQty));
    }
  }

  onClose(): void {
    this.close.emit();
  }

  onSubmit(): void {
    const prod = this.currentProduct();
    const vendor = this.currentVendor();
    if (!prod || !vendor) return;

    if (this.quantityPerDelivery() < prod.minOrderQty) {
      alert(`Khối lượng mỗi lần giao tối thiểu là ${prod.minOrderQty} ${prod.unit} theo quy định của nhà vườn.`);
      return;
    }

    const newSub: SubscriptionFormData = {
      id: 'SUB-2026-' + Math.floor(100 + Math.random() * 900),
      vendorId: vendor.id,
      vendorName: vendor.name,
      vendorAvatar: vendor.avatarCode,
      productId: prod.id,
      productName: prod.name,
      productImage: prod.featuredImage,
      frequency: this.frequency(),
      quantityPerDelivery: this.quantityPerDelivery(),
      unit: prod.unit,
      unitPrice: this.calculatedUnitPrice(),
      deliveryWindow: this.deliveryWindow(),
      startDate: this.formattedStartDate(),
      endDate: this.calculatedEndDate(),
      warehouseAddress: this.warehouseAddress(),
      receiverContact: `${this.receiverName()} • ${this.receiverPhone()}`,
      packagingNotes: this.packagingNotes(),
      estimatedMonthlyAmount: this.estimatedMonthlyTotalAmount(),
      status: 'active',
      nextDeliveryDate: this.formattedStartDate()
    };

    this.submitPlan.emit(newSub);
  }
}

