import { Injectable, signal, computed, inject } from '@angular/core';
import { Product } from '../../../shared/models/product.model';
import { CartItem, VendorCartGroup } from '../../../shared/models/order.model';
import { BuyerDataService } from './buyer-data.service';
import { ToastService } from '../../../shared/components/toast/toast.service';
import { StorageService } from '../../../core/services/storage.service';

@Injectable({
  providedIn: 'root'
})
export class CartService {
  private readonly buyerData = inject(BuyerDataService);
  private readonly notification = inject(ToastService);
  private readonly storage = inject(StorageService);

  private readonly STORAGE_KEY = 'kaggri_buyer_cart';

  // Signals
  readonly items = signal<CartItem[]>(this.loadInitialCart());

  // Total quantity of items in cart (for Header Badge - Fix BUY-03)
  readonly totalItemsCount = computed(() => {
    return this.items().reduce((sum, item) => sum + item.quantity, 0);
  });

  // Distinct products count in cart
  readonly uniqueProductsCount = computed(() => this.items().length);

  // Group by Vendor (Người bán) - Fix BUY-31 (Unique vendor count)
  readonly vendorGroups = computed<VendorCartGroup[]>(() => {
    const map = new Map<string, VendorCartGroup>();

    for (const item of this.items()) {
      const vId = item.product.vendorId || 'v1';
      const vendor = item.product.vendor;
      const vName = vendor?.name || 'Hợp tác xã Nông sản';
      const vShort = vendor?.shortName || 'Người bán';
      const vAvatar = vendor?.avatarCode || 'NB';

      if (!map.has(vId)) {
        map.set(vId, {
          vendorId: vId,
          vendorName: vName,
          vendorShortName: vShort,
          vendorAvatarCode: vAvatar,
          items: [],
          subtotal: 0,
          shippingFee: 250000, // Tiêu chuẩn xe tải giao tận kho B2B
          total: 0
        });
      }

      const group = map.get(vId)!;
      group.items.push(item);
      group.subtotal += item.totalPrice;
      group.total = group.subtotal + group.shippingFee;
    }

    return Array.from(map.values());
  });

  // Distinct vendors count
  readonly uniqueVendorsCount = computed(() => this.vendorGroups().length);

  // Total amount
  readonly subtotal = computed(() => {
    return this.items().reduce((sum, item) => sum + item.totalPrice, 0);
  });

  readonly totalShippingFee = computed(() => {
    return this.vendorGroups().reduce((sum, g) => sum + g.shippingFee, 0);
  });

  readonly grandTotal = computed(() => {
    return this.subtotal() + this.totalShippingFee();
  });

  private loadInitialCart(): CartItem[] {
    const saved = this.storage.getItem<CartItem[]>(this.STORAGE_KEY);
    if (saved && saved.length > 0) return saved;

    // Default sample cart items so Buyer has realistic items to inspect
    return [
      {
        product: {
          id: 'p1',
          vendorId: 'v1',
          name: 'Bắp cải sạch Đà Lạt VietGAP',
          sku: 'SKU-DALAT-CAB-001',
          category: 'Rau ăn lá',
          unit: 'kg',
          availableQty: 1850,
          minOrderQty: 100,
          basePrice: 18500,
          priceTiers: [
            { minQty: 100, maxQty: 299, unitPrice: 18500 },
            { minQty: 300, maxQty: 999, unitPrice: 16800 },
            { minQty: 1000, maxQty: null, unitPrice: 15200 }
          ],
          featuredImage: 'https://images.unsplash.com/photo-1594282486552-05b4d80fbb9f?auto=format&fit=crop&w=800&q=80',
          images: [],
          qualitySpecs: [],
          origin: 'Lạc Dương, Lâm Đồng',
          vendor: {
            id: 'v1',
            name: 'Hợp tác xã Nông nghiệp Công nghệ cao Lạc Dương',
            shortName: 'HTX Lạc Dương',
            location: 'Lạc Dương, Lâm Đồng',
            certification: 'VietGAP',
            status: 'verified',
            avatarCode: 'LD'
          }
        },
        quantity: 350,
        selectedTierPrice: 16800,
        totalPrice: 350 * 16800,
        note: 'Ưu tiên bắp cuộn chặt, đóng bao lưới 25kg'
      },
      {
        product: {
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
          images: [],
          qualitySpecs: [],
          origin: 'Đơn Dương, Lâm Đồng',
          vendor: {
            id: 'v2',
            name: 'Hợp tác xã Rau sạch Hữu cơ Đơn Dương',
            shortName: 'HTX Đơn Dương',
            location: 'Đơn Dương, Lâm Đồng',
            certification: 'Chứng nhận Hữu cơ PGS',
            status: 'verified',
            avatarCode: 'DD'
          }
        },
        quantity: 180,
        selectedTierPrice: 45000,
        totalPrice: 180 * 45000,
        note: 'Giữ nguyên gốc xốp, vận chuyển xe lạnh'
      }
    ];
  }

