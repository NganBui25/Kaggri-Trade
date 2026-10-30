# Kaggri-Trade Admin — Đặc tả phân quyền & chức năng theo vai trò

*Dành cho AI agent triển khai code. Phiên bản 1.0 · Áp dụng cho prototype `admin-ui` (HTML/CSS/JS thuần, IIFE, `window.Kaggri*`).*

## 0. Cách dùng tài liệu

- Đây là **nguồn sự thật duy nhất** về phân quyền Admin. Khi mâu thuẫn với `data.js` cũ, `screens.js` cũ hoặc SRS, **tài liệu này thắng**.
- Agent làm theo thứ tự mục 9 (kế hoạch triển khai). Mỗi bước có tiêu chí nghiệm thu ở mục 10.
- Không đổi kiến trúc: giữ IIFE, `data.js → helpers.js → components.js → screens.js → app.js`, event delegation bằng `data-action` / `data-nav`, render bằng chuỗi HTML, `H.esc()` cho mọi dữ liệu động.
- Mọi văn bản UI bằng **tiếng Việt**. Mã permission, role, trạng thái bằng **tiếng Anh viết hoa**.

## 1. Quyết định đã chốt

| # | Quyết định |
| --- | --- |
| D1 | Có **4 role**: `SUPER_ADMIN`, `OPS_ADMIN`, `FIN_ADMIN`, `COMP_ADMIN`. |
| D2 | **Ops quyết định dispute, Finance thực thi refund.** Hai bước tách riêng, có trạng thái trung gian. |
| D3 | **Chấm dứt Vendor chỉ Super Admin.** Ops chỉ được tạm khóa. |
| D4 | **Compliance chỉ xem**, riêng audit log được xuất. |
| D5 | Một user có **đúng một role chính** trong prototype (hệ thống thật cho nhiều role: quyền = hợp các role). |
| D6 | Ẩn menu/nút chỉ là UX. Mọi action handler phải **kiểm tra quyền lại** và từ chối bằng toast + màn "Không có quyền". |
| D7 | Không xóa vật lý. Nút "Xóa" = vô hiệu hóa. |
| D8 | Admin **không** có nút sửa tay trạng thái payment (không có "Đánh dấu đã thanh toán"). |

## 2. Quy ước permission

Format: `MODULE:ACTION`. Wildcard `*` chỉ dành cho `SUPER_ADMIN`.

### 2.1 Danh mục permission đầy đủ

| Module | Permission |
| --- | --- |
| Dashboard | `DASH:VIEW`, `DASH:VIEW_OPS`, `DASH:VIEW_FIN` |
| Báo cáo | `REPORT:VIEW`, `REPORT:EXPORT` |
| KYC | `KYC:VIEW`, `KYC:REVIEW`, `KYC:DECIDE` |
| Vendor | `VND_MGMT:VIEW`, `VND_MGMT:SUSPEND`, `VND_MGMT:REACTIVATE`, `VND_MGMT:TERMINATE` |
| Buyer | `BUY_MGMT:VIEW`, `BUY_MGMT:SUSPEND`, `BUY_MGMT:REACTIVATE` |
| Giao dịch | `TXN:VIEW`, `TXN:RECHECK`, `TXN:EXPORT` |
| Dispute | `DISPUTE:VIEW`, `DISPUTE:ASSIGN`, `DISPUTE:DECIDE`, `DISPUTE:REQUEST_EVIDENCE` |
| Refund | `REFUND:VIEW`, `REFUND:EXECUTE`, `REFUND:RETRY` |
| Đối soát | `SETTLEMENT:VIEW`, `SETTLEMENT:CREATE`, `SETTLEMENT:CALCULATE`, `SETTLEMENT:FINALIZE`, `SETTLEMENT:PAY` |
| Kiểm duyệt | `MOD:VIEW`, `MOD:APPROVE`, `MOD:HIDE` |
| Danh mục | `CAT:VIEW`, `CAT:MANAGE` |
| Cấu hình | `CONFIG:VIEW`, `CONFIG:VIEW_FIN`, `CONFIG:EDIT` |
| RBAC | `RBAC:VIEW`, `RBAC:EDIT` |
| Audit | `AUDIT:VIEW`, `AUDIT:VIEW_OPS`, `AUDIT:VIEW_FIN`, `AUDIT:EXPORT` |
| Thông báo | `NOTI:VIEW` (mọi role có) |

