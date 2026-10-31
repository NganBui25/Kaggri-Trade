import { Injectable, signal, inject } from '@angular/core';
import {
  KycRecord,
  VendorAccount,
  BuyerAccount,
  TransactionRecord,
  DisputeRecord,
  RefundRecord,
  SettlementPeriod,
  ModerationProduct,
  ModerationReview,
  CategoryItem,
  UnitItem,
  SystemConfigItem,
  ConfigHistoryRecord,
  RoleDefinition,
  AuditLog,
  AdminNotification,
  AdminKpi,
  AdminRole
} from '../models/admin.model';
import { AdminAuthService } from './admin-auth.service';
import { StorageService } from '../../../core/services/storage.service';
import { ToastService } from '../../../shared/components/toast/toast.service';

@Injectable({
  providedIn: 'root'
})
export class AdminDataService {
  private readonly auth = inject(AdminAuthService);
  private readonly storage = inject(StorageService);
  private readonly toast = inject(ToastService);

  private readonly STORAGE_PREFIX = 'kaggri_admin_';

  // State Signals
  readonly kycList = signal<KycRecord[]>(this.loadInitialKyc());
  readonly vendorAccounts = signal<VendorAccount[]>(this.loadInitialVendors());
  readonly buyerAccounts = signal<BuyerAccount[]>(this.loadInitialBuyers());
  readonly transactions = signal<TransactionRecord[]>(this.loadInitialTransactions());
  readonly disputes = signal<DisputeRecord[]>(this.loadInitialDisputes());
  readonly refunds = signal<RefundRecord[]>(this.loadInitialRefunds());
  readonly settlements = signal<SettlementPeriod[]>(this.loadInitialSettlements());
  readonly moderationProducts = signal<ModerationProduct[]>(this.loadInitialModerationProducts());
  readonly moderationReviews = signal<ModerationReview[]>(this.loadInitialModerationReviews());
  readonly categories = signal<CategoryItem[]>(this.loadInitialCategories());
  readonly units = signal<UnitItem[]>(this.loadInitialUnits());
  readonly systemConfigs = signal<SystemConfigItem[]>(this.loadInitialConfigs());
  readonly configHistory = signal<ConfigHistoryRecord[]>(this.loadInitialConfigHistory());
  readonly roles = signal<RoleDefinition[]>(this.loadInitialRoles());
  readonly auditLogs = signal<AuditLog[]>(this.loadInitialAuditLogs());
  readonly notifications = signal<AdminNotification[]>(this.loadInitialNotifications());

