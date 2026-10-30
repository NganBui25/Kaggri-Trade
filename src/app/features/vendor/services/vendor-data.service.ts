import { Injectable, signal, computed, inject } from '@angular/core';
import { 
  VendorProduct, 
  VendorOrder, 
  InventoryMovement, 
  HarvestPlan, 
  VendorSubscriptionProposal, 
  VendorDisputeCase, 
  SettlementPeriod, 
  VendorKycProfile 
} from '../models/vendor.model';
import { NotificationService } from '../../../core/services/notification.service';
import { StorageService } from '../../../core/services/storage.service';

@Injectable({
  providedIn: 'root'
})
export class VendorDataService {
  private readonly notification = inject(NotificationService);
  private readonly storage = inject(StorageService);

  private readonly STORAGE_PRODUCTS = 'kaggri_vendor_products';
  private readonly STORAGE_ORDERS = 'kaggri_vendor_orders';
  private readonly STORAGE_MOVEMENTS = 'kaggri_vendor_movements';
  private readonly STORAGE_HARVESTS = 'kaggri_vendor_harvests';
  private readonly STORAGE_SUBSCRIPTIONS = 'kaggri_vendor_subscriptions';
  private readonly STORAGE_DISPUTES = 'kaggri_vendor_disputes';
  private readonly STORAGE_KYC = 'kaggri_vendor_kyc';

  // Signals
  readonly products = signal<VendorProduct[]>(this.loadInitialProducts());
  readonly orders = signal<VendorOrder[]>(this.loadInitialOrders());
  readonly inventoryMovements = signal<InventoryMovement[]>(this.loadInitialMovements());
  readonly harvestPlans = signal<HarvestPlan[]>(this.loadInitialHarvestPlans());
  readonly subscriptions = signal<VendorSubscriptionProposal[]>(this.loadInitialSubscriptions());
  readonly disputes = signal<VendorDisputeCase[]>(this.loadInitialDisputes());
  readonly settlement = signal<SettlementPeriod>(this.loadInitialSettlement());
  readonly kycProfile = signal<VendorKycProfile>(this.loadInitialKyc());

  // Dynamic Pending Actions for Dashboard (Fix VND-09 & VND-11)
  readonly pendingOrdersCount = computed(() => {
    return this.orders().filter(o => o.status === 'pending_confirmation').length;
  });

  readonly pendingDisputesCount = computed(() => {
    return this.disputes().filter(d => d.status === 'pending_vendor').length;
  });

  readonly totalPendingTasksCount = computed(() => {
    return this.pendingOrdersCount() + this.pendingDisputesCount();
  });

  // Low stock products warning (Fix VND-10: Only active products, ignores hidden products with 0kg)
  readonly lowStockProducts = computed(() => {
    return this.products().filter(p => p.status === 'active' && p.availableQty <= 200);
  });

  // Dynamic next tasks list for Dashboard (Fix VND-09)
  readonly dynamicNextTasks = computed(() => {
    const tasks: { id: string; title: string; desc: string; type: 'order' | 'dispute'; link: string; badge: string }[] = [];

    // Pending orders
    this.orders()
      .filter(o => o.status === 'pending_confirmation')
      .forEach(o => {
        tasks.push({
          id: o.id,
          title: `Xác nhận đơn hàng ${o.id}`,
          desc: `${o.buyerCompany} đặt ${o.items.map(i => `${i.quantity} ${i.unit} ${i.productName}`).join(', ')} • Hạn: ${o.confirmationDeadline}`,
          type: 'order',
          link: '/vendor/orders',
          badge: 'Khẩn cấp'
        });
      });

    // Pending disputes
    this.disputes()
      .filter(d => d.status === 'pending_vendor')
      .forEach(d => {
        tasks.push({
          id: d.id,
          title: `Phản hồi khiếu nại ${d.id}`,
          desc: `${d.buyerCompany} báo ${d.affectedQty} ${d.unit} ${d.productName} ${d.issueDescription} • Hạn phản hồi: ${d.responseDeadline}`,
          type: 'dispute',
          link: '/vendor/disputes',
          badge: 'Cần giải quyết'
        });
      });

    return tasks;
  });

  // --- Initial Data Loaders ---