### 2.2 Gán permission theo role (dán vào `DATA.roles[].permissions`)

```js
SUPER_ADMIN: ["*"],

OPS_ADMIN: [
  "DASH:VIEW_OPS","REPORT:VIEW","NOTI:VIEW",
  "KYC:VIEW","KYC:REVIEW","KYC:DECIDE",
  "VND_MGMT:VIEW","VND_MGMT:SUSPEND","VND_MGMT:REACTIVATE",
  "BUY_MGMT:VIEW","BUY_MGMT:SUSPEND","BUY_MGMT:REACTIVATE",
  "TXN:VIEW",
  "DISPUTE:VIEW","DISPUTE:ASSIGN","DISPUTE:DECIDE","DISPUTE:REQUEST_EVIDENCE",
  "SETTLEMENT:VIEW",
  "MOD:VIEW","MOD:APPROVE","MOD:HIDE",
  "CAT:VIEW","CAT:MANAGE",
  "CONFIG:VIEW","AUDIT:VIEW_OPS"
],

FIN_ADMIN: [
  "DASH:VIEW_FIN","REPORT:VIEW","REPORT:EXPORT","NOTI:VIEW",
  "KYC:VIEW","VND_MGMT:VIEW","BUY_MGMT:VIEW",
  "TXN:VIEW","TXN:RECHECK","TXN:EXPORT",
  "DISPUTE:VIEW",
  "REFUND:VIEW","REFUND:EXECUTE","REFUND:RETRY",
  "SETTLEMENT:VIEW","SETTLEMENT:CREATE","SETTLEMENT:CALCULATE","SETTLEMENT:FINALIZE","SETTLEMENT:PAY",
  "CAT:VIEW","CONFIG:VIEW_FIN","AUDIT:VIEW_FIN"
],

COMP_ADMIN: [
  "DASH:VIEW","REPORT:VIEW","NOTI:VIEW",
  "KYC:VIEW","VND_MGMT:VIEW","BUY_MGMT:VIEW",
  "TXN:VIEW","DISPUTE:VIEW","REFUND:VIEW","SETTLEMENT:VIEW",
  "MOD:VIEW","CAT:VIEW","CONFIG:VIEW","RBAC:VIEW",
  "AUDIT:VIEW","AUDIT:EXPORT"
]
```

**Lưu ý đặc biệt**

- `DASH:VIEW` (Super, Compliance) = thấy toàn bộ KPI; `DASH:VIEW_OPS` chỉ KPI vận hành; `DASH:VIEW_FIN` chỉ KPI tài chính.
- Hàm `hasPermission(admin, perm)` phải coi `X:VIEW` được thỏa nếu có `X:VIEW_OPS`/`X:VIEW_FIN` **khi màn đó chỉ cần mức tối thiểu**. Đơn giản nhất: định nghĩa helper `canAny(admin, ["DASH:VIEW","DASH:VIEW_OPS","DASH:VIEW_FIN"])`.

## 3. Ma trận role × màn hình

`F` = xem + thao tác theo permission, `V` = chỉ xem, `–` = ẩn menu và chặn route.

| View key | Màn hình | SUPER | OPS | FIN | COMP |
| --- | --- | :-: | :-: | :-: | :-: |
| `dashboard` | Dashboard | F | V (KPI ops) | V (KPI fin) | V |
| `reports` | Báo cáo | F | V | F | V |
| `kyc`, `kyc-detail` | Hồ sơ Vendor chờ duyệt | F | F | V | V |
| `accounts-vendor` | Quản lý Vendor | F | F (không terminate) | V | V |
| `accounts-buyer` | Quản lý Buyer | F | F | V | V |
| `transactions`, `transaction-detail` | Giám sát giao dịch | F | V | F | V |
| `disputes`, `dispute-detail` | Giải quyết tranh chấp | F | F | V | V |
| `refunds` *(mới)* | Hàng đợi hoàn tiền | F | – | F | V |
| `settlements`, `settlement-detail` | Đối soát | F | V | F | V |
| `moderation` | Kiểm duyệt nội dung | F | F | – | V |
| `categories` | Danh mục chung | F | F | V | V |
| `config` | Cấu hình hệ thống | F | V | V (nhóm tài chính) | V |
| `rbac` | Quản trị RBAC | F | – | – | V |
| `audit` | Nhật ký kiểm toán | F | V (phần ops) | V (phần fin) | F |
| `admin-notifications` | Thông báo | F | F | F | F |

