import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Product, VendorSummary, PriceTier } from '../../../shared/models/product.model';
import { PaymentMethod } from '../../../shared/models/order.model';

@Injectable({
  providedIn: 'root'
})
export class BuyerDataService {
  private readonly vendors: VendorSummary[] = [
    {
      id: 'v1',
      name: 'Hợp tác xã Nông nghiệp Công nghệ cao Lạc Dương',
      shortName: 'HTX Lạc Dương',
      location: 'Huyện Lạc Dương, Tỉnh Lâm Đồng',
      certification: 'VietGAP / GLOBALG.A.P. IFA',
      status: 'verified',
      avatarCode: 'LD', // Fix BUY-09
      rating: 4.9,
      ordersFulfilled: 1250
    },
    {
      id: 'v2',
      name: 'Hợp tác xã Rau sạch Hữu cơ Đơn Dương',
      shortName: 'HTX Đơn Dương',
      location: 'Huyện Đơn Dương, Tỉnh Lâm Đồng',
      certification: 'Chứng nhận Hữu cơ PGS & VietGAP',
      status: 'verified',
      avatarCode: 'DD', // Fix BUY-09
      rating: 4.8,
      ordersFulfilled: 890
    },
    {
      id: 'v3',
      name: 'Trang trại Nông nghiệp Công nghệ cao Cầu Đất Farm',
      shortName: 'Cầu Đất Farm',
      location: 'Cầu Đất, TP. Đà Lạt, Lâm Đồng',
      certification: 'GLOBALG.A.P. Nông sản sạch',
      status: 'verified',
      avatarCode: 'CD',
      rating: 5.0,
      ordersFulfilled: 2100
    }
  ];