  private loadInitialProducts(): VendorProduct[] {
    const saved = this.storage.getItem<VendorProduct[]>(this.STORAGE_PRODUCTS);
    if (saved && saved.length > 0) return saved;

    return [
      {
        id: 'SP-101',
        sku: 'SKU-DALAT-CAB-001',
        name: 'Bắp cải sạch Đà Lạt VietGAP',
        category: 'Rau ăn lá',
        unit: 'kg',
        basePrice: 18500,
        priceTiers: [
          { minQty: 100, maxQty: 299, unitPrice: 18500 },
          { minQty: 300, maxQty: 999, unitPrice: 16800 },
          { minQty: 1000, maxQty: null, unitPrice: 15200 }
        ],
        onHandQty: 2200,
        reservedQty: 350, // Giữ cho đơn chuẩn bị
        availableQty: 1850,
        minOrderQty: 100,
        status: 'active',
        featuredImage: 'https://images.unsplash.com/photo-1594282486552-05b4d80fbb9f?auto=format&fit=crop&w=800&q=80',
        images: [
          'https://images.unsplash.com/photo-1594282486552-05b4d80fbb9f?auto=format&fit=crop&w=800&q=80'
        ],
        certificationName: 'VietGAP Lâm Đồng số 2026/VG-LD-042',
        origin: 'Lạc Dương, Lâm Đồng',
        description: 'Bắp cải giống Nhật Bản cuộn chặt lá xanh bóng, thu hoạch đúng ngày.',
        updatedAt: '30/10/2026'
      },
      {
        id: 'SP-102',
        sku: 'SKU-DALAT-CAR-002',
        name: 'Cà rốt baby Đà Lạt tươi',
        category: 'Củ quả',
        unit: 'kg',
        basePrice: 24000,
        priceTiers: [
          { minQty: 80, maxQty: 199, unitPrice: 24000 },
          { minQty: 200, maxQty: 499, unitPrice: 22000 },
          { minQty: 500, maxQty: null, unitPrice: 20500 }
        ],
        onHandQty: 650,
        reservedQty: 0,
        availableQty: 650,
        minOrderQty: 80,
        status: 'active',
        featuredImage: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&w=800&q=80',
        images: [
          'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&w=800&q=80'
        ],
        certificationName: 'GLOBALG.A.P. IFA',
        origin: 'Lạc Dương, Lâm Đồng',
        description: 'Cà rốt củ nhỏ đều, lõi nhỏ, đã rửa sạch sấy mát.',
        updatedAt: '29/10/2026'
      },
      {
        id: 'SP-103',
        sku: 'SKU-DALAT-TOM-003',
        name: 'Cà chua bi đỏ Lạc Dương',
        category: 'Củ quả',
        unit: 'kg',
        basePrice: 32000,
        priceTiers: [
          { minQty: 50, maxQty: 99, unitPrice: 32000 },
          { minQty: 100, maxQty: 299, unitPrice: 29500 },
          { minQty: 300, maxQty: null, unitPrice: 27000 }
        ],
        onHandQty: 480,
        reservedQty: 0,
        availableQty: 480,
        minOrderQty: 50,
        status: 'active',
        featuredImage: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=800&q=80',
        images: [
          'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=800&q=80'
        ],
        certificationName: 'VietGAP số 2026/LD-TOM-088',
        origin: 'Lạc Dương, Lâm Đồng',
        description: 'Cà chua bi đỏ chùm ngọt thanh, độ brix > 9%, chuyên dùng cho nhà hàng và siêu thị.',
        updatedAt: '30/10/2026'
      },
      {
        id: 'SP-104',
        sku: 'SKU-DALAT-LET-004',
        name: 'Xà lách Lô Lô xanh thủy canh',
        category: 'Rau ăn lá',
        unit: 'kg',
        basePrice: 48000,
        priceTiers: [
          { minQty: 50, maxQty: 99, unitPrice: 48000 },
          { minQty: 100, maxQty: 199, unitPrice: 45000 },
          { minQty: 200, maxQty: null, unitPrice: 42000 }
        ],
        onHandQty: 180,
        reservedQty: 0,
        availableQty: 180, // Cảnh báo tồn thấp (< 200kg)
        minOrderQty: 50,
        status: 'active',
        featuredImage: 'https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?auto=format&fit=crop&w=800&q=80',
        images: [
          'https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?auto=format&fit=crop&w=800&q=80'
        ],
        certificationName: 'Hữu cơ PGS & VietGAP',
        origin: 'Lạc Dương, Lâm Đồng',
        description: 'Xà lách thủy canh hồi lưu, nguyên gốc xốp, giữ tươi đến 5 ngày.',
        updatedAt: '30/10/2026'
      },
      {
        id: 'SP-105',
        sku: 'SKU-DALAT-PEP-005',
        name: 'Ớt chuông vàng Đà Lạt',
        category: 'Củ quả',
        unit: 'kg',
        basePrice: 45000,
        priceTiers: [
          { minQty: 50, maxQty: 99, unitPrice: 45000 }
        ],
        onHandQty: 0,
        reservedQty: 0,
        availableQty: 0,
        minOrderQty: 50,
        status: 'hidden', // Fix VND-10: Sản phẩm ẩn không được báo cảnh báo tồn ở dashboard
        featuredImage: 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?auto=format&fit=crop&w=800&q=80',
        images: [
          'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?auto=format&fit=crop&w=800&q=80'
        ],
        certificationName: 'VietGAP',
        origin: 'Lạc Dương, Lâm Đồng',
        description: 'Đang hết vụ thu hoạch, tạm ẩn để chuẩn bị vụ trồng mới.',
        updatedAt: '25/10/2026'
      }
    ];
  }