Route bị chặn → render `S.forbidden()` (xem mục 6), **không** redirect im lặng.

## 4. Đặc tả theo từng role

### 4.1 SUPER_ADMIN

**Mục tiêu:** quản trị nền tảng, cấu hình, phân quyền, xử lý hành động không thể khôi phục.

**Được làm (độc quyền)**

1. `VND_MGMT:TERMINATE` — chấm dứt Vendor: modal bắt buộc lý do ≥ 10 ký tự, cảnh báo "còn N đơn đang giao", đổi `status = terminated`, ghi audit `VND_MGMT:TERMINATE`.
2. `CONFIG:EDIT` — sửa từng tham số `systemConfig`. Modal xác nhận hiển thị **giá trị cũ → giá trị mới** và **phạm vi ảnh hưởng**; ghi audit `CONFIG:UPDATE` (before/after).
3. `RBAC:EDIT` — tạo/sửa role, sửa danh sách permission, gán role cho Admin.

**Ràng buộc**

- Không thể xóa/vô hiệu role `SUPER_ADMIN`. Không thể hạ Super Admin cuối cùng (luôn còn ≥ 1 Super Admin `active`).
- Không thể cấp permission mà bản thân không có (với Super là vô hạn, nhưng logic vẫn phải được code để áp cho role khác nếu sau này mở rộng).
- Mọi thao tác nghiệp vụ của Super vẫn **bắt buộc audit**, không có đường tắt.

**Màn hình đặc thù cần dựng**

- `config`: mỗi dòng có input **thật sự sửa được** (hiện tại chỉ readonly), nút "Lưu thay đổi" bật khi có thay đổi, mở modal so sánh cũ/mới.
- `rbac`: modal ma trận quyền dạng **checkbox theo module × action** (thay textarea), có nút chọn tất cả module.

### 4.2 OPS_ADMIN (Operations)

**Mục tiêu:** vận hành hằng ngày — duyệt Vendor, quản lý tài khoản, xử lý tranh chấp, kiểm duyệt, danh mục.

**Được làm**

| Nghiệp vụ | Permission | Hành vi |
| --- | --- | --- |
| Duyệt KYC | `KYC:DECIDE` | 3 nút: Phê duyệt / Yêu cầu bổ sung / Từ chối. Bổ sung & từ chối **bắt buộc lý do**. Ghi audit. |
| Tạm khóa Vendor/Buyer | `*:SUSPEND` | Lý do bắt buộc. Vendor còn đơn đang chạy → cảnh báo; **không hủy đơn đang chạy**; Vendor bị khóa không nhận đơn mới. |
| Kích hoạt lại | `*:REACTIVATE` | Chỉ khi `status = suspended`. |
| Phân công dispute | `DISPUTE:ASSIGN` | Gán cho Ops hiện tại hoặc Ops khác. SLA 4 giờ. |
| Yêu cầu bổ sung bằng chứng | `DISPUTE:REQUEST_EVIDENCE` | Chuyển sang `MORE_EVIDENCE_REQUIRED`. |
| **Quyết định dispute** | `DISPUTE:DECIDE` | Xem mục 5.2. Ops **không** chuyển tiền. |
| Kiểm duyệt | `MOD:APPROVE`, `MOD:HIDE` | Ẩn bắt buộc lý do + nhóm vi phạm. Ẩn sản phẩm không hủy đơn đang chạy. |
| Danh mục/đơn vị | `CAT:MANAGE` | Không xóa nhóm đang có sản phẩm → chỉ vô hiệu hóa, hiển thị số sản phẩm bị ảnh hưởng. |

