# KAGGRI-TRADE — Admin Web Prototype

Prototype HTML/CSS/JavaScript thuần cho **Module Quản trị Web** của nền tảng B2B nông sản KAGGRI-TRADE. Toàn bộ dữ liệu là mock, không có backend, không cần cài package.

> Xem tài liệu nghiệp vụ: `../admin-bao-cao-tong-hop.md`

---

## 1. Cách chạy

- Mở trực tiếp `index.html` bằng trình duyệt, **hoặc**
- Chạy một static server bất kỳ ở thư mục này, ví dụ:
  ```bash
  python -m http.server 8080
  # mở http://localhost:8080
  ```
- Để chuyển nhanh giữa các cổng (Buyer/Vendor/Admin), mở file `../index.html` ở thư mục docs.

## 2. Kiểm tra nhanh

```bash
node tests/smoke.js
```

Smoke test tải mock data, helpers, screens vào sandbox Node rồi kiểm tra:
- Cấu trúc mock (KYC, giao dịch, dispute, settlement, RBAC, audit) đủ điều kiện nghiệp vụ.
- 8 KPI dashboard, 4 vai trò RBAC, ≥ 10 audit log, ≥ 5 trạng thái dispute.
- Mọi màn hình (16+) render được không lỗi, có nội dung.

## 3. Cổng liên kết

File `index.html` của admin prototype có:
- **Topbar:** liên kết "Web Buyer ↗" / "Web Vendor ↗" / "Tất cả cổng" mở tab mới hoặc chuyển trang.
- **Footer:** liên kết tương tự cộng "Cổng tổng" dẫn về `../index.html`.
- **Đường dẫn tương đối** dùng `../kaggri-trade-html-prototype/...` và `../vendor-ui/...` để mở prototype vendor và buyer.

Đường dẫn được sinh tự động trong `js/components.js → pathOf(target)`:

| target        | URL                                                                                    |
|---------------|----------------------------------------------------------------------------------------|
| `buyer`       | `../kaggri-trade-html-prototype/index.html`                                            |
| `vendor`      | `../vendor-ui/index.html`                                                              |
| `root`        | `../index.html` (cổng tổng 3 prototype)                                                |

Khi mở file admin qua static server, các liên kết này vẫn đúng vì đường dẫn là tương đối.

## 4. 16 màn hình Admin được cài đặt (theo `Kaggri-Trade-Man-Hinh.md` Phần 3)

| # | Màn hình                            | View key              | Hàm render             |
|---|-------------------------------------|-----------------------|------------------------|
| 1 | Đăng nhập + MFA                     | (logged out)          | `S.login()`            |
| 2 | Dashboard tổng quan nền tảng        | `dashboard`           | `S.dashboard()`        |
| 3 | Hồ sơ Vendor chờ xét duyệt         | `kyc`                 | `S.kycList()`          |
| 4 | Chi tiết KYC & quyết định            | `kyc-detail`          | `S.kycDetail()`        |
| 5 | Quản lý Vendor (khóa/mở)            | `accounts-vendor`     | `S.accountsVendor()`   |
| 6 | Quản lý Buyer                       | `accounts-buyer`      | `S.accountsBuyer()`    |
| 7 | Quản lý danh mục & đơn vị           | `categories`          | `S.categories()`       |
| 8 | Kiểm duyệt sản phẩm & đánh giá      | `moderation`          | `S.moderation()`       |
| 9 | Giám sát giao dịch                  | `transactions`        | `S.transactions()`     |
|10 | Chi tiết giao dịch/Payment          | `transaction-detail`  | `S.transactionDetail()`|
|11 | Quản lý Dispute (danh sách)         | `disputes`            | `S.disputes()`         |
|12 | Chi tiết Dispute & phán quyết       | `dispute-detail`      | `S.disputeDetail()`    |
|13 | Quản lý Settlement (danh sách)      | `settlements`         | `S.settlements()`      |
|14 | Chi tiết Settlement                  | `settlement-detail`   | `S.settlementDetail()` |
|15 | Cấu hình hệ thống                   | `config`              | `S.config()`           |
|16 | RBAC                                 | `rbac`                | `S.rbac()`             |
|17 | Nhật ký kiểm toán                   | `audit`               | `S.audit()`            |
|18 | Báo cáo thống kê                    | `reports`             | `S.reports()`          |
|19 | Trung tâm thông báo Admin           | `admin-notifications` | `S.adminNotifications()`|