  private loadInitialOrders(): VendorOrder[] {
    const saved = this.storage.getItem<VendorOrder[]>(this.STORAGE_ORDERS);
    if (saved && saved.length > 0) return saved;

    return [
      {
        id: 'VO-2048',
        parentOrderId: 'PO-20260917-8831',
        buyerName: 'Nguyễn Minh Anh', // Fix VND-05
        buyerCompany: 'HTX Bách Hóa Xanh',
        buyerPhone: '090 123 4567', // Fix VND-05
        deliveryAddress: '128 Đường số 7, Phường Bình Trị Đông B, Quận Bình Tân, TP. Hồ Chí Minh', // Fix VND-05
        receivingWindow: '03:30 - 06:00 sáng mai',
        confirmationDeadline: 'Còn 2 giờ 15 phút (trước 12:00 hôm nay)', // Fix VND-05
        status: 'pending_confirmation',
        statusLabel: 'Chờ xác nhận',
        statusBadgeClass: 'bg-amber-100 text-amber-800 border-amber-200',
        items: [
          {
            productId: 'SP-103',
            productName: 'Cà chua bi đỏ Lạc Dương',
            sku: 'SKU-DALAT-TOM-003',
            unit: 'kg',
            quantity: 80,
            unitPrice: 32000,
            amount: 2560000,
            image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=400&q=80'
          }
        ],
        subtotal: 2560000,
        shippingFee: 250000,
        totalAmount: 2810000,
        deliveryNotes: 'Giao trước 06:00 sáng cửa kho lạnh số 2.',
        timeline: [
          {
            title: 'Người mua đặt đơn thành công',
            description: 'HTX Bách Hóa Xanh đã hoàn tất giữ tiền ký quỹ Escrow.',
            timestamp: '30/10/2026 09:30',
            actor: 'Người mua (Bách Hóa Xanh)'
          }
        ],
        createdAt: '30/10/2026 09:30'
      },
      {
        id: 'VO-2049',
        parentOrderId: 'PO-20260917-8832',
        buyerName: 'Trần Văn Bếp',
        buyerCompany: 'Nhà hàng Bếp Mộc Đà Lạt',
        buyerPhone: '098 765 4321',
        deliveryAddress: '45 Đường Phan Đình Phùng, Phường 2, TP. Đà Lạt, Lâm Đồng',
        receivingWindow: '14:00 - 16:00 chiều nay',
        confirmationDeadline: 'Đã xác nhận',
        status: 'preparing',
        statusLabel: 'Đang chuẩn bị',
        statusBadgeClass: 'bg-blue-100 text-blue-800 border-blue-200',
        items: [
          {
            productId: 'SP-101',
            productName: 'Bắp cải sạch Đà Lạt VietGAP',
            sku: 'SKU-DALAT-CAB-001',
            unit: 'kg',
            quantity: 350,
            unitPrice: 16800,
            amount: 5880000,
            image: 'https://images.unsplash.com/photo-1594282486552-05b4d80fbb9f?auto=format&fit=crop&w=400&q=80'
          }
        ],
        subtotal: 5880000,
        shippingFee: 200000,
        totalAmount: 6080000,
        trackingCode: 'TRK-LD-2026-991',
        deliveryNotes: 'Bao lưới 25kg, xếp cẩn thận tránh dập.',
        timeline: [
          {
            title: 'Người mua đặt đơn thành công',
            description: 'Đã thanh toán Escrow an toàn.',
            timestamp: '29/10/2026 14:00',
            actor: 'Người mua'
          },
          {
            title: 'Trang trại đã xác nhận đơn hàng',
            description: 'Đã cam kết nguồn hàng và giữ tồn kho vật lý.',
            timestamp: '29/10/2026 14:30',
            actor: 'Chủ trang trại'
          },
          {
            title: 'Đang thu hoạch & đóng thùng',
            description: 'Công nhân đang phân loại và đóng bao lưới theo tiêu chuẩn.',
            timestamp: '30/10/2026 07:00',
            actor: 'Bộ phận đóng gói'
          }
        ],
        createdAt: '29/10/2026 14:00'
      },
      {
        id: 'VO-2042',
        parentOrderId: 'PO-20260912-7102',
        buyerName: 'Lê Hoàng Yến',
        buyerCompany: 'Chuỗi Siêu thị Go! An Phú',
        buyerPhone: '091 223 3445',
        deliveryAddress: 'Kho Trung chuyển Big C An Phú, TP. Thủ Đức, TP. HCM',
        receivingWindow: '04:00 - 07:00 sáng',
        confirmationDeadline: 'Đã giao thành công',
        status: 'delivered',
        statusLabel: 'Đã giao',
        statusBadgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        items: [
          {
            productId: 'SP-102',
            productName: 'Cà rốt baby Đà Lạt tươi',
            sku: 'SKU-DALAT-CAR-002',
            unit: 'kg',
            quantity: 200,
            unitPrice: 22000,
            amount: 4400000,
            image: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&w=400&q=80'
          }
        ],
        subtotal: 4400000,
        shippingFee: 250000,
        totalAmount: 4650000,
        trackingCode: 'TRK-LD-2026-880',
        timeline: [
          {
            title: 'Đã giao hàng và ký nhận thành công',
            description: 'Kho siêu thị đã ký biên bản nhận 20 thùng carton 10kg.',
            timestamp: '28/10/2026 05:45',
            actor: 'Tài xế xe lạnh & Đại diện kho'
          }
        ],
        createdAt: '26/10/2026 10:00'
      }
    ];
  }

