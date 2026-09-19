# Phân tích màn hình và use case Buyer của Kaggri-Trade

## Căn cứ và phạm vi

- **Kế hoạch phân công vai trò v1.4**, mục “Như – Web Frontend Developer” và ma trận module: xác nhận phạm vi Web Buyer gồm tìm kiếm/lọc, hồ sơ Vendor, giỏ theo Vendor, checkout, payment return, order tracking, subscription, dispute và báo cáo mua hàng. Tài liệu cũng giao Mobile cho tác vụ giao nhận, QR và thông báo.
- **SRS Kaggri-Trade v1.0 (bản dự thảo tại `tmp/srs_kaggri_trade.html`)**: tham chiếu các yêu cầu FR-IAM, FR-SEA, FR-CART, FR-ORD, FR-SUB, FR-PAY, FR-DEL, FR-DIS, FR-RAT và FR-REP. Bản dự thảo tách Buyer Member/Manager; quyết định sản phẩm hiện tại của người dùng là **một Buyer chỉ có một tài khoản**, nên bản phân tích này dùng một vai trò Buyer. Ký hiệu M/S theo mức Must-have/Should-have của SRS.
- Đây là **đề xuất kiến trúc màn hình** suy ra từ yêu cầu, chưa phải danh sách route hay thiết kế UI đã được phê duyệt. Một use case có thể đi qua nhiều màn hình; một màn hình có thể phục vụ nhiều use case.

## Vai trò và ranh giới quyền

**Khách chưa đăng nhập** có thể xem catalog công khai, tìm kiếm và đăng ký. Sau khi đăng ký/đăng nhập, người dùng là **Buyer** và có thể mua hàng, quản lý đơn định kỳ, hồ sơ và báo cáo của chính tài khoản đó. Nếu bên mua là tổ chức, tên tổ chức và thông tin liên hệ/nhận hàng nằm trong hồ sơ Buyer; không có nhiều tài khoản thành viên trong một tổ chức. Backend vẫn phải kiểm tra quyền sở hữu dữ liệu của tài khoản Buyer.

## Danh sách màn hình đề xuất

| Nhóm | Màn hình Web Buyer | Nghiệp vụ chính | Vai trò | Ưu tiên / căn cứ |
|---|---|---|---|---|
| Tài khoản | Đăng ký Buyer; đăng nhập; khôi phục mật khẩu | Tạo và truy cập tài khoản Buyer duy nhất của bên mua | Khách/Buyer | M · FR-IAM-001/003 |
| Khám phá | Trang chủ/catalog và kết quả tìm kiếm | Tìm, lọc sản phẩm theo danh mục, giá, Vendor, khu vực, thuộc tính | Khách/Buyer | M · FR-SEA-001/002 |
| Khám phá | Chi tiết sản phẩm | Xem thông tin công khai, giá, thuộc tính, nguồn gốc và chọn số lượng | Khách/Buyer | M · FR-CAT-004, FR-CART-001; màn hình suy ra |
| Khám phá | Hồ sơ Vendor | Xem nhà cung cấp; Vendor Score và giải thích điểm khi chức năng này được chốt | Khách/Buyer | S · FR-SEA-003; điểm còn TBD |
| Mua hàng | Giỏ hàng theo Vendor | Thêm, sửa, xóa sản phẩm; xem nhóm hàng theo Vendor | Buyer | M · FR-CART-001 |
| Mua hàng | Checkout | Chọn thông tin giao nhận, xem MOQ/giá/tồn cập nhật, tổng tiền và xác nhận; một lần checkout sinh parent order và sub-order | Buyer | M · FR-CART-002/003/004, UC-01 |
| Thanh toán | Chuyển sang cổng thanh toán và trang kết quả | Thanh toán sandbox; hiển thị kết quả return URL và trạng thái đã xác minh | Buyer | M · FR-PAY-002; kế hoạch Web Buyer |
| Thanh toán | Lịch sử giao dịch | Xem giao dịch của tài khoản Buyer | Buyer | M · FR-PAY-005 |
| Đơn hàng | Danh sách đơn và chi tiết parent/sub-order | Xem trạng thái, từng Vendor Order, lịch sử và hủy khi trạng thái/quyền cho phép | Buyer | M · FR-ORD-001/005/006 |
| Giao nhận | Theo dõi giao hàng; xác nhận nhận hàng | Theo dõi từng sub-order; xác nhận số lượng và chất lượng | Buyer | M · FR-DEL-003/004 |
| Đơn định kỳ | Danh sách, tạo và chi tiết subscription/lịch giao | Tạo, xem kỳ sắp tới, tạm dừng, tiếp tục, bỏ kỳ hoặc hủy trước hạn chốt | Buyer | S · FR-SUB-001/003/005; chính sách giá còn TBD |
| Sau bán | Danh sách và biểu mẫu khiếu nại; chi tiết xử lý | Mở dispute theo sub-order, khai lý do/số lượng/bằng chứng, theo dõi quyết định và refund | Buyer | S · FR-DIS-001/002/005 |
| Sau bán | Đánh giá Vendor Order | Đánh giá đơn đã hoàn thành | Buyer | S · FR-RAT-001 |
| Hồ sơ Buyer | Hồ sơ người mua | Cập nhật thông tin cá nhân hoặc tổ chức, liên hệ và địa chỉ nhận hàng | Buyer | M · FR-ORG-001; màn hình suy ra |
| Phân tích | Dashboard/báo cáo mua hàng | Xem chi tiêu theo kỳ, Vendor, sản phẩm và độ ổn định nguồn cung của tài khoản | Buyer | S · FR-REP-002; lọc kỳ theo FR-REP-001 |
| Dùng chung | Trung tâm thông báo | Xem thay đổi đơn, giao nhận, subscription, dispute; mở nội dung liên quan | Buyer | Suy ra từ module Notification và kế hoạch Mobile; cần chốt kênh Web |