> Ghi chú: file màn hình còn có thêm Màn `Đăng nhập` (#1) nên tổng cộng **18 view**, đủ cho 10 module nghiệp vụ + phụ trợ.

## 5. Cấu trúc thư mục

```
kaggri-trade-admin-ui/
├─ index.html               // entry, có link 3 cổng
├─ css/
│  └─ style.css             // theme admin (palette đồng bộ với vendor)
├─ js/
│  ├─ data.js               // mock data (KYC, accounts, txns, disputes, RBAC, audit, dashboard…)
│  ├─ helpers.js            // money, date, lookup, variant theo role, export CSV…
│  ├─ components.js         // sidebar, topbar, modal, toast, badge, KPI card
│  ├─ screens.js            // render từng màn hình
│  └─ app.js                // hash routing, state, action handlers, modal forms
├─ tests/
│  └─ smoke.js              // node test không cần lib ngoài
└─ README.md
```

## 6. Hướng thiết kế

- **Một menu trái gom 10 module nghiệp vụ** theo SRS: Tổng quan, Vận hành, Tài chính, Nội dung & Cấu hình, Bảo mật & Tuân thủ.
- **Mỗi màn có một CTA chính** đúng vai trò (Approve/Reject/Suspend/Chốt kỳ/…).
- **Phân quyền:** hiển thị khả dụng theo role mặc định `SUPER_ADMIN`; production cần lọc theo `hasPermission(admin, perm)`.
- **Mọi thao tác nhạy cảm** (KYC quyết định, dispute decision, config change, account suspension, refund) đều ghi vào `DATA.auditLogs` qua `logAudit(...)`.
- **4 trạng thái bắt buộc** cho dữ liệu động (loading skeleton, empty, success, error) đã được thể hiện ở dashboard, danh sách filter rỗng, dispute filter rỗng, form lỗi validate.
- **Không kết nối thật**: không gọi API, không có auth thật, không cổng thanh toán, không upload file. Mọi modal mở bằng `C.modal(...)` chỉ lưu state trong bộ nhớ.

## 7. Mô phỏng các nghiệp vụ cốt lõi (theo SRS Phần 4)

| Module (SRS)                     | Màn hình trong prototype                | Hành vi mô phỏng |
|---------------------------------|-----------------------------------------|---------------------|
| 1. Xác thực & RBAC               | Login + RBAC                            | Login ẩn MFA cho demo; trạng thái phân quyền hiển thị theo ma trận |
| 2. KYC Vendor                    | KYC list + detail                       | Approve/Reject/Yêu cầu bổ sung + lý do bắt buộc |
| 3. Bảng điều khiển               | Dashboard                               | 8 KPI + biểu đồ GMV + top danh mục + top Vendor + 3 mức cảnh báo |
| 4. Giám sát giao dịch            | Transactions + chi tiết                 | Lọc theo trạng thái/cổng; refund có audit |
| 5. Tranh chấp & Escrow           | Disputes + detail                       | 4 quyết định (từ chối/hoàn 1 phần/toàn phần/hủy) + preview ảnh hưởng |
| 6. Đối soát                      | Settlements + detail                    | Draft → Tính → Chốt → Đang trả → Đã trả (lỗi) |
| 7. Kiểm duyệt nội dung           | Moderation                              | Sản phẩm + đánh giá; 5 mức vi phạm |
| 8. Cấu hình hệ thống             | Config                                  | 9 tham số + lịch sử phiên bản |
| 9. Quản trị RBAC                 | RBAC                                    | Tạo/sửa vai trò, ma trận quyền |
| 10. Nhật ký kiểm toán            | Audit                                   | Lọc theo vai trò/hành động/IP, xuất CSV |

## 8. Hành vi SLA & ngưỡng KPI đã mô phỏng

- **KYC:** deadline = `slaDeadline`, đếm `hoursUntilDeadline(...)` để hiển thị "Còn X giờ" / "Sắp hạn" / "Vi phạm".
- **Dispute:** 4 trạng thái chính (`OPENED`, `AWAITING_VENDOR`, `UNDER_REVIEW`, `MORE_EVIDENCE_REQUIRED`) cùng 4 trạng thái kết quả.
- **KPI dashboard:** mỗi KPI có `threshold` so sánh ↑/↓ để đổi tone xanh/đỏ — tương ứng ngưỡng cảnh báo ở mục 8.1 của SRS.

## 9. Giới hạn bản mẫu

- Thay đổi chỉ tồn tại trong phiên trình duyệt; tải lại sẽ khôi phục dữ liệu gốc.
- Upload ảnh/PDF chỉ lưu URL blob tạm; không kết nối storage.
- Chưa hỗ trợ MFA thực (chỉ mô phỏng).
- Chưa hỗ trợ multi-language; Tiếng Việt là ngôn ngữ chính.
- Audit log lưu local trong bộ nhớ; không bất biến thực sự như production (Hash chain / WORM storage).

## 10. Tích hợp với 2 prototype còn lại

Liên kết 3 chiều theo sơ đồ:

```
              ┌────────────────────────────────────────┐
              │  kaggri-trade-admin-ui/index.html      │
              │  (file này — trung tâm vận hành)        │
              └──────────┬─────────────────────────────┘
                         │   ../../
       ┌─────────────────┴─────────────────────────┐
       │                                            │
┌──────▼──────────────────────┐      ┌──────────────▼──────────────────────┐
│ kaggri-trade-buyer/         │      │ kaggri-trade-vendor/                │
│ kaggri-trade-html-prototype │      │ vendor-ui                            │
│ /index.html (Buyer)         │      │ /index.html (Vendor)                │
└─────────────────────────────┘      └────────────────────────────────────┘
```

- Mở admin → top bar có **Web Buyer ↗**, **Web Vendor ↗**, **Tất cả cổng**.
- Mở root `../../index.html` → trang tổng 3 portal có mô tả + nút vào từng cổng.
- Trong tương lai khi có backend thật, các liên kết này có thể chuyển sang dùng session SSO chung.
