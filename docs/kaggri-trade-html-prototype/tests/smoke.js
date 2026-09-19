"use strict";

const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const projectRoot = path.resolve(__dirname, "..");
const sourceFiles = ["js/data.js", "js/helpers.js", "js/components.js", "js/screens.js"];
const context = { window: {} };
context.window.window = context.window;
vm.createContext(context);
sourceFiles.forEach((relativePath) => {
  const filename = path.join(projectRoot, relativePath);
  vm.runInContext(fs.readFileSync(filename, "utf8"), context, { filename });
});

const data = context.window.KAGGRI_DATA;
const helpers = context.window.KaggriHelpers;
const screens = context.window.KaggriScreens;
const fullCart = helpers.cloneProducts(data.products);
const invoiceProfile = { ...data.buyer.invoiceProfile };
const deliveryProfile = {
  recipientName: data.buyer.recipientName,
  recipientPhone: data.buyer.recipientPhone,
  receivingAddress: data.buyer.receivingAddress,
  receivingWindow: data.buyer.receivingWindow,
  deliveryNote: data.buyer.deliveryNote,
  estimatedDelivery: null
};

const makeVendorOrders = (statuses = ["ACCEPTED", "REJECTED"]) => data.vendors.map((vendor, index) => {
  const items = fullCart
    .filter((product) => product.vendorId === vendor.id)
    .map(helpers.snapshotCartItem);
  const status = statuses[index];
  return {
    id: `VO-TEST-${index + 1}`,
    parentOrderId: data.order.id,
    vendorId: vendor.id,
    items,
    amount: helpers.cartTotal(items),
    status,
    fulfilmentStatus: status === "ACCEPTED" ? "PREPARING" : null,
    paymentStatus: status === "ACCEPTED" ? "PAID" : "NOT_APPLICABLE",
    refundStatus: status === "REJECTED" ? "PENDING" : null,
    refundAmount: status === "REJECTED" ? helpers.cartTotal(items) : 0,
    receivableStatus: null,
    dueDate: null,
    respondedAt: "2026-09-17T10:15:00+07:00",
    rejectionReason: status === "REJECTED" ? "Không thể đáp ứng toàn bộ đơn." : null,
    invoice: {
      requested: true,
      status: status === "REJECTED" ? "NOT_APPLICABLE" : "REQUESTED",
      requestedAt: status === "ACCEPTED" ? "2026-09-17T10:15:00+07:00" : null,
      issuedAt: null,
      invoiceNumber: null
    }
  };
});

const vendorOrders = makeVendorOrders();
const paidItems = vendorOrders.flatMap((vendorOrder) => vendorOrder.items.map(
  (item) => ({ ...item, vendorOrderId: vendorOrder.id })
));
const successfulAttempt = {
  ...data.paymentAttempt,
  paymentStatus: "success",
  settlementType: "PREPAID",
  paymentMethod: "vietqr",
  paymentReference: `${data.order.paymentId}-01`,
  vendorOrderIds: vendorOrders.map((vendorOrder) => vendorOrder.id),
  lineItems: paidItems,
  amount: helpers.cartTotal(paidItems),
  reservationStatus: "CAPTURED",
  createdAt: "2026-09-17T10:30:00+07:00"
};
const state = {
  catalog: helpers.cloneProducts(data.products),
  productDetail: helpers.cloneProducts([data.products[0]])[0],
  selectedProductImage: 0,
  cart: fullCart,
  parentOrder: {
    id: data.order.id,
    createdAt: data.order.createdAt,
    status: "CONFIRMED",
    subtotal: 22_640_000,
    paymentMethod: "vietqr",
    settlementType: "PREPAID",
    paymentStatus: "PAID",
    amountPaid: 22_640_000,
    amountDue: 0,
    refundAmount: 12_360_000,
    invoice: { requested: true, buyer: invoiceProfile },
    delivery: deliveryProfile
  },
  vendorOrders,
  paymentAttempts: [successfulAttempt],
  paymentAttempt: {
    ...successfulAttempt,
    paymentStatus: "failed",
    ...data.paymentFailureMocks.CARD_DECLINED,
    failureCategory: "CARD_DECLINED",
    failedAt: "2026-09-17T10:42:18+07:00",
    reservationStatus: "RELEASED"
  },
  invoiceProfile,
  deliveryProfile,
  selectedPayment: "vietqr",
  selectedFailureCategory: "CARD_DECLINED",
  reservationRemaining: data.order.reservationMinutes * 60,
  orderTab: "overview",
  lastInventoryRefreshAt: null
};

