# Kaggri-Trade · Bản mẫu giao diện tích hợp

Chạy static server tại thư mục `docs` để các trang dùng chung phiên đăng nhập:

```powershell
cd docs
python -m http.server 8080
```

Mở `http://localhost:8080/` trong trình duyệt. Các màn hình dùng HTML/CSS/JavaScript thuần, không cần cài package.

- Trang chủ: `vendor-ui/home.html` (dùng chung cho khách và Buyer).
- Chi tiết sản phẩm và luồng mua: `kaggri-trade-html-prototype/index.html#b02`.
- Kênh Vendor: `vendor-ui/index.html#overview`.
- Đăng nhập/đăng ký mô phỏng: `auth.html`.

Khách có thể xem trang chủ và chi tiết sản phẩm. Khi bấm **Thêm vào giỏ** hoặc **Mua ngay**, trang chuyển sang đăng nhập/đăng ký và tự tiếp tục thao tác sau khi chọn role Buyer. Role Vendor đi tới kênh bán; role Buyer trở về trang chủ. Vai trò chỉ lưu trong `sessionStorage` của tab hiện tại.

Đây là prototype tĩnh. Form đăng nhập không xác thực tài khoản, không có backend/API, và dữ liệu Buyer/Vendor vẫn là dữ liệu mẫu độc lập của hai bộ giao diện. Khi triển khai thật cần có xác thực phía server, phân quyền và nguồn dữ liệu chung.
