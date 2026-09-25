# Quản lý Tổ chuyên môn 

Toàn bộ phần mềm là HTML + CSS + JavaScript thuần, không cần máy chủ PHP hay cơ sở dữ liệu riêng.
Chỉ cần chép nguyên thư mục lên hosting là chạy.

## 1. Cây thư mục

```
index.html            trang chính
css/style.css         giao diện
js/config.js          ← TỆP DUY NHẤT CẦN SỬA
js/core.js            lưu trữ, đăng nhập, tiện ích
js/export.js          xuất Word đúng thể thức Nghị định 30/2020
js/pages-hoso.js      tổng quan, báo cáo tháng, giáo án, dự giờ
js/pages-chatluong.js điểm, thống kê, lọc học sinh chưa đạt
js/pages-quantri.js   giao việc, biên bản, báo cáo tổ, tài khoản, cài đặt
js/pages-truong.js    tổng hợp báo cáo các tổ + biên bản họp chuyên môn toàn trường
js/app.js             menu và điều hướng
```

## 2. Quy trình 

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
8. Hiệu trưởng, Phó Hiệu trưởng hoặc Thư ký hội đồng vào **Tổng hợp các tổ**: tích chọn các tổ, chọn những mảng cần đưa vào, xem trước và
   **Xuất báo cáo tổng hợp** (Word) hoặc **Xuất bảng số liệu Excel**.
9. Sau cuộc họp chuyên môn toàn trường, thư ký hội đồng vào **Biên bản chuyên môn**: chọn tháng, chọn
   các tổ, nhập thời gian – thành phần – ý kiến – kết luận, xuất Word (ký Thư ký và Hiệu trưởng) hoặc in.

## 3. Tệp giáo án

Nên tải giáo án lên Google Drive rồi dán liên kết (đặt quyền "Bất kỳ ai có liên kết" để cả tổ xem được).
Tệp đính kèm trực tiếp chỉ nhận dưới 0,6 MB vì được lưu kèm trong bản ghi.

## 4. In trực tiếp

Ở mục Biên bản có nút **In** — khi in, phần mềm chỉ in khung văn bản, không in thanh menu và các bảng
thao tác. Có thể chọn "Lưu thành PDF" trong hộp thoại in của trình duyệt.

Lần chạy đầu tiên máy cần có Internet để tải phông chữ và thư viện đọc Excel; sau đó trình duyệt giữ lại
trong bộ nhớ đệm. Nếu mất mạng ngay lần đầu, các nút liên quan đến Excel sẽ báo lỗi rõ ràng.

## 5. Sao lưu

Cài đặt → **Tải bản sao (.json)**. Nên tải vào cuối mỗi học kỳ và đặt tên theo năm học để lưu trữ.
Cần dùng lại thì dùng nút Phục hồi ở cùng chỗ.

---

Lương Khánh Tường · ĐT/Zalo 0916780807