  private readonly products: Product[] = [
    {
      id: 'p1',
      vendorId: 'v1',
      name: 'Bắp cải sạch Đà Lạt VietGAP',
      sku: 'SKU-DALAT-CAB-001',
      category: 'Rau ăn lá',
      unit: 'kg',
      availableQty: 1850,
      minOrderQty: 100, // MOQ
      basePrice: 18500,
      priceTiers: [
        { minQty: 100, maxQty: 299, unitPrice: 18500 },
        { minQty: 300, maxQty: 999, unitPrice: 16800 },
        { minQty: 1000, maxQty: null, unitPrice: 15200 }
      ],
      featuredImage: 'https://images.unsplash.com/photo-1594282486552-05b4d80fbb9f?auto=format&fit=crop&w=800&q=80',
      images: [
        {
          id: 'img1',
          src: 'https://images.unsplash.com/photo-1594282486552-05b4d80fbb9f?auto=format&fit=crop&w=800&q=80',
          label: 'Ảnh sản phẩm chính',
          alt: 'Bắp cải tươi thu hoạch tại ruộng'
        },
        {
          id: 'img2',
          src: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80',
          label: 'Vùng trồng công nghệ cao',
          alt: 'Vườn bắp cải Lạc Dương đạt chuẩn VietGAP'
        },
        {
          id: 'img3',
          src: 'https://images.unsplash.com/photo-1610348725531-843dff563e2c?auto=format&fit=crop&w=800&q=80',
          label: 'Sơ chế & đóng gói',
          alt: 'Bao lưới bảo vệ đạt tiêu chuẩn vận chuyển'
        }
      ],
      qualitySpecs: [
        { key: 'Phân loại thương mại', value: 'Hạng A (Chuẩn xuất khẩu / Bách hóa)' },
        { key: 'Chứng nhận chất lượng', value: 'VietGAP số 2026/VG-LD-042' },
        { key: 'Quy cách đóng gói', value: 'Bao lưới 25kg • Trọng lượng 1.0 - 1.4kg/bắp' },
        { key: 'Thời hạn bảo quản', value: '7-10 ngày trong kho mát 4-8°C' },
        { key: 'Nhiệt độ giao hàng', value: 'Xe lạnh chuyên dụng ≤ 10°C' }
      ],
      origin: 'Lạc Dương, Lâm Đồng',
      harvestDate: 'Hàng ngày',
      shelfLife: '7 - 10 ngày',
      description: 'Bắp cải sạch giống Nhật Bản cuộn chặt, giòn ngọt, canh tác theo chuẩn VietGAP không dư lượng thuốc BVTV. Rất phù hợp cho chuỗi bách hóa, bếp ăn công nghiệp và siêu thị.'
    },
    {
      id: 'p2',
      vendorId: 'v1',
      name: 'Cà rốt baby Đà Lạt tươi',
      sku: 'SKU-DALAT-CAR-002',
      category: 'Củ quả',
      unit: 'kg',
      availableQty: 650,
      minOrderQty: 80,
      basePrice: 24000,
      priceTiers: [
        { minQty: 80, maxQty: 199, unitPrice: 24000 },
        { minQty: 200, maxQty: 499, unitPrice: 22000 },
        { minQty: 500, maxQty: null, unitPrice: 20500 }
      ],
      featuredImage: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&w=800&q=80',
      images: [
        {
          id: 'img1',
          src: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&w=800&q=80',
          label: 'Cà rốt tươi sạch',
          alt: 'Cà rốt baby Đà Lạt rửa sạch'
        }
      ],
      qualitySpecs: [
        { key: 'Chứng nhận', value: 'GLOBALG.A.P. IFA' },
        { key: 'Quy cách đóng gói', value: 'Thùng carton 10kg có lót giấy hút ẩm' },
        { key: 'Tình trạng', value: 'Đã rửa sạch bùn đất, sấy mát trước đóng gói' }
      ],
      origin: 'Lạc Dương, Lâm Đồng',
      harvestDate: 'Hàng ngày',
      shelfLife: '14 ngày',
      description: 'Cà rốt baby củ nhỏ đều, lõi nhỏ, nhiều dưỡng chất và vị ngọt thanh đặc trưng của thổ nhưỡng cao nguyên Lâm Viên.'
    },
    {
      id: 'p3',
      vendorId: 'v2',
      name: 'Xà lách Lô Lô xanh thủy canh',
      sku: 'SKU-DOND-LET-003',
      category: 'Rau ăn lá',
      unit: 'kg',
      availableQty: 280,
      minOrderQty: 50,
      basePrice: 48000,
      priceTiers: [
        { minQty: 50, maxQty: 99, unitPrice: 48000 },
        { minQty: 100, maxQty: 199, unitPrice: 45000 },
        { minQty: 200, maxQty: null, unitPrice: 42000 }
      ],
      featuredImage: 'https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?auto=format&fit=crop&w=800&q=80',
      images: [
        {
          id: 'img1',
          src: 'https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?auto=format&fit=crop&w=800&q=80',
          label: 'Xà lách thủy canh',
          alt: 'Xà lách Lô Lô xanh mướt giữ nguyên gốc'
        }
      ],
      qualitySpecs: [
        { key: 'Quy cách', value: 'Thùng carton 5kg giữ ẩm' },
        { key: 'Phương pháp', value: 'Thủy canh tuần hoàn hồi lưu trong nhà kính màng' },
        { key: 'Tình trạng', value: 'Giữ nguyên rễ xốp giúp bảo quản tươi lâu đến 5 ngày' }
      ],
      origin: 'Đơn Dương, Lâm Đồng',
      harvestDate: 'Thu hoạch sáng sớm',
      shelfLife: '5 ngày',
      description: 'Xà lách trồng trong nhà màng tự động, lá giòn mềm, vị thanh mát, hoàn toàn không dính đất cát, chuyên dụng cho nhà hàng F&B cao cấp.'
    },
    {
      id: 'p4',
      vendorId: 'v2',
      name: 'Cà chua Beef Đà Lạt chín cây',
      sku: 'SKU-DOND-TOM-004',
      category: 'Củ quả',
      unit: 'kg',
      availableQty: 520,
      minOrderQty: 50,
      basePrice: 38000,
      priceTiers: [
        { minQty: 50, maxQty: 99, unitPrice: 38000 },
        { minQty: 100, maxQty: 299, unitPrice: 35500 },
        { minQty: 300, maxQty: null, unitPrice: 33000 }
      ],
      featuredImage: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=800&q=80',
      images: [
        {
          id: 'img1',
          src: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=800&q=80',
          label: 'Cà chua Beef',
          alt: 'Cà chua quả to mọng đỏ'
        }
      ],
      qualitySpecs: [
        { key: 'Quy cách đóng gói', value: 'Thùng 12 hộp 500g hoặc thùng xốp 10kg có ngăn chống dập' },
        { key: 'Độ chín', value: 'Chín 80-85% lúc hái, vừa độ ngon khi tới kho giao nhận' },
        { key: 'Chứng nhận', value: 'VietGAP số 2026/DD-TOM-118' }
      ],
      origin: 'Đơn Dương, Lâm Đồng',
      harvestDate: 'Hàng ngày',
      shelfLife: '10 ngày',
      description: 'Cà chua Beef trái to, thịt dày, ít hạt, vị ngọt đậm thơm mát, đạt chuẩn vệ sinh an toàn thực phẩm.'
    },
    {
      id: 'p5',
      vendorId: 'v3',
      name: 'Bông cải xanh (Broccoli) hữu cơ Cầu Đất',
      sku: 'SKU-CAUDAT-BRO-005',
      category: 'Rau ăn hoa',
      unit: 'kg',
      availableQty: 320,
      minOrderQty: 40,
      basePrice: 52000,
      priceTiers: [
        { minQty: 40, maxQty: 99, unitPrice: 52000 },
        { minQty: 100, maxQty: 249, unitPrice: 48500 },
        { minQty: 250, maxQty: null, unitPrice: 45000 }
      ],
      featuredImage: 'https://images.unsplash.com/photo-1584270354949-c26b0d5b4a0c?auto=format&fit=crop&w=800&q=80',
      images: [
        {
          id: 'img1',
          src: 'https://images.unsplash.com/photo-1584270354949-c26b0d5b4a0c?auto=format&fit=crop&w=800&q=80',
          label: 'Bông cải xanh Cầu Đất',
          alt: 'Bông cải xanh ngắt đồng đều'
        }
      ],
      qualitySpecs: [
        { key: 'Chứng nhận', value: 'GLOBALG.A.P. & Hữu cơ tiêu chuẩn EU' },
        { key: 'Quy cách', value: 'Thùng xốp ướp đá lạnh 10kg' }
      ],
      origin: 'Cầu Đất, TP. Đà Lạt',
      harvestDate: 'Sáng sớm',
      shelfLife: '7 ngày lạnh',
      description: 'Súp lơ xanh búp chặt, hoa nhỏ li ti mịn đều, hàm lượng vi chất và vitamin dồi dào, thu hoạch tại vùng khí hậu mát mẻ 1.650m Cầu Đất.'
    }
  ];