**Không được làm (phải ẩn nút + chặn handler):** chấm dứt Vendor, hoàn tiền/thực thi refund, tạo/chốt/trả settlement, sửa config, sửa RBAC, xuất audit.

**Dashboard (`DASH:VIEW_OPS`):** chỉ hiện KPI Vendor/Buyer hoạt động, tỷ lệ hoàn thành đơn, tỷ lệ tranh chấp; ẩn GMV, commission, doanh thu ròng, tỷ lệ thanh toán. Panel cảnh báo chỉ lọc `level` liên quan ops (KYC, dispute, moderation).

**Audit (`AUDIT:VIEW_OPS`):** chỉ thấy log có `action` bắt đầu bằng `KYC:`, `VND_MGMT:`, `BUY_MGMT:`, `DISPUTE:`, `MOD:`, `CATEGORY:`, `UNIT:`.

### 4.3 FIN_ADMIN (Finance)

**Mục tiêu:** tiền — giao dịch, thực thi refund, đối soát, thanh toán Vendor.

**Được làm**

| Nghiệp vụ | Permission | Hành vi |
| --- | --- | --- |
| Xem/lọc/xuất giao dịch | `TXN:VIEW`, `TXN:EXPORT` | Như hiện tại. |
| Kiểm tra lại cổng / xử lý lại webhook | `TXN:RECHECK` | Thay nút "Hoàn tiền / Retry" cũ ở `transaction-detail`. Ghi audit. **Không có nút sửa trạng thái payment.** |
| **Thực thi refund** | `REFUND:EXECUTE` | Xử lý hàng đợi `refunds`, xem mục 5.2. |
| Thử lại refund lỗi | `REFUND:RETRY` | Tối đa 3 lần, hiển thị lý do lỗi của cổng. |
| Đối soát | `SETTLEMENT:*` | Luồng tuần tự, xem mục 5.3. |

**Ràng buộc nghiệp vụ**

- `refund.amount ≤ paidAmount − alreadyRefunded` (BR-PAY-003). UI luôn hiện ba số: đã thanh toán / đã hoàn trước / còn có thể hoàn.
- Số tiền refund **lấy từ quyết định dispute**, Finance không gõ số tùy ý (field readonly).
- **Four-eyes:** Admin đã `DISPUTE:DECIDE` vụ X không được `REFUND:EXECUTE` cho vụ X (nếu cùng một user có cả hai quyền, ví dụ Super). Hiển thị toast "Cần người khác thực thi".
- Kỳ settlement đã `FINALIZED` không sửa trực tiếp; chỉ tạo bản ghi **Adjustment** có lý do, liên kết kỳ gốc.

**Không được làm:** duyệt KYC, khóa tài khoản, quyết định dispute, kiểm duyệt, sửa config/RBAC.

**Dashboard (`DASH:VIEW_FIN`):** hiện GMV, commission, doanh thu ròng, tỷ lệ thanh toán thành công, refund; ẩn KPI KYC/moderation.

**Config (`CONFIG:VIEW_FIN`):** chỉ thấy nhóm "Hoa hồng & định giá" và "Đối soát", input `disabled`.

### 4.4 COMP_ADMIN (Compliance)

**Mục tiêu:** kiểm toán, tuân thủ — **chỉ đọc**, riêng xuất audit.

**Được làm**

- Xem mọi màn trong ma trận mục 3 (đánh `V`).
- `AUDIT:VIEW`: xem **toàn bộ** audit log, lọc theo actor / vai trò / hành động / đối tượng / ngày.
- `AUDIT:EXPORT`: xuất CSV; **bản thân hành động xuất phải được ghi audit** `AUDIT:EXPORT`.
- Xem chi tiết before/after dạng 2 cột, tô màu trường thay đổi; che dữ liệu nhạy cảm.

**Ràng buộc**