  // Fix BUY-01: Add to cart and stay on current page with toast notification
  addToCart(product: Product, quantity: number, note?: string, isPreorder = false, preorderDate?: string): void {
    const tierPrice = this.buyerData.calculateTierPrice(product, quantity);
    const existingIndex = this.items().findIndex(i => i.product.id === product.id);

    if (existingIndex > -1) {
      // Update quantity
      const updated = [...this.items()];
      const newQty = updated[existingIndex].quantity + quantity;
      const newTierPrice = this.buyerData.calculateTierPrice(product, newQty);
      
      updated[existingIndex] = {
        ...updated[existingIndex],
        quantity: newQty,
        selectedTierPrice: newTierPrice,
        totalPrice: newQty * newTierPrice,
        note: note || updated[existingIndex].note
      };
      this.items.set(updated);
    } else {
      const newItem: CartItem = {
        product,
        quantity,
        selectedTierPrice: tierPrice,
        totalPrice: quantity * tierPrice,
        note,
        isPreorder,
        preorderDeliveryDate: preorderDate
      };
      this.items.set([...this.items(), newItem]);
    }

    this.persist();
    this.notification.success(
      `Đã thêm ${quantity} ${product.unit} "${product.name}" vào giỏ hàng.`,
      'Thêm vào giỏ thành công'
    );
  }

  updateQuantity(productId: string, quantity: number): void {
    const item = this.items().find(i => i.product.id === productId);
    if (!item) return;

    const validation = this.buyerData.validateQuantity(item.product, quantity);
    const targetQty = validation.adjustedQty;
    const tierPrice = this.buyerData.calculateTierPrice(item.product, targetQty);

    const updated = this.items().map(i => {
      if (i.product.id === productId) {
        return {
          ...i,
          quantity: targetQty,
          selectedTierPrice: tierPrice,
          totalPrice: targetQty * tierPrice
        };
      }
      return i;
    });

    this.items.set(updated);
    this.persist();

    if (validation.message) {
      this.notification.warning(validation.message, 'Điều chỉnh số lượng');
    }
  }

  // Fix BUY-19: Inline note update (no window.prompt)
  updateNote(productId: string, note: string): void {
    const updated = this.items().map(i => {
      if (i.product.id === productId) {
        return { ...i, note: note.trim() };
      }
      return i;
    });
    this.items.set(updated);
    this.persist();
    this.notification.info('Đã lưu ghi chú cho sản phẩm', 'Ghi chú đơn hàng');
  }

  removeItem(productId: string): void {
    const filtered = this.items().filter(i => i.product.id !== productId);
    this.items.set(filtered);
    this.persist();
    this.notification.info('Đã xóa mặt hàng khỏi giỏ.', 'Cập nhật giỏ hàng');
  }

  clearCart(): void {
    this.items.set([]);
    this.persist();
  }

  private persist(): void {
    this.storage.setItem(this.STORAGE_KEY, this.items());
  }
}

