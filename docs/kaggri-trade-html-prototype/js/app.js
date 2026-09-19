(() => {
  "use strict";

  const DATA = window.KAGGRI_DATA;
  const H = window.KaggriHelpers;
  const Screens = window.KaggriScreens;
  const app = document.getElementById("app");
  const toastRoot = document.getElementById("toast-root");
  const auth = window.KaggriAuth;
  const requireBuyer = (pendingAction) => {
    if (auth.role() === "buyer") return true;
    if (pendingAction) auth.setPendingAction(pendingAction);
    location.href = "../auth.html?role=buyer&next=" + encodeURIComponent(location.href);
    return false;
  };
  const requestedScreen = location.hash.replace(/^#/, "") || "b02";
  const normalizedRequestedScreen = requestedScreen === "b03" ? "b04" : requestedScreen;
  const preOrderScreens = ["b02", "b04", "b04-invoice", "b04-delivery"];
  if (normalizedRequestedScreen !== "b02" && auth.role() !== "buyer") {
    requireBuyer();
    return;
  }
  const initialScreen = (auth.role() === "buyer" || normalizedRequestedScreen === "b02") && preOrderScreens.includes(normalizedRequestedScreen)
    ? normalizedRequestedScreen
    : "b02";
  const catalog = H.cloneProducts(DATA.products);
  const requestedProductId = new URLSearchParams(location.search).get("product");
  const detailSource = DATA.products.find((product) => product.id === requestedProductId)
    || DATA.products[0];
  const detailProduct = H.cloneProducts([detailSource])[0];

  const state = {
    screen: initialScreen,
    catalog,
    productDetail: detailProduct,
    selectedProductImage: 0,
    cart: H.cloneProducts(DATA.products.filter((product) => product.id !== detailProduct.id)),
    parentOrder: null,
    vendorOrders: [],
    paymentAttempts: [],
    paymentAttempt: { ...DATA.paymentAttempt, vendorOrderIds: [], lineItems: [] },
    invoiceProfile: { ...DATA.buyer.invoiceProfile },
    deliveryProfile: {
      recipientName: DATA.buyer.recipientName,
      recipientPhone: DATA.buyer.recipientPhone,
      receivingAddress: DATA.buyer.receivingAddress,
      receivingWindow: DATA.buyer.receivingWindow,
      deliveryNote: DATA.buyer.deliveryNote,
      estimatedDelivery: DATA.logistics.estimatedDelivery
    },
    orderMode: "STANDARD",
    preorderDate: DATA.order.defaultPreorderDate,
    selectedPayment: "vietqr",
    selectedFailureCategory: "CARD_DECLINED",
    reservationRemaining: DATA.order.reservationMinutes * 60,
    orderTab: "overview",
    timer: null,
    lastInventoryRefreshAt: null
  };

  const clearReservationTimer = () => {
    if (state.timer !== null) {
      clearInterval(state.timer);
      state.timer = null;
    }
  };

  const toast = (message) => {
    const element = document.createElement("div");
    element.className = "toast";
    element.textContent = message;
    toastRoot.appendChild(element);

    setTimeout(() => element.classList.add("show"), 10);
    setTimeout(() => {
      element.classList.remove("show");
      setTimeout(() => element.remove(), 250);
    }, 1800);
  };

  const createParentOrder = () => {
    const subtotal = H.cartTotal(state.cart);
    return {
      id: DATA.order.id,
      createdAt: DATA.order.createdAt,
      status: "AWAITING_PAYMENT",
      orderMode: state.orderMode,
      preorderDate: state.orderMode === "PREORDER" ? state.preorderDate : null,
      subtotal,
      paymentMethod: null,
      settlementType: null,
      paymentStatus: "UNPAID",
      amountPaid: 0,
      amountDue: subtotal,
      refundAmount: 0,
      invoice: {
        requested: DATA.buyer.invoiceRequested,
        buyer: { ...state.invoiceProfile }
      },
      delivery: { ...state.deliveryProfile }
    };
  };

  const createVendorOrders = () => DATA.vendors
    .map((vendor, index) => {
      const items = state.cart
        .filter((product) => product.vendorId === vendor.id)
        .map(H.snapshotCartItem);

      return {
        id: `VO-${DATA.order.id.replace("PO-", "")}-${String(index + 1).padStart(2, "0")}`,
        parentOrderId: DATA.order.id,
        vendorId: vendor.id,
        items,
        amount: H.cartTotal(items),
        status: "PENDING_PAYMENT",
        fulfilmentStatus: null,
        paymentStatus: "UNPAID",
        refundStatus: null,
        refundAmount: 0,
        receivableStatus: null,
        dueDate: null,
        supplyCommitment: state.orderMode === "PREORDER" ? {
          requestedDate: state.preorderDate,
          status: "PENDING",
          committedQuantity: 0
        } : null,
        respondedAt: null,
        rejectionReason: null,
        invoice: {
          requested: DATA.buyer.invoiceRequested,
          status: DATA.buyer.invoiceRequested ? "PENDING_ORDER_CONFIRMATION" : "NOT_REQUESTED",
          requestedAt: null,
          issuedAt: null,
          invoiceNumber: null
        }
      };
    })
    .filter((vendorOrder) => vendorOrder.items.length);

  const hasConfirmedSettlement = () => Boolean(
    state.parentOrder
    && (
      state.parentOrder.paymentStatus === "PAID"
      || state.parentOrder.paymentStatus === "PAY_ON_DELIVERY"
      || state.parentOrder.paymentStatus === "CREDIT_APPROVED"
    )
  );

  const isPreorder = () => state.parentOrder?.orderMode === "PREORDER";
  const hasPendingSupplier = () => state.vendorOrders.some(
    (vendorOrder) => vendorOrder.status === "PENDING_CONFIRMATION"
  );
  const hasAcceptedSupplier = () => state.vendorOrders.some(
    (vendorOrder) => vendorOrder.status === "ACCEPTED"
  );

  const updateParentOrderStatus = () => {
    if (!state.parentOrder || !state.vendorOrders.length) return;

    const statuses = state.vendorOrders.map((vendorOrder) => vendorOrder.status);
    const allRejected = statuses.every((status) => status === "REJECTED");
    const hasPending = statuses.includes("PENDING_CONFIRMATION");
    const hasAccepted = statuses.includes("ACCEPTED");

    if (allRejected) {
      state.parentOrder.status = "REJECTED";
    } else if (hasAccepted && hasPending) {
      state.parentOrder.status = "PARTIALLY_CONFIRMED";
    } else if (hasAccepted) {
      state.parentOrder.status = "CONFIRMED";
    } else {
      state.parentOrder.status = "PENDING_SUPPLIER_CONFIRMATION";
    }
  };

  const canAccess = (screen) => {
    if (preOrderScreens.includes(screen)) return screen === "b02" || auth.role() === "buyer";
    if (screen === "b10a") return Boolean(
      state.parentOrder
      && hasPendingSupplier()
      && (isPreorder() || hasConfirmedSettlement())
    );
    if (screen === "b05") return Boolean(
      state.parentOrder
      && state.parentOrder.paymentStatus === "UNPAID"
      && (!isPreorder() || (!hasPendingSupplier() && hasAcceptedSupplier()))
    );
    if (screen === "b06") {
      return state.paymentAttempt.paymentStatus === "pending"
        && state.paymentAttempt.reservationStatus === "HELD";
    }
    if (screen === "b07") return state.paymentAttempt.paymentStatus === "failed";
    if (screen === "b08") return state.paymentAttempt.paymentStatus === "expired";
    if (screen === "b09") return state.paymentAttempt.paymentStatus === "success";
    if (screen === "b10") return Boolean(
      state.parentOrder
      && !hasPendingSupplier()
      && (
        hasConfirmedSettlement()
        || (isPreorder() && !hasAcceptedSupplier())
      )
    );
    return false;
  };

  const fallbackScreen = () => {
    if (isPreorder()) {
      if (hasPendingSupplier()) return "b10a";
      if (state.parentOrder.paymentStatus === "UNPAID" && hasAcceptedSupplier()) return "b05";
      if (!hasAcceptedSupplier() || hasConfirmedSettlement()) return "b10";
    }
    if (state.parentOrder?.paymentStatus === "UNPAID") return "b05";
    if (hasConfirmedSettlement()) {
      return hasPendingSupplier()
        ? "b10a"
        : "b10";
    }
    return state.cart.length ? "b04" : "b02";
  };

  const resolveScreen = (screen) => {
    const normalizedScreen = screen === "b03" ? "b04" : screen;
    return Screens.has(normalizedScreen) && canAccess(normalizedScreen)
      ? normalizedScreen
      : fallbackScreen();
  };

  const route = (screen) => {
    if (screen !== "b02" && !requireBuyer()) return;
    const target = resolveScreen(screen);

    if (location.hash === `#${target}`) {
      state.screen = target;
      render();
    } else {
      location.hash = target;
    }

    window.scrollTo({ top: 0, behavior: "auto" });
  };

  const expirePaymentSession = () => {
    if (state.paymentAttempt.paymentStatus !== "pending") return;
    state.paymentAttempt.paymentStatus = "expired";
    state.paymentAttempt.reservationStatus = "RELEASED";
    state.paymentAttempt.failedAt = "2026-09-17T11:12:18+07:00";
    if (state.parentOrder) {
      state.parentOrder.status = "AWAITING_PAYMENT";
      state.parentOrder.paymentStatus = "UNPAID";
    }
    clearReservationTimer();
    route("b08");
  };

  const startReservationTimer = () => {
    state.timer = setInterval(() => {
      state.reservationRemaining = Math.max(0, state.reservationRemaining - 1);
      const countdown = document.getElementById("reservation-countdown");

      if (countdown) countdown.textContent = H.formatTime(state.reservationRemaining);
      if (state.reservationRemaining === 0) expirePaymentSession();
    }, 1000);
  };

  const applyPaymentFailure = (category) => {
    if (state.paymentAttempt.paymentStatus !== "pending") return;

    const normalizedCategory = H.paymentFailureCategories.includes(category)
      ? category
      : "UNKNOWN";
    const mock = DATA.paymentFailureMocks[normalizedCategory];

    Object.assign(state.paymentAttempt, {
      paymentStatus: "failed",
      providerCode: mock.providerCode,
      providerMessage: mock.providerMessage,
      failureCategory: normalizedCategory,
      retryable: mock.retryable,
      failedAt: "2026-09-17T10:42:18+07:00",
      reservationStatus: "RELEASED"
    });
    if (state.parentOrder) {
      state.parentOrder.status = "AWAITING_PAYMENT";
      state.parentOrder.paymentStatus = "UNPAID";
    }
    route("b07");
  };

  const updateEditableProduct = (id, value) => {
    const cartProduct = H.productById(state.cart, id);
    const product = cartProduct || (state.productDetail.id === id ? state.productDetail : null);
    if (!product) return;

    const numericValue = Number(value);
    product.qty = state.orderMode === "PREORDER"
      ? Math.max(product.minQty, Math.min(100000, Number.isFinite(numericValue) ? numericValue : product.minQty))
      : H.clampQuantity(product, value);
    H.applyProductPricing(product);

    if (state.productDetail.id === id && state.productDetail !== product) {
      state.productDetail.qty = product.qty;
      state.productDetail.unitPrice = product.unitPrice;
      state.productDetail.amount = product.amount;
    }
  };

  const ensureDetailProductInCart = () => {
    if (H.productById(state.cart, state.productDetail.id)) return;
    state.cart.push(H.cloneProducts([state.productDetail])[0]);
  };

  function render() {
    clearReservationTimer();
    app.innerHTML = Screens.render(state, state.screen);

    if (state.screen === "b06") startReservationTimer();
  }

  window.addEventListener("hashchange", () => {
    const requested = location.hash.replace(/^#/, "") || "b02";
    if (requested !== "b02" && !requireBuyer()) return;
    const target = resolveScreen(requested);

    if (target !== requested) {
      location.hash = target;
      return;
    }

    state.screen = target;
    render();
  });

  window.addEventListener("beforeunload", clearReservationTimer);

  window.Kaggri = Object.freeze({
    route,
    formatTime: H.formatTime,

    changeQty(id, delta) {
      const current = H.productById(state.cart, id)
        || (state.productDetail.id === id ? state.productDetail : null);
      if (!current) return;
      updateEditableProduct(id, current.qty + Number(delta));
      render();
    },

    setQty(id, value) {
      updateEditableProduct(id, value);
      render();
    },

    setOrderMode(mode) {
      if (!["STANDARD", "PREORDER"].includes(mode)) return;
      state.orderMode = mode;
      if (mode === "STANDARD") {
        state.cart.forEach((product) => {
          product.qty = H.clampQuantity(product, product.qty);
          H.applyProductPricing(product);
        });
      }
      render();
    },

    setPreorderDate(value) {
      if (/^\d{4}-\d{2}-\d{2}$/.test(String(value))) {
        state.preorderDate = String(value);
        render();
      }
    },

    selectProductImage(index) {
      const images = state.productDetail.images || [];
      const nextIndex = Number(index);
      if (!Number.isInteger(nextIndex) || nextIndex < 0 || nextIndex >= images.length) return;
      state.selectedProductImage = nextIndex;
      render();
    },

    editNote(id) {
      const product = H.productById(state.cart, id);
      if (!product) return;

      const nextNote = prompt("Ghi chú cho sản phẩm (tối đa 300 ký tự):", product.note || "");
      if (nextNote === null) return;

      product.note = nextNote.slice(0, 300);
      render();
      toast("Đã cập nhật ghi chú");
    },

    removeFromCart(id) {
      const index = state.cart.findIndex((product) => product.id === id);
      if (index < 0) return;
      state.cart.splice(index, 1);
      render();
      toast("Đã xóa sản phẩm khỏi giỏ hàng");
    },

    addToCart() {
      if (!requireBuyer("addToCart")) return;
      ensureDetailProductInCart();
      toast(`Đã thêm ${state.productDetail.name} vào giỏ hàng`);
      route("b04");
    },

    buyNow() {
      if (!requireBuyer("buyNow")) return;
      ensureDetailProductInCart();
      route("b04");
    },

    refreshCart() {
      state.cart.forEach((product) => {
        const source = DATA.products.find((item) => item.id === product.id);
        if (!source) return;
        product.available = source.available;
        H.applyProductPricing(product);
      });
      state.lastInventoryRefreshAt = "17/09/2026 09:30";
      render();
      toast("Đã đối chiếu lại tồn kho và bậc giá mock");
    },

    saveInvoiceProfile(form) {
      const companyName = form.elements.companyName.value.trim();
      const taxCode = form.elements.taxCode.value.trim();
      const billingAddress = form.elements.billingAddress.value.trim();
      const invoiceEmail = form.elements.invoiceEmail.value.trim();

      if (
        !companyName
        || !billingAddress
        || !/^\d{10}(-\d{3})?$/.test(taxCode)
        || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(invoiceEmail)
      ) {
        toast("Vui lòng kiểm tra đầy đủ thông tin xuất hóa đơn VAT");
        return;
      }

      state.invoiceProfile = { companyName, taxCode, billingAddress, invoiceEmail };
      route("b04");
      toast("Đã cập nhật thông tin xuất hóa đơn");
    },

    saveDeliveryProfile(form) {
      const recipientName = form.elements.recipientName.value.trim();
      const recipientPhone = form.elements.recipientPhone.value.trim();
      const receivingAddress = form.elements.receivingAddress.value.trim();
      const receivingWindow = form.elements.receivingWindow.value.trim();
      const deliveryNote = form.elements.deliveryNote.value.trim();

      if (
        !recipientName
        || !/^[0-9+().\s-]{8,20}$/.test(recipientPhone)
        || !receivingAddress
        || !receivingWindow
      ) {
        toast("Vui lòng nhập đầy đủ thông tin nhận hàng");
        return;
      }

      state.deliveryProfile = {
        ...state.deliveryProfile,
        recipientName,
        recipientPhone,
        receivingAddress,
        receivingWindow,
        deliveryNote
      };
      route("b04");
      toast("Đã cập nhật thông tin nhận hàng");
    },

    submitCheckout() {
      if (!state.cart.length) {
        route("b02");
        return;
      }

      if (state.orderMode === "PREORDER" && state.preorderDate < DATA.order.minPreorderDate) {
        toast(`Đơn đặt trước cần cách ngày đặt tối thiểu ${DATA.order.preorderLeadDaysMin} ngày`);
        return;
      }

      state.parentOrder = createParentOrder();
      state.vendorOrders = createVendorOrders();
      state.paymentAttempts = [];
      state.paymentAttempt = { ...DATA.paymentAttempt, vendorOrderIds: [], lineItems: [] };
      state.orderTab = "overview";
      if (state.orderMode === "PREORDER") {
        state.parentOrder.status = "PENDING_SUPPLIER_CONFIRMATION";
        state.vendorOrders.forEach((vendorOrder) => {
          vendorOrder.status = "PENDING_CONFIRMATION";
        });
        route("b10a");
      } else {
        route("b05");
      }
    },

    selectPayment(id) {
      const method = H.paymentMethodById(id);
      if (!method?.eligible) {
        toast("Buyer chưa đủ điều kiện sử dụng phương thức này");
        return;
      }
      state.selectedPayment = id;
      render();
    },

    selectFailureCategory(category) {
      if (H.paymentFailureCategories.includes(category)) {
        state.selectedFailureCategory = category;
      }
    },

    startPayment() {
      if (!state.parentOrder || state.parentOrder.paymentStatus !== "UNPAID") return;

      const method = H.paymentMethodById(state.selectedPayment);
      if (!method?.eligible) {
        toast("Phương thức thanh toán này hiện chưa khả dụng");
        return;
      }

      const payableVendorOrders = isPreorder()
        ? state.vendorOrders.filter((vendorOrder) => vendorOrder.status === "ACCEPTED")
        : state.vendorOrders;
      if (!payableVendorOrders.length) return;
      const payableAmount = payableVendorOrders.reduce(
        (sum, vendorOrder) => sum + vendorOrder.amount,
        0
      );

      if (
        method.settlementType === "CREDIT"
        && payableAmount > DATA.buyer.creditProfile.available
      ) {
        toast("Giá trị đơn vượt hạn mức công nợ còn lại");
        return;
      }

      const sequence = state.paymentAttempts.length + 1;
      const lineItems = payableVendorOrders.flatMap((vendorOrder) => (
        vendorOrder.items.map((item) => ({ ...item, vendorOrderId: vendorOrder.id }))
      ));

      state.parentOrder.paymentMethod = method.id;
      state.parentOrder.settlementType = method.settlementType;

      if (method.settlementType === "COD" || method.settlementType === "CREDIT") {
        const paymentStatus = method.settlementType === "COD"
          ? "PAY_ON_DELIVERY"
          : "CREDIT_APPROVED";
        state.parentOrder.status = isPreorder() ? "CONFIRMED" : "PENDING_SUPPLIER_CONFIRMATION";
        state.parentOrder.paymentStatus = paymentStatus;
        state.parentOrder.amountPaid = 0;
        state.parentOrder.amountDue = payableAmount;
        payableVendorOrders.forEach((vendorOrder) => {
          if (!isPreorder()) vendorOrder.status = "PENDING_CONFIRMATION";
          vendorOrder.paymentStatus = method.settlementType === "COD"
            ? "DUE_ON_DELIVERY"
            : "ON_CREDIT";
          vendorOrder.receivableStatus = method.settlementType === "CREDIT"
            ? (isPreorder() ? "OPEN" : "PENDING_ACCEPTANCE")
            : null;
          if (isPreorder()) {
            vendorOrder.fulfilmentStatus = "SCHEDULED";
            vendorOrder.invoice.status = vendorOrder.invoice.requested ? "REQUESTED" : "NOT_REQUESTED";
            vendorOrder.invoice.requestedAt = "2026-09-17T10:30:00+07:00";
          }
        });
        route(isPreorder() ? "b10" : "b10a");
        return;
      }

      const attempt = {
        ...DATA.paymentAttempt,
        paymentStatus: "pending",
        settlementType: "PREPAID",
        paymentMethod: state.selectedPayment,
        paymentReference: `${DATA.order.paymentId}-${String(sequence).padStart(2, "0")}`,
        vendorOrderIds: payableVendorOrders.map((vendorOrder) => vendorOrder.id),
        lineItems,
        amount: H.cartTotal(lineItems),
        reservationStatus: "HELD",
        createdAt: "2026-09-17T10:30:00+07:00"
      };

      state.paymentAttempts.push(attempt);
      state.paymentAttempt = attempt;
      state.parentOrder.status = "PAYMENT_PROCESSING";
      state.parentOrder.paymentStatus = "PROCESSING";
      state.reservationRemaining = DATA.order.reservationMinutes * 60;
      route("b06");
    },

    simulatePayment(status) {
      if (status === "failed") {
        applyPaymentFailure(state.selectedFailureCategory);
        return;
      }
      if (status === "expired") {
        expirePaymentSession();
        return;
      }
      if (status !== "success" || state.paymentAttempt.paymentStatus !== "pending") return;

      state.paymentAttempt.paymentStatus = "success";
      state.paymentAttempt.reservationStatus = "CAPTURED";
      state.parentOrder.status = isPreorder() ? "CONFIRMED" : "PENDING_SUPPLIER_CONFIRMATION";
      state.parentOrder.paymentStatus = "PAID";
      state.parentOrder.amountPaid = state.paymentAttempt.amount;
      state.parentOrder.amountDue = 0;
      state.vendorOrders.forEach((vendorOrder) => {
        if (state.paymentAttempt.vendorOrderIds.includes(vendorOrder.id)) {
          if (!isPreorder()) vendorOrder.status = "PENDING_CONFIRMATION";
          vendorOrder.paymentStatus = "PAID";
          if (isPreorder()) {
            vendorOrder.fulfilmentStatus = "SCHEDULED";
            vendorOrder.invoice.status = vendorOrder.invoice.requested ? "REQUESTED" : "NOT_REQUESTED";
            vendorOrder.invoice.requestedAt = "2026-09-17T10:42:18+07:00";
          }
        }
      });
      updateParentOrderStatus();
      route("b09");
    },

    simulatePaymentFailure(category = state.selectedFailureCategory) {
      applyPaymentFailure(category);
    },

    retryPayment() {
      route("b05");
    },

    setVendorOrderStatus(vendorId, status) {
      const vendorOrder = state.vendorOrders.find((order) => order.vendorId === vendorId);
      if (
        !vendorOrder
        || vendorOrder.status !== "PENDING_CONFIRMATION"
        || !["ACCEPTED", "REJECTED"].includes(status)
      ) return;

      vendorOrder.status = status;
      vendorOrder.fulfilmentStatus = status === "ACCEPTED"
        ? (isPreorder() ? "COMMITTED" : "PREPARING")
        : null;
      if (vendorOrder.supplyCommitment) {
        vendorOrder.supplyCommitment.status = status === "ACCEPTED" ? "CONFIRMED" : "REJECTED";
        vendorOrder.supplyCommitment.committedQuantity = status === "ACCEPTED"
          ? vendorOrder.items.reduce((sum, item) => sum + item.qty, 0)
          : 0;
      }
      vendorOrder.respondedAt = "2026-09-17T10:15:00+07:00";
      vendorOrder.rejectionReason = status === "REJECTED"
        ? "Nhà cung cấp không thể đáp ứng toàn bộ VendorOrder trong thời gian yêu cầu."
        : null;
      if (status === "REJECTED") {
        vendorOrder.invoice.status = "NOT_APPLICABLE";
        vendorOrder.paymentStatus = "NOT_APPLICABLE";
        if (
          state.parentOrder.settlementType === "PREPAID"
          && state.parentOrder.paymentStatus === "PAID"
        ) {
          vendorOrder.refundStatus = "PENDING";
          vendorOrder.refundAmount = vendorOrder.amount;
          state.parentOrder.refundAmount += vendorOrder.amount;
        }
      } else {
        vendorOrder.invoice.status = vendorOrder.invoice.requested
          ? (isPreorder() ? "PENDING_PAYMENT" : "REQUESTED")
          : "NOT_REQUESTED";
        vendorOrder.invoice.requestedAt = isPreorder() ? null : "2026-09-17T10:15:00+07:00";
        if (state.parentOrder.settlementType === "CREDIT") {
          vendorOrder.receivableStatus = "OPEN";
        }
      }
      if (isPreorder() || ["COD", "CREDIT"].includes(state.parentOrder.settlementType)) {
        state.parentOrder.amountDue = state.vendorOrders
          .filter((order) => order.status === "ACCEPTED" || order.status === "PENDING_CONFIRMATION")
          .reduce((sum, order) => sum + order.amount, 0);
      }
      updateParentOrderStatus();
      const hasPendingSupplier = state.vendorOrders.some(
        (order) => order.status === "PENDING_CONFIRMATION"
      );
      if (hasPendingSupplier) {
        render();
      } else if (isPreorder() && hasAcceptedSupplier()) {
        route("b05");
      } else {
        route("b10");
      }
      toast(`VendorOrder đã được ${status === "ACCEPTED" ? "xác nhận" : "từ chối"} toàn bộ`);
    },

    selectOrderTab(tab) {
      if (!["overview", "vendors", "payment", "delivery", "invoice"].includes(tab)) return;
      state.orderTab = tab;
      render();
    },

    simulateInvoiceIssued(vendorId) {
      const vendorOrder = state.vendorOrders.find((order) => order.vendorId === vendorId);
      if (!vendorOrder || vendorOrder.invoice.status !== "REQUESTED") return;
      vendorOrder.invoice.status = "ISSUED";
      vendorOrder.invoice.issuedAt = "2026-09-17T14:00:00+07:00";
      vendorOrder.invoice.invoiceNumber = `INV-${vendorOrder.id.slice(-2)}-2026`;
      if (state.parentOrder.settlementType === "CREDIT" && vendorOrder.status === "ACCEPTED") {
        vendorOrder.dueDate = "02/10/2026";
      }
      render();
      toast("Đã mô phỏng nhà cung cấp phát hành hóa đơn");
    },

    simulateLogisticsEta() {
      state.deliveryProfile.estimatedDelivery = "19/09/2026 • 05:30 - 06:30";
      if (state.parentOrder) state.parentOrder.delivery.estimatedDelivery = state.deliveryProfile.estimatedDelivery;
      render();
      toast("Đã nhận ETA mock từ đối tác logistics");
    }
  });

  if (location.hash !== `#${initialScreen}`) location.hash = initialScreen;
  render();
  if (auth.role() === "buyer") {
    const pendingAction = auth.takePendingAction();
    if (pendingAction === "addToCart" || pendingAction === "buyNow") window.Kaggri[pendingAction]();
  }
})();
