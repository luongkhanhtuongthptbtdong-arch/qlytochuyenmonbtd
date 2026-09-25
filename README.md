# Quản lý Tổ chuyên môn

## 1. Năm học và danh sách tháng

Danh sách tháng ở mọi mục (báo cáo, biên bản, chuyên đề, tổng hợp) chạy từ **tháng 8 năm đầu đến
tháng 7 năm sau** của năm học đang đặt trong **Cài đặt**. Đặt sai năm học thì các ô chọn tháng sẽ lệch.

Để trống `namHoc` trong `js/config.js` thì phần mềm tự tính theo ngày máy: từ tháng 8 trở đi tính là
năm học mới, trước tháng 8 vẫn thuộc năm học cũ.

## 2. Vai trò và quyền

| Vai trò | Được làm |
|---|---|
| **Giáo viên** | Nộp báo cáo tháng, nộp giáo án, ghi phiếu dự giờ, nhập điểm lớp mình, xem kho giáo án đã duyệt |
| **Thư ký** | Xem hồ sơ cả tổ, lập và xuất biên bản, xuất báo cáo tổ |
| **Tổ trưởng** | Thêm quyền duyệt giáo án, giao việc, nộp báo cáo tổ lên trường, sửa cài đặt đơn vị |
| **Hiệu trưởng** | Xem hồ sơ các tổ, nhận báo cáo của mọi tổ và xuất báo cáo tổng hợp toàn trường |
| **Quản trị** | Toàn quyền, cấp và khoá tài khoản |

Khi cấp tài khoản nhớ điền ô **Tổ chuyên môn** — đây là căn cứ để hệ thống tách số liệu của từng tổ.

## 3. Quy trình một tháng

1. Tổ trưởng vào **Tài khoản** cấp tài khoản cho từng giáo viên (hoặc nhập hàng loạt bằng tệp mẫu Excel).
2. Giáo viên nộp **Báo cáo tháng**, **Giáo án**, **Phiếu dự giờ**.
3. Tổ trưởng duyệt giáo án hoặc gửi góp ý; giáo án đã duyệt hiện ở tab "Đã duyệt" cho cả tổ tham khảo.
4. Sau mỗi đợt kiểm tra, tải **tệp mẫu điểm**, phát cho giáo viên, rồi nhập lại vào mục **Điểm & thống kê**.
   Phần mềm tự tính trung bình môn theo công thức (ΣTX + 2·GK + 3·CK) ÷ (số cột TX + 5) và so sánh tỉ lệ giữa các lớp.
5. Mục **Học sinh chưa đạt**: chọn cột điểm (TX1…TX4, giữa kỳ, cuối kỳ, trung bình môn) và ngưỡng
   điểm để trích danh sách, ghi nguyên nhân – biện pháp, xuất Word hoặc đưa vào biên bản.
6. Thư ký vào **Biên bản họp tổ**, đánh dấu các mục cần đưa vào — số liệu tự lấy từ hồ sơ đã nộp — rồi
   xem trước và xuất Word.
7. Tổ trưởng vào **Báo cáo tổ**: xem trước, xuất Word gửi Ban Giám hiệu, rồi bấm **Nộp lên trường**.
8. Hiệu trưởng vào **Tổng hợp các tổ**: tích chọn các tổ, chọn những mảng cần đưa vào, xem trước và
   **Xuất báo cáo tổng hợp** (Word) hoặc **Xuất bảng số liệu Excel**.

## 4. Hai cách đưa báo cáo tổ lên cấp trường

**Cách 1 — cả trường dùng chung một bản cài** (khuyên dùng, chế độ Firebase): tổ trưởng bấm
*Nộp lên trường*, báo cáo hiện ngay ở trang của hiệu trưởng.

**Cách 2 — mỗi tổ cài một bản riêng**: tổ trưởng bấm *Tải gói báo cáo (.json)* rồi gửi tệp qua
Zalo/email; hiệu trưởng vào **Tổng hợp các tổ** → *Nhận gói báo cáo (.json)*, chọn nhiều tệp cùng lúc.

Báo cáo tổng hợp gồm đủ các mảng: tình hình nộp báo cáo, ngày giờ công và tiết dạy, hồ sơ giáo án,
chất lượng bộ môn (cộng dồn và so sánh giữa các tổ, kèm tỉ lệ đạt trở lên), dự giờ – thao giảng –
chuyên đề, phụ đạo học sinh chưa đạt, tự đánh giá của các tổ, đề xuất kiến nghị, kế hoạch tháng tới,
cuối cùng là đánh giá và chỉ đạo của Ban Giám hiệu. Văn bản ký tên Hiệu trưởng, số hiệu BC-CM.

## 5a. Tệp giáo án

Nên tải giáo án lên Google Drive rồi dán liên kết (đặt quyền "Bất kỳ ai có liên kết" để cả tổ xem được).
Tệp đính kèm trực tiếp chỉ nhận dưới 0,6 MB vì được lưu kèm trong bản ghi.

## 6b. In trực tiếp

Ở mục Biên bản có nút **In** — khi in, phần mềm chỉ in khung văn bản, không in thanh menu và các bảng
thao tác. Có thể chọn "Lưu thành PDF" trong hộp thoại in của trình duyệt.

Lần chạy đầu tiên máy cần có Internet để tải phông chữ và thư viện đọc Excel; sau đó trình duyệt giữ lại
trong bộ nhớ đệm. Nếu mất mạng ngay lần đầu, các nút liên quan đến Excel sẽ báo lỗi rõ ràng.

## 7. Sao lưu

Cài đặt → **Tải bản sao (.json)**. Nên tải vào cuối mỗi học kỳ và đặt tên theo năm học để lưu trữ.
Cần dùng lại thì dùng nút Phục hồi ở cùng chỗ.

---

Lương Khánh Tường- An Giang. Liên hệ cài đặt Free: ĐT/Zalo 0916780807
