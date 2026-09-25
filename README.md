# Quản lý Tổ chuyên môn — web tĩnh, chạy trên hosting miễn phí

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

## 2. Đưa lên hosting

| Nơi lưu trữ | Cách làm |
|---|---|
| **Netlify Drop** (nhanh nhất) | Vào app.netlify.com/drop, kéo thả cả thư mục, có ngay địa chỉ web |
| **Firebase Hosting** | `firebase init hosting` → thư mục public là thư mục này → `firebase deploy` |
| **GitHub Pages** | Đẩy lên kho mã, bật Pages ở nhánh `main`, thư mục `/root` |
| **Hosting cPanel** | Tải cả thư mục vào `public_html` |

Đăng nhập lần đầu: **admin / admin@123** — vào Cài đặt đổi mật khẩu ngay.

## 3. Hai chế độ lưu dữ liệu

Mở `js/config.js`, dòng `mode`:

**`"local"`** — dữ liệu nằm trong trình duyệt của máy đang dùng. Chạy được ngay, không cần đăng ký gì,
nhưng **mỗi máy một kho dữ liệu riêng**. Chỉ nên dùng để chạy thử hoặc khi một mình tổ trưởng nhập liệu.

**`"firebase"`** — cả tổ dùng chung một kho. Các bước:

1. console.firebase.google.com → **Add project** (gói Spark miễn phí là đủ).
2. Build → **Firestore Database** → Create database → chọn **Nam-Asia (Singapore)**.
3. Project settings → mục **Your apps** → chọn Web `</>` → sao chép khối `firebaseConfig`.
4. Dán vào `js/config.js`, đổi `mode: "firebase"`, tải lại lên hosting.
5. Firestore → tab **Rules**, dán:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} { allow read, write: if true; }
  }
}
```

> Lưu ý thật lòng: bộ quy tắc trên mở cho mọi người có địa chỉ web. Mật khẩu trong hệ thống được
> băm SHA-256 nên không đọc ngược ra được, nhưng ai có địa chỉ web vẫn có thể ghi dữ liệu.
> Phù hợp với phạm vi nội bộ một tổ chuyên môn; nếu cần chặt hơn thì chuyển sang Firebase
> Authentication và siết Rules theo `request.auth.uid`.

Dung lượng Firestore miễn phí là 1 GB, thừa sức cho vài chục nghìn bản ghi hồ sơ.

## 2b. Chia sẻ đường dẫn cho cả trường

**Chế độ `local` không chia sẻ được.** Mỗi trình duyệt giữ một kho riêng, nên người khác mở đường dẫn
sẽ không đăng nhập được bằng tài khoản bạn đã cấp — trang đăng nhập sẽ hiện cảnh báo đỏ khi rơi vào
tình huống này.

Cách xử lý: đăng nhập bằng tài khoản quản trị → **Cài đặt → Dùng chung cho cả trường** → làm theo 4
bước ngay trên màn hình → dán khối `firebaseConfig` → bấm **Tạo tệp config.js** → tải tệp lên hosting
thay cho `js/config.js` cũ. Không cần tự gõ mã.

Trước khi đổi, bấm **Tải bản sao (.json)** ở khung Sao lưu; sau khi chạy Firebase xong thì dùng nút
Phục hồi để nạp lại dữ liệu đã nhập.

## 3b. Năm học và danh sách tháng

Danh sách tháng ở mọi mục (báo cáo, biên bản, chuyên đề, tổng hợp) chạy từ **tháng 8 năm đầu đến
tháng 7 năm sau** của năm học đang đặt trong **Cài đặt**. Đặt sai năm học thì các ô chọn tháng sẽ lệch.

Để trống `namHoc` trong `js/config.js` thì phần mềm tự tính theo ngày máy: từ tháng 8 trở đi tính là
năm học mới, trước tháng 8 vẫn thuộc năm học cũ.

## 4. Vai trò và quyền

| Vai trò | Được làm |
|---|---|
| **Giáo viên** | Nộp báo cáo tháng, nộp giáo án, ghi phiếu dự giờ, nhập điểm lớp mình, xem kho giáo án đã duyệt |
| **Thư ký** | Xem hồ sơ cả tổ, lập và xuất biên bản, xuất báo cáo tổ |
| **Tổ trưởng** | Thêm quyền duyệt giáo án, giao việc, nộp báo cáo tổ lên trường, sửa cài đặt đơn vị |
| **Hiệu trưởng / Phó Hiệu trưởng** | Xem hồ sơ các tổ, nhận báo cáo của mọi tổ, xuất báo cáo tổng hợp và biên bản họp chuyên môn toàn trường |
| **Thư ký hội đồng** | Tổng hợp báo cáo các tổ và lập, xuất biên bản họp chuyên môn toàn trường (ký Thư ký – Hiệu trưởng) |
| **Quản trị** | Toàn quyền, cấp và khoá tài khoản |

Khi cấp tài khoản nhớ điền ô **Tổ chuyên môn** — đây là căn cứ để hệ thống tách số liệu của từng tổ.
Danh sách các tổ toàn trường khai trong **Cài đặt** để hiệu trưởng biết tổ nào chưa nộp.

## 5. Quy trình một tháng

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

## 5b. Hai cách đưa báo cáo tổ lên cấp trường

**Cách 1 — cả trường dùng chung một bản cài** (khuyên dùng, chế độ Firebase): tổ trưởng bấm
*Nộp lên trường*, báo cáo hiện ngay ở trang của hiệu trưởng.

**Cách 2 — mỗi tổ cài một bản riêng**: tổ trưởng bấm *Tải gói báo cáo (.json)* rồi gửi tệp qua
Zalo/email; hiệu trưởng vào **Tổng hợp các tổ** → *Nhận gói báo cáo (.json)*, chọn nhiều tệp cùng lúc.

Báo cáo tổng hợp gồm đủ các mảng: tình hình nộp báo cáo, ngày giờ công và tiết dạy, hồ sơ giáo án,
chất lượng bộ môn (cộng dồn và so sánh giữa các tổ, kèm tỉ lệ đạt trở lên), dự giờ – thao giảng –
chuyên đề, phụ đạo học sinh chưa đạt, tự đánh giá của các tổ, đề xuất kiến nghị, kế hoạch tháng tới,
cuối cùng là đánh giá và chỉ đạo của Ban Giám hiệu. Văn bản ký tên Hiệu trưởng, số hiệu BC-CM.

## 6. Tệp giáo án

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

Lương Khánh Tường · ĐT/Zalo 0916780807
