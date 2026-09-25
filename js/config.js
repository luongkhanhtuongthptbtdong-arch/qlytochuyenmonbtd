/* =========================================================
   CẤU HÌNH — dự án Firebase: qlytochuyenmonbtd
   Đặt tệp này vào thư mục js/ trên hosting, thay tệp cũ.
   ========================================================= */
window.APP_CONFIG = {

  /* "firebase" = cả trường dùng chung một kho dữ liệu */
  mode: "firebase",

  firebase: {
    apiKey: "AIzaSyCyvbYK5tjM2lHV-ccf_IR6PDj1Ch3IteU",
    authDomain: "qlytochuyenmonbtd.firebaseapp.com",
    projectId: "qlytochuyenmonbtd",
    storageBucket: "qlytochuyenmonbtd.firebasestorage.app",
    messagingSenderId: "1004814390389",
    appId: "1:1004814390389:web:edbd6d0b05d0aa921c143c"
  },

  /* Tiền tố tên bộ sưu tập trên Firestore */
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
    hanBaoCao: 25,
    hanGiaoAn: 5
  }
};
