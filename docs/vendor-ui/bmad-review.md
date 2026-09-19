# BMAD Review — màn hình Vendor

**Phạm vi:** 16 route của bản mẫu `index.html`, mã `app.js`, tài liệu `vendor-screens-usecases.md` và bài kiểm tra `tmp/vendor-ui-check.cjs`. Đây là review mức thiết kế/luồng; dữ liệu và hành động trong bản mẫu hiện chỉ minh họa trong bộ nhớ.

**Cập nhật sau review:** màn Sản phẩm đã có bộ lọc, nút thêm/hiện/ẩn/xóa và trường tải giấy kiểm nghiệm. Các nhận xét bên dưới phản ánh trạng thái tại thời điểm review; xem bản mẫu hiện tại để kiểm tra các thay đổi này.

**Mục đích:** giúp nhóm thiết kế biết mỗi màn đã đủ thông tin để chủ hộ kinh doanh thao tác hay chưa. Góc nhìn BMAD được dùng: adversarial, edge-case-hunter, verification-gap. Các phát hiện được xếp theo hành trình người bán, không gán mức độ ưu tiên.

## Rà từng màn

| Màn | Đánh giá | Cần chỉnh / bổ sung trước khi chốt thiết kế |
|---|---|---|
| Đăng ký bán hàng | Cần bổ sung | Đã có thông tin hộ kinh doanh cơ bản và giấy chứng nhận. Cần trạng thái `cần bổ sung`, `bị từ chối`, lý do, ngày gửi và kết quả duyệt; tách thông tin pháp lý khỏi tên trang trại. Làm rõ người chưa có giấy chứng nhận cần làm gì. |
| Hồ sơ chờ xét duyệt | Cần bổ sung | Có trạng thái chờ và nút chỉnh sửa. Cần mã hồ sơ, thời điểm gửi, thông báo yêu cầu bổ sung và hành động gửi lại. |
| Tổng quan | Cần chỉnh | CTA đơn chờ rõ ràng. Danh sách việc tiếp theo hiện cố định, không phản ánh khi trạng thái đơn/khiếu nại đã đổi; cần sắp theo hạn xử lý thật. |
| Sản phẩm của tôi | Cần bổ sung | Có tìm kiếm và CTA đăng bán. Cần lọc `đang bán/nháp/ẩn/hết hàng`, cảnh báo sản phẩm thiếu ảnh hoặc tồn, và trạng thái không tìm thấy khác với chưa có sản phẩm. |
| Đăng bán / sửa sản phẩm | Cần bổ sung | Có tên, nhóm, giá, MOQ, nơi trồng, ảnh, tồn và một CTA. Cần quy cách/đơn vị bán, thời gian chuẩn bị, tiêu chuẩn/chất lượng và điều kiện công bố. Màn sửa cần thấy ảnh hiện tại; biểu mẫu cần chỉ lỗi tại đúng trường. |
| Tồn kho | Cần bổ sung | Phân biệt đang có/đã giữ/có thể bán. Cần lịch sử nhập, xuất, điều chỉnh với thời điểm và lý do; không để Vendor chỉ thấy tổng số mà không truy vết được. |
| Lô thu hoạch | Cần bổ sung | Có mã lô, sản phẩm, ngày thu hoạch, số lượng. Cần ngày đóng gói/hạn dùng khi áp dụng, lượng còn lại, liên kết đơn và trạng thái QR; tránh tạo lô trùng với phiếu nhập kho. |
| Nguồn cung dự kiến | Cần chỉnh | Có ngày, dự kiến, đã cam kết. Cần ngày xuất hàng suy ra từ ngày giao, lượng cam kết theo đúng cửa sổ ngày, mức chắc chắn và thao tác sửa/hủy kế hoạch; bỏ ví dụ cố định khi đã có dữ liệu thật. |
| Đơn hàng | Cần bổ sung | Có mã, Buyer, hàng, ngày giao, giá trị, trạng thái. Cần hạn xác nhận, nhãn đơn đặt trước, ngày cần xuất và các trạng thái bị từ chối/đã xuất/đang tranh chấp trong bộ lọc. |
| Chi tiết đơn | Cần chỉnh | Có sản phẩm, số lượng, giá và CTA xác nhận. Cần địa chỉ giao thực, liên hệ nhận, hạn xác nhận, khả năng cung ứng theo ngày, lịch sử mốc thời gian và phương án đề xuất thay đổi ngày/số lượng nếu thiếu. |
| Giao hàng | Cần bổ sung | Có các đơn cần chuẩn bị và bước tiếp theo. Cần chọn lô, xác minh QR, số lượng xuất, thời gian/bằng chứng bàn giao, lỗi xác minh; phân biệt Vendor báo đã giao với Buyer xác nhận đã nhận. |
| Đơn định kỳ | Cần bổ sung | Có lịch, lượng, ngày bắt đầu. Cần ngày kết thúc/số kỳ, giá hoặc quy tắc đổi giá, hạn phản hồi, tổng nhu cầu theo kỳ và lối từ chối/đề xuất lịch khác. |
| Khiếu nại | Cần bổ sung | Có phần hàng hỏng, số tiền và phương án phản hồi. Cần ảnh thực có thể xem, thời điểm nhận/khiếu nại, hạn phản hồi, chứng cứ theo item/lô, điều kiện giao bù và trạng thái Admin quyết định. |
| Đối soát | Cần bổ sung | Có ba số tổng và CSV. Cần cách tính từng khoản phí, khoản treo vì khiếu nại, kỳ chốt, ngày dự kiến chi trả và chi tiết đơn/hoàn tiền để Vendor kiểm tra sai lệch. |
| Báo cáo | Cần bổ sung | Có doanh thu, số đơn, đúng hẹn và sản phẩm nổi bật. Cần chọn khoảng thời gian, định nghĩa doanh thu/đơn hoàn thành, mẫu số của tỷ lệ đúng hẹn và so sánh nhất quán với CSV. |
| Hồ sơ hộ kinh doanh | Cần chỉnh | Đã tách tên pháp lý và tên hiển thị. Cần thể hiện dữ liệu nào Buyer thấy, dữ liệu nào cần xét duyệt lại khi sửa; không dẫn Vendor đã được duyệt về biểu mẫu đăng ký như một thao tác thông thường. |
| Thông báo | Cần chỉnh | Các thông báo dẫn tới mục liên quan. CTA đầu trang luôn mở một đơn cố định, không phụ thuộc việc mới nhất; cần dẫn tới việc còn xử lý có hạn gần nhất hoặc bỏ CTA này. |