- **Mọi nút ghi phải ẩn hoàn toàn** (không chỉ disable): approve, suspend, decide, refund, finalize, hide, edit config, edit role, thêm danh mục.
- Nút "Xuất CSV" ở các màn không phải audit (`export-transactions`, v.v.) cũng ẩn nếu thiếu `*:EXPORT`.
- Audit log tuyệt đối read-only với mọi role, kể cả Super (không có nút sửa/xóa).

## 5. Luồng nghiệp vụ cần code

### 5.1 Quy tắc chung cho mọi hành động can thiệp dữ liệu

1. Modal xác nhận.
2. Ô **Lý do** bắt buộc, `trim().length >= 10`, báo lỗi ngay tại trường.
3. Kiểm tra permission trong handler (`can(perm)`), thất bại → `C.toast("Bạn không có quyền thực hiện thao tác này")` và ghi audit `ACCESS:DENIED`.
4. Thay đổi state mock.
5. `logAudit(action, object, before, after, reason)` — thêm tham số `reason` và lưu vào log.
6. Toast thành công + `render()`.

### 5.2 Dispute → Refund (hai bước, hai role)

Thêm trạng thái trung gian `PENDING_REFUND_EXECUTION`.

```
OPENED → AWAITING_VENDOR → UNDER_REVIEW ⇄ MORE_EVIDENCE_REQUIRED
   → (Ops quyết định)
      ├─ RESOLVED_REJECTED        (Vendor giữ 100%, không cần refund)
      ├─ CLOSED                   (hủy đơn → vẫn tạo refund, trừ phí GD)
      ├─ PENDING_REFUND_EXECUTION (hoàn một phần / toàn phần) → tạo bản ghi refund
      └─ …
Finance thực thi refund thành công → RESOLVED_REFUND_PARTIAL | RESOLVED_REFUND_FULL
Finance thực thi thất bại          → giữ PENDING_REFUND_EXECUTION, refund.status = FAILED
```

**Bản ghi refund (thêm `DATA.refunds`)**

```js
{ id:"RF-2026-0918-001", disputeId:"DSP-...", orderId:"VO-...",
  paidAmount, alreadyRefunded, amount, type:"PARTIAL|FULL|CANCEL",
  status:"WAITING|PROCESSING|SUCCESS|FAILED", failReason:null,
  retryCount:0, decidedBy:"ADM-002", executedBy:null,
  decisionReason:"...", createdAt, executedAt:null }
```

**Form quyết định (Ops, `dispute-detail`)**

- Chọn: Từ chối / Hoàn một phần / Hoàn toàn phần / Hủy đơn.
- Một phần: nhập **số lượng bị ảnh hưởng** (kg); hệ thống tự tính `amount = affectedQty × đơn giá` — không cho gõ số tiền tự do. Hiện `đã thanh toán / đã hoàn / còn hoàn được` và chặn nếu vượt.
- Lý do ≥ 10 ký tự. Xem trước tác động tới Escrow & Vendor Score.

**Màn `refunds` (Finance)**

- Tab: Chờ thực thi / Đang xử lý / Thành công / Thất bại.
- Nút "Thực thi hoàn tiền" (mock: 85% thành công, 15% thất bại để demo retry) → khi thành công cập nhật dispute, tạo giao dịch `REFUND_PARTIAL|REFUND_FULL` trong `DATA.transactions`, ghi audit.
- Thất bại: hiện `failReason`, nút "Thử lại" (tối đa 3).

### 5.3 Settlement (Finance, tuần tự)

Trạng thái: `DRAFT → CALCULATED → UNDER_REVIEW → FINALIZED → PAID` (thêm `RECONCILED`, `ADJUSTED`; `PAYING`/`FAILED` giữ cho cổng).

- Mỗi bước chỉ mở nút khi bước trước xong; nút khác bị ẩn.
- Công thức: `Net = GMV − Hoàn − Adjustment − Commission(5%) − EscrowReserve(5%)`; hàng tổng cuối bảng **phải bằng tổng các dòng** (assert trong smoke test).
- `FINALIZED` trở đi: ẩn mọi nút sửa, chỉ còn "Tạo Adjustment".
- Khi tính, kỳ có dispute đang mở → đánh dấu giữ escrow cho kỳ kế tiếp.

