# Phân tích luồng, Use Case và màn hình Vendor — Kaggri-Trade

## 1. Căn cứ, phạm vi và giả định

- **SRS Kaggri-Trade v1.0** tại `tmp/srs_kaggri_trade.html`: FR-IAM-002, FR-ORG, FR-CAT, FR-INV, FR-ORD, FR-SUB-002, FR-DEL, FR-DIS-003, FR-SET-004, FR-RAT-002, FR-REP-003; các quy tắc BR-ORG/INV/ORD/SUB.
- **Kế hoạch phân công vai trò v1.4** tại `output/documents/Ke_hoach_phan_cong_vai_tro_nhom_Kaggri_Trade.docx`: Web Vendor gồm catalog, pricing, inventory/lot, sub-order, subscription, settlement, dashboard; Mobile ưu tiên giao nhận, QR và thông báo.
- **Quyết định sản phẩm hiện tại:** Vendor đăng ký bán trên Kaggri-Trade với tư cách **hộ kinh doanh đã có giấy chứng nhận**. Mỗi hộ kinh doanh/trang trại có **một tài khoản do chủ hộ sử dụng**; không có Vendor Manager/Staff hay màn hình quản lý nhân sự. Đây là điều chỉnh đơn giản hóa so với vai trò Manager/Staff trong bản nháp SRS và cần được cập nhật vào baseline/ma trận quyền. Đăng ký trên Kaggri-Trade là xét duyệt người bán, không phải thủ tục xin cấp giấy chứng nhận hộ kinh doanh.
- Đây là **đề xuất trước khi thiết kế UI và code**, chưa phải route hay API đã chốt. `M/S/C` lần lượt là Must-have/Should-have/Could-have theo SRS. Các màn hình suy ra để hoàn chỉnh hành trình được ghi là *đề xuất*.

## 2. Tác nhân và ranh giới quyền

| Tác nhân | Quyền dự kiến | Giới hạn |
|---|---|---|
| Chủ hộ kinh doanh chưa được duyệt | Đăng ký tài khoản bán, xác minh email, nộp thông tin và giấy chứng nhận hộ kinh doanh, bổ sung tài liệu, xem kết quả | Chưa công bố sản phẩm hoặc nhận đơn mới (BR-ORG-001) |
| Vendor (chủ hộ đã được duyệt) | Tự quản lý hồ sơ, sản phẩm/giá, kho/lô, đơn, giao nhận, doanh thu và đối soát | Chỉ dữ liệu của hộ kinh doanh/trang trại gắn với tài khoản mình |
| Operation/Finance Admin | Duyệt hồ sơ, xử lý tranh chấp, chốt settlement | Là tác nhân liên quan, không phải màn hình Vendor |

**Quy tắc dữ liệu đề xuất:** `1 tài khoản Vendor ↔ 1 hồ sơ hộ kinh doanh ↔ 1 trang trại hiển thị`; sản phẩm, tồn kho, lô và Vendor Order đều thuộc hồ sơ đó. Tên hộ kinh doanh trên giấy chứng nhận tách khỏi tên trang trại Buyer nhìn thấy. Không chia sẻ mật khẩu cho người khác để cùng vận hành; nếu cần nhiều người sau này, hãy mở rộng bằng tài khoản riêng và quyền riêng.

## 3. Luồng thao tác chính của Vendor

1. **Gia nhập:** đại diện đăng ký → xác minh email → tạo hồ sơ tổ chức và tải giấy tờ → gửi xét duyệt. Admin có thể yêu cầu bổ sung, duyệt, từ chối hoặc tạm khóa. Giao diện Vendor phải hiển thị trạng thái, lý do và hành động hợp lệ.
2. **Chuẩn bị bán:** sau khi được duyệt, chủ trang trại tạo sản phẩm với ảnh, nguồn gốc, thuộc tính; cấu hình giá theo bậc và MOQ; ghi nhận nhập/điều chỉnh tồn bằng phiếu biến động; có thể tạo lô và QR. Chỉ sản phẩm đủ điều kiện mới được công bố.
3. **Nhận đơn:** Buyer checkout tạo `Parent Order` và một `Vendor Order` riêng cho từng Vendor. Vendor chỉ thấy sub-order của mình, kiểm tra hàng/số lượng/hạn xác nhận rồi **xác nhận** hoặc **từ chối kèm lý do**. Một sub-order bị từ chối không tự hủy các sub-order khác.
4. **Thực hiện đơn:** Vendor chuyển trạng thái hợp lệ `Confirmed → Preparing → Shipped → Delivered`; khi xuất hàng có thể gắn/quét QR lô. Buyer xác nhận nhận hàng; hệ thống lưu lịch sử trạng thái, người thao tác và thời gian. Vendor không tự xác nhận thay Buyer.
5. **Đơn định kỳ:** khi Buyer đề xuất subscription, Vendor xem lịch và khả năng cung ứng rồi xác nhận/từ chối. Từng kỳ sinh draft order theo chính sách; biến động giá/tồn cần được xử lý trước hạn chốt.
6. **Sau bán:** khi Buyer mở dispute, Vendor xem yêu cầu và bằng chứng, phản hồi trong thời hạn. Admin quyết định; hoàn tiền ảnh hưởng số dư/settlement. Vendor có thể phản hồi đánh giá nếu triển khai hạng mục Could-have.
7. **Theo dõi kinh doanh:** chủ trang trại xem dashboard doanh thu, nhu cầu, giao đúng hạn; xem chi tiết kỳ đối soát do Finance Admin chốt. Vendor chỉ xem, không tự chốt settlement.