  private loadInitialMovements(): InventoryMovement[] {
    const saved = this.storage.getItem<InventoryMovement[]>(this.STORAGE_MOVEMENTS);
    if (saved && saved.length > 0) return saved;

    return [
      {
        id: 'MV-001',
        productId: 'SP-101',
        productName: 'Bắp cải sạch Đà Lạt VietGAP',
        type: 'inbound',
        typeLabel: 'Nhập kho thu hoạch',
        quantityChange: 1500,
        balanceAfter: 2200,
        referenceDoc: 'Phiếu thu hoạch Lô TH-2610-01',
        note: 'Thu hoạch sáng sớm đợt 1 luống A1-A4',
        timestamp: '30/10/2026 08:30'
      },
      {
        id: 'MV-002',
        productId: 'SP-101',
        productName: 'Bắp cải sạch Đà Lạt VietGAP',
        type: 'outbound_order',
        typeLabel: 'Xuất giao đơn hàng',
        quantityChange: -350,
        balanceAfter: 1850,
        referenceDoc: 'Đơn hàng VO-2049 (Bếp Mộc)',
        note: 'Bàn giao xe tải lạnh giao nội thành',
        timestamp: '29/10/2026 15:00'
      },
      {
        id: 'MV-003',
        productId: 'SP-102',
        productName: 'Cà rốt baby Đà Lạt tươi',
        type: 'inbound',
        typeLabel: 'Nhập kho sơ chế',
        quantityChange: 650,
        balanceAfter: 650,
        referenceDoc: 'Phiếu cân kho rửa sạch PN-881',
        note: 'Đóng thùng 10kg sấy mát',
        timestamp: '29/10/2026 11:00'
      }
    ];
  }

  private loadInitialHarvestPlans(): HarvestPlan[] {
    const saved = this.storage.getItem<HarvestPlan[]>(this.STORAGE_HARVESTS);
    if (saved && saved.length > 0) return saved;

    return [
      {
        id: 'HP-01',
        productId: 'SP-101',
        productName: 'Bắp cải sạch Đà Lạt VietGAP',
        harvestDate: '05/11/2026',
        expectedQty: 2500,
        unit: 'kg',
        confidence: 'high',
        confidenceLabel: 'Độ chắc chắn cao (Đã vào độ cuộn chặt)',
        alreadyCommittedQty: 1000,
        availableForPreorder: 1500,
        notes: 'Luống B1-B8 trang trại Lạc Dương đạt tiêu chuẩn thu hoạch'
      },
      {
        id: 'HP-02',
        productId: 'SP-103',
        productName: 'Cà chua bi đỏ Lạc Dương',
        harvestDate: '08/11/2026',
        expectedQty: 800,
        unit: 'kg',
        confidence: 'medium',
        confidenceLabel: 'Đang theo dõi độ chín (Trung bình)',
        alreadyCommittedQty: 300,
        availableForPreorder: 500,
        notes: 'Dự kiến đỏ 80% đúng ngày giao'
      }
    ];
  }