**Mobile Buyer:** Theo kế hoạch, Mobile tập trung vào danh sách/chi tiết Vendor Order, theo dõi giao nhận, quét QR khi nhận, nhập số lượng/chất lượng, chụp bằng chứng và thông báo. Đây là các màn hình di động của cùng nghiệp vụ; không nên mặc định nhân bản toàn bộ Web Buyer lên Mobile.

## Sơ đồ use case UML

Xem [sơ đồ SVG](buyer-usecase.svg) và [mã PlantUML](buyer-usecase.puml). Hình thể hiện mục tiêu của Buyer, không coi mỗi màn hình là một use case. `<<include>>` dùng cho kiểm tra giá/MOQ/tồn và tách sub-order khi checkout; `<<extend>>` dùng cho tình huống khiếu nại sau giao nhận.

## Các điểm cần xác nhận trước khi chốt UI

1. Cập nhật SRS và ma trận quyền: bỏ Buyer Member/Manager, quyền quản lý thành viên và luồng mời thành viên; xác định quan hệ một tài khoản Buyer với một hồ sơ bên mua.
2. Chính sách giá theo kỳ và hạn chót sửa/bỏ kỳ subscription.
3. Thời gian giữ tồn, thời hạn hủy và thời hạn mở dispute.
4. Cổng thanh toán sandbox và khả năng partial refund.
5. Công thức Vendor Score và cách giải thích điểm trên hồ sơ Vendor.

## Đề xuất bổ sung cho hàng nông sản hư/dập khi nhận

Màn hình **xác nhận nhận hàng** cần phân biệt “đã nhận” và “đã kiểm chất lượng”. Buyer nhập số lượng theo từng item/lô, đánh dấu phần hỏng/thiếu, chụp ảnh kiện hàng và phần ảnh hưởng. Màn hình **khiếu nại** cho phép yêu cầu hoàn tiền phần hỏng, hoàn toàn bộ item nếu không dùng được, hoặc giao bù khi hai bên đồng ý; tín dụng cho đơn sau chỉ khi Buyer chọn. Không mặc định bắt gửi trả nông sản dễ hư. Khiếu nại có thời hạn rõ ràng, mã theo dõi và quyết định có lý do; chi tiết chính sách đề xuất ở [phân tích Vendor](vendor-screens-usecases.md#8-đề-xuất-bảo-vệ-buyer-khi-nông-sản-giao-đến-bị-hưdập).