### 5.4 KYC (Ops)

- `kyc-request` / `kyc-reject` phải **ghi lý do** (hiện handler bỏ qua `data.get("reason")`).
- Sau `kyc-request`, hồ sơ chuyển `more_info_required` và **không biến mất** khỏi hàng chờ (hiện chỉ toast).
- Soft-lock: hiển thị "Đang được xử lý bởi …" khi một Ops mở hồ sơ.

## 6. Thay đổi code theo file

### `data.js`

- Cập nhật `roles[].permissions` theo 2.2; thêm `roles[].userIds`.
- Thêm `DATA.admins` (mỗi role ≥ 1 user: `id, name, role, roleLabel, avatar`) để chuyển đổi role demo.
- Thêm `DATA.refunds`, trạng thái `PENDING_REFUND_EXECUTION` vào `lists.disputeStatuses`.
- Thêm `lists.permissionCatalog` = mảng `{module, label, actions:[...]}` để vẽ ma trận.
- Thêm dispute mẫu ở trạng thái `PENDING_REFUND_EXECUTION` và 1 refund `FAILED` để demo.

### `helpers.js`

```js
const can = (perm) => hasPermission(window.KAGGRI_ADMIN_STATE.admin, perm);
const canAny = (perms) => perms.some(can);
const scopeAudit = (logs) => /* lọc theo AUDIT:VIEW / VIEW_OPS / VIEW_FIN */;
```

- `hasPermission`: hỗ trợ `*`, và nhận `admin.role` từ `DATA.roles` (không dùng bản `PERMS_BY_ROLE` build một lần — phải tra động để RBAC edit có hiệu lực).
- Xuất `can`, `canAny`, `scopeAudit`, `canDecideAndExecute(adminId, disputeId)` (four-eyes).

### `components.js`

- `navGroups`: thêm trường thứ 4 `requiredPerms` (mảng, thỏa bất kỳ). `sidebar()` lọc item theo `canAny`; nhóm rỗng thì ẩn.
- Thêm item `refunds` ("Hoàn tiền", icon `RF`) vào nhóm Tài chính + `titles.refunds`.
- `topBar()`: thêm **bộ chuyển role demo** (`<select data-action="switch-admin">`) liệt kê `DATA.admins`.
- `badgeCount()`: chỉ đếm cho mục mà role hiện tại thấy; thêm đếm `refunds` (WAITING/FAILED).
- Thêm helper `actionBtn(perm, html)` trả `""` nếu `!can(perm)`.

### `screens.js`

- Thêm `forbidden(viewTitle)`: icon khóa, "Bạn không có quyền truy cập {viewTitle}", hiện role hiện tại và nút "Về Dashboard".
- Thêm `refunds(state)`.
- Bọc mọi nút ghi bằng `C.actionBtn(...)` theo bảng mục 4 (ví dụ `terminate-vendor` → `VND_MGMT:TERMINATE`; `refund-txn` thay bằng `recheck-txn` → `TXN:RECHECK`; `settlement-*` → `SETTLEMENT:*`; `mod-*` → `MOD:*`).
- `dashboard()`: lọc `d.kpis` và `d.alerts` theo `DASH:VIEW_OPS|VIEW_FIN`; thêm `scope` vào mỗi KPI/alert trong `data.js` (`"all"|"ops"|"fin"`).
- `rbac()`: **sinh ma trận từ `DATA.roles` + `permissionCatalog`**, xóa mảng hardcode. Ô ✓ nếu role có permission (hoặc `*`).
- `audit()`: dùng `scopeAudit`; ẩn nút xuất nếu thiếu `AUDIT:EXPORT`; thêm chi tiết before/after.
- `config()`: input editable với `CONFIG:EDIT`, ngược lại `disabled`; ẩn nhóm không thuộc `CONFIG:VIEW_FIN` cho Finance.

### `app.js`

- `state.admin` = `DATA.admins[0]` mặc định; `switch-admin` đổi `state.admin`, `DATA.currentAdmin`, về `dashboard`, toast tên role.
- Trong `render()`: nếu view không thuộc quyền → `S.forbidden()`.
- Trong click handler, **trước mỗi `case`** gọi `guard(perm)`; bảng map `action → perm`:

