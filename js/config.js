/* =========================================================
   CẤU HÌNH — sửa tệp này trước khi đưa lên hosting
   ========================================================= */
window.APP_CONFIG = {

  /* Chế độ lưu dữ liệu:
     "local"    – lưu ngay trong trình duyệt của máy đang dùng.
                  Chạy được ngay, không cần đăng ký gì. Dùng để thử
                  hoặc khi chỉ một người nhập liệu.
     "firebase" – lưu trên Firestore, mọi giáo viên dùng chung dữ liệu.
                  Điền khối firebase bên dưới rồi đổi thành "firebase". */
  mode: "local",

  firebase: {
    apiKey: "",
    authDomain: "",
    projectId: "",
    storageBucket: "",
    messagingSenderId: "",
    appId: ""
  },

  /* Tiền tố tên bộ sưu tập trên Firestore — đổi nếu một dự án Firebase
     dùng cho nhiều tổ (vd: "toan_", "ly_"). */
  prefix: "tcm_",

  /* Thông tin mặc định, sau khi đăng nhập vào Cài đặt sửa lại cho đúng */
  defaults: {
    so: "SỞ GIÁO DỤC VÀ ĐÀO TẠO AN GIANG",
    truong: "TRƯỜNG THPT BÌNH THẠNH ĐÔNG",
    to: "TỔ TOÁN",
    namHoc: "",            // để trống thì phần mềm tự tính theo ngày hệ thống
    diaDanh: "An Giang",
    hieuTruong: "",
    toTruong: "",
    thuKy: "",
    nguongYeu: 5.0,
    hanBaoCao: 25,       // ngày hằng tháng phải nộp báo cáo
    hanGiaoAn: 5         // nộp giáo án trước tiết dạy bao nhiêu ngày
  }
};
