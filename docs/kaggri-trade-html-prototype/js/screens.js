(() => {
  "use strict";

  const DATA = window.KAGGRI_DATA;
  const H = window.KaggriHelpers;
  const C = window.KaggriComponents;
  const logisticsEta = (state) => state.deliveryProfile.estimatedDelivery
    ? H.escapeHtml(state.deliveryProfile.estimatedDelivery)
    : "Đang chờ đối tác logistics xác nhận";
  const vendorOrderByVendorId = (state, vendorId) => state.vendorOrders.find(
    (vendorOrder) => vendorOrder.vendorId === vendorId
  );
  const acceptedVendorIds = (state) => state.vendorOrders
    .filter((vendorOrder) => vendorOrder.status === "ACCEPTED")
    .map((vendorOrder) => vendorOrder.vendorId);
  const itemsFromVendorOrders = (vendorOrders) => vendorOrders.flatMap(
    (vendorOrder) => vendorOrder.items.map((item) => ({ ...item }))
  );
  const paymentVendorIds = (state) => {
    const paymentVendorOrderIds = state.paymentAttempt.vendorOrderIds || [];
    if (paymentVendorOrderIds.length) {
      return state.vendorOrders
        .filter((vendorOrder) => paymentVendorOrderIds.includes(vendorOrder.id))
        .map((vendorOrder) => vendorOrder.vendorId);
    }

    return acceptedVendorIds(state);
  };
  const parentStatusText = (status) => ({
    AWAITING_PAYMENT: "Chờ chọn phương thức thanh toán",
    PAYMENT_PROCESSING: "Đang xử lý thanh toán",
    PENDING_SUPPLIER_CONFIRMATION: "Chờ nhà cung cấp xác nhận",
    PARTIALLY_CONFIRMED: "Đã xác nhận một phần",
    CONFIRMED: "Nhà cung cấp đã xác nhận",
    PARTIALLY_PAID: "Đã thanh toán một phần",
    PAID: "Đã thanh toán",
    REJECTED: "Tất cả VendorOrder bị từ chối"
  }[status] || status);
  const invoiceStatusText = (status) => ({
    PENDING_ORDER_CONFIRMATION: "Chờ nhà cung cấp xác nhận đơn",
    PENDING_PAYMENT: "Chờ thanh toán",
    REQUESTED: "Đã gửi yêu cầu xuất hóa đơn",
    ISSUED: "Đã phát hành",
    NOT_REQUESTED: "Không yêu cầu",
    NOT_APPLICABLE: "Không áp dụng"
  }[status] || status);
  const cartVendorCount = (state) => new Set(
    state.cart.map((item) => item.vendorId)
  ).size;

  const b02 = (state) => {
    const product = H.productById(state.cart, state.productDetail.id) || state.productDetail;
    const vendor = H.vendorById(product.vendorId);
    const activeTier = H.priceTierForQuantity(product);
    const productImages = product.images?.length
      ? product.images
      : [{ id: "main", icon: product.image, label: "Ảnh sản phẩm", alt: product.name }];
    const selectedImageIndex = Number.isInteger(state.selectedProductImage)
      ? Math.min(state.selectedProductImage, productImages.length - 1)
      : 0;
    const selectedImage = productImages[selectedImageIndex];

    return C.pageShell(`
      <div class="breadcrumb">Trang chủ / Nông sản đang bán / ${H.escapeHtml(product.name)}</div>

      <section class="product-intro">
        <div class="product-intro-copy">
          <span class="showcase-eyebrow">Nông sản từ Vendor · Hồ sơ đã xác minh</span>
          <h1>${H.escapeHtml(product.name)}</h1>
          <p>Cung ứng trực tiếp bởi ${H.escapeHtml(vendor.shortName)}.</p>
        </div>
        <div class="product-assurance" aria-label="Thông tin xác minh nhanh">
          <span><i>✓</i><b>${H.escapeHtml(vendor.certification.split(" /")[0])}</b><small>Đã xác minh</small></span>
          <span><i>⌖</i><b>${H.escapeHtml(vendor.location.split(",")[0])}</b><small>${H.escapeHtml(vendor.location.split(",").slice(1).join(",").trim())}</small></span>
          <span><i>▣</i><b>${productImages.length} ảnh</b><small>Do NCC cung cấp</small></span>
        </div>
      </section>

      <div class="product-layout">
        <div>
          <section class="product-gallery" aria-label="Thư viện ảnh sản phẩm">
            <div class="gallery-thumbnails" role="tablist" aria-label="Chọn ảnh sản phẩm">
              ${productImages.map((image, index) => `
                <button
                  type="button"
                  role="tab"
                  class="gallery-thumb ${index === selectedImageIndex ? "active" : ""}"
                  aria-selected="${index === selectedImageIndex}"
                  aria-label="${H.escapeHtml(image.label)}"
                  onclick="window.Kaggri.selectProductImage(${index})"
                >
                  <span>${image.src
                    ? `<img src="${H.escapeHtml(image.src)}" alt="" loading="lazy" style="object-position:${H.escapeHtml(image.position || "center")}" />`
                    : H.escapeHtml(image.icon || "▧")}</span>
                  <small>${H.escapeHtml(image.label)}</small>
                </button>
              `).join("")}
            </div>
            <div class="gallery-stage" role="tabpanel">
              <span class="gallery-count">${selectedImageIndex + 1} / ${productImages.length}</span>
              ${selectedImage.src
                ? `<img src="${H.escapeHtml(selectedImage.src)}" alt="${H.escapeHtml(selectedImage.alt)}" style="object-position:${H.escapeHtml(selectedImage.position || "center")}" />`
                : `<div class="gallery-placeholder" role="img" aria-label="${H.escapeHtml(selectedImage.alt)}">${H.escapeHtml(selectedImage.icon)}</div>`}
              <div class="gallery-caption">
                <strong>${H.escapeHtml(selectedImage.label)}</strong>
                <span>${H.escapeHtml(selectedImage.alt)}${selectedImage.credit ? `<small>Ảnh: ${H.escapeHtml(selectedImage.credit)}</small>` : ""}</span>
              </div>
            </div>
          </section>

          <div class="product-secondary-grid">
            <section class="card vendor-summary-card">
              <div class="vendor-profile">
                <div class="avatar">LD</div>
                <div>
                  <span class="compact-label">Nhà cung cấp</span>
                  <strong>${H.escapeHtml(vendor.name)}</strong>
                  <div class="muted">${H.escapeHtml(vendor.location)}</div>
                </div>
                <span class="chip chip-success">Đã xác minh</span>
              </div>
            </section>

            <details class="card product-meta-card">
              <summary>
                <span>
                  <strong>Thông tin sản phẩm & chứng nhận</strong>
                  <small>Quy cách, chứng nhận, hóa đơn và giao nhận</small>
                </span>
                <b>Xem chi tiết</b>
              </summary>
              <div class="spec-grid compact-spec-grid">
                ${product.quality.map(([key, value]) => `
                  <div><span>${H.escapeHtml(key)}</span><strong>${H.escapeHtml(value)}</strong></div>
                `).join("")}
                <div><span>Hóa đơn</span><strong>Có thể yêu cầu tại Checkout</strong></div>
                <div><span>Giao nhận</span><strong>Cước, ETA và tracking do đối tác logistics cung cấp</strong></div>
              </div>
            </details>
          </div>
        </div>

        <aside class="purchase-card">
          <div class="stock-tags">
            <span><small>Tồn khả dụng</small><strong>${product.available} ${H.escapeHtml(product.unit)}</strong></span>
            <span><small>Sản lượng đặt tối thiểu (MOQ)</small><strong>${product.minQty} ${H.escapeHtml(product.unit)}</strong></span>
          </div>

          <div class="section-title">Bảng giá sỉ</div>
          <table class="price-table">
            <tr><th>Mức số lượng</th><th>Đơn giá</th></tr>
            ${product.priceTiers.map((tier) => `
              <tr class="${activeTier === tier ? "active-row" : ""}">
                <td>${tier.maxQty === null ? `≥ ${H.money(tier.minQty).replace(" ₫", "")} kg` : `${tier.minQty}–${tier.maxQty} kg`}</td>
                <td>${H.money(tier.unitPrice)}</td>
              </tr>
            `).join("")}
          </table>

          <label for="b02-quantity">Số lượng đặt dự kiến</label>
          <div class="qty-control big">
            <button type="button" aria-label="Giảm số lượng" onclick="window.Kaggri.changeQty('${H.escapeHtml(product.id)}', -10)">−</button>
            <input id="b02-quantity" inputmode="decimal" value="${product.qty}" onchange="window.Kaggri.setQty('${H.escapeHtml(product.id)}', this.value)" />
            <button type="button" aria-label="Tăng số lượng" onclick="window.Kaggri.changeQty('${H.escapeHtml(product.id)}', 10)">+</button>
            <span>${H.escapeHtml(product.unit)}</span>
          </div>

          <div class="status-box success">✓ Đạt MOQ • Áp dụng bậc giá ${activeTier.maxQty === null ? `từ ${activeTier.minQty} kg` : `${activeTier.minQty}–${activeTier.maxQty} kg`}</div>

          <div class="mini-breakdown">
            <div><span>Số lượng</span><strong>${product.qty} kg</strong></div>
            <div><span>Đơn giá</span><strong>${H.money(product.unitPrice)}/kg</strong></div>
          </div>

          <div class="purchase-total">
            <span>Tạm tính tiền hàng</span>
            <strong>${H.money(product.qty * product.unitPrice)}</strong>
          </div>

          <p class="muted">Cước vận chuyển (nếu có) do đối tác logistics báo giá riêng.</p>

          <div class="actions">
            <button type="button" class="btn btn-outline" onclick="window.Kaggri.addToCart()">Thêm vào giỏ</button>
            <button type="button" class="btn btn-primary" onclick="window.Kaggri.buyNow()">Mua ngay</button>
          </div>
        </aside>
      </div>
    `);
  };

  const b04 = (state) => C.pageShell(`
    <div class="page-title-row compact">
      <div>
        <h1>Xác nhận đơn hàng</h1>
        <div class="muted">${cartVendorCount(state)} nhà cung cấp · ${state.cart.length} mặt hàng · ${state.orderMode === "PREORDER" ? "Kiểm tra thông tin trước khi gửi NCC cam kết sản lượng" : "Kiểm tra thông tin trước khi chọn phương thức thanh toán"}</div>
      </div>
      <button type="button" class="btn btn-light" onclick="window.Kaggri.refreshCart()">↻ Làm mới tồn kho</button>
    </div>

    ${C.progress(0, state.orderMode)}

    <div class="two-col checkout">
      <div>
        <section class="card order-mode-card">
          <div class="section-title">Hình thức đặt hàng</div>
          <div class="order-mode-options">
            <label class="payment-option ${state.orderMode === "STANDARD" ? "selected" : ""}">
              <input type="radio" name="orderMode" value="STANDARD" ${state.orderMode === "STANDARD" ? "checked" : ""} onchange="window.Kaggri.setOrderMode('STANDARD')">
              <div><strong>Mua theo tồn hiện tại</strong><span>Số lượng không vượt tồn khả dụng; thanh toán trước khi NCC xác nhận.</span></div>
              <span class="chip chip-success">Giao gần nhất</span>
            </label>
            <label class="payment-option ${state.orderMode === "PREORDER" ? "selected" : ""}">
              <input type="radio" name="orderMode" value="PREORDER" ${state.orderMode === "PREORDER" ? "checked" : ""} onchange="window.Kaggri.setOrderMode('PREORDER')">
              <div><strong>Đặt trước theo kế hoạch</strong><span>NCC xác nhận khả năng cung ứng toàn bộ trước khi Buyer thanh toán.</span></div>
              <span class="chip chip-warn">Tồn tương lai</span>
            </label>
          </div>
          ${state.orderMode === "PREORDER" ? `
            <div class="preorder-fields">
              <label class="field">
                <span>Ngày cần hàng dự kiến</span>
                <input type="date" min="${H.escapeHtml(DATA.order.minPreorderDate)}" value="${H.escapeHtml(state.preorderDate)}" onchange="window.Kaggri.setPreorderDate(this.value)" />
                <small>Tối thiểu ${DATA.order.preorderLeadDaysMin} ngày từ ngày đặt. Đây là nhu cầu của Buyer, không phải ETA của đối tác logistics.</small>
              </label>
              <div class="status-box warn">Tồn hiện tại chỉ để tham khảo. NCC phải accept/reject toàn bộ VendorOrder và cam kết đủ sản lượng cho ngày ${H.formatDateOnly(state.preorderDate)}.</div>
            </div>
          ` : ""}
        </section>

        <section class="card">
          <div class="section-title row-between">
            <span>Địa chỉ nhận hàng</span>
            <button type="button" class="link-btn" onclick="location.hash='b04-delivery'">Thay đổi địa chỉ</button>
          </div>
          <div class="info-grid">
            <div class="span-2">
              <span>Người nhận</span>
              <strong>${H.escapeHtml(state.deliveryProfile.recipientName)} · ${H.escapeHtml(state.deliveryProfile.recipientPhone)}</strong>
              <small>${H.escapeHtml(state.deliveryProfile.receivingAddress)}</small>
            </div>
            <div>
              <span>Khung giờ có thể nhận hàng</span>
              <strong>${H.escapeHtml(state.deliveryProfile.receivingWindow)}</strong>
            </div>
            <div>
              <span>Thời gian giao dự kiến</span>
              <strong>${logisticsEta(state)}</strong>
            </div>
            <div>
              <span>Ghi chú giao nhận</span>
              <strong>${H.escapeHtml(state.deliveryProfile.deliveryNote)}</strong>
            </div>
          </div>
        </section>

        <section class="card invoice-compact">
          <div>
            <div class="section-title">Thông tin xuất hóa đơn</div>
            <strong>${H.escapeHtml(state.invoiceProfile.companyName)}</strong>
            <div class="muted">MST ${H.escapeHtml(state.invoiceProfile.taxCode)} • Hóa đơn VAT cho đơn vị mua</div>
          </div>
          <button type="button" class="btn btn-light" onclick="location.hash='b04-invoice'">Chỉnh sửa</button>
        </section>

        <div class="section-heading">Sản phẩm theo nhà cung cấp</div>
        ${C.vendorGroup(state, "v1")}
        ${C.vendorGroup(state, "v2")}
      </div>

      ${C.summaryCard(state, `
        <button type="button" class="btn btn-primary full" onclick="window.Kaggri.submitCheckout()">${state.orderMode === "PREORDER" ? "Gửi yêu cầu NCC xác nhận" : "Tiếp tục chọn thanh toán →"}</button>
        <button type="button" class="link-btn center full" onclick="location.hash='b02'">← Tiếp tục xem sản phẩm</button>
      `)}
    </div>
  `, { noFooter: true });

  const b04Invoice = (state) => C.pageShell(`
    <div class="page-title-row compact">
      <div>
        <h1>Chỉnh sửa thông tin xuất hóa đơn VAT</h1>
        <div class="muted">Nhập thông tin pháp lý của đơn vị mua sẽ nhận hóa đơn.</div>
      </div>
    </div>

    ${C.progress(0, state.orderMode)}

    <section class="card invoice-edit-card">
      <form onsubmit="event.preventDefault(); window.Kaggri.saveInvoiceProfile(this)">
        <div class="section-title">Thông tin đơn vị mua</div>
        <p class="muted">Các trường có dấu * là bắt buộc. Mã số thuế chấp nhận định dạng 10 số hoặc 10 số kèm mã chi nhánh.</p>

        <div class="form-grid">
          <label class="field span-2">
            <span>Tên đơn vị mua *</span>
            <input
              name="companyName"
              type="text"
              maxlength="200"
              autocomplete="organization"
              required
              value="${H.escapeHtml(state.invoiceProfile.companyName)}"
            />
          </label>

          <label class="field">
            <span>Mã số thuế *</span>
            <input
              name="taxCode"
              type="text"
              inputmode="numeric"
              pattern="[0-9]{10}(-[0-9]{3})?"
              maxlength="14"
              required
              value="${H.escapeHtml(state.invoiceProfile.taxCode)}"
            />
            <small>Ví dụ: 0312345678 hoặc 0312345678-001</small>
          </label>

          <label class="field">
            <span>Email nhận hóa đơn *</span>
            <input
              name="invoiceEmail"
              type="email"
              maxlength="150"
              autocomplete="email"
              required
              value="${H.escapeHtml(state.invoiceProfile.invoiceEmail)}"
            />
          </label>

          <label class="field span-2">
            <span>Địa chỉ xuất hóa đơn *</span>
            <textarea name="billingAddress" maxlength="300" rows="3" required>${H.escapeHtml(state.invoiceProfile.billingAddress)}</textarea>
          </label>
        </div>

        <div class="status-box warn">
          Thông tin này được lưu trong snapshot của Parent Order và dùng để xuất hóa đơn cho các VendorOrder được nhà cung cấp xác nhận.
        </div>

        <div class="actions">
          <button type="submit" class="btn btn-primary">Lưu thông tin</button>
          <button type="button" class="btn btn-light" onclick="location.hash='b04'">Hủy</button>
        </div>
      </form>
    </section>
  `, { noFooter: true });

  const b04Delivery = (state) => C.pageShell(`
    <div class="page-title-row compact">
      <div>
        <h1>Chỉnh sửa địa chỉ nhận hàng</h1>
        <div class="muted">Nhập người nhận và địa chỉ giao hàng của Buyer. ETA thực tế chỉ được cập nhật khi đối tác logistics xác nhận.</div>
      </div>
    </div>

    ${C.progress(0, state.orderMode)}

    <section class="card invoice-edit-card">
      <form onsubmit="event.preventDefault(); window.Kaggri.saveDeliveryProfile(this)">
        <div class="form-grid">
          <label class="field">
            <span>Tên người nhận *</span>
            <input name="recipientName" type="text" maxlength="100" required value="${H.escapeHtml(state.deliveryProfile.recipientName)}" />
          </label>
          <label class="field">
            <span>Số điện thoại *</span>
            <input name="recipientPhone" type="tel" maxlength="20" required value="${H.escapeHtml(state.deliveryProfile.recipientPhone)}" />
          </label>
          <label class="field span-2">
            <span>Địa chỉ nhận hàng *</span>
            <textarea name="receivingAddress" maxlength="300" rows="3" required>${H.escapeHtml(state.deliveryProfile.receivingAddress)}</textarea>
          </label>
          <label class="field">
            <span>Khung giờ có thể nhận hàng *</span>
            <input name="receivingWindow" type="text" maxlength="100" required value="${H.escapeHtml(state.deliveryProfile.receivingWindow)}" />
          </label>
          <label class="field">
            <span>Ghi chú giao nhận</span>
            <input name="deliveryNote" type="text" maxlength="300" value="${H.escapeHtml(state.deliveryProfile.deliveryNote)}" />
          </label>
        </div>
        <div class="status-box warn">Không nhập ngày giao hoặc ETA tại đây. Thời gian giao dự kiến sẽ được cập nhật từ đối tác logistics.</div>
        <div class="actions">
          <button type="submit" class="btn btn-primary">Lưu địa chỉ nhận hàng</button>
          <button type="button" class="btn btn-light" onclick="location.hash='b04'">Hủy</button>
        </div>
      </form>
    </section>
  `, { noFooter: true });

  const b05 = (state) => {
    const preorder = state.parentOrder.orderMode === "PREORDER";
    const vendorOrdersForPayment = preorder
      ? state.vendorOrders.filter((vendorOrder) => vendorOrder.status === "ACCEPTED")
      : state.vendorOrders;
    const vendorIds = vendorOrdersForPayment.map((vendorOrder) => vendorOrder.vendorId);
    const items = itemsFromVendorOrders(vendorOrdersForPayment);
    const selectedMethod = H.paymentMethodById(state.selectedPayment);
    const isPrepaid = selectedMethod?.settlementType === "PREPAID";
    const actionLabel = isPrepaid
      ? "Thanh toán"
      : selectedMethod?.settlementType === "COD"
        ? "Xác nhận COD & gửi NCC"
        : "Xác nhận công nợ & gửi NCC";

    return C.pageShell(`
      <div class="page-title-row compact">
        <div>
          <h1>Chọn phương thức thanh toán</h1>
          <div class="muted">Đơn mua ${H.escapeHtml(DATA.order.id)} • ${vendorIds.length} nhà cung cấp • ${items.length} mặt hàng${preorder ? ` • Cần hàng ${H.formatDateOnly(state.parentOrder.preorderDate)}` : ""}</div>
        </div>
      </div>

      ${C.progress(preorder ? 2 : 1, state.parentOrder.orderMode)}

      <div class="payment-layout">
        <section class="card">
          <div class="section-title">Phương thức khả dụng</div>
          <p class="muted">${preorder ? "Các VendorOrder bên dưới đã được NCC cam kết toàn bộ sản lượng. Chỉ phần được chấp nhận mới được thanh toán." : "Chọn cách thanh toán trước khi đơn được gửi tới nhà cung cấp xác nhận."}</p>

          <div class="status-box success">
            ${preorder
              ? `${vendorIds.length} VendorOrder đã được NCC xác nhận cho ngày ${H.formatDateOnly(state.parentOrder.preorderDate)}.`
              : "Phương thức trả trước phải hoàn tất trước khi NCC nhận yêu cầu xác nhận. COD và công nợ chỉ ghi nhận nghĩa vụ trả sau, không chạy cổng thanh toán online."}
          </div>

          <div class="payment-methods">
            ${DATA.paymentMethods.map((method) => `
              <label class="payment-option ${state.selectedPayment === method.id ? "selected" : ""} ${method.eligible ? "" : "disabled"}">
                <input type="radio" name="payment" value="${method.id}" ${state.selectedPayment === method.id ? "checked" : ""} ${method.eligible ? "" : "disabled"}
                  onchange="window.Kaggri.selectPayment('${method.id}')">
                <div>
                  <strong>${H.escapeHtml(method.title)}</strong>
                  <span>${H.escapeHtml(method.description)}</span>
                </div>
                <span class="chip ${method.settlementType === "PREPAID" ? "chip-success" : "chip-warn"}">${H.escapeHtml(method.status)}</span>
              </label>
            `).join("")}
          </div>

          ${isPrepaid ? `
            <div class="status-box warn">
              Payment session giữ hàng trong ${DATA.order.reservationMinutes} phút. Giao dịch FAILED/CANCELLED/EXPIRED sẽ giải phóng lượng giữ chỗ.
            </div>
          ` : selectedMethod?.settlementType === "COD" ? `
            <div class="status-box warn">
              COD: chỉ thu giá trị các VendorOrder được NCC xác nhận, tại thời điểm giao hàng. VendorOrder bị từ chối không phát sinh khoản thu.
            </div>
          ` : `
            <div class="status-box warn">
              Công nợ NET ${DATA.buyer.creditProfile.termDays}: hạn mức ${H.money(DATA.buyer.creditProfile.limit)}, đã sử dụng ${H.money(DATA.buyer.creditProfile.used)}, còn lại ${H.money(DATA.buyer.creditProfile.available)}. Hạn thanh toán tính từ ngày phát hành hóa đơn.
            </div>
          `}
        </section>

        ${C.summaryCard(state, `
          <button type="button" class="btn btn-primary full" onclick="window.Kaggri.startPayment()">${actionLabel}</button>
          <button type="button" class="link-btn center full" onclick="location.hash='b04'">← Quay lại Checkout</button>
        `, { vendorIds, items, title: isPrepaid ? "Giá trị thanh toán" : "Giá trị dự kiến trả sau" })}
      </div>
    `, { noFooter: true });
  };

  const b06 = (state) => C.pageShell(`
    <div class="simple-breadcrumb">Đơn mua / <strong>${H.escapeHtml(DATA.order.id)}</strong></div>

    ${C.progress(state.parentOrder.orderMode === "PREORDER" ? 2 : 1, state.parentOrder.orderMode)}

    <section class="status-hero pending">
      <div class="status-icon">⌛</div>
      <div>
        <h1>Đang xử lý thanh toán</h1>
        <p>Đối tác thanh toán đang xác nhận giao dịch ${H.escapeHtml(state.paymentAttempt.paymentReference)}.</p>
      </div>
      <div class="countdown-box">
        <span>Giữ hàng còn</span>
        <strong id="reservation-countdown">${H.formatTime(state.reservationRemaining)}</strong>
      </div>
    </section>

    <div class="two-col">
      <section class="card">
        <div class="section-title">Chi tiết giao dịch</div>
        <div class="spec-grid">
          <div><span>Mã thanh toán</span><strong>${H.escapeHtml(state.paymentAttempt.paymentReference)}</strong></div>
          <div><span>Số tiền</span><strong>${H.money(state.paymentAttempt.amount)}</strong></div>
          <div><span>Phương thức</span><strong>${H.escapeHtml(H.paymentMethodById(state.paymentAttempt.paymentMethod)?.title || "")}</strong></div>
          <div><span>Trạng thái</span><strong>Đang xác nhận</strong></div>
        </div>

        <div class="simulate-panel">
          <span>Prototype controls</span>
          <button type="button" onclick="window.Kaggri.simulatePayment('success')">Mô phỏng thành công</button>
          <select aria-label="Failure category mô phỏng" onchange="window.Kaggri.selectFailureCategory(this.value)">
            ${H.paymentFailureCategories.map((category) => `
              <option value="${category}" ${state.selectedFailureCategory === category ? "selected" : ""}>
                ${category} — ${H.paymentFailurePresentation(category).title}
              </option>
            `).join("")}
          </select>
          <button type="button" onclick="window.Kaggri.simulatePaymentFailure()">Mô phỏng thất bại</button>
          <button type="button" onclick="window.Kaggri.simulatePayment('expired')">Mô phỏng hết hạn</button>
        </div>
      </section>

      ${C.summaryCard(state, "", {
        vendorIds: paymentVendorIds(state),
        items: state.paymentAttempt.lineItems,
        title: "Giá trị đang thanh toán"
      })}
    </div>
  `, { noFooter: true });

  const b07 = (state) => {
    const payment = state.paymentAttempt;
    const reason = H.paymentFailurePresentation(
      payment.failureCategory,
      payment.retryable
    );
    const method = H.paymentMethodById(payment.paymentMethod);

    return C.pageShell(`
      ${C.progress(state.parentOrder.orderMode === "PREORDER" ? 2 : 1, state.parentOrder.orderMode)}
      <section class="status-hero danger payment-failure-hero">
        <div class="status-icon">×</div>
        <div>
          <h1>Thanh toán không thành công</h1>
          <p>Đối tác thanh toán đã trả về trạng thái không thành công cho giao dịch này.</p>
        </div>
        <div class="failure-amount">
          <span>Số tiền</span>
          <strong>${H.money(payment.amount)}</strong>
        </div>
      </section>

      <div class="two-col payment-failure-layout">
        <div>
          <section class="card failure-reason-card">
            <div class="section-title">Lý do</div>
            <h2>${H.escapeHtml(reason.title)}</h2>
            <p>${H.escapeHtml(reason.description)}</p>
            <div class="normalized-status-note">
              Trạng thái được chuẩn hóa từ phản hồi của đối tác thanh toán.
            </div>
          </section>

          <section class="card">
            <div class="section-title">Chi tiết giao dịch</div>
            <div class="info-grid">
              <div>
                <span>Payment reference</span>
                <strong>${H.escapeHtml(payment.paymentReference)}</strong>
              </div>
              <div>
                <span>Phương thức thanh toán</span>
                <strong>${H.escapeHtml(method?.title || payment.paymentMethod)}</strong>
              </div>
              <div>
                <span>Thời điểm thất bại</span>
                <strong>${H.escapeHtml(H.formatDateTime(payment.failedAt))}</strong>
              </div>
              <div>
                <span>Trạng thái</span>
                <strong>Không thành công</strong>
              </div>
            </div>
          </section>

          <div class="status-box warn reservation-release">
            <strong>Lượng giữ chỗ đã được giải phóng.</strong>
          </div>
        </div>

        <aside class="summary-card failure-actions">
          <div class="summary-title">Hành động tiếp theo</div>
          <p class="muted">Bạn có thể thử lại khi phù hợp hoặc chọn một phương thức thanh toán khác.</p>
          ${payment.retryable ? `
            <button type="button" class="btn btn-primary full" onclick="window.Kaggri.retryPayment()">${H.escapeHtml(reason.cta)}</button>
          ` : ""}
          <button type="button" class="btn btn-outline full" onclick="location.hash='b05'">Chọn phương thức khác</button>
          <button type="button" class="btn btn-light full" onclick="location.hash='b04'">Xem đơn mua</button>
        </aside>
      </div>
    `, { noFooter: true });
  };

  const expiredScreen = (state) => C.pageShell(`
    ${C.progress(state.parentOrder.orderMode === "PREORDER" ? 2 : 1, state.parentOrder.orderMode)}
    <section class="status-hero warn">
      <div class="status-icon">⌛</div>
      <div>
        <h1>Phiên thanh toán đã hết hiệu lực</h1>
        <p>Thời hạn giữ hàng của phiên thanh toán đã kết thúc. Bạn có thể tạo phiên thanh toán mới.</p>
      </div>
    </section>

    <section class="card center-card">
      <div class="section-title">Đơn mua ${H.escapeHtml(DATA.order.id)}</div>
      <div class="grand-total standalone">${H.money(state.paymentAttempt.amount)}</div>
      <div class="actions center">
        <button type="button" class="btn btn-primary" onclick="location.hash='b05'">Thử thanh toán lại</button>
        <button type="button" class="btn btn-light" onclick="location.hash='b04'">Xem đơn mua</button>
      </div>
    </section>
  `, { noFooter: true });

  const b09 = (state) => {
    const vendorIds = paymentVendorIds(state);
    const preorder = state.parentOrder.orderMode === "PREORDER";

    return C.pageShell(`
      ${C.progress(preorder ? 3 : 2, state.parentOrder.orderMode)}

      <section class="status-hero success">
        <div class="status-icon">✓</div>
        <div>
          <h1>Thanh toán thành công</h1>
          <p>${preorder
            ? `Đối tác thanh toán đã xác nhận ${H.money(state.paymentAttempt.amount)}. Các VendorOrder đã được NCC cam kết đang chuyển sang kế hoạch cung ứng cho ngày ${H.formatDateOnly(state.parentOrder.preorderDate)}.`
            : `Đối tác thanh toán đã xác nhận ${H.money(state.paymentAttempt.amount)}. Đơn mua đang được gửi tới các nhà cung cấp để xác nhận toàn bộ VendorOrder.`}</p>
        </div>
      </section>

      <div class="status-line success">
        ${preorder ? "✓ NCC đã cam kết • Thanh toán thành công • Đã lên kế hoạch cung ứng" : "✓ Đã thanh toán • Đang chờ nhà cung cấp xác nhận"}
      </div>

      <div class="two-col">
        <section class="card">
          <div class="section-title">${preorder ? "VendorOrder đã thanh toán" : "VendorOrder đang chờ nhà cung cấp xác nhận"}</div>
          ${DATA.vendors.filter((vendor) => vendorIds.includes(vendor.id)).map((vendor) => {
            const vendorOrder = vendorOrderByVendorId(state, vendor.id);
            return `
              <div class="vendor-order-row">
                <div>
                  <strong>${H.escapeHtml(vendor.shortName)}</strong>
                  <span>${vendorOrder.items.length} mặt hàng</span>
                </div>
                <span class="chip ${C.statusChip(vendorOrder.status)}">${H.escapeHtml(C.statusText(vendorOrder.status))}</span>
                <strong>${H.money(vendorOrder.amount)}</strong>
              </div>
            `;
          }).join("")}
        </section>

        ${C.summaryCard(state, `
          <button type="button" class="btn btn-primary full" onclick="location.hash='${preorder ? "b10" : "b10a"}'">${preorder ? "Xem kế hoạch đơn đặt trước" : "Theo dõi NCC xác nhận"}</button>
        `, { vendorIds, items: state.paymentAttempt.lineItems, title: "Giá trị đã thanh toán" })}
      </div>
    `, { noFooter: true });
  };

  const b10a = (state) => {
    const preorder = state.parentOrder.orderMode === "PREORDER";
    const vendorIds = state.vendorOrders.map((vendorOrder) => vendorOrder.vendorId);
    const payableItems = itemsFromVendorOrders(state.vendorOrders);
    const allRejected = state.vendorOrders.every(
      (vendorOrder) => vendorOrder.status === "REJECTED"
    );
    const pendingCount = state.vendorOrders.filter(
      (vendorOrder) => vendorOrder.status === "PENDING_CONFIRMATION"
    ).length;
    const headerStatus = allRejected
      ? "Tất cả nhà cung cấp đã từ chối"
      : pendingCount
        ? `Đang chờ ${pendingCount} nhà cung cấp xác nhận`
        : "Đã nhận đủ phản hồi từ nhà cung cấp";
    const method = H.paymentMethodById(state.parentOrder.paymentMethod);
    const settlementNotice = preorder && state.parentOrder.paymentStatus === "UNPAID"
      ? `<div class="status-box warn">Chưa thanh toán. Sau khi tất cả NCC phản hồi, Buyer chỉ thanh toán các VendorOrder được chấp nhận.</div>`
      : state.parentOrder.settlementType === "PREPAID"
      ? `<div class="status-box success">Đã thanh toán trước ${H.money(state.parentOrder.amountPaid)}. Nếu NCC từ chối, phần tiền tương ứng sẽ chuyển sang chờ hoàn.</div>`
      : state.parentOrder.settlementType === "COD"
        ? `<div class="status-box warn">COD: chưa thu tiền. Chỉ thu giá trị VendorOrder được NCC xác nhận khi giao hàng.</div>`
        : `<div class="status-box warn">Công nợ NET ${DATA.buyer.creditProfile.termDays}: chỉ ghi nhận khoản phải trả cho VendorOrder được NCC xác nhận.</div>`;

    const vendorOrderCards = state.vendorOrders.map((vendorOrder) => {
      const vendor = H.vendorById(vendorOrder.vendorId);
      return `
        <div class="vendor-order-card expanded">
          <div>
            <strong>${H.escapeHtml(vendor.shortName)}</strong>
            <span>${H.escapeHtml(vendorOrder.id)} • ${vendorOrder.items.length} mặt hàng • ${H.escapeHtml(vendor.location)}</span>
            ${vendorOrder.supplyCommitment ? `<span>Ngày cần hàng ${H.formatDateOnly(vendorOrder.supplyCommitment.requestedDate)} • Cam kết toàn bộ ${vendorOrder.items.reduce((sum, item) => sum + item.qty, 0)} kg</span>` : ""}
            ${vendorOrder.rejectionReason ? `<span class="rejection-reason">${H.escapeHtml(vendorOrder.rejectionReason)}</span>` : ""}
          </div>
          <span class="chip ${C.statusChip(vendorOrder.status)}">${H.escapeHtml(C.statusText(vendorOrder.status))}</span>
          <strong>${H.money(vendorOrder.amount)}</strong>
        </div>
      `;
    }).join("");
    const tabContent = {
      overview: `<div class="card"><div class="section-title">VendorOrder theo nhà cung cấp</div>${vendorOrderCards}</div>`,
      vendors: `<div class="card"><div class="section-title">Chi tiết VendorOrder</div>${vendorOrderCards}</div>`,
      payment: `<div class="card"><div class="section-title">${preorder ? "Điều kiện thanh toán" : "Phương thức đã chọn"}</div><div class="spec-grid one"><div><span>Phương thức</span><strong>${preorder && !method ? "Chọn sau khi NCC xác nhận" : H.escapeHtml(method?.title || "—")}</strong></div><div><span>Trạng thái</span><strong>${preorder && state.parentOrder.paymentStatus === "UNPAID" ? "Chưa thanh toán" : state.parentOrder.settlementType === "PREPAID" ? "Đã thanh toán" : state.parentOrder.settlementType === "COD" ? "Thu khi giao hàng" : `Công nợ NET ${DATA.buyer.creditProfile.termDays}`}</strong></div></div>${settlementNotice}</div>`,
      delivery: `<div class="card"><div class="section-title">Địa chỉ nhận hàng đã chụp tại Checkout</div><div class="spec-grid one"><div><span>Người nhận</span><strong>${H.escapeHtml(state.parentOrder.delivery.recipientName)} · ${H.escapeHtml(state.parentOrder.delivery.recipientPhone)}</strong></div><div><span>Địa chỉ nhận hàng</span><strong>${H.escapeHtml(state.parentOrder.delivery.receivingAddress)}</strong></div><div><span>Khung giờ có thể nhận hàng</span><strong>${H.escapeHtml(state.parentOrder.delivery.receivingWindow)}</strong></div><div><span>ETA</span><strong>${logisticsEta(state)}</strong></div></div></div>`,
      invoice: `<div class="card"><div class="section-title">Yêu cầu hóa đơn VAT</div><div class="spec-grid one"><div><span>Đơn vị mua</span><strong>${H.escapeHtml(state.parentOrder.invoice.buyer.companyName)}</strong></div><div><span>Mã số thuế</span><strong>${H.escapeHtml(state.parentOrder.invoice.buyer.taxCode)}</strong></div><div><span>Trạng thái</span><strong>Chờ nhà cung cấp xác nhận VendorOrder</strong></div></div></div>`
    }[state.orderTab] || "";

    return C.pageShell(`
      <div class="page-title-row compact">
        <div>
          <h1>${preorder ? "Chờ NCC xác nhận đơn đặt trước" : "Chờ nhà cung cấp xác nhận"}</h1>
          <div class="muted">Parent Order ${H.escapeHtml(state.parentOrder.id)} • ${H.escapeHtml(state.parentOrder.createdAt)}${preorder ? ` • Cần hàng ${H.formatDateOnly(state.parentOrder.preorderDate)}` : ""}</div>
        </div>
        <span class="chip ${allRejected ? "chip-danger" : pendingCount ? "chip-warn" : "chip-success"}">${headerStatus}</span>
      </div>

      ${C.progress(preorder ? 1 : 2, state.parentOrder.orderMode)}

      <div class="order-tabs">
        <button type="button" class="${state.orderTab === "overview" ? "active" : ""}" onclick="window.Kaggri.selectOrderTab('overview')">Tổng quan</button>
        <button type="button" class="${state.orderTab === "vendors" ? "active" : ""}" onclick="window.Kaggri.selectOrderTab('vendors')">Đơn theo NCC</button>
        <button type="button" class="${state.orderTab === "payment" ? "active" : ""}" onclick="window.Kaggri.selectOrderTab('payment')">Thanh toán</button>
        <button type="button" class="${state.orderTab === "delivery" ? "active" : ""}" onclick="window.Kaggri.selectOrderTab('delivery')">Giao nhận</button>
        <button type="button" class="${state.orderTab === "invoice" ? "active" : ""}" onclick="window.Kaggri.selectOrderTab('invoice')">Hóa đơn</button>
      </div>

      <div class="two-col">
        <section>
          ${tabContent}

          <div class="card">
            <div class="section-title">Prototype controls — xác nhận toàn bộ VendorOrder</div>
            <p class="muted">Mỗi thao tác Accept/Reject áp dụng cho toàn bộ VendorOrder, không áp dụng theo từng line item.</p>
            <div class="simulate-panel clean">
              ${state.vendorOrders.map((vendorOrder) => {
                const vendor = H.vendorById(vendorOrder.vendorId);
                return `<button type="button" ${vendorOrder.status === "PENDING_CONFIRMATION" ? "" : "disabled"} onclick="window.Kaggri.setVendorOrderStatus('${vendor.id}','ACCEPTED')">${H.escapeHtml(vendor.shortName)}: Accept</button>
                  <button type="button" ${vendorOrder.status === "PENDING_CONFIRMATION" ? "" : "disabled"} onclick="window.Kaggri.setVendorOrderStatus('${vendor.id}','REJECTED')">${H.escapeHtml(vendor.shortName)}: Reject</button>`;
              }).join("")}
            </div>
          </div>
        </section>

        ${C.summaryCard(state, settlementNotice, {
          vendorIds,
          items: payableItems,
          title: preorder ? "Giá trị chờ NCC cam kết" : "Giá trị đang chờ NCC xác nhận"
        })}
      </div>
    `, { noFooter: true });
  };

  const b10 = (state) => {
    const preorder = state.parentOrder.orderMode === "PREORDER";
    const statuses = state.vendorOrders.map((vendorOrder) => vendorOrder.status);
    const statusCounts = statuses.reduce((counts, status) => ({
      ...counts,
      [status]: (counts[status] || 0) + 1
    }), {});
    const anyRejected = Boolean(statusCounts.REJECTED);
    const allRejected = state.vendorOrders.every(
      (vendorOrder) => vendorOrder.status === "REJECTED"
    );
    const anyPreparing = state.vendorOrders.some(
      (vendorOrder) => vendorOrder.fulfilmentStatus === "PREPARING"
    );
    const anyScheduled = state.vendorOrders.some(
      (vendorOrder) => ["COMMITTED", "SCHEDULED"].includes(vendorOrder.fulfilmentStatus)
    );
    const anyShipped = state.vendorOrders.some(
      (vendorOrder) => vendorOrder.fulfilmentStatus === "SHIPPED"
    );
    const summary = [
      preorder && state.vendorOrders.filter((vendorOrder) => vendorOrder.fulfilmentStatus === "SCHEDULED").length
        && `${state.vendorOrders.filter((vendorOrder) => vendorOrder.fulfilmentStatus === "SCHEDULED").length} NCC đã lên kế hoạch`,
      state.vendorOrders.filter((vendorOrder) => vendorOrder.fulfilmentStatus === "PREPARING").length
        && `${state.vendorOrders.filter((vendorOrder) => vendorOrder.fulfilmentStatus === "PREPARING").length} NCC đang chuẩn bị`,
      statusCounts.PENDING_CONFIRMATION && `${statusCounts.PENDING_CONFIRMATION} NCC chờ xác nhận`,
      statusCounts.ACCEPTED && `${statusCounts.ACCEPTED} NCC đã xác nhận`,
      statusCounts.REJECTED && `${statusCounts.REJECTED} NCC đã từ chối`,
      statusCounts.SHIPPED && `${statusCounts.SHIPPED} NCC đang vận chuyển`
    ].filter(Boolean).join(" · ");
    const vendorDetails = `
      <section class="card span-2">
        <div class="section-title">VendorOrder theo nhà cung cấp</div>
        ${state.vendorOrders.map((vendorOrder) => {
          const vendor = H.vendorById(vendorOrder.vendorId);
          return `
            <div class="vendor-detail-card">
              <div class="row-between">
                <div>
                  <strong>${H.escapeHtml(vendor.shortName)}</strong>
                  <div class="muted">${H.escapeHtml(vendorOrder.id)} • ${H.escapeHtml(vendor.location)}</div>
                </div>
                <span class="chip ${C.statusChip(vendorOrder.status)}">${H.escapeHtml(C.statusText(vendorOrder.status))}</span>
              </div>
              ${vendorOrder.fulfilmentStatus === "PREPARING" ? `<div class="status-box success">Nhà cung cấp đã nhận đơn và đang chuẩn bị hàng.</div>` : ""}
              ${vendorOrder.fulfilmentStatus === "SCHEDULED" ? `<div class="status-box success">NCC đã cam kết đủ ${vendorOrder.items.reduce((sum, item) => sum + item.qty, 0)} kg và lên kế hoạch cung ứng cho ngày ${H.formatDateOnly(state.parentOrder.preorderDate)}.</div>` : ""}
              ${vendorOrder.refundStatus === "PENDING" ? `<div class="status-box warn">Đang chờ hoàn ${H.money(vendorOrder.refundAmount)} do VendorOrder bị từ chối.</div>` : ""}
              ${vendorOrder.items.map((product) => `
                <div class="order-line">
                  <span>${H.escapeHtml(product.image)} ${H.escapeHtml(product.name)}</span>
                  <span>${product.qty} ${H.escapeHtml(product.unit)}</span>
                  <span>${H.money(product.unitPrice)}/${H.escapeHtml(product.unit)}</span>
                  <strong>${H.money(product.amount)}</strong>
                </div>
              `).join("")}
              ${vendorOrder.rejectionReason ? `<div class="status-box warn">${H.escapeHtml(vendorOrder.rejectionReason)}</div>` : ""}
              <div class="vendor-total compact-total"><span>Giá trị VendorOrder</span><strong>${H.money(vendorOrder.amount)}</strong></div>
            </div>
          `;
        }).join("")}
      </section>
    `;
    const successfulAttempts = state.paymentAttempts.filter(
      (attempt) => attempt.paymentStatus === "success"
    );
    const paidTotal = successfulAttempts.reduce((sum, attempt) => sum + attempt.amount, 0);
    const acceptedTotal = state.vendorOrders
      .filter((vendorOrder) => vendorOrder.status === "ACCEPTED")
      .reduce((sum, vendorOrder) => sum + vendorOrder.amount, 0);
    const method = H.paymentMethodById(state.parentOrder.paymentMethod);
    const settlementSummary = preorder && allRejected
      ? `<div class="status-box warn">Tất cả VendorOrder bị từ chối. Không phát sinh thanh toán.</div>`
      : state.parentOrder.settlementType === "PREPAID"
      ? `<div class="grand-total"><span>TỔNG ĐÃ THANH TOÁN</span><strong>${H.money(paidTotal)}</strong></div>
        ${state.parentOrder.refundAmount ? `<div class="summary-row"><span>Chờ hoàn do NCC từ chối</span><strong>${H.money(state.parentOrder.refundAmount)}</strong></div>` : ""}`
      : state.parentOrder.settlementType === "COD"
        ? `<div class="grand-total"><span>THU KHI GIAO HÀNG</span><strong>${H.money(acceptedTotal)}</strong></div><div class="status-box warn">Chưa thu tiền. Thu theo từng VendorOrder được giao thành công.</div>`
        : `<div class="grand-total"><span>CÔNG NỢ DỰ KIẾN</span><strong>${H.money(acceptedTotal)}</strong></div><div class="status-box warn">NET ${DATA.buyer.creditProfile.termDays} từ ngày phát hành hóa đơn. Hạn mức còn lại ${H.money(DATA.buyer.creditProfile.available)}.</div>`;
    const paymentDetails = `
      <section class="card">
        <div class="section-title">Thanh toán & đối soát</div>
        <div class="summary-row"><span>Phương thức</span><strong>${H.escapeHtml(method?.title || "—")}</strong></div>
        ${state.paymentAttempts.length ? state.paymentAttempts.map((attempt) => `
          <div class="vendor-detail-card">
            <div class="row-between"><strong>${H.escapeHtml(attempt.paymentReference)}</strong><span class="chip ${attempt.paymentStatus === "success" ? "chip-success" : "chip-warn"}">${H.escapeHtml(attempt.paymentStatus.toUpperCase())}</span></div>
            <div class="summary-row"><span>Phương thức</span><strong>${H.escapeHtml(H.paymentMethodById(attempt.paymentMethod)?.title || attempt.paymentMethod)}</strong></div>
            <div class="summary-row"><span>Số tiền</span><strong>${H.money(attempt.amount)}</strong></div>
          </div>
        `).join("") : `<div class="muted">Không có giao dịch qua cổng thanh toán online.</div>`}
        ${settlementSummary}
      </section>
    `;
    const deliveryDetails = `
      <section class="card">
        <div class="section-title">Giao nhận</div>
        <div class="spec-grid one">
          <div><span>Địa chỉ nhận hàng</span><strong>${H.escapeHtml(state.parentOrder.delivery.receivingAddress)}</strong></div>
          <div><span>Khung giờ có thể nhận hàng</span><strong>${H.escapeHtml(state.parentOrder.delivery.receivingWindow)}</strong></div>
          ${preorder ? `<div><span>Ngày cần hàng theo kế hoạch Buyer</span><strong>${H.formatDateOnly(state.parentOrder.preorderDate)}</strong></div>` : ""}
          <div><span>Thời gian giao dự kiến</span><strong>${logisticsEta(state)}</strong></div>
          <div><span>Đối tác logistics</span><strong>${state.deliveryProfile.estimatedDelivery ? "Đã nhận ETA từ đối tác 3PL" : "Chờ báo giá / ETA / tracking"}</strong></div>
        </div>
        ${state.deliveryProfile.estimatedDelivery ? "" : `<div class="simulate-panel"><span>Prototype controls</span><button type="button" onclick="window.Kaggri.simulateLogisticsEta()">Mô phỏng nhận ETA từ 3PL</button></div>`}
      </section>
    `;
    const invoiceDetails = `
      <section class="card">
        <div class="section-title">Hóa đơn theo VendorOrder</div>
        ${state.vendorOrders.map((vendorOrder) => {
          const vendor = H.vendorById(vendorOrder.vendorId);
          return `<div class="vendor-detail-card">
            <div class="row-between"><strong>${H.escapeHtml(vendor.shortName)}</strong><span class="chip ${vendorOrder.invoice.status === "ISSUED" ? "chip-success" : "chip-warn"}">${H.escapeHtml(invoiceStatusText(vendorOrder.invoice.status))}</span></div>
            ${vendorOrder.invoice.invoiceNumber ? `<div class="summary-row"><span>Số hóa đơn</span><strong>${H.escapeHtml(vendorOrder.invoice.invoiceNumber)}</strong></div>` : ""}
            ${vendorOrder.dueDate ? `<div class="summary-row"><span>Hạn thanh toán công nợ</span><strong>${H.escapeHtml(vendorOrder.dueDate)}</strong></div>` : ""}
            ${vendorOrder.invoice.status === "REQUESTED" ? `<button type="button" class="btn btn-light" onclick="window.Kaggri.simulateInvoiceIssued('${vendorOrder.vendorId}')">Mô phỏng Vendor phát hành</button>` : ""}
          </div>`;
        }).join("")}
      </section>
    `;
    const receivingDetails = `
      <section class="card">
        <div class="section-title">Người nhận hàng</div>
        <div class="spec-grid one">
          <div><span>Người nhận</span><strong>${H.escapeHtml(state.parentOrder.delivery.recipientName)}</strong></div>
          <div><span>Số điện thoại</span><strong>${H.escapeHtml(state.parentOrder.delivery.recipientPhone)}</strong></div>
        </div>
      </section>
    `;
    const tabContent = {
      overview: `${vendorDetails}${paymentDetails}${deliveryDetails}${invoiceDetails}${receivingDetails}`,
      vendors: vendorDetails,
      payment: paymentDetails,
      delivery: `${deliveryDetails}${receivingDetails}`,
      invoice: invoiceDetails
    }[state.orderTab] || vendorDetails;

    return C.pageShell(`
      <div class="page-title-row compact">
        <div>
          <h1>Chi tiết đơn mua</h1>
          <div class="muted">${H.escapeHtml(state.parentOrder.id)} • ${H.escapeHtml(state.parentOrder.createdAt)} • ${preorder ? `Đơn đặt trước cần hàng ${H.formatDateOnly(state.parentOrder.preorderDate)} • ` : ""}${H.escapeHtml(parentStatusText(state.parentOrder.status))}</div>
        </div>
        <span class="chip ${anyRejected || (!anyPreparing && !anyScheduled) ? "chip-warn" : "chip-success"}">${summary}</span>
      </div>

      ${C.progress(preorder ? (allRejected ? 1 : anyShipped ? 4 : 3) : (allRejected ? 2 : anyShipped ? 4 : 3), state.parentOrder.orderMode)}

      <div class="order-tabs">
        <button type="button" class="${state.orderTab === "overview" ? "active" : ""}" onclick="window.Kaggri.selectOrderTab('overview')">Tổng quan</button>
        <button type="button" class="${state.orderTab === "vendors" ? "active" : ""}" onclick="window.Kaggri.selectOrderTab('vendors')">Đơn theo NCC</button>
        <button type="button" class="${state.orderTab === "payment" ? "active" : ""}" onclick="window.Kaggri.selectOrderTab('payment')">Thanh toán</button>
        <button type="button" class="${state.orderTab === "delivery" ? "active" : ""}" onclick="window.Kaggri.selectOrderTab('delivery')">Giao nhận</button>
        <button type="button" class="${state.orderTab === "invoice" ? "active" : ""}" onclick="window.Kaggri.selectOrderTab('invoice')">Hóa đơn</button>
      </div>

      <div class="dashboard-grid">
        ${tabContent}
      </div>
    `, { noFooter: true });
  };

  const renderers = Object.freeze({
    b02,
    b04,
    "b04-invoice": b04Invoice,
    "b04-delivery": b04Delivery,
    b05,
    b06,
    b07,
    b08: expiredScreen,
    b09,
    b10a,
    b10
  });

  window.KaggriScreens = Object.freeze({
    has(screen) {
      return Object.hasOwn(renderers, screen);
    },

    render(state, screen) {
      return (renderers[screen] || renderers.b02)(state);
    }
  });
})();
