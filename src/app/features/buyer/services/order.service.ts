import { Injectable, signal, inject } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { BuyerOrder, SubOrder, DisputeRecord, PaymentMethodId, CartItem } from '../../../shared/models/order.model';
import { StorageService } from '../../../core/services/storage.service';
import { ToastService } from '../../../shared/components/toast/toast.service';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private readonly storage = inject(StorageService);
  private readonly notification = inject(ToastService);

  private readonly ORDERS_STORAGE_KEY = 'kaggri_buyer_orders';
  private readonly DISPUTES_STORAGE_KEY = 'kaggri_buyer_disputes';

  readonly orders = signal<BuyerOrder[]>(this.loadInitialOrders());
  readonly disputes = signal<DisputeRecord[]>(this.loadInitialDisputes());

  private loadInitialOrders(): BuyerOrder[] {
    const saved = this.storage.getItem<BuyerOrder[]>(this.ORDERS_STORAGE_KEY);
    if (saved && saved.length >= 3) return saved;

    return [
      {
        id: 'PO-20260917-8831',
        paymentId: 'PAY-20260917-0042',
        createdAt: '17/09/2026 09:30',
        totalAmount: 22640000,
        paymentMethod: 'vietqr',
        paymentStatus: 'paid',
        deliveryAddress: {
          companyName: 'HTX Bách Hóa Xanh',
          recipientName: 'Nguyễn Minh Anh',
          phone: '090 123 4567',
          address: '128 Đường số 7, Phường Bình Trị Đông B, Quận Bình Tân, TP. Hồ Chí Minh',
          receivingWindow: '03:30 - 08:00 hàng ngày',
          deliveryNote: 'Ưu tiên bốc dỡ tại cửa hàng kho lạnh số 2 trước 06:00.'
        },
        invoiceRequested: true,
        invoiceProfile: {
          companyName: 'HTX Bách Hóa Xanh',
          taxCode: '0312345678',
          billingAddress: '128 Đường số 7, Phường Bình Trị Đông B, Quận Bình Tân, TP. Hồ Chí Minh',
          invoiceEmail: 'hoadon@bachhoaxanh.example'
        },
        // Step 4: Chuẩn bị hàng (1 vendor preparing, 1 vendor confirmed)
        subOrders: [
          {
            id: 'VO-20260917-01',
            vendorId: 'v1',
            vendorName: 'Hợp tác xã Nông nghiệp Công nghệ cao Lạc Dương',
            vendorShortName: 'HTX Lạc Dương',
            vendorAvatarCode: 'LD',
            status: 'preparing',
            statusLabel: 'Người bán đang chuẩn bị hàng',
            statusBadgeClass: 'bg-amber-100 text-amber-800 border-amber-200',
            items: [
              {
                productName: 'Bắp cải sạch Đà Lạt VietGAP',
                sku: 'SKU-DALAT-CAB-001',
                unit: 'kg',
                quantity: 350,
                unitPrice: 16800,
                amount: 5880000,
                image: 'https://images.unsplash.com/photo-1594282486552-05b4d80fbb9f?auto=format&fit=crop&w=400&q=80'
              },
              {
                productName: 'Cà rốt baby Đà Lạt tươi',
                sku: 'SKU-DALAT-CAR-002',
                unit: 'kg',
                quantity: 200,
                unitPrice: 22000,
                amount: 4400000,
                image: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&w=400&q=80'
              }
            ],
            subtotal: 10280000,
            shippingFee: 250000,
            totalAmount: 10530000,
            trackingCode: 'TRK-LD-2026-991',
            estimatedDelivery: '18/09/2026 05:30',
            notes: 'Hàng thu hoạch chiều 17/09, bảo quản lạnh chuyển đêm.'
          },
          {
            id: 'VO-20260917-02',
            vendorId: 'v2',
            vendorName: 'Hợp tác xã Rau sạch Hữu cơ Đơn Dương',
            vendorShortName: 'HTX Đơn Dương',
            vendorAvatarCode: 'DD',
            status: 'confirmed',
            statusLabel: 'Người bán đã xác nhận đơn',
            statusBadgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
            items: [
              {
                productName: 'Xà lách Lô Lô xanh thủy canh',
                sku: 'SKU-DOND-LET-003',
                unit: 'kg',
                quantity: 180,
                unitPrice: 45000,
                amount: 8100000,
                image: 'https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?auto=format&fit=crop&w=400&q=80'
              },
              {
                productName: 'Cà chua Beef Đà Lạt chín cây',
                sku: 'SKU-DOND-TOM-004',
                unit: 'kg',
                quantity: 100,
                unitPrice: 35500,
                amount: 3550000,
                image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=400&q=80'
              }
            ],
            subtotal: 11650000,
            shippingFee: 250000,
            totalAmount: 11900000,
            trackingCode: 'TRK-DD-2026-442',
            estimatedDelivery: '18/09/2026 06:00',
            notes: 'Đang xếp thùng xốp có đá gel giữ tươi.'
          }
        ]
      },
      // Step 5: Đang vận chuyển
      {
        id: 'PO-20260918-9102',
        paymentId: 'PAY-20260918-7711',
        createdAt: '18/09/2026 08:15',
        totalAmount: 14850000,
        paymentMethod: 'vietqr',
        paymentStatus: 'paid',
        deliveryAddress: {
          companyName: 'Kho Phân Phối Nông Sản Miền Nam',
          recipientName: 'Trần Văn Long',
          phone: '091 888 9922',
          address: 'Khu công nghiệp Vĩnh Lộc, Huyện Bình Chánh, TP. Hồ Chí Minh',
          receivingWindow: '04:00 - 07:00 hàng ngày',
          deliveryNote: 'Kiểm tra nhiệt độ xe lạnh dưới 5°C trước khi ký nhận.'
        },
        invoiceRequested: true,
        invoiceProfile: {
          companyName: 'Công ty Cổ phần Thực phẩm Sạch Nam An',
          taxCode: '0319988776',
          billingAddress: 'Khu công nghiệp Vĩnh Lộc, Huyện Bình Chánh, TP. Hồ Chí Minh',
          invoiceEmail: 'ketoan@namanfood.example'
        },
        subOrders: [
          {
            id: 'VO-20260918-01',
            vendorId: 'v3',
            vendorName: 'Hợp tác xã Nông sản An Toàn Lâm Hà',
            vendorShortName: 'HTX Lâm Hà',
            vendorAvatarCode: 'LH',
            status: 'shipped',
            statusLabel: 'Xe tải lạnh đang vận chuyển',
            statusBadgeClass: 'bg-sky-100 text-sky-800 border-sky-200',
            items: [
              {
                productName: 'Cải bó xôi Đà Lạt VietGAP',
                sku: 'SKU-LAMH-SPN-005',
                unit: 'kg',
                quantity: 400,
                unitPrice: 28000,
                amount: 11200000,
                image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=400&q=80'
              },
              {
                productName: 'Bí ngòi xanh Đà Lạt loại 1',
                sku: 'SKU-LAMH-ZUC-006',
                unit: 'kg',
                quantity: 150,
                unitPrice: 22000,
                amount: 3300000,
                image: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&w=400&q=80'
              }
            ],
            subtotal: 14500000,
            shippingFee: 350000,
            totalAmount: 14850000,
            trackingCode: 'TRK-COLD-49C18824',
            estimatedDelivery: '18/09/2026 23:45',
            notes: 'Xe tải lạnh chuyên dụng 49C-188.24, nhiệt độ khoang 3.8°C.'
          }
        ]
      },
      // Step 3: NCC xác nhận
      {
        id: 'PO-20260919-4215',
        paymentId: 'PAY-20260919-3329',
        createdAt: '19/09/2026 14:20',
        totalAmount: 16200000,
        paymentMethod: 'vietqr',
        paymentStatus: 'paid',
        deliveryAddress: {
          companyName: 'Chuỗi Bếp Ăn Công Nghiệp Tân Thuận',
          recipientName: 'Lê Hoàng Yến',
          phone: '093 456 7890',
          address: 'Khu chế xuất Tân Thuận, Quận 7, TP. Hồ Chí Minh',
          receivingWindow: '02:00 - 05:00 sáng',
          deliveryNote: 'Yêu cầu dán tem niêm phong và bảng đo nhiệt độ.'
        },
        invoiceRequested: false,
        subOrders: [
          {
            id: 'VO-20260919-01',
            vendorId: 'v4',
            vendorName: 'Hợp tác xã Bơ Sáp & Cây Ăn Trái Đắk Lắk',
            vendorShortName: 'HTX Đắk Lắk',
            vendorAvatarCode: 'DL',
            status: 'pending_confirmation',
            statusLabel: 'Chờ Người bán xác nhận đơn',
            statusBadgeClass: 'bg-amber-100 text-amber-800 border-amber-200',
            items: [
              {
                productName: 'Bơ sáp 034 Đắk Lắk hàng tuyển',
                sku: 'SKU-DAKL-AVO-007',
                unit: 'kg',
                quantity: 300,
                unitPrice: 52000,
                amount: 15600000,
                image: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?auto=format&fit=crop&w=400&q=80'
              }
            ],
            subtotal: 15600000,
            shippingFee: 600000,
            totalAmount: 16200000,
            estimatedDelivery: 'Giao trong 24h - 48h tới',
            notes: 'Hàng thu hoạch cắt cuốn đúng ngày giao.'
          }
        ]
      },
      // Step 6: Hoàn tất
      {
        id: 'PO-20260914-6300',
        paymentId: 'PAY-20260914-5510',
        createdAt: '14/09/2026 07:45',
        totalAmount: 31400000,
        paymentMethod: 'vietqr',
        paymentStatus: 'paid',
        deliveryAddress: {
          companyName: 'HTX Bách Hóa Xanh',
          recipientName: 'Nguyễn Minh Anh',
          phone: '090 123 4567',
          address: '128 Đường số 7, Phường Bình Trị Đông B, Quận Bình Tân, TP. Hồ Chí Minh',
          receivingWindow: '03:30 - 08:00 hàng ngày',
          deliveryNote: 'Giao đủ số lượng theo hợp đồng khung.'
        },
        invoiceRequested: true,
        invoiceProfile: {
          companyName: 'HTX Bách Hóa Xanh',
          taxCode: '0312345678',
          billingAddress: '128 Đường số 7, Phường Bình Trị Đông B, Quận Bình Tân, TP. Hồ Chí Minh',
          invoiceEmail: 'hoadon@bachhoaxanh.example'
        },
        subOrders: [
          {
            id: 'VO-20260914-01',
            vendorId: 'v1',
            vendorName: 'Hợp tác xã Nông nghiệp Công nghệ cao Lạc Dương',
            vendorShortName: 'HTX Lạc Dương',
            vendorAvatarCode: 'LD',
            status: 'completed',
            statusLabel: 'Đã hoàn tất nghiệm thu',
            statusBadgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
            items: [
              {
                productName: 'Khoai lang mật Đà Lạt củ lớn',
                sku: 'SKU-DALAT-POT-008',
                unit: 'kg',
                quantity: 800,
                unitPrice: 22000,
                amount: 17600000,
                image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=400&q=80'
              },
              {
                productName: 'Bông cải xanh baby VietGAP',
                sku: 'SKU-DALAT-BRO-009',
                unit: 'kg',
                quantity: 350,
                unitPrice: 38000,
                amount: 13300000,
                image: 'https://images.unsplash.com/photo-1584270354949-c26b0d5b4a0c?auto=format&fit=crop&w=400&q=80'
              }
            ],
            subtotal: 30900000,
            shippingFee: 500000,
            totalAmount: 31400000,
            trackingCode: 'TRK-LD-2026-662',
            estimatedDelivery: '15/09/2026 05:00',
            deliveredAt: '15/09/2026 04:45',
            notes: 'Đã nghiệm thu 100% đạt chuẩn ngoại quan và độ tươi.'
          }
        ]
      },
      // Step 2: Chờ thanh toán Escrow
      {
        id: 'PO-20260920-1049',
        paymentId: 'PAY-20260920-9901',
        createdAt: '20/09/2026 11:10',
        totalAmount: 18250000,
        paymentMethod: 'vietqr',
        paymentStatus: 'pending',
        deliveryAddress: {
          companyName: 'Siêu Thị Rau Sạch Xanh Mart',
          recipientName: 'Đặng Thanh Tâm',
          phone: '098 765 4321',
          address: '45 Võ Văn Tần, Phường 6, Quận 3, TP. Hồ Chí Minh',
          receivingWindow: '06:00 - 10:00 hàng ngày'
        },
        invoiceRequested: false,
        subOrders: [
          {
            id: 'VO-20260920-01',
            vendorId: 'v2',
            vendorName: 'Hợp tác xã Rau sạch Hữu cơ Đơn Dương',
            vendorShortName: 'HTX Đơn Dương',
            vendorAvatarCode: 'DD',
            status: 'pending_confirmation',
            statusLabel: 'Chờ thanh toán ký quỹ',
            statusBadgeClass: 'bg-amber-100 text-amber-800 border-amber-200',
            items: [
              {
                productName: 'Cà chua Beef Đà Lạt chín cây',
                sku: 'SKU-DOND-TOM-004',
                unit: 'kg',
                quantity: 500,
                unitPrice: 35500,
                amount: 17750000,
                image: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=400&q=80'
              }
            ],
            subtotal: 17750000,
            shippingFee: 500000,
            totalAmount: 18250000,
            estimatedDelivery: 'Sau khi thanh toán Escrow'
          }
        ]
      }
    ];
  }

  private loadInitialDisputes(): DisputeRecord[] {
    const saved = this.storage.getItem<DisputeRecord[]>(this.DISPUTES_STORAGE_KEY);
    if (saved && saved.length > 0) return saved;

    return [
      {
        id: 'DISP-20260915-01',
        orderId: 'PO-20260912-7102',
        subOrderId: 'VO-20260912-01',
        productName: 'Cà chua Beef Đà Lạt chín cây',
        affectedQty: 15,
        unit: 'kg',
        issueType: 'damaged',
        issueLabel: 'Nông sản bị dập nát do va đập vận chuyển',
        requestedSolution: 'refund_partial',
        solutionLabel: 'Hoàn tiền phần hàng bị ảnh hưởng',
        status: 'resolved',
        statusLabel: 'Admin đã chấp thuận hoàn tiền',
        statusBadgeClass: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        evidenceImages: [
          'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=400&q=80'
        ],
        description: 'Khi mở thùng số 3 phát hiện 15kg cà chua dưới đáy bị đè dập nước, không thể bày bán siêu thị.',
        refundAmount: 532500,
        createdAt: '15/09/2026 08:30',
        resolvedAt: '15/09/2026 14:00'
      }
    ];
  }

  getOrderById(id: string): Observable<BuyerOrder | undefined> {
    const order = this.orders().find(o => o.id === id);
    return of(order).pipe(delay(100));
  }

  createOrder(
    items: CartItem[],
    deliveryAddress: BuyerOrder['deliveryAddress'],
    paymentMethod: PaymentMethodId,
    invoiceRequested: boolean,
    invoiceProfile?: BuyerOrder['invoiceProfile']
  ): Observable<BuyerOrder> {
    const dateStr = new Date().toLocaleDateString('vi-VN');
    const timeStr = new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    const orderId = 'PO-' + new Date().getFullYear() + Math.floor(100000 + Math.random() * 900000);
    const paymentId = 'PAY-' + new Date().getFullYear() + Math.floor(1000 + Math.random() * 9000);

    // Group items by vendor
    const vendorMap = new Map<string, { vendor: any; items: CartItem[] }>();
    for (const item of items) {
      const vId = item.product.vendorId;
      if (!vendorMap.has(vId)) {
        vendorMap.set(vId, { vendor: item.product.vendor, items: [] });
      }
      vendorMap.get(vId)!.items.push(item);
    }

    let subOrderIndex = 1;
    const subOrders: SubOrder[] = [];
    let grandTotal = 0;

    vendorMap.forEach(({ vendor, items: vItems }, vId) => {
      const subtotal = vItems.reduce((sum, i) => sum + i.totalPrice, 0);
      const shippingFee = 250000;
      const totalAmount = subtotal + shippingFee;
      grandTotal += totalAmount;

      subOrders.push({
        id: `VO-${orderId.substring(3)}-0${subOrderIndex++}`,
        vendorId: vId,
        vendorName: vendor?.name || 'Hợp tác xã Nông sản',
        vendorShortName: vendor?.shortName || 'Người bán',
        vendorAvatarCode: vendor?.avatarCode || 'NB',
        status: 'pending_confirmation',
        statusLabel: 'Chờ Người bán xác nhận',
        statusBadgeClass: 'bg-amber-100 text-amber-800 border-amber-200',
        items: vItems.map(i => ({
          productName: i.product.name,
          sku: i.product.sku,
          unit: i.product.unit,
          quantity: i.quantity,
          unitPrice: i.selectedTierPrice,
          amount: i.totalPrice,
          image: i.product.featuredImage
        })),
        subtotal,
        shippingFee,
        totalAmount,
        estimatedDelivery: 'Giao trong 24h - 48h tới'
      });
    });

    const newOrder: BuyerOrder = {
      id: orderId,
      paymentId,
      createdAt: `${dateStr} ${timeStr}`,
      totalAmount: grandTotal,
      paymentMethod,
      paymentStatus: paymentMethod === 'cod' ? 'pending' : 'paid',
      deliveryAddress,
      invoiceRequested,
      invoiceProfile: invoiceRequested ? invoiceProfile : undefined,
      subOrders
    };

    const updated = [newOrder, ...this.orders()];
    this.orders.set(updated);
    this.persistOrders();

    return of(newOrder).pipe(delay(300));
  }

  createDispute(disputeData: Omit<DisputeRecord, 'id' | 'createdAt' | 'status' | 'statusLabel' | 'statusBadgeClass'>): Observable<DisputeRecord> {
    const id = 'DISP-' + Date.now().toString(36).toUpperCase();
    const createdAt = new Date().toLocaleDateString('vi-VN') + ' ' + new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

    const newDispute: DisputeRecord = {
      ...disputeData,
      id,
      createdAt,
      status: 'pending',
      statusLabel: 'Chờ Người bán & Admin xử lý',
      statusBadgeClass: 'bg-amber-100 text-amber-800 border-amber-200'
    };

    const updated = [newDispute, ...this.disputes()];
    this.disputes.set(updated);
    this.persistDisputes();

    this.notification.success(
      `Yêu cầu khiếu nại #${id} đã được gửi thành công. Admin sẽ phân xử trong 24 giờ làm việc.`,
      'Đã mở khiếu nại'
    );

    return of(newDispute).pipe(delay(200));
  }

  private persistOrders(): void {
    this.storage.setItem(this.ORDERS_STORAGE_KEY, this.orders());
  }

  private persistDisputes(): void {
    this.storage.setItem(this.DISPUTES_STORAGE_KEY, this.disputes());
  }
}

