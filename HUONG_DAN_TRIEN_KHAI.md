# Hướng dẫn đưa phần mềm lên mạng cho cả trường dùng

Làm một lần duy nhất, mất khoảng 30 phút. Sau đó mọi giáo viên chỉ cần mở một đường dẫn.

Toàn bộ đều miễn phí: GitHub Pages cho trang web, Firebase Firestore (gói Spark) cho kho dữ liệu.

---

## Phần 1 — Tạo kho dữ liệu dùng chung (Firebase)

Đây là bước quyết định. Nếu bỏ qua, mỗi người mở đường dẫn sẽ có một kho riêng và **không đăng nhập
được bằng tài khoản do quản trị cấp**.

1. Vào `console.firebase.google.com`, đăng nhập bằng Gmail của trường.
2. Bấm **Add project** → đặt tên, ví dụ `qly-to-chuyen-mon-btd` → Continue.
   Màn hình Google Analytics bấm **Disable** cho gọn → Create project.
3. Cột trái chọn **Build → Firestore Database** → **Create database**.
   - Location: chọn **asia-southeast1 (Singapore)**.
   - Chọn **Start in test mode** → Enable.
4. Bấm biểu tượng bánh răng ⚙ góc trên trái → **Project settings**.
   Kéo xuống mục **Your apps**, bấm biểu tượng web `</>`.
   - App nickname: gõ `web` → **Register app**.
   - Màn hình hiện ra một khối mã, sao chép **toàn bộ phần `const firebaseConfig = { ... };`**

5. Mở phần mềm (bản đang chạy trên máy anh cũng được), đăng nhập **admin / admin@123**
   → **Cài đặt → Dùng chung cho cả trường** → dán khối vừa sao chép vào ô
   → bấm **Tạo tệp config.js**. Máy sẽ tải về tệp `config.js`.

6. Quay lại Firestore → tab **Rules**, dán đoạn sau rồi bấm **Publish**:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} { allow read, write: if true; }
  }
}
```

> Test mode tự khoá sau 30 ngày; dán đoạn trên là không bị khoá nữa. Đây là mức bảo mật nội bộ:
> ai có đường dẫn đều ghi được dữ liệu, nhưng mật khẩu đã được băm SHA-256 nên không đọc ngược ra được.
> Đừng công bố đường dẫn ra ngoài phạm vi nhà trường.

---

## Phần 2 — Đưa trang web lên GitHub Pages

1. Vào `github.com`, đăng nhập (hoặc bấm **Sign up** tạo tài khoản, miễn phí).
2. Bấm dấu **+** góc phải trên → **New repository**.
   - Repository name: `qlytochuyenmon`
   - Chọn **Public** (Pages miễn phí yêu cầu công khai) → **Create repository**.
3. Ở trang kho vừa tạo, bấm **uploading an existing file**.
4. Giải nén gói phần mềm, rồi **kéo thả toàn bộ nội dung bên trong thư mục** (tệp `index.html`,
   thư mục `css`, thư mục `js`) vào ô upload. Lưu ý: kéo các tệp bên trong, không kéo cả thư mục mẹ —
   `index.html` phải nằm ở gốc kho.
5. Bấm **Commit changes**.
6. **Thay tệp cấu hình**: vào thư mục `js` trong kho → mở `config.js` → bấm biểu tượng thùng rác xoá đi
   → quay ra thư mục `js` → **Add file → Upload files** → tải tệp `config.js` mới (tệp phần mềm đã tạo ở
   Phần 1 bước 5) → Commit.
7. Vào tab **Settings** của kho → mục **Pages** (cột trái):
   - Source: **Deploy from a branch**
   - Branch: **main**, thư mục **/ (root)** → **Save**.
8. Chờ 1–2 phút, tải lại trang Settings → Pages sẽ hiện đường dẫn dạng:
   `https://<tên-tài-khoản>.github.io/qlytochuyenmon/`

Mở thử đường dẫn đó. Nếu góc phải trên hiện chữ **Dùng chung** (không phải "Cục bộ") là đã thành công.

---

## Phần 3 — Cấp tài khoản cho cả trường

Mở đường dẫn, đăng nhập **admin / admin@123**.

1. **Cài đặt** → khai đầy đủ: cơ quan chủ quản, tên trường, địa danh, năm học, họ tên Hiệu trưởng,
   Phó Hiệu trưởng, Thư ký hội đồng, thang đánh giá, ngưỡng điểm chưa đạt, hạn nộp báo cáo.
   Ô **Danh sách tổ chuyên môn** gõ mỗi dòng một tổ:

   ```
   Tổ Toán
   Tổ Ngữ văn
   Tổ Tiếng Anh
   Tổ Lý - Hoá - Sinh
   ...
   ```

   Đây là căn cứ để hệ thống báo tổ nào chưa nộp báo cáo.
   Đổi luôn mật khẩu admin ở khung **Mật khẩu của tôi**.