  private readonly paymentMethods: PaymentMethod[] = [
    {
      id: 'vietqr',
      title: 'VietQR Chuyển Khoản Nhanh',
      description: 'Quét mã VietQR bằng bất kỳ App ngân hàng nào (Vietcombank, MB, Techcombank...).',
      isEligible: true,
      settlementType: 'PREPAID',
      icon: 'vietqr'
    },
    {
      id: 'va',
      title: 'Tài khoản định danh Virtual Account',
      description: 'Chuyển khoản trực tiếp tới tài khoản ngân hàng định danh riêng cho đơn hàng này.',
      isEligible: true,
      settlementType: 'PREPAID',
      icon: 'va'
    },
    {
      id: 'napas',
      title: 'Thẻ ATM / Thẻ ghi nợ nội địa NAPAS',
      description: 'Thanh toán trực tuyến qua cổng NAPAS với tất cả ngân hàng thành viên.',
      isEligible: true,
      settlementType: 'PREPAID',
      icon: 'napas'
    },
    {
      id: 'cod',
      title: 'Thanh toán khi nhận hàng (COD B2B)',
      description: 'Thanh toán tiền mặt hoặc chuyển khoản tại điểm giao nhận sau khi kiểm tra biên bản giao.',
      isEligible: true,
      settlementType: 'COD',
      icon: 'cod'
    },
    {
      id: 'credit',
      title: 'Công nợ Doanh nghiệp (B2B Net 15)',
      description: 'Kỳ hạn thanh toán 15 ngày từ ngày xuất hóa đơn VAT trong hạn mức 38.000.000 ₫ khả dụng.',
      isEligible: true,
      settlementType: 'CREDIT',
      icon: 'credit'
    }
  ];