const expectedAmounts = { p1: 5_880_000, p2: 4_400_000, p3: 8_100_000, p4: 4_260_000 };
fullCart.forEach((product) => {
  assert.equal(product.qty * product.unitPrice, expectedAmounts[product.id], `Sai thành tiền ${product.id}`);
});
assert.equal(helpers.cartTotal(fullCart), 22_640_000, "Sai tổng tiền");
assert.equal(data.order.createdAt, "17/09/2026", "Sai ngày đơn");
assert.equal(data.order.reservationMinutes, 30, "Sai thời gian reservation");
assert.equal(data.paymentMethods.length, 5, "B05 phải có đúng 5 phương thức");
assert.equal(data.paymentMethods.filter((method) => method.settlementType === "PREPAID").length, 3);
assert.equal(data.paymentMethods.filter((method) => method.settlementType === "COD").length, 1);
assert.equal(data.paymentMethods.filter((method) => method.settlementType === "CREDIT").length, 1);
assert.equal(data.buyer.creditProfile.available, 38_000_000, "Sai hạn mức công nợ còn lại");

const cabbage = helpers.cloneProducts([data.products[0]])[0];
cabbage.qty = 100;
helpers.applyProductPricing(cabbage);
assert.equal(cabbage.unitPrice, 18_500, "Sai bậc giá 100–299 kg");
cabbage.qty = 1_000;
helpers.applyProductPricing(cabbage);
assert.equal(cabbage.unitPrice, 15_200, "Sai bậc giá từ 1.000 kg");

[
  "b02", "b04", "b04-invoice", "b04-delivery", "b05", "b06",
  "b07", "b08", "b09", "b10a", "b10"
].forEach((screen) => {
  const html = screens.render(state, screen);
  assert.match(html, /class="page"/, `${screen} thiếu page shell`);
  assert.doesNotMatch(html, /undefined|NaN/, `${screen} render giá trị không hợp lệ`);
});

assert.match(screens.render(state, "b04"), /Tiếp tục chọn thanh toán/, "B04 chưa đi tới thanh toán");
const paymentMethodHtml = screens.render(state, "b05");
assert.match(paymentMethodHtml, /Thanh toán khi nhận hàng \(COD\)/, "B05 thiếu COD");
assert.match(paymentMethodHtml, /Công nợ doanh nghiệp/, "B05 thiếu công nợ B2B");
assert.match(paymentMethodHtml, /22\.640\.000 ₫/, "B05 phải tính toàn bộ đơn trước khi NCC xác nhận");
assert.doesNotMatch(screens.render(state, "b07"), /Do not honor/, "B07 lộ providerMessage");

