# Đề xuất tích hợp đơn vị vận chuyển cho Kaggri-Trade

## 1. Phạm vi và quyết định thiết kế

Tài liệu này **đề xuất mở rộng**, chưa phải chức năng hoặc hợp đồng API đã triển khai. SRS hiện tại chỉ yêu cầu Vendor cập nhật giao hàng, Buyer theo dõi từng Vendor Order và xác nhận số lượng/chất lượng khi nhận (FR-DEL-001..005). SRS cũng loại trừ tự vận hành logistics và tối ưu tuyến đường trong PBL6. Vì vậy, hệ thống nên kết nối một đơn vị vận chuyển qua lớp adapter, không tự điều phối tài xế.

- Một checkout tạo Parent Order và một Vendor Order cho mỗi Vendor. Mỗi Vendor Order có ít nhất một `Shipment`; mặc định **một Vendor Order = một kiện/vận đơn**. Nếu phải chia nhiều kiện hoặc ngày giao, tạo nhiều Shipment và báo lại tổng phí trước khi Buyer thanh toán.
- Với nhiều ngày giao trong cùng một Vendor Order, tạo `DeliveryBatch` cho từng tổ hợp **Vendor Order + địa chỉ nhận + ngày giao + dịch vụ**; mỗi batch có một hoặc nhiều Shipment. Mỗi Order Item (hoặc phần số lượng của item) được gắn đúng một batch. Một lần đặt hàng không buộc tất cả batch giao cùng ngày.
- Địa chỉ lấy hàng là địa chỉ Vendor đã xác minh; địa chỉ nhận là địa chỉ Buyer chọn. Tính phí riêng cho từng Shipment vì nơi lấy, khối lượng và thời điểm giao có thể khác nhau.
- Buyer trả mức phí vận chuyển đã xác nhận cho từng DeliveryBatch. **Vendor chịu toàn bộ phí hoàn hàng và chênh lệch giữa cước hãng thực tế với cước hãng dự kiến**; Buyer không bị thu thêm sau khi đã xác nhận phí. Phí hàng và phí vận chuyển phải hiển thị riêng. Quy tắc miễn/giảm phí hoặc trợ giá là cấu hình riêng; không làm thay đổi giá gốc từ hãng.
- Chỉ tạo vận đơn khi Vendor đã xác nhận đơn, hàng sẵn sàng và thanh toán theo chính sách đã hoàn tất. Với đặt trước, báo giá vận chuyển tại checkout chỉ là ước tính nếu ngày xuất hàng còn xa; Buyer xác nhận mức phí cuối cùng khi batch đến hạn chốt và trước khi thu tiền.
- Nếu Vendor tự giao hoặc khu vực không có hãng phù hợp, dùng phương thức `SELF_DELIVERY` với bảng phí và SLA công bố riêng; không giả lập mã vận đơn của hãng.

### Lựa chọn giao hàng

Giao diện tách **điều kiện bảo quản** khỏi **tốc độ giao**. Điều kiện bảo quản gồm `thường` (ambient), `mát` (chilled) và `đông lạnh` (frozen); tốc độ gồm `tiêu chuẩn` và `hỏa tốc`. Đây là các nhãn sản phẩm; dịch vụ thực tế phụ thuộc vào hãng, tuyến, ngày lấy hàng và hợp đồng. Không mặc định mọi tổ hợp đều có sẵn, ví dụ `đông lạnh + hỏa tốc` chỉ xuất hiện nếu có hãng đáp ứng.

Vendor khai báo yêu cầu bảo quản của sản phẩm, hệ thống xác minh theo chính sách sản phẩm và lọc các dịch vụ đáp ứng nhiệt độ/giới hạn thời gian vận chuyển trước khi hiển thị cho Buyer. Buyer được chọn tốc độ và chọn điều kiện bảo quản cao hơn nếu hãng hỗ trợ, nhưng không được hạ thấp dưới yêu cầu tối thiểu. Hàng cần bảo quản khác nhau phải tách kiện/batch nếu hãng không cho ghép chung. Mỗi lựa chọn hiển thị **phí, khoảng thời gian dự kiến, điều kiện nhiệt độ và hạn chốt đơn**; nếu không có dịch vụ đáp ứng thì không nhận đơn với lựa chọn đó.

## 2. Cách tính và chốt phí

**Dữ liệu đầu vào mỗi Shipment:** địa chỉ lấy/nhận đã chuẩn hóa theo mã vùng của hãng, dịch vụ, ngày dự kiến lấy/giao, giá trị hàng để khai giá, số kiện, khối lượng đóng gói, kích thước từng kiện, yêu cầu bảo quản và thu hộ (nếu có). Khối lượng sản phẩm trong đơn không thay thế khối lượng kiện đã đóng gói.