**Các nhánh lỗi cần thể hiện trên UI:** hồ sơ bị yêu cầu bổ sung/từ chối; sản phẩm bị ẩn; tồn khả dụng không đủ; đơn quá hạn xác nhận; chuyển trạng thái sai; QR sai lô; mất mạng khi cập nhật giao hàng; dispute quá hạn phản hồi; settlement bị điều chỉnh sau refund.

## 4. Sơ đồ Use Case UML

Xem [sơ đồ SVG](vendor-usecase.svg) và [mã PlantUML](vendor-usecase.puml). Use case mô tả **mục tiêu nghiệp vụ**, không đồng nhất với màn hình. `<<include>>` biểu thị bước bắt buộc khi thực hiện một mục tiêu; `<<extend>>` biểu thị tình huống phát sinh có điều kiện. Hệ thống tự tính tồn khả dụng, tạo order theo kỳ và tính settlement nên các việc đó không bị vẽ thành thao tác thủ công của Vendor.

## 5. Danh sách màn hình cần thiết kế

`M` nên có cho luồng nghiệm thu cốt lõi; `S/C` có thể thiết kế sau khi luồng M ổn định. Một mục có thể gồm danh sách, chi tiết, biểu mẫu và trạng thái trong cùng một khu vực UI.

| ID | Bề mặt / màn hình | Người dùng | Nội dung và hành động chính | Ưu tiên / căn cứ |
|---|---|---|---|---|
| V01 | Đăng ký bán hàng, đăng nhập, quên mật khẩu | Chủ hộ kinh doanh | Tạo tài khoản bán, xác minh email, truy cập và khôi phục | M · FR-IAM-002; đăng nhập/khôi phục dùng chung |
| V02 | Hồ sơ hộ kinh doanh và xét duyệt | Vendor | Tên, chủ hộ, số giấy chứng nhận, địa chỉ, ảnh/PDF giấy chứng nhận, tên trang trại hiển thị, liên hệ; gửi duyệt, bổ sung, xem lý do quyết định | M · FR-ORG-001/002 |
| V03 | Trang trạng thái tài khoản | Vendor | Chờ duyệt, cần bổ sung, bị từ chối/tạm khóa; hướng dẫn việc tiếp theo | M · BP-01, BR-ORG-001; đề xuất màn hình/trạng thái |
| V04 | Tổng quan Vendor | Vendor | Việc cần làm: đơn chờ xác nhận, cảnh báo tồn, doanh thu/KPI theo kỳ | M · FR-REP-001/003; bố cục đề xuất |
| V05 | Sản phẩm của tôi | Vendor | Tìm/lọc theo trạng thái; CTA chính “+ Thêm sản phẩm”; từng sản phẩm có Sửa, Hiện/Ẩn, Xóa nếu không có dữ liệu liên quan | M · FR-CAT-002 |
| V06 | Đăng bán/sửa sản phẩm | Vendor | Tên, nhóm hàng, ảnh nông sản, nơi trồng, giá/kg, lượng đặt tối thiểu, hàng sẵn bán, trạng thái và khai báo đã có/chưa có giấy kiểm nghiệm; nếu có thì tải ảnh/PDF để xác minh, không tự công bố “đã đạt” | M · FR-CAT-002/003/004; giấy kiểm nghiệm là đề xuất bổ sung |
| V07 | Tổng quan tồn kho và nguồn cung dự kiến | Vendor | Phân biệt On-hand/Reserved/Available hôm nay với lượng dự kiến có theo ngày; cảnh báo thiếu; không sửa trực tiếp số tổng | M · FR-INV-001/002, BR-INV-001/002; nguồn cung theo ngày là đề xuất bổ sung |
| V08 | Phiếu nhập/xuất/điều chỉnh và lịch sử tồn | Vendor | Tạo biến động có loại, số lượng, lý do/chứng từ; xem lịch sử và thời gian | M · FR-INV-001/006 |
| V09 | Danh sách/chi tiết Vendor Order | Vendor | Lọc trạng thái, hạn xác nhận, ngày giao yêu cầu/ngày xuất dự kiến; xem item, địa chỉ, timeline; xác nhận/từ chối kèm lý do | M · FR-ORD-002/003/005; ngày giao tương lai là đề xuất bổ sung |
| V10 | Chuẩn bị và giao hàng | Vendor | Cập nhật Preparing/Shipped/Delivered theo state machine; xem bằng chứng và lỗi | M · FR-DEL-001, BR-ORD-003 |
| V11 | Báo cáo doanh thu, nhu cầu, hiệu suất | Vendor | Lọc ngày/tuần/quý/năm/khoảng ngày; doanh thu, đơn, giao đúng hạn, sản phẩm có nhu cầu | M · FR-REP-001/003 |
| V12 | Danh sách/chi tiết lô hàng | Vendor | Ngày thu hoạch/đóng gói/hạn dùng; liên kết order item, trạng thái lô | S · FR-INV-004 |
| V13 | Danh sách/chi tiết đề nghị subscription | Vendor | Lịch cung ứng, số lượng, hạn chốt; xác nhận/từ chối khả năng cung ứng | S · FR-SUB-002 |
| V14 | Danh sách/chi tiết dispute | Vendor | Xem khiếu nại/bằng chứng/thời hạn; gửi phản hồi và theo dõi quyết định | S · FR-DIS-003 |
| V15 | Danh sách/chi tiết settlement | Vendor | Số dư chờ/khả dụng, kỳ, commission, refund, adjustment, trạng thái thanh toán | S · FR-SET-002/004 |
| V16 | Đánh giá và phản hồi | Vendor | Xem đánh giá đủ điều kiện và phản hồi | C · FR-RAT-002 |
| V17 | Trung tâm thông báo | Vendor | Đơn mới, hồ sơ, subscription, dispute, giao hàng; mở đúng đối tượng | Đề xuất từ module Notification và kế hoạch Mobile |

