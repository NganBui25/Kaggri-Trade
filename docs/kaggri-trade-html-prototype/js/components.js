(() => {
  "use strict";

  const DATA = window.KAGGRI_DATA;
  const H = window.KaggriHelpers;

  const header = () => `
    <header class="topbar">
      <a class="brand" href="../vendor-ui/home.html" aria-label="Về trang chủ">
        <span class="brand-mark">K</span>
        <span>Kaggri-Trade</span>
        <span class="chip chip-soft">B2B</span>
      </a>
      <nav class="topnav" aria-label="Điều hướng chính">
        <a href="../vendor-ui/home.html">Marketplace</a>
        <a href="#b10a">Đơn mua</a>
        <a aria-disabled="true">Khiếu nại</a>
      </nav>
      <div class="searchbox">⌕&nbsp;&nbsp;Tìm kiếm nông sản, nhà cung cấp...</div>
      <div class="buyer-box">
        <strong>${window.KaggriAuth?.role() === "buyer" ? H.escapeHtml(DATA.buyer.company) : "Khách vãng lai"}</strong>
        <span>${window.KaggriAuth?.role() === "buyer" ? "Tài khoản mua hàng" : "Xem sản phẩm"}</span>
      </div>
      <div class="top-icons" aria-hidden="true">🔔&nbsp;&nbsp;🛒</div>
    </header>
    <div class="subbar">
      <span>⌂ / Kênh Mua Hàng / <strong>Tổng quan thu mua</strong></span>
      <span class="live-dot">● Sàn kết nối trực tiếp</span>
    </div>
  `;

  const footer = () => `
    <footer class="footer">
      <div><strong>Kaggri-Trade</strong><br><span>Nền tảng giao dịch nông sản B2B.</span></div>
      <div><strong>Hỗ trợ người mua</strong><br><span>Điều khoản mua hàng · Xác minh hồ sơ</span></div>
      <div><strong>Giao nhận</strong><br><span>Dữ liệu cước, ETA và tracking từ đối tác logistics.</span></div>
    </footer>
  `;

  const progress = (active, orderMode = "STANDARD") => {
    const steps = orderMode === "PREORDER"
      ? [
        "Xác nhận đơn",
        "NCC cam kết",
        "Thanh toán",
        "Lên kế hoạch cung ứng",
        "Vận chuyển",
        "Hoàn tất"
      ]
      : [
        "Xác nhận đơn",
        "Thanh toán",
        "NCC xác nhận",
        "Chuẩn bị hàng",
        "Vận chuyển",
        "Hoàn tất"
      ];

    return `
      <div class="progress-card">
        ${steps.map((step, index) => `
          <div class="progress-step ${index < active ? "done" : ""} ${index === active ? "active" : ""}">
            <div class="dot">${index < active ? "✓" : index + 1}</div>
            <div>${step}</div>
          </div>
        `).join("")}
      </div>
    `;
  };

  const pageShell = (content, options = {}) => `
    <div class="page">
      ${header()}
      <main class="content ${options.wide ? "wide" : ""}">
        ${content}
      </main>
      ${options.noFooter ? "" : footer()}
    </div>
  `;

  const vendorGroup = (state, vendorId, { notes = true, readOnly = false } = {}) => {
    const vendor = H.vendorById(vendorId);
    const items = state.cart.filter((product) => product.vendorId === vendorId);
    const subtotal = H.vendorSubtotal(state.cart, vendorId);
    if (!items.length) return "";

    return `
      <section class="vendor-card">
        <div class="vendor-head">
          <div>
            <div class="vendor-name">${H.escapeHtml(vendor.name)}</div>
            <div class="vendor-meta">
              <span class="chip chip-success">Hồ sơ đã xác minh</span>
              <span>${H.escapeHtml(vendor.location)}</span>
            </div>
          </div>
          <div class="vendor-status chip ${state.orderMode === "PREORDER" ? "chip-warn" : "chip-success"}">${state.orderMode === "PREORDER" ? "Chờ NCC cam kết sản lượng" : "✓ Đủ điều kiện đặt hàng"}</div>
        </div>

        <div class="table-head four">
          <div>SẢN PHẨM</div><div>ĐƠN GIÁ</div><div>SỐ LƯỢNG</div><div>THÀNH TIỀN</div>
        </div>

        ${items.map((item) => `
          <div class="line-item four">
            <div class="product-cell">
              <div class="product-thumb">${H.escapeHtml(item.image)}</div>
              <div>
                <div class="product-name">${H.escapeHtml(item.name)}</div>
                <div class="muted">${H.escapeHtml(item.quality[0]?.[1] || "")}</div>
                <div class="stock-line ${state.orderMode === "PREORDER" || item.available === item.qty ? "ok" : ""}">${state.orderMode === "PREORDER" ? `Tồn hiện tại: ${item.available} ${H.escapeHtml(item.unit)} • Cho phép đặt theo sản lượng tương lai` : `Tồn khả dụng: ${item.available} ${H.escapeHtml(item.unit)}`}</div>
              </div>
            </div>
            <div>
              <strong>${H.money(item.unitPrice)}</strong><span class="unit">/${H.escapeHtml(item.unit)}</span>
              <div class="muted">MOQ ${item.minQty} ${H.escapeHtml(item.unit)}</div>
            </div>
            <div>
              ${readOnly ? `
                <strong>${item.qty}</strong> ${H.escapeHtml(item.unit)}
              ` : `
                <div class="qty-control">
                  <button type="button" aria-label="Giảm số lượng" onclick="window.Kaggri.changeQty('${item.id}', -10)">−</button>
                  <input aria-label="Số lượng ${H.escapeHtml(item.name)}" inputmode="decimal" value="${item.qty}" onchange="window.Kaggri.setQty('${item.id}', this.value)" />
                  <button type="button" aria-label="Tăng số lượng" onclick="window.Kaggri.changeQty('${item.id}', 10)">+</button>
                </div>
              `}
            </div>
            <div class="amount">${H.money(item.qty * item.unitPrice)}</div>
          </div>

          ${notes ? `
            <div class="line-note">
              <button type="button" class="link-btn" onclick="window.Kaggri.editNote('${item.id}')">
                ${item.note ? "✎ Chỉnh sửa ghi chú" : "+ Thêm ghi chú cho sản phẩm"}
              </button>
              <button type="button" class="link-btn danger-link" onclick="window.Kaggri.removeFromCart('${item.id}')">Xóa khỏi giỏ</button>
              <span class="muted">${item.note ? H.escapeHtml(item.note) : "Tối đa 300 ký tự"}</span>
            </div>
          ` : `
            <div class="readonly-note">
              <strong>Ghi chú Buyer:</strong>
              <span>${H.escapeHtml(item.note || "Không có ghi chú")}</span>
            </div>
          `}
        `).join("")}

        <div class="vendor-total">
          <span>${state.orderMode === "PREORDER" ? "Chờ NCC xác nhận toàn bộ sản lượng" : "Đủ điều kiện đặt hàng"}</span>
          <span><small>Tạm tính</small><strong>${H.money(subtotal)}</strong></span>
        </div>
      </section>
    `;
  };

  const summaryCard = (state, cta = "", options = {}) => {
    const optionItems = options.items || null;
    const vendorIds = options.vendorIds
      || [...new Set((optionItems || state.cart).map((item) => item.vendorId))];
    const vendors = DATA.vendors.filter((vendor) => vendorIds.includes(vendor.id));
    const items = optionItems || H.itemsForVendorIds(state.cart, vendorIds);

    return `
    <aside class="summary-card">
      <div class="summary-title">${H.escapeHtml(options.title || "Tóm tắt đơn hàng")}</div>
      <div class="summary-row"><span>Nhà cung cấp</span><strong>${vendors.length}</strong></div>
      <div class="summary-row"><span>Mặt hàng</span><strong>${items.length}</strong></div>
      <div class="summary-row"><span>Tổng số lượng</span><strong>${H.cartQuantity(items)} kg</strong></div>
      <hr>
      ${vendors.map((vendor) => `
        <div class="summary-row">
          <span>${H.escapeHtml(vendor.shortName)}</span>
          <strong>${H.money(H.vendorSubtotal(items, vendor.id))}</strong>
        </div>
      `).join("")}
      <div class="grand-total">
        <span>TỔNG TIỀN HÀNG</span>
        <strong>${H.money(H.cartTotal(items))}</strong>
      </div>
      ${cta}
    </aside>
    `;
  };

  const statusText = (status) => ({
    PENDING_PAYMENT: "Chờ thanh toán",
    PENDING_CONFIRMATION: "Chờ xác nhận",
    ACCEPTED: "Đã xác nhận",
    REJECTED: "Đã từ chối",
    PREPARING: "Đang chuẩn bị",
    SHIPPED: "Đang vận chuyển"
  }[status] || status);

  const statusChip = (status) => {
    if (status === "ACCEPTED" || status === "PREPARING" || status === "SHIPPED") return "chip-success";
    if (status === "REJECTED") return "chip-danger";
    return "chip-warn";
  };

  window.KaggriComponents = Object.freeze({
    pageShell,
    progress,
    vendorGroup,
    summaryCard,
    statusText,
    statusChip
  });
})();
