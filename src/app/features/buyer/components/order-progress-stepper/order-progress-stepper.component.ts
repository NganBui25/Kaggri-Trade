import { Component, Input, signal, computed, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BuyerOrder, SubOrder } from '../../../../shared/models/order.model';

export interface ProgressStepInfo {
  index: number;
  label: string;
  shortDesc: string;
  fullDesc: string;
  role: string;
  status: 'completed' | 'current' | 'upcoming';
  timestamp?: string;
  badge?: string;
}

export interface TimelineEvent {
  time: string;
  title: string;
  detail: string;
  type: 'order' | 'payment' | 'vendor' | 'prep' | 'logistics' | 'delivery';
  location?: string;
}

@Component({
  selector: 'app-order-progress-stepper',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './order-progress-stepper.component.html',
  styleUrl: './order-progress-stepper.component.scss'
})
export class OrderProgressStepperComponent implements OnChanges {
  @Input({ required: true }) order!: BuyerOrder;

  // Selected step for detailed review (defaults to current step)
  inspectedStepIndex = signal<number>(1);

  // Toggle timeline log view
  showTimelineLog = signal<boolean>(true);

  // Step definitions
  readonly stepMeta = [
    {
      index: 1,
      label: 'Xác nhận đơn',
      shortDesc: 'Đơn mua được tạo',
      fullDesc: 'Đơn hàng được khởi tạo thành công trên hệ thống Kaggri-Trade, danh mục sản phẩm và khối lượng sỉ đã được ghi nhận.',
      role: 'Hệ thống Kaggri'
    },
    {
      index: 2,
      label: 'Thanh toán',
      shortDesc: 'Ký quỹ Escrow',
      fullDesc: 'Khoản tiền đặt hàng được khóa bảo đảm trong tài khoản ký quỹ trung gian (Kaggri Escrow), chỉ giải ngân sau khi kiểm hàng đạt chuẩn.',
      role: 'Người mua & Ngân hàng'
    },
    {
      index: 3,
      label: 'NCC xác nhận',
      shortDesc: 'Cam kết nguồn hàng',
      fullDesc: 'Các Người bán / Hợp tác xã thành viên đã tiếp nhận thông tin đơn hàng và xác nhận cam kết đủ số lượng, quy cách VietGAP.',
      role: 'Nhà cung cấp (NCC)'
    },
    {
      index: 4,
      label: 'Chuẩn bị hàng',
      shortDesc: 'Thu hoạch & đóng thùng',
      fullDesc: 'Nông sản được thu hoạch tươi tại vườn, phân loại kích cỡ, làm sạch và đóng gói vào thùng xốp có túi đá gel giữ nhiệt.',
      role: 'Nhà vườn / Hợp tác xã'
    },
    {
      index: 5,
      label: 'Vận chuyển',
      shortDesc: 'Xe tải lạnh giao hàng',
      fullDesc: 'Hàng hóa được bốc lên xe tải lạnh chuyên dụng duy trì nhiệt độ từ 2°C - 8°C và di chuyển xuyên đêm về kho nhận hàng của bên mua.',
      role: 'Kaggri Cold Logistics'
    },
    {
      index: 6,
      label: 'Hoàn tất',
      shortDesc: 'Nghiệm thu & bàn giao',
      fullDesc: 'Kho nhận hàng đã kiểm tra số lượng, ngoại quan và độ tươi đạt chuẩn VietGAP. Tiền ký quỹ được tự động giải ngân cho Người bán.',
      role: 'Kho Người mua & Escrow'
    }
  ];

  // Compute current active step (1 to 6) based on order data
  currentStepIndex = computed(() => {
    if (!this.order) return 1;

    // Check payment status first
    if (this.order.paymentStatus === 'pending') {
      return 2; // Step 2 is active waiting for payment
    }

    if (!this.order.subOrders || this.order.subOrders.length === 0) {
      return 2;
    }

    const statuses = this.order.subOrders.map(s => s.status);

    // If all completed or delivered
    if (statuses.every(s => s === 'completed' || s === 'delivered')) {
      return 6; // Step 6: Completed
    }

    // If any shipped
    if (statuses.some(s => s === 'shipped')) {
      return 5; // Step 5: Shipping
    }

    // If any preparing
    if (statuses.some(s => s === 'preparing')) {
      return 4; // Step 4: Preparing
    }

    // If all confirmed
    if (statuses.every(s => s === 'confirmed') || statuses.some(s => s === 'confirmed')) {
      return 3; // Step 3: NCC confirmed
    }

    // If awaiting confirmation
    if (statuses.every(s => s === 'pending_confirmation')) {
      return 3;
    }

    return 2;
  });

  // Calculate detailed status for all 6 steps
  steps = computed<ProgressStepInfo[]>(() => {
    const active = this.currentStepIndex();
    const ord = this.order;

    return this.stepMeta.map(meta => {
      let status: 'completed' | 'current' | 'upcoming' = 'upcoming';
      let timestamp: string | undefined = undefined;
      let badge: string | undefined = undefined;

      if (meta.index < active) {
        status = 'completed';
        if (meta.index === 1) timestamp = ord.createdAt;
        if (meta.index === 2) timestamp = ord.paymentStatus === 'paid' ? 'Đã thanh toán Escrow' : undefined;
        if (meta.index === 3) timestamp = 'Đã chốt slot nông sản';
        if (meta.index === 4) timestamp = 'Đã kiểm định & đóng thùng';
        if (meta.index === 5) timestamp = 'Đã xuất bến xe lạnh';
      } else if (meta.index === active) {
        status = 'current';
        badge = 'Đang xử lý';
        if (meta.index === 2) timestamp = 'Chờ quét mã VietQR';
        if (meta.index === 3) timestamp = 'Đang đợi NCC xác nhận';
        if (meta.index === 4) timestamp = 'Thu hoạch & đóng đá gel';
        if (meta.index === 5) timestamp = 'Xe lạnh đang trên đường';
        if (meta.index === 6) timestamp = 'Kiểm nhận tại kho';
      } else {
        status = 'upcoming';
        badge = 'Dự kiến tiếp theo';
      }

      return {
        ...meta,
        status,
        timestamp,
        badge
      };
    });
  });