  getProducts(): Observable<Product[]> {
    const list = this.products.map(p => ({
      ...p,
      vendor: this.vendors.find(v => v.id === p.vendorId)
    }));
    return of(list).pipe(delay(150));
  }

  getProductById(id: string): Observable<Product | undefined> {
    const p = this.products.find(item => item.id === id);
    if (!p) return of(undefined);
    const enriched = {
      ...p,
      vendor: this.vendors.find(v => v.id === p.vendorId)
    };
    return of(enriched).pipe(delay(100));
  }

  getVendors(): Observable<VendorSummary[]> {
    return of(this.vendors).pipe(delay(100));
  }

  getVendorById(id: string): Observable<VendorSummary | undefined> {
    return of(this.vendors.find(v => v.id === id));
  }

  getPaymentMethods(): Observable<PaymentMethod[]> {
    return of(this.paymentMethods);
  }

  calculateTierPrice(product: Product, quantity: number): number {
    if (!product.priceTiers || product.priceTiers.length === 0) {
      return product.basePrice;
    }
    // Find matching tier
    for (const tier of product.priceTiers) {
      if (quantity >= tier.minQty) {
        if (tier.maxQty === null || quantity <= tier.maxQty) {
          return tier.unitPrice;
        }
      }
    }
    // Fallback to lowest or base
    return product.priceTiers[product.priceTiers.length - 1].unitPrice;
  }

  // Fix BUY-14: Validate quantity against MOQ and Available Stock with friendly message
  validateQuantity(product: Product, quantity: number): { valid: boolean; adjustedQty: number; message?: string } {
    if (isNaN(quantity) || quantity <= 0) {
      return {
        valid: false,
        adjustedQty: product.minOrderQty,
        message: `Số lượng đặt tối thiểu (MOQ) cho sản phẩm này là ${product.minOrderQty} ${product.unit}.`
      };
    }

    if (quantity < product.minOrderQty) {
      return {
        valid: false,
        adjustedQty: product.minOrderQty,
        message: `Số lượng chưa đạt mức tối thiểu (MOQ: ${product.minOrderQty} ${product.unit}). Hệ thống đã gợi ý số lượng hợp lệ.`
      };
    }

    if (quantity > product.availableQty) {
      return {
        valid: false,
        adjustedQty: product.availableQty,
        message: `Số lượng yêu cầu (${quantity} ${product.unit}) vượt quá tồn khả dụng (${product.availableQty} ${product.unit}). Đã điều chỉnh về mức tối đa sẵn sàng giao.`
      };
    }

    return { valid: true, adjustedQty: quantity };
  }

  // Fix BUY-18: Refresh stock with timestamp and no mock buzzwords
  refreshStock(productId: string): Observable<{ availableQty: number; updatedAt: string }> {
    const p = this.products.find(item => item.id === productId);
    const now = new Date();
    const timeStr = now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    return of({
      availableQty: p ? p.availableQty : 1500,
      updatedAt: timeStr
    }).pipe(delay(250));
  }
}