**Mobile Vendor (cùng tài khoản chủ trang trại, thiết kế riêng cho tác vụ hiện trường):** đăng nhập; danh sách/chi tiết Vendor Order; cập nhật trạng thái; danh sách/chi tiết lô; quét QR xuất hàng và kết quả xác minh; chụp/tải bằng chứng; thông báo. QR cần trạng thái camera bị từ chối quyền, mã sai, sai Vendor/order item và mạng yếu. Các khu vực báo cáo, giá và settlement ở Web trừ khi nhóm đổi phạm vi Mobile. Căn cứ FR-DEL-002, FR-INV-005 và kế hoạch phân vai trò v1.4.

### Trạng thái UI cần vẽ trong wireframe

- Mỗi danh sách: đang tải, rỗng, lỗi tải, đã lọc không có kết quả, không đủ quyền.
- Mỗi biểu mẫu: chưa lưu, lỗi xác thực, đang gửi, gửi thành công, gửi trùng/timeout; lỗi nghiệp vụ từ API phải giải thích hành động tiếp theo.
- Đơn hàng: trạng thái hiện tại, các hành động hợp lệ, hạn còn lại, lịch sử bất biến; nút từ chối/hủy yêu cầu lý do và xác nhận.
- Kho: ba số On-hand/Reserved/Available luôn phân biệt; phiếu tồn là nguồn thay đổi, không có ô sửa trực tiếp Available.
- Hồ sơ chờ duyệt/tạm khóa: khóa hành động công bố và nhận đơn, nhưng vẫn cho xem trạng thái/lý do theo quyền.

## 6. Các quyết định cần chốt trước khi vẽ UI chi tiết / code