2. **Tài khoản** → cấp cho từng người. Bắt buộc điền ô **Tổ chuyên môn** đúng tên tổ đã khai.

   | Người | Vai trò chọn |
   |---|---|
   | Hiệu trưởng | Hiệu trưởng |
   | Phó Hiệu trưởng phụ trách chuyên môn | Phó Hiệu trưởng |
   | Thư ký hội đồng sư phạm | Thư ký hội đồng |
   | Tổ trưởng từng tổ | Tổ trưởng |
   | Thư ký từng tổ | Thư ký tổ |
   | Giáo viên còn lại | Giáo viên |

   Nhiều người thì bấm **Tải mẫu nhập hàng loạt**, điền vào Excel rồi nhập một lượt.
   Mật khẩu ban đầu đặt giống nhau cho dễ phát, dặn mọi người đăng nhập xong đổi ngay
   ở Cài đặt → Mật khẩu của tôi.

3. Gửi cho giáo viên qua Zalo nhóm: đường dẫn + tên đăng nhập + mật khẩu.

---

## Phần 4 — Hiệu trưởng xem tổng kết như thế nào

Luồng chạy trong tháng:

1. **Giáo viên** nộp Báo cáo tháng, Giáo án, Phiếu dự giờ; nhập điểm sau mỗi đợt kiểm tra.
2. **Tổ trưởng** duyệt giáo án, xem thống kê chất lượng giữa các lớp, lọc học sinh chưa đạt.
3. **Thư ký tổ** vào *Biên bản họp tổ*, tích chọn nội dung → xuất Word.
4. **Tổ trưởng** vào *Báo cáo tổ* → xem trước → **Nộp lên trường**.
5. **Hiệu trưởng / Phó Hiệu trưởng / Thư ký hội đồng** đăng nhập, vào nhóm **TOÀN TRƯỜNG**:
   - **Tổng hợp các tổ**: thấy ngay 4 ô số liệu toàn trường, bảng so sánh giữa các tổ, và dòng cảnh báo
     tổ nào chưa nộp. Tích chọn tổ cần gộp → **Xuất báo cáo tổng hợp** (Word, ký Hiệu trưởng) hoặc
     **Xuất bảng số liệu Excel**.
   - **Biên bản chuyên môn**: thư ký hội đồng lập biên bản họp chuyên môn toàn trường, số liệu tự lấy
     từ báo cáo các tổ, xuất Word ký Thư ký – Hiệu trưởng.

Ban Giám hiệu cũng xem được trực tiếp hồ sơ của mọi tổ ở các mục Giáo án, Điểm & thống kê,
Học sinh chưa đạt, Phiếu dự giờ.

Khi có người vừa nộp mà màn hình chưa thấy, bấm nút **⟳** ở góc phải trên để tải lại dữ liệu.

---

## Phần 5 — Trường hợp mỗi tổ cài một bản riêng

Nếu không muốn dùng chung một kho, mỗi tổ có thể tự chạy một bản (chế độ cục bộ). Khi đó:

- Tổ trưởng vào *Báo cáo tổ* → **Tải gói báo cáo (.json)** → gửi tệp cho văn phòng qua Zalo/email.
- Ban Giám hiệu vào *Tổng hợp các tổ* → **Nhận gói báo cáo (.json)** → chọn cùng lúc nhiều tệp.
  Kết quả gộp giống hệt cách nộp trực tiếp.

---

## Sửa chữa và bảo trì

| Tình huống | Cách xử lý |
|---|---|
| Sửa đổi phần mềm | Tải tệp mới lên kho GitHub (Add file → Upload files, trùng tên là ghi đè), mọi người bấm Ctrl+F5 |
| Giáo viên quên mật khẩu | Quản trị vào Tài khoản → **Đổi mật khẩu** |
| Giáo viên chuyển trường | Tài khoản → **Khoá** (giữ lại dữ liệu cũ) |
| Cuối học kỳ | Cài đặt → **Tải bản sao (.json)**, đặt tên theo năm học để lưu trữ |
| Sang năm học mới | Cài đặt → đổi **Năm học**; danh sách tháng tự chuyển theo |

---

Lương Khánh Tường · ĐT/Zalo 0916780807