| action | perm |
| --- | --- |
| `kyc-approve`, `kyc-reject`, `kyc-request` | `KYC:DECIDE` |
| `suspend-vendor` / `reactivate-vendor` | `VND_MGMT:SUSPEND` / `VND_MGMT:REACTIVATE` |
| `terminate-vendor` | `VND_MGMT:TERMINATE` |
| `suspend-buyer` / `reactivate-buyer` | `BUY_MGMT:SUSPEND` / `BUY_MGMT:REACTIVATE` |
| `decision-*` | `DISPUTE:DECIDE` |
| `request-evidence` | `DISPUTE:REQUEST_EVIDENCE` |
| `recheck-txn` | `TXN:RECHECK` |
| `refund-execute`, `refund-retry` | `REFUND:EXECUTE` / `REFUND:RETRY` |
| `settlement-calculate/finalize/pay`, `new-settlement` | `SETTLEMENT:*` tương ứng |
| `mod-approve*`, `mod-hide*` | `MOD:APPROVE` / `MOD:HIDE` |
| `new-category`, `rename-category`, `*-unit` | `CAT:MANAGE` |
| `new-role`, `edit-role` | `RBAC:EDIT` |
| `save-config` | `CONFIG:EDIT` |
| `export-audit` | `AUDIT:EXPORT` |
| `export-transactions` | `TXN:EXPORT` |

- Sửa `decideDispute()`: Ops chỉ đặt `PENDING_REFUND_EXECUTION` + tạo refund; **không** đổi sang `RESOLVED_REFUND_*`.
- `logAudit(action, object, before, after, reason)`; lấy `actor` từ `state.admin`, không hardcode `DATA.currentAdmin`.
- `hashchange`/`navigate`: chặn view không có quyền (render forbidden, giữ hash).
- Bỏ hằng ngày giả `"18/09/2026 22:00"` rải rác; dùng 1 hằng `MOCK_NOW` chung với `helpers.hoursUntilDeadline`.

## 7. Quy tắc dữ liệu & bảo mật (bắt buộc)

- Số tiền lưu số nguyên VND; không tính lại tiền ở client ngoài các phép mock hiển thị.
- Thời gian hiển thị `dd/mm/yyyy hh:mm` (Asia/Bangkok), ghi chú múi giờ dưới bộ lọc dashboard.
- Mọi chuỗi động qua `H.esc`; không dùng `innerHTML` với dữ liệu người dùng chưa escape.
- Không lưu secret; khóa API hiển thị dạng che `vnp_****3f2a`.
- Prototype không có backend: ghi rõ trong footer "Phân quyền mô phỏng; hệ thống thật kiểm tra tại Backend".

## 8. Dữ liệu demo tối thiểu

| Admin | Role | Dùng để demo |
| --- | --- | --- |
| ADM-001  (super) | SUPER_ADMIN | Chấm dứt Vendor, sửa config, sửa RBAC |
| ADM-002 (Ops) | OPS_ADMIN | Duyệt KYC, quyết định dispute, kiểm duyệt |
| ADM-004 (Fin) | FIN_ADMIN | Thực thi refund, chốt settlement |
| ADM-005 (Comp) | COMP_ADMIN | Xem toàn bộ, xuất audit, mọi nút ghi bị ẩn |

Kịch bản demo 5 phút: Ops quyết định hoàn một phần → chuyển sang Finance thấy refund chờ → thực thi → quay lại Compliance xem 3 dòng audit tương ứng.

## 9. Kế hoạch triển khai cho agent (theo thứ tự)

