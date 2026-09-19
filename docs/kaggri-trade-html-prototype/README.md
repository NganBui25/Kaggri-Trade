# Kaggri Trade — HTML/CSS/JS Prototype

Frontend prototype thuần, không có backend.

## Cách chạy
- Có thể mở trực tiếp `index.html` bằng trình duyệt.
- Hoặc chạy static server bất kỳ, ví dụ:
  - `python -m http.server 8080`
  - sau đó mở `http://localhost:8080`

## Kiểm tra nhanh
- Chạy `node tests/smoke.js` để kiểm tra business data, 11 screen/route, trả trước, hoàn tiền, COD, công nợ B2B và đơn đặt trước theo sản lượng tương lai.

## Flow chính
- Trả trước: B02 Product Detail → B04 Checkout → B05 Payment Method → B06 Processing → B07 Failed / B08 Expired / B09 Success → B10A Waiting Supplier Confirmation → B10 Order Detail.
- Trả sau: B02 → B04 → B05 → B10A → B10. COD thu khi giao; công nợ B2B dùng hạn mức mock và kỳ hạn NET 15 từ ngày phát hành hóa đơn.
- Đặt trước theo kế hoạch: B02 → B04 chọn `PREORDER` và ngày cần hàng → B10A để NCC cam kết toàn bộ VendorOrder → B05 chỉ thanh toán VendorOrder được chấp nhận → B06/B09 → B10. Tồn hiện tại không giới hạn số lượng đặt trước.
- Nếu NCC từ chối VendorOrder đã trả trước, prototype ghi nhận chờ hoàn đúng giá trị VendorOrder đó. COD/công nợ chỉ phát sinh trên VendorOrder được chấp nhận.

## File
- `index.html`
- `css/style.css`
- `js/data.js`
- `js/helpers.js`: định dạng, tính toán và truy xuất dữ liệu dùng chung.
- `js/components.js`: các component HTML dùng lại giữa nhiều màn hình.
- `js/screens.js`: render B02–B10.
- `js/app.js`: state, hash routing và các action tương tác.
- `tests/smoke.js`: smoke test không cần thư viện ngoài.

## Ghi chú
- Toàn bộ dữ liệu là mock data trong `js/data.js`.
- Địa chỉ nhận hàng dùng `recipientName` / `recipientPhone` / `receivingAddress`, tương tự sổ địa chỉ giao hàng và không giả định Buyer có kho.
- `preorderDate` là ngày Buyer cần hàng theo kế hoạch, không phải ETA giao thực tế. ETA vẫn chỉ xuất hiện sau khi có dữ liệu mock từ đối tác 3PL.
- Không có API, database, đăng nhập thật hoặc cổng thanh toán thật.
- Các nút mô phỏng ở B06/B10A chỉ phục vụ prototype.

## Nguồn ảnh demo
- Ảnh được lưu local tại `assets/products/` để prototype chạy được khi mở trực tiếp `index.html`.
- Ảnh sản phẩm chính: `image.png` do nhà cung cấp cung cấp cho prototype.
- Thu hoạch bắp cải: Denniz Futalan / Pexels — https://www.pexels.com/photo/farmer-with-cabbages-in-box-18717519/
- Bắp cải tại vùng trồng: Alexander Paramonov / Pexels — https://www.pexels.com/photo/green-cabbage-in-a-farm-8524094/
- Sơ chế và đóng thùng rau: Mark Stebnicki / Pexels — https://www.pexels.com/photo/a-person-in-gray-long-sleeves-putting-the-broccoli-in-a-box-11678433/
- Tập kết nông sản lên xe tại ruộng: Mark Stebnicki / Pexels — https://www.pexels.com/photo/farmers-harvesting-broccolis-in-the-farm-11678443/