const createRuntime = () => {
  const listeners = {};
  const appElement = { innerHTML: "" };
  const toastRoot = { appendChild() {} };
  const location = {};
  let currentHash = "";
  let intervalStarts = 0;
  const runtime = {
    console, Intl, Object, Number, String, Math, URLSearchParams, location,
    prompt: () => null,
    setInterval: () => { intervalStarts += 1; return intervalStarts; },
    clearInterval() {},
    setTimeout() {},
    document: {
      getElementById(id) {
        if (id === "app") return appElement;
        if (id === "toast-root") return toastRoot;
        return null;
      },
      createElement() {
        return { className: "", textContent: "", classList: { add() {}, remove() {} }, remove() {} };
      }
    },
    addEventListener(eventName, callback) { listeners[eventName] = callback; },
    scrollTo() {}
  };
  runtime.window = runtime;
  const session = new Map([["kaggri-demo-role", "buyer"]]);
  runtime.sessionStorage = {
    getItem: key => session.get(key) ?? null,
    setItem: (key, value) => session.set(key, value),
    removeItem: key => session.delete(key)
  };
  runtime.KaggriAuth = {
    role: () => runtime.sessionStorage.getItem("kaggri-demo-role"),
    setPendingAction: value => runtime.sessionStorage.setItem("kaggri-pending-action", value),
    takePendingAction: () => {
      const value = runtime.sessionStorage.getItem("kaggri-pending-action");
      runtime.sessionStorage.removeItem("kaggri-pending-action");
      return value;
    }
  };
  Object.defineProperty(location, "hash", {
    get: () => currentHash,
    set: (value) => {
      currentHash = value.startsWith("#") ? value : `#${value}`;
      listeners.hashchange?.();
    }
  });
  vm.createContext(runtime);
  [...sourceFiles, "js/app.js"].forEach((relativePath) => {
    const filename = path.join(projectRoot, relativePath);
    vm.runInContext(fs.readFileSync(filename, "utf8"), runtime, { filename });
  });
  return { runtime, appElement, location, getIntervalStarts: () => intervalStarts };
};

const reachPaymentMethod = (scenario) => {
  scenario.runtime.Kaggri.addToCart();
  assert.equal(scenario.location.hash, "#b04");
  scenario.runtime.Kaggri.submitCheckout();
  assert.equal(scenario.location.hash, "#b05", "B04 phải tới B05 trước NCC");
  scenario.runtime.Kaggri.route("b10a");
  assert.equal(scenario.location.hash, "#b05", "Không được vào B10A trước khi xác nhận thanh toán");
};

const prepaid = createRuntime();
reachPaymentMethod(prepaid);
prepaid.runtime.Kaggri.startPayment();
assert.equal(prepaid.location.hash, "#b06");
assert.equal(prepaid.getIntervalStarts(), 1, "Countdown chỉ bắt đầu tại B06");
assert.match(prepaid.appElement.innerHTML, /22\.640\.000 ₫/);
prepaid.runtime.Kaggri.simulatePayment("success");
assert.equal(prepaid.location.hash, "#b09");
assert.match(prepaid.appElement.innerHTML, /Đang chờ nhà cung cấp xác nhận/);
prepaid.runtime.Kaggri.route("b10a");
prepaid.runtime.Kaggri.setVendorOrderStatus("v1", "ACCEPTED");
assert.equal(prepaid.location.hash, "#b10a", "Còn NCC pending phải ở B10A");
prepaid.runtime.Kaggri.setVendorOrderStatus("v2", "REJECTED");
assert.equal(prepaid.location.hash, "#b10", "Đủ phản hồi phải tới B10");
prepaid.runtime.Kaggri.selectOrderTab("payment");
assert.match(prepaid.appElement.innerHTML, /TỔNG ĐÃ THANH TOÁN[\s\S]*22\.640\.000 ₫/);
assert.match(prepaid.appElement.innerHTML, /Chờ hoàn do NCC từ chối[\s\S]*12\.360\.000 ₫/);

const failed = createRuntime();
reachPaymentMethod(failed);
failed.runtime.Kaggri.startPayment();
failed.runtime.Kaggri.simulatePaymentFailure("CARD_DECLINED");
assert.equal(failed.location.hash, "#b07");
assert.doesNotMatch(failed.appElement.innerHTML, /Do not honor/);
failed.runtime.Kaggri.retryPayment();
assert.equal(failed.location.hash, "#b05");

