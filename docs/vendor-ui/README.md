# Bản mẫu Web Vendor · Kaggri-Trade

Mở [index.html](index.html) trong trình duyệt. Bản mẫu dùng HTML/CSS/JavaScript thuần, chạy bằng tệp cục bộ, không cần cài package. Mọi số liệu và tên Buyer là ví dụ; thay đổi chỉ tồn tại trong phiên đang mở và mất khi tải lại.

## Hướng thiết kế

- Màu lấy từ `E:\edge-downloads\Untitled.pdf`: trắng, xanh lá đậm, xanh mint nhạt; vàng cho việc cần chú ý và đỏ cho lỗi/tranh chấp.
- Một màn hình có **một CTA chính**. Các đường dẫn phụ chỉ giúp xem chi tiết hoặc quay lại.
- Chỉ hiển thị thông tin giúp Vendor quyết định việc tiếp theo. Tổng quan ưu tiên đơn cần xác nhận; chi tiết đơn ưu tiên xác nhận hoặc cập nhật giao hàng.
- Một hộ kinh doanh do một chủ trang trại vận hành dùng một tài khoản Vendor. Thông tin hộ kinh doanh để xét duyệt được tách khỏi tên trang trại hiển thị cho Buyer.

## Màn hình và CTA chính

| Màn hình | CTA chính |
|---|---|
| Tổng quan | Xử lý đơn cần xác nhận |
| Sản phẩm của tôi | + Thêm sản phẩm; mỗi dòng có Sửa, Hiện/Ẩn, Xóa |
| Đăng bán nông sản | Đăng bán sản phẩm; nếu chưa có hàng có thể chọn Lưu bản nháp |
| Sửa sản phẩm | Lưu thay đổi |
| Tồn kho | Ghi nhận nhập kho |
| Lô thu hoạch | Tạo lô thu hoạch |
| Nguồn cung dự kiến | Thêm kế hoạch thu hoạch |
| Đơn hàng | Xử lý đơn chờ xác nhận |
| Chi tiết đơn | Xác nhận có thể giao / Cập nhật giao hàng theo trạng thái |
| Giao hàng | Cập nhật đơn sắp giao |
| Đơn định kỳ | Xác nhận lịch cung ứng |
| Khiếu nại | Phản hồi khiếu nại |
| Đối soát | Tải bảng đối soát |
| Báo cáo | Tải báo cáo tháng |
| Hồ sơ hộ kinh doanh | Lưu thông tin hiển thị |
| Thông báo | Xem việc cần làm |
| Đăng ký bán hàng | Gửi hồ sơ bán hàng; có mục riêng trong menu Tài khoản hoặc `#onboarding` |

Mục **Đăng bán nông sản** nằm ở nhóm **Bắt đầu** đầu menu. Biểu mẫu gồm tên, nhóm hàng, ảnh nông sản, nơi trồng, giá/kg, lượng đặt tối thiểu, hàng sẵn bán và trạng thái hiển thị. Vendor chọn đã có hay chưa có giấy kiểm nghiệm; nếu đã có, tải ảnh/PDF giấy kiểm nghiệm. Giấy mới tải ở trạng thái **chờ xác minh**, chưa tự nhận là “đã đạt”. Nếu đăng bán ngay, bản mẫu kiểm tra ảnh và lượng sẵn bán; hàng chưa có được lưu nháp và quản lý ở Nguồn cung dự kiến. Danh sách sản phẩm có bộ lọc, nút hiện/ẩn và xóa. Sản phẩm đã có đơn, lô, nguồn cung hoặc tồn kho không thể xóa; Vendor có thể ẩn để ngừng bán. Sản phẩm xóa trong bản mẫu được đánh dấu thay vì xóa dữ liệu gốc.

Mục **Đăng ký bán hàng** cũng nằm ở nhóm **Bắt đầu**. Màn hình dành cho hộ kinh doanh đã có giấy chứng nhận. Kaggri-Trade chỉ tiếp nhận thông tin và xét duyệt tài khoản bán trên nền tảng; màn hình này không thực hiện thủ tục đăng ký hộ kinh doanh với cơ quan nhà nước. Khi triển khai thật, mục đăng ký chỉ hiển thị trước khi Vendor được duyệt.

## Ranh giới của bản mẫu

- Nút lưu và cập nhật thay đổi dữ liệu minh họa trong bộ nhớ trình duyệt. Tải lại trang sẽ khôi phục mẫu ban đầu.
- CSV tải về là dữ liệu mẫu, không phải báo cáo tài chính thực.
- Chưa kết nối đăng nhập, phân quyền, tải tệp, thanh toán, QR hoặc API. Các hành động có rủi ro nghiệp vụ cần được backend kiểm tra trước khi triển khai thật.
- Quy tắc đơn đặt trước, hạn phản hồi khiếu nại, phí và đối soát vẫn cần được nhóm chốt theo [phân tích Vendor](../vendor-screens-usecases.md).