  private loadInitialSubscriptions(): VendorSubscriptionProposal[] {
    const saved = this.storage.getItem<VendorSubscriptionProposal[]>(this.STORAGE_SUBSCRIPTIONS);
    if (saved && saved.length > 0) return saved;

    return [
      {
        id: 'DK-032',
        buyerCompany: 'HTX Bách Hóa Xanh',
        buyerContact: 'Nguyễn Minh Anh • 090 123 4567',
        productName: 'Bắp cải sạch Đà Lạt VietGAP',
        frequency: 'Thứ 2 & Thứ 5 hàng tuần',
        quantityPerDelivery: 300,
        unit: 'kg',
        unitPrice: 16800,
        deliveryWindow: '04:00 - 06:00 sáng',
        startDate: '01/11/2026',
        endDate: '31/01/2027', // Fix VND-16: Có ngày kết thúc rõ ràng
        responseDeadline: 'Còn 3 ngày (Hạn: 02/11/2026)', // Fix VND-16
        status: 'pending'
      }
    ];
  }

  private loadInitialDisputes(): VendorDisputeCase[] {
    const saved = this.storage.getItem<VendorDisputeCase[]>(this.STORAGE_DISPUTES);
    if (saved && saved.length > 0) return saved;

    return [
      {
        id: 'DISP-20260915-01',
        orderId: 'PO-20260912-7102',
        subOrderId: 'VO-2041',
        buyerCompany: 'Chuỗi Bếp Ăn Công Nghiệp Sài Gòn',
        productName: 'Cà chua bi đỏ Lạc Dương',
        affectedQty: 8,
        unit: 'kg',
        issueDescription: '8 kg cà chua bị dập nát do va đập lớp đáy thùng',
        requestedSolution: 'Hoàn tiền phần hư hỏng (256.000 ₫)',
        claimAmount: 256000,
        responseDeadline: 'Trước 17:00 hôm nay (Còn 4 giờ)', // Fix VND-17
        proofImages: [
          'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=400&q=80'
        ], // Fix VND-17: Ảnh thật xem được
        status: 'pending_vendor',
        statusLabel: 'Chờ Người bán phản hồi',
        createdAt: '30/10/2026 09:00'
      }
    ];
  }

  private loadInitialSettlement(): SettlementPeriod {
    return {
      periodId: 'Kỳ Đối Soát Tháng 10/2026 (16/10 - 31/10)',
      periodType: 'bi-weekly',
      totalGrossSales: 25600000,
      platformFeeRate: 0.05, // 5% chuẩn hóa (Fix VND-18)
      platformFeeAmount: 1280000,
      escrowReserveRate: 0.05, // 5% dự phòng rủi ro nông sản
      escrowReserveAmount: 1280000,
      resolvedDisputeDeductions: 0, // Sẽ tự động tăng khi chấp nhận bồi hoàn (Fix VND-17)
      netPayoutAmount: 23040000,
      status: 'pending_approval',
      statusLabel: 'Đang kết chuyển số dư',
      payoutDueDate: '05/11/2026'
    };
  }

  private loadInitialKyc(): VendorKycProfile {
    const saved = this.storage.getItem<VendorKycProfile>(this.STORAGE_KYC);
    if (saved) return saved;

    return {
      businessType: 'household',
      farmDisplayName: 'HTX Nông Nghiệp Công Nghệ Cao Lạc Dương',
      legalName: 'Hộ Kinh Doanh Trang Trại Lạc Dương Xanh',
      registrationNo: '42A8019928',
      taxCode: '5801452291',
      representativeName: 'Nguyễn Văn Nông',
      representativeIdCard: '049088019284',
      province: 'Lâm Đồng',
      address: 'Thôn Đạ Nghịt, Xã Lát, Huyện Lạc Dương, Tỉnh Lâm Đồng',
      contactPerson: 'Nguyễn Văn Nông (Chủ hộ kinh doanh)', // Fix VND-27
      contactPhone: '091 889 2233',
      contactEmail: 'vendor@lacduongfarm.vn',
      certDocumentName: 'Giay_Chung_Nhan_HKD_Lac_Duong.pdf',
      isApproved: true, // Trang trại đã được duyệt
      approvalStatus: 'approved',
      approvalStatusLabel: 'Hồ sơ đã được phê duyệt'
    };
  }

  // --- Actions ---

