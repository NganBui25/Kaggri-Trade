/* Components - các thành phần UI dùng chung: shell, sidebar, header, modal, toast, badges. */
(() => {
  "use strict";

  const H = window.KaggriAdminHelpers;
  const DATA = window.KAGGRI_ADMIN_DATA;

  // Nhóm menu điều hướng theo 10 modules trong SRS
  const navGroups = [
    {
      label: "Tổng quan",
      items: [
        ["dashboard", "Dashboard", "TQ"],
        ["reports", "Báo cáo thống kê", "BC"]
      ]
    },
    {
      label: "Vận hành",
      items: [
        ["kyc", "Hồ sơ Vendor chờ duyệt", "KYC"],
        ["accounts-vendor", "Quản lý Vendor", "VNĐ"],
        ["accounts-buyer", "Quản lý Buyer", "BYR"],
        ["transactions", "Giám sát giao dịch", "TXN"],
        ["disputes", "Giải quyết tranh chấp", "DSP"]
      ]
    },
    {
      label: "Tài chính",
      items: [
        ["settlements", "Đối soát & thanh toán", "ĐS"]
      ]
    },
    {
      label: "Nội dung & Cấu hình",
      items: [
        ["moderation", "Kiểm duyệt nội dung", "MD"],
        ["categories", "Danh mục chung", "DM"],
        ["config", "Cấu hình hệ thống", "CFG"]
      ]
    },
    {
      label: "Bảo mật & Tuân thủ",
      items: [
        ["rbac", "Quản trị RBAC", "RB"],
        ["audit", "Nhật ký kiểm toán", "AL"]
      ]
    }
  ];

  const titles = {
    dashboard: "Tổng quan nền tảng",
    reports: "Báo cáo thống kê",
    kyc: "Hồ sơ KYC chờ duyệt",
    "accounts-vendor": "Quản lý Vendor",
    "accounts-buyer": "Quản lý Buyer",
    transactions: "Giám sát giao dịch",
    disputes: "Giải quyết tranh chấp",
    settlements: "Đối soát & thanh toán Vendor",
    moderation: "Kiểm duyệt nội dung",
    categories: "Danh mục & đơn vị chung",
    config: "Cấu hình hệ thống",
    rbac: "Quản trị phân quyền (RBAC)",
    audit: "Nhật ký kiểm toán",
    "transaction-detail": "Chi tiết giao dịch",
    "dispute-detail": "Chi tiết tranh chấp",
    "settlement-detail": "Chi tiết kỳ đối soát"
  };

  // Badge theo variant
  const badge = (label, variant) =>
    `<span class="chip chip-${variant || "soft"}">${H.esc(label)}</span>`;

  // Card bao (stacked)
  const card = (title, body, head) => `
    <section class="card">
      ${title || head ? `<div class="card-head">${title ? `<h2>${title}</h2>` : ""}${head || ""}</div>` : ""}
      <div class="card-body">${body}</div>
    </section>
  `;

  // Thẻ KPI
  const kpiCard = (kpi) => {
    const tone = H.kpiTone(kpi);
    const iconClass = tone === "up" ? "up" : tone === "down" ? "down" : "neutral";
    const arrow = tone === "up" ? "↗" : tone === "down" ? "↘" : "•";
    return `
      <div class="kpi-card">
        <div class="kpi-icon">${H.esc(kpi.icon || "·")}</div>
        <div class="kpi-meta">
          <div class="kpi-label">${H.esc(kpi.label)}</div>
          <div class="kpi-value">${H.esc(H.formatKpi(kpi))}</div>
          <div class="kpi-change ${iconClass}">
            <span>${arrow} ${H.esc(kpi.change)}</span>
            <small>Ngưỡng: ${H.esc(kpi.threshold || "—")}</small>
          </div>
        </div>
      </div>
    `;
  };

  // Cặp key/value
  const detailPair = (label, value) => `
    <div class="detail-pair">
      <span>${H.esc(label)}</span>
      <strong>${value}</strong>
    </div>
  `;

  // Thanh trên cùng (header)
  const topBar = (crumbs, view) => {
    const unread = DATA.notifications.filter(n => !n.read).length;
    const admin = DATA.currentAdmin;
    return `
      <header class="topbar">
        <div class="topbar-left">
          <button class="menu-toggle" data-action="menu-toggle" aria-label="Mở menu">☰</button>
          <div class="brand" aria-label="Kaggri-Trade Admin">
            <span class="brand-mark">A</span>
            <span class="brand-name">Kaggri Admin</span>
            <span class="chip chip-soft">B2B</span>
          </div>
          <nav class="topnav" aria-label="Liên kết nhanh">
            <a href="${pathOf('buyer')}" target="_blank" rel="noopener" data-portal="buyer">Web Buyer ↗</a>
            <a href="${pathOf('vendor')}" target="_blank" rel="noopener" data-portal="vendor">Web Vendor ↗</a>
            <a href="${pathOf('root')}" data-portal="root">Tất cả cổng</a>
          </nav>
        </div>
        <div class="topbar-right">
          <span class="top-status"><i class="dot"></i>${H.esc(admin.roleLabel)}</span>
          <button class="top-icon" data-action="goto-notifications" aria-label="Thông báo">
            🔔<span class="badge-count">${unread}</span>
          </button>
          <div class="admin-chip">
            <span class="avatar">${H.esc(admin.avatar)}</span>
            <strong>${H.esc(admin.name)}</strong>
            <small>${H.esc(admin.id)}</small>
          </div>
        </div>
      </header>
      <div class="subbar">
        <span class="breadcrumb">⌂ Kaggri-Trade <span class="pill-sep">/</span> Admin Web <span class="pill-sep">/</span> <strong>${H.esc(titles[view] || "Tổng quan")}</strong></span>
        <span class="live-dot">● ${crumbs || "Trung tâm chỉ huy nền tảng"}</span>
      </div>
    `;
  };

  // Sinh đường dẫn tương đối tới các cổng từ docs/admin-ui/index.html
  function pathOf(target) {
    if (target === "buyer") return "../kaggri-trade-html-prototype/index.html";
    if (target === "vendor") return "../vendor-ui/index.html";
    if (target === "root") return "../portal.html";
    return "#";
  }

  // Sidebar
  function sidebar(menuOpen) {
    const state = window.KAGGRI_ADMIN_STATE || { view: "dashboard" };
    return `
      <aside class="sidebar ${menuOpen ? "open" : ""}" aria-label="Điều hướng Admin">
        <div class="brand-block">
          <span class="brand-mark lg">A</span>
          <span>
            <span class="brand-name">Kaggri Admin</span>
            <small>Quản trị nền tảng B2B</small>
          </span>
        </div>
        <nav class="nav-scroll">
          ${navGroups.map(g => `
            <div class="nav-label">${H.esc(g.label)}</div>
            ${g.items.map(([key, label, icon]) => `
              <button class="nav-item ${state.view === key ? "active" : ""}" data-nav="${key}">
                <span class="nav-icon">${H.esc(icon)}</span>
                <span>${H.esc(label)}</span>
                ${badgeCount(key)}
              </button>
            `).join("")}
          `).join("")}
        </nav>
        <div class="sidebar-foot">
          <div class="admin-mini">
            <span class="avatar">${H.esc(DATA.currentAdmin.avatar)}</span>
            <div>
              <strong>${H.esc(DATA.currentAdmin.name)}</strong>
              <small>${H.esc(DATA.currentAdmin.roleLabel)}</small>
            </div>
          </div>
        </div>
      </aside>
    `;
  }

  // Badge số lượng cảnh báo cho sidebar
  function badgeCount(key) {
    if (key === "kyc") {
      const cnt = DATA.pendingKyc.length;
      return cnt ? `<span class="nav-count">${cnt}</span>` : "";
    }
    if (key === "disputes") {
      const cnt = DATA.disputes.filter(d => d.status === "OPENED" || d.status === "MORE_EVIDENCE_REQUIRED").length;
      return cnt ? `<span class="nav-count">${cnt}</span>` : "";
    }
    if (key === "settlements") {
      const cnt = DATA.settlements.filter(s => s.status === "PAYING" || s.status === "DRAFT").length;
      return cnt ? `<span class="nav-count">${cnt}</span>` : "";
    }
    if (key === "transactions") {
      const cnt = DATA.transactions.filter(t => t.status === "failed" || t.status === "flagged").length;
      return cnt ? `<span class="nav-count">${cnt}</span>` : "";
    }
    return "";
  }

  // Modal mở với tiêu đề + body html
  function modal(title, bodyHtml, primaryLabel, primaryAction, secondaryLabel) {
    const html = `
      <div class="overlay" data-overlay="true">
        <div class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
          <div class="modal-head">
            <div>
              <h2 id="modal-title">${H.esc(title)}</h2>
            </div>
            <button class="modal-close" data-action="close-modal" aria-label="Đóng">×</button>
          </div>
          <form id="modal-form" data-submit="${H.esc(primaryAction)}">
            ${bodyHtml}
            <div class="modal-actions">
              <button type="button" class="btn btn-light" data-action="close-modal">${H.esc(secondaryLabel || "Hủy")}</button>
              <button type="submit" class="btn btn-primary">${H.esc(primaryLabel)} →</button>
            </div>
          </form>
        </div>
      </div>
    `;
    const root = document.getElementById("overlay-root");
    if (root) root.innerHTML = html;
    const first = document.querySelector(".modal input, .modal select, .modal textarea");
    if (first) first.focus();
  }

  function closeModal() {
    const root = document.getElementById("overlay-root");
    if (root) root.replaceChildren();
  }

  function toast(message) {
    const root = document.getElementById("toast-root");
    if (!root) return;
    const el = document.createElement("div");
    el.className = "toast";
    el.textContent = message;
    root.replaceChildren(el);
    setTimeout(() => el.remove(), 4000);
  }

  // Empty state
  function emptyState(title, hint, actionLabel, actionKey) {
    return `
      <div class="empty-state">
        <div class="empty-icon">∅</div>
        <strong>${H.esc(title)}</strong>
        <p>${H.esc(hint)}</p>
        ${actionLabel ? `<button class="btn btn-light" data-action="${H.esc(actionKey)}">${H.esc(actionLabel)}</button>` : ""}
      </div>
    `;
  }

  // Skeleton loading 4 dòng
  function skeleton(rows = 4) {
    return `
      <div class="skeleton-stack">
        ${Array.from({ length: rows }).map(() => `<div class="skeleton-line"></div>`).join("")}
      </div>
    `;
  }

  window.KaggriAdminComponents = {
    navGroups, titles,
    badge, card, kpiCard, detailPair,
    topBar, sidebar, pathOf, badgeCount,
    modal, closeModal, toast,
    emptyState, skeleton
  };
})();