1. **Đồng bộ tài liệu:** sửa SRS, ma trận quyền và sơ đồ vai trò thành một actor Vendor là chủ trang trại; bỏ luồng mời/gán Staff và quản trị thành viên. Chốt một tài khoản có được gắn với nhiều trang trại hay chỉ một; bản này giả định chỉ một.
2. **State machine Vendor Order:** các bước và điều kiện chính xác cho `Paid → Pending Confirmation → Confirmed → Preparing → Shipped → Delivered → Completed`, nhánh Rejected/Cancelled/Disputed; ai cập nhật `Delivered`, ai chốt `Completed`?
3. **Thời hạn nghiệp vụ:** Vendor xác nhận đơn, giữ tồn, sửa/bỏ kỳ subscription, phản hồi dispute; khi quá hạn xử lý tự động thế nào?
4. **Giá và tồn của subscription:** khóa giá hay áp dụng giá tại từng kỳ; UI nào hiển thị yêu cầu Buyer chấp thuận thay đổi?
5. **Kho/lô:** Vendor có nhiều kho không, phiếu xuất thủ công dùng khi nào so với xuất do order, QR bắt buộc hay tùy chọn trong demo?
6. **Settlement và KPI:** công thức commission, ngày chốt/chi trả, trạng thái điều chỉnh/refund, định nghĩa doanh thu; Vendor Score chỉ hiển thị khi công thức được duyệt.

Sau khi chốt các điểm này, thứ tự thiết kế hợp lý là **V02–V03 → V05–V08 → V09–V10 → V04/V11 → V12–V17**, với bộ component chung cho trạng thái, timeline, bộ lọc và biểu mẫu.

## 7. Đề xuất bổ sung: Buyer đặt trước để giao trong tương lai

**Tình huống:** hôm nay tồn khả dụng thấp, trang trại dự kiến có hàng sau 10 ngày, Buyer muốn giao sau 20 ngày. Đây là đơn đặt trước theo ngày giao, không phải đơn giao ngay và cũng không nhất thiết là subscription (subscription là nhu cầu lặp lại theo chu kỳ).

**Quy tắc đề xuất:**

1. Vendor khai báo **nguồn cung dự kiến theo sản phẩm và ngày có hàng**: số lượng, ngày sẵn sàng, mức chắc chắn/trạng thái xác nhận. Đơn đã hứa cho ngày đó cũng phải được trừ khỏi số lượng còn có thể nhận thêm.
2. Buyer chọn ngày giao. Hệ thống suy ra ngày cần xuất hàng theo thời gian chuẩn bị/vận chuyển. Chỉ cho đặt khi nguồn cung đủ trước ngày xuất hàng; nếu chưa chắc chắn, hiển thị **“Yêu cầu đặt trước — chờ Vendor xác nhận”** thay vì “Còn hàng”.
3. Vendor xác nhận số lượng và ngày giao. Hệ thống ghi **cam kết nguồn cung theo ngày** để ngăn nhận trùng vượt khả năng; cam kết này tách khỏi `Reserved` của hàng đã nhập kho. Không tạo tồn kho âm hoặc phiếu nhập giả.
4. Khi thu hoạch/nhập kho thật, Vendor ghi phiếu nhập; hệ thống đối chiếu cam kết và chuyển sang giữ tồn vật lý cho đơn. Nếu thiếu hàng hoặc trễ, Vendor phải đề nghị ngày/số lượng mới; Buyer chấp nhận hoặc hủy theo chính sách.
5. **Thanh toán là quyết định nghiệp vụ cần chốt.** Phương án phù hợp để giảm hoàn tiền là thu khi hàng đã nhập kho và ngày giao đã được xác nhận; trước đó đơn ở trạng thái đặt trước. Nếu thu ngay khi đặt, phải có quy tắc hủy/hoàn tiền rõ ràng khi mùa vụ thất bại.

**Ví dụ:** ngày 0 còn 0 kg; ngày 10 dự kiến có 100 kg; đến ngày 18 cần xuất cho các đơn giao ngày 20. Đã cam kết 60 kg cho cùng cửa sổ giao hàng thì tối đa nhận thêm 40 kg. Buyer đặt 30 kg được nhận **đặt trước chờ xác nhận**; Buyer đặt 50 kg phải giảm lượng, chọn ngày khác hoặc chờ Vendor đề xuất. `Available hôm nay` vẫn bằng 0 kg.

**UI cần bổ sung vào wireframe:** V07 có lịch nguồn cung dự kiến và lượng đã cam kết theo ngày; V09 có nhãn “đặt trước”, ngày giao, hạn xác nhận, hành động đề xuất thay đổi; trang sản phẩm và checkout Buyer phải cho chọn ngày giao và phân biệt “có sẵn” với “dự kiến có”.