  // ----------------------------------------------------
  // AUDIT LOG HELPER (Fix ADM-R09, ADM-42)
  // ----------------------------------------------------
  logAudit(action: string, actionLabel: string, object: string, before: string, after: string, reason?: string): void {
    const admin = this.auth.currentAdmin();
    const now = new Date();
    const timeStr = now.toLocaleDateString('vi-VN') + ' ' + now.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });

    const newLog: AuditLog = {
      id: 'LOG-' + Date.now().toString(36).toUpperCase(),
      actor: `${admin.name} (${admin.roleLabel.split(' ')[0]})`,
      role: admin.role,
      action,
      actionLabel,
      object,
      before,
      after,
      reason: reason || 'Thao tác hợp lệ bởi người dùng',
      ip: '10.10.4.' + (admin.role === 'SUPER_ADMIN' ? '1' : admin.role === 'OPS_ADMIN' ? '18' : admin.role === 'FIN_ADMIN' ? '22' : '31'),
      createdAt: timeStr
    };

    const updated = [newLog, ...this.auditLogs()];
    this.auditLogs.set(updated);
    this.persist('audit_logs', updated);
  }

  // ----------------------------------------------------
  // MODULE: KYC ACTIONS (Fix ADM-R06, ADM-R07, ADM-15)
  // ----------------------------------------------------
  approveKyc(id: string, reason?: string): boolean {
    if (!this.auth.canPerformAction('kyc', 'APPROVE')) {
      this.toast.error('Chỉ Quản trị viên Vận hành hoặc Super Admin mới có quyền phê duyệt hồ sơ KYC.', 'Không có quyền');
      return false;
    }

    const item = this.kycList().find(k => k.id === id);
    if (!item) return false;

    const admin = this.auth.currentAdmin();
    item.status = 'APPROVED';
    item.statusLabel = 'Đã phê duyệt';
    item.reviewedBy = admin.name;
    item.reviewedAt = new Date().toLocaleString('vi-VN');

    // Also activate or add vendor in accounts list
    const vendors = this.vendorAccounts();
    const vendorMatch = vendors.find(v => v.company.includes(item.vendorName) || v.id === item.id);
    if (vendorMatch) {
      vendorMatch.status = 'active';
      this.vendorAccounts.set([...vendors]);
    }

    this.kycList.set([...this.kycList()]);
    this.logAudit('KYC:APPROVE', 'Phê duyệt hồ sơ', item.id, 'PENDING', 'APPROVED (' + item.tier + ')', reason);
    this.toast.success(`Hồ sơ #${item.id} (${item.vendorName}) đã được phê duyệt thành công!`, 'Phê duyệt KYC');
    return true;
  }

  rejectKyc(id: string, reason: string): boolean {
    if (!this.auth.canPerformAction('kyc', 'REJECT')) {
      this.toast.error('Chỉ Quản trị viên Vận hành hoặc Super Admin mới có quyền từ chối hồ sơ KYC.', 'Không có quyền');
      return false;
    }

    if (!reason || reason.trim().length < 10) {
      this.toast.error('Lý do từ chối hồ sơ phải có tối thiểu 10 ký tự.', 'Lỗi nhập liệu');
      return false;
    }

    const item = this.kycList().find(k => k.id === id);
    if (!item) return false;

    item.status = 'REJECTED';
    item.statusLabel = 'Đã từ chối';
    item.rejectionReason = reason;
    item.reviewedBy = this.auth.currentAdmin().name;
    item.reviewedAt = new Date().toLocaleString('vi-VN');

    this.kycList.set([...this.kycList()]);
    this.logAudit('KYC:REJECT', 'Từ chối hồ sơ', item.id, 'PENDING', 'REJECTED', reason);
    this.toast.warning(`Đã từ chối hồ sơ #${item.id}. Lý do đã được lưu vào nhật ký kiểm toán.`, 'Từ chối KYC');
    return true;
  }

  requestKycDocs(id: string, reason: string): boolean {
    if (!this.auth.canPerformAction('kyc', 'REQUEST_DOC')) {
      this.toast.error('Chỉ Quản trị viên Vận hành hoặc Super Admin mới có quyền yêu cầu bổ sung.', 'Không có quyền');
      return false;
    }

    if (!reason || reason.trim().length < 10) {
      this.toast.error('Lý do yêu cầu bổ sung phải có tối thiểu 10 ký tự.', 'Lỗi nhập liệu');
      return false;
    }

    const item = this.kycList().find(k => k.id === id);
    if (!item) return false;

    // Fix ADM-R07: Status updates to NEEDS_DOC and reflected in list!
    item.status = 'NEEDS_DOC';
    item.statusLabel = 'Cần bổ sung';
    item.requestedDocReason = reason;
    item.reviewedBy = this.auth.currentAdmin().name;
    item.reviewedAt = new Date().toLocaleString('vi-VN');

    this.kycList.set([...this.kycList()]);
    this.logAudit('KYC:REQUEST_DOC', 'Yêu cầu bổ sung tài liệu', item.id, 'PENDING', 'NEEDS_DOC', reason);
    this.toast.info(`Đã gửi yêu cầu bổ sung hồ sơ #${item.id}. Trạng thái đã chuyển sang "Cần bổ sung".`, 'Yêu cầu bổ sung');
    return true;
  }

  // ----------------------------------------------------
  // MODULE: VENDOR & BUYER MANAGEMENT (Fix ADM-R04, ADM-R05, ADM-29)
  // ----------------------------------------------------
  suspendVendor(id: string, reason: string): boolean {
    if (!this.auth.canPerformAction('accounts-vendor', 'SUSPEND')) {
      this.toast.error('Bạn không có quyền tạm khóa Người bán.', 'Không có quyền');
      return false;
    }

    if (!reason || reason.trim().length < 10) {
      this.toast.error('Lý do tạm khóa phải có tối thiểu 10 ký tự.', 'Lỗi nhập liệu');
      return false;
    }

    const vendor = this.vendorAccounts().find(v => v.id === id);
    if (!vendor) return false;

    vendor.status = 'suspended';
    vendor.suspendReason = reason;

    this.vendorAccounts.set([...this.vendorAccounts()]);
    // Fix ADM-28: Action logged as SUSPEND with explicit reason
    this.logAudit('VND_MGMT:SUSPEND', 'Tạm khóa tài khoản Người bán', vendor.id, 'active', 'suspended', reason);
    this.toast.warning(`Đã tạm khóa Người bán ${vendor.company} (#${vendor.id}).`, 'Đã tạm khóa');
    return true;
  }

  reactivateVendor(id: string, reason: string): boolean {
    if (!this.auth.canPerformAction('accounts-vendor', 'REACTIVATE')) {
      this.toast.error('Bạn không có quyền kích hoạt lại Người bán.', 'Không có quyền');
      return false;
    }

    const vendor = this.vendorAccounts().find(v => v.id === id);
    if (!vendor) return false;

    vendor.status = 'active';
    this.vendorAccounts.set([...this.vendorAccounts()]);
    this.logAudit('VND_MGMT:REACTIVATE', 'Kích hoạt lại Người bán', vendor.id, 'suspended', 'active', reason);
    this.toast.success(`Đã kích hoạt lại Người bán ${vendor.company} (#${vendor.id}).`, 'Đã kích hoạt lại');
    return true;
  }

  // Rule D3: Only Super Admin can terminate vendor!
  terminateVendor(id: string, reason: string): boolean {
    if (!this.auth.isSuperAdmin()) {
      this.toast.error('Quyết định D3: Chỉ Super Admin mới có quyền chấm dứt vĩnh viễn Người bán.', 'Từ chối quyền');
      return false;
    }

    if (!reason || reason.trim().length < 10) {
      this.toast.error('Lý do chấm dứt hợp đồng phải có tối thiểu 10 ký tự.', 'Lỗi nhập liệu');
      return false;
    }

    const vendor = this.vendorAccounts().find(v => v.id === id);
    if (!vendor) return false;

    vendor.status = 'terminated';
    vendor.terminatedReason = reason;

    this.vendorAccounts.set([...this.vendorAccounts()]);
    this.logAudit('VND_MGMT:TERMINATE', 'Chấm dứt hợp tác Người bán', vendor.id, 'active/suspended', 'terminated', reason);
    this.toast.error(`Đã chấm dứt tư cách Người bán đối với ${vendor.company} (#${vendor.id}).`, 'Đã chấm dứt');
    return true;
  }

  suspendBuyer(id: string, reason: string): boolean {
    if (!this.auth.canPerformAction('accounts-buyer', 'SUSPEND')) {
      this.toast.error('Bạn không có quyền tạm khóa Người mua.', 'Không có quyền');
      return false;
    }

    const buyer = this.buyerAccounts().find(b => b.id === id);
    if (!buyer) return false;

    buyer.status = 'suspended';
    buyer.suspendReason = reason;

    this.buyerAccounts.set([...this.buyerAccounts()]);
    this.logAudit('BUY_MGMT:SUSPEND', 'Tạm khóa tài khoản Người mua', buyer.id, 'active', 'suspended', reason);
    this.toast.warning(`Đã tạm khóa Người mua ${buyer.company}.`, 'Đã tạm khóa');
    return true;
  }

  reactivateBuyer(id: string, reason: string): boolean {
    if (!this.auth.canPerformAction('accounts-buyer', 'REACTIVATE')) {
      this.toast.error('Bạn không có quyền kích hoạt lại Người mua.', 'Không có quyền');
      return false;
    }

    const buyer = this.buyerAccounts().find(b => b.id === id);
    if (!buyer) return false;

    buyer.status = 'active';
    this.buyerAccounts.set([...this.buyerAccounts()]);
    this.logAudit('BUY_MGMT:REACTIVATE', 'Kích hoạt lại Người mua', buyer.id, 'suspended', 'active', reason);
    this.toast.success(`Đã kích hoạt lại Người mua ${buyer.company}.`, 'Đã kích hoạt lại');
    return true;
  }

  // ----------------------------------------------------
  // MODULE: DISPUTES & REFUNDS (Rule D2, Fix ADM-R12, ADM-R13, ADM-R15)
  // ----------------------------------------------------
  assignDispute(disputeId: string): boolean {
    const disp = this.disputes().find(d => d.id === disputeId);
    if (!disp) return false;

    const admin = this.auth.currentAdmin();
    const prev = disp.assignedTo || 'unassigned';
    disp.assignedTo = `${admin.id} (${admin.name})`;
    disp.status = 'UNDER_REVIEW';
    disp.statusLabel = 'Đang đánh giá';

    this.disputes.set([...this.disputes()]);
    this.logAudit('DISPUTE:ASSIGN', 'Phân công giải quyết tranh chấp', disp.id, prev, disp.assignedTo);
    this.toast.success(`Đã phân công tranh chấp #${disp.id} cho ${admin.name}.`, 'Phân công');
    return true;
  }

  decideDispute(
    disputeId: string,
    decisionType: 'REFUND_FULL' | 'REFUND_PARTIAL' | 'REJECT',
    affectedQty: number,
    reason: string
  ): boolean {
    // Rule D2: Ops & Super Admin decide dispute
    if (!this.auth.canPerformAction('disputes', 'DECIDE')) {
      this.toast.error('Chỉ Quản trị viên Vận hành hoặc Super Admin mới có quyền ra quyết định tranh chấp.', 'Không có quyền');
      return false;
    }

    if (!reason || reason.trim().length < 10) {
      this.toast.error('Lý do ra quyết định bắt buộc có tối thiểu 10 ký tự.', 'Lỗi nhập liệu');
      return false;
    }

    const disp = this.disputes().find(d => d.id === disputeId);
    if (!disp) return false;

    const admin = this.auth.currentAdmin();
    const now = new Date().toLocaleString('vi-VN');

    if (decisionType === 'REJECT') {
      disp.status = 'RESOLVED_REJECTED';
      disp.statusLabel = 'Từ chối tranh chấp';
      disp.decision = 'Bác bỏ khiếu nại (Người bán giữ 100% Escrow)';
      disp.decisionReason = reason;
      disp.resolvedAt = now;

      this.disputes.set([...this.disputes()]);
      this.logAudit('DISPUTE:DECIDE', 'Từ chối tranh chấp', disp.id, 'UNDER_REVIEW', 'RESOLVED_REJECTED', reason);
      this.toast.info(`Đã từ chối khiếu nại #${disp.id}. Tiền Escrow giữ nguyên cho người bán.`, 'Giải quyết khiếu nại');
      return true;
    }

    // REFUND FULL or PARTIAL -> Transition to PENDING_REFUND_EXECUTION for Finance! (Rule D2)
    let refundAmount = 0;
    if (decisionType === 'REFUND_FULL') {
      refundAmount = disp.refundableAmount;
      disp.status = 'PENDING_REFUND_EXECUTION';
      disp.statusLabel = 'Chờ thực thi hoàn tiền';
      disp.decision = 'Chấp thuận hoàn tiền toàn phần';
    } else {
      // Auto-calculate from affected quantity (Fix ADM-R13)
      refundAmount = Math.min(affectedQty * disp.unitPrice, disp.refundableAmount);
      disp.status = 'PENDING_REFUND_EXECUTION';
      disp.statusLabel = 'Chờ thực thi hoàn tiền';
      disp.decision = `Chấp thuận hoàn tiền một phần (${affectedQty} kg = ${refundAmount.toLocaleString('vi-VN')} đ)`;
    }

    disp.affected = affectedQty;
    disp.proposedRefundAmount = refundAmount;
    disp.decisionReason = reason;
    disp.resolvedAt = now;

    // Create a new Refund record in Finance Queue (ADM-R15)
    const newRefund: RefundRecord = {
      id: 'REF-' + Date.now().toString(36).toUpperCase(),
      disputeId: disp.id,
      orderId: disp.orderId,
      buyer: disp.buyer,
      vendor: disp.vendor,
      amount: refundAmount,
      status: 'PENDING_EXECUTION',
      statusLabel: 'Chờ thực thi',
      gateway: 'VietQR / VNPay',
      retryCount: 0,
      maxRetries: 3,
      createdAt: now,
      decisionReason: reason
    };

    this.refunds.set([newRefund, ...this.refunds()]);
    this.disputes.set([...this.disputes()]);

    this.logAudit(
      'DISPUTE:DECIDE',
      'Quyết định hoàn tiền tranh chấp',
      disp.id,
      'UNDER_REVIEW',
      'PENDING_REFUND_EXECUTION',
      `Số tiền hoàn: ${refundAmount.toLocaleString('vi-VN')} đ. ${reason}`
    );

    this.toast.success(
      `Đã phê duyệt hoàn ${refundAmount.toLocaleString('vi-VN')} đ. Lệnh đã chuyển sang hàng chờ "Thực thi hoàn tiền" của Tài chính!`,
      'Chuyển bước thực thi hoàn tiền'
    );
    return true;
  }

  // Finance executes refund (Rule D2, ADM-R15)
  executeRefund(refundId: string): boolean {
    if (!this.auth.canPerformAction('refunds', 'EXECUTE')) {
      this.toast.error('Chỉ Quản trị viên Tài chính hoặc Super Admin mới có quyền thực thi hoàn tiền.', 'Không có quyền');
      return false;
    }

    const ref = this.refunds().find(r => r.id === refundId);
    if (!ref) return false;

    const admin = this.auth.currentAdmin();
    const now = new Date().toLocaleString('vi-VN');

    ref.status = 'SUCCESS';
    ref.statusLabel = 'Hoàn tiền thành công';
    ref.executedAt = now;
    ref.executedBy = admin.name;

    // Update parent dispute status
    const disp = this.disputes().find(d => d.id === ref.disputeId);
    if (disp) {
      disp.status = disp.proposedRefundAmount === disp.escrowAmount ? 'RESOLVED_REFUND_FULL' : 'RESOLVED_REFUND_PARTIAL';
      disp.statusLabel = disp.status === 'RESOLVED_REFUND_FULL' ? 'Đã hoàn tiền toàn bộ' : 'Đã hoàn tiền một phần';
      disp.alreadyRefunded += ref.amount;
      disp.refundableAmount = Math.max(0, disp.refundableAmount - ref.amount);
    }

    this.refunds.set([...this.refunds()]);
    this.disputes.set([...this.disputes()]);

    this.logAudit(
      'REFUND:EXECUTE',
      'Thực thi chuyển tiền hoàn',
      ref.id,
      'PENDING_EXECUTION',
      'SUCCESS',
      `Giải ngân ${ref.amount.toLocaleString('vi-VN')} đ cho ${ref.buyer} qua cổng ${ref.gateway}`
    );

    this.toast.success(
      `Đã thực thi lệnh hoàn ${ref.amount.toLocaleString('vi-VN')} đ cho ${ref.buyer} thành công!`,
      'Hoàn tiền thành công'
    );
    return true;
  }

  retryFailedRefund(refundId: string): boolean {
    if (!this.auth.canPerformAction('refunds', 'RETRY')) {
      this.toast.error('Chỉ Quản trị viên Tài chính mới có quyền thử lại lệnh hoàn tiền.', 'Không có quyền');
      return false;
    }

    const ref = this.refunds().find(r => r.id === refundId);
    if (!ref) return false;

    if (ref.retryCount >= ref.maxRetries) {
      this.toast.error('Lệnh hoàn tiền này đã vượt quá số lần thử lại tối đa (3 lần). Cần đối soát thủ công.', 'Vượt quá số lần thử lại');
      return false;
    }

    ref.retryCount++;
    ref.status = 'SUCCESS';
    ref.statusLabel = 'Hoàn tiền thành công (Retry lần ' + ref.retryCount + ')';
    ref.errorReason = undefined;
    ref.executedAt = new Date().toLocaleString('vi-VN');
    ref.executedBy = this.auth.currentAdmin().name;

    this.refunds.set([...this.refunds()]);
    this.logAudit('REFUND:RETRY', 'Thử lại hoàn tiền qua cổng', ref.id, 'FAILED', 'SUCCESS');
    this.toast.success(`Thử lại lần ${ref.retryCount} thành công! Tiền đã được hoàn về tài khoản người mua.`, 'Thành công');
    return true;
  }

  // ----------------------------------------------------
  // MODULE: SETTLEMENTS (Fix ADM-R17, ADM-R18, ADM-23, ADM-25, ADM-26)
  // ----------------------------------------------------
  createSettlementPeriod(): boolean {
    if (!this.auth.canPerformAction('settlements', 'CREATE')) {
      this.toast.error('Chỉ Quản trị viên Tài chính mới có quyền tạo kỳ đối soát.', 'Không có quyền');
      return false;
    }

    const newId = 'SET-2026-09-W4';
    const newPeriod: SettlementPeriod = {
      id: newId,
      period: 'Tuần 4 / Tháng 9 / 2026',
      cutOffDate: '27/09/2026 23:59',
      calcDate: '28/09/2026',
      payDate: '30/09/2026',
      status: 'DRAFT',
      statusLabel: 'Bản nháp',
      vendors: [
        {
          vendorId: 'VND-001',
          name: 'HTX Nông nghiệp CNC Lạc Dương',
          grossGMV: 145000000,
          refunds: 0,
          commission: 7250000,
          escrowReserve: 7250000,
          adjustments: 0,
          netPayout: 130500000
        },
        {
          vendorId: 'VND-002',
          name: 'HTX Rau sạch Đơn Dương',
          grossGMV: 96000000,
          refunds: 1500000,
          commission: 4725000,
          escrowReserve: 4725000,
          adjustments: 0,
          netPayout: 85050000
        }
      ],
      adjustments: []
    };

    // Fix ADM-26: Appends new period to state
    this.settlements.set([newPeriod, ...this.settlements()]);
    this.logAudit('SETTLEMENT:CREATE', 'Tạo kỳ đối soát mới', newId, '—', 'DRAFT');
    this.toast.success(`Đã khởi tạo nháp kỳ đối soát #${newId} thành công!`, 'Tạo kỳ đối soát');
    return true;
  }

  calculateSettlement(periodId: string): boolean {
    const period = this.settlements().find(s => s.id === periodId);
    if (!period) return false;

    period.status = 'CALCULATED';
    period.statusLabel = 'Đã tính toán';

    // Exact formula: Net = grossGMV - refunds - commission (5%) - escrow (5%) + adjustments (Fix ADM-23)
    for (const row of period.vendors) {
      const netSales = Math.max(0, row.grossGMV - row.refunds);
      row.commission = Math.round(netSales * 0.05);
      row.escrowReserve = Math.round(netSales * 0.05);
      row.netPayout = netSales - row.commission - row.escrowReserve + row.adjustments;
    }

    this.settlements.set([...this.settlements()]);
    this.logAudit('SETTLEMENT:CALCULATE', 'Tính toán doanh số đối soát', period.id, 'DRAFT', 'CALCULATED');
    this.toast.success(`Đã tính toán số liệu đối soát cho kỳ ${period.period}!`, 'Tính toán hoàn tất');
    return true;
  }

  reviewSettlement(periodId: string): boolean {
    const period = this.settlements().find(s => s.id === periodId);
    if (!period) return false;

    period.status = 'REVIEWED';
    period.statusLabel = 'Đã rà soát';

    this.settlements.set([...this.settlements()]);
    this.logAudit('SETTLEMENT:REVIEW', 'Rà soát số liệu kỳ đối soát', period.id, 'CALCULATED', 'REVIEWED');
    this.toast.info(`Kỳ đối soát ${period.period} đã được rà soát, sẵn sàng chốt kỳ!`, 'Rà soát');
    return true;
  }

  finalizeSettlement(periodId: string): boolean {
    const period = this.settlements().find(s => s.id === periodId);
    if (!period) return false;

    period.status = 'FINALIZED';
    period.statusLabel = 'Đã chốt (Khóa sửa)';

    this.settlements.set([...this.settlements()]);
    this.logAudit('SETTLEMENT:FINALIZE', 'Chốt kỳ đối soát', period.id, 'REVIEWED', 'FINALIZED');
    this.toast.success(`Đã chốt số liệu kỳ ${period.period}. Dữ liệu đã được khóa an toàn.`, 'Chốt kỳ');
    return true;
  }

  payoutSettlement(periodId: string): boolean {
    const period = this.settlements().find(s => s.id === periodId);
    if (!period) return false;

    period.status = 'PAID';
    period.statusLabel = 'Đã thanh toán';

    this.settlements.set([...this.settlements()]);
    this.logAudit('SETTLEMENT:PAY', 'Giải ngân đối soát cho Người bán', period.id, 'FINALIZED', 'PAID');
    this.toast.success(`Đã hoàn tất thanh toán Net Payout cho toàn bộ Người bán trong kỳ ${period.period}!`, 'Thanh toán thành công');
    return true;
  }

  addSettlementAdjustment(periodId: string, vendorId: string, amount: number, reason: string): boolean {
    if (!reason || reason.trim().length < 10) {
      this.toast.error('Lý do điều chỉnh đối soát phải có tối thiểu 10 ký tự.', 'Lỗi nhập liệu');
      return false;
    }

    const period = this.settlements().find(s => s.id === periodId);
    if (!period) return false;

    const row = period.vendors.find(v => v.vendorId === vendorId);
    if (!row) return false;

    const adjId = 'ADJ-' + Date.now().toString(36).toUpperCase();
    const adj = {
      id: adjId,
      vendorId: row.vendorId,
      vendorName: row.name,
      amount,
      reason,
      linkedPeriod: period.id,
      createdAt: new Date().toLocaleString('vi-VN'),
      createdBy: this.auth.currentAdmin().name
    };

    period.adjustments = [adj, ...period.adjustments];
    row.adjustments += amount;
    row.netPayout += amount;

    this.settlements.set([...this.settlements()]);
    this.logAudit(
      'SETTLEMENT:ADJUST',
      'Tạo bản ghi điều chỉnh đối soát',
      adjId,
      '0',
      amount.toLocaleString('vi-VN') + ' đ',
      reason
    );
    this.toast.success(`Đã tạo bản ghi điều chỉnh ${amount.toLocaleString('vi-VN')} đ cho ${row.name}!`, 'Điều chỉnh đối soát');
    return true;
  }

  // ----------------------------------------------------
  // MODULE: MODERATION (Fix ADM-R19, ADM-35, ADM-36)
  // ----------------------------------------------------
  approveProduct(id: string): void {
    const p = this.moderationProducts().find(item => item.id === id);
    if (p) {
      p.status = 'APPROVED';
      p.statusLabel = 'Đã phê duyệt';
      this.moderationProducts.set([...this.moderationProducts()]);
      this.logAudit('MOD:APPROVE', 'Phê duyệt sản phẩm', p.id, 'PENDING', 'APPROVED');
      this.toast.success(`Đã duyệt hiển thị sản phẩm "${p.product}".`, 'Kiểm duyệt');
    }
  }

  hideProduct(id: string, reason: string): void {
    const p = this.moderationProducts().find(item => item.id === id);
    if (p) {
      p.status = 'HIDDEN';
      p.statusLabel = 'Đã ẩn';
      p.reason = reason;
      this.moderationProducts.set([...this.moderationProducts()]);
      this.logAudit('MOD:HIDE', 'Ẩn sản phẩm vi phạm', p.id, 'PENDING', 'HIDDEN', reason);
      this.toast.warning(`Đã ẩn sản phẩm "${p.product}" khỏi sàn.`, 'Đã ẩn');
    }
  }

  unhideProduct(id: string): void {
    const p = this.moderationProducts().find(item => item.id === id);
    if (p) {
      p.status = 'APPROVED';
      p.statusLabel = 'Đang hiển thị';
      this.moderationProducts.set([...this.moderationProducts()]);
      this.logAudit('MOD:UNHIDE', 'Bỏ ẩn sản phẩm', p.id, 'HIDDEN', 'APPROVED');
      this.toast.success(`Đã mở hiển thị lại sản phẩm "${p.product}".`, 'Bỏ ẩn');
    }
  }

  approveReview(id: string): void {
    const r = this.moderationReviews().find(item => item.id === id);
    if (r) {
      r.status = 'APPROVED';
      r.statusLabel = 'Đã phê duyệt';
      this.moderationReviews.set([...this.moderationReviews()]);
      this.logAudit('MOD:APPROVE_REVIEW', 'Phê duyệt đánh giá', r.id, 'PENDING', 'APPROVED');
      this.toast.success(`Đã duyệt đánh giá #${r.id}.`, 'Kiểm duyệt');
    }
  }

  hideReview(id: string, reason: string): void {
    const r = this.moderationReviews().find(item => item.id === id);
    if (r) {
      r.status = 'HIDDEN';
      r.statusLabel = 'Đã ẩn';
      r.reason = reason;
      this.moderationReviews.set([...this.moderationReviews()]);
      this.logAudit('MOD:HIDE_REVIEW', 'Ẩn đánh giá vi phạm', r.id, 'PENDING', 'HIDDEN', reason);
      this.toast.warning(`Đã ẩn đánh giá #${r.id}.`, 'Đã ẩn');
    }
  }

  // ----------------------------------------------------
  // MODULE: CATEGORIES & UNITS (Fix ADM-R20, ADM-30, ADM-31)
  // ----------------------------------------------------
  addCategory(name: string, parentId: string | null): boolean {
    if (!name || name.trim().length < 2) {
      this.toast.error('Tên danh mục không hợp lệ.', 'Lỗi');
      return false;
    }

    const parentCat = parentId ? this.categories().find(c => c.id === parentId) : null;
    const newCat: CategoryItem = {
      id: 'CAT-' + Date.now().toString(36).toUpperCase().slice(-4),
      name: name.trim(),
      parent: parentId,
      parentName: parentCat ? parentCat.name : undefined,
      products: 0,
      status: 'active'
    };

    const updated = [...this.categories(), newCat];
    this.categories.set(updated);
    this.logAudit('CAT:CREATE', 'Tạo danh mục mới', newCat.id, '—', newCat.name);
    this.toast.success(`Đã tạo danh mục "${newCat.name}" thành công!`, 'Tạo danh mục');
    return true;
  }

  renameCategory(id: string, newName: string): boolean {
    const cat = this.categories().find(c => c.id === id);
    if (!cat) return false;

    const oldName = cat.name;
    cat.name = newName.trim();
    this.categories.set([...this.categories()]);
    this.logAudit('CAT:RENAME', 'Đổi tên danh mục', cat.id, oldName, cat.name);
    this.toast.success(`Đã đổi tên danh mục thành "${cat.name}".`, 'Cập nhật danh mục');
    return true;
  }

  // Rule D7: Deactivate instead of physical deletion
  deactivateCategory(id: string): boolean {
    const cat = this.categories().find(c => c.id === id);
    if (!cat) return false;

    cat.status = cat.status === 'active' ? 'disabled' : 'active';
    this.categories.set([...this.categories()]);
    this.logAudit(
      'CAT:TOGGLE_STATUS',
      'Đổi trạng thái danh mục',
      cat.id,
      cat.status === 'active' ? 'disabled' : 'active',
      cat.status,
      `Ảnh hưởng đến ${cat.products} sản phẩm liên kết`
    );
    this.toast.info(`Danh mục "${cat.name}" đã được chuyển sang trạng thái: ${cat.status === 'active' ? 'Hoạt động' : 'Vô hiệu hóa'}.`, 'Trạng thái danh mục');
    return true;
  }

  addUnit(name: string, symbol: string): boolean {
    const newUnit: UnitItem = {
      id: 'U-' + Date.now().toString(36).toUpperCase().slice(-4),
      name,
      symbol,
      status: 'active'
    };
    this.units.set([...this.units(), newUnit]);
    this.logAudit('UNIT:CREATE', 'Tạo đơn vị tính', newUnit.id, '—', `${name} (${symbol})`);
    this.toast.success(`Đã thêm đơn vị tính "${name}".`, 'Thêm đơn vị');
    return true;
  }

  deactivateUnit(id: string): boolean {
    const unit = this.units().find(u => u.id === id);
    if (!unit) return false;

    unit.status = unit.status === 'active' ? 'disabled' : 'active';
    this.units.set([...this.units()]);
    this.logAudit('UNIT:TOGGLE', 'Đổi trạng thái đơn vị', unit.id, '—', unit.status);
    this.toast.info(`Đơn vị "${unit.name}" đã được ${unit.status === 'active' ? 'kích hoạt lại' : 'vô hiệu hóa'}.`, 'Đơn vị tính');
    return true;
  }

  // ----------------------------------------------------
  // MODULE: SYSTEM CONFIG (Fix ADM-R21, ADM-R22, ADM-38)
  // ----------------------------------------------------
  updateConfig(key: string, newValue: any, reason: string): boolean {
    if (!this.auth.isSuperAdmin()) {
      this.toast.error('Chỉ Super Admin mới có quyền lưu cấu hình hệ thống.', 'Không có quyền');
      return false;
    }

    if (!reason || reason.trim().length < 10) {
      this.toast.error('Lý do thay đổi cấu hình phải có tối thiểu 10 ký tự.', 'Lỗi');
      return false;
    }

    const param = this.systemConfigs().find(c => c.key === key);
    if (!param) return false;

    const oldVal = String(param.value);
    param.value = newValue;

    const historyRecord: ConfigHistoryRecord = {
      id: 'CFG-HIST-' + Date.now().toString(36).toUpperCase(),
      paramKey: param.key,
      paramLabel: param.label,
      oldValue: oldVal,
      newValue: String(newValue),
      changedBy: this.auth.currentAdmin().name,
      changedAt: new Date().toLocaleString('vi-VN'),
      reason
    };

    this.configHistory.set([historyRecord, ...this.configHistory()]);
    this.systemConfigs.set([...this.systemConfigs()]);
    this.logAudit('CONFIG:UPDATE', 'Cập nhật cấu hình hệ thống', param.key, oldVal, String(newValue), reason);
    this.toast.success(`Đã cập nhật tham số "${param.label}": ${oldVal} → ${newValue} ${param.unit}.`, 'Cấu hình hệ thống');
    return true;
  }

  // ----------------------------------------------------
  // MODULE: RBAC (Fix ADM-R23, ADM-R24, ADM-R25)
  // ----------------------------------------------------
  createRole(name: string, description: string): boolean {
    if (!this.auth.isSuperAdmin()) {
      this.toast.error('Chỉ Super Admin mới có quyền tạo vai trò mới.', 'Không có quyền');
      return false;
    }

    const newRole: RoleDefinition = {
      id: 'R-' + Date.now().toString(36).toUpperCase().slice(-4),
      code: 'OPS_ADMIN',
      name,
      description,
      users: [],
      status: 'active',
      permissions: {
        dashboard: 'VIEW',
        reports: 'VIEW',
        kyc: 'VIEW',
        accounts: 'VIEW',
        transactions: 'VIEW',
        disputes: 'VIEW',
        refunds: 'NONE',
        settlements: 'VIEW',
        moderation: 'VIEW',
        categories: 'VIEW',
        config: 'NONE',
        rbac: 'NONE',
        audit: 'NONE'
      }
    };

    this.roles.set([...this.roles(), newRole]);
    this.logAudit('RBAC:CREATE_ROLE', 'Tạo vai trò quản trị', newRole.id, '—', newRole.name);
    this.toast.success(`Đã tạo vai trò "${name}" thành công!`, 'Tạo vai trò');
    return true;
  }

  deactivateRole(roleId: string): boolean {
    if (!this.auth.isSuperAdmin()) {
      this.toast.error('Chỉ Super Admin mới có quyền vô hiệu hóa vai trò.', 'Không có quyền');
      return false;
    }

    const r = this.roles().find(item => item.id === roleId);
    if (!r) return false;

    if (r.code === 'SUPER_ADMIN') {
      this.toast.error('Không thể vô hiệu hóa vai trò Super Admin cốt lõi của hệ thống.', 'Bảo vệ vai trò');
      return false;
    }

    r.status = r.status === 'active' ? 'disabled' : 'active';
    this.roles.set([...this.roles()]);
    this.logAudit('RBAC:TOGGLE_ROLE', 'Đổi trạng thái vai trò', r.id, '—', r.status);
    this.toast.info(`Vai trò "${r.name}" đã được ${r.status === 'active' ? 'kích hoạt' : 'vô hiệu hóa'}.`, 'Quản trị vai trò');
    return true;
  }

  // Export audit logs to CSV (Fix ADM-R11)
  exportAuditCsv(): string {
    if (!this.auth.canPerformAction('audit', 'EXPORT_AUDIT')) {
      this.toast.error('Chỉ Quản trị viên Tuân thủ hoặc Super Admin mới được quyền xuất file nhật ký kiểm toán.', 'Không có quyền');
      return '';
    }

    const rows = this.auditLogs();
    const headers = ['Mã log', 'Thời gian', 'Người thực hiện', 'Vai trò', 'Hành động', 'Đối tượng', 'Giá trị trước', 'Giá trị sau', 'Lý do', 'Địa chỉ IP'];
    const csvLines = [headers.join(',')];

    for (const r of rows) {
      const line = [
        `"${r.id}"`,
        `"${r.createdAt}"`,
        `"${r.actor}"`,
        `"${r.role}"`,
        `"${r.action}"`,
        `"${r.object}"`,
        `"${r.before}"`,
        `"${r.after}"`,
        `"${r.reason || ''}"`,
        `"${r.ip}"`
      ];
      csvLines.push(line.join(','));
    }

    this.logAudit('AUDIT:EXPORT', 'Xuất file CSV nhật ký kiểm toán', `audit-${new Date().toISOString().slice(0, 10)}.csv`, '—', 'downloaded');
    this.toast.success('Đã xuất thành công file CSV nhật ký kiểm toán!', 'Xuất file');
    return csvLines.join('\n');
  }

  // ----------------------------------------------------
  // INITIAL MOCK DATA LOADERS
  // ----------------------------------------------------
  private loadInitialKyc(): KycRecord[] {
    return [
      {
        id: 'KYC-2026-0918-001',
        vendorName: 'Hộ kinh doanh Cà chua Mộc Châu',
        representative: 'Trần Văn Đức',
        taxCode: '0109923481',
        address: 'Thị trấn Nông trường Mộc Châu, Huyện Mộc Châu, Tỉnh Sơn La',
        submittedAt: '17/09/2026 14:25',
        slaDeadline: '19/09/2026 14:25',
        slaHoursLeft: 22,
        slaStatus: 'on-track',
        tier: 'BASIC',
        documents: ['Giấy đăng ký hộ kinh doanh', 'CCCD chủ hộ', 'Ảnh thực địa trang trại'],
        priority: 'Bình thường',
        status: 'PENDING',
        statusLabel: 'Chờ xét duyệt'
      },
      {
        id: 'KYC-2026-0918-002',
        vendorName: 'Hợp tác xã Dứa Queen Lâm Đồng',
        representative: 'Lê Thị Hương',
        taxCode: '5801294821',
        address: 'Xã Phú Hội, Huyện Đức Trọng, Tỉnh Lâm Đồng',
        submittedAt: '16/09/2026 09:10',
        slaDeadline: '18/09/2026 09:10',
        slaHoursLeft: 4, // Sắp hạn (4h) - Positive hours (Fix ADM-15)
        slaStatus: 'at-risk',
        tier: 'STANDARD',
        documents: ['Giấy đăng ký HTX', 'Chứng nhận VietGAP 2026', 'Xác minh tài khoản ngân hàng', 'CCCD người đại diện'],
        priority: 'Cao',
        status: 'PENDING',
        statusLabel: 'Chờ xét duyệt (Sắp hạn)'
      },
      {
        id: 'KYC-2026-0917-007',
        vendorName: 'Trang trại Bơ Sáp Cẩm Mỹ',
        representative: 'Nguyễn Văn An',
        taxCode: '3602119044',
        address: 'Xã Nhân Nghĩa, Huyện Cẩm Mỹ, Tỉnh Đồng Nai',
        submittedAt: '15/09/2026 11:30',
        slaDeadline: '17/09/2026 11:30',
        slaHoursLeft: -35, // Vi phạm quá hạn 35h - Positive display: "Vi phạm (35h)" (Fix ADM-15)
        slaStatus: 'breached',
        tier: 'PREMIUM',
        documents: ['Giấy chứng nhận đăng ký kinh doanh', 'Chứng chỉ GlobalGAP', 'Chứng nhận Organic Việt Nam', 'Hồ sơ kiểm nghiệm đất & nước'],
        priority: 'Khẩn',
        status: 'PENDING',
        statusLabel: 'Vi phạm SLA'
      },
      {
        id: 'KYC-2026-0918-003',
        vendorName: 'Hộ kinh doanh Thanh Long Bình Thuận',
        representative: 'Đỗ Thị Bích',
        taxCode: '3401512903',
        address: 'Hàm Thuận Nam, Tỉnh Bình Thuận',
        submittedAt: '18/09/2026 08:00',
        slaDeadline: '20/09/2026 08:00',
        slaHoursLeft: 40,
        slaStatus: 'on-track',
        tier: 'BASIC',
        documents: ['Giấy đăng ký kinh doanh', 'CCCD', 'Ảnh vùng trồng'],
        priority: 'Bình thường',
        status: 'PENDING',
        statusLabel: 'Chờ xét duyệt'
      }
    ];
  }

  private loadInitialVendors(): VendorAccount[] {
    return [
      {
        id: 'VND-001',
        company: 'Hợp tác xã Nông nghiệp CNC Lạc Dương',
        tier: 'PREMIUM',
        status: 'active',
        createdAt: '12/03/2025',
        lastActive: '18/09/2026',
        region: 'Lâm Đồng',
        score: 4.8,
        pendingOrdersCount: 4,
        taxCode: '5801294821',
        businessType: 'Hợp tác xã Nông nghiệp',
        representative: 'Nguyễn Văn Nông',
        representativeRole: 'Chủ tịch HĐQT & Đại diện pháp luật',
        phone: '+84 987 654 321',
        email: 'contact@lacduongfarm.vn',
        address: 'Thôn Đa Nhim, Xã Lạc Dương, Huyện Lạc Dương, Tỉnh Lâm Đồng',
        bankAccount: {
          bankName: 'Vietcombank - Chi nhánh Lâm Đồng',
          accountNumber: '0011002345678',
          accountHolder: 'HTX NONG NGHIEP CNC LAC DUONG'
        },
        documents: [
          {
            id: 'DOC-VND001-01',
            name: 'Giấy chứng nhận Đăng ký Hợp tác xã',
            docNumber: '5801294821',
            issuedBy: 'Phòng Tài chính - Kế hoạch Huyện Lạc Dương',
            issuedDate: '12/03/2021',
            status: 'valid',
            statusLabel: 'Đã xác thực hợp lệ',
            fileName: 'giay_dang_ky_htx_lacduong.pdf',
            fileSize: '2.4 MB',
            fileType: 'pdf',
            verifiedAt: '12/03/2025 14:30'
          },
          {
            id: 'DOC-VND001-02',
            name: 'Chứng nhận Tiêu chuẩn Nông nghiệp Công nghệ cao VietGAP',
            docNumber: 'VietGAP-TT-2025-081',
            issuedBy: 'Trung tâm Chứng nhận Phù hợp (QUACERT)',
            issuedDate: '15/08/2024',
            expiryDate: '15/08/2027',
            status: 'valid',
            statusLabel: 'Đang có hiệu lực',
            fileName: 'chung_nhan_vietgap_lacduong_2027.pdf',
            fileSize: '3.1 MB',
            fileType: 'pdf',
            verifiedAt: '12/03/2025 14:32'
          },
          {
            id: 'DOC-VND001-03',
            name: 'Giấy chứng nhận Cơ sở Đủ điều kiện An toàn Thực phẩm',
            docNumber: '142/2024/NNPTNT-LĐ',
            issuedBy: 'Chi cục Quản lý Chất lượng Nông Lâm Thủy sản Lâm Đồng',
            issuedDate: '10/11/2024',
            expiryDate: '10/11/2027',
            status: 'valid',
            statusLabel: 'Đang có hiệu lực',
            fileName: 'attp_chi_cuc_qlcl_lamdong.pdf',
            fileSize: '1.8 MB',
            fileType: 'pdf',
            verifiedAt: '12/03/2025 14:35'
          },
          {
            id: 'DOC-VND001-04',
            name: 'CCCD Người đại diện theo pháp luật',
            docNumber: '068088001234',
            issuedBy: 'Cục Cảnh sát QLHC về TTXH',
            issuedDate: '20/05/2022',
            expiryDate: '20/05/2032',
            status: 'valid',
            statusLabel: 'Đã định danh CCCD gắn chip',
            fileName: 'cccd_nguyen_van_nong.jpg',
            fileSize: '890 KB',
            fileType: 'img',
            verifiedAt: '12/03/2025 14:30'
          }
        ]
      },
      {
        id: 'VND-002',
        company: 'Hợp tác xã Rau sạch Hữu cơ Đơn Dương',
        tier: 'STANDARD',
        status: 'active',
        createdAt: '02/05/2025',
        lastActive: '18/09/2026',
        region: 'Lâm Đồng',
        score: 4.5,
        pendingOrdersCount: 2,
        taxCode: '5801330922',
        businessType: 'Hợp tác xã Nông nghiệp',
        representative: 'Lê Thị Thu Thảo',
        representativeRole: 'Giám đốc Hợp tác xã',
        phone: '+84 912 345 678',
        email: 'rausach@donduongfarm.vn',
        address: 'Xã Tu Tra, Huyện Đơn Dương, Tỉnh Lâm Đồng',
        bankAccount: {
          bankName: 'BIDV - Chi nhánh Đà Lạt',
          accountNumber: '6411000987654',
          accountHolder: 'HTX RAU SACH DON DUONG'
        },
        documents: [
          {
            id: 'DOC-VND002-01',
            name: 'Giấy chứng nhận Đăng ký Hợp tác xã',
            docNumber: '5801330922',
            issuedBy: 'UBND Huyện Đơn Dương',
            issuedDate: '02/05/2022',
            status: 'valid',
            statusLabel: 'Đã xác thực hợp lệ',
            fileName: 'dkkd_htx_donduong.pdf',
            fileSize: '2.1 MB',
            fileType: 'pdf',
            verifiedAt: '02/05/2025 10:15'
          },
          {
            id: 'DOC-VND002-02',
            name: 'Chứng chỉ Canh tác Nông nghiệp Hữu cơ Organic',
            docNumber: 'VN-ORG-2025-044',
            issuedBy: 'Viện Tiêu chuẩn Chất lượng Nông nghiệp',
            issuedDate: '10/01/2025',
            expiryDate: '10/01/2028',
            status: 'valid',
            statusLabel: 'Đang có hiệu lực',
            fileName: 'chung_nhan_organic_donduong.pdf',
            fileSize: '2.7 MB',
            fileType: 'pdf',
            verifiedAt: '02/05/2025 10:20'
          }
        ]
      },
      {
        id: 'VND-003',
        company: 'Trang trại Xoài Cát Chu Bình Định',
        tier: 'STANDARD',
        status: 'suspended',
        createdAt: '11/07/2025',
        lastActive: '30/08/2026',
        region: 'Bình Định',
        score: 3.9,
        pendingOrdersCount: 0,
        suspendReason: 'Tỷ lệ tranh chấp vượt ngưỡng 8% trong 30 ngày qua',
        taxCode: '4101889021',
        businessType: 'Doanh nghiệp Tư nhân',
        representative: 'Võ Minh Tuấn',
        representativeRole: 'Chủ Trang trại',
        phone: '+84 905 889 021',
        email: 'tuanvo@xoaiquybhd.vn',
        address: 'Xã Phù Cát, Huyện Phù Cát, Tỉnh Bình Định',
        bankAccount: {
          bankName: 'Agribank - Chi nhánh Phù Cát',
          accountNumber: '4300205123456',
          accountHolder: 'VO MINH TUAN'
        },
        documents: [
          {
            id: 'DOC-VND003-01',
            name: 'Giấy chứng nhận Đăng ký Doanh nghiệp',
            docNumber: '4101889021',
            issuedBy: 'Sở Kế hoạch và Đầu tư Tỉnh Bình Định',
            issuedDate: '11/07/2023',
            status: 'valid',
            statusLabel: 'Đã xác thực hợp lệ',
            fileName: 'giay_phep_kinh_doanh_xoai.pdf',
            fileSize: '1.9 MB',
            fileType: 'pdf',
            verifiedAt: '11/07/2025 16:00'
          }
        ]
      },
      {
        id: 'VND-004',
        company: 'Hộ KD Cam Cao Phong Hòa Bình',
        tier: 'BASIC',
        status: 'active',
        createdAt: '22/01/2026',
        lastActive: '17/09/2026',
        region: 'Hòa Bình',
        score: 4.2,
        pendingOrdersCount: 1,
        taxCode: '5400982314',
        businessType: 'Hộ kinh doanh cá thể',
        representative: 'Bùi Văn Hùng',
        representativeRole: 'Chủ hộ kinh doanh',
        phone: '+84 978 123 987',
        email: 'camcaophong.hung@gmail.com',
        address: 'Thị trấn Cao Phong, Huyện Cao Phong, Tỉnh Hòa Bình',
        documents: [
          {
            id: 'DOC-VND004-01',
            name: 'Giấy chứng nhận Đăng ký Hộ kinh doanh',
            docNumber: '5400982314',
            issuedBy: 'UBND Huyện Cao Phong',
            issuedDate: '15/01/2024',
            status: 'valid',
            statusLabel: 'Đã xác thực',
            fileName: 'giay_phep_hkd_caophong.pdf',
            fileSize: '1.5 MB',
            fileType: 'pdf',
            verifiedAt: '22/01/2026 09:30'
          }
        ]
      },
      {
        id: 'VND-005',
        company: 'HTX Dứa Queen Lâm Đồng',
        tier: 'STANDARD',
        status: 'pending_kyc',
        createdAt: '16/09/2026',
        lastActive: '16/09/2026',
        region: 'Lâm Đồng',
        score: null,
        pendingOrdersCount: 0,
        taxCode: '5801294821',
        businessType: 'Hợp tác xã Nông nghiệp',
        representative: 'Lê Thị Hương',
        representativeRole: 'Đại diện Hợp tác xã',
        phone: '+84 934 567 890',
        email: 'duaqueen@lamdong.vn',
        address: 'Xã Phú Hội, Huyện Đức Trọng, Tỉnh Lâm Đồng',
        documents: [
          {
            id: 'DOC-VND005-01',
            name: 'Giấy chứng nhận Đăng ký Hợp tác xã',
            docNumber: '5801294821',
            issuedBy: 'UBND Huyện Đức Trọng',
            issuedDate: '10/09/2026',
            status: 'pending',
            statusLabel: 'Chờ đối soát',
            fileName: 'dang_ky_htx_dua_queen.pdf',
            fileSize: '2.2 MB',
            fileType: 'pdf'
          }
        ]
      },
      {
        id: 'VND-006',
        company: 'Trang trại Thanh Long Hàm Thuận',
        tier: 'BASIC',
        status: 'terminated',
        createdAt: '08/06/2025',
        lastActive: '01/02/2026',
        region: 'Bình Thuận',
        score: 2.8,
        pendingOrdersCount: 0,
        terminatedReason: 'Gian lận chất lượng sản phẩm nghiêm trọng có hệ thống',
        taxCode: '3401512903',
        businessType: 'Doanh nghiệp Tư nhân',
        representative: 'Đỗ Thị Bích',
        phone: '+84 918 222 333',
        email: 'thanhlong@hamthuan.vn',
        address: 'Hàm Thuận Nam, Tỉnh Bình Thuận',
        documents: [
          {
            id: 'DOC-VND006-01',
            name: 'Giấy phép Kinh doanh (Đã bị đình chỉ)',
            docNumber: '3401512903',
            issuedBy: 'Sở KH&ĐT Bình Thuận',
            issuedDate: '08/06/2023',
            status: 'expired',
            statusLabel: 'Hết hiệu lực trên sàn',
            fileName: 'giay_phep_dinh_chi.pdf',
            fileSize: '1.4 MB',
            fileType: 'pdf'
          }
        ]
      }
    ];
  }

  private loadInitialBuyers(): BuyerAccount[] {
    return [
      {
        id: 'BUY-001',
        company: 'HTX Bách Hóa Xanh',
        type: 'Chuỗi bán lẻ F&B',
        status: 'active',
        createdAt: '10/01/2025',
        lastActive: '18/09/2026',
        region: 'TP.HCM',
        creditLimit: 50000000,
        pendingOrdersCount: 3,
        taxCode: '0310482190',
        businessType: 'Hợp tác xã Thương mại & Dịch vụ',
        representative: 'Trần Minh Đức',
        representativeRole: 'Giám đốc Thu mua Toàn quốc',
        phone: '+84 908 123 456',
        email: 'buyer@bachhoaxanh.vn',
        address: 'Số 128 Trần Quang Khải, Phường Tân Định, Quận 1, TP.HCM',
        bankAccount: {
          bankName: 'Techcombank - Hội sở',
          accountNumber: '19033458921001',
          accountHolder: 'HTX THUONG MAI DICH VU BACH HOA XANH'
        },
        documents: [
          {
            id: 'DOC-BUY001-01',
            name: 'Giấy chứng nhận Đăng ký Kinh doanh Hệ thống Bán lẻ',
            docNumber: '0310482190',
            issuedBy: 'Sở Kế hoạch và Đầu tư TP. Hồ Chí Minh',
            issuedDate: '10/01/2022',
            status: 'valid',
            statusLabel: 'Đã xác thực hợp lệ',
            fileName: 'giay_dkkd_bach_hoa_xanh.pdf',
            fileSize: '2.8 MB',
            fileType: 'pdf',
            verifiedAt: '10/01/2025 09:00'
          },
          {
            id: 'DOC-BUY001-02',
            name: 'Chứng nhận Đủ điều kiện An toàn Vệ sinh Thực phẩm',
            docNumber: 'ATTP-HCM-2025-992',
            issuedBy: 'Ban Quản lý An toàn Thực phẩm TP. Hồ Chí Minh',
            issuedDate: '15/03/2024',
            expiryDate: '15/03/2027',
            status: 'valid',
            statusLabel: 'Đang có hiệu lực',
            fileName: 'chung_nhan_attp_chuoi_sieu_thi.pdf',
            fileSize: '3.4 MB',
            fileType: 'pdf',
            verifiedAt: '10/01/2025 09:15'
          },
          {
            id: 'DOC-BUY001-03',
            name: 'Hợp đồng Khung Thu mua Nông sản Escrow B2B Kaggri-Trade',
            docNumber: 'KAGGRI-ESCROW-2025-001',
            issuedBy: 'Ban Quản trị Sàn Giao dịch Nông sản Kaggri-Trade',
            issuedDate: '10/01/2025',
            expiryDate: '10/01/2027',
            status: 'valid',
            statusLabel: 'Hợp đồng Escrow điện tử ký số',
            fileName: 'hop_dong_nguyen_tac_escrow_signed.pdf',
            fileSize: '4.2 MB',
            fileType: 'pdf',
            verifiedAt: '10/01/2025 09:30'
          }
        ]
      },
      {
        id: 'BUY-002',
        company: 'Nhà máy Chế biến Rau quả Đà Lạt',
        type: 'Nhà máy chế biến',
        status: 'active',
        createdAt: '14/02/2025',
        lastActive: '17/09/2026',
        region: 'Lâm Đồng',
        creditLimit: 200000000,
        pendingOrdersCount: 1,
        taxCode: '5800451299',
        businessType: 'Công ty Cổ phần Chế biến Thực phẩm',
        representative: 'Hoàng Quốc Việt',
        representativeRole: 'Tổng Giám đốc',
        phone: '+84 913 888 999',
        email: 'contact@dalatfoodfactory.com',
        address: 'Khu Công nghiệp Lộc Phát, TP. Bảo Lộc, Tỉnh Lâm Đồng',
        documents: [
          {
            id: 'DOC-BUY002-01',
            name: 'Giấy chứng nhận Đăng ký Doanh nghiệp Cổ phần',
            docNumber: '5800451299',
            issuedBy: 'Sở Kế hoạch và Đầu tư Tỉnh Lâm Đồng',
            issuedDate: '14/02/2020',
            status: 'valid',
            statusLabel: 'Đã xác thực hợp lệ',
            fileName: 'dkkd_nha_may_dalat.pdf',
            fileSize: '2.5 MB',
            fileType: 'pdf'
          },
          {
            id: 'DOC-BUY002-02',
            name: 'Chứng nhận Hệ thống Quản lý ATTP ISO 22000:2018',
            docNumber: 'ISO-22000-2024-81',
            issuedBy: 'Tổ chức Chứng nhận Quốc tế TUV Rheinland',
            issuedDate: '20/06/2024',
            expiryDate: '20/06/2027',
            status: 'valid',
            statusLabel: 'Đang có hiệu lực',
            fileName: 'iso_22000_dalat_factory.pdf',
            fileSize: '3.0 MB',
            fileType: 'pdf'
          }
        ]
      },
      {
        id: 'BUY-003',
        company: 'Chuỗi Cà phê & Nông sản Highlands',
        type: 'Chuỗi F&B',
        status: 'active',
        createdAt: '20/03/2025',
        lastActive: '18/09/2026',
        region: 'TP.HCM',
        creditLimit: 80000000,
        pendingOrdersCount: 2,
        taxCode: '0303882011',
        businessType: 'Công ty Cổ phần Dịch vụ F&B',
        representative: 'Phạm Thanh Thảo',
        representativeRole: 'Giám đốc Vận hành Chuỗi',
        phone: '+84 903 999 777',
        email: 'supplychain@highlandsb2b.vn',
        address: 'Tòa nhà Landmark 81, Phường 22, Quận Bình Thạnh, TP.HCM',
        documents: [
          {
            id: 'DOC-BUY003-01',
            name: 'Giấy phép Kinh doanh Chuỗi Dịch vụ Ăn uống F&B',
            docNumber: '0303882011',
            issuedBy: 'Sở KH&ĐT TP.HCM',
            issuedDate: '20/03/2021',
            status: 'valid',
            statusLabel: 'Đã xác thực',
            fileName: 'giay_phep_kinh_doanh_highlands.pdf',
            fileSize: '2.3 MB',
            fileType: 'pdf'
          }
        ]
      },
      {
        id: 'BUY-004',
        company: 'Bếp ăn tập thể KCN Tân Bình',
        type: 'Bếp ăn công nghiệp',
        status: 'suspended',
        createdAt: '10/06/2025',
        lastActive: '02/09/2026',
        region: 'TP.HCM',
        creditLimit: 30000000,
        pendingOrdersCount: 0,
        suspendReason: 'Chậm thanh toán công nợ vượt quá hạn định 30 ngày',
        taxCode: '0315890044',
        businessType: 'Công ty TNHH Dịch vụ Suất ăn Công nghiệp',
        representative: 'Đỗ Hùng Dũng',
        phone: '+84 944 555 666',
        email: 'suatancongnghiep@tanbinh.vn',
        address: 'Đường CN13, KCN Tân Bình, Quận Tân Phú, TP.HCM',
        documents: [
          {
            id: 'DOC-BUY004-01',
            name: 'Giấy chứng nhận Đăng ký Kinh doanh',
            docNumber: '0315890044',
            issuedBy: 'Sở KH&ĐT TP.HCM',
            issuedDate: '10/06/2022',
            status: 'valid',
            statusLabel: 'Đã xác thực',
            fileName: 'dkkd_bep_an_tanbinh.pdf',
            fileSize: '1.7 MB',
            fileType: 'pdf'
          }
        ]
      },
      {
        id: 'BUY-005',
        company: 'Siêu thị Co.opmart Cần Thơ',
        type: 'Hệ thống bán lẻ',
        status: 'active',
        createdAt: '05/04/2025',
        lastActive: '18/09/2026',
        region: 'Cần Thơ',
        creditLimit: 250000000,
        pendingOrdersCount: 2,
        taxCode: '1800234567',
        businessType: 'Liên hiệp Hợp tác xã Thương mại',
        representative: 'Vũ Thị Lan',
        representativeRole: 'Giám đốc Siêu thị',
        phone: '+84 929 111 222',
        email: 'coopcantho@saigoncoop.vn',
        address: 'Số 1 Đại lộ Hòa Bình, Quận Ninh Kiều, TP. Cần Thơ',
        documents: [
          {
            id: 'DOC-BUY005-01',
            name: 'Giấy phép Chi nhánh Hoạt động Hệ thống Siêu thị',
            docNumber: '1800234567',
            issuedBy: 'Sở Công Thương TP. Cần Thơ',
            issuedDate: '05/04/2023',
            status: 'valid',
            statusLabel: 'Đã xác thực hợp lệ',
            fileName: 'giay_phep_chi_nhanh_coop.pdf',
            fileSize: '3.5 MB',
            fileType: 'pdf'
          }
        ]
      }
    ];
  }

  private loadInitialTransactions(): TransactionRecord[] {
    return [
      { id: 'PAY-20260918-0001', buyer: 'HTX Bách Hóa Xanh', vendor: 'HTX Nông nghiệp CNC Lạc Dương', amount: 18450000, type: 'ORDER_PAYMENT', typeLabel: 'Thanh toán đơn hàng', status: 'success', statusLabel: 'Thành công', provider: 'VietQR', createdAt: '18/09/2026 09:42', orderId: 'PO-20260918-8831', webhookStatus: 'delivered', webhookRetries: 0 },
      { id: 'PAY-20260918-0002', buyer: 'Chuỗi Cà phê Highlands', vendor: 'HTX Rau sạch Đơn Dương', amount: 6400000, type: 'ORDER_PAYMENT', typeLabel: 'Thanh toán đơn hàng', status: 'processing', statusLabel: 'Đang xử lý', provider: 'MoMo', createdAt: '18/09/2026 10:11', orderId: 'PO-20260918-9102', webhookStatus: 'pending', webhookRetries: 1 },
      { id: 'PAY-20260918-0003', buyer: 'Siêu thị Co.opmart Cần Thơ', vendor: 'Hộ KD Cam Cao Phong', amount: 32500000, type: 'ORDER_PAYMENT', typeLabel: 'Thanh toán đơn hàng', status: 'failed', statusLabel: 'Thất bại', provider: 'Stripe', createdAt: '18/09/2026 10:35', reason: 'Tài khoản không đủ số dư thanh toán', orderId: 'PO-20260918-4215', webhookStatus: 'failed', webhookRetries: 3 },
      { id: 'PAY-20260918-0004', buyer: 'HTX Bách Hóa Xanh', vendor: 'HTX Nông nghiệp CNC Lạc Dương', amount: 12300000, type: 'ESCROW_RELEASE', typeLabel: 'Giải ngân ký quỹ', status: 'success', statusLabel: 'Thành công', provider: 'VNPay', createdAt: '18/09/2026 11:08', orderId: 'PO-20260914-6300', webhookStatus: 'delivered' },
      { id: 'PAY-20260918-0005', buyer: 'Bếp ăn tập thể KCN', vendor: 'HTX Rau sạch Đơn Dương', amount: 4860000, type: 'REFUND_PARTIAL', typeLabel: 'Hoàn tiền một phần', status: 'success', statusLabel: 'Thành công', provider: 'Napas', createdAt: '18/09/2026 11:25', orderId: 'PO-20260912-7102', webhookStatus: 'delivered' },
      { id: 'PAY-20260917-0098', buyer: 'Siêu thị Co.opmart Cần Thơ', vendor: 'HTX Nông nghiệp CNC Lạc Dương', amount: 21000000, type: 'ORDER_PAYMENT', typeLabel: 'Thanh toán đơn hàng', status: 'flagged', statusLabel: 'Nghi vấn', provider: 'VietQR', createdAt: '17/09/2026 22:14', reason: 'Giá trị giao dịch cao bất thường so với lịch sử', orderId: 'PO-20260917-1098', webhookStatus: 'delivered' }
    ];
  }

  private loadInitialDisputes(): DisputeRecord[] {
    return [
      {
        id: 'DSP-2026-0918-001',
        orderId: 'VO-20260918-01',
        buyer: 'HTX Bách Hóa Xanh',
        vendor: 'HTX Nông nghiệp CNC Lạc Dương',
        product: 'Bắp cải sạch VietGAP',
        qty: 300,
        affected: 28,
        unitPrice: 18000,
        reason: 'Chênh lệch số lượng & dập nát',
        description: '28 kg bắp cải dưới đáy thùng có dấu hiệu héo dập do va đập lạnh, cần hoàn tiền phần bị ảnh hưởng.',
        status: 'OPENED',
        statusLabel: 'Chờ phân công',
        slaDeadline: '20/09/2026 21:00',
        slaHoursLeft: 46,
        slaStatus: 'on-track',
        assignedTo: null,
        escrowAmount: 5400000,
        alreadyRefunded: 0,
        refundableAmount: 5400000,
        evidenceBuyer: ['https://images.unsplash.com/photo-1594282486552-05b4d80fbb9f?auto=format&fit=crop&w=400&q=80', 'Ảnh biên bản đồng kiểm tại kho'],
        openedAt: '18/09/2026 09:00'
      },
      {
        id: 'DSP-2026-0917-007',
        orderId: 'VO-20260917-02',
        buyer: 'Chuỗi Cà phê Highlands',
        vendor: 'HTX Rau sạch Hữu cơ Đơn Dương',
        product: 'Cà rốt baby tươi',
        qty: 80,
        affected: 12,
        unitPrice: 22000,
        reason: 'Sai sản phẩm cam kết',
        description: 'Nhà vườn giao cà rốt thường cỡ lớn thay vì cà rốt baby chuẩn như đơn hợp đồng.',
        status: 'AWAITING_VENDOR',
        statusLabel: 'Chờ Người bán phản hồi',
        slaDeadline: '19/09/2026 18:00',
        slaHoursLeft: 19,
        slaStatus: 'at-risk',
        assignedTo: 'ADM-002 (Lê Quốc Hưng)',
        escrowAmount: 1760000,
        alreadyRefunded: 0,
        refundableAmount: 1760000,
        evidenceBuyer: ['Ảnh phân loại kích cỡ cà rốt', 'Phiếu xuất kho của HTX'],
        openedAt: '17/09/2026 16:30'
      },
      {
        id: 'DSP-2026-0917-005',
        orderId: 'VO-20260917-03',
        buyer: 'Nhà máy Chế biến Rau quả Đà Lạt',
        vendor: 'HTX Rau sạch Hữu cơ Đơn Dương',
        product: 'Ớt chuông Sweet Palermo',
        qty: 120,
        affected: 15,
        unitPrice: 45000,
        reason: 'Vấn đề chất lượng độ tươi',
        description: '15 kg ớt bị thối đầu cuốn, yêu cầu hoàn tiền phần hư hỏng.',
        status: 'PENDING_REFUND_EXECUTION', // Rule D2: Ops approved; waiting Finance execution!
        statusLabel: 'Chờ thực thi hoàn tiền',
        slaDeadline: '20/09/2026 14:00',
        slaHoursLeft: 38,
        slaStatus: 'on-track',
        assignedTo: 'ADM-002 (Lê Quốc Hưng)',
        escrowAmount: 5400000,
        alreadyRefunded: 0,
        refundableAmount: 5400000,
        proposedRefundAmount: 675000, // 15kg * 45.000
        decision: 'Chấp thuận hoàn tiền 15 kg ớt chuông thối cuốn',
        decisionReason: 'Ảnh chụp kiện hàng và kết quả giám định kho lạnh xác nhận tỷ lệ hao hụt do nhà vườn đóng gói không đạt.',
        evidenceBuyer: ['Ảnh đầu cuốn thối', 'Video mở kiện seal'],
        evidenceVendor: ['Biên bản kiểm tra xuất bến'],
        openedAt: '17/09/2026 11:00'
      },
      {
        id: 'DSP-2026-0914-009',
        orderId: 'VO-20260914-01',
        buyer: 'Siêu thị Co.opmart Cần Thơ',
        vendor: 'Hộ KD Cam Cao Phong',
        product: 'Cam Cao Phong lòng vàng',
        qty: 600,
        affected: 600,
        unitPrice: 28000,
        reason: 'Giao trễ hợp đồng quá 72h',
        description: 'Giao trễ 3 ngày so với cam kết làm hỏng kế hoạch kinh doanh siêu thị.',
        status: 'RESOLVED_REFUND_FULL',
        statusLabel: 'Đã hoàn tiền toàn bộ',
        slaDeadline: '16/09/2026 10:00',
        slaHoursLeft: 0,
        slaStatus: 'on-track',
        assignedTo: 'ADM-002 (Lê Quốc Hưng)',
        escrowAmount: 16800000,
        alreadyRefunded: 16800000,
        refundableAmount: 0,
        evidenceBuyer: ['Biên bản lập ngày hẹn', 'Thông báo hủy tiếp nhận kho lạnh'],
        openedAt: '14/09/2026 11:20',
        resolvedAt: '15/09/2026 09:00',
        decision: 'Hoàn tiền toàn bộ đơn do lỗi vi phạm thời hạn giao hàng nghiêm trọng.'
      }
    ];
  }

  // Initial refunds queue for Finance (Fix ADM-R15)
  private loadInitialRefunds(): RefundRecord[] {
    return [
      {
        id: 'REF-20260918-01',
        disputeId: 'DSP-2026-0917-005',
        orderId: 'VO-20260917-03',
        buyer: 'Nhà máy Chế biến Rau quả Đà Lạt',
        vendor: 'HTX Rau sạch Hữu cơ Đơn Dương',
        amount: 675000,
        status: 'PENDING_EXECUTION',
        statusLabel: 'Chờ thực thi',
        gateway: 'VietQR Escrow',
        retryCount: 0,
        maxRetries: 3,
        createdAt: '18/09/2026 11:30',
        decisionReason: 'Ops Admin Lê Quốc Hưng đã duyệt bồi hoàn 15 kg ớt chuông thối cuốn.'
      },
      {
        id: 'REF-20260917-02',
        disputeId: 'DSP-2026-0916-004',
        orderId: 'VO-20260916-08',
        buyer: 'HTX Bách Hóa Xanh',
        vendor: 'Hộ KD Cam Cao Phong',
        amount: 1450000,
        status: 'FAILED',
        statusLabel: 'Thất bại (Cần thử lại)',
        gateway: 'VNPay B2B',
        retryCount: 1,
        maxRetries: 3,
        errorReason: 'Cổng thanh toán phản hồi mã lỗi 502 Bad Gateway - Kết nối gián đoạn',
        createdAt: '17/09/2026 14:10',
        decisionReason: 'Hoàn tiền phần cam bị dập nát.'
      },
      {
        id: 'REF-20260915-03',
        disputeId: 'DSP-2026-0914-009',
        orderId: 'VO-20260914-01',
        buyer: 'Siêu thị Co.opmart Cần Thơ',
        vendor: 'Hộ KD Cam Cao Phong',
        amount: 16800000,
        status: 'SUCCESS',
        statusLabel: 'Hoàn tất',
        gateway: 'VietQR Escrow',
        retryCount: 0,
        maxRetries: 3,
        createdAt: '15/09/2026 09:30',
        executedAt: '15/09/2026 09:35',
        executedBy: 'Nguyễn Thị Mai (Finance Admin)',
        decisionReason: 'Hoàn toàn bộ tiền hàng do nhà vườn hủy giao.'
      }
    ];
  }

  private loadInitialSettlements(): SettlementPeriod[] {
    return [
      {
        id: 'SET-2026-09-W3',
        period: 'Tuần 3 / Tháng 9 / 2026',
        cutOffDate: '20/09/2026 23:59',
        calcDate: '21/09/2026',
        payDate: '23/09/2026',
        status: 'CALCULATED',
        statusLabel: 'Đã tính toán',
        vendors: [
          {
            vendorId: 'VND-001',
            name: 'HTX Nông nghiệp CNC Lạc Dương',
            grossGMV: 184500000,
            refunds: 4320000,
            commission: 9009000, // 5% of (184.5M - 4.32M = 180.18M)
            escrowReserve: 9009000, // 5%
            adjustments: 0,
            netPayout: 162162000
          },
          {
            vendorId: 'VND-002',
            name: 'HTX Rau sạch Hữu cơ Đơn Dương',
            grossGMV: 122300000,
            refunds: 1080000,
            commission: 6061000, // 5% of (122.3M - 1.08M = 121.22M)
            escrowReserve: 6061000,
            adjustments: 0,
            netPayout: 109098000
          }
        ],
        adjustments: []
      },
      {
        id: 'SET-2026-09-W2',
        period: 'Tuần 2 / Tháng 9 / 2026',
        cutOffDate: '13/09/2026 23:59',
        calcDate: '14/09/2026',
        payDate: '16/09/2026',
        status: 'PAYING',
        statusLabel: 'Đang giải ngân',
        vendors: [
          {
            vendorId: 'VND-001',
            name: 'HTX Nông nghiệp CNC Lạc Dương',
            grossGMV: 168200000,
            refunds: 0,
            commission: 8410000,
            escrowReserve: 8410000,
            adjustments: 0,
            netPayout: 151380000
          },
          {
            vendorId: 'VND-002',
            name: 'HTX Rau sạch Hữu cơ Đơn Dương',
            grossGMV: 110500000,
            refunds: 720000,
            commission: 5489000,
            escrowReserve: 5489000,
            adjustments: 0,
            netPayout: 98802000
          }
        ],
        adjustments: []
      },
      {
        id: 'SET-2026-09-W1',
        period: 'Tuần 1 / Tháng 9 / 2026',
        cutOffDate: '06/09/2026 23:59',
        calcDate: '07/09/2026',
        payDate: '09/09/2026',
        status: 'PAID',
        statusLabel: 'Đã thanh toán',
        vendors: [
          {
            vendorId: 'VND-001',
            name: 'HTX Nông nghiệp CNC Lạc Dương',
            grossGMV: 156700000,
            refunds: 0,
            commission: 7835000,
            escrowReserve: 7835000,
            adjustments: 0,
            netPayout: 141030000
          },
          {
            vendorId: 'VND-002',
            name: 'HTX Rau sạch Hữu cơ Đơn Dương',
            grossGMV: 98400000,
            refunds: 1240000,
            commission: 4858000,
            escrowReserve: 4858000,
            adjustments: 500000,
            netPayout: 87944000
          }
        ],
        adjustments: [
          {
            id: 'ADJ-2026-0901',
            vendorId: 'VND-002',
            vendorName: 'HTX Rau sạch Hữu cơ Đơn Dương',
            amount: 500000,
            reason: 'Bù chi phí hỗ trợ xe tải lạnh bảo quản đạt chuẩn âm 2 độ',
            linkedPeriod: 'SET-2026-09-W1',
            createdAt: '08/09/2026 10:15',
            createdBy: 'Nguyễn Thị Mai'
          }
        ]
      }
    ];
  }

  private loadInitialModerationProducts(): ModerationProduct[] {
    return [
      { id: 'MOD-P-001', vendor: 'Trang trại Xoài Cát Chu', vendorId: 'VND-003', product: 'Xoài cát giống mới xuất khẩu', flag: 'Hình ảnh mờ, nhãn mác không khớp tiêu chuẩn VietGAP', severity: 'Thấp', status: 'PENDING', statusLabel: 'Chờ duyệt', reportedAt: '17/09/2026 14:00' },
      { id: 'MOD-P-002', vendor: 'Trang trại Bơ Sáp Cẩm Mỹ', vendorId: 'VND-005', product: 'Bơ 034 giảm giá 90% xả kho', flag: 'Khuyến mãi bất thường, nghi vấn xả hàng sâu thối', severity: 'Cao', status: 'PENDING', statusLabel: 'Chờ duyệt', reportedAt: '18/09/2026 09:30' },
      { id: 'MOD-P-003', vendor: 'HTX Nông nghiệp CNC Lạc Dương', vendorId: 'VND-001', product: 'Rau lá hỗn hợp đóng gói', flag: 'Mô tả chứa từ khóa vi phạm quy chuẩn an toàn hóa chất', severity: 'Nghiêm trọng', status: 'HIDDEN', statusLabel: 'Đã ẩn', reportedAt: '17/09/2026 16:55', reason: 'Tự động ẩn do vi phạm chính sách kiểm duyệt từ khóa' }
    ];
  }

  private loadInitialModerationReviews(): ModerationReview[] {
    return [
      { id: 'MOD-R-101', fromBuyer: 'HTX Bách Hóa Xanh', toVendor: 'HTX Rau sạch Đơn Dương', vendorId: 'VND-002', rating: 1, content: 'Hàng giao trễ nhiều lần, liên hệ kho không phản hồi đúng cam kết.', severity: 'Trung bình', status: 'PENDING', statusLabel: 'Chờ kiểm duyệt', reportedAt: '17/09/2026 11:20' },
      { id: 'MOD-R-102', fromBuyer: 'Chuỗi Cà phê Highlands', toVendor: 'Trang trại Xoài Bình Định', vendorId: 'VND-003', rating: 2, content: 'Xoài bị dập 30%, hình ảnh gửi chào hàng khác với thực tế nhận.', severity: 'Thấp', status: 'PENDING', statusLabel: 'Chờ kiểm duyệt', reportedAt: '16/09/2026 15:45' }
    ];
  }

  private loadInitialCategories(): CategoryItem[] {
    return [
      { id: 'CAT-RL', name: 'Rau lá sạch', parent: null, products: 142, status: 'active' },
      { id: 'CAT-CU', name: 'Củ nông sản', parent: null, products: 87, status: 'active' },
      { id: 'CAT-QU', name: 'Quả tươi', parent: null, products: 198, status: 'active' },
      { id: 'CAT-TP', name: 'Trái cây nhiệt đới', parent: 'CAT-QU', parentName: 'Quả tươi', products: 64, status: 'active' },
      { id: 'CAT-TQ', name: 'Trái cây ôn đới', parent: 'CAT-QU', parentName: 'Quả tươi', products: 42, status: 'active' },
      { id: 'CAT-KH', name: 'Nông sản khác', parent: null, products: 25, status: 'active' }
    ];
  }

  private loadInitialUnits(): UnitItem[] {
    return [
      { id: 'U-KG', name: 'Kilogram', symbol: 'kg', status: 'active' },
      { id: 'U-TAN', name: 'Tấn nông sản', symbol: 'tấn', status: 'active' },
      { id: 'U-THUNG', name: 'Thùng xốp bảo quản', symbol: 'thùng', status: 'active' },
      { id: 'U-KEO', name: 'Kiện hàng 10kg', symbol: 'kiện', status: 'active' },
      { id: 'U-CAI', name: 'Trái / Quả đơn lẻ', symbol: 'trái', status: 'active' }
    ];
  }

  private loadInitialConfigs(): SystemConfigItem[] {
    return [
      { key: 'commissionRate', label: 'Hoa hồng nền tảng', value: 5, unit: '%', group: 'finance', groupLabel: 'Hoa hồng & Định giá', description: 'Tỷ lệ chiết khấu thu từ Người bán trên mỗi đơn hàng hoàn tất.', impactScope: 'Áp dụng cho mọi giao dịch phát sinh mới.' },
      { key: 'subscriptionRate', label: 'Hoa hồng đơn định kỳ', value: 3, unit: '%', group: 'finance', groupLabel: 'Hoa hồng & Định giá', description: 'Tỷ lệ chiết khấu ưu đãi cho khách hàng ký hợp đồng định kỳ.', impactScope: 'Áp dụng cho các gói đăng ký định kỳ mới.' },
      { key: 'escrowReserveRate', label: 'Dự trữ bảo đảm Escrow', value: 5, unit: '%', group: 'finance', groupLabel: 'Đối soát & Ký quỹ', description: 'Tỷ lệ giữ lại tạm thời từ doanh thu mỗi kỳ để xử lý tranh chấp trễ hạn.', impactScope: 'Áp dụng cho kỳ đối soát tiếp theo.' },
      { key: 'settlementCycle', label: 'Chu kỳ đối soát tự động', value: 'Hàng tuần', unit: '', group: 'finance', groupLabel: 'Đối soát & Ký quỹ', description: 'Chu kỳ khóa sổ và lập bảng đối soát chuyển khoản cho Người bán.', impactScope: 'Tất cả tài khoản Người bán trên sàn.' },
      { key: 'orderConfirmWindow', label: 'Thời hạn Người bán cam kết đơn', value: 24, unit: 'giờ', group: 'ops', groupLabel: 'Vận hành & SLA', description: 'Hạn định để Người bán phản hồi cam kết nguồn hàng sau khi đơn tạo.', impactScope: 'Quy trình đặt hàng B2B.' },
      { key: 'autoCancelUnpaid', label: 'Tự động hủy đơn chưa thanh toán', value: 72, unit: 'giờ', group: 'ops', groupLabel: 'Vận hành & SLA', description: 'Thời gian tối đa giữ slot nông sản trước khi giải phóng kho.', impactScope: 'Các đơn hàng chọn thanh toán chuyển khoản.' },
      { key: 'kycSlaHours', label: 'SLA thẩm định hồ sơ Người bán', value: 48, unit: 'giờ', group: 'ops', groupLabel: 'Vận hành & SLA', description: 'Thời gian tối đa để đội Vận hành duyệt hoặc yêu cầu bổ sung hồ sơ.', impactScope: 'Hàng đợi thẩm định KYC.' },
      { key: 'vendorScoreFormula', label: 'Công thức tính điểm Người bán (Vendor Score)', value: '0.4 * GiaoDungGio + 0.3 * TyLeDapUng + 0.2 * TranhChapNguoc + 0.1 * DanhGiaSao', unit: '', group: 'formula', groupLabel: 'Công thức tính điểm', description: 'Trọng số đánh giá mức độ uy tín của nhà vườn.', impactScope: 'Thuật toán xếp hạng sản phẩm trên sàn.' }
    ];
  }

  private loadInitialConfigHistory(): ConfigHistoryRecord[] {
    return [
      {
        id: 'CFG-H-001',
        paramKey: 'commissionRate',
        paramLabel: 'Hoa hồng nền tảng',
        oldValue: '4.5 %',
        newValue: '5.0 %',
        changedBy: 'Phạm Hồng Sơn (Super Admin)',
        changedAt: '18/09/2026 08:00',
        reason: 'Điều chỉnh theo nghị quyết đại hội hội đồng quản trị Q3/2026'
      }
    ];
  }

  private loadInitialRoles(): RoleDefinition[] {
    return [
      {
        id: 'R-SUPER',
        code: 'SUPER_ADMIN',
        name: 'Super Admin',
        description: 'Toàn quyền điều hành cao nhất, quản trị cấu hình hệ thống, RBAC và quyết định chấm dứt đối tác.',
        users: [{ id: 'ADM-001', name: 'Phạm Hồng Sơn' }],
        status: 'active',
        permissions: {
          dashboard: 'FULL',
          reports: 'FULL',
          kyc: 'FULL',
          accounts: 'FULL',
          transactions: 'FULL',
          disputes: 'FULL',
          refunds: 'FULL',
          settlements: 'FULL',
          moderation: 'FULL',
          categories: 'FULL',
          config: 'FULL',
          rbac: 'FULL',
          audit: 'FULL'
        }
      },
      {
        id: 'R-OPS',
        code: 'OPS_ADMIN',
        name: 'Vận hành (Operations Admin)',
        description: 'Quản lý thẩm định hồ sơ KYC, xử lý tài khoản Người bán/Người mua, phán quyết tranh chấp và kiểm duyệt.',
        users: [{ id: 'ADM-002', name: 'Lê Quốc Hưng' }, { id: 'ADM-003', name: 'Hoàng Kim Chi' }],
        status: 'active',
        permissions: {
          dashboard: 'VIEW',
          reports: 'VIEW',
          kyc: 'FULL',
          accounts: 'LIMITED', // Can suspend/reactivate, CANNOT terminate (Rule D3)
          transactions: 'VIEW',
          disputes: 'FULL', // Can decide dispute, sets to PENDING_REFUND_EXECUTION
          refunds: 'NONE', // Cannot execute refunds (Rule D2)
          settlements: 'VIEW',
          moderation: 'FULL',
          categories: 'FULL',
          config: 'VIEW',
          rbac: 'NONE',
          audit: 'VIEW'
        }
      },
      {
        id: 'R-FIN',
        code: 'FIN_ADMIN',
        name: 'Tài chính (Finance Admin)',
        description: 'Quản trị dòng tiền, giám sát đối soát tuần, xử lý thanh toán và thực thi các lệnh hoàn tiền Escrow.',
        users: [{ id: 'ADM-004', name: 'Nguyễn Thị Mai' }],
        status: 'active',
        permissions: {
          dashboard: 'VIEW',
          reports: 'FULL',
          kyc: 'VIEW',
          accounts: 'VIEW',
          transactions: 'FULL',
          disputes: 'VIEW',
          refunds: 'FULL', // Only Finance & Super Admin can execute refunds (Rule D2)
          settlements: 'FULL',
          moderation: 'NONE',
          categories: 'VIEW',
          config: 'VIEW',
          rbac: 'NONE',
          audit: 'VIEW'
        }
      },
      {
        id: 'R-COMP',
        code: 'COMP_ADMIN',
        name: 'Tuân thủ (Compliance Admin)',
        description: 'Giám sát tính minh bạch, kiểm tra an toàn dữ liệu, toàn quyền tra cứu và xuất file Nhật ký kiểm toán.',
        users: [{ id: 'ADM-005', name: 'Trần Văn Tuấn' }],
        status: 'active',
        permissions: {
          dashboard: 'VIEW',
          reports: 'VIEW',
          kyc: 'VIEW',
          accounts: 'VIEW',
          transactions: 'VIEW',
          disputes: 'VIEW',
          refunds: 'VIEW',
          settlements: 'VIEW',
          moderation: 'VIEW',
          categories: 'VIEW',
          config: 'VIEW',
          rbac: 'VIEW',
          audit: 'FULL' // Can export CSV
        }
      }
    ];
  }

  private loadInitialAuditLogs(): AuditLog[] {
    return [
      { id: 'LOG-18092026-001', actor: 'Lê Quốc Hưng (Vận hành)', role: 'OPS_ADMIN', action: 'DISPUTE:ASSIGN', actionLabel: 'Phân công tranh chấp', object: 'DSP-2026-0917-007', before: 'unassigned', after: 'ADM-002', reason: 'Tiếp nhận xử lý tranh chấp cà rốt baby', ip: '10.10.4.18', createdAt: '18/09/2026 10:42' },
      { id: 'LOG-18092026-002', actor: 'Nguyễn Thị Mai (Tài chính)', role: 'FIN_ADMIN', action: 'REFUND:EXECUTE', actionLabel: 'Thực thi hoàn tiền', object: 'PAY-20260918-0005', before: 'PENDING_EXECUTION', after: 'SUCCESS (+4.860.000 ₫)', reason: 'Giải ngân lệnh hoàn tiền một phần theo phán quyết', ip: '10.10.4.22', createdAt: '18/09/2026 11:26' },
      { id: 'LOG-18092026-003', actor: 'Phạm Hồng Sơn (Super Admin)', role: 'SUPER_ADMIN', action: 'CONFIG:UPDATE', actionLabel: 'Cập nhật cấu hình', object: 'commissionRate', before: '4.5%', after: '5.0%', reason: 'Điều chỉnh theo quyết định điều hành Q3/2026', ip: '10.10.4.1', createdAt: '18/09/2026 08:00' },
      { id: 'LOG-17092026-014', actor: 'Lê Quốc Hưng (Vận hành)', role: 'OPS_ADMIN', action: 'KYC:APPROVE', actionLabel: 'Phê duyệt KYC', object: 'KYC-2026-0915-002', before: 'PENDING', after: 'APPROVED (STANDARD)', reason: 'Hồ sơ đầy đủ chứng chỉ VietGAP còn hiệu lực', ip: '10.10.4.18', createdAt: '17/09/2026 13:45' },
      { id: 'LOG-17092026-015', actor: 'Lê Quốc Hưng (Vận hành)', role: 'OPS_ADMIN', action: 'MOD:HIDE', actionLabel: 'Ẩn sản phẩm vi phạm', object: 'MOD-P-003', before: 'PENDING', after: 'HIDDEN', reason: 'Mô tả chứa từ khóa vi phạm an toàn hóa chất', ip: '10.10.4.18', createdAt: '17/09/2026 16:55' },
      { id: 'LOG-17092026-016', actor: 'Hoàng Kim Chi (Vận hành)', role: 'OPS_ADMIN', action: 'VND_MGMT:SUSPEND', actionLabel: 'Tạm khóa Người bán', object: 'VND-003', before: 'active', after: 'suspended', reason: 'Tỷ lệ tranh chấp đơn hàng vượt ngưỡng 8% trong tháng', ip: '10.10.4.19', createdAt: '17/09/2026 17:30' },
      { id: 'LOG-16092026-007', actor: 'Trần Văn Tuấn (Tuân thủ)', role: 'COMP_ADMIN', action: 'AUDIT:EXPORT', actionLabel: 'Xuất file kiểm toán', object: 'audit-2026-09-W2.csv', before: '—', after: 'downloaded', reason: 'Báo cáo rà soát định kỳ cho ban kiểm soát', ip: '10.10.4.31', createdAt: '16/09/2026 09:15' }
    ];
  }

  private loadInitialNotifications(): AdminNotification[] {
    return [
      { id: 'N-001', title: 'Yêu cầu phân công tranh chấp DSP-2026-0918-001', detail: 'Đơn hàng bắp cải Lạc Dương có tranh chấp mới, cần Ops phân công thẩm định trong 4h.', read: false, level: 'warning', target: 'disputes', targetRole: 'OPS_ADMIN', createdAt: '18/09/2026 09:30' },
      { id: 'N-002', title: 'Hồ sơ KYC vượt SLA 48 giờ', detail: 'Hồ sơ Trang trại Bơ Cẩm Mỹ (#KYC-2026-0917-007) đã quá hạn 35h, cần xử lý ngay.', read: false, level: 'critical', target: 'kyc', targetRole: 'OPS_ADMIN', createdAt: '18/09/2026 08:00' },
      { id: 'N-003', title: 'Kỳ đối soát Tuần 3 đã tạo bản tính', detail: 'Sẵn sàng rà soát và chốt số liệu thanh toán cho Người bán.', read: true, level: 'info', target: 'settlements', targetRole: 'FIN_ADMIN', createdAt: '18/09/2026 07:30' },
      { id: 'N-004', title: 'Lệnh hoàn tiền thất bại qua cổng thanh toán', detail: 'Lệnh REF-20260917-02 hoàn tiền cho Bách Hóa Xanh gặp sự cố 502, cần kiểm tra thử lại.', read: false, level: 'critical', target: 'refunds', targetRole: 'FIN_ADMIN', createdAt: '18/09/2026 07:00' }
    ];
  }

  private persist(key: string, data: any): void {
    this.storage.setItem(this.STORAGE_PREFIX + key, data);
  }
}

