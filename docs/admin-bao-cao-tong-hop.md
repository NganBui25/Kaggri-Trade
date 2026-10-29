# KAGGRI-TRADE - TỔNG HỢP NGHIỆP VỤ QUẢN TRỊ WEB

**Tài liệu tổng hợp phục vụ báo cáo và thảo luận**

---

| Thông tin | Chi tiết |
|-----------|----------|
| **Sản phẩm** | KAGGRI-TRADE - Nền tảng Thương mại điện tử B2B Đa Nhà cung cấp cho Chuỗi cung ứng Nông sản |
| **Phạm vi tài liệu** | Module Quản trị Web (Admin Web) |
| **Phiên bản** | 1.0 - Báo cáo |
| **Ngày tạo** | 17/09/2026 |
| **Đối tượng sử dụng** | Đội ngũ phát triển, Cấp quản lý, Cố vấn kỹ thuật, Đối tác |

---

## MỤC LỤC

1. [Tổng quan Sản phẩm](#1-tong-quan-san-pham)
2. [Mục tiêu & Phạm vi Module](#2-muc-tieu--pham-vi-module)
3. [Kiến trúc Hệ thống](#3-kien-truc-he-thong)
4. [Các Nghiệp vụ Cốt lõi](#4-cac-nghiep-vu-cot-loi)
5. [Ma trận Vai trò & Quyền](#5-ma-tran-vai-tro--quyen)
6. [Sơ đồ Trạng thái Trọng yếu](#6-so-do-trang-thai-trong-yeu)
7. [Quy trình Nghiệp vụ End-to-End](#7-quy-trinh-nghiep-vu-end-to-end)
8. [KPIs & SLA Cam kết](#8-kpis--sla-cam-ket)
9. [Yêu cầu Phi chức năng](#9-yeu-cau-phi-chuc-nang)
10. [Kết luận & Khuyến nghị](#10-ket-luan--khuyen-nghi)

---

## 1. TỔNG QUAN SẢN PHẨM

### 1.1 Bối cảnh Thị trường

KAGGRI-TRADE ra đời nhằm giải quyết bài toán **kết nối chuỗi cung ứng nông sản** giữa:
- **Nhà cung cấp (Vendor):** Nông trại, Hợp tác xã, Nhà cung cấp nông nghiệp
- **Người mua (Buyer):** Doanh nghiệp F&B, Nhà máy chế biến, Chuỗi nhà hàng, Hệ thống bán lẻ

### 1.2 Giá trị Cốt lõi

| Giá trị | Mô tả |
|---------|--------|
| **Tín nhiệm** | Xác minh KYC đầy đủ trước khi tham gia |
| **An toàn** | Cơ chế Escrow bảo vệ cả hai bên |
| **Truy xuất** | Theo dõi QR Code theo lô, từ thu hoạch đến giao hàng |
| **Định kỳ** | Hỗ trợ đơn hàng đăng ký lặp lại |
| **Minh bạch** | Dashboard analytics, báo cáo tuân thủ |

### 1.3 Các Bên Liên quan

```
┌──────────────────────────────────────────────────────────────────┐
│                        NỀN TẢNG KAGGRI-TRADE                     │
│                                                                  │
│   ┌─────────────┐              ┌─────────────┐                  │
│   │   VENDOR    │◀────────────▶│   BUYER     │                  │
│   │  (Bên bán)  │  Giao dịch   │ (Bên mua)   │                  │
│   └──────┬──────┘              └──────┬──────┘                  │
│          │                            │                         │
│          │       ┌──────────┐         │                         │
│          └──────▶│  ADMIN   │◀────────┘                         │
│                  │ (Vận hành)│                                   │
│                  └──────────┘                                    │
└──────────────────────────────────────────────────────────────────┘
```

---

## 2. MỤC TIÊU & PHẠM VI MODULE

### 2.1 Mục tiêu Module Quản trị

Module Quản trị Web đóng vai trò là **trung tâm chỉ huy** của nền tảng, cho phép:

| STT | Mục tiêu | Kết quả mong đợi |
|-----|----------|------------------|
| 1 | Đưa vào an toàn | Onboarding Vendor/Buyer với tuân thủ KYC đầy đủ |
| 2 | Giám sát toàn diện | Theo dõi giao dịch real-time, phát hiện bất thường |
| 3 | Giải quyết tranh chấp | Xử lý disputes kịp thời với cơ chế Escrow |
| 4 | Đối soát chính xác | Tính toán tự động, thanh toán Vendor minh bạch |
| 5 | Cấu hình linh hoạt | Tham số nền tảng điều chỉnh qua giao diện |
| 6 | Tuân thủ quy định | Audit log toàn diện, báo cáo theo yêu cầu |

### 2.2 Phạm vi Chức năng (10 Module)

```
┌─────────────────────────────────────────────────────────────┐
│              MODULE QUẢN TRỊ WEB                            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. Dashboard             → Tổng quan KPIs, cảnh báo        │
│  2. Quản lý Vendor        → KYC, trạng thái tài khoản       │
│  3. Quản lý Buyer         → Quản lý khách hàng B2B          │
│  4. Giám sát Giao dịch    → Theo dõi thanh toán             │
│  5. Giải quyết Tranh chấp → Dispute + Escrow                │
│  6. Quản lý Đối soát      → Chu kỳ & thanh toán Vendor      │
│  7. Kiểm duyệt Nội dung   → Products & Reviews              │
│  8. Cấu hình Hệ thống     → Platform parameters             │
│  9. Quản trị RBAC          → Roles & permissions            │
│  10. Nhật ký Kiểm toán    → Audit trail                     │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. KIẾN TRÚC HỆ THỐNG

### 3.1 Mô hình Kiến trúc Tổng quan

```
┌────────────────────────────────────────────────────────────────────┐
│                       TẦNG TRÌNH BÀY (FRONTEND)                    │
│   Web Admin (React) │ Web Vendor │ Web Buyer │ Mobile App          │
└───────────────────────────────┬────────────────────────────────────┘
                                │ REST API / GraphQL
┌───────────────────────────────┴────────────────────────────────────┐
│                       API GATEWAY                                  │
│            Authentication │ Rate Limiting │ Caching                │
└───────────────────────────────┬────────────────────────────────────┘
                                │
┌───────────────────────────────┴────────────────────────────────────┐
│                    BACKEND MICROSERVICES (10 services)             │
│  Auth │ User │ Order │ Payment │ KYC │ Escrow │ Settlement │...    │
└───────────────────────────────┬────────────────────────────────────┘
                                │
┌───────────────────────────────┴────────────────────────────────────┐
│                       TẦNG DỮ LIỆU                                 │
│       MySQL (Primary) │ Redis (Cache) │ Kafka (Events) │ S3        │
└────────────────────────────────────────────────────────────────────┘
```

### 3.2 Công nghệ Đề xuất

| Thành phần       | Công nghệ |
|------------      |-----------|
| Frontend         | React + TypeScript + Next.js + TailwindCSS |
| State Management | Zustand / Redux Toolkit + React Query |
| Backend          | Node.js (NestJS) hoặc Java (Spring Boot) |
| Database         | MySQL 8.0 + Redis |
| Message Queue    | Apache Kafka / RabbitMQ |
| Storage          | AWS S3 / MinIO |
| Auth             | JWT + Refresh Token + MFA (TOTP) |

---

## 4. CÁC NGHIỆP VỤ CỐT LÕI

### 4.1 Module 1: Xác thực & Phân quyền (RBAC)

**Mục đích:** Đảm bảo phân tách nhiệm vụ và nguyên tắc đặc quyền tối thiểu.

**Các vai trò Admin:**

| Vai trò              | Phạm vi quyền |
|---------             |---------------|
| **Super Admin**      | Toàn quyền hệ thống, bao gồm cấu hình và quản trị RBAC |
| **Operations Admin** | Vận hành: Vendor/Buyer, KYC, tranh chấp, kiểm duyệt |
| **Finance Admin**    | Tài chính: giao dịch, đối soát, xử lý hoàn tiền |
| **Compliance Admin** | Tuân thủ: audit logs, báo cáo quy định (chỉ xem) |

**Quy tắc bảo mật:**
- MFA bắt buộc cho mọi tài khoản Admin
- Phiên tự động đăng xuất sau 30 phút không hoạt động
- Mật khẩu tối thiểu 12 ký tự, có chữ hoa, thường, số, ký tự đặc biệt
- Tất cả đăng nhập (thành công/thất bại) được ghi log
- Tùy chọn hạn chế IP truy cập (IP whitelist)

---

### 4.2 Module 2: Đăng ký & Quản lý KYC Vendor

**Mục đích:** Đảm bảo chỉ nhà sản xuất nông nghiệp hợp pháp được tham gia nền tảng.

**Quy trình 4 bước:**
```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  Tạo tài    │───▶│ Thông tin   │───▶│ Tải lên     │───▶│ Nộp & chờ  │
│  khoản      │    │ doanh nghiệp│    │ tài liệu    │    │ xem xét     │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
                                                                │
                                                                ▼
                                              ┌─────────────────────────────────┐
                                              │      XEM XÉT CỦA ADMIN        │
                                              │  ┌─────────┐ ┌─────┐ ┌────────┐│
                                              │  │Phê duyệt│ │Từ chối│ │Yêu cầu ││
                                              │  └─────────┘ └─────┘ │bổ sung ││
                                              │                       └────────┘│
                                              └─────────────────────────────────┘
```

**Phân cấp xác minh theo Tier:**

| Tier         | Sản phẩm tối đa | Yêu cầu KYC | Hoa hồng |
|--------------|-----------------|-------------|----------|
| **BASIC**    | 50             | Giấy phép kinh doanh | 5% |
| **STANDARD** | 500            | + Chứng nhận thuế + Xác minh ngân hàng | 5% |
| **PREMIUM**  | Không giới hạn | + Chứng chỉ chất lượng (GAP, Organic...) | 5% |

**SLA:** Mọi đơn KYC phải được xem xét trong vòng 48 giờ.

---

### 4.3 Module 3: Bảng điều khiển (Dashboard)

**Mục đích:** Cung cấp cái nhìn tổng quan nền tảng theo thời gian thực.

**8 thẻ KPI chính:**
1. GMV (Giá trị hàng hóa tổng)
2. Hoa hồng nền tảng
3. Doanh thu ròng (sau hoàn tiền)
4. Vendor hoạt động (có GD trong 30 ngày)
5. Buyer hoạt động
6. Tỷ lệ thanh toán thành công
7. Tỷ lệ hoàn thành đơn hàng
8. Tỷ lệ tranh chấp

**3 mức cảnh báo:**

| Mức | Kích hoạt | Hành động |
|-----|-----------|-----------|
| 🔴 Nghiêm trọng | Phát hiện gian lận, sự cố hệ thống | Leo thang ngay lập tức |
| 🟡 Cảnh báo | Tranh chấp > 5%, giao trễ > 15% | Cần điều tra |
| 🔵 Thông tin | KYC chờ > 48h, hoạt động bất thường | Xem xét thường quy |

---

### 4.4 Module 4: Giám sát Giao dịch

**Mục đích:** Theo dõi mọi hoạt động tài chính, phát hiện bất thường.

**6 loại giao dịch:**
| Loại | Mô tả |
|------|-------|
| Thanh toán đơn hàng | Buyer thanh toán cho Vendor |
| Giải phóng Escrow   | Tiền chuyển cho Vendor sau khi hoàn thành |
| Khấu trừ hoa hồng   | Phí nền tảng (5%) |
| Hoàn tiền           | Hoàn toàn hoặc một phần |
| Thanh toán đối soát | Chuyển tiền cho Vendor định kỳ |
| Giữ Escrow          | Tiền bị giữ trong tranh chấp |

**Tích hợp 4 cổng thanh toán:** VNPay, MoMo, PayPal, Stripe

**Tính năng:** Real-time feed, bộ lọc nâng cao, phát hiện bất thường (giá trị cao, tần suất), xuất CSV/Excel.

---

### 4.5 Module 5: Giải quyết Tranh chấp & Escrow

**Mục đích:** Xử lý xung đột chất lượng/số lượng với cơ chế Escrow bảo vệ hai bên.

**Cơ chế Escrow:**
```
Buyer thanh toán → Tiền được GIỮ trong Escrow → Xác nhận nhận hàng → Giải phóng cho Vendor
                                              → Hoặc có tranh chấp → Admin phân xử
```

**5 loại tranh chấp:**
1. Vấn đề chất lượng (hư hỏng, sai giống)
2. Chênh lệch số lượng (thiếu hàng)
3. Sai sản phẩm (giao nhầm)
4. Vấn đề giao hàng (trễ, không giao)
5. Vấn đề đóng gói

**4 quyết định của Admin:**

| Quyết định | Hành động Escrow |
|------------        |------------------|
| Từ chối tranh chấp | 100% cho Vendor |
| Hoàn tiền một phần | Chia theo % (vd 30%/70%) |
| Hoàn tiền toàn bộ  | 100% cho Buyer |
| Hủy đơn hàng       | Hoàn tiền (trừ phí GD) |

**SLAs:**
- Phân công: 4 giờ sau khi nộp
- Phản hồi Vendor: 48 giờ
- Giải quyết: 72 giờ trước khi leo thang tự động

**Quy tắc:**
- Buyer phải nộp trong vòng 72 giờ sau khi giao hàng
- Cần ít nhất 1 ảnh bằng chứng
- Vendor có tỷ lệ tranh chấp > 5% sẽ bị đánh dấu

---

### 4.6 Module 6: Quản lý Đối soát & Thanh toán Vendor

**Mục đích:** Tính toán thanh toán Vendor tự động, minh bạch.

**Chu kỳ đối soát (mặc định):**
```
Chủ nhật 23:59 (Cắt) → Thứ Hai (Tính toán) → Thứ Tư (Thanh toán)
```

**Công thức tính:**
```
GMV Tổng
- Hoàn tiền
- Điều chỉnh
= GMV Ròng
- Hoa hồng (5%)
- Dự trữ Escrow (5%)
= Thanh toán Ròng cho Vendor
```

**6 trạng thái đối soát:**
Nháp → Đã tính → Đã chốt → Đang thanh toán → Đã thanh toán → Thất bại (nếu lỗi)

**Lưu ý:** Sau khi chốt, đối soát **không thể chỉnh sửa trực tiếp**.

---

### 4.7 Module 7: Kiểm duyệt Nội dung

**Mục đích:** Đảm bảo nội dung tuân thủ chính sách nền tảng.

**4 loại nội dung cần kiểm duyệt:**
- Danh sách sản phẩm
- Đánh giá & xếp hạng
- Hồ sơ Vendor
- Hình ảnh & phương tiện

**5 mức vi phạm:**

| Mức          | Ví dụ | Hành động |
|--------------|-------                            |-----------|
| Nghiêm trọng | Sản phẩm cấm, hàng bất hợp pháp   | Chấm dứt Vendor |
| Cao          | Thông tin sai lệch, chứng nhận giả| Tạm ngưng sản phẩm |
| Trung bình   | Nội dung không phù hợp, spam      | Yêu cầu chỉnh sửa |
| Thấp         | Lỗi format nhỏ                    | Cảnh báo |
| Thông tin    | Cần xem xét thêm                  | Đang chờ duyệt |

**Hỗ trợ tự động:** AI/keyword filter đánh dấu nội dung vi phạm trước khi vào hàng đợi Admin.

---

### 4.8 Module 8: Cấu hình Hệ thống

**Mục đích:** Cho phép Super Admin điều chỉnh tham số nền tảng qua giao diện, không cần deploy code.

**Nhóm cấu hình chính:**

| Nhóm       | Tham số                    | Mặc định |
|------|---------|----------|
| Hoa hồng   | Tỷ lệ nền tảng              | 5% |
| Hoa hồng   | Tỷ lệ đăng ký               | 3% |
| Đơn hàng   | Cửa sổ xác nhận             | 24 giờ |
| Đơn hàng   | Auto-cancel chưa thanh toán | 72 giờ |
| Tranh chấp | Cửa sổ nộp                  | 72 giờ |
| Tranh chấp | Phản hồi Vendor             | 48 giờ |
| Đối soát   | Chu kỳ                      | Hàng tuần          |
| Đối soát   | Dự trữ Escrow               | 5% |
| Vendor     | SLA xem xét KYC             | 48 giờ |

**Quy tắc:** Mọi thay đổi cấu hình được phiên bản hóa và audit log.

---

### 4.9 Module 9: Quản trị RBAC (Phân quyền)

**Mục đích:** Linh hoạt tạo/sửa vai trò và gán quyền.

**Pattern Permission:** `module:action` (ví dụ: `VND_MGMT:APPROVE`)

**Hỗ trợ:**
- Tạo vai trò tùy chỉnh
- Gán nhiều quyền cho vai trò
- Gán nhiều vai trò cho người dùng
- Phân quyền theo phạm vi (scope) - tùy chọn

---

### 4.10 Module 10: Nhật ký Kiểm toán

**Mục đích:** Ghi nhận mọi hành động nhạy cảm phục vụ tuân thủ quy định.

**Các sự kiện được log:**
- Xác thực (đăng nhập/đăng xuất, MFA, đổi MK)
- Quản lý người dùng (tạo, sửa, khóa, xóa)
- KYC (phân công, quyết định, truy cập tài liệu)
- Đơn hàng (thay đổi trạng thái, hủy)
- Thanh toán (khởi tạo, hoàn thành, hoàn tiền)
- Tranh chấp (mở, phản hồi, quyết định)
- Đối soát (tạo, chốt, thanh toán)
- Cấu hình (thay đổi tham số)
- Truy cập dữ liệu nhạy cảm

**Đặc điểm:**
- Bất biến (không thể sửa/xóa)
- Lưu giữ tối thiểu 5 năm
- Tìm kiếm toàn văn + bộ lọc nâng cao
- Xuất CSV để phân tích

---

## 5. MA TRẬN VAI TRÒ & QUYỀN

### 5.1 Tổng quan 4 Vai trò

| Vai trò | Mã | Phạm vi | Người dùng điển hình |
|---------|-----|--------|----------------------|
| Super Admin | `SUPER_ADMIN` | Toàn quyền | Chủ sở hữu, CTO |
| Operations Admin | `OPS_ADMIN` | Vận hành | Quản lý Vận hành |
| Finance Admin | `FIN_ADMIN` | Tài chính | Quản lý Tài chính |
| Compliance Admin | `COMP_ADMIN` | Tuân thủ | Nhân viên Compliance |

### 5.2 Ma trận Quyền Chi tiết

| Module | Quyền | SUPER | OPS | FIN | COMP |
|--------|-------|:-----:|:---:|:---:|:----:|
| **Dashboard** | Xem | ✅ | ✅ | ✅ | ✅ |
| **Vendor Mgmt** | Xem danh sách | ✅ | ✅ | Xem | Xem |
| | Phê duyệt/Từ chối | ✅ | ✅ | ❌ | ❌ |
| | Tạm khóa | ✅ | ✅ | ❌ | ❌ |
| | Chấm dứt | ✅ | ❌ | ❌ | ❌ |
| **KYC** | Xem xét | ✅ | ✅ | ❌ | ❌ |
| **Buyer Mgmt** | Xem danh sách | ✅ | ✅ | Xem | Xem |
| | Tạm khóa | ✅ | ✅ | ❌ | ❌ |
| **Transactions** | Xem | ✅ | ✅ | ✅ | ✅ |
| | Hoàn tiền | ✅ | ❌ | ✅ | ❌ |
| **Disputes** | Xem | ✅ | ✅ | ❌ | Xem |
| | Phân công/Quyết định | ✅ | ✅ | ❌ | ❌ |
| **Settlements** | Xem | ✅ | ❌ | ✅ | Xem |
| | Tạo/Chốt/Thanh toán | ✅ | ❌ | ✅ | ❌ |
| **Moderation** | Xem/Phê duyệt/Từ chối | ✅ | ✅ | ❌ | Xem |
| **Config** | Xem | ✅ | Xem | Xem | Xem |
| | Sửa | ✅ | ❌ | ❌ | ❌ |
| **RBAC** | Xem/Sửa | ✅ | ❌ | ❌ | Xem |
| **Audit Logs** | Xem/Xuất | ✅ | ❌ | ❌ | ✅ |

> **Ghi chú:** ✅ = Toàn quyền | Xem = Chỉ xem | ❌ = Không có quyền

---

## 6. SƠ ĐỒ TRẠNG THÁI TRỌNG YẾU

### 6.1 Vòng đời Tranh chấp (Dispute)

```
┌──────────┐    ┌─────────────┐    ┌──────────────┐    ┌──────────────┐
│  MỚI MỞ  │───▶│ CHỜ VENDOR  │───▶│ ĐANG XEM XÉT  │───▶│  ĐÃ GIẢI    │
│  (Buyer  │    │  phản hồi   │    │  (Admin đánh  │    │   QUYẾT     │
│   nộp)   │    │             │    │   giá)        │    │              │
└──────────┘    └─────────────┘    └──────┬───────┘    └──────────────┘
                                          │
                                          │ Cần thêm bằng chứng
                                          ▼
                                   ┌──────────────┐
                                   │ CẦN BỔ SUNG  │
                                   │  bằng chứng   │
                                   └──────┬───────┘
                                          │
                                          ▼
                                   (Quay lại ĐANG XEM XÉT)
```

### 6.2 Vòng đời Đối soát (Settlement)

```
┌──────┐    ┌─────────┐    ┌─────────┐    ┌──────────┐    ┌──────────┐
│ NHÁP │───▶│ ĐÃ TÍNH │───▶│ ĐÃ CHỐT │───▶│  ĐANG    │───▶│  ĐÃ      │
│      │    │         │    │(khóa sửa│    │ THANH TOÁN│   │ THANH TOÁN│
└──────┘    └─────────┘    └─────────┘    └──────────┘    └──────────┘
                                                 │
                                                 │ Lỗi
                                                 ▼
                                          ┌──────────┐
                                          │  THẤT BẠI │──▶ Retry/Hủy
                                          └──────────┘
```

### 6.3 Vòng đời Vendor

```
┌─────────────┐   ┌──────────────┐   ┌─────────────┐
│ CHỜ XEM XÉT │──▶│ CẦN BỔ SUNG  │──▶│ CHỜ XEM XÉT │ (lặp lại)
└──────┬──────┘   └──────────────┘   └─────────────┘
       │
       ▼
┌─────────────┐   ┌─────────────┐   ┌─────────────┐
│ĐƯỢC PHÊ DUYỆT│──▶│ BỊ TẠM KHÓA │──▶│ ĐƯỢC KÍCH   │
│             │   │             │   │ HOẠT LẠI    │──▶ Quay lại ĐÃ PHÊ DUYỆT
└─────────────┘   └─────────────┘   └─────────────┘
       │
       ▼
┌─────────────┐
│ BỊ CHẤM DỨT │ (vĩnh viễn)
└─────────────┘
```

---

## 7. QUY TRÌNH NGHIỆP VỤ END-TO-END

### 7.1 Quy trình Đơn hàng (Từ đầu đến cuối)

```
   BUYER                    PLATFORM                 VENDOR
     │                          │                        │
     ├──[1] Duyệt sản phẩm───▶│                        │
     │                          │                        │
     ├──[2] Thêm vào giỏ─────▶│                        │
     │                          │                        │
     ├──[3] Thanh toán────────▶├─[4] Giữ ESCROW───────▶│
     │                          │                        │
     │                          │◀────[5] Vendor nhận đơn┤
     │                          │                        │
     │                          │◀──[6] Xác nhận đơn─────┤
     │                          │                        │
     │                          │◀────[7] Chuẩn bị hàng─┤
     │                          │                        │
     │                          │◀─[8] Giao hàng (QR)───┤
     │                          │                        │
     ├──[9] Xác nhận nhận────▶├─[10] Giải phóng Escrow▶│
     │                          │                        │
     │                          ├─[11] Tính đối soát───▶│
     │                          │                        │
     │                          ├─[12] Thanh toán Vendor▶│
```

### 7.2 Quy trình Giải quyết Tranh chấp

```
   BUYER              ADMIN                VENDOR           PLATFORM
     │                  │                    │                  │
     ├─[1] Nộp tranh   │                    │                  │
     │   chấp + ảnh───▶│                    │                  │
     │                  ├─[2] Phân công─────▶│                  │
     │                  ├─[3] Thông báo─────▶│                  │
     │                  │                    ├─[4] Phản hồi───▶│
     │                  │◀───────────────────┤                  │
     │                  ├─[5] Đánh giá       │                  │
     │                  ├─[6] Quyết định (Từ chối/Hoan 1 phần/Hoan toàn)│
     │                  ├─[7] Thông báo──────────────────────▶│
     │                  ├─[8] Thực hiện Escrow───────────────▶│
     │                  ├─[9] Cập nhật điểm Vendor──────────▶│
```

---

## 8. KPIs & SLA CAM KẾT

### 8.1 KPIs Hiệu suất Nền tảng

| KPI | Mục tiêu | Ngưỡng cảnh báo |
|-----|----------|-----------------|
| Tăng trưởng GMV (so với tháng trước) | +10% | < 0% |
| Tỷ lệ thanh toán thành công | > 98% | < 95% |
| Tỷ lệ hoàn thành đơn hàng | > 95% | < 90% |
| Tỷ lệ tranh chấp | < 2% | > 5% |
| Thời gian xem xét KYC | < 24h | > 48h |
| Thời gian giải quyết tranh chấp | < 72h | > 96h |

### 8.2 SLAs Cam kết (Service Level Agreements)

| Hoạt động | SLA | Hậu quả khi vi phạm |
|-----------|-----|---------------------|
| **Xem xét KYC** | 48 giờ | Cảnh báo → Leo thang Super Admin |
| **Phân công tranh chấp** | 4 giờ | Cảnh báo tự động |
| **Phản hồi Vendor cho tranh chấp** | 48 giờ | Tự động chuyển Admin phán quyết |
| **Giải quyết tranh chấp** | 72 giờ | Leo thang tự động lên cấp cao hơn |
| **Thanh toán đối soát** | Thứ Tư hàng tuần | Cảnh báo Finance Admin + Slack alert |
| **Xử lý thanh toán thất bại** | Retry 3 lần trong 24h | Thông báo + escalation |

---

## 9. YÊU CẦU PHI CHỨC NĂNG

### 9.1 Hiệu năng (Performance)

| Chỉ số | Mục tiêu |
|--------|----------|
| Thời gian load trang (P95) | < 2 giây |
| Thời gian phản hồi API (P95) | < 500ms |
| Time to Interactive | < 3 giây |
| First Contentful Paint | < 1.5 giây |
| Refresh Dashboard | < 5 giây |

### 9.2 Khả năng Mở rộng (Scalability)

| Chỉ số | Mục tiêu |
|--------|----------|
| Số người dùng đồng thời | 500 |
| Giao dịch/giây | 100 |
| API requests/giây | 1000 |

### 9.3 Tính khả dụng (Availability)

| Chỉ số | Mục tiêu |
|--------|----------|
| Uptime | 99.9% |
| Bảo trì có kế hoạch | < 4 giờ/tháng |
| RTO (Recovery Time) | < 1 giờ |
| RPO (Recovery Point) | < 15 phút |

### 9.4 Bảo mật (Security)

| Yêu cầu | Triển khai |
|----------|------------|
| Authentication | JWT (15 phút) + Refresh Token (7 ngày) |
| MFA | Bắt buộc cho Admin, hỗ trợ TOTP |
| Mã hóa dữ liệu | TLS 1.3 in-transit, AES-256 at-rest |
| Phiên timeout | 30 phút không hoạt động |
| Rate limiting | 100 requests/phút/người dùng |
| Audit logging | Tất cả hành động nhạy cảm, bất biến |

### 9.5 Hỗ trợ trình duyệt

| Trình duyệt | Phiên bản |
|-------------|-----------|
| Chrome | 2 phiên bản gần nhất |
| Firefox | 2 phiên bản gần nhất |
| Safari | 2 phiên bản gần nhất |
| Edge | 2 phiên bản gần nhất |

---

## 10. KẾT LUẬN & KHUYẾN NGHỊ

### 10.1 Điểm Mạnh của Thiết kế

| Điểm mạnh | Ý nghĩa |
|-----------|---------|
| **Phân tách nhiệm vụ rõ ràng** | 4 vai trò Admin độc lập giúp giảm rủi ro gian lận nội bộ |
| **Cơ chế Escrow tự động** | Bảo vệ thanh toán xuyên suốt vòng đời đơn hàng |
| **KYC phân cấp theo Tier** | Tạo đường thăng tiến cho Vendor, cân bằng rủi ro |
| **Audit log bất biến** | Đáp ứng yêu cầu tuân thủ quy định quốc tế |
| **Cấu hình qua UI** | Không cần deploy code khi điều chỉnh nghiệp vụ |
| **API RESTful có phiên bản** | Dễ tích hợp với hệ thống bên ngoài |

### 10.2 Rủi ro Cần Quan tâm

| Rủi ro | Tác động | Khuyến nghị giảm thiểu |
|--------|----------|------------------------|
| Khối lượng tranh chấp tăng cao | SLA giải quyết bị ảnh hưởng | Tự động phân công theo chuyên môn Admin |
| Vendor gian lận hàng loạt | Uy tín nền tảng | AI scoring + Auto-suspend khi vượt ngưỡng |
| Lỗi gateway thanh toán | Tiền bị kẹt | Retry logic + Fallback gateway + Alert real-time |
| Thay đổi quy định | Phải update cấu hình | Thiết kế config linh hoạt + Versioning |
| Tăng trưởng nhanh | Hệ thống quá tải | Microservices + Auto-scaling + Cache layer |

### 10.3 Khuyến nghị Triển khai

**Phase 1 - MVP (3 tháng):**
- Module 1: Xác thực & RBAC
- Module 2: KYC Vendor
- Module 3: Dashboard cơ bản
- Module 4: Giám sát giao dịch

**Phase 2 - Vận hành (3 tháng):**
- Module 5: Tranh chấp & Escrow
- Module 6: Đối soát
- Module 7: Kiểm duyệt nội dung

**Phase 3 - Hoàn thiện (3 tháng):**
- Module 8: Cấu hình hệ thống
- Module 9: Quản trị RBAC nâng cao
- Module 10: Audit log nâng cao + Báo cáo

### 10.4 Câu hỏi Thảo luận Đề xuất

Khi thảo luận với đồng nghiệp, các câu hỏi sau nên được làm rõ:

| STT | Câu hỏi |
|-----|---------|
| 1 | Có cần thêm vai trò **Vendor Manager** riêng biệt (chỉ quản lý Vendor)? |
| 2 | Tỷ lệ **hoa hồng 5%** đã phù hợp với thị trường B2B nông sản Việt Nam chưa? |
| 3 | Có nên cho phép **multi-currency** (VND/USD) ngay từ Phase 1? |
| 4 | **Chu kỳ đối soát** nên là hàng tuần hay 2 tuần cho giai đoạn đầu? |
| 5 | **Dự trữ Escrow 5%** có cần điều chỉnh theo tier Vendor không? |
| 6 | Có cần tích hợp **Thẻ tín dụng doanh nghiệp** (corporate card)? |
| 7 | **SLA 72 giờ** giải quyết tranh chấp có khả thi cho đội ngũ VN? |
| 8 | Có cần module **Quản lý Kho (Inventory)** riêng cho Admin? |
| 9 | Phương thức **MFA** nào phù hợp: TOTP app, SMS, hay Email? |
| 10 | Có cần **AI moderation** từ giai đoạn đầu hay chỉ dùng keyword filter? |

---

## PHỤ LỤC: BẢNG CHÚ GIẢI THUẬT NGỮ

| Thuật ngữ | Tiếng Anh | Định nghĩa |
|-----------|-----------|------------|
| KYC | Know Your Customer | Quy trình xác minh danh tính khách hàng |
| RBAC | Role-Based Access Control | Kiểm soát truy cập dựa trên vai trò |
| MFA | Multi-Factor Authentication | Xác thực đa yếu tố |
| B2B | Business-to-Business | Giao dịch giữa doanh nghiệp |
| GMV | Gross Merchandise Value | Tổng giá trị hàng hóa giao dịch |
| SLA | Service Level Agreement | Cam kết mức dịch vụ |
| Escrow | - | Cơ chế giữ tiền an toàn qua bên thứ ba |
| Settlement | - | Quy trình đối soát & thanh toán Vendor |
| Tier | - | Cấp độ phân hạng (Basic/Standard/Premium) |
| MOQ | Minimum Order Quantity | Số lượng đặt hàng tối thiểu |
| P95 | 95th Percentile | Phân vị thứ 95 (chỉ số hiệu năng) |

---

---

*Tài liệu này là bản tóm tắt để thảo luận. Để biết chi tiết đầy đủ (API specs, UI specs, state machines, mô hình dữ liệu), tham khảo tài liệu đặc tả kỹ thuật: `KAGGRI-TRADE-Admin-Business-Operations-v2.md`*