**Thay đổi SRS cần chốt:** FR-INV/FR-CART/FR-ORD hiện kiểm tra và giữ tồn vật lý lúc checkout; luồng này cần thêm kiểm tra khả năng cung ứng theo ngày, cam kết nguồn cung tương lai, trạng thái đặt trước và quy tắc thanh toán/hủy riêng. Không nên dùng trực tiếp `Available = On-hand − Reserved` của hôm nay để từ chối mọi đơn giao sau này.

## 8. Đề xuất bảo vệ Buyer khi nông sản giao đến bị hư/dập

**Nguyên tắc:** xử lý theo **sản phẩm và số lượng bị ảnh hưởng**, không mặc định hoàn cả Vendor Order hoặc bắt Buyer gửi trả hàng dễ hư. Buyer được chọn giải pháp, Vendor có quyền phản hồi, Admin phân xử khi hai bên không thống nhất. Căn cứ FR-DEL-004/005, FR-DIS-001..005 và FR-SET-002; chính sách cụ thể dưới đây là đề xuất cần chốt.

1. **Ghi nhận lúc nhận:** Buyer mở màn hình kiểm hàng theo từng item/lô, nhập số lượng nhận, số lượng hỏng và loại lỗi (dập, thối, thiếu, sai loại, không đạt chất lượng). Cho phép xác nhận *đã nhận hàng, còn chờ kiểm chất lượng*; việc bấm đã nhận không tự tước quyền khiếu nại trong thời hạn đã công bố.
2. **Bằng chứng nhanh:** ảnh tổng kiện, ảnh phần hỏng, nhãn/lô hoặc QR, thời điểm giao; thêm ghi chú và ảnh điều kiện bảo quản nếu cần. Hệ thống lưu gắn với đúng Vendor Order/item/lô. Không buộc Buyer quay video dài cho mọi lỗi nhỏ.
3. **Thời hạn ngắn, hiển thị trước:** mở yêu cầu ngay khi nhận hoặc trong cửa sổ kiểm hàng theo nhóm nông sản; thời hạn cụ thể phải chốt với nhóm nghiệp vụ. Hiển thị đồng hồ và thông báo nhắc; khi hết hạn, trường hợp an toàn thực phẩm nghiêm trọng vẫn cần đường liên hệ Admin.
4. **Phương án giải quyết:** (a) hoàn tiền phần hỏng theo số lượng và đơn giá thực trả; (b) hoàn toàn bộ item nếu không sử dụng được; (c) giao bù/thay thế khi Buyer đồng ý và Vendor có hàng đúng hạn; (d) tín dụng cho đơn sau chỉ khi Buyer tự chọn. Không cộng chồng hoàn tiền và giao bù cho cùng phần hàng.
5. **Quy trình phản hồi:** Vendor chấp nhận hoặc đề xuất phương án khác kèm lý do/bằng chứng trong thời hạn; nếu bất đồng hoặc quá hạn, Admin xử lý có audit. Hiển thị tiến độ và mốc hẹn giải quyết cho cả hai bên.
6. **Đối soát:** phần tiền đang tranh chấp ở trạng thái *chờ đối soát* trong sổ nội bộ; phần không tranh chấp tiếp tục xử lý theo quy tắc thông thường. Quyết định refund được phản ánh vào settlement và không vượt giá trị đã thanh toán của phần hàng liên quan. Cần xác nhận cổng thanh toán sandbox có hỗ trợ partial refund; không gọi cơ chế này là ký quỹ nếu cổng không cung cấp escrow thực sự.
7. **Niềm tin lâu dài:** Buyer nhìn thấy chính sách bồi hoàn trước checkout, có mã yêu cầu và lịch sử; chỉ dispute đã xác minh mới được đưa vào KPI chất lượng Vendor. Theo dõi tỷ lệ hư hỏng theo sản phẩm/lô và nguyên nhân đóng gói, vận chuyển hoặc thu hoạch để giảm lặp lại.

**Màn hình cần bổ sung trạng thái:** V09/V10 hiển thị biên bản giao và số lượng Buyer đã ghi nhận; V14 có ảnh, số lượng bị ảnh hưởng, thời hạn phản hồi, đề xuất hoàn/giao bù và quyết định cuối. Buyer cần biểu mẫu kiểm hàng lúc nhận, biểu mẫu khiếu nại theo item và trang theo dõi kết quả. Admin cần hàng đợi phân xử dispute có bằng chứng hai phía.