1. **Dữ liệu:** cập nhật `data.js` (roles, admins, refunds, permissionCatalog, scope KPI/alert).
2. **Lõi quyền:** `helpers.js` (`can`, `canAny`, `scopeAudit`, four-eyes) + `state.admin` trong `app.js`.
3. **UI khung:** lọc sidebar, bộ chuyển role, `forbidden()`, guard trong `render()`.
4. **Guard hành động:** bảng `action → perm`, bọc nút bằng `actionBtn`.
5. **Dispute → Refund:** sửa `decideDispute`, thêm màn `refunds`, giao dịch refund, trạng thái mới.
6. **Settlement tuần tự + Adjustment.**
7. **RBAC động:** ma trận sinh từ dữ liệu, modal checkbox, ràng buộc ≥ 1 Super Admin.
8. **Config editable** với modal cũ→mới.
9. **Audit scope & before/after**, ghi `reason`, ghi hành động xuất.
10. **Cập nhật `smoke.js`** theo mục 10.

Sau mỗi bước chạy `node tests/smoke.js`; không được làm hỏng các test hiện có.

## 10. Tiêu chí nghiệm thu & test (thêm vào `smoke.js`)

**Quyền theo role**

- `SUPER_ADMIN`: `can("ANY:THING") === true`.
- `OPS_ADMIN`: `can("DISPUTE:DECIDE")` ✓; `can("REFUND:EXECUTE")`, `can("VND_MGMT:TERMINATE")`, `can("SETTLEMENT:FINALIZE")`, `can("CONFIG:EDIT")` đều ✗.
- `FIN_ADMIN`: `can("REFUND:EXECUTE")` ✓; `can("KYC:DECIDE")`, `can("DISPUTE:DECIDE")`, `can("MOD:HIDE")` ✗.
- `COMP_ADMIN`: `can("AUDIT:EXPORT")` ✓; mọi permission có hậu tố `:DECIDE|:SUSPEND|:EXECUTE|:FINALIZE|:HIDE|:EDIT|:MANAGE` ✗.

**Hiển thị**

- Render `sidebar` với từng role: Finance **không** chứa `kyc`-action nhưng chứa `refunds`; Ops **không** chứa `refunds`, `rbac`; Compliance chứa `audit`, `rbac` (view).
- Render `accountsVendor` với Ops: **không** có chuỗi `terminate-vendor`; với Super: có.
- Render `settlementDetail` với Compliance: không có `settlement-calculate|finalize|pay`.
- Render `dashboard` với Ops: không chứa KPI `gmv`; với Finance: không chứa KPI `disputeRate`.

**Nghiệp vụ**

- Sau `decideDispute(..., "RESOLVED_REFUND_PARTIAL")` bởi Ops: `status === "PENDING_REFUND_EXECUTION"` và tồn tại refund `WAITING`.
- Finance thực thi thành công → dispute thành `RESOLVED_REFUND_*`, có giao dịch refund mới, có audit.
- `refund.amount > paidAmount − alreadyRefunded` bị từ chối.
- Cùng user quyết định và thực thi một dispute → bị chặn.
- Lý do < 10 ký tự → không submit, có thông báo lỗi.
- Không thể xóa/hạ Super Admin cuối cùng.
- Tổng settlement = tổng các dòng vendor.
- Mọi action ghi đều sinh 1 bản ghi `auditLogs` có `reason` và `actor` đúng role đang chọn.

**Không hồi quy:** 20 test render cũ vẫn pass (mọi `S.*` vẫn trả chuỗi > 80 ký tự với admin Super).

## 11. Ngoài phạm vi (không làm trong prototype)

- Xác thực thật, MFA, JWT, IP whitelist (chỉ giữ màn đăng nhập mô phỏng).
- Gọi API cổng thanh toán thật.
- Đa-role cho một user và scope theo vùng.
- Quản lý tài khoản Admin đầy đủ (A16) — chỉ cần bảng role và gán user mức hiển thị.

## 12. Điểm còn mở (hỏi người dùng nếu cần, nếu không thì giữ mặc định)

| # | Câu hỏi | Mặc định |
| --- | --- | --- |
| Q1 | Ops có được xem Settlement? | Có, chỉ xem |
| Q2 | Super Admin có bị áp four-eyes? | Có |
| Q3 | Compliance có thấy dữ liệu nhạy cảm (CCCD)? | Không, che toàn bộ |
| Q4 | Refund thất bại 3 lần xử lý thế nào? | Chuyển trạng thái `ESCALATED`, thông báo Super Admin |