  // Details of the currently inspected step
  currentInspectedStep = computed<ProgressStepInfo>(() => {
    const list = this.steps();
    const target = list.find(s => s.index === this.inspectedStepIndex());
    return target || list[0];
  });

  // Timeline events generated specifically for this order
  timelineEvents = computed<TimelineEvent[]>(() => {
    const step = this.currentStepIndex();
    const ord = this.order;
    const events: TimelineEvent[] = [];

    // Step 1: Đặt đơn
    events.push({
      time: ord.createdAt,
      title: 'Khởi tạo đơn đặt mua sỉ thành công',
      detail: `Mã đơn mua #${ord.id} gồm ${ord.subOrders.length} nhà vườn liên kết, tổng giá trị ${ord.totalAmount.toLocaleString('vi-VN')} đ.`,
      type: 'order'
    });

    // Step 2: Ký quỹ
    if (ord.paymentStatus === 'paid' || step >= 2) {
      events.push({
        time: ord.createdAt.split(' ')[0] + ' 09:35',
        title: 'Ký quỹ Escrow bảo đảm thành công',
        detail: `Khoản thanh toán qua ${ord.paymentMethod.toUpperCase()} (Mã GD: ${ord.paymentId}) đã được khóa an toàn tại tài khoản Kaggri Escrow.`,
        type: 'payment'
      });
    }

    // Step 3: NCC xác nhận
    if (step >= 3) {
      const vendorNames = ord.subOrders.map(s => s.vendorShortName).join(', ');
      events.push({
        time: ord.createdAt.split(' ')[0] + ' 10:15',
        title: 'Người bán cam kết nguồn hàng',
        detail: `Các đơn vị [${vendorNames}] đã xác nhận sẵn sàng thu hoạch đúng khối lượng và chuẩn VietGAP cam kết.`,
        type: 'vendor',
        location: 'Vùng trồng Lâm Đồng / Đắk Lắk'
      });
    }

    // Step 4: Chuẩn bị hàng
    if (step >= 4) {
      events.push({
        time: ord.createdAt.split(' ')[0] + ' 16:45',
        title: 'Thu hoạch, phân loại & đóng thùng lạnh',
        detail: 'Nông sản được đưa qua quy trình rửa ozon, cân ký, đóng thùng xốp có đá gel và niêm phong tem truy xuất nguồn gốc.',
        type: 'prep',
        location: 'Kho bảo quản lạnh HTX Lạc Dương'
      });
    }

    // Step 5: Vận chuyển
    if (step >= 5) {
      const firstSub = ord.subOrders[0];
      events.push({
        time: ord.createdAt.split(' ')[0] + ' 21:00',
        title: 'Bốc dỡ lên xe tải lạnh chuyên dụng',
        detail: `Lô hàng vận đơn ${firstSub?.trackingCode || 'TRK-COLD-2026'} xuất bến. Nhiệt độ thùng lạnh duy trì ổn định 3.5°C - 5°C.`,
        type: 'logistics',
        location: 'Tuyến Quốc lộ 20 (Đà Lạt → TP.HCM)'
      });
    }

    // Step 6: Hoàn tất
    if (step >= 6) {
      events.push({
        time: ord.createdAt.split(' ')[0] + ' 05:30 (Hôm sau)',
        title: 'Giao hàng thành công & nghiệm thu đạt 100%',
        detail: 'Đại diện kho đã đối soát số lượng, kiểm tra độ tươi và ký nhận biên bản bàn giao. Escrow mở lệnh giải ngân cho người bán.',
        type: 'delivery',
        location: ord.deliveryAddress.companyName
      });
    }

    return events.reverse(); // Newest first
  });

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['order']) {
      // Auto focus on the current step when order changes
      this.inspectedStepIndex.set(this.currentStepIndex());
    }
  }

  selectStep(stepIndex: number): void {
    this.inspectedStepIndex.set(stepIndex);
  }

  jumpToCurrentStep(): void {
    this.inspectedStepIndex.set(this.currentStepIndex());
  }

  getStepStatusColor(status: 'completed' | 'current' | 'upcoming'): string {
    switch (status) {
      case 'completed': return 'bg-[#0d623b] text-white border-[#0d623b]';
      case 'current': return 'bg-[#0d623b] text-white ring-4 ring-emerald-100 ring-offset-2 border-[#0d623b] shadow-md';
      case 'upcoming': return 'bg-stone-100 text-stone-400 border-stone-200';
    }
  }

  getStepStatusLabel(status: 'completed' | 'current' | 'upcoming'): string {
    switch (status) {
      case 'completed': return 'Đã xong';
      case 'current': return 'Đang xử lý';
      case 'upcoming': return 'Sắp tới';
    }
  }
}
