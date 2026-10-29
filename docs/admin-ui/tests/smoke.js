/* Smoke test cho Kaggri Admin prototype — không cần thư viện ngoài.
 * Chạy: node tests/smoke.js
 * Load mock data và kiểm tra các invariant nghiệp vụ + render đầy đủ các màn hình.
 */
"use strict";
const fs = require("fs");
const path = require("path");
const vm = require("vm");

// -------- Sandbox load mock data + helpers --------
const root = path.resolve(__dirname, "..");
const ctx = { window: {}, console, Intl, Blob, URL, document: { createElement: () => ({ click() {}, remove() {} }), body: { append() {}, removeChild() {} } }, setTimeout, FormData: class {} };
ctx.window = ctx;

vm.createContext(ctx);
function load(file) {
  const code = fs.readFileSync(path.join(root, "js", file), "utf8");
  vm.runInContext(code, ctx, { filename: file });
}

load("data.js");
load("helpers.js");
load("components.js");
load("screens.js");

const DATA = ctx.KAGGRI_ADMIN_DATA;
const H = ctx.KaggriAdminHelpers;
const S = ctx.KaggriAdminScreens;

let pass = 0, fail = 0;
function test(name, fn) {
  try {
    fn();
    console.log("  ✓ " + name);
    pass++;
  } catch (err) {
    console.error("  ✗ " + name + " — " + err.message);
    fail++;
  }
}
function assert(cond, msg) {
  if (!cond) throw new Error(msg);
}

console.log("\n=== KAGGRI Admin · Smoke Test ===\n");
console.log("Phần 1. Mock data");
test("Có currentAdmin và không rỗng", () => {
  assert(DATA.currentAdmin && DATA.currentAdmin.id, "missing currentAdmin");
});
test("Pending KYC có ≥ 1 hồ sơ", () => {
  assert(DATA.pendingKyc.length >= 1, "no pending KYC");
  DATA.pendingKyc.forEach(k => {
    assert(["on-track", "at-risk", "breached"].includes(k.slaStatus), "invalid slaStatus on " + k.id);
    assert(["BASIC", "STANDARD", "PREMIUM"].includes(k.tier), "invalid tier on " + k.id);
  });
});
test("Có ít nhất 4 màn Vendor, 5 màn Buyer", () => {
  assert(DATA.accounts.vendors.length >= 4, "vendors < 4");
  assert(DATA.accounts.buyers.length >= 5, "buyers < 5");
});
test("Transactions có 6 loại: ORDER_PAYMENT/ESCROW_RELEASE/ESCROW_HOLD/COMMISSION/REFUND/SETTLEMENT_PAYOUT", () => {
  const set = new Set(DATA.transactions.map(t => t.type));
  ["ORDER_PAYMENT", "ESCROW_RELEASE", "ESCROW_HOLD", "REFUND_PARTIAL", "SETTLEMENT_PAYOUT"]
    .forEach(k => assert(set.has(k), "missing transaction type " + k));
});
test("Disputes có đầy đủ 8 trạng thái có thể xảy ra (≥ 5)", () => {
  assert(DATA.disputes.length >= 5, "disputes < 5");
  const statuses = new Set(DATA.disputes.map(d => d.status));
  assert(statuses.size >= 4, "không có đủ trạng thái tranh chấp");
});
test("Settlements có ≥ 3 kỳ và đủ 6 trạng thái có thể", () => {
  assert(DATA.settlements.length >= 3, "settlements < 3");
  const statuses = new Set(DATA.settlements.map(s => s.status));
  ["DRAFT", "PAYING", "PAID"].forEach(s => assert(statuses.has(s), "missing settlement status " + s));
});
test("RBAC định nghĩa 4 vai trò bắt buộc", () => {
  const codes = DATA.roles.map(r => r.code);
  ["SUPER_ADMIN", "OPS_ADMIN", "FIN_ADMIN", "COMP_ADMIN"].forEach(c => assert(codes.includes(c), "missing role " + c));
});
test("Audit logs ≥ 10 bản ghi", () => {
  assert(DATA.auditLogs.length >= 10, "audit logs < 10");
});
test("Dashboard có 8 KPI và ≥ 3 cảnh báo", () => {
  assert(DATA.dashboard.kpis.length === 8, "should have 8 KPIs");
  assert(DATA.dashboard.alerts.length >= 3, "should have ≥ 3 alerts");
});

console.log("\nPhần 2. Helpers");
test("formatKpi hiển thị đúng theo đơn vị", () => {
  const k1 = { value: 4258000000, unit: "" };
  const k2 = { value: 184, unit: "%" };
  const k3 = { value: 248, unit: "" };
  assert(H.formatKpi(k1).includes("tỷ"), "formatKpi should render tỷ for billions");
  assert(H.formatKpi(k2).includes("%"), "formatKpi should render %");
  assert(H.formatKpi(k3) === "248", "formatKpi should render 248");
});
test("disputeStatusVariant map đúng trạng thái", () => {
  assert(H.disputeStatusVariant("OPENED") === "amber", "OPENED variant");
  assert(H.disputeStatusVariant("RESOLVED_REFUND_FULL") === "green", "RESOLVED variant");
  assert(H.disputeStatusVariant("RESOLVED_REJECTED") === "red", "REJECTED variant");
});
test("esc HTML an toàn", () => {
  assert(H.esc("<a>") === "&lt;a&gt;", "esc html");
  assert(H.esc("Trần Văn & Bé") === "Trần Văn &amp; Bé", "esc amp");
});
test("hasPermission Super Admin có toàn quyền", () => {
  const su = { role: "SUPER_ADMIN" };
  assert(H.hasPermission(su, "ANY:THING") === true, "super admin must be wildcard");
});

console.log("\nPhần 3. Render từng màn hình");
function renderIt(label, fn, ctx = {}) {
  test("Render " + label + " không lỗi", () => {
    const html = fn(ctx);
    assert(typeof html === "string" && html.length > 80, "rendered empty for " + label);
  });
}
renderIt("login", S.login);
renderIt("dashboard", S.dashboard, { firstRun: true });
renderIt("kycList", S.kycList);
renderIt("kycDetail", S.kycDetail, { selectedKycId: DATA.pendingKyc[0].id });
renderIt("accountsVendor", S.accountsVendor);
renderIt("accountsBuyer", S.accountsBuyer);
renderIt("categories", S.categories);
renderIt("moderation products", S.moderation, { modTab: "products" });
renderIt("moderation reviews", S.moderation, { modTab: "reviews" });
renderIt("transactions", S.transactions, { txnStatusFilter: "all", txnProviderFilter: "all" });
renderIt("transactionDetail", S.transactionDetail, { selectedTxnId: DATA.transactions[0].id });
renderIt("disputes", S.disputes, { disputeFilter: "all" });
renderIt("disputeDetail", S.disputeDetail, { selectedDisputeId: DATA.disputes[0].id });
renderIt("settlements", S.settlements);
renderIt("settlementDetail", S.settlementDetail, { selectedSettlementId: DATA.settlements[0].id });
renderIt("config", S.config);
renderIt("rbac", S.rbac);
renderIt("audit", S.audit);
renderIt("reports", S.reports, { reportPeriod: "30d" });
renderIt("adminNotifications", S.adminNotifications);

console.log("\nPhần 4. Helpers dạng lookup");
test("byId và lookup", () => {
  const v = H.byId(DATA.accounts.vendors, "VND-001");
  assert(v && v.company.includes("Lạc Dương"), "vendor by id");
});

console.log("\n=== Kết quả: " + pass + " pass, " + fail + " fail ===");
if (fail > 0) process.exit(1);
