/* Mock data cho Admin prototype.
 * Toàn bộ dữ liệu mô phỏng, lưu trong bộ nhớ trình duyệt, tải lại sẽ khôi phục.
 * Mapping tới tài liệu: KAGGRI-TRADE Admin SRS (10 modules) + Đặc tả 16 màn hình Admin.
 */
window.KAGGRI_ADMIN_DATA = {
  // Người dùng Admin hiện tại (mặc định: Super Admin để có toàn quyền xem)
  currentAdmin: {
    id: "ADM-001",
    name: "Phạm Hồng Sơn",
    role: "SUPER_ADMIN",
    roleLabel: "Super Admin",
    avatar: "SH",
    loginAt: "18/09/2026 21:42"
  },

  // Module 8: Cấu hình hệ thống (mapping ID bên dưới)
  systemConfig: {
    commissionRate: { value: 5, label: "Hoa hồng nền tảng", unit: "%" },
    subscriptionRate: { value: 3, label: "Hoa hồng đăng ký định kỳ", unit: "%" },
    orderConfirmWindow: { value: 24, label: "Cửa sổ xác nhận đơn", unit: "giờ" },
    autoCancelUnpaid: { value: 72, label: "Auto-cancel đơn chưa thanh toán", unit: "giờ" },
    disputeOpenWindow: { value: 72, label: "Cửa sổ nộp tranh chấp", unit: "giờ" },
    vendorResponseWindow: { value: 48, label: "Phản hồi Vendor cho dispute", unit: "giờ" },
    settlementCycle: { value: "WEEKLY", label: "Chu kỳ đối soát", unit: "" },
    escrowReserveRate: { value: 5, label: "Dự trữ Escrow", unit: "%" },
    kycSlaHours: { value: 48, label: "SLA xem xét KYC", unit: "giờ" },
    vendorScoreFormula: {
      label: "Công thức Vendor Score",
      expression: "0.4 * onTimeRate + 0.3 * fulfilmentRate + 0.2 * disputeInverse + 0.1 * reviewAvg"
    }
  },

  // Module 2: Hồ sơ Vendor chờ xem xét (KYC)
  pendingKyc: [
    {
      id: "KYC-2026-0918-001",
      vendorName: "Hộ kinh doanh Cà chua Mộc Châu",
      representative: "Trần Văn Đức",
      taxCode: "HKD-MC-00482",
      address: "Mộc Châu, Sơn La",
      submittedAt: "17/09/2026 14:25",
      slaDeadline: "19/09/2026 14:25",
      slaStatus: "on-track",
      tier: "BASIC",
      documents: ["Giấy đăng ký hộ kinh doanh", "CMND/CCCD chủ hộ", "Ảnh mặt bằng"],
      priority: "Bình thường"
    },
    {
      id: "KYC-2026-0918-002",
      vendorName: "HTX Dứa Queen Lâm Đồng",
      representative: "Lê Thị Hương",
      taxCode: "HTX-LD-0294",
      address: "Đức Trọng, Lâm Đồng",
      submittedAt: "16/09/2026 09:10",
      slaDeadline: "18/09/2026 09:10",
      slaStatus: "at-risk",
      tier: "STANDARD",
      documents: ["Giấy đăng ký HTX", "Chứng nhận VietGAP", "Xác minh ngân hàng", "CMND"],
      priority: "Cao"
    },
    {
      id: "KYC-2026-0917-007",
      vendorName: "Trang trại Bơ Sáp Cẩm Mỹ",
      representative: "Nguyễn Văn A",
      taxCode: "HKD-CM-0119",
      address: "Cẩm Mỹ, Đồng Nai",
      submittedAt: "15/09/2026 11:30",
      slaDeadline: "17/09/2026 11:30",
      slaStatus: "breached",
      tier: "PREMIUM",
      documents: ["Giấy đăng ký", "Chứng chỉ GlobalGAP", "Chứng nhận Organic", "CCCD"],
      priority: "Khẩn"
    },
    {
      id: "KYC-2026-0918-003",
      vendorName: "Hộ KD Thanh Long Bình Thuận",
      representative: "Đỗ Thị B",
      taxCode: "HKD-BT-0512",
      address: "Hàm Thuận Nam, Bình Thuận",
      submittedAt: "18/09/2026 08:00",
      slaDeadline: "20/09/2026 08:00",
      slaStatus: "on-track",
      tier: "BASIC",
      documents: ["Giấy đăng ký", "CMND", "Ảnh vườn"],
      priority: "Bình thường"
    }
  ],

  // Module 1: Quản lý tài khoản Buyer/Vendor
  accounts: {
    vendors: [
      { id: "VND-001", company: "HTX Nông nghiệp CNC Lạc Dương", tier: "PREMIUM", status: "active", createdAt: "12/03/2025", lastActive: "18/09/2026", region: "Lâm Đồng", score: 4.7 },
      { id: "VND-002", company: "HTX Rau sạch Đơn Dương", tier: "STANDARD", status: "active", createdAt: "02/05/2025", lastActive: "18/09/2026", region: "Lâm Đồng", score: 4.4 },
      { id: "VND-003", company: "Trang trại Xoài Cát Chu Bình Định", tier: "STANDARD", status: "suspended", createdAt: "11/07/2025", lastActive: "30/08/2026", region: "Bình Định", score: 3.9 },
      { id: "VND-004", company: "Hộ KD Cam Cao Phong Hòa Bình", tier: "BASIC", status: "active", createdAt: "22/01/2026", lastActive: "17/09/2026", region: "Hòa Bình", score: 4.1 },
      { id: "VND-005", company: "HTX Dứa Queen Lâm Đồng", tier: "STANDARD", status: "pending_kyc", createdAt: "16/09/2026", lastActive: "16/09/2026", region: "Lâm Đồng", score: null },
      { id: "VND-006", company: "Trang trại Thanh Long Bình Thuận", tier: "BASIC", status: "terminated", createdAt: "08/06/2025", lastActive: "01/02/2026", region: "Bình Thuận", score: 2.8 }
    ],
    buyers: [
      { id: "BUY-001", company: "HTX Bách Hóa Xanh", type: "Doanh nghiệp F&B", status: "active", createdAt: "10/01/2025", lastActive: "18/09/2026", region: "TP.HCM", creditLimit: 50000000 },
      { id: "BUY-002", company: "Nhà máy Chế biến Rau quả Đà Lạt", type: "Nhà máy chế biến", status: "active", createdAt: "14/02/2025", lastActive: "17/09/2026", region: "Lâm Đồng", creditLimit: 200000000 },
      { id: "BUY-003", company: "Chuỗi Cà phê Highlands", type: "Chuỗi F&B", status: "active", createdAt: "20/03/2025", lastActive: "18/09/2026", region: "TP.HCM", creditLimit: 80000000 },
      { id: "BUY-004", company: "Bếp ăn tập thể KCN Tân Bình", type: "Bếp ăn công nghiệp", status: "suspended", createdAt: "10/06/2025", lastActive: "02/09/2026", region: "TP.HCM", creditLimit: 30000000 },
      { id: "BUY-005", company: "Siêu thị Co.opmart Cần Thơ", type: "Hệ thống bán lẻ", status: "active", createdAt: "05/04/2025", lastActive: "18/09/2026", region: "Cần Thơ", creditLimit: 250000000 }
    ]
  },

  // Module 4: Giám sát giao dịch (transactions)
  transactions: [
    { id: "PAY-20260918-0001", buyer: "HTX Bách Hóa Xanh", vendor: "HTX Lạc Dương", amount: 18450000, type: "ORDER_PAYMENT", status: "success", provider: "VNPay", createdAt: "18/09/2026 09:42" },
    { id: "PAY-20260918-0002", buyer: "Highlands Coffee", vendor: "HTX Đơn Dương", amount: 6400000, type: "ORDER_PAYMENT", status: "processing", provider: "MoMo", createdAt: "18/09/2026 10:11" },
    { id: "PAY-20260918-0003", buyer: "Co.opmart Cần Thơ", vendor: "Trang trại Cam Cao Phong", amount: 32500000, type: "ORDER_PAYMENT", status: "failed", provider: "Stripe", createdAt: "18/09/2026 10:35", reason: "Insufficient funds" },
    { id: "PAY-20260918-0004", buyer: "HTX Bách Hóa Xanh", vendor: "HTX Lạc Dương", amount: 12300000, type: "ESCROW_RELEASE", status: "success", provider: "VNPay", createdAt: "18/09/2026 11:08" },
    { id: "PAY-20260918-0005", buyer: "Bếp ăn KCN", vendor: "HTX Đơn Dương", amount: 4860000, type: "REFUND_PARTIAL", status: "success", provider: "VNPay", createdAt: "18/09/2026 11:25" },
    { id: "PAY-20260917-0098", buyer: "Co.opmart Cần Thơ", vendor: "Trang trại Thanh Long", amount: 21000000, type: "ORDER_PAYMENT", status: "flagged", provider: "VNPay", createdAt: "17/09/2026 22:14", reason: "Giá trị cao bất thường" },
    { id: "PAY-20260917-0097", buyer: "Nhà máy Chế biến", vendor: "HTX Lạc Dương", amount: 8750000, type: "SETTLEMENT_PAYOUT", status: "success", provider: "VNPay", createdAt: "17/09/2026 16:00" },
    { id: "PAY-20260917-0096", buyer: "Highlands Coffee", vendor: "Trang trại Cam Cao Phong", amount: 4200000, type: "ESCROW_HOLD", status: "success", provider: "MoMo", createdAt: "17/09/2026 14:32" }
  ],

  // Module 5: Tranh chấp / Dispute
  disputes: [
    {
      id: "DSP-2026-0918-001",
      orderId: "VO-2051",
      buyer: "HTX Bách Hóa Xanh",
      vendor: "HTX Lạc Dương",
      product: "Bắp cải sạch VietGAP",
      qty: 300, affected: 28,
      reason: "Chênh lệch số lượng",
      description: "28 kg bắp cải có dấu hiệu héo, cần hoàn tiền phần hỏng.",
      status: "OPENED",
      slaDeadline: "20/09/2026 21:00",
      assignedTo: null,
      escrowAmount: 5040000,
      evidenceBuyer: ["Ảnh kiện hàng", "Ảnh bắp cải héo"],
      openedAt: "18/09/2026 09:00"
    },
    {
      id: "DSP-2026-0917-007",
      orderId: "VO-2050",
      buyer: "Café Vườn Mây",
      vendor: "HTX Đơn Dương",
      product: "Cà rốt baby",
      qty: 80, affected: 12,
      reason: "Sai sản phẩm",
      description: "Giao cà rốt thường thay vì cà rốt baby đã đặt.",
      status: "AWAITING_VENDOR",
      slaDeadline: "19/09/2026 18:00",
      assignedTo: "ADM-002 (Ops)",
      escrowAmount: 264000,
      evidenceBuyer: ["Ảnh sản phẩm nhận", "Phiếu giao hàng"],
      openedAt: "17/09/2026 16:30"
    },
    {
      id: "DSP-2026-0917-005",
      orderId: "VO-2048",
      buyer: "Highlands Coffee",
      vendor: "HTX Đơn Dương",
      product: "Ớt chuông Sweet Palermo",
      qty: 120, affected: 15,
      reason: "Vấn đề chất lượng",
      description: "15 kg ớt bị thối đầu, cần hoàn tiền hoặc giao bù.",
      status: "UNDER_REVIEW",
      slaDeadline: "20/09/2026 14:00",
      assignedTo: "ADM-002 (Ops)",
      escrowAmount: 675000,
      evidenceBuyer: ["Ảnh đầu thối", "Video mở kiện"],
      evidenceVendor: ["Báo cáo kiểm kho ngày giao"],
      openedAt: "17/09/2026 11:00",
      vendorResponse: "Sẵn sàng giao bù 10 kg và hoàn 50% phần lỗ."
    },
    {
      id: "DSP-2026-0916-002",
      orderId: "VO-2043",
      buyer: "Café Vườn Mây",
      vendor: "HTX Lạc Dương",
      product: "Bắp cải sạch",
      qty: 50, affected: 8,
      reason: "Vấn đề đóng gói",
      description: "8/50 kg bị dập do bao bì không đạt.",
      status: "MORE_EVIDENCE_REQUIRED",
      slaDeadline: "19/09/2026 12:00",
      assignedTo: "ADM-002 (Ops)",
      escrowAmount: 134400,
      evidenceBuyer: ["Ảnh 8 kg bị dập"],
      openedAt: "16/09/2026 14:00",
      note: "Cần Admin yêu cầu thêm ảnh kiện nguyên seal."
    },
    {
      id: "DSP-2026-0914-009",
      orderId: "VO-2032",
      buyer: "Co.opmart Cần Thơ",
      vendor: "Trang trại Cam Cao Phong",
      product: "Cam Cao Phong",
      qty: 600, affected: 0,
      reason: "Giao trễ",
      description: "Giao trễ 3 ngày so với cam kết, yêu cầu đền bù.",
      status: "RESOLVED_REFUND_FULL",
      slaDeadline: "16/09/2026 10:00",
      assignedTo: "ADM-002 (Ops)",
      escrowAmount: 0,
      openedAt: "14/09/2026 11:20",
      resolvedAt: "15/09/2026 09:00",
      decision: "Hoàn tiền toàn bộ đơn."
    }
  ],

  // Module 6: Đối soát (Settlement)
  settlements: [
    {
      id: "SET-2026-09-W3",
      period: "Tuần 3 / Tháng 9 / 2026",
      cutOffDate: "20/09/2026 23:59",
      calcDate: "21/09/2026",
      payDate: "23/09/2026",
      status: "DRAFT",
      vendors: [
        { vendorId: "VND-001", name: "HTX Lạc Dương", grossGMV: 184500000, refunds: 4320000, commission: 9225000, escrowReserve: 9225000, netPayout: 161730000 },
        { vendorId: "VND-002", name: "HTX Đơn Dương", grossGMV: 122300000, refunds: 1080000, commission: 6115000, escrowReserve: 6115000, netPayout: 109000000 }
      ]
    },
    {
      id: "SET-2026-09-W2",
      period: "Tuần 2 / Tháng 9 / 2026",
      cutOffDate: "13/09/2026 23:59",
      calcDate: "14/09/2026",
      payDate: "16/09/2026",
      status: "PAYING",
      vendors: [
        { vendorId: "VND-001", name: "HTX Lạc Dương", grossGMV: 168200000, refunds: 0, commission: 8410000, escrowReserve: 8410000, netPayout: 151380000 },
        { vendorId: "VND-002", name: "HTX Đơn Dương", grossGMV: 110500000, refunds: 720000, commission: 5525000, escrowReserve: 5525000, netPayout: 98735000 }
      ]
    },
    {
      id: "SET-2026-09-W1",
      period: "Tuần 1 / Tháng 9 / 2026",
      cutOffDate: "06/09/2026 23:59",
      calcDate: "07/09/2026",
      payDate: "09/09/2026",
      status: "PAID",
      vendors: [
        { vendorId: "VND-001", name: "HTX Lạc Dương", grossGMV: 156700000, refunds: 0, commission: 7835000, escrowReserve: 7835000, netPayout: 141030000 },
        { vendorId: "VND-002", name: "HTX Đơn Dương", grossGMV: 98400000, refunds: 1240000, commission: 4920000, escrowReserve: 4920000, netPayout: 87320000 }
      ]
    }
  ],

  // Module 7: Kiểm duyệt nội dung (Moderation)
  moderation: {
    products: [
      { id: "MOD-P-001", vendor: "Trang trại Xoài Cát Chu", product: "Xoài cát giống mới", flag: "Hình ảnh mờ, cần xác minh nguồn gốc", severity: "Thấp", status: "PENDING", reportedAt: "17/09/2026" },
      { id: "MOD-P-002", vendor: "Hộ KD Bơ Sáp Cẩm Mỹ", product: "Bơ 034 giảm giá 90%", flag: "Khuyến mãi bất thường, có thể lừa đảo", severity: "Cao", status: "PENDING", reportedAt: "18/09/2026" },
      { id: "MOD-P-003", vendor: "HTX Lạc Dương", product: "Rau lá tổng hợp", flag: "Mô tả chứa từ khóa 'thuốc trừ sâu'", severity: "Nghiêm trọng", status: "HIDDEN", reportedAt: "17/09/2026" }
    ],
    reviews: [
      { id: "MOD-R-101", fromBuyer: "HTX Bách Hóa Xanh", toVendor: "HTX Đơn Dương", rating: 1, content: "Hàng giao trễ nhiều lần, không phản hồi.", severity: "Trung bình", status: "PENDING", reportedAt: "17/09/2026", reason: "Ngôn từ không phù hợp?" },
      { id: "MOD-R-102", fromBuyer: "Café Vườn Mây", toVendor: "Trang trại Xoài Bình Định", rating: 2, content: "Xoài bị dập 30%, hình ảnh khác thực tế.", severity: "Thấp", status: "PENDING", reportedAt: "16/09/2026" }
    ]
  },

  // Module 9: RBAC
  roles: [
    {
      id: "R-SUPER",
      code: "SUPER_ADMIN",
      name: "Super Admin",
      description: "Toàn quyền hệ thống, bao gồm cấu hình và quản trị RBAC.",
      users: ["ADM-001"],
      permissions: ["*"]
    },
    {
      id: "R-OPS",
      code: "OPS_ADMIN",
      name: "Operations Admin",
      description: "Vận hành: Vendor/Buyer, KYC, tranh chấp, kiểm duyệt.",
      users: ["ADM-002", "ADM-003"],
      permissions: [
        "VND_MGMT:VIEW", "VND_MGMT:APPROVE", "VND_MGMT:SUSPEND",
        "BUY_MGMT:VIEW", "BUY_MGMT:LIST",
        "KYC:VIEW", "KYC:REVIEW", "KYC:DECIDE",
        "DISPUTE:VIEW", "DISPUTE:ASSIGN", "DISPUTE:DECIDE",
        "MOD:VIEW", "MOD:APPROVE", "MOD:HIDE",
        "DASH:VIEW",
        "REPORT:VIEW"
      ]
    },
    {
      id: "R-FIN",
      code: "FIN_ADMIN",
      name: "Finance Admin",
      description: "Tài chính: giao dịch, đối soát, xử lý hoàn tiền.",
      users: ["ADM-004"],
      permissions: [
        "TXN:VIEW", "TXN:REFUND",
        "SETTLEMENT:VIEW", "SETTLEMENT:CREATE", "SETTLEMENT:FINALIZE", "SETTLEMENT:PAY",
        "DASH:VIEW", "REPORT:VIEW"
      ]
    },
    {
      id: "R-COMP",
      code: "COMP_ADMIN",
      name: "Compliance Admin",
      description: "Tuân thủ: audit logs, báo cáo quy định (chỉ xem).",
      users: ["ADM-005"],
      permissions: [
        "AUDIT:VIEW", "AUDIT:EXPORT",
        "DASH:VIEW", "REPORT:VIEW"
      ]
    }
  ],

  // Module 10: Audit logs
  auditLogs: [
    { id: "LOG-18092026-001", actor: "ADM-002 (Ops)", action: "DISPUTE:ASSIGN", object: "DSP-2026-0917-007", before: "unassigned", after: "ADM-002", ip: "10.10.4.18", createdAt: "18/09/2026 10:42" },
    { id: "LOG-18092026-002", actor: "ADM-004 (Fin)", action: "TXN:REFUND", object: "PAY-20260918-0005", before: "—", after: "+4.860.000 ₫ (Buyer)", ip: "10.10.4.22", createdAt: "18/09/2026 11:26" },
    { id: "LOG-18092026-003", actor: "ADM-001 (Super)", action: "CONFIG:UPDATE", object: "commissionRate", before: "4.5%", after: "5%", ip: "10.10.4.1", createdAt: "18/09/2026 08:00" },
    { id: "LOG-17092026-014", actor: "ADM-002 (Ops)", action: "KYC:APPROVE", object: "KYC-2026-0915-002", before: "pending", after: "approved (BASIC)", ip: "10.10.4.18", createdAt: "17/09/2026 13:45" },
    { id: "LOG-17092026-015", actor: "ADM-002 (Ops)", action: "MOD:HIDE", object: "MOD-P-003", before: "live", after: "hidden", ip: "10.10.4.18", createdAt: "17/09/2026 16:55" },
    { id: "LOG-17092026-016", actor: "ADM-003 (Ops)", action: "VND_MGMT:SUSPEND", object: "VND-003", before: "active", after: "suspended", ip: "10.10.4.19", createdAt: "17/09/2026 17:30", reason: "Tỷ lệ tranh chấp > 8%" },
    { id: "LOG-16092026-007", actor: "ADM-005 (Comp)", action: "AUDIT:EXPORT", object: "audit-2026-09-W2.csv", before: "—", after: "downloaded", ip: "10.10.4.31", createdAt: "16/09/2026 09:15" },
    { id: "LOG-16092026-008", actor: "ADM-001 (Super)", action: "RBAC:GRANT", object: "R-FIN", before: "TXN:REFUND=—", after: "granted", ip: "10.10.4.1", createdAt: "16/09/2026 10:00" },
    { id: "LOG-15092026-021", actor: "System", action: "SETTLEMENT:AUTO_FINALIZE", object: "SET-2026-09-W1", before: "CALCULATED", after: "FINALIZED", ip: "system", createdAt: "15/09/2026 11:30" },
    { id: "LOG-15092026-022", actor: "ADM-004 (Fin)", action: "SETTLEMENT:PAY", object: "SET-2026-09-W1", before: "FINALIZED", after: "PAID", ip: "10.10.4.22", createdAt: "15/09/2026 16:42" },
    { id: "LOG-14092026-031", actor: "ADM-002 (Ops)", action: "DISPUTE:DECIDE", object: "DSP-2026-0914-009", before: "AWAITING_ADMIN", after: "RESOLVED_REFUND_FULL", ip: "10.10.4.18", createdAt: "14/09/2026 09:45" }
  ],

  // Module 6: Danh mục chung (Category/Unit) cho Admin
  categories: [
    { id: "CAT-RL", name: "Rau lá", parent: null, products: 142 },
    { id: "CAT-CU", name: "Củ", parent: null, products: 87 },
    { id: "CAT-QU", name: "Quả", parent: null, products: 198 },
    { id: "CAT-TP", name: "Trái cây nhiệt đới", parent: "CAT-QU", products: 64 },
    { id: "CAT-TQ", name: "Trái cây ôn đới", parent: "CAT-QU", products: 42 },
    { id: "CAT-KH", name: "Khác", parent: null, products: 25 }
  ],
  units: [
    { id: "U-KG", name: "Kilogram (kg)" },
    { id: "U-TAN", name: "Tấn" },
    { id: "U-THUNG", name: "Thùng" },
    { id: "U-KEO", name: "Keo (10 kg)" },
    { id: "U-CAI", name: "Cái / quả" }
  ],

  // Module 3: Dashboard — Báo cáo tổng quan
  dashboard: {
    kpis: [
      { key: "gmv", label: "GMV tháng này", value: 4258000000, change: "+12.4%", changeDir: "up", threshold: "< 0%", icon: "GMV" },
      { key: "commission", label: "Hoa hồng nền tảng", value: 212900000, change: "+11.8%", changeDir: "up", threshold: "< 0%", icon: "₫" },
      { key: "netRevenue", label: "Doanh thu ròng", value: 184000000, change: "+9.3%", changeDir: "up", threshold: "< 0%", icon: "NR" },
      { key: "vendorsActive", label: "Vendor hoạt động (30 ngày)", value: 248, change: "+6", changeDir: "up", threshold: "—", icon: "VN" },
      { key: "buyersActive", label: "Buyer hoạt động", value: 184, change: "+12", changeDir: "up", threshold: "—", icon: "BY" },
      { key: "paymentSuccess", label: "Tỷ lệ thanh toán thành công", value: 98.4, unit: "%", change: "+0.3%", changeDir: "up", threshold: "< 95%", icon: "PT" },
      { key: "orderComplete", label: "Tỷ lệ hoàn thành đơn", value: 95.7, unit: "%", change: "-0.4%", changeDir: "down", threshold: "< 90%", icon: "OC" },
      { key: "disputeRate", label: "Tỷ lệ tranh chấp", value: 1.8, unit: "%", change: "+0.2%", changeDir: "down", threshold: "> 5%", icon: "DP" }
    ],
    seriesGMV: [
      { date: "01/09", gmv: 1180000000 },
      { date: "04/09", gmv: 1240000000 },
      { date: "07/09", gmv: 1370000000 },
      { date: "10/09", gmv: 1450000000 },
      { date: "13/09", gmv: 1620000000 },
      { date: "16/09", gmv: 1710000000 },
      { date: "18/09", gmv: 1850000000 }
    ],
    topCategories: [
      { name: "Rau lá", share: 38 },
      { name: "Củ", share: 22 },
      { name: "Trái cây nhiệt đới", share: 17 },
      { name: "Trái cây ôn đới", share: 13 },
      { name: "Khác", share: 10 }
    ],
    topVendors: [
      { name: "HTX Lạc Dương", gmv: 528000000 },
      { name: "HTX Đơn Dương", gmv: 412000000 },
      { name: "Trang trại Cam Cao Phong", gmv: 287000000 }
    ],
    alerts: [
      { level: "critical", title: "Webhook VNPay gặp lỗi 502", detail: "Retry 3 lần trong 24h — 18/09 09:30. Cần kiểm tra.", ts: "18/09 09:30" },
      { level: "warning", title: "Tỷ lệ tranh chấp tuần 3 tăng 4.8%", detail: "Tập trung ở nhóm Ớt chuông Sweet Palermo.", ts: "18/09 08:12" },
      { level: "info", title: "4 KYC đang chờ xem xét", detail: "1 hồ sơ đã vượt SLA 48h.", ts: "18/09 07:45" },
      { level: "info", title: "Đơn Preorder lớn chuẩn bị đáo hạn", detail: "Bắp cải Đà Lạt — Highlands 2 tấn / 24/09.", ts: "17/09 18:00" }
    ]
  },

  // Thông báo cho Admin
  notifications: [
    { id: "N-001", title: "Yêu cầu phân công tranh chấp DSP-2026-0918-001", detail: "Đã mở 30 phút, cần Ops phân công trong 4h.", read: false, level: "warning", target: "disputes" },
    { id: "N-002", title: "SLA KYC bị vi phạm", detail: "KYC-2026-0917-007 vượt 48h, leo thang Super Admin.", read: false, level: "critical", target: "kyc" },
    { id: "N-003", title: "Đối soát tuần 3 đã tạo nháp", detail: "Sẵn sàng tính toán GMV hợp lệ.", read: true, level: "info", target: "settlements" },
    { id: "N-004", title: "Webhook retry thất bại — VNPay", detail: "3 lần retry thất bại. Đã mở ticket SRE.", read: false, level: "critical", target: "dashboard" }
  ],

  // Module 11: Báo cáo (Reports)
  reports: [
    { key: "rev-share", label: "Tỷ lệ GMV theo nhóm hàng", type: "line", period: "30 ngày" },
    { key: "dispute-trend", label: "Xu hướng tranh chấp", type: "area", period: "12 tuần" },
    { key: "vendor-score", label: "Phân bố Vendor Score", type: "histogram", period: "Hiện tại" },
    { key: "settlement-speed", label: "Tốc độ thanh toán đối soát", type: "kpi", period: "Tuần 1-3 / 09/2026" }
  ],

  // Helper data cho các dropdown/bộ lọc
  lists: {
    vendorTiers: ["BASIC", "STANDARD", "PREMIUM"],
    accountStatuses: ["active", "suspended", "terminated", "pending_kyc"],
    disputeStatuses: [
      { value: "OPENED", label: "Mới mở — chờ phân công" },
      { value: "AWAITING_VENDOR", label: "Chờ Vendor phản hồi" },
      { value: "UNDER_REVIEW", label: "Admin đang đánh giá" },
      { value: "MORE_EVIDENCE_REQUIRED", label: "Cần bổ sung bằng chứng" },
      { value: "RESOLVED_REFUND_FULL", label: "Đã hoàn tiền toàn bộ" },
      { value: "RESOLVED_REFUND_PARTIAL", label: "Đã hoàn tiền một phần" },
      { value: "RESOLVED_REJECTED", label: "Từ chối tranh chấp" },
      { value: "CLOSED", label: "Đã đóng" }
    ],
    settlementStatuses: ["DRAFT", "CALCULATED", "FINALIZED", "PAYING", "PAID", "FAILED"],
    paymentTypes: ["ORDER_PAYMENT", "ESCROW_RELEASE", "ESCROW_HOLD", "COMMISSION", "REFUND_PARTIAL", "REFUND_FULL", "SETTLEMENT_PAYOUT"],
    paymentProviders: ["VNPay", "MoMo", "PayPal", "Stripe"],
    transactionStatuses: ["success", "processing", "failed", "flagged", "pending"],
    severityLevels: [
      { value: "Nghiêm trọng", label: "Nghiêm trọng", chip: "danger" },
      { value: "Cao", label: "Cao", chip: "danger-soft" },
      { value: "Trung bình", label: "Trung bình", chip: "warning" },
      { value: "Thấp", label: "Thấp", chip: "info" }
    ]
  }
};