1. Backend tính khối lượng thực của kiện: `W_thực = tổng khối lượng hàng + bao bì`. Gửi cả `W_thực` và kích thước kiện cho hãng; hãng quyết định khối lượng tính cước theo quy tắc của dịch vụ (`max(W_thực, W_quy_đổi)` nếu hãng dùng khối lượng thể tích). Không hardcode hệ số quy đổi thể tích khi chưa ký hợp đồng với hãng.
2. `Quote` từ hãng gồm phí cơ bản và phụ phí có mã, ví dụ vùng xa, nhiên liệu, bảo hiểm/khai giá, xử lý hàng dễ hỏng và thu hộ. Hệ thống lưu từng cấu phần, tiền tệ, mã dịch vụ, thời hạn hiệu lực và payload tham chiếu. Chỉ cộng phụ phí mà hãng thực sự trả về hoặc chính sách nội bộ đã công bố.
3. `Phí vận chuyển Buyer trả = phí hãng đã gồm phụ phí + phí xử lý nội bộ được công bố - trợ giá/khuyến mãi`. Tối thiểu bằng 0; thuế chỉ cộng theo chứng từ và cấu hình thuế áp dụng, tránh cộng hai lần nếu quote đã gồm thuế.
4. `Tổng checkout = tổng tiền hàng của các Vendor Order + tổng phí vận chuyển Buyer trả của các Shipment - giảm giá hàng`, theo quy tắc phân bổ giảm giá đã công bố. Lưu snapshot của quote và phí Buyer đã chấp nhận vào Order/Shipment lúc xác nhận checkout; không tính lại từ cấu hình mới khi hiển thị đơn cũ.
5. Trước khi chuyển thanh toán, kiểm tra quote còn hạn và đầu vào chưa đổi (địa chỉ, số lượng, kiện, ngày, dịch vụ). Nếu thay đổi, báo giá lại và yêu cầu Buyer xác nhận tổng mới. Không âm thầm tăng tiền sau khi Buyer đã trả.
6. Khi đóng gói và tạo vận đơn, `variance = carrier_actual_fee - carrier_estimated_fee`. Buyer giữ nguyên `buyer_shipping_fee` đã xác nhận. `variance > 0` ghi nợ Vendor; `variance < 0` ghi có cho Vendor khi đối soát. Phí hoàn hàng do hãng tính được ghi riêng `return_shipping_fee` và ghi nợ Vendor. Ghi đủ `buyer_shipping_fee`, `carrier_estimated_fee`, `carrier_actual_fee`, `subsidy`, `variance` và `return_shipping_fee` để đối soát; không trừ lẫn vào tiền hàng hay phí tranh chấp chất lượng.

**Ví dụ minh họa (số giả định):** Vendor A: quote 35.000đ, Buyer trả 35.000đ. Vendor B: quote 52.000đ, trợ giá 12.000đ, Buyer trả 40.000đ. Tổng phí vận chuyển checkout là **75.000đ**, dù tổng chi phí dự kiến trả hãng là **87.000đ**. Đơn cha hiển thị tổng, từng Vendor Order hiển thị phần phí của mình.

**Ví dụ nhiều ngày giao:** Buyer đặt cùng lúc 20 kg rau từ Vendor A giao ngày 20/09 và 30 kg trái cây từ Vendor B giao ngày 25/09. Hệ thống tạo một Parent Order, hai Vendor Order, hai DeliveryBatch và hai quote/phí vận chuyển. Vendor A xác nhận, xuất và giao trước; Vendor B vẫn ở trạng thái chờ chuẩn bị. Parent Order hiển thị `Giao một phần` cho đến khi batch của Vendor B được xử lý xong. Nếu Buyer đặt thêm 10 kg rau của Vendor A giao ngày 27/09, Vendor Order của A có thêm một DeliveryBatch và một phí vận chuyển riêng.

**Ngày giao xa:** cần lưu `requested_delivery_date` và suy ra `ship_by_date` từ thời gian chuẩn bị cùng thời gian vận chuyển dự kiến của lựa chọn đã chọn. Kiểm tra nguồn cung theo ngày xuất, trừ các cam kết đã nhận cho cùng cửa sổ giao. Nếu hãng không cho quote có hiệu lực đến ngày xuất hàng, phí hiển thị là **ước tính**, không coi là giá đã chốt. Đề xuất V1: chỉ thu tiền cho các batch có hàng và báo giá đã chốt; batch tương lai giữ ở trạng thái đặt trước, thông báo các lựa chọn/phí cuối cùng và thu tiền khi đến hạn chốt. Buyer vẫn thực hiện một thao tác đặt hàng, nhưng có thể có nhiều giao dịch thanh toán theo batch. Sau khi Buyer xác nhận mức phí cuối cùng của batch, mọi chênh lệch cước phát sinh thuộc Vendor.

