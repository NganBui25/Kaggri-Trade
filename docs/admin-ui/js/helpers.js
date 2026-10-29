/* Helpers - các hàm định dạng, tính toán và truy xuất dùng chung.
 * Theo style prototype buyer/vendor, thuần IIFE gắn vào window.KaggriAdminHelpers.
 */
(() => {
  "use strict";

  const DATA = window.KAGGRI_ADMIN_DATA;

  // Định dạng tiền VND
  const money = (value) => `${new Intl.NumberFormat("vi-VN").format(value || 0)} ₫`;

  // Định dạng số có dấu phân cách nghìn
  const num = (value) => new Intl.NumberFormat("vi-VN").format(value || 0);

  // Định dạng phần trăm
  const pct = (value) => `${value}%`;

  // Escape HTML
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, c => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[c]));

  // Lookup theo id
  const byId = (list, id) => list.find((x) => x.id === id);

  // Lookup an toàn với fallback
  const lookup = (list, predicate, fallback = "—") => {
    const found = list.find(predicate);
    return found == null ? fallback : found;
  };

  // Trạng thái tranh chấp -> nhãn tiếng Việt
  const disputeStatusText = (status) => {
    const map = {
      OPENED: "Mới mở — chờ phân công",
      AWAITING_VENDOR: "Chờ Vendor phản hồi",
      UNDER_REVIEW: "Admin đang đánh giá",
      MORE_EVIDENCE_REQUIRED: "Cần bổ sung bằng chứng",
      RESOLVED_REFUND_FULL: "Đã hoàn tiền toàn bộ",
      RESOLVED_REFUND_PARTIAL: "Hoàn tiền một phần",
      RESOLVED_REJECTED: "Từ chối tranh chấp",
      CLOSED: "Đã đóng"
    };
    return map[status] || status;
  };

  // Trạng thái tranh chấp -> variant badge
  const disputeStatusVariant = (status) => {
    if (status === "OPENED") return "amber";
    if (status === "AWAITING_VENDOR") return "amber";
    if (status === "UNDER_REVIEW") return "blue";
    if (status === "MORE_EVIDENCE_REQUIRED") return "warning";
    if (status?.startsWith("RESOLVED_REFUND")) return "green";
    if (status === "RESOLVED_REJECTED") return "red";
    if (status === "CLOSED") return "gray";
    return "gray";
  };

  // Trạng thái KYC SLA -> variant
  const kycSlaVariant = (sla) => {
    if (sla === "breached") return "red";
    if (sla === "at-risk") return "amber";
    return "green";
  };

  // Trạng thái thanh toán -> variant
  const txnStatusVariant = (status) => ({
    success: "green",
    processing: "blue",
    failed: "red",
    flagged: "amber",
    pending: "gray"
  }[status] || "gray");

  const txnStatusText = (status) => ({
    success: "Thành công",
    processing: "Đang xử lý",
    failed: "Thất bại",
    flagged: "Đang rà soát",
    pending: "Chờ xử lý"
  }[status] || status);

  // Định dạng loại thanh toán
  const paymentTypeText = (type) => ({
    ORDER_PAYMENT: "Thanh toán đơn hàng",
    ESCROW_RELEASE: "Giải phóng Escrow",
    ESCROW_HOLD: "Giữ Escrow",
    COMMISSION: "Khấu trừ hoa hồng",
    REFUND_PARTIAL: "Hoàn tiền một phần",
    REFUND_FULL: "Hoàn tiền toàn bộ",
    SETTLEMENT_PAYOUT: "Thanh toán đối soát"
  }[type] || type);

  // Định dạng trạng thái settlement
  const settlementStatusText = (s) => ({
    DRAFT: "Nháp",
    CALCULATED: "Đã tính",
    FINALIZED: "Đã chốt",
    PAYING: "Đang thanh toán",
    PAID: "Đã thanh toán",
    FAILED: "Thất bại"
  }[s] || s);

  const settlementVariant = (s) => ({
    DRAFT: "gray",
    CALCULATED: "amber",
    FINALIZED: "blue",
    PAYING: "warning",
    PAID: "green",
    FAILED: "red"
  }[s] || "gray");

  // Trạng thái account -> variant
  const accountStatusText = (s) => ({
    active: "Đang hoạt động",
    suspended: "Bị tạm khóa",
    terminated: "Đã chấm dứt",
    pending_kyc: "Chờ duyệt KYC"
  }[s] || s);

  const accountVariant = (s) => ({
    active: "green",
    suspended: "amber",
    terminated: "red",
    pending_kyc: "blue"
  }[s] || "gray");

  // Severity chip variant
  const severityVariant = (sev) => {
    const map = {
      "Nghiêm trọng": "red",
      "Cao": "amber",
      "Trung bình": "warning",
      "Thấp": "blue"
    };
    return map[sev] || "gray";
  };

  // Alert level -> variant
  const alertVariant = (lvl) => ({
    critical: "red",
    warning: "amber",
    info: "blue"
  }[lvl] || "gray");

  // Tier Vendor -> variant
  const tierVariant = (t) => ({
    BASIC: "gray",
    STANDARD: "blue",
    PREMIUM: "green"
  }[t] || "gray");

  // Tính số giờ đến deadline
  const hoursUntilDeadline = (deadline) => {
    // Deadline là chuỗi "dd/mm/yyyy hh:mm" => tính tương đối
    try {
      const [datePart, timePart] = deadline.split(" ");
      const [d, m, y] = datePart.split("/").map(Number);
      const [hh, mm] = (timePart || "00:00").split(":").map(Number);
      const ts = new Date(y, m - 1, d, hh || 0, mm || 0).getTime();
      const now = new Date(2026, 8, 18, 22, 0).getTime(); // mock "now"
      return Math.round((ts - now) / 36e5);
    } catch (e) {
      return 0;
    }
  };

  // Tính KPI đánh giá tăng/giảm so với ngưỡng
  const kpiTone = (kpi) => {
    const t = String(kpi.threshold || "");
    if (t.startsWith(">")) {
      // cao là tốt — đạt mục tiêu nếu vượt ngưỡng
      return kpi.changeDir === "up" ? "up" : "down";
    }
    if (t.startsWith("<")) {
      return kpi.changeDir === "up" ? "down" : "up";
    }
    return "neutral";
  };

  // Xuất CSV từ rows
  const exportCsv = (name, rows) => {
    const csv = "\ufeff" + rows
      .map(row => row.map(v => '"' + String(v ?? "").replaceAll('"', '""') + '"').join(","))
      .join("\r\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = name;
    document.body.append(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  };

  // Tính tổng GMV tuần đang xét
  const sumVendors = (settlementList, key) =>
    (settlementList || []).reduce((acc, v) => acc + (v[key] || 0), 0);

  // Lấy số KPI đã định dạng theo unit
  const formatKpi = (kpi) => {
    if (kpi.unit === "%") return `${kpi.value}%`;
    if (kpi.value >= 1_000_000_000) return `${(kpi.value / 1_000_000_000).toFixed(2)} tỷ`;
    if (kpi.value >= 1_000_000) return `${(kpi.value / 1_000_000).toFixed(1)} tr`;
    return num(kpi.value);
  };

  // Permission mặc định cho role
  const PERMS_BY_ROLE = DATA.roles.reduce((acc, r) => {
    acc[r.code] = r.permissions;
    return acc;
  }, {});

  // Kiểm tra permission
  const hasPermission = (admin, perm) => {
    const perms = PERMS_BY_ROLE[admin.role] || [];
    if (perms.includes("*")) return true;
    return perms.includes(perm);
  };

  // Cặp key/value hiển thị chi tiết
  const detailPair = (label, value) => `
    <div class="detail-pair">
      <span>${esc(label)}</span>
      <strong>${value}</strong>
    </div>
  `;

  window.KaggriAdminHelpers = {
    money, num, pct, esc, byId, lookup,
    disputeStatusText, disputeStatusVariant,
    kycSlaVariant, txnStatusVariant, txnStatusText,
    paymentTypeText, settlementStatusText, settlementVariant,
    accountStatusText, accountVariant, severityVariant,
    alertVariant, tierVariant,
    hoursUntilDeadline, kpiTone, exportCsv,
    sumVendors, formatKpi,
    hasPermission,
    detailPair
  };
})();
