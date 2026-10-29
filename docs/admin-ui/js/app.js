/* App - state, hash routing và tương tác.
 * Mọi dữ liệu là mock, thay đổi chỉ tồn tại trong phiên trình duyệt.
 */
(() => {
  "use strict";

  const H = window.KaggriAdminHelpers;
  const C = window.KaggriAdminComponents;
  const S = window.KaggriAdminScreens;
  const DATA = window.KAGGRI_ADMIN_DATA;

  // State toàn cục
  const state = (window.KAGGRI_ADMIN_STATE = {
    view: "dashboard",
    isAuthed: true, // Mở sẵn dashboard cho demo (passes login transition)
    firstRun: true,
    selectedKycId: DATA.pendingKyc[0]?.id,
    selectedTxnId: DATA.transactions[0]?.id,
    selectedDisputeId: DATA.disputes[0]?.id,
    selectedSettlementId: DATA.settlements[0]?.id,
    kycFilter: "all",
    modTab: "products",
    txnStatusFilter: "all",
    txnProviderFilter: "all",
    disputeFilter: "all",
    reportPeriod: "30d",
    menuOpen: false
  });

  function render() {
    const view = C.titles[state.view] ? state.view : "dashboard";
    const root = document.getElementById("app");
    if (!root) return;

    let content;
    const renderFirstRun = state.firstRun === undefined;
    if (!state.isAuthed) {
      content = S.login();
    } else if (view === "dashboard") {
      content = S.dashboard({ firstRun: renderFirstRun });
      state.firstRun = false;
    } else if (view === "kyc") {
      content = S.kycList();
    } else if (view === "kyc-detail") {
      content = S.kycDetail(state);
    } else if (view === "accounts-vendor") {
      content = S.accountsVendor();
    } else if (view === "accounts-buyer") {
      content = S.accountsBuyer();
    } else if (view === "categories") {
      content = S.categories();
    } else if (view === "moderation") {
      content = S.moderation(state);
    } else if (view === "transactions") {
      content = S.transactions(state);
    } else if (view === "transaction-detail") {
      content = S.transactionDetail(state);
    } else if (view === "disputes") {
      content = S.disputes(state);
    } else if (view === "dispute-detail") {
      content = S.disputeDetail(state);
    } else if (view === "settlements") {
      content = S.settlements(state);
    } else if (view === "settlement-detail") {
      content = S.settlementDetail(state);
    } else if (view === "config") {
      content = S.config(state);
    } else if (view === "rbac") {
      content = S.rbac();
    } else if (view === "audit") {
      content = S.audit();
    } else if (view === "reports") {
      content = S.reports(state);
    } else if (view === "admin-notifications") {
      content = S.adminNotifications();
    } else {
      content = S.dashboard({ firstRun: false });
    }

    root.innerHTML = state.isAuthed
      ? `
        <div class="app-shell">
          ${C.sidebar(state.menuOpen)}
          <div class="mobile-shade ${state.menuOpen ? "show" : ""}" data-action="menu-close"></div>
          <div class="workspace">
            ${C.topBar(null, view)}
            <main class="main">${content}</main>
            <footer class="foot">
              <span><strong>Kaggri-Trade Admin</strong> · Prototype mô phỏng, không kết nối thật.</span>
              <span class="foot-links">
                <a href="${C.pathOf('buyer')}" target="_blank" rel="noopener">Web Buyer ↗</a> ·
                <a href="${C.pathOf('vendor')}" target="_blank" rel="noopener">Web Vendor ↗</a> ·
                <a href="${C.pathOf('root')}" data-portal="root">Cổng tổng</a>
              </span>
            </footer>
          </div>
        </div>
      `
      : `<div class="app-shell no-sidebar">${content}</div>`;

    document.title = `${C.titles[view] || "Admin"} · Kaggri-Trade`;
    drawCharts();
  }

  // Vẽ canvas placeholder cho báo cáo (khi hover sẽ animate giả lập)
  function drawCharts() {
    const canvases = document.querySelectorAll("canvas[data-report-chart]");
    canvases.forEach((c) => drawSimpleSeries(c));
  }
  function drawSimpleSeries(canvas) {
    const ctx = canvas.getContext("2d");
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    const palette = {
      "rev-share": ["#0d623b", "#84b87a"],
      "dispute-trend": ["#b3413c", "#f1a09a"],
      "vendor-score": ["#2c6a46", "#a3c8b1"],
      "settlement-speed": ["#0d623b", "#bba4d6"]
    };
    const colors = palette[canvas.dataset.reportChart] || ["#0d623b", "#84b87a"];
    const points = Array.from({ length: 12 }, () => 0.35 + Math.random() * 0.6);
    if (canvas.dataset.reportChart === "vendor-score") {
      // Histogram
      const bars = [12, 24, 36, 22, 8];
      const bw = w / (bars.length * 1.6);
      bars.forEach((v, i) => {
        const x = i * (w / bars.length) + 8;
        const bh = v * 3;
        ctx.fillStyle = colors[0];
        ctx.fillRect(x, h - bh - 20, bw, bh);
        ctx.fillStyle = "#50665a";
        ctx.font = "11px Inter";
        ctx.fillText(`Nhóm ${i + 1}`, x, h - 6);
      });
      return;
    }
    // Line/area
    ctx.beginPath();
    points.forEach((p, i) => {
      const x = (i / (points.length - 1)) * (w - 10) + 5;
      const y = h - p * (h - 30) - 16;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    });
    ctx.strokeStyle = colors[0];
    ctx.lineWidth = 2;
    ctx.stroke();
    const grad = ctx.createLinearGradient(0, 0, 0, h);
    grad.addColorStop(0, colors[1] + "80");
    grad.addColorStop(1, colors[1] + "00");
    ctx.lineTo(w - 5, h - 16);
    ctx.lineTo(5, h - 16);
    ctx.closePath();
    ctx.fillStyle = grad;
    ctx.fill();
    ctx.fillStyle = "#789285";
    ctx.font = "11px Inter";
    ctx.fillText("Mô phỏng xu hướng 30 ngày", 8, 14);
  }

  function navigate(next) {
    state.view = next;
    state.menuOpen = false;
    location.hash = next;
    render();
    window.scrollTo(0, 0);
  }

  // Click delegation
  document.addEventListener("click", (e) => {
    if (e.target.dataset.portal) {
      const target = e.target.dataset.portal;
      if (target === "root") {
        e.preventDefault();
        window.location.href = C.pathOf("root");
      }
      // Buyer/Vendor default <a target="_blank"> handled by browser
      return;
    }
    if (e.target.closest("[data-overlay]")) {
      C.closeModal();
      return;
    }

    const nav = e.target.closest("[data-nav]");
    if (nav) return navigate(nav.dataset.nav);

    // KYC list open
    const kycOpen = e.target.closest("[data-kyc-open]");
    if (kycOpen) {
      state.selectedKycId = kycOpen.dataset.kycOpen;
      navigate("kyc-detail");
      return;
    }
    const kycRow = e.target.closest("[data-kyc]");
    if (kycRow) {
      state.selectedKycId = kycRow.dataset.kyc;
      navigate("kyc-detail");
      return;
    }
    const kycFilter = e.target.closest("[data-kyc-filter]");
    if (kycFilter) {
      state.kycFilter = kycFilter.dataset.kycFilter;
      render();
      return;
    }

    // Disputes
    const dispRow = e.target.closest("[data-dispute]");
    if (dispRow) {
      state.selectedDisputeId = dispRow.dataset.dispute;
      navigate("dispute-detail");
      return;
    }
    const dispFilter = e.target.closest("[data-dispute-filter]");
    if (dispFilter) {
      state.disputeFilter = dispFilter.dataset.disputeFilter;
      render();
      return;
    }

    // Transactions
    const txnRow = e.target.closest("[data-txn]");
    if (txnRow) {
      state.selectedTxnId = txnRow.dataset.txn;
      navigate("transaction-detail");
      return;
    }
    const txnStatus = e.target.closest("[data-txn-status]");
    if (txnStatus) {
      state.txnStatusFilter = txnStatus.dataset.txnStatus;
      render();
      return;
    }
    const txnProvider = e.target.closest("[data-txn-provider]");
    if (txnProvider) {
      state.txnProviderFilter = txnProvider.value;
      render();
      return;
    }

    // Settlements
    const setRow = e.target.closest("[data-settlement]");
    if (setRow) {
      state.selectedSettlementId = setRow.dataset.settlement;
      navigate("settlement-detail");
      return;
    }

    // Moderation tabs
    const modTab = e.target.closest("[data-mod-tab]");
    if (modTab) {
      state.modTab = modTab.dataset.modTab;
      render();
      return;
    }

    // Notifications
    const notifGo = e.target.closest("[data-notification-go]");
    if (notifGo) {
      navigate(notifGo.dataset.notificationGo);
      return;
    }

    // Action switch
    const action = e.target.closest("[data-action]");
    if (!action) return;
    switch (action.dataset.action) {
      case "menu-toggle":
        state.menuOpen = !state.menuOpen;
        render();
        break;
      case "menu-close":
        state.menuOpen = false;
        render();
        break;
      case "close-modal":
        C.closeModal();
        break;
      case "goto-notifications":
        navigate("admin-notifications");
        break;
      case "goto-kyc":
        navigate("kyc");
        break;
      case "request-evidence":
        openEvidenceModal(action.dataset.dispute);
        break;
      case "kyc-approve":
        resolveKyc(action.dataset.kycId, "APPROVED");
        break;
      case "kyc-request":
        openKycRequest(action.dataset.kycId);
        break;
      case "kyc-reject":
        openKycReject(action.dataset.kycId);
        break;
      case "decision-reject":
        decideDispute(action.dataset.dispute, "RESOLVED_REJECTED");
        break;
      case "decision-partial":
        decideDispute(action.dataset.dispute, "RESOLVED_REFUND_PARTIAL");
        break;
      case "decision-refund-full":
        decideDispute(action.dataset.dispute, "RESOLVED_REFUND_FULL");
        break;
      case "decision-cancel":
        decideDispute(action.dataset.dispute, "CLOSED");
        break;
      case "open-settlement":
      case "settlement-calculate":
        mutateSettlement(action.dataset.settlement, "CALCULATED");
        break;
      case "settlement-finalize":
        mutateSettlement(action.dataset.settlement, "FINALIZED");
        break;
      case "settlement-pay":
        mutateSettlement(action.dataset.settlement, "PAYING");
        break;
      case "suspend-vendor":
        openSuspend("vendor", action.dataset.vendor);
        break;
      case "reactivate-vendor":
        mutateAccount("vendor", action.dataset.vendor, "active");
        break;
      case "terminate-vendor":
        openTerminate("vendor", action.dataset.vendor);
        break;
      case "view-vendor":
        C.toast(`Mở chi tiết Vendor ${action.dataset.vendor} (mock)`);
        break;
      case "suspend-buyer":
        openSuspend("buyer", action.dataset.buyer);
        break;
      case "reactivate-buyer":
        mutateAccount("buyer", action.dataset.buyer, "active");
        break;
      case "view-buyer":
        C.toast(`Mở chi tiết Buyer ${action.dataset.buyer} (mock)`);
        break;
      case "refund-txn":
        refundTxn(action.dataset.txn);
        break;
      case "mod-approve":
      case "mod-approve-review":
        C.toast("Đã phê duyệt nội dung");
        break;
      case "mod-hide":
      case "mod-hide-review":
        openHideContent();
        break;
      case "mod-terminate":
        C.toast("Đã mở hộp thoại chấm dứt Vendor (mock)");
        break;
      case "new-settlement":
        C.toast("Đã tạo nháp kỳ đối soát mới");
        break;
      case "new-role":
        openNewRole();
        break;
      case "edit-role":
        openEditRole(action.dataset.role);
        break;
      case "delete-role":
        C.toast("Không thể xóa vai trò đang có user — vô hiệu hóa thay thế");
        break;
      case "new-category":
        openNewCategory();
        break;
      case "rename-category":
        openRenameCategory(action.dataset.cat);
        break;
      case "delete-category":
        C.toast("Không thể xóa danh mục đang có sản phẩm — ẩn thay thế");
        break;
      case "new-unit":
        openNewUnit();
        break;
      case "edit-unit":
        openEditUnit(action.dataset.unit);
        break;
      case "reset-config":
        C.toast("Đã khôi phục cấu hình mặc định (mock)");
        break;
      case "export-transactions":
        H.exportCsv("admin-transactions.csv", [
          ["ID", "Buyer", "Vendor", "Amount", "Type", "Status", "Provider", "Created"],
          ...DATA.transactions.map(t => [t.id, t.buyer, t.vendor, t.amount, t.type, t.status, t.provider, t.createdAt])
        ]);
        C.toast("Đã tải admin-transactions.csv");
        break;
      case "export-disputes":
        H.exportCsv("admin-disputes.csv", [
          ["ID", "Order", "Buyer", "Vendor", "Status", "Escrow"],
          ...DATA.disputes.map(d => [d.id, d.orderId, d.buyer, d.vendor, d.status, d.escrowAmount])
        ]);
        C.toast("Đã tải admin-disputes.csv");
        break;
      case "export-settlements":
        H.exportCsv("admin-settlements.csv", [
          ["Period", "Status", "GMV"],
          ...DATA.settlements.map(s => [s.period, s.status, s.vendors.reduce((a, v) => a + v.grossGMV, 0)])
        ]);
        C.toast("Đã tải admin-settlements.csv");
        break;
      case "export-vendors":
        H.exportCsv("admin-vendors.csv", [
          ["ID", "Company", "Tier", "Status"],
          ...DATA.accounts.vendors.map(v => [v.id, v.company, v.tier, v.status])
        ]);
        C.toast("Đã tải admin-vendors.csv");
        break;
      case "export-buyers":
        H.exportCsv("admin-buyers.csv", [
          ["ID", "Company", "Region", "Status", "Credit"],
          ...DATA.accounts.buyers.map(b => [b.id, b.company, b.region, b.status, b.creditLimit])
        ]);
        C.toast("Đã tải admin-buyers.csv");
        break;
      case "export-kyc":
        H.exportCsv("admin-kyc-pending.csv", [
          ["ID", "Vendor", "Submitted", "SLA"],
          ...DATA.pendingKyc.map(k => [k.id, k.vendorName, k.submittedAt, k.slaDeadline])
        ]);
        C.toast("Đã tải admin-kyc-pending.csv");
        break;
      case "export-audit":
        H.exportCsv("admin-audit-log.csv", [
          ["Time", "Actor", "Action", "Object", "Before", "After", "IP"],
          ...DATA.auditLogs.map(a => [a.createdAt, a.actor, a.action, a.object, a.before, a.after, a.ip])
        ]);
        C.toast("Đã tải admin-audit-log.csv");
        break;
      case "export-alerts":
        C.toast("Đã xuất cảnh báo (mock)");
        break;
      case "export-reports":
      case "export-report":
        C.toast("Đã xuất báo cáo (mock)");
        break;
      case "mark-all-read":
        DATA.notifications.forEach(n => n.read = true);
        render();
        C.toast("Đã đánh dấu tất cả đã đọc");
        break;
      case "download-docs":
        C.toast("Đã tải gói tài liệu (mock)");
        break;
      case "goto-order":
      case "goto-vendor-order":
        C.toast("Mở đơn hàng liên quan (mock)");
        break;
    }
  });

  function resolveKyc(id, decision) {
    const idx = DATA.pendingKyc.findIndex(k => k.id === id);
    if (idx >= 0) {
      DATA.pendingKyc.splice(idx, 1);
      logAudit(decision === "APPROVED" ? "KYC:APPROVE" : "KYC:REJECT",
        id, "pending", decision === "APPROVED" ? "approved" : "rejected");
      C.toast(decision === "APPROVED" ? "Đã phê duyệt hồ sơ" : "Đã từ chối hồ sơ");
      navigate("kyc");
    }
  }
  function openKycRequest(id) {
    C.modal("Yêu cầu bổ sung hồ sơ KYC", `
      <div class="field"><span>Lý do yêu cầu bổ sung</span>
        <textarea name="reason" placeholder="VD: Ảnh CCCD bị mờ, vui lòng tải lại ảnh rõ hơn" required></textarea>
      </div>
    `, "Gửi yêu cầu", "kyc-request-submit", "Hủy");
    document.getElementById("modal-form").dataset.kycId = id;
  }
  function openKycReject(id) {
    C.modal("Từ chối hồ sơ KYC", `
      <div class="field"><span>Lý do từ chối</span>
        <textarea name="reason" placeholder="Nhập lý do chi tiết" required></textarea>
      </div>
    `, "Từ chối", "kyc-reject-submit", "Hủy");
    document.getElementById("modal-form").dataset.kycId = id;
  }
  function openEvidenceModal(id) {
    C.modal("Yêu cầu bổ sung bằng chứng", `
      <div class="field"><span>Nội dung yêu cầu</span>
        <textarea name="request" placeholder="VD: Cần ảnh rõ hơn của kiện hàng" required></textarea>
      </div>
    `, "Gửi yêu cầu", "evidence-submit", "Hủy");
    document.getElementById("modal-form").dataset.disputeId = id;
  }
  function decideDispute(id, decision) {
    const d = DATA.disputes.find(x => x.id === id);
    if (!d) return;
    d.status = decision;
    d.resolvedAt = "18/09/2026 22:00";
    d.decision = ({
      RESOLVED_REJECTED: "Từ chối — Vendor giữ 100% tiền hàng.",
      RESOLVED_REFUND_PARTIAL: "Hoàn tiền một phần — chia theo tỷ lệ.",
      RESOLVED_REFUND_FULL: "Hoàn tiền toàn bộ cho Buyer.",
      CLOSED: "Hủy đơn hàng — hoàn tiền trừ phí GD."
    })[decision];
    logAudit("DISPUTE:DECIDE", id, "AWAITING_ADMIN", decision);
    C.toast("Đã ra quyết định cho " + id);
    render();
  }
  function mutateSettlement(id, status) {
    const s = DATA.settlements.find(x => x.id === id);
    if (!s) return;
    const before = s.status;
    s.status = status;
    logAudit("SETTLEMENT:" + status, id, before, status);
    C.toast("Đã cập nhật " + id + " → " + status);
    render();
  }
  function mutateAccount(type, id, status) {
    const list = type === "vendor" ? DATA.accounts.vendors : DATA.accounts.buyers;
    const item = list.find(x => x.id === id);
    if (!item) return;
    const before = item.status;
    item.status = status;
    logAudit(type === "vendor" ? "VND_MGMT:REACTIVATE" : "BUY_MGMT:REACTIVATE", id, before, status);
    C.toast(`Đã cập nhật ${id} → ${status}`);
    render();
  }
  function openSuspend(type, id) {
    C.modal(`Tạm khóa ${type === "vendor" ? "Vendor" : "Buyer"} ${id}`, `
      <div class="field"><span>Lý do tạm khóa (bắt buộc)</span>
        <textarea name="reason" placeholder="VD: Nghi ngờ gian lận đơn hàng" required></textarea>
      </div>
    `, "Tạm khóa", "suspend-submit", "Hủy");
    document.getElementById("modal-form").dataset.id = id;
    document.getElementById("modal-form").dataset.type = type;
  }
  function openTerminate(type, id) {
    C.modal(`Chấm dứt ${type === "vendor" ? "Vendor" : "Buyer"} ${id}`, `
      <div class="field"><span>Lý do chấm dứt (bắt buộc, không thể khôi phục)</span>
        <textarea name="reason" placeholder="VD: Vi phạm chính sách nền tảng nhiều lần" required></textarea>
      </div>
      <div class="callout warn"><strong>Cảnh báo:</strong> Tài khoản sẽ bị khóa vĩnh viễn; mọi đơn đang giao phải xử lý thủ công.</div>
    `, "Chấm dứt", "terminate-submit", "Hủy");
    document.getElementById("modal-form").dataset.id = id;
    document.getElementById("modal-form").dataset.type = type;
  }
  function refundTxn(id) {
    C.modal(`Hoàn tiền giao dịch ${id}`, `
      <div class="field"><span>Số tiền hoàn (VND)</span><input name="amount" type="number" min="1000" required value="${DATA.transactions.find(t=>t.id===id)?.amount || ''}" /></div>
      <div class="field"><span>Lý do</span><textarea name="reason" required></textarea></div>
    `, "Hoàn tiền", "refund-submit", "Hủy");
    document.getElementById("modal-form").dataset.id = id;
  }
  function openHideContent() {
    C.modal("Ẩn nội dung vi phạm", `
      <div class="field"><span>Lý do ẩn (bắt buộc)</span><textarea name="reason" required></textarea></div>
    `, "Ẩn nội dung", "hide-submit", "Hủy");
  }
  function openNewRole() {
    C.modal("Tạo vai trò mới", `
      <div class="field"><span>Mã vai trò</span><input name="code" placeholder="VD: FIN_VIEWER" required /></div>
      <div class="field"><span>Tên hiển thị</span><input name="name" required /></div>
      <div class="field"><span>Mô tả</span><textarea name="description"></textarea></div>
      <div class="muted small">Sau khi tạo sẽ sang màn chỉnh ma trận quyền.</div>
    `, "Tạo vai trò", "new-role-submit");
  }
  function openEditRole(id) {
    const role = DATA.roles.find(r => r.id === id);
    if (!role) return;
    const perms = role.permissions.includes("*")
      ? "(* tất cả)"
      : role.permissions.join("\n");
    C.modal(`Ma trận quyền: ${role.name}`, `
      <div class="field"><span>Danh sách quyền (mỗi dòng một permission)</span>
        <textarea rows="10">${H.esc(perms)}</textarea>
        <small class="muted">Format: <code>module:action</code>. Tối đa 100 quyền.</small>
      </div>
    `, "Lưu thay đổi", "edit-role-submit");
    document.getElementById("modal-form").dataset.id = id;
  }
  function openNewCategory() {
    C.modal("Thêm danh mục", `
      <div class="field"><span>Tên danh mục</span><input name="name" required /></div>
      <div class="field"><span>Danh mục cha</span>
        <select name="parent">
          <option value="">— Không —</option>
          ${DATA.categories.map(c => `<option value="${H.esc(c.id)}">${H.esc(c.name)}</option>`).join("")}
        </select>
      </div>
    `, "Tạo danh mục", "new-category-submit");
  }
  function openRenameCategory(id) {
    const c = DATA.categories.find(c => c.id === id);
    if (!c) return;
    C.modal(`Đổi tên ${c.name}`, `
      <div class="field"><span>Tên mới</span><input name="name" value="${H.esc(c.name)}" required /></div>
    `, "Lưu", "rename-cat-submit");
    document.getElementById("modal-form").dataset.id = id;
  }
  function openNewUnit() {
    C.modal("Thêm đơn vị tính", `
      <div class="field"><span>Tên đơn vị</span><input name="name" required /></div>
      <div class="field"><span>Mã</span><input name="code" placeholder="U-LÍT" required /></div>
    `, "Tạo", "new-unit-submit");
  }
  function openEditUnit(id) {
    const u = DATA.units.find(u => u.id === id);
    if (!u) return;
    C.modal(`Sửa đơn vị ${u.name}`, `
      <div class="field"><span>Tên</span><input name="name" value="${H.esc(u.name)}" required /></div>
    `, "Lưu", "edit-unit-submit");
    document.getElementById("modal-form").dataset.id = id;
  }

  function logAudit(action, object, before, after) {
    DATA.auditLogs.unshift({
      id: "LOG-NEW-" + Date.now(),
      actor: `${DATA.currentAdmin.name} (${DATA.currentAdmin.roleLabel})`,
      action, object, before, after,
      ip: "10.10.4.1",
      createdAt: "18/09/2026 22:00"
    });
  }

  // Submit handler
  document.addEventListener("submit", (e) => {
    if (e.target.id === "login-form") {
      e.preventDefault();
      state.isAuthed = true;
      C.toast("Đăng nhập thành công — bước MFA đã được bỏ qua cho prototype");
      navigate("dashboard");
      return;
    }
    if (e.target.id !== "modal-form") return;
    e.preventDefault();
    const submit = e.target.dataset.submit;
    const data = new FormData(e.target);

    switch (submit) {
      case "kyc-request-submit":
        logAudit("KYC:REQUEST_MORE", e.target.dataset.kycId, "pending", "more_info_required");
        C.toast("Đã gửi yêu cầu bổ sung");
        break;
      case "kyc-reject-submit":
        resolveKyc(e.target.dataset.kycId, "REJECTED");
        break;
      case "evidence-submit":
        logAudit("DISPUTE:REQUEST_EVIDENCE", e.target.dataset.disputeId, "—", "evidence_required");
        C.toast("Đã yêu cầu bổ sung bằng chứng");
        break;
      case "suspend-submit":
        mutateAccount(e.target.dataset.type, e.target.dataset.id, "suspended");
        C.toast("Đã tạm khóa tài khoản");
        break;
      case "terminate-submit":
        mutateAccount(e.target.dataset.type, e.target.dataset.id, "terminated");
        C.toast("Đã chấm dứt tài khoản");
        break;
      case "refund-submit":
        logAudit("TXN:REFUND", e.target.dataset.id, "—", `+${data.get("amount")} VND`);
        C.toast("Đã hoàn tiền");
        break;
      case "hide-submit":
        logAudit("MOD:HIDE", "MOD-P", "live", "hidden");
        C.toast("Đã ẩn nội dung");
        break;
      case "new-role-submit":
      case "edit-role-submit":
        logAudit("RBAC:" + (submit === "new-role-submit" ? "CREATE" : "UPDATE"), e.target.dataset.id || "ROLE", "—", data.get("name") || "permissions");
        C.toast("Đã cập nhật vai trò");
        break;
      case "new-category-submit":
      case "rename-cat-submit":
        logAudit("CATEGORY:" + (submit === "new-category-submit" ? "CREATE" : "UPDATE"), e.target.dataset.id || "CAT", "—", data.get("name"));
        C.toast("Đã cập nhật danh mục");
        break;
      case "new-unit-submit":
      case "edit-unit-submit":
        logAudit("UNIT:" + (submit === "new-unit-submit" ? "CREATE" : "UPDATE"), e.target.dataset.id || "UNIT", "—", data.get("name"));
        C.toast("Đã cập nhật đơn vị");
        break;
    }
    C.closeModal();
    render();
  });

  // Change handlers (filter changes in selects not wired through click)
  document.addEventListener("change", (e) => {
    if (e.target.dataset.txnProvider !== undefined) {
      state.txnProviderFilter = e.target.value;
      render();
    }
    if (e.target.dataset.reportPeriod !== undefined) {
      state.reportPeriod = e.target.value;
      render();
    }
    if (e.target.dataset.kycSearch !== undefined) {
      // visual search (mock)
      C.toast(`Đang lọc theo từ khóa (mock): ${e.target.value || "—"}`);
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") C.closeModal();
  });

  window.addEventListener("hashchange", () => {
    const next = location.hash.slice(1) || "dashboard";
    if (C.titles[next] && next !== state.view) navigate(next);
  });

  render();
})();