const cod = createRuntime();
reachPaymentMethod(cod);
cod.runtime.Kaggri.selectPayment("cod");
cod.runtime.Kaggri.startPayment();
assert.equal(cod.location.hash, "#b10a", "COD bỏ qua B06 và tới chờ NCC");
assert.equal(cod.getIntervalStarts(), 0, "COD không tạo payment reservation");
cod.runtime.Kaggri.setVendorOrderStatus("v1", "ACCEPTED");
cod.runtime.Kaggri.setVendorOrderStatus("v2", "REJECTED");
cod.runtime.Kaggri.selectOrderTab("payment");
assert.match(cod.appElement.innerHTML, /THU KHI GIAO HÀNG[\s\S]*10\.280\.000 ₫/);
assert.doesNotMatch(cod.appElement.innerHTML, /TỔNG ĐÃ THANH TOÁN/);

const credit = createRuntime();
reachPaymentMethod(credit);
credit.runtime.Kaggri.selectPayment("credit");
assert.match(credit.appElement.innerHTML, /NET 15/);
credit.runtime.Kaggri.startPayment();
assert.equal(credit.location.hash, "#b10a", "Công nợ bỏ qua cổng thanh toán");
credit.runtime.Kaggri.setVendorOrderStatus("v1", "ACCEPTED");
credit.runtime.Kaggri.setVendorOrderStatus("v2", "ACCEPTED");
credit.runtime.Kaggri.selectOrderTab("payment");
assert.match(credit.appElement.innerHTML, /CÔNG NỢ DỰ KIẾN[\s\S]*22\.640\.000 ₫/);
credit.runtime.Kaggri.selectOrderTab("invoice");
credit.runtime.Kaggri.simulateInvoiceIssued("v1");
assert.match(credit.appElement.innerHTML, /Đã phát hành/);
assert.match(credit.appElement.innerHTML, /02\/10\/2026/, "Công nợ thiếu ngày đến hạn NET 15");

const preorder = createRuntime();
preorder.runtime.Kaggri.addToCart();
preorder.runtime.Kaggri.setOrderMode("PREORDER");
assert.match(preorder.appElement.innerHTML, /Đặt trước theo kế hoạch/);
assert.match(preorder.appElement.innerHTML, /17\/10\/2026/);
preorder.runtime.Kaggri.setQty("p3", 300);
assert.match(preorder.appElement.innerHTML, /Tồn hiện tại: 180 kg • Cho phép đặt theo sản lượng tương lai/);
preorder.runtime.Kaggri.submitCheckout();
assert.equal(preorder.location.hash, "#b10a", "Đặt trước phải tới NCC trước thanh toán");
assert.match(preorder.appElement.innerHTML, /Cần hàng 17\/10\/2026/);
assert.match(preorder.appElement.innerHTML, /Cam kết toàn bộ 420 kg/);
preorder.runtime.Kaggri.route("b05");
assert.equal(preorder.location.hash, "#b10a", "Đơn đặt trước chưa được NCC xác nhận không được thanh toán");
preorder.runtime.Kaggri.setVendorOrderStatus("v1", "ACCEPTED");
preorder.runtime.Kaggri.setVendorOrderStatus("v2", "REJECTED");
assert.equal(preorder.location.hash, "#b05", "Có VendorOrder đặt trước được chấp nhận phải tới B05");
assert.match(preorder.appElement.innerHTML, /10\.280\.000 ₫/, "B05 phải loại VendorOrder đặt trước bị từ chối");
assert.doesNotMatch(preorder.appElement.innerHTML, /17\.760\.000 ₫/, "B05 còn tính VendorOrder bị từ chối");
preorder.runtime.Kaggri.startPayment();
assert.equal(preorder.location.hash, "#b06");
preorder.runtime.Kaggri.simulatePayment("success");
assert.equal(preorder.location.hash, "#b09");
assert.match(preorder.appElement.innerHTML, /kế hoạch cung ứng cho ngày 17\/10\/2026/);
preorder.runtime.Kaggri.route("b10");
assert.equal(preorder.location.hash, "#b10");
assert.match(preorder.appElement.innerHTML, /Đơn đặt trước cần hàng 17\/10\/2026/);

console.log("Smoke test passed: standard prepaid, refund, COD, B2B credit and future preorder flows are valid.");