  // Fix VND-01: Update existing product without requiring re-uploading photos!
  saveProduct(data: Partial<VendorProduct>, isEdit = false): void {
    if (isEdit && data.id) {
      const updated = this.products().map(p => {
        if (p.id === data.id) {
          return {
            ...p,
            ...data,
            featuredImage: data.featuredImage || p.featuredImage, // Giữ ảnh cũ nếu không đổi (Fix VND-01)
            updatedAt: new Date().toLocaleDateString('vi-VN')
          } as VendorProduct;
        }
        return p;
      });
      this.products.set(updated);
      this.storage.setItem(this.STORAGE_PRODUCTS, updated);
      this.notification.success(`Đã cập nhật thông tin sản phẩm "${data.name}" thành công!`, 'Lưu thành công');
    } else {
      // New product
      const newProd: VendorProduct = {
        id: 'SP-' + Math.floor(100 + Math.random() * 900),
        sku: data.sku || ('SKU-DALAT-' + Math.floor(100 + Math.random() * 900)),
        name: data.name || 'Nông sản mới',
        category: data.category || 'Rau ăn lá',
        unit: data.unit || 'kg',
        basePrice: data.basePrice || 20000,
        priceTiers: data.priceTiers || [{ minQty: 100, maxQty: null, unitPrice: data.basePrice || 20000 }],
        onHandQty: data.onHandQty || 0,
        reservedQty: 0,
        availableQty: data.onHandQty || 0,
        minOrderQty: data.minOrderQty || 50,
        status: data.status || 'active',
        featuredImage: data.featuredImage || 'https://images.unsplash.com/photo-1594282486552-05b4d80fbb9f?auto=format&fit=crop&w=800&q=80',
        images: data.images || [],
        certificationName: data.certificationName || 'VietGAP',
        origin: data.origin || 'Lạc Dương, Lâm Đồng',
        description: data.description || '',
        updatedAt: new Date().toLocaleDateString('vi-VN')
      };
      const updated = [newProd, ...this.products()];
      this.products.set(updated);
      this.storage.setItem(this.STORAGE_PRODUCTS, updated);
      this.notification.success(`Đã thêm sản phẩm "${newProd.name}" vào danh mục đăng bán!`, 'Thành công');
    }
  }

  toggleProductStatus(productId: string): void {
    const updated = this.products().map(p => {
      if (p.id === productId) {
        const nextStatus: VendorProduct['status'] = p.status === 'active' ? 'hidden' : 'active';
        return { ...p, status: nextStatus };
      }
      return p;
    });
    this.products.set(updated);
    this.storage.setItem(this.STORAGE_PRODUCTS, updated);
    this.notification.info('Đã cập nhật trạng thái hiển thị của sản phẩm.', 'Thông báo');
  }

  // Fix VND-19: Delete product logic
  deleteProduct(productId: string): { success: boolean; message?: string } {
    const p = this.products().find(item => item.id === productId);
    if (!p) return { success: false, message: 'Không tìm thấy sản phẩm' };

    if (p.onHandQty > 0 || p.reservedQty > 0) {
      return {
        success: false,
        message: `Sản phẩm "${p.name}" hiện còn ${p.onHandQty} ${p.unit} trong kho. Vui lòng xuất hết tồn kho hoặc chuyển trạng thái "Ẩn" thay vì xóa.`
      };
    }

    const updated = this.products().filter(item => item.id !== productId);
    this.products.set(updated);
    this.storage.setItem(this.STORAGE_PRODUCTS, updated);
    this.notification.success(`Đã xóa sản phẩm "${p.name}".`, 'Đã xóa');
    return { success: true };
  }

  // Fix VND-07: Confirm order updates reserved stock and available stock reactively!
  confirmOrder(orderId: string): void {
    const nowStr = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) + ' hôm nay';

    const updatedOrders = this.orders().map(o => {
      if (o.id === orderId) {
        // Fix VND-07: Deduct from available, add to reserved
        o.items.forEach(it => {
          this.reserveStock(it.productId, it.quantity);
        });

        return {
          ...o,
          status: 'confirmed' as const,
          statusLabel: 'Đã xác nhận',
          statusBadgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
          timeline: [
            ...o.timeline,
            {
              title: 'Trang trại đã xác nhận có thể giao',
              description: 'Đã giữ tồn kho sẵn sàng thu hoạch đóng thùng đúng hẹn.',
              timestamp: nowStr,
              actor: 'Chủ trang trại'
            }
          ]
        };
      }
      return o;
    });