## 3. Flow nghiệp vụ

1. Buyer nhập địa chỉ và ngày nhận cho từng nhóm hàng (mặc định cùng ngày, có thể đổi theo Vendor/item) rồi kiểm tra giỏ. Backend tách giỏ theo Vendor, tiếp tục nhóm theo ngày giao/địa chỉ/dịch vụ thành DeliveryBatch, kiểm tra khả năng cung ứng theo ngày, dựng kiện dự kiến và gọi `ShippingService` lấy quote từ adapter hãng. Lọc quote theo điều kiện bảo quản bắt buộc, hạn giao và khả năng tuyến; cho Buyer chọn trong các phương án phù hợp và hiển thị phí, ETA, nhiệt độ theo từng batch.
2. Buyer xác nhận checkout. Backend xác thực lại quote, giá và tồn; lưu snapshot phí; tạo Parent Order và Vendor Orders; chuyển sang thanh toán. Giao dịch thất bại thì xử lý đơn/tồn theo chính sách giữ chỗ.
3. Vendor xác nhận và chuẩn bị hàng. Khi có kiện thực tế, hệ thống kiểm tra lại trọng lượng/kích thước. Mọi chênh lệch cước thực tế được hạch toán cho Vendor, không thu thêm Buyer.
4. Backend gọi adapter `createShipment` với khóa idempotency theo Shipment. Lưu mã vận đơn, nhãn, phí hãng và trạng thái. Vendor in nhãn, quét QR lô nếu có, bàn giao kiện; lưu thời gian và bằng chứng.
5. Hãng gửi webhook trạng thái. Backend xác thực chữ ký, chống xử lý trùng/sai thứ tự, lưu raw event và ánh xạ sang trạng thái nội bộ. Nếu webhook chậm, job đồng bộ trạng thái chủ động. Buyer xem tracking theo từng Vendor Order.
6. Trạng thái `DELIVERED` từ hãng nghĩa là hãng báo đã giao. Buyer vẫn xác nhận số lượng/chất lượng; nếu thiếu/hỏng, tạo biên bản và dispute gắn với Shipment, item, lô và bằng chứng. Sau đó mới chốt hoàn thành/đối soát theo chính sách.

**Nhánh lỗi:** không có dịch vụ đáp ứng nhiệt độ/thời hạn → cho chọn ngày/địa chỉ khác hoặc tự giao có đủ điều kiện và báo giá; API hãng lỗi → báo giá tạm thời chỉ nếu có bảng phí dự phòng được công bố, không cho thanh toán bằng một con số chưa xác nhận; tạo vận đơn timeout → tra cứu bằng idempotency key trước khi gọi lại; giao thất bại/hoàn hàng → ghi trạng thái và phí hoàn vào công nợ Vendor; webhook trùng → bỏ qua chuyển trạng thái trùng nhưng lưu dấu vết.

## 4. Sơ đồ UML

- [Sơ đồ tuần tự: báo giá, thanh toán, tạo vận đơn và giao nhận](shipping-sequence.puml)
- [Sơ đồ hoạt động: quyết định phí và xử lý ngoại lệ](shipping-activity.puml)

## 5. Dữ liệu và API tối thiểu

| Thành phần | Trường/chức năng chính |
|---|---|
| `ShippingQuote` | DeliveryBatch tạm, địa chỉ, kiện dự kiến, hãng/dịch vụ, nhiệt độ/tốc độ, cấu phần phí, phí Buyer, ETA, hết hạn, trạng thái xác nhận |
| `DeliveryBatch` | Vendor Order, địa chỉ nhận, ngày giao yêu cầu, ngày xuất dự kiến, danh sách item/số lượng, trạng thái, tổng phí batch |
| `Shipment` | DeliveryBatch, quote snapshot, kiện thực tế, mã hãng, tracking code, trạng thái, phí hãng thực tế, phí hoàn, bằng chứng bàn giao |
| `ShippingEvent` | Hãng, event ID, Shipment, trạng thái gốc/đã ánh xạ, thời gian sự kiện/nhận, payload, kết quả xác thực |
| `ShippingService` | `getQuotes`, `createShipment`, `cancelShipment`, `getTracking`, `handleWebhook`; adapter riêng cho từng hãng |

Các quyết định cần chốt với nghiệp vụ trước khi triển khai: hãng và dịch vụ mục tiêu, dải nhiệt độ/giới hạn thời gian cho từng nhóm nông sản, phương pháp đóng gói, chính sách miễn phí/trợ giá, thanh toán đơn đặt trước và có cho phép tách nhiều kiện hay không. Trách nhiệm phí hoàn hàng và chênh lệch cước đã chốt thuộc Vendor.
