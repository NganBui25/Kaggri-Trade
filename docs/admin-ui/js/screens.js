/* Screens - render nội dung cho 16 màn hình Admin theo tài liệu đặc tả.
 * Mỗi hàm nhận state (đối tượng state chia sẻ toàn cục trong window.KAGGRI_ADMIN_STATE)
 * và trả về HTML string.
 */
(() => {
  "use strict";

  const H = window.KaggriAdminHelpers;
  const C = window.KaggriAdminComponents;
  const DATA = window.KAGGRI_ADMIN_DATA;

  // ============= Màn 3.1 — Đăng nhập =============
  function login() {
    return `
      <section class="auth-shell">
        <div class="auth-card">
          <div class="auth-head">
            <span class="brand-mark lg">A</span>
            <h1>Đăng nhập Kaggri Admin</h1>
            <p>Trung tâm chỉ huy vận hành nền tảng B2B nông sản.</p>
          </div>
          <form id="login-form" class="auth-form">
            ${input("auth-email", "Email công vụ", "admin@kaggri-trade.example", "email", "required")}
            ${input("auth-password", "Mật khẩu (≥ 12 ký tự, có hoa/thường/số/ký tự đặc biệt)", "", "password", "required minlength=12")}
            <div class="auth-row">
              <label><input type="checkbox" /> Nhớ thiết bị 7 ngày</label>
              <a href="#" class="link">Quên mật khẩu?</a>
            </div>
            <div class="auth-2fa">
              <span class="chip chip-warning">Bắt buộc MFA cho Admin</span>
              <p>Sau khi đăng nhập sẽ chuyển sang bước xác minh TOTP (Google Authenticator/Authy).</p>
            </div>
            <button type="submit" class="btn btn-primary full">Đăng nhập an toàn →</button>
            <p class="auth-foot">Phiên tự động đăng xuất sau <strong>30 phút</strong> không hoạt động.</p>
          </form>
        </div>
        <aside class="auth-side">
          <strong>Quyền truy cập quản trị</strong>
          <ul>
            <li>Vận hành — xem xét KYC, xử lý tranh chấp, kiểm duyệt nội dung.</li>
            <li>Tài chính — quản lý giao dịch, đối soát, hoàn tiền.</li>
            <li>Tuân thủ — xem và xuất audit logs.</li>
            <li>Super Admin — cấu hình nền tảng và quản trị RBAC.</li>
          </ul>
          <p>Mọi hành động nhạy cảm được ghi vào <strong>audit log bất biến</strong>.</p>
        </aside>
      </section>
    `;
  }
  function input(id, label, value = "", type = "text", extra = "") {
    return `
      <label class="field">
        <span>${H.esc(label)}</span>
        <input id="${id}" type="${type}" value="${H.esc(value)}" ${extra} />
      </label>
    `;
  }

  // ============= Màn 3.2 — Dashboard tổng quan =============
  function dashboard(state) {
    const d = DATA.dashboard;
    const max = Math.max(...d.seriesGMV.map(s => s.gmv));
    const chartBars = d.seriesGMV.map((p, i) => {
      const h = Math.round(p.gmv / max * 130);
      return `
        <div class="bar-col ${i === d.seriesGMV.length - 1 ? "current" : ""}">
          <div class="bar" style="height:${h}px" title="${H.esc(p.date)}: ${H.money(p.gmv)}"></div>
          <small>${H.esc(p.date)}</small>
        </div>
      `;
    }).join("");
    const alertsHtml = d.alerts.map(a => `
      <div class="alert-row ${H.esc(a.level)}">
        <div>
          <strong>${H.esc(a.title)}</strong>
          <p>${H.esc(a.detail)}</p>
        </div>
        <span class="alert-ts">${H.esc(a.ts)}</span>
      </div>
    `).join("");
    const topCatHtml = d.topCategories.map(c => `
      <div class="bar-row">
        <div class="bar-row-head"><strong>${H.esc(c.name)}</strong><span>${c.share}%</span></div>
        <div class="mini-line"><span style="width:${c.share}%"></span></div>
      </div>
    `).join("");
    const topVendorsHtml = d.topVendors.map((v, i) => `
      <div class="top-row">
        <span class="rank">${i + 1}</span>
        <strong>${H.esc(v.name)}</strong>
        <span class="muted">${H.money(v.gmv)}</span>
      </div>
    `).join("");

    return `
      ${state.firstRun ? `
        <section class="callout">
          <strong>Chào mừng, ${H.esc(DATA.currentAdmin.name)}.</strong>
          <p>Bạn đang đăng nhập với vai trò <strong>${H.esc(DATA.currentAdmin.roleLabel)}</strong>. Có <strong>${DATA.pendingKyc.length} hồ sơ KYC</strong> và <strong>${DATA.disputes.filter(d => d.status === 'OPENED').length} tranh chấp mới</strong> cần xử lý.</p>
          <button class="btn btn-primary" data-action="goto-kyc">Mở hàng chờ KYC</button>
        </section>
      ` : ""}
      <section class="kpi-grid">
        ${d.kpis.map(C.kpiCard).join("")}
      </section>
      <section class="grid-3-col">
        ${C.card("Xu hướng GMV (7 ngày)", `
          <div class="bar-chart">${chartBars}</div>
          <div class="muted small">Giá trị giao dịch thanh toán đơn hàng, đã bao gồm mọi trạng thái.</div>
        `)}
        ${C.card("Top danh mục theo tỷ trọng", topCatHtml)}
        ${C.card("Top Vendor", topVendorsHtml)}
      </section>
      <section class="grid-2-col">
        ${C.card("Cảnh báo & Insight", alertsHtml, `
          <button class="btn btn-light btn-sm" data-action="export-alerts">Xuất CSV</button>
        `)}
        ${C.card("Hoạt động gần đây", `
          <ul class="activity-list">
            <li><span class="activity-dot green"></span><strong>${H.esc(DATA.auditLogs[0].actor)}</strong> ${H.esc(DATA.auditLogs[0].action)} <em>${H.esc(DATA.auditLogs[0].object)}</em><small>${H.esc(DATA.auditLogs[0].createdAt)}</small></li>
            <li><span class="activity-dot amber"></span><strong>${H.esc(DATA.auditLogs[1].actor)}</strong> ${H.esc(DATA.auditLogs[1].action)} <em>${H.esc(DATA.auditLogs[1].object)}</em><small>${H.esc(DATA.auditLogs[1].createdAt)}</small></li>
            <li><span class="activity-dot blue"></span><strong>${H.esc(DATA.auditLogs[2].actor)}</strong> ${H.esc(DATA.auditLogs[2].action)} <em>${H.esc(DATA.auditLogs[2].object)}</em><small>${H.esc(DATA.auditLogs[2].createdAt)}</small></li>
            <li><span class="activity-dot gray"></span><strong>${H.esc(DATA.auditLogs[3].actor)}</strong> ${H.esc(DATA.auditLogs[3].action)} <em>${H.esc(DATA.auditLogs[3].object)}</em><small>${H.esc(DATA.auditLogs[3].createdAt)}</small></li>
          </ul>
        `)}
      </section>
    `;
  }

  // ============= Màn 3.3 — Hồ sơ Vendor chờ duyệt (KYC) =============
  function kycList(state) {
    const filter = (state && state.kycFilter) || (window.KAGGRI_ADMIN_STATE && window.KAGGRI_ADMIN_STATE.kycFilter) || "all";
    const filtered = DATA.pendingKyc.filter(k =>
      filter === "all" ? true :
      filter === "on-track" ? k.slaStatus === "on-track" :
      filter === "at-risk" ? k.slaStatus === "at-risk" :
      k.slaStatus === "breached"
    );
    const rows = filtered.map(k => `
      <tr class="clickable" data-kyc="${H.esc(k.id)}">
        <td><strong>${H.esc(k.id)}</strong><small class="block muted">${H.esc(k.representative)}</small></td>
        <td>
          <strong>${H.esc(k.vendorName)}</strong>
          <small class="block muted">${H.esc(k.address)}</small>
        </td>
        <td>${C.badge(k.tier, H.tierVariant(k.tier))}</td>
        <td>${H.esc(k.submittedAt)}</td>
        <td>
          ${badgeSla(k.slaStatus, k.slaDeadline)}
          <small class="block muted">${H.esc(k.priority)}</small>
        </td>
        <td class="row-actions">
          <button class="btn btn-sm btn-primary" data-kyc-open="${H.esc(k.id)}">Xem xét</button>
        </td>
      </tr>
    `).join("") || `<tr><td colspan="6">${C.emptyState("Không có hồ sơ ở trạng thái này", "Hãy chọn bộ lọc khác.")}</td></tr>`;

    return `
      <section class="page-head">
        <div>
          <div class="eyebrow">Vận hành · KYC</div>
          <h1>${DATA.pendingKyc.length} hồ sơ Vendor chờ xem xét</h1>
          <p>SLA xem xét KYC là <strong>48 giờ</strong>. Hồ sơ vượt hạn sẽ tự leo thang lên Super Admin.</p>
        </div>
        <div class="page-head-actions">
          <button class="btn btn-light" data-action="export-kyc">Xuất CSV</button>
          <button class="btn btn-primary" disabled>+ Phân công thủ công</button>
        </div>
      </section>
      <section class="card filter-bar">
        <div class="segmented">
          ${["all", "on-track", "at-risk", "breached"].map(t => `
            <button class="${filter === t ? "active" : ""}" data-kyc-filter="${t}">
              ${t === "all" ? "Tất cả" : t === "on-track" ? "Trong hạn" : t === "at-risk" ? "Cảnh báo" : "Vi phạm SLA"} (${countKyc(t)})
            </button>
          `).join("")}
        </div>
        <input class="search" placeholder="Tìm tên doanh nghiệp / người đại diện" data-kyc-search />
      </section>
      <section class="card">
        <div class="table-wrap">
          <table class="table">
            <thead>
              <tr>
                <th>Mã hồ sơ</th>
                <th>Doanh nghiệp</th>
                <th>Tier</th>
                <th>Nộp lúc</th>
                <th>SLA</th>
                <th></th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
      </section>
    `;
  }

  function countKyc(status) {
    if (status === "all") return DATA.pendingKyc.length;
    return DATA.pendingKyc.filter(k => k.slaStatus === status).length;
  }
  function badgeSla(status, deadline) {
    const h = H.hoursUntilDeadline(deadline);
    const text = status === "on-track" ? `Còn ${h}h` :
                 status === "at-risk" ? `Sắp hạn (${h}h)` :
                 `Vi phạm (${Math.abs(h)}h)`;
    return C.badge(text, H.kycSlaVariant(status));
  }

  // ============= Màn 3.4 — Chi tiết KYC + quyết định =============
  function kycDetail(state) {
    const k = DATA.pendingKyc.find(x => x.id === state.selectedKycId) || DATA.pendingKyc[0];
    const docs = k.documents.map(d => `
      <li><span class="file-tile">📄</span><strong>${H.esc(d)}</strong></li>
    `).join("");
    return `
      <section class="page-head">
        <div>
          <div class="eyebrow">KYC · ${H.esc(k.id)}</div>
          <h1>${H.esc(k.vendorName)}</h1>
          <p>Người đại diện: <strong>${H.esc(k.representative)}</strong> · Mã số thuế/HKD: <code>${H.esc(k.taxCode)}</code></p>
        </div>
        <div class="page-head-actions">
          <button class="btn btn-light" data-nav="kyc">← Danh sách</button>
        </div>
      </section>
      <section class="grid-2-col">
        ${C.card("Thông tin doanh nghiệp", `
          ${H.detailPair("Tên doanh nghiệp", H.esc(k.vendorName))}
          ${H.detailPair("Loại hình", k.tier === "PREMIUM" ? "Hộ kinh doanh / doanh nghiệp nông nghiệp" : "Hộ kinh doanh / HTX")}
          ${H.detailPair("Mã số thuế / HKD", `<code>${H.esc(k.taxCode)}</code>`)}
          ${H.detailPair("Người đại diện", H.esc(k.representative))}
          ${H.detailPair("Địa chỉ", H.esc(k.address))}
          ${H.detailPair("Tier yêu cầu", C.badge(k.tier, H.tierVariant(k.tier)))}
          ${H.detailPair("Nộp lúc", H.esc(k.submittedAt))}
          ${H.detailPair("SLA còn lại", badgeSla(k.slaStatus, k.slaDeadline))}
        `)}
        ${C.card("Tài liệu đã nộp", `<ul class="doc-list">${docs}</ul>`, `
          <button class="btn btn-light btn-sm" data-action="download-docs">Tải tất cả (zip)</button>
        `)}
      </section>
      <section class="card decision-card">
        <div>
          <h2>Quyết định xem xét</h2>
          <p>Mọi quyết định được ghi vào audit log kèm lý do. <strong>Lý do bắt buộc khi từ chối hoặc yêu cầu bổ sung.</strong></p>
        </div>
        <div class="decision-actions">
          <button class="btn btn-primary" data-action="kyc-approve" data-kyc-id="${H.esc(k.id)}">Phê duyệt (${H.esc(k.tier)})</button>
          <button class="btn btn-warning" data-action="kyc-request" data-kyc-id="${H.esc(k.id)}">Yêu cầu bổ sung</button>
          <button class="btn btn-danger" data-action="kyc-reject" data-kyc-id="${H.esc(k.id)}">Từ chối</button>
        </div>
      </section>
      <section class="card">
        <h2 class="card-title-h2">Lịch sử xét duyệt</h2>
        <ol class="timeline">
          <li><strong>Nộp hồ sơ</strong><small>${H.esc(k.submittedAt)} · ${H.esc(k.representative)}</small></li>
          <li><strong>Đang xem xét</strong><small>Đã tự động phân công cho pool Operations Admin</small></li>
          <li class="pending"><strong>Quyết định</strong><small>Chờ Admin thao tác</small></li>
        </ol>
      </section>
    `;
  }

  // ============= Màn 3.5a — Quản lý tài khoản Vendor =============
  function accountsVendor() {
    const rows = DATA.accounts.vendors.map(v => `
      <tr>
        <td><strong>${H.esc(v.id)}</strong></td>
        <td>
          <strong>${H.esc(v.company)}</strong>
          <small class="block muted">${H.esc(v.region)}</small>
        </td>
        <td>${C.badge(v.tier, H.tierVariant(v.tier))}</td>
        <td>${C.badge(H.accountStatusText(v.status), H.accountVariant(v.status))}</td>
        <td>${v.score != null ? `⭐ ${v.score}` : "—"}</td>
        <td>${H.esc(v.lastActive)}</td>
        <td class="row-actions">
          <button class="btn btn-sm" data-vendor="${H.esc(v.id)}" data-action="view-vendor">Chi tiết</button>
          ${v.status === "active" ? `<button class="btn btn-sm btn-warning" data-vendor="${H.esc(v.id)}" data-action="suspend-vendor">Tạm khóa</button>` : ""}
          ${v.status === "suspended" ? `<button class="btn btn-sm btn-primary" data-vendor="${H.esc(v.id)}" data-action="reactivate-vendor">Kích hoạt lại</button>` : ""}
          ${v.status === "active" ? `<button class="btn btn-sm btn-danger" data-vendor="${H.esc(v.id)}" data-action="terminate-vendor">Chấm dứt</button>` : ""}
        </td>
      </tr>
    `).join("");
    return `
      <section class="page-head">
        <div>
          <div class="eyebrow">Vận hành · Tài khoản</div>
          <h1>Quản lý Vendor</h1>
          <p>Khóa/mở khóa tài khoản, xem chi tiết, xem lý do và lịch sử thao tác.</p>
        </div>
        <div class="page-head-actions">
          <button class="btn btn-light" data-action="export-vendors">Xuất CSV</button>
        </div>
      </section>
      <section class="card">
        <div class="table-wrap">
          <table class="table">
            <thead><tr><th>Mã</th><th>Doanh nghiệp</th><th>Tier</th><th>Trạng thái</th><th>Score</th><th>Hoạt động cuối</th><th></th></tr></thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
      </section>
    `;
  }

  // ============= Màn 3.5b — Quản lý tài khoản Buyer =============
  function accountsBuyer() {
    const rows = DATA.accounts.buyers.map(b => `
      <tr>
        <td><strong>${H.esc(b.id)}</strong></td>
        <td><strong>${H.esc(b.company)}</strong><small class="block muted">${H.esc(b.type)}</small></td>
        <td>${H.esc(b.region)}</td>
        <td>${C.badge(H.accountStatusText(b.status), H.accountVariant(b.status))}</td>
        <td>${H.money(b.creditLimit)}</td>
        <td>${H.esc(b.lastActive)}</td>
        <td class="row-actions">
          <button class="btn btn-sm" data-buyer="${H.esc(b.id)}" data-action="view-buyer">Chi tiết</button>
          ${b.status === "active" ? `<button class="btn btn-sm btn-warning" data-buyer="${H.esc(b.id)}" data-action="suspend-buyer">Tạm khóa</button>` : `<button class="btn btn-sm btn-primary" data-buyer="${H.esc(b.id)}" data-action="reactivate-buyer">Kích hoạt lại</button>`}
        </td>
      </tr>
    `).join("");
    return `
      <section class="page-head">
        <div>
          <div class="eyebrow">Vận hành · Tài khoản</div>
          <h1>Quản lý Buyer</h1>
          <p>Theo dõi hạn mức công nợ và trạng thái hoạt động.</p>
        </div>
        <div class="page-head-actions">
          <button class="btn btn-light" data-action="export-buyers">Xuất CSV</button>
        </div>
      </section>
      <section class="card">
        <div class="table-wrap">
          <table class="table">
            <thead><tr><th>Mã</th><th>Doanh nghiệp</th><th>Khu vực</th><th>Trạng thái</th><th>Hạn mức</th><th>Hoạt động cuối</th><th></th></tr></thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
      </section>
    `;
  }

  // ============= Màn 3.6 — Quản lý danh mục & đơn vị =============
  function categories() {
    const treeRows = DATA.categories.map(c => `
      <tr>
        <td><code>${H.esc(c.id)}</code></td>
        <td>${c.parent ? `<small class="muted">↳ </small>` : ""}<strong>${H.esc(c.name)}</strong></td>
        <td>${c.parent ? H.esc(c.parent) : "—"}</td>
        <td>${c.products}</td>
        <td class="row-actions">
          <button class="btn btn-sm" data-action="rename-category" data-cat="${H.esc(c.id)}">Đổi tên</button>
          <button class="btn btn-sm btn-danger" data-action="delete-category" data-cat="${H.esc(c.id)}">Xóa</button>
        </td>
      </tr>
    `).join("");
    const unitRows = DATA.units.map(u => `
      <tr>
        <td><code>${H.esc(u.id)}</code></td>
        <td><strong>${H.esc(u.name)}</strong></td>
        <td class="row-actions">
          <button class="btn btn-sm" data-action="edit-unit" data-unit="${H.esc(u.id)}">Sửa</button>
          <button class="btn btn-sm btn-danger" data-action="delete-unit" data-unit="${H.esc(u.id)}">Xóa</button>
        </td>
      </tr>
    `).join("");
    return `
      <section class="page-head">
        <div>
          <div class="eyebrow">Cấu hình · Danh mục chung</div>
          <h1>Danh mục & đơn vị tính</h1>
          <p>Toàn bộ Vendor và Buyer sử dụng danh mục này khi đăng sản phẩm hoặc tìm kiếm.</p>
        </div>
        <div class="page-head-actions">
          <button class="btn btn-primary" data-action="new-category">+ Thêm danh mục</button>
        </div>
      </section>
      <section class="grid-2-col">
        ${C.card("Cây danh mục", `
          <div class="table-wrap">
            <table class="table">
              <thead><tr><th>Mã</th><th>Tên danh mục</th><th>Danh mục cha</th><th>Sản phẩm</th><th></th></tr></thead>
              <tbody>${treeRows}</tbody>
            </table>
          </div>
        `)}
        ${C.card("Đơn vị tính", `
          <div class="table-wrap">
            <table class="table">
              <thead><tr><th>Mã</th><th>Tên đơn vị</th><th></th></tr></thead>
              <tbody>${unitRows}</tbody>
            </table>
          </div>
        `, `<button class="btn btn-light btn-sm" data-action="new-unit">+ Thêm đơn vị</button>`)}
      </section>
    `;
  }

  // ============= Màn 3.7 — Kiểm duyệt nội dung =============
  function moderation(state) {
    const tab = state.modTab || "products";
    const productRows = DATA.moderation.products.map(p => `
      <tr>
        <td><strong>${H.esc(p.id)}</strong></td>
        <td>${H.esc(p.vendor)}<small class="block muted">${H.esc(p.product)}</small></td>
        <td>${H.esc(p.flag)}</td>
        <td>${C.badge(p.severity, H.severityVariant(p.severity))}</td>
        <td>${C.badge(p.status === "HIDDEN" ? "Đã ẩn" : "Đang chờ duyệt", p.status === "HIDDEN" ? "gray" : H.severityVariant(p.severity))}</td>
        <td>${H.esc(p.reportedAt)}</td>
        <td class="row-actions">
          <button class="btn btn-sm btn-primary" data-action="mod-approve" data-mod="${H.esc(p.id)}">Phê duyệt</button>
          <button class="btn btn-sm btn-warning" data-action="mod-hide" data-mod="${H.esc(p.id)}">Ẩn</button>
          <button class="btn btn-sm btn-danger" data-action="mod-terminate" data-mod="${H.esc(p.id)}">Chấm dứt Vendor</button>
        </td>
      </tr>
    `).join("");
    const reviewRows = DATA.moderation.reviews.map(r => `
      <tr>
        <td><strong>${H.esc(r.id)}</strong></td>
        <td>${H.esc(r.fromBuyer)} → <strong>${H.esc(r.toVendor)}</strong></td>
        <td>${"★".repeat(r.rating)}${"☆".repeat(5 - r.rating)}<small class="block muted">${H.esc(r.content)}</small></td>
        <td>${H.esc(r.reason || "—")}</td>
        <td>${C.badge(r.severity, H.severityVariant(r.severity))}</td>
        <td>${H.esc(r.reportedAt)}</td>
        <td class="row-actions">
          <button class="btn btn-sm btn-primary" data-action="mod-approve-review" data-mod="${H.esc(r.id)}">Giữ nguyên</button>
          <button class="btn btn-sm btn-warning" data-action="mod-hide-review" data-mod="${H.esc(r.id)}">Ẩn đánh giá</button>
        </td>
      </tr>
    `).join("");
    return `
      <section class="page-head">
        <div>
          <div class="eyebrow">Nội dung · Kiểm duyệt</div>
          <h1>Kiểm duyệt sản phẩm & đánh giá</h1>
          <p>Hệ thống AI/keyword tự động gắn cờ nội dung vi phạm trước khi vào hàng đợi Admin.</p>
        </div>
      </section>
      <section class="tab-bar">
        <button class="tab ${tab === 'products' ? 'active' : ''}" data-mod-tab="products">Sản phẩm (${DATA.moderation.products.length})</button>
        <button class="tab ${tab === 'reviews' ? 'active' : ''}" data-mod-tab="reviews">Đánh giá (${DATA.moderation.reviews.length})</button>
      </section>
      ${tab === 'products' ? `
        <section class="card">
          <div class="table-wrap">
            <table class="table">
              <thead><tr><th>Mã</th><th>Vendor/Sản phẩm</th><th>Lý do gắn cờ</th><th>Mức</th><th>Trạng thái</th><th>Ngày</th><th></th></tr></thead>
              <tbody>${productRows}</tbody>
            </table>
          </div>
        </section>
      ` : `
        <section class="card">
          <div class="table-wrap">
            <table class="table">
              <thead><tr><th>Mã</th><th>Từ → Đến</th><th>Nội dung</th><th>Lý do</th><th>Mức</th><th>Ngày</th><th></th></tr></thead>
              <tbody>${reviewRows}</tbody>
            </table>
          </div>
        </section>
      `}
    `;
  }

  // ============= Màn 3.8 — Giám sát giao dịch =============
  function transactions(state) {
    const status = state.txnStatusFilter || "all";
    const provider = state.txnProviderFilter || "all";
    const filtered = DATA.transactions.filter(t =>
      (status === "all" || t.status === status) &&
      (provider === "all" || t.provider === provider)
    );
    const rows = filtered.map(t => `
      <tr class="clickable" data-txn="${H.esc(t.id)}">
        <td><strong>${H.esc(t.id)}</strong></td>
        <td>${H.esc(t.createdAt)}</td>
        <td>${H.esc(H.paymentTypeText(t.type))}</td>
        <td>${H.esc(t.buyer)}<small class="block muted">→ ${H.esc(t.vendor)}</small></td>
        <td class="strong">${H.money(t.amount)}</td>
        <td>${H.esc(t.provider)}</td>
        <td>${C.badge(H.txnStatusText(t.status), H.txnStatusVariant(t.status))}</td>
      </tr>
    `).join("") || `<tr><td colspan="7">${C.emptyState("Không có giao dịch khớp bộ lọc", "Bỏ bớt tiêu chí để xem thêm.")}</td></tr>`;
    return `
      <section class="page-head">
        <div>
          <div class="eyebrow">Tài chính · Giao dịch</div>
          <h1>Giám sát giao dịch (real-time feed mô phỏng)</h1>
          <p>Phát hiện bất thường giá trị cao, tần suất. Hỗ trợ export CSV/Excel cho phân tích.</p>
        </div>
        <div class="page-head-actions">
          <button class="btn btn-light" data-action="export-transactions">Xuất CSV</button>
        </div>
      </section>
      <section class="card filter-bar">
        <div class="segmented">
          ${["all", "success", "processing", "failed", "flagged"].map(s => `
            <button class="${status === s ? "active" : ""}" data-txn-status="${s}">
              ${s === "all" ? "Tất cả" : H.txnStatusText(s)}
            </button>
          `).join("")}
        </div>
        <select class="select" data-txn-provider>
          <option value="all">Tất cả cổng</option>
          ${DATA.lists.paymentProviders.map(p => `<option ${provider === p ? "selected" : ""} value="${p}">${p}</option>`).join("")}
        </select>
        <input class="search" placeholder="Tìm mã giao dịch / Buyer / Vendor" />
      </section>
      <section class="card">
        <div class="table-wrap">
          <table class="table">
            <thead>
              <tr><th>Mã</th><th>Thời gian</th><th>Loại</th><th>Đối tượng</th><th>Số tiền</th><th>Cổng</th><th>Trạng thái</th></tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
      </section>
    `;
  }

  // ============= Màn 3.9 — Chi tiết giao dịch =============
  function transactionDetail(state) {
    const t = DATA.transactions.find(x => x.id === state.selectedTxnId) || DATA.transactions[0];
    return `
      <section class="page-head">
        <div>
          <div class="eyebrow">Giao dịch · ${H.esc(t.id)}</div>
          <h1>${H.money(t.amount)}</h1>
          <p>${H.esc(H.paymentTypeText(t.type))} · ${H.esc(t.createdAt)}</p>
        </div>
        <div class="page-head-actions">
          <button class="btn btn-light" data-nav="transactions">← Quay lại</button>
          ${t.status === "failed" || t.status === "flagged" ? `<button class="btn btn-danger" data-action="refund-txn" data-txn="${H.esc(t.id)}">Hoàn tiền / Retry</button>` : ""}
        </div>
      </section>
      <section class="grid-2-col">
        ${C.card("Thông tin thanh toán", `
          ${H.detailPair("Mã giao dịch", `<code>${H.esc(t.id)}</code>`)}
          ${H.detailPair("Loại", H.esc(H.paymentTypeText(t.type)))}
          ${H.detailPair("Số tiền", `<strong>${H.money(t.amount)}</strong>`)}
          ${H.detailPair("Cổng thanh toán", H.esc(t.provider))}
          ${H.detailPair("Trạng thái", C.badge(H.txnStatusText(t.status), H.txnStatusVariant(t.status)))}
          ${H.detailPair("Thời gian tạo", H.esc(t.createdAt))}
          ${H.detailPair("Buyer", H.esc(t.buyer))}
          ${H.detailPair("Vendor", H.esc(t.vendor))}
          ${t.reason ? H.detailPair("Lý do / Ghi chú", `<span class="warn-text">${H.esc(t.reason)}</span>`) : ""}
        `)}
        ${C.card("Webhooks đã nhận", `
          <ul class="timeline">
            <li><strong>Khởi tạo payment intent</strong><small>${H.esc(t.createdAt)} · Đã ký HMAC</small></li>
            <li><strong>Webhook xác minh từ ${H.esc(t.provider)}</strong><small>Đã xác minh chữ ký thành công</small></li>
            ${t.status === "failed" ? `<li class="pending"><strong>Webhook thất bại từ provider</strong><small>${H.esc(t.reason || "—")} · Cần retry hoặc refund</small></li>` : ""}
            <li class="pending"><strong>Cập nhật sổ cái</strong><small>Đã ghi nhật ký bất biến</small></li>
          </ul>
        `)}
      </section>
      <section class="card">
        <h2 class="card-title-h2">Liên kết nghiệp vụ</h2>
        <ul class="link-list">
          <li>Parent Order: <code>PO-20260918-${H.esc(t.id.slice(-3))}</code> <button class="btn btn-sm" data-action="goto-order">Mở</button></li>
          <li>Vendor Order: <code>VO-${H.esc(t.id.slice(-3))}</code> <button class="btn btn-sm" data-action="goto-vendor-order">Mở</button></li>
        </ul>
      </section>
    `;
  }

  // ============= Màn 3.10 — Quản lý Dispute (danh sách) =============
  function disputes(state) {
    const status = state.disputeFilter || "all";
    const filtered = DATA.disputes.filter(d => status === "all" ? true : d.status === status);
    const rows = filtered.map(d => `
      <tr class="clickable" data-dispute="${H.esc(d.id)}">
        <td><strong>${H.esc(d.id)}</strong><small class="block muted">${H.esc(d.openedAt)}</small></td>
        <td>
          <strong>${H.esc(d.buyer)}</strong>
          <small class="block muted">→ ${H.esc(d.vendor)} · ${H.esc(d.product)}</small>
        </td>
        <td>${H.esc(d.reason)}<small class="block muted">${d.affected}/${d.qty} kg</small></td>
        <td>${H.money(d.escrowAmount)}</td>
        <td>${C.badge(H.disputeStatusText(d.status), H.disputeStatusVariant(d.status))}</td>
        <td>
          ${badgeSla(d.status === "UNDER_REVIEW" ? "at-risk" : d.status === "RESOLVED_REFUND_FULL" ? "on-track" : "on-track", d.slaDeadline)}
        </td>
      </tr>
    `).join("") || `<tr><td colspan="6">${C.emptyState("Không có dispute trong bộ lọc này", "")}</td></tr>`;
    return `
      <section class="page-head">
        <div>
          <div class="eyebrow">Vận hành · Tranh chấp</div>
          <h1>${DATA.disputes.filter(d => d.status === 'OPENED' || d.status === 'MORE_EVIDENCE_REQUIRED').length} tranh chấp cần xử lý</h1>
          <p>SLA: phân công trong <strong>4 giờ</strong>, phản hồi Vendor <strong>48 giờ</strong>, giải quyết <strong>72 giờ</strong>.</p>
        </div>
        <div class="page-head-actions">
          <button class="btn btn-light" data-action="export-disputes">Xuất CSV</button>
        </div>
      </section>
      <section class="card filter-bar">
        <div class="segmented scrollable">
          <button class="${status === 'all' ? 'active' : ''}" data-dispute-filter="all">Tất cả (${DATA.disputes.length})</button>
          ${DATA.lists.disputeStatuses.map(s => `
            <button class="${status === s.value ? 'active' : ''}" data-dispute-filter="${s.value}">
              ${s.label} (${DATA.disputes.filter(d => d.status === s.value).length})
            </button>
          `).join("")}
        </div>
      </section>
      <section class="card">
        <div class="table-wrap">
          <table class="table">
            <thead><tr><th>Mã</th><th>Bên liên quan / sản phẩm</th><th>Lý do / ảnh hưởng</th><th>Escrow</th><th>Trạng thái</th><th>SLA</th></tr></thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
      </section>
    `;
  }

  // ============= Màn 3.10b — Chi tiết Dispute =============
  function disputeDetail(state) {
    const d = DATA.disputes.find(x => x.id === state.selectedDisputeId) || DATA.disputes[0];
    return `
      <section class="page-head">
        <div>
          <div class="eyebrow">Tranh chấp · ${H.esc(d.id)}</div>
          <h1>${H.esc(d.product)} — ${H.esc(d.reason)}</h1>
          <p>Mở lúc ${H.esc(d.openedAt)} bởi <strong>${H.esc(d.buyer)}</strong>. Liên quan đơn <code>${H.esc(d.orderId)}</code> với <strong>${H.esc(d.vendor)}</strong>.</p>
        </div>
        <div class="page-head-actions">
          <button class="btn btn-light" data-nav="disputes">← Danh sách</button>
          <button class="btn btn-light" data-action="request-evidence" data-dispute="${H.esc(d.id)}">Yêu cầu bằng chứng</button>
        </div>
      </section>
      <section class="grid-2-col">
        ${C.card("Tổng quan vụ việc", `
          ${H.detailPair("Trạng thái", C.badge(H.disputeStatusText(d.status), H.disputeStatusVariant(d.status)))}
          ${H.detailPair("Phân công", H.esc(d.assignedTo || "Chưa phân công"))}
          ${H.detailPair("SLA còn lại", badgeSla("at-risk", d.slaDeadline))}
          ${H.detailPair("Số lượng giao", `${d.qty} kg`)}
          ${H.detailPair("Số lượng bị ảnh hưởng", `${d.affected} kg`)}
          ${H.detailPair("Giá trị Escrow", `<strong>${H.money(d.escrowAmount)}</strong>`)}
          ${H.detailPair("Mô tả", `<span class="muted small">${H.esc(d.description)}</span>`)}
          ${d.vendorResponse ? H.detailPair("Phản hồi Vendor", `<span class="muted small">${H.esc(d.vendorResponse)}</span>`) : ""}
          ${d.note ? H.detailPair("Ghi chú Admin", `<span class="warn-text small">${H.esc(d.note)}</span>`) : ""}
        `)}
        ${C.card("Bằng chứng hai bên", `
          <div class="evidence-grid">
            ${d.evidenceBuyer.map(e => `<div class="evidence-tile"><span>🖼</span><strong>${H.esc(e)}</strong><small>Buyer gửi</small></div>`).join("")}
            ${(d.evidenceVendor || []).map(e => `<div class="evidence-tile"><span>📑</span><strong>${H.esc(e)}</strong><small>Vendor gửi</small></div>`).join("")}
            ${(d.evidenceVendor || []).length === 0 ? `<div class="muted small">Vendor chưa gửi bằng chứng.</div>` : ""}
          </div>
        `)}
      </section>
      <section class="card decision-card">
        <div>
          <h2>Ra quyết định</h2>
          <p>Mô phỏng xem trước tác động tới <strong>Escrow</strong> và <strong>Vendor Score</strong> trước khi xác nhận.</p>
        </div>
        <div class="decision-actions">
          <button class="btn btn-light" data-action="decision-reject" data-dispute="${H.esc(d.id)}">Từ chối tranh chấp (Vendor giữ 100%)</button>
          <button class="btn btn-warning" data-action="decision-partial" data-dispute="${H.esc(d.id)}">Hoàn tiền một phần</button>
          <button class="btn btn-primary" data-action="decision-refund-full" data-dispute="${H.esc(d.id)}">Hoàn tiền toàn phần</button>
          <button class="btn btn-danger" data-action="decision-cancel" data-dispute="${H.esc(d.id)}">Hủy đơn hàng</button>
        </div>
      </section>
    `;
  }

  // ============= Màn 3.11 — Quản lý Settlement =============
  function settlements(state) {
    const rows = DATA.settlements.map(s => `
      <tr class="clickable" data-settlement="${H.esc(s.id)}">
        <td><strong>${H.esc(s.period)}</strong><small class="block muted">Mã: ${H.esc(s.id)}</small></td>
        <td>${H.esc(s.cutOffDate)}<small class="block muted">Tính: ${H.esc(s.calcDate)} · Trả: ${H.esc(s.payDate)}</small></td>
        <td>${s.vendors.length} Vendor</td>
        <td class="strong">${H.money(s.vendors.reduce((a, v) => a + v.grossGMV, 0))}</td>
        <td>${C.badge(H.settlementStatusText(s.status), H.settlementVariant(s.status))}</td>
        <td class="row-actions">
          <button class="btn btn-sm btn-primary" data-action="open-settlement" data-settlement="${H.esc(s.id)}">${s.status === "DRAFT" ? "Tính & xem trước" : "Xem chi tiết"}</button>
        </td>
      </tr>
    `).join("");
    return `
      <section class="page-head">
        <div>
          <div class="eyebrow">Tài chính · Đối soát</div>
          <h1>Đối soát & Thanh toán Vendor</h1>
          <p>Chu kỳ mặc định: CN 23:59 (cắt) → T2 (tính) → T4 (trả). Công thức: <code>GMV − Hoàn − Adj − 5% commission − 5% escrow = Net Payout</code></p>
        </div>
        <div class="page-head-actions">
          <button class="btn btn-primary" data-action="new-settlement">+ Tạo kỳ mới</button>
          <button class="btn btn-light" data-action="export-settlements">Xuất CSV</button>
        </div>
      </section>
      <section class="card">
        <div class="table-wrap">
          <table class="table">
            <thead><tr><th>Kỳ đối soát</th><th>Mốc thời gian</th><th>Số Vendor</th><th>GMV gộp</th><th>Trạng thái</th><th></th></tr></thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
      </section>
      <section class="card">
        <h2 class="card-title-h2">Quy tắc chốt kỳ</h2>
        <p class="muted small">Sau khi chốt, mọi chỉnh sửa trực tiếp bị khóa; chỉ điều chỉnh qua lệnh bù (Adjustment) có audit log.</p>
        <ul class="check-list">
          <li>Phải đối chiếu 100% giao dịch escrow_release / refund / adjustment trong kỳ.</li>
          <li>Phải đánh dấu escrow hold cho kỳ kế tiếp nếu có dispute đang mở.</li>
          <li>Phải chạy thử công thức GMV ròng trước khi Finalize.</li>
          <li>Phải có chữ ký điện tử của Finance Admin + Super Admin phân công.</li>
        </ul>
      </section>
    `;
  }

  function settlementDetail(state) {
    const s = DATA.settlements.find(x => x.id === state.selectedSettlementId) || DATA.settlements[0];
    const rows = s.vendors.map(v => `
      <tr>
        <td><strong>${H.esc(v.vendorId)}</strong> ${H.esc(v.name)}</td>
        <td>${H.money(v.grossGMV)}</td>
        <td>${H.money(v.refunds)}</td>
        <td>${H.money(v.commission)}</td>
        <td>${H.money(v.escrowReserve)}</td>
        <td class="strong">${H.money(v.netPayout)}</td>
      </tr>
    `).join("");
    return `
      <section class="page-head">
        <div>
          <div class="eyebrow">Đối soát · ${H.esc(s.id)}</div>
          <h1>${H.esc(s.period)}</h1>
          <p>Cắt: ${H.esc(s.cutOffDate)} · Tính: ${H.esc(s.calcDate)} · Trả: ${H.esc(s.payDate)}</p>
        </div>
        <div class="page-head-actions">
          <button class="btn btn-light" data-nav="settlements">← Danh sách</button>
          ${s.status === "DRAFT" ? `<button class="btn btn-primary" data-action="settlement-calculate" data-settlement="${H.esc(s.id)}">Tính toán</button>` : ""}
          ${s.status === "CALCULATED" ? `<button class="btn btn-warning" data-action="settlement-finalize" data-settlement="${H.esc(s.id)}">Chốt kỳ (khóa sửa)</button>` : ""}
          ${s.status === "FINALIZED" ? `<button class="btn btn-primary" data-action="settlement-pay" data-settlement="${H.esc(s.id)}">Thanh toán Vendor</button>` : ""}
          ${s.status === "PAYING" ? `<span class="chip chip-warning">Đang chạy thanh toán — không chỉnh sửa được</span>` : ""}
          ${s.status === "PAID" ? `<span class="chip chip-success">Đã thanh toán ${H.esc(s.payDate)}</span>` : ""}
        </div>
      </section>
      <section class="card">
        <h2 class="card-title-h2">Bảng đối chiếu Vendor</h2>
        <div class="table-wrap">
          <table class="table">
            <thead><tr><th>Vendor</th><th>GMV hợp lệ</th><th>Hoàn tiền/Điều chỉnh</th><th>Commission 5%</th><th>Escrow Reserve 5%</th><th>Net Payout</th></tr></thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
      </section>
      <section class="card">
        <h2 class="card-title-h2">Sự kiện kỳ</h2>
        <ol class="timeline">
          <li class="${s.status !== 'DRAFT' ? 'done' : ''}"><strong>Tạo kỳ (Draft)</strong><small>${H.esc(s.cutOffDate)} · Hệ thống</small></li>
          <li class="${['CALCULATED','FINALIZED','PAYING','PAID'].includes(s.status) ? 'done' : 'pending'}"><strong>Tính toán</strong><small>Tổng hợp GMV hợp lệ, hoàn, commission</small></li>
          <li class="${['FINALIZED','PAYING','PAID'].includes(s.status) ? 'done' : 'pending'}"><strong>Chốt kỳ</strong><small>Khóa chỉnh sửa trực tiếp — chỉ qua Adjustment</small></li>
          <li class="${['PAYING','PAID'].includes(s.status) ? 'done' : 'pending'}"><strong>Đang thanh toán</strong><small>Retry 3 lần nếu gateway lỗi</small></li>
          <li class="${s.status === 'PAID' ? 'done' : 'pending'}"><strong>Đã thanh toán</strong><small>Webhook VNPay/Stripe xác nhận</small></li>
        </ol>
      </section>
    `;
  }

  // ============= Màn 3.12 — Cấu hình hệ thống =============
  function config(state) {
    const cfg = DATA.systemConfig;
    const entries = Object.entries(cfg);
    return `
      <section class="page-head">
        <div>
          <div class="eyebrow">Cấu hình · Nền tảng</div>
          <h1>Cấu hình hệ thống</h1>
          <p>Mọi thay đổi được phiên bản hóa và ghi audit log; có hiệu lực ngay hoặc theo thời điểm áp dụng.</p>
        </div>
        <div class="page-head-actions">
          <button class="btn btn-light" data-action="reset-config">Khôi phục mặc định</button>
          <button class="btn btn-primary" disabled>Lưu thay đổi (chỉ Super Admin)</button>
        </div>
      </section>
      <section class="grid-2-col">
        ${C.card("Nhóm Hoa hồng & định giá", `
          ${configRow(entries, "commissionRate")}
          ${configRow(entries, "subscriptionRate")}
          ${configRow(entries, "escrowReserveRate")}
        `)}
        ${C.card("Nhóm Đơn hàng & Vận hành", `
          ${configRow(entries, "orderConfirmWindow")}
          ${configRow(entries, "autoCancelUnpaid")}
          ${configRow(entries, "disputeOpenWindow")}
          ${configRow(entries, "vendorResponseWindow")}
        `)}
        ${C.card("Nhóm Đối soát & KYC", `
          ${configRow(entries, "settlementCycle")}
          ${configRow(entries, "kycSlaHours")}
        `)}
        ${C.card("Nhóm Vendor Score", `
          ${configRow(entries, "vendorScoreFormula")}
        `)}
      </section>
      <section class="card">
        <h2 class="card-title-h2">Lịch sử thay đổi cấu hình</h2>
        <ul class="timeline">
          ${DATA.auditLogs.filter(a => a.action === "CONFIG:UPDATE").map(l => `
            <li><strong>${H.esc(l.actor)}</strong> đổi <code>${H.esc(l.object)}</code> từ <em>${H.esc(l.before)}</em> → <em>${H.esc(l.after)}</em><small>${H.esc(l.createdAt)}</small></li>
          `).join("")}
        </ul>
      </section>
    `;
  }
  function configRow(entries, key) {
    const [, value] = entries.find(([k]) => k === key);
    return `
      <div class="config-row">
        <div>
          <strong>${H.esc(value.label)}</strong>
          <small class="muted block">Áp dụng toàn nền tảng</small>
        </div>
        <div class="config-value">
          <input type="text" value='${H.esc(JSON.stringify(value.expression || (value.value + (value.unit ? " " + value.unit : ""))))}' />
        </div>
        <button class="btn btn-sm btn-light" data-config="${key}">Chỉnh</button>
      </div>
    `;
  }

  // ============= Màn 3.13 — RBAC =============
  function rbac() {
    const rows = DATA.roles.map(r => `
      <tr>
        <td><strong>${H.esc(r.code)}</strong></td>
        <td>
          <strong>${H.esc(r.name)}</strong>
          <small class="block muted">${H.esc(r.description)}</small>
        </td>
        <td>${r.users.length}</td>
        <td>${r.permissions.includes("*") ? `<span class="chip chip-warning">Toàn quyền (*)</span>` : `${r.permissions.length} quyền`}</td>
        <td class="row-actions">
          <button class="btn btn-sm" data-action="edit-role" data-role="${H.esc(r.id)}">Ma trận quyền</button>
          ${r.code !== "SUPER_ADMIN" ? `<button class="btn btn-sm btn-danger" data-action="delete-role" data-role="${H.esc(r.id)}">Xóa</button>` : ""}
        </td>
      </tr>
    `).join("");
    return `
      <section class="page-head">
        <div>
          <div class="eyebrow">Bảo mật · RBAC</div>
          <h1>Quản trị phân quyền</h1>
          <p>Pattern: <code>module:action</code> (vd: <code>VND_MGMT:APPROVE</code>). Gán nhiều quyền cho mỗi vai trò, một người dùng có thể mang nhiều vai trò.</p>
        </div>
        <div class="page-head-actions">
          <button class="btn btn-primary" data-action="new-role">+ Tạo vai trò</button>
        </div>
      </section>
      <section class="card">
        <div class="table-wrap">
          <table class="table">
            <thead><tr><th>Mã</th><th>Tên / Mô tả</th><th>Số user</th><th>Quyền</th><th></th></tr></thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
      </section>
      <section class="card">
        <h2 class="card-title-h2">Ma trận quyền hiện hành (rút gọn)</h2>
        <table class="table matrix">
          <thead>
            <tr>
              <th>Module</th>
              <th>Quyền</th>
              <th>SUPER</th><th>OPS</th><th>FIN</th><th>COMP</th>
            </tr>
          </thead>
          <tbody>
            ${[
              ["Dashboard","Xem", true, true, true, true],
              ["Vendor Mgmt","Phê duyệt/Từ chối", true, true, false, false],
              ["Vendor Mgmt","Tạm khóa/Chấm dứt", true, true, false, false],
              ["KYC","Xem xét & quyết định", true, true, false, false],
              ["Buyer Mgmt","Tạm khóa", true, true, false, false],
              ["Transactions","Xem", true, true, true, true],
              ["Transactions","Hoàn tiền", true, false, true, false],
              ["Disputes","Phân công/Quyết định", true, true, false, false],
              ["Settlements","Tạo/Chốt/Trả", true, false, true, false],
              ["Moderation","Phê duyệt/Ẩn", true, true, false, false],
              ["Config","Sửa", true, false, false, false],
              ["RBAC","Xem/Sửa", true, false, false, false],
              ["Audit Logs","Xem/Xuất", true, false, false, true]
            ].map(([m, p, su, op, fi, co]) => `
              <tr>
                <td>${H.esc(m)}</td>
                <td>${H.esc(p)}</td>
                <td>${cell(su)}</td>
                <td>${cell(op)}</td>
                <td>${cell(fi)}</td>
                <td>${cell(co)}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
      </section>
    `;
  }
  function cell(v) {
    if (v === true) return `<span class="matrix-tick">✓</span>`;
    return `<span class="matrix-cross">—</span>`;
  }

  // ============= Màn 3.14 — Audit Log =============
  function audit() {
    const rows = DATA.auditLogs.map(l => `
      <tr>
        <td>${H.esc(l.createdAt)}</td>
        <td><strong>${H.esc(l.actor)}</strong></td>
        <td>${H.esc(l.action)}</td>
        <td><code>${H.esc(l.object)}</code></td>
        <td>${H.esc(l.before)} → <strong>${H.esc(l.after)}</strong></td>
        <td><code>${H.esc(l.ip)}</code></td>
      </tr>
    `).join("");
    return `
      <section class="page-head">
        <div>
          <div class="eyebrow">Bảo mật · Audit</div>
          <h1>Nhật ký kiểm toán</h1>
          <p>Log bất biến, lưu trữ tối thiểu 5 năm. Hỗ trợ tìm kiếm toàn văn, bộ lọc nâng cao và xuất CSV.</p>
        </div>
        <div class="page-head-actions">
          <button class="btn btn-light" data-action="export-audit">Xuất CSV</button>
        </div>
      </section>
      <section class="card filter-bar">
        <select class="select">
          <option>Tất cả vai trò</option>
          <option>Super Admin</option>
          <option>Operations Admin</option>
          <option>Finance Admin</option>
          <option>Compliance Admin</option>
        </select>
        <select class="select">
          <option>Tất cả hành động</option>
          <option>DISPUTE:*</option>
          <option>KYC:*</option>
          <option>TXN:*</option>
          <option>SETTLEMENT:*</option>
          <option>CONFIG:*</option>
        </select>
        <input class="search" placeholder="Tìm actor / object / IP" />
        <input class="search" type="date" />
      </section>
      <section class="card">
        <div class="table-wrap">
          <table class="table">
            <thead><tr><th>Thời gian</th><th>Actor</th><th>Hành động</th><th>Đối tượng</th><th>Trước → Sau</th><th>IP</th></tr></thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
        <p class="muted small footnote">Bản ghi là bất biến — không thể chỉnh sửa hoặc xóa thông qua giao diện.</p>
      </section>
    `;
  }

  // ============= Màn 3.15 — Báo cáo thống kê =============
  function reports(state) {
    const period = state.reportPeriod || "30d";
    const cards = DATA.reports.map(r => `
      ${C.card(H.esc(r.label), `
        <div class="report-figure">
          <canvas data-report-chart="${H.esc(r.key)}" width="600" height="160"></canvas>
        </div>
        <div class="muted small">Chu kỳ: ${H.esc(r.period)}</div>
      `, `<button class="btn btn-light btn-sm" data-action="export-report" data-report="${H.esc(r.key)}">Xuất</button>`)}
    `).join("");
    return `
      <section class="page-head">
        <div>
          <div class="eyebrow">Phân tích · Báo cáo</div>
          <h1>Báo cáo tổng hợp nền tảng</h1>
          <p>Bộ lọc theo khoảng ngày tùy chỉnh, GMV, commission, refund, dispute, tăng trưởng Buyer/Vendor.</p>
        </div>
        <div class="page-head-actions">
          <select class="select" data-report-period>
            <option value="7d" ${period === "7d" ? "selected" : ""}>7 ngày</option>
            <option value="30d" ${period === "30d" ? "selected" : ""}>30 ngày</option>
            <option value="90d" ${period === "90d" ? "selected" : ""}>90 ngày</option>
            <option value="custom" ${period === "custom" ? "selected" : ""}>Tùy chỉnh…</option>
          </select>
          <button class="btn btn-primary" data-action="export-reports">Xuất tất cả (PDF)</button>
        </div>
      </section>
      <section class="report-grid">
        ${cards}
      </section>
    `;
  }

  // ============= Màn 3.16 — Thông báo Admin =============
  function adminNotifications() {
    const rows = DATA.notifications.map(n => `
      <li class="notification-row ${n.read ? "" : "unread"}">
        <span class="dot ${H.alertVariant(n.level)}"></span>
        <div>
          <strong>${H.esc(n.title)}</strong>
          <p>${H.esc(n.detail)}</p>
        </div>
        <button class="btn btn-sm btn-light" data-notification-go="${H.esc(n.target)}">Mở</button>
      </li>
    `).join("");
    return `
      <section class="page-head">
        <div>
          <div class="eyebrow">Trung tâm thông báo</div>
          <h1>Thông báo & cảnh báo hệ thống</h1>
          <p>Webhook lỗi, retry thất bại, dispute quá hạn xử lý, KYC vượt SLA, sự kiện vận hành.</p>
        </div>
        <div class="page-head-actions">
          <button class="btn btn-light" data-action="mark-all-read">Đánh dấu tất cả đã đọc</button>
        </div>
      </section>
      <section class="card">
        <ul class="notification-list">${rows}</ul>
      </section>
    `;
  }

  // Export all screens
  window.KaggriAdminScreens = {
    login, dashboard,
    kycList, kycDetail,
    accountsVendor, accountsBuyer,
    categories, moderation,
    transactions, transactionDetail,
    disputes, disputeDetail,
    settlements, settlementDetail,
    config, rbac, audit, reports,
    adminNotifications
  };
})();
