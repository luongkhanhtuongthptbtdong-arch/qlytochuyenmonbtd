/* =========================================================
   KẾT XUẤT VĂN BẢN
   Thể thức theo Nghị định 30/2020/NĐ-CP: khổ A4, Times New Roman
   cỡ 13–14, lề trái 30mm, phải 20mm, trên 20mm, dưới 20mm.
   ========================================================= */
const Doc = {

  /* Kiểu dùng chung cho tệp Word xuất ra (Word không đọc CSS ngoài) */
  cssWord: `
@page{size:21cm 29.7cm; margin:2cm 2cm 2cm 3cm;}
body{font-family:"Times New Roman",serif; font-size:14pt; line-height:1.5; color:#000}
p{margin:0 0 6pt; text-align:justify}
.qh{text-align:center;font-weight:bold;font-size:13pt;text-transform:uppercase}
.tn{text-align:center;font-weight:bold;font-size:14pt;border-bottom:1px solid #000;display:inline-block;padding-bottom:2pt}
.tn-wrap{text-align:center}
.co-quan{text-align:center;font-size:13pt;text-transform:uppercase}
.co-quan b{display:block;border-bottom:1px solid #000;padding-bottom:2pt}
.tieude{text-align:center;font-size:16pt;font-weight:bold;text-transform:uppercase;margin:18pt 0 3pt}
.phu-de{text-align:center;font-style:italic;margin-bottom:12pt}
.muc{font-weight:bold;margin:10pt 0 4pt}
table{width:100%;border-collapse:collapse;font-size:12.5pt;margin:6pt 0 10pt}
th,td{border:1px solid #000;padding:3pt 5pt}
th{text-align:center;font-weight:bold;background:#F2F2F2}
.num{text-align:center}
.ky td{border:0;text-align:center;vertical-align:top;padding-top:12pt}
.ky b{text-transform:uppercase}
.ky em{display:block;font-style:normal;font-weight:bold;margin-top:60pt}
.nghieng{font-style:italic}
`,

  /* Bọc nội dung thành tệp .doc mở được bằng Word */
  taiWord(tenFile, tieuDe, thanHTML){
    const html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
<head><meta charset="utf-8"><title>${U.esc(tieuDe)}</title><style>${Doc.cssWord}</style></head>
<body>${thanHTML}</body></html>`;
    U.tai(tenFile, "\ufeff" + html, "application/msword;charset=utf-8");
  },

  /* Phần đầu: cơ quan ban hành – quốc hiệu – tiêu ngữ */
  dauVanBan(soVB, loaiVB, ngay){
    const s = Store.settings;
    const d = ngay ? new Date(ngay) : new Date();
    const ng = isNaN(d) ? new Date() : d;
    return `<table style="border:0;width:100%"><tr>
      <td style="border:0;width:50%" class="co-quan">
        ${U.esc(s.so||"")}<br><b>${U.esc(s.truong||"")}</b>
        <div style="margin-top:6pt;font-size:13pt;text-transform:none">Số: ${U.esc(soVB||"…")}/${U.esc(loaiVB||"BB-TCM")}</div>
      </td>
      <td style="border:0;width:50%;text-align:center">
        <div class="qh">Cộng hoà xã hội chủ nghĩa Việt Nam</div>
        <div class="tn-wrap"><span class="tn">Độc lập - Tự do - Hạnh phúc</span></div>
        <div style="margin-top:8pt;font-style:italic;font-size:13pt">${U.esc(s.diaDanh||"")}, ngày ${ng.getDate()} tháng ${ng.getMonth()+1} năm ${ng.getFullYear()}</div>
      </td>
    </tr></table>`;
  },

  /* Ô ký cuối văn bản */
  oKy(traiTen, traiChuc, phaiTen, phaiChuc){
    return `<table class="ky" style="width:100%;border:0"><tr>
      <td style="width:50%"><b>${U.esc(traiChuc)}</b><em>${U.esc(traiTen||"")}</em></td>
      <td style="width:50%"><b>${U.esc(phaiChuc)}</b><em>${U.esc(phaiTen||"")}</em></td>
    </tr></table>`;
  }
};

/* ---------- Các loại văn bản ---------- */
const Xuat = {

  /* ===== BIÊN BẢN HỌP TỔ ===== */
  thanBienBan(bb){
    const s = Store.settings;
    const muc = (bb.mucs||[]).map((m,i) =>
      `<div class="muc">${toLaMa(i+1)}. ${U.esc(m.tieuDe)}</div>${m.html || `<p>${U.esc(m.noiDung||"").replace(/\n/g,"</p><p>")}</p>`}`
    ).join("");
    return `
${Doc.dauVanBan(bb.so, "BB-TCM", bb.ngay)}
<div class="tieude">Biên bản họp tổ chuyên môn</div>
<div class="phu-de">${U.esc(bb.tenPhien || ("Kỳ họp " + U.tenThang(bb.thang)))}</div>
<p>Thời gian: ${U.esc(bb.gioBD||"…")} ngày ${U.dmy(bb.ngay)}.</p>
<p>Địa điểm: ${U.esc(bb.diaDiem||"Phòng họp tổ chuyên môn, " + (s.truong||""))}.</p>
<p>Chủ trì: ${U.esc(bb.chuTri||s.toTruong||"…")} - Tổ trưởng chuyên môn.</p>
<p>Thư ký: ${U.esc(bb.thuKy||s.thuKy||"…")}.</p>
<p>Thành phần: ${U.esc(bb.thanhPhan||"Toàn thể giáo viên " + (s.to||"tổ chuyên môn"))}. Có mặt: ${bb.coMat||"…"}; vắng: ${U.esc(bb.vangMat||"không")}.</p>
<div class="muc">NỘI DUNG</div>
${muc}
<p style="margin-top:10pt">Biên bản kết thúc lúc ${U.esc(bb.gioKT||"…")} cùng ngày, đã thông qua trước toàn thể thành viên dự họp và nhất trí ${bb.tyLeNhatTri||"100"}%.</p>
${Doc.oKy(bb.thuKy||s.thuKy, "Thư ký", bb.chuTri||s.toTruong, "Tổ trưởng chuyên môn")}
`;
  },
  bienBan(bb){
    Doc.taiWord(`BienBan_HopTo_${(bb.thang||"").replace("-","_")}.doc`, "Biên bản họp tổ", Xuat.thanBienBan(bb));
    Store.log("Xuất biên bản", bb.thang || "");
  },

  /* ===== BÁO CÁO CÔNG TÁC THÁNG CỦA TỔ ===== */
  thanBaoCaoTo(bc){
    const s = Store.settings;
    const muc = (bc.mucs||[]).map((m,i) =>
      `<div class="muc">${toLaMa(i+1)}. ${U.esc(m.tieuDe)}</div>${m.html || `<p>${U.esc(m.noiDung||"").replace(/\n/g,"</p><p>")}</p>`}`
    ).join("");
    return `
${Doc.dauVanBan(bc.so, "BC-TCM")}
<div class="tieude">Báo cáo</div>
<div class="phu-de">Kết quả thực hiện nhiệm vụ chuyên môn ${U.tenThang(bc.thang)}<br>và phương hướng tháng tiếp theo</div>
<p>Kính gửi: Ban Giám hiệu ${U.esc(s.truong||"")}.</p>
<p>Thực hiện kế hoạch chuyên môn năm học ${U.esc(s.namHoc||"")}, ${U.esc(s.to||"tổ chuyên môn")} báo cáo kết quả công tác ${U.tenThang(bc.thang)} như sau:</p>
${muc}
${Doc.oKy("", "", bc.nguoiKy||s.toTruong, "Tổ trưởng chuyên môn")}
`;
  },
  baoCaoTo(bc){
    Doc.taiWord(`BaoCao_To_${(bc.thang||"").replace("-","_")}.doc`, "Báo cáo tổ chuyên môn", Xuat.thanBaoCaoTo(bc));
    Store.log("Xuất báo cáo tổ", bc.thang || "");
  },

  /* ===== DANH SÁCH HỌC SINH CHƯA ĐẠT + KẾ HOẠCH PHỤ ĐẠO ===== */
  hsYeu(ds, meta){
    const hang = ds.map((h,i) => `<tr>
      <td class="num">${i+1}</td><td>${U.esc(h.hoTen)}</td><td class="num">${U.esc(h.lop)}</td>
      <td class="num">${U.so(h.diem)}</td><td>${U.esc(h.nguyenNhan||"")}</td><td>${U.esc(h.bienPhap||"")}</td>
    </tr>`).join("");
    const than = `
${Doc.dauVanBan(meta.so, "BC-TCM")}
<div class="tieude">Danh sách học sinh chưa đạt yêu cầu</div>
<div class="phu-de">Môn ${U.esc(meta.mon||"")} - ${U.esc(meta.dot||"")} - Năm học ${U.esc(Store.settings.namHoc||"")}</div>
<p>Tiêu chí lọc: điểm dưới ${U.so(meta.nguong)}. Tổng số: ${ds.length} học sinh.</p>
<table><thead><tr><th style="width:6%">TT</th><th>Họ và tên</th><th style="width:9%">Lớp</th><th style="width:10%">Điểm</th><th style="width:24%">Nguyên nhân</th><th style="width:26%">Biện pháp hỗ trợ</th></tr></thead>
<tbody>${hang || `<tr><td colspan="6" class="num">(không có)</td></tr>`}</tbody></table>
${Doc.oKy(meta.nguoiLap||Auth.me?.hoTen, "Người lập", Store.settings.toTruong, "Tổ trưởng chuyên môn")}`;
    Doc.taiWord(`DS_HocSinh_ChuaDat_${(meta.dot||"").replace(/\s+/g,"")}.doc`, "Danh sách học sinh chưa đạt", than);
  },

  /* ===== PHIẾU DỰ GIỜ ===== */
  phieuDuGio(p){
    const than = `
${Doc.dauVanBan("", "PDG-TCM")}
<div class="tieude">Phiếu dự giờ</div>
<div class="phu-de">Năm học ${U.esc(Store.settings.namHoc||"")}</div>
<p>Người dạy: ${U.esc(p.nguoiDay)} — Môn: ${U.esc(p.mon||"")}</p>
<p>Lớp: ${U.esc(p.lop)} — Tiết: ${U.esc(p.tiet)} — Ngày dạy: ${U.dmy(p.ngay)}</p>
<p>Tên bài dạy: ${U.esc(p.tenBai)}</p>
<p>Người dự: ${U.esc(p.nguoiDu)}</p>
<div class="muc">1. Ưu điểm</div><p>${U.esc(p.uuDiem||"").replace(/\n/g,"</p><p>")}</p>
<div class="muc">2. Hạn chế, góp ý</div><p>${U.esc(p.tonTai||"").replace(/\n/g,"</p><p>")}</p>
<div class="muc">3. Đánh giá chung</div>
<p>Tổng điểm: ${U.so(p.diem)}/20 — Xếp loại: <b>${U.esc(p.xepLoai||"")}</b></p>
${Doc.oKy(p.nguoiDay, "Người dạy", p.nguoiDu, "Người dự giờ")}`;
    Doc.taiWord(`PhieuDuGio_${U.esc(p.nguoiDay).replace(/\s+/g,"")}.doc`, "Phiếu dự giờ", than);
  },

  /* ===== BÁO CÁO TỔNG HỢP CHUYÊN MÔN TOÀN TRƯỜNG (hiệu trưởng) ===== */
  thanTongHop(th){
    const s = Store.settings;
    const muc = (th.mucs||[]).map((m,i) =>
      `<div class="muc">${toLaMa(i+1)}. ${U.esc(m.tieuDe)}</div>${m.html || `<p>${U.esc(m.noiDung||"").replace(/\n/g,"</p><p>")}</p>`}`
    ).join("");
    return `
${Doc.dauVanBan(th.so, "BC-CM")}
<div class="tieude">Báo cáo</div>
<div class="phu-de">Tổng hợp công tác chuyên môn các tổ ${U.tenThang(th.thang)}<br>Năm học ${U.esc(s.namHoc||"")}</div>
<p>Trên cơ sở báo cáo của ${th.soTo||0} tổ chuyên môn, ${U.esc(s.truong||"nhà trường")} tổng hợp kết quả thực hiện nhiệm vụ chuyên môn ${U.tenThang(th.thang)} như sau:</p>
${muc}
${Doc.oKy("", "", th.nguoiKy || s.hieuTruong, "Hiệu trưởng")}
`;
  },
  tongHop(th){
    Doc.taiWord(`BaoCao_TongHop_ChuyenMon_${(th.thang||"").replace("-","_")}.doc`, "Báo cáo tổng hợp chuyên môn", Xuat.thanTongHop(th));
    Store.log("Xuất báo cáo tổng hợp toàn trường", th.thang || "");
  },

  /* ===== BIÊN BẢN HỌP CHUYÊN MÔN TOÀN TRƯỜNG (thư ký hội đồng) ===== */
  thanBienBanTruong(bb){
    const s = Store.settings;
    const muc = (bb.mucs||[]).map((m,i) =>
      `<div class="muc">${toLaMa(i+1)}. ${U.esc(m.tieuDe)}</div>${m.html || `<p>${U.esc(m.noiDung||"").replace(/\n/g,"</p><p>")}</p>`}`
    ).join("");
    return `
${Doc.dauVanBan(bb.so, "BB-CM", bb.ngay)}
<div class="tieude">Biên bản</div>
<div class="phu-de">${U.esc(bb.tenPhien || ("Họp chuyên môn toàn trường " + U.tenThang(bb.thang)))}<br>Năm học ${U.esc(s.namHoc||"")}</div>
<p>Thời gian: ${U.esc(bb.gioBD||"…")} ngày ${U.dmy(bb.ngay)}.</p>
<p>Địa điểm: ${U.esc(bb.diaDiem||("Hội trường " + (s.truong||"")))}.</p>
<p>Chủ trì: ${U.esc(bb.chuTri||s.hieuTruong||"…")} - Hiệu trưởng.</p>
<p>Thư ký: ${U.esc(bb.thuKy||"…")}.</p>
<p>Thành phần: ${U.esc(bb.thanhPhan||"Ban Giám hiệu và tổ trưởng các tổ chuyên môn")}. Có mặt: ${U.esc(bb.coMat||"…")}; vắng: ${U.esc(bb.vangMat||"không")}.</p>
<p>Trên cơ sở báo cáo của ${bb.soTo||0} tổ chuyên môn, hội nghị đã nghe và thảo luận các nội dung sau:</p>
<div class="muc">NỘI DUNG</div>
${muc}
<p style="margin-top:10pt">Biên bản kết thúc lúc ${U.esc(bb.gioKT||"…")} cùng ngày, đã thông qua trước hội nghị và nhất trí ${bb.tyLeNhatTri||"100"}%.</p>
${Doc.oKy(bb.thuKy, "Thư ký", bb.chuTri||s.hieuTruong, "Hiệu trưởng")}
`;
  },
  bienBanTruong(bb){
    Doc.taiWord(`BienBan_ChuyenMon_ToanTruong_${(bb.thang||"").replace("-","_")}.doc`, "Biên bản họp chuyên môn toàn trường", Xuat.thanBienBanTruong(bb));
    Store.log("Xuất biên bản chuyên môn toàn trường", bb.thang || "");
  },

  /* ===== BẢNG THỐNG KÊ CHẤT LƯỢNG ===== */
  thongKeChatLuong(bang, meta){
    const b = MUC.bang();
    const th = b.map(m => `<th>${m.ten}</th><th>%</th>`).join("");
    const hang = bang.map((r,i) => {
      const tk = r.tk;
      return `<tr><td class="num">${i+1}</td><td>${U.esc(r.lop)}</td><td>${U.esc(r.gv||"")}</td><td class="num">${tk.n}</td>` +
        b.map(m => `<td class="num">${tk.dem[m.ten]}</td><td class="num">${U.tyle(tk.dem[m.ten],tk.n).toFixed(1)}</td>`).join("") +
        `<td class="num">${U.so(r.tb)}</td></tr>`;
    }).join("");
    const than = `
${Doc.dauVanBan(meta.so, "BC-TCM")}
<div class="tieude">Báo cáo thống kê chất lượng bộ môn</div>
<div class="phu-de">${U.esc(meta.dot||"")} - Môn ${U.esc(meta.mon||"")} - Năm học ${U.esc(Store.settings.namHoc||"")}</div>
<table><thead><tr><th style="width:5%">TT</th><th>Lớp</th><th>Giáo viên</th><th>Sĩ số</th>${th}<th>TB chung</th></tr></thead>
<tbody>${hang}</tbody></table>
<p class="nghieng">Thang đánh giá: ${b.map(m=>`${m.ten} từ ${U.so(m.min)}`).join("; ")}.</p>
${Doc.oKy("", "", Store.settings.toTruong, "Tổ trưởng chuyên môn")}`;
    Doc.taiWord(`ThongKe_ChatLuong_${(meta.dot||"").replace(/\s+/g,"")}.doc`, "Thống kê chất lượng", than);
  }
};

function toLaMa(n){
  const m = ["","I","II","III","IV","V","VI","VII","VIII","IX","X","XI","XII"];
  return m[n] || n;
}