## Màn/trạng thái chưa có trong bản mẫu

- Đăng nhập, xác minh email, quên mật khẩu (luồng dùng chung với Buyer nhưng Vendor vẫn cần điểm vào rõ ràng).
- Tài khoản `cần bổ sung`, `bị từ chối`, `tạm khóa`, cùng lý do và hành động tiếp theo.
- Lịch sử biến động kho/phiếu xuất hoặc điều chỉnh; trang kết quả quét QR và xử lý lỗi khi giao.
- Đánh giá và phản hồi đánh giá (nếu giữ hạng mục Could-have trong phạm vi).
- Trạng thái đang tải, lỗi tải, không có quyền, gửi trùng/timeout cho các biểu mẫu và danh sách. Bản mẫu tĩnh chưa mô tả chúng.

## Phát hiện BMAD dạng chuẩn

```json
[
  {"lens":"adversarial","location":"app.js:63,109,153-158","trigger_condition":"Hồ sơ chưa duyệt vẫn thấy và thực hiện đăng bán","guard_snippet":"Chỉ cho công bố sản phẩm khi trạng thái hồ sơ là Đã duyệt; khi chưa duyệt, đổi CTA sang hoàn thiện/xem hồ sơ","potential_consequence":"Vendor hiểu nhầm đã được phép bán và Buyer có thể thấy hàng chưa được xác minh"},
  {"lens":"adversarial","location":"app.js:109,161","trigger_condition":"Đăng ký chỉ có chờ xét duyệt, không có nhánh cần bổ sung hoặc từ chối","guard_snippet":"Thêm trạng thái hồ sơ, lý do, thời điểm và CTA gửi bổ sung theo quyết định Admin","potential_consequence":"Vendor không biết vì sao hồ sơ bị giữ hoặc cần làm gì tiếp"},
  {"lens":"adversarial","location":"app.js:71-92","trigger_condition":"Trang sản phẩm thiếu lọc theo trạng thái và ảnh hiện tại khi sửa","guard_snippet":"Thêm bộ lọc nháp/đang bán/ẩn/hết hàng và xem trước ảnh đang dùng","potential_consequence":"Vendor khó tìm sản phẩm cần sửa và không biết ảnh nào Buyer đang thấy"},
  {"lens":"adversarial","location":"app.js:85,96,157,163","trigger_condition":"Tạo sản phẩm nhập tồn ban đầu và nhập kho sau đó không có lịch sử biến động","guard_snippet":"Ghi phiếu tồn có nguồn, thời gian, lượng và lý do; hiển thị lịch sử theo sản phẩm","potential_consequence":"Không truy vết được vì sao số tồn thay đổi hoặc phát hiện nhập trùng"},
  {"lens":"adversarial","location":"app.js:98,100-101","trigger_condition":"Nguồn cung tương lai không gắn với cửa sổ xuất hàng và cam kết của từng đơn","guard_snippet":"Hiển thị ngày cần xuất, lượng đã hứa theo ngày, còn nhận được và đơn liên quan","potential_consequence":"Vendor xác nhận quá khả năng cho các đơn giao sau"},
  {"lens":"adversarial","location":"app.js:100-101","trigger_condition":"Đơn không hiển thị hạn xác nhận hoặc lựa chọn đề xuất thay đổi","guard_snippet":"Cho thấy hạn phản hồi, ngày xuất và hành động đề xuất ngày/số lượng khác","potential_consequence":"Vendor bỏ lỡ hạn hoặc chỉ có thể xác nhận/từ chối cả đơn"},
  {"lens":"adversarial","location":"app.js:102,138,167","trigger_condition":"Luồng giao hàng không ghi lô, bằng chứng và số lượng bàn giao","guard_snippet":"Gắn lô, xác minh QR, nhập số lượng và bằng chứng trước khi báo đã xuất/đã giao","potential_consequence":"Khó truy xuất nguồn gốc và phân xử hàng thiếu/hỏng"},
  {"lens":"adversarial","location":"app.js:103,139","trigger_condition":"Đơn định kỳ chỉ cho chấp nhận toàn bộ lịch với dữ liệu điều khoản thiếu","guard_snippet":"Thêm ngày kết thúc, hạn chốt, giá/quy tắc giá và nhánh từ chối hoặc đề xuất lịch khác","potential_consequence":"Vendor cam kết lịch dài hạn khi chưa rõ nghĩa vụ"},
  {"lens":"adversarial","location":"app.js:104,140,168","trigger_condition":"Khiếu nại thiếu hạn phản hồi và chứng cứ có thể xem thực tế","guard_snippet":"Hiển thị ảnh, item/lô, thời điểm, hạn xử lý và kết quả Admin; yêu cầu ngày giao bù nếu chọn giao bù","potential_consequence":"Vendor phản hồi thiếu căn cứ hoặc quá hạn, Buyer mất niềm tin"},
  {"lens":"adversarial","location":"app.js:105-106","trigger_condition":"Đối soát và báo cáo không cho kiểm tra công thức hoặc chọn kỳ","guard_snippet":"Cho lọc kỳ, xem chi tiết phí/hoàn tiền và định nghĩa KPI sát mỗi chỉ số","potential_consequence":"Vendor không thể đối chiếu số tiền hoặc hiểu sai doanh thu"},
  {"lens":"edge-case-hunter","location":"app.js:136,166","trigger_condition":"Xác nhận hoặc từ chối đơn không cập nhật lượng đã giữ/cam kết","guard_snippet":"Khi đổi trạng thái, cập nhật lượng giữ hoặc cam kết đúng ngày, có kiểm tra lại khả dụng","potential_consequence":"Số có thể bán sai sau khi Vendor xử lý đơn"},
  {"lens":"edge-case-hunter","location":"app.js:147,172","trigger_condition":"Tìm kiếm hoặc đổi hash dựng lại biểu mẫu đang nhập mà không báo mất dữ liệu","guard_snippet":"Giữ bản nháp biểu mẫu khi chuyển trang hoặc hỏi xác nhận trước khi bỏ thay đổi","potential_consequence":"Vendor mất nội dung đã nhập dở"},
  {"lens":"edge-case-hunter","location":"app.js:140,168","trigger_condition":"Chọn giao bù không yêu cầu ngày và lượng khả dụng","guard_snippet":"Hiện trường ngày giao bù, kiểm tra nguồn cung, ghi Buyer đồng ý trước khi chốt","potential_consequence":"Vendor hứa giao bù không thực hiện được"},
  {"lens":"verification-gap","location":"tmp/vendor-ui-check.cjs:13-21,70-75","trigger_condition":"Bài kiểm tra chỉ đếm CTA và nhánh gửi hồ sơ thành công","guard_snippet":"Kiểm tra trạng thái chưa duyệt/cần bổ sung và việc chặn công bố sản phẩm","potential_consequence":"Luồng bán trước khi duyệt có thể tồn tại mà kiểm tra vẫn báo PASS","gap_shape":"regression-gap","consumer":"onboarding và product-form trong app.js:109,151-161","evidence":"tmp/vendor-ui-check.cjs:13-21 chỉ đếm nút; :70-75 chỉ kiểm tra gửi hồ sơ xong"},
  {"lens":"verification-gap","location":"tmp/vendor-ui-check.cjs:26-31,51-68","trigger_condition":"Bài kiểm tra không quan sát tồn/cam kết sau khi xử lý đơn và nguồn cung","guard_snippet":"Kiểm tra số khả dụng/cam kết trước và sau xác nhận, từ chối, nhập kho","potential_consequence":"Màn kho hoặc nguồn cung hiển thị sai dù thao tác đơn vẫn được xem là thành công","gap_shape":"regression-gap","consumer":"order-detail, inventory và supply trong app.js:96,98,101","evidence":"tmp/vendor-ui-check.cjs:26-31 chỉ xác nhận nhãn trạng thái; :51-68 chỉ kiểm tra số vừa thêm"}
]
```

## Kết luận thiết kế

Bố cục và CTA một mục tiêu mỗi màn đã rõ; bài kiểm tra hiện tại **PASS 16 màn**, một CTA chính/màn, không tràn ngang desktop/mobile và một số thao tác mẫu. Trước khi code nghiệp vụ, cần chốt quy tắc xét duyệt hộ kinh doanh, cam kết nguồn cung theo ngày, trạng thái đơn và quyền xác nhận giao nhận, cùng chính sách khiếu nại/đối soát. Sau đó cập nhật prototype cho các trạng thái và dữ liệu trên; bài kiểm tra hiện chỉ chứng minh điều hướng và thao tác mẫu, chưa chứng minh tính đúng đắn nghiệp vụ.