    this.orders.set(updatedOrders);
    this.storage.setItem(this.STORAGE_ORDERS, updatedOrders);
    this.notification.success(`Đã xác nhận đơn hàng ${orderId}. Tồn kho đã được tự động giữ!`, 'Xác nhận thành công');
  }

  // Fix VND-02, VND-03, VND-04: Reject order with reason & clean timeline
  rejectOrder(orderId: string, reason: string): void {
    const nowStr = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) + ' hôm nay';

    const updatedOrders = this.orders().map(o => {
      if (o.id === orderId) {
        return {
          ...o,
          status: 'rejected' as const,
          statusLabel: 'Từ chối giao',
          statusBadgeClass: 'bg-rose-100 text-rose-800 border-rose-200',
          rejectionReason: reason, // Fix VND-04: Lưu lý do từ chối
          rejectedAt: nowStr,
          timeline: [
            ...o.timeline,
            {
              title: 'Người bán từ chối nhận đơn',
              description: `Lý do: "${reason}". Hệ thống đã kích hoạt hoàn tiền Escrow cho Người mua.`,
              timestamp: nowStr,
              actor: 'Chủ trang trại',
              isReject: true // Fix VND-02: Không hiển thị mốc xác nhận giả mạo
            }
          ]
        };
      }
      return o;
    });

    this.orders.set(updatedOrders);
    this.storage.setItem(this.STORAGE_ORDERS, updatedOrders);
    this.notification.warning(`Đã ghi nhận từ chối đơn hàng ${orderId}.`, 'Đã từ chối đơn');
  }

  // Fix VND-08: Update shipping status
  updateShippingStatus(orderId: string, status: 'preparing' | 'shipped' | 'delivered', trackingCode?: string): void {
    const nowStr = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) + ' hôm nay';

    const statusLabels: Record<string, { label: string; badge: string; desc: string }> = {
      preparing: {
        label: 'Đang chuẩn bị',
        badge: 'bg-blue-100 text-blue-800 border-blue-200',
        desc: 'Đang thu hoạch và đóng thùng bảo quản lạnh.'
      },
      shipped: {
        label: 'Đã xuất hàng',
        badge: 'bg-purple-100 text-purple-800 border-purple-200',
        desc: `Đã bàn giao cho đơn vị vận tải lạnh (Mã vận đơn: ${trackingCode || 'TRK-LD-991'}).`
      },
      delivered: {
        label: 'Đã giao đến bên mua',
        badge: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        desc: 'Đã bàn giao tại kho bên mua, chờ ký nhận nghiệm thu.'
      }
    };

    const cfg = statusLabels[status];

    const updated = this.orders().map(o => {
      if (o.id === orderId) {
        return {
          ...o,
          status,
          statusLabel: cfg.label,
          statusBadgeClass: cfg.badge,
          trackingCode: trackingCode || o.trackingCode,
          timeline: [
            ...o.timeline,
            {
              title: cfg.label,
              description: cfg.desc,
              timestamp: nowStr,
              actor: 'Chủ trang trại'
            }
          ]
        };
      }
      return o;
    });

    this.orders.set(updated);
    this.storage.setItem(this.STORAGE_ORDERS, updated);
    this.notification.success(`Đã cập nhật đơn ${orderId} sang trạng thái "${cfg.label}".`, 'Cập nhật tiến trình');
  }

  // Stock helpers
  private reserveStock(productId: string, qty: number): void {
    const updated = this.products().map(p => {
      if (p.id === productId) {
        const reserved = p.reservedQty + qty;
        const available = Math.max(0, p.onHandQty - reserved);
        return {
          ...p,
          reservedQty: reserved,
          availableQty: available
        };
      }
      return p;
    });
    this.products.set(updated);
    this.storage.setItem(this.STORAGE_PRODUCTS, updated);
  }

  // Fix VND-15: Record inbound stock and save to movement history
  recordInboundStock(productId: string, qty: number, note: string): void {
    const p = this.products().find(item => item.id === productId);
    if (!p) return;

    const newOnHand = p.onHandQty + qty;
    const newAvailable = Math.max(0, newOnHand - p.reservedQty);

    // Update product stock
    const updatedProducts = this.products().map(item => {
      if (item.id === productId) {
        return {
          ...item,
          onHandQty: newOnHand,
          availableQty: newAvailable
        };
      }
      return item;
    });
    this.products.set(updatedProducts);
    this.storage.setItem(this.STORAGE_PRODUCTS, updatedProducts);

    // Add movement entry (Fix VND-15)
    const movement: InventoryMovement = {
      id: 'MV-' + Math.floor(100 + Math.random() * 900),
      productId,
      productName: p.name,
      type: 'inbound',
      typeLabel: 'Nhập kho thu hoạch',
      quantityChange: qty,
      balanceAfter: newOnHand,
      referenceDoc: 'Phiếu nhập kho nội bộ',
      note: note || 'Thu hoạch đợt mới từ vườn',
      timestamp: new Date().toLocaleDateString('vi-VN') + ' ' + new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    };

    const updatedMovements = [movement, ...this.inventoryMovements()];
    this.inventoryMovements.set(updatedMovements);
    this.storage.setItem(this.STORAGE_MOVEMENTS, updatedMovements);

    this.notification.success(`Đã nhập +${qty} ${p.unit} vào kho cho "${p.name}".`, 'Nhập kho thành công');
  }

  // Fix VND-14: Harvest plan management (Add / Edit / Delete)
  saveHarvestPlan(plan: Partial<HarvestPlan>, isEdit = false): void {
    if (isEdit && plan.id) {
      const updated = this.harvestPlans().map(h => h.id === plan.id ? { ...h, ...plan } as HarvestPlan : h);
      this.harvestPlans.set(updated);
      this.storage.setItem(this.STORAGE_HARVESTS, updated);
      this.notification.success('Đã cập nhật kế hoạch thu hoạch nguồn cung!', 'Lưu thành công');
    } else {
      const newPlan: HarvestPlan = {
        id: 'HP-' + Math.floor(10 + Math.random() * 90),
        productId: plan.productId || 'SP-101',
        productName: plan.productName || 'Nông sản',
        harvestDate: plan.harvestDate || '10/11/2026',
        expectedQty: plan.expectedQty || 1000,
        unit: plan.unit || 'kg',
        confidence: plan.confidence || 'high',
        confidenceLabel: plan.confidence === 'high' ? 'Độ chắc chắn cao' : 'Ước tính',
        alreadyCommittedQty: 0,
        availableForPreorder: plan.expectedQty || 1000,
        notes: plan.notes || ''
      };
      const updated = [newPlan, ...this.harvestPlans()];
      this.harvestPlans.set(updated);
      this.storage.setItem(this.STORAGE_HARVESTS, updated);
      this.notification.success('Đã thêm kế hoạch thu hoạch mới!', 'Thành công');
    }
  }

  deleteHarvestPlan(planId: string): void {
    const updated = this.harvestPlans().filter(h => h.id !== planId);
    this.harvestPlans.set(updated);
    this.storage.setItem(this.STORAGE_HARVESTS, updated);
    this.notification.info('Đã xóa kế hoạch thu hoạch.', 'Đã xóa');
  }

  // Fix VND-16: Subscriptions response (Accept / Reject / Propose other)
  respondSubscription(id: string, action: 'accepted' | 'rejected' | 'counter_proposed', counterPrice?: number, notes?: string): void {
    const updated = this.subscriptions().map(s => {
      if (s.id === id) {
        return {
          ...s,
          status: action,
          vendorProposedPrice: counterPrice,
          vendorNotes: notes
        };
      }
      return s;
    });

    this.subscriptions.set(updated);
    this.storage.setItem(this.STORAGE_SUBSCRIPTIONS, updated);

    const msgs = {
      accepted: 'Đã xác nhận cung ứng định kỳ theo lịch của Người mua!',
      rejected: 'Đã từ chối đề nghị cung ứng định kỳ.',
      counter_proposed: `Đã gửi đề xuất giá mới (${counterPrice?.toLocaleString('vi-VN')} ₫/kg) cho Người mua!`
    };
    this.notification.success(msgs[action], 'Xử lý thành công');
  }

  // Fix VND-17: Reply to dispute & sync with settlement deduction
  replyDispute(disputeId: string, replyMessage: string, acceptRefund = true): void {
    const updatedDisputes = this.disputes().map(d => {
      if (d.id === disputeId) {
        return {
          ...d,
          vendorReply: replyMessage,
          vendorRepliedAt: 'Vừa xong',
          status: 'vendor_replied' as const,
          statusLabel: 'Người bán đã phản hồi'
        };
      }
      return d;
    });

    this.disputes.set(updatedDisputes);
    this.storage.setItem(this.STORAGE_DISPUTES, updatedDisputes);

    // If accepted refund, sync with Settlement (Fix VND-17)
    if (acceptRefund) {
      const d = this.disputes().find(item => item.id === disputeId);
      if (d) {
        const curSettlement = this.settlement();
        const newDeductions = curSettlement.resolvedDisputeDeductions + d.claimAmount;
        const newNet = curSettlement.totalGrossSales - curSettlement.platformFeeAmount - curSettlement.escrowReserveAmount - newDeductions;
        this.settlement.set({
          ...curSettlement,
          resolvedDisputeDeductions: newDeductions,
          netPayoutAmount: newNet
        });
      }
    }

    this.notification.success('Đã gửi phản hồi khiếu nại tới Người mua & Admin.', 'Đã phản hồi');
  }

  // Fix VND-22..VND-31: Update Onboarding KYC Profile
  updateKycProfile(profileData: Partial<VendorKycProfile>): void {
    const updated: VendorKycProfile = {
      ...this.kycProfile(),
      ...profileData,
      isApproved: false,
      approvalStatus: 'pending',
      approvalStatusLabel: 'Hồ sơ đang chờ Admin xét duyệt'
    };
    this.kycProfile.set(updated);
    this.storage.setItem(this.STORAGE_KYC, updated);
    this.notification.success('Đã nộp hồ sơ đăng ký bán hàng. Admin sẽ xét duyệt trong 24 giờ làm việc.', 'Nộp hồ sơ thành công');
  }
}

