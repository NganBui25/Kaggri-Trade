(() => {
  "use strict";

  const DATA = window.KAGGRI_DATA;

  const money = (value) => `${new Intl.NumberFormat("vi-VN").format(value)} ₫`;

  const cartTotal = (cart) => cart.reduce(
    (sum, item) => sum + item.qty * item.unitPrice,
    0
  );

  const cartQuantity = (cart) => cart.reduce((sum, item) => sum + item.qty, 0);

  const vendorSubtotal = (cart, vendorId) => cart
    .filter((item) => item.vendorId === vendorId)
    .reduce((sum, item) => sum + item.qty * item.unitPrice, 0);

  const itemsForVendorIds = (cart, vendorIds) => {
    const allowedVendorIds = new Set(vendorIds);
    return cart.filter((item) => allowedVendorIds.has(item.vendorId));
  };

  const totalForVendorIds = (cart, vendorIds) => cartTotal(
    itemsForVendorIds(cart, vendorIds)
  );

  const vendorById = (id) => DATA.vendors.find((vendor) => vendor.id === id);

  const productById = (cart, id) => cart.find((product) => product.id === id);

  const paymentMethodById = (id) => DATA.paymentMethods.find((method) => method.id === id);

  const priceTierForQuantity = (product, quantity = product.qty) => {
    if (!product.priceTiers?.length) return null;

    return product.priceTiers.find((tier) => (
      quantity >= tier.minQty
      && (tier.maxQty === null || quantity <= tier.maxQty)
    )) || null;
  };

  const applyProductPricing = (product) => {
    const tier = priceTierForQuantity(product);
    if (tier) product.unitPrice = tier.unitPrice;
    product.amount = product.qty * product.unitPrice;
    return product;
  };

  const snapshotCartItem = (product) => ({
    id: product.id,
    vendorId: product.vendorId,
    name: product.name,
    sku: product.sku,
    unit: product.unit,
    qty: product.qty,
    unitPrice: product.unitPrice,
    amount: product.qty * product.unitPrice,
    note: product.note || "",
    image: product.image
  });

  const paymentFailureMap = Object.freeze({
    INSUFFICIENT_FUNDS: {
      title: "Số dư không đủ",
      description: "Tài khoản hoặc thẻ được chọn không đủ số dư để hoàn tất giao dịch.",
      cta: "Chọn phương thức khác"
    },
    CARD_DECLINED: {
      title: "Ngân hàng đã từ chối giao dịch",
      description: "Ngân hàng phát hành chưa chấp thuận giao dịch này. Buyer có thể chọn phương thức thanh toán khác.",
      cta: "Chọn phương thức khác"
    },
    AUTHENTICATION_FAILED: {
      title: "Xác thực thanh toán không thành công",
      description: "Bước xác thực với ngân hàng chưa hoàn tất. Buyer có thể thử lại phiên thanh toán.",
      cta: "Thử thanh toán lại"
    },
    PAYMENT_LIMIT_EXCEEDED: {
      title: "Giao dịch vượt hạn mức thanh toán",
      description: "Số tiền giao dịch vượt hạn mức hiện tại của tài khoản hoặc phương thức thanh toán.",
      cta: "Chọn phương thức khác"
    },
    BANK_UNAVAILABLE: {
      title: "Ngân hàng tạm thời không khả dụng",
      description: "Ngân hàng hiện chưa sẵn sàng xử lý giao dịch. Buyer có thể thử lại sau ít phút.",
      cta: "Thử thanh toán lại"
    },
    PROVIDER_TIMEOUT: {
      title: "Đối tác thanh toán phản hồi quá thời gian",
      description: "Chưa nhận được kết quả giao dịch trong thời gian chờ. Buyer có thể tạo lại phiên thanh toán.",
      cta: "Thử thanh toán lại"
    },
    USER_CANCELLED: {
      title: "Phiên thanh toán đã được hủy",
      description: "Quy trình thanh toán đã dừng trước khi giao dịch được xác nhận.",
      cta: "Thử thanh toán lại"
    },
    INVALID_PAYMENT_INFO: {
      title: "Thông tin thanh toán không hợp lệ",
      description: "Thông tin của phương thức thanh toán chưa được đối tác thanh toán chấp nhận.",
      cta: "Chọn phương thức khác"
    },
    TRANSACTION_NOT_FOUND: {
      title: "Không tìm thấy giao dịch",
      description: "Đối tác thanh toán không tìm thấy giao dịch tương ứng với mã tham chiếu.",
      cta: "Thử thanh toán lại"
    },
    UNKNOWN: {
      title: "Chưa thể hoàn tất thanh toán",
      description: "Đối tác thanh toán trả về trạng thái chưa thể phân loại. Buyer có thể chọn phương thức khác.",
      cta: "Chọn phương thức khác"
    }
  });

  const paymentFailureCategories = Object.freeze(Object.keys(paymentFailureMap));

  const paymentFailurePresentation = (category, retryable = false) => {
    const normalizedCategory = Object.hasOwn(paymentFailureMap, category)
      ? category
      : "UNKNOWN";
    const presentation = paymentFailureMap[normalizedCategory];

    return {
      ...presentation,
      category: normalizedCategory,
      cta: retryable ? "Thử thanh toán lại" : presentation.cta
    };
  };

  const formatDateTime = (value) => {
    if (!value) return "—";

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);

    return new Intl.DateTimeFormat("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false
    }).format(date);
  };

  const formatDateOnly = (value) => {
    const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(value || ""));
    return match ? `${match[3]}/${match[2]}/${match[1]}` : "—";
  };

  const formatTime = (seconds) => {
    const safeSeconds = Math.max(0, Number(seconds) || 0);
    const minutes = Math.floor(safeSeconds / 60).toString().padStart(2, "0");
    const remainder = Math.floor(safeSeconds % 60).toString().padStart(2, "0");
    return `${minutes}:${remainder}`;
  };

  const clampQuantity = (product, value) => {
    const numericValue = Number(value);
    const nextValue = Number.isFinite(numericValue) ? numericValue : product.minQty;
    return Math.max(product.minQty, Math.min(product.available, nextValue));
  };

  const escapeHtml = (value) => String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");

  const cloneProducts = (products) => products.map((product) => ({
    ...product,
    quality: product.quality.map((attribute) => [...attribute]),
    images: product.images?.map((image) => ({ ...image })),
    priceTiers: product.priceTiers?.map((tier) => ({ ...tier }))
  }));

  window.KaggriHelpers = Object.freeze({
    money,
    cartTotal,
    cartQuantity,
    vendorSubtotal,
    itemsForVendorIds,
    totalForVendorIds,
    vendorById,
    productById,
    paymentMethodById,
    priceTierForQuantity,
    applyProductPricing,
    snapshotCartItem,
    paymentFailureCategories,
    paymentFailurePresentation,
    formatDateTime,
    formatDateOnly,
    formatTime,
    clampQuantity,
    escapeHtml,
    cloneProducts
  });
})();
