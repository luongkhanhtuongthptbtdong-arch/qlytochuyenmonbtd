/* =========================================================
   CẤP TRƯỜNG: gộp báo cáo của các tổ chuyên môn
   thành một báo cáo tổng hợp cho hiệu trưởng
   ========================================================= */

/* ---- Số liệu tóm tắt của một tổ trong một tháng ---- */
Bien.soLieu = function(thang, to){
  const cuaTo = uid => (Store.get("users", uid)?.to || Store.settings.to || "");
  const thuoc = uid => !to || cuaTo(uid) === to;
  const gv  = Store.list("users", u => u.active !== false && (!to || (u.to || Store.settings.to) === to));
  const bc  = Store.list("baocao", b => b.thang === thang && thuoc(b.uid));
  const ga  = Store.list("giaoan", g => thuoc(g.uid));
  const dg  = Store.list("dugio",  d => (d.ngay||"").startsWith(thang) && thuoc(d.nguoiDayId));
  const bd  = Store.list("bangdiem", x => thuoc(x.uid));
  const hy  = Store.list("hsyeu", h => thuoc(h.uid)).sort((a,b)=>a.taoLuc<b.taoLuc?1:-1)[0];
  const cd  = Store.list("congviec", c => c.loai === "chuyende" && thuoc(c.nguoiNhanId));
  const tong = (ds, f) => ds.reduce((a,x) => a + (Number(f(x))||0), 0);

  const diems = bd.flatMap(b => b.hs.map(h => h.tbm)).filter(x => typeof x === "number" && isFinite(x));
  const tk = MUC.thongKe(diems);
  const tenMuc = tk.bang.map(m => m.ten);
  const mucCuoi = tenMuc[tenMuc.length - 1];

  return {
    to: to || Store.settings.to || "",
    soGV: gv.length,
    bcNop: bc.length,
    ngayCong: tong(bc, b => b.ngayCong),
    tietDay:  tong(bc, b => b.soTiet),
    tietDuGio: tong(bc, b => b.tietDuGio),
    giaoAn: {
      nop: ga.length,
      duyet: ga.filter(g => g.trangThai === "duyet").length,
      cho:   ga.filter(g => g.trangThai === "cho").length,
      tra:   ga.filter(g => g.trangThai === "tra").length
    },
    duGio: {
      so: dg.length,
      gioi: dg.filter(d => d.xepLoai === "Giỏi").length,
      kha:  dg.filter(d => d.xepLoai === "Khá").length,
      dat:  dg.filter(d => d.xepLoai === "Đạt").length,
      chuaDat: dg.filter(d => d.xepLoai === "Chưa đạt").length
    },
    chatLuong: {
      n: tk.n, dem: tk.dem, tenMuc, mucCuoi,
      chuaDat: tk.dem[mucCuoi] || 0,
      tb: diems.length ? diems.reduce((a,c)=>a+c,0)/diems.length : 0
    },
    hsYeu:  { so: hy ? hy.ds.length : 0, nguong: hy ? hy.nguong : (Store.settings.nguongYeu||5) },
    chuyenDe: cd.map(c => ({ thang: c.thang, ten: c.tieuDe, nguoi: c.nguoiNhan })),
    deXuatGV: bc.filter(b => (b.deXuat||"").trim()).map(b => ({ gv: b.hoTen, noiDung: b.deXuat })),
    keHoachGV: bc.filter(b => (b.keHoach||"").trim()).map(b => ({ gv: b.hoTen, noiDung: b.keHoach }))
  };
};

/* ---- Sinh từng mục của báo cáo tổng hợp toàn trường ---- */
const TongHop = {
  /* Gộp bảng xếp loại chất lượng của nhiều tổ (kể cả khi khác thang đánh giá) */
  gopMuc(ds){
    const ten = [];
    ds.forEach(b => (b.soLieu.chatLuong.tenMuc || []).forEach(t => { if (!ten.includes(t)) ten.push(t); }));
    const dem = Object.fromEntries(ten.map(t => [t, 0]));
    let n = 0;
    ds.forEach(b => { const c = b.soLieu.chatLuong; ten.forEach(t => dem[t] += (c.dem?.[t] || 0)); n += c.n || 0; });
    return { ten, dem, n };
  },

  muc(key, ds){
    const tong = f => ds.reduce((a,b) => a + (Number(f(b.soLieu))||0), 0);

    if (key === "chung") {
      const dsTo = (Store.settings.dsTo||"").split("\n").map(x=>x.trim()).filter(Boolean);
      const thieu = dsTo.filter(t => !ds.some(b => b.to === t));
      return { tieuDe:"Tình hình chung và việc nộp báo cáo", html:
        `<table><thead><tr><th style="width:6%">TT</th><th>Tổ chuyên môn</th><th style="width:12%">Số GV</th><th style="width:16%">GV đã nộp báo cáo</th><th style="width:16%">Ngày nộp</th><th style="width:20%">Người ký</th></tr></thead><tbody>${
          ds.map((b,i)=>`<tr><td class="num">${i+1}</td><td>${U.esc(b.to)}</td><td class="num">${b.soLieu.soGV}</td>
            <td class="num">${b.soLieu.bcNop}/${b.soLieu.soGV}</td><td class="num">${U.dmy(b.taoLuc)}</td><td>${U.esc(b.nguoiKy||"")}</td></tr>`).join("")
        }<tr><td colspan="2"><b>Toàn trường</b></td><td class="num"><b>${tong(s=>s.soGV)}</b></td><td class="num"><b>${tong(s=>s.bcNop)}</b></td><td colspan="2"></td></tr></tbody></table>
        ${thieu.length ? `<p>Đến thời điểm tổng hợp, chưa nhận được báo cáo của: ${U.esc(thieu.join(", "))}.</p>` : `<p>Các tổ chuyên môn đã nộp báo cáo đầy đủ, đúng hạn.</p>`}` };
    }

    if (key === "quyche") {
      return { tieuDe:"Thực hiện quy chế chuyên môn, ngày giờ công", html:
        `<table><thead><tr><th style="width:6%">TT</th><th>Tổ chuyên môn</th><th>Tổng ngày công</th><th>Tổng tiết đã dạy</th><th>Tiết dự giờ</th></tr></thead><tbody>${
          ds.map((b,i)=>`<tr><td class="num">${i+1}</td><td>${U.esc(b.to)}</td><td class="num">${U.so(b.soLieu.ngayCong)}</td>
            <td class="num">${b.soLieu.tietDay}</td><td class="num">${b.soLieu.tietDuGio}</td></tr>`).join("")
        }<tr><td colspan="2"><b>Toàn trường</b></td><td class="num"><b>${U.so(tong(s=>s.ngayCong))}</b></td>
          <td class="num"><b>${tong(s=>s.tietDay)}</b></td><td class="num"><b>${tong(s=>s.tietDuGio)}</b></td></tr></tbody></table>
        <p>Nhìn chung các tổ thực hiện nghiêm túc ngày giờ công, dạy đúng, đủ chương trình theo phân phối chương trình đã duyệt.</p>` };
    }

    if (key === "hoso") {
      return { tieuDe:"Hồ sơ, giáo án", html:
        `<table><thead><tr><th style="width:6%">TT</th><th>Tổ chuyên môn</th><th>Giáo án đã nộp</th><th>Đã duyệt</th><th>Chờ duyệt</th><th>Cần chỉnh sửa</th></tr></thead><tbody>${
          ds.map((b,i)=>`<tr><td class="num">${i+1}</td><td>${U.esc(b.to)}</td><td class="num">${b.soLieu.giaoAn.nop}</td>
            <td class="num">${b.soLieu.giaoAn.duyet}</td><td class="num">${b.soLieu.giaoAn.cho}</td><td class="num">${b.soLieu.giaoAn.tra}</td></tr>`).join("")
        }<tr><td colspan="2"><b>Toàn trường</b></td><td class="num"><b>${tong(s=>s.giaoAn.nop)}</b></td><td class="num"><b>${tong(s=>s.giaoAn.duyet)}</b></td>
          <td class="num"><b>${tong(s=>s.giaoAn.cho)}</b></td><td class="num"><b>${tong(s=>s.giaoAn.tra)}</b></td></tr></tbody></table>` };
    }

    if (key === "chatluong") {
      const g = TongHop.gopMuc(ds);
      if (!g.n) return null;
      const cot = g.ten;
      const cuoi = cot[cot.length-1];
      return { tieuDe:"Chất lượng bộ môn", html:
        `<table><thead><tr><th style="width:5%">TT</th><th>Tổ chuyên môn</th><th>Lượt HS xếp loại</th>${
          cot.map(t=>`<th>${U.esc(t)}</th>`).join("")}<th>Tỉ lệ đạt trở lên</th></tr></thead><tbody>${
          ds.map((b,i)=>{ const c = b.soLieu.chatLuong;
            return `<tr><td class="num">${i+1}</td><td>${U.esc(b.to)}</td><td class="num">${c.n}</td>${
              cot.map(t=>`<td class="num">${c.dem?.[t] ?? 0}${c.n?` (${U.tyle(c.dem?.[t]||0, c.n).toFixed(1)}%)`:""}</td>`).join("")
            }<td class="num">${c.n ? U.tyle(c.n - (c.dem?.[cuoi]||0), c.n).toFixed(1) + "%" : ""}</td></tr>`;
          }).join("")
        }<tr><td colspan="2"><b>Toàn trường</b></td><td class="num"><b>${g.n}</b></td>${
          cot.map(t=>`<td class="num"><b>${g.dem[t]}</b> (${U.tyle(g.dem[t], g.n).toFixed(1)}%)</td>`).join("")
        }<td class="num"><b>${U.tyle(g.n - g.dem[cuoi], g.n).toFixed(1)}%</b></td></tr></tbody></table>` };
    }

    if (key === "dugio") {
      return { tieuDe:"Dự giờ, thao giảng và chuyên đề", html:
        `<table><thead><tr><th style="width:6%">TT</th><th>Tổ chuyên môn</th><th>Số tiết dự</th><th>Giỏi</th><th>Khá</th><th>Đạt</th><th>Chưa đạt</th><th>Chuyên đề</th></tr></thead><tbody>${
          ds.map((b,i)=>`<tr><td class="num">${i+1}</td><td>${U.esc(b.to)}</td><td class="num">${b.soLieu.duGio.so}</td>
            <td class="num">${b.soLieu.duGio.gioi}</td><td class="num">${b.soLieu.duGio.kha}</td><td class="num">${b.soLieu.duGio.dat}</td>
            <td class="num">${b.soLieu.duGio.chuaDat}</td><td class="num">${(b.soLieu.chuyenDe||[]).length}</td></tr>`).join("")
        }<tr><td colspan="2"><b>Toàn trường</b></td><td class="num"><b>${tong(s=>s.duGio.so)}</b></td><td class="num"><b>${tong(s=>s.duGio.gioi)}</b></td>
          <td class="num"><b>${tong(s=>s.duGio.kha)}</b></td><td class="num"><b>${tong(s=>s.duGio.dat)}</b></td>
          <td class="num"><b>${tong(s=>s.duGio.chuaDat)}</b></td><td class="num"><b>${ds.reduce((a,b)=>a+(b.soLieu.chuyenDe||[]).length,0)}</b></td></tr></tbody></table>
        ${ds.some(b=>(b.soLieu.chuyenDe||[]).length) ? `<p>Chuyên đề đã đăng ký: ${
          ds.flatMap(b=>(b.soLieu.chuyenDe||[]).map(c=>`${U.esc(b.to)} - ${U.esc(c.ten)} (${U.esc(c.nguoi)})`)).join("; ")}.</p>` : ""}` };
    }

    if (key === "hsyeu") {
      return { tieuDe:"Phụ đạo học sinh chưa đạt yêu cầu", html:
        `<table><thead><tr><th style="width:6%">TT</th><th>Tổ chuyên môn</th><th>Số lượt HS chưa đạt</th><th>Ngưỡng điểm rà soát</th></tr></thead><tbody>${
          ds.map((b,i)=>`<tr><td class="num">${i+1}</td><td>${U.esc(b.to)}</td><td class="num">${b.soLieu.hsYeu.so}</td>
            <td class="num">dưới ${U.so(b.soLieu.hsYeu.nguong)}</td></tr>`).join("")
        }<tr><td colspan="2"><b>Toàn trường</b></td><td class="num"><b>${tong(s=>s.hsYeu.so)}</b></td><td></td></tr></tbody></table>
        <p>Đề nghị các tổ tiếp tục phân công giáo viên phụ đạo, theo dõi tiến bộ của từng học sinh và báo cáo kết quả trong kỳ họp tới.</p>` };
    }

    if (key === "dexuat") {
      const co = ds.filter(b => (b.deXuat||"").trim() || (b.soLieu.deXuatGV||[]).length);
      if (!co.length) return null;
      return { tieuDe:"Đề xuất, kiến nghị của các tổ chuyên môn", html:
        co.map(b => `<p><b>${U.esc(b.to)}:</b> ${U.esc(b.deXuat||"")}</p>` +
          (b.soLieu.deXuatGV||[]).map(x=>`<p>- ${U.esc(x.gv)}: ${U.esc(x.noiDung)}</p>`).join("")).join("") };
    }

    if (key === "kehoach") {
      const co = ds.filter(b => (b.soLieu.keHoachGV||[]).length);
      if (!co.length) return null;
      return { tieuDe:"Kế hoạch trọng tâm tháng tiếp theo của các tổ", html:
        co.map(b => `<p><b>${U.esc(b.to)}:</b></p>` +
          b.soLieu.keHoachGV.map(x=>`<p>- ${U.esc(x.gv)}: ${U.esc(x.noiDung)}</p>`).join("")).join("") };
    }

    if (key === "nhanxet") {
      const co = ds.filter(b => (b.danhGia||"").trim());
      if (!co.length) return null;
      return { tieuDe:"Tự đánh giá của các tổ chuyên môn", html:
        co.map(b => `<p><b>${U.esc(b.to)}:</b> ${U.esc(b.danhGia)}</p>`).join("") };
    }
    return null;
  }
};

/* ================= TRANG TỔNG HỢP TOÀN TRƯỜNG ================= */
Pages.tonghop = {
  eyebrow: "Toàn trường", title: "Tổng hợp báo cáo các tổ",
  render(el){
    if (!Auth.hieuTruong()) { el.innerHTML = UI.trong("Mục này dành cho hiệu trưởng", "Liên hệ quản trị nếu bạn cần quyền xem."); return; }
    const thang = this.thang || UI.thangMacDinh(); this.thang = thang;
    const ds = Store.list("baocaoto", b => b.thang === thang).sort((a,b)=>(a.to||"").localeCompare(b.to||""));
    const boChon = this.boChon || [];              /* tổ bị bỏ tích, mặc định gộp hết */
    this.boChon = boChon;
    const daChon = ds.filter(b => !boChon.includes(b.id));
    const chon = daChon.map(b => b.id);
    const dsTo = (Store.settings.dsTo||"").split("\n").map(x=>x.trim()).filter(Boolean);
    const thieu = dsTo.filter(t => !ds.some(b => b.to === t));
    const tong = f => daChon.reduce((a,b)=>a+(Number(f(b.soLieu))||0),0);
    const g = daChon.length ? TongHop.gopMuc(daChon) : null;

    el.innerHTML = `
      <div class="grid g4" style="margin-bottom:18px">
        <div class="stat"><b>${ds.length}${dsTo.length?"/"+dsTo.length:""}</b><span>Tổ đã nộp báo cáo</span></div>
        <div class="stat"><b>${tong(s=>s.tietDay)}</b><span>Tiết đã dạy toàn trường</span></div>
        <div class="stat s-ok"><b>${g&&g.n?U.tyle(g.n-g.dem[g.ten[g.ten.length-1]],g.n).toFixed(1)+"%":"—"}</b><span>Tỉ lệ đạt trở lên</span></div>
        <div class="stat ${tong(s=>s.hsYeu.so)?"s-warn":"s-ok"}"><b>${tong(s=>s.hsYeu.so)}</b><span>Lượt HS chưa đạt</span></div>
      </div>

      <div class="card">
        <div class="card-head"><h3>Báo cáo nhận được<span class="sub">Bỏ dấu tích để loại một tổ ra khỏi báo cáo tổng hợp</span></h3>
          <select id="thThang" style="width:auto">${UI.chon(UI.dsThang(), thang)}</select>
          <label class="btn btn-sm btn-line" style="margin:0">Nhận gói báo cáo (.json)
            <input type="file" id="thFile" accept=".json" multiple hidden></label>
        </div>
        <div class="card-body tight">
          ${ds.length ? `<div class="tbl-wrap"><table class="tbl">
            <thead><tr><th style="width:40px"></th><th>Tổ chuyên môn</th><th>Ngày nộp</th><th>Người ký</th>
              <th class="num">GV nộp BC</th><th class="num">Tiết dạy</th><th class="num">Giáo án duyệt/nộp</th>
              <th class="num">Dự giờ</th><th class="num">HS chưa đạt</th><th></th></tr></thead>
            <tbody>${ds.map(b=>`<tr>
              <td><input type="checkbox" data-ck="${b.id}" ${chon.includes(b.id)?"checked":""} style="width:auto"></td>
              <td><b>${U.esc(b.to)}</b></td><td class="nowrap">${U.dmy(b.taoLuc)}</td><td class="nowrap">${U.esc(b.nguoiKy||"")}</td>
              <td class="num">${b.soLieu.bcNop}/${b.soLieu.soGV}</td><td class="num">${b.soLieu.tietDay}</td>
              <td class="num">${b.soLieu.giaoAn.duyet}/${b.soLieu.giaoAn.nop}</td>
              <td class="num">${b.soLieu.duGio.so}</td><td class="num">${b.soLieu.hsYeu.so}</td>
              <td class="nowrap"><button class="btn btn-sm btn-line" data-xemto="${b.id}">Xem</button>
                <button class="btn btn-sm btn-line" data-taito="${b.id}">Word</button>
                <button class="btn btn-sm btn-line" data-xoato="${b.id}">Xoá</button></td></tr>`).join("")}
            </tbody></table></div>
            ${thieu.length?`<div class="card-body"><p class="note warn" style="margin:0">Chưa nhận được báo cáo của: <b>${U.esc(thieu.join(", "))}</b>.</p></div>`:""}`
          : UI.trong("Chưa có báo cáo nào trong tháng này",
              "Tổ trưởng bấm “Nộp lên trường” ở mục Báo cáo tổ, hoặc gửi gói .json để nhận vào đây.")}
        </div>
      </div>

      ${daChon.length ? `
      <div class="card">
        <div class="card-head"><h3>Lập báo cáo tổng hợp<span class="sub">Gộp ${daChon.length} tổ · ${U.tenThang(thang)}</span></h3></div>
        <div class="card-body">
          <div class="grid g3">
            <label class="fld"><span>Số báo cáo</span><input id="thSo" value="${Store.list("baocaoto").length+1}"></label>
            <label class="fld"><span>Người ký</span><input id="thKy" value="${U.esc(Store.settings.hieuTruong||"")}"></label>
          </div>
          <div class="grid g2">
            ${[["chung","Tình hình chung và việc nộp báo cáo"],["quyche","Thực hiện quy chế chuyên môn, ngày giờ công"],
               ["hoso","Hồ sơ, giáo án"],["chatluong","Chất lượng bộ môn"],["dugio","Dự giờ, thao giảng, chuyên đề"],
               ["hsyeu","Phụ đạo học sinh chưa đạt"],["nhanxet","Tự đánh giá của các tổ"],
               ["dexuat","Đề xuất, kiến nghị của các tổ"],["kehoach","Kế hoạch tháng tới của các tổ"]]
              .map(([k,t])=>`<label class="chk"><input type="checkbox" data-tmuc="${k}" checked><span><b>${t}</b></span></label>`).join("")}
          </div>
          <div class="grid g2">
            <label class="fld"><span>Đánh giá chung của Ban Giám hiệu</span><textarea id="thDanhGia"></textarea></label>
            <label class="fld"><span>Nhiệm vụ trọng tâm chỉ đạo tháng tới</span><textarea id="thChiDao"></textarea></label>
          </div>
          <div class="row">
            <button class="btn btn-primary" id="thXem">Xem trước</button>
            <button class="btn btn-seal" id="thWord">Xuất báo cáo tổng hợp</button>
            <button class="btn btn-line" id="thExcel">Xuất bảng số liệu Excel</button>
          </div>
        </div>
      </div>

      <div class="card in-duoc" id="thKhung" hidden>
        <div class="card-head"><h3>Xem trước văn bản<span class="sub">Ký Hiệu trưởng</span></h3></div>
        <div class="sheet-shell"><div class="sheet" id="sheet3"></div></div>
      </div>` : ""}`;

    el.querySelector("#thThang").onchange = e => { this.thang = e.target.value; this.boChon = []; this.render(el); };

    el.querySelectorAll("[data-ck]").forEach(c => c.onchange = () => {
      this.boChon = [...el.querySelectorAll("[data-ck]")].filter(x=>!x.checked).map(x=>x.dataset.ck);
      this.render(el);
    });

    el.querySelector("#thFile").onchange = ev => {
      const files = [...ev.target.files];
      let xong = 0, loi = 0;
      files.forEach(f => {
        const r = new FileReader();
        r.onload = async e => {
          try {
            const goi = JSON.parse(e.target.result);
            if (goi.loai !== "BAOCAO_TO" || !goi.soLieu) throw new Error("sai định dạng");
            const cu = Store.list("baocaoto").find(b => b.to === goi.to && b.thang === goi.thang);
            if (cu) { Object.assign(cu, goi); await Store.put("baocaoto", cu); }
            else await Store.add("baocaoto", goi);
            xong++;
          } catch { loi++; }
          if (xong + loi === files.length) {
            UI.toast(`Đã nhận ${xong} gói báo cáo${loi?`, ${loi} tệp không hợp lệ`:""}.`, loi?"err":"ok");
            this.boChon = []; this.render(el);
          }
        };
        r.readAsText(f);
      });
    };

    el.querySelectorAll("[data-xemto]").forEach(b => b.onclick = () => {
      const r = Store.get("baocaoto", b.dataset.xemto);
      UI.modal(`${r.to} — ${U.tenThang(r.thang)}`,
        `<div class="sheet-shell" style="padding:8px"><div class="sheet" style="padding:22px">${Xuat.thanBaoCaoTo(r)}</div></div>`);
    });
    el.querySelectorAll("[data-taito]").forEach(b => b.onclick = () => {
      const r = Store.get("baocaoto", b.dataset.taito);
      Xuat.baoCaoTo({ so:r.so, thang:r.thang, nguoiKy:r.nguoiKy, mucs:r.mucs });
    });
    el.querySelectorAll("[data-xoato]").forEach(b => b.onclick = () => UI.hoi("Xoá báo cáo này khỏi hệ thống?", async () => {
      await Store.del("baocaoto", b.dataset.xoato); this.boChon = []; this.render(el);
    }));

    const thu = () => {
      const th = { so: el.querySelector("#thSo").value, thang, soTo: daChon.length,
                   nguoiKy: el.querySelector("#thKy").value, mucs: [] };
      [...el.querySelectorAll("[data-tmuc]")].filter(c=>c.checked).forEach(c => {
        const m = TongHop.muc(c.dataset.tmuc, daChon); if (m) th.mucs.push(m);
      });
      const dg = el.querySelector("#thDanhGia").value.trim();
      const cd = el.querySelector("#thChiDao").value.trim();
      if (dg) th.mucs.push({ tieuDe:"Đánh giá chung của Ban Giám hiệu", noiDung: dg });
      if (cd) th.mucs.push({ tieuDe:"Nhiệm vụ trọng tâm tháng tiếp theo", noiDung: cd });
      return th;
    };

    const bx = el.querySelector("#thXem");
    if (bx) {
      bx.onclick = () => {
        el.querySelector("#thKhung").hidden = false;
        el.querySelector("#sheet3").innerHTML = Xuat.thanTongHop(thu());
        el.querySelector("#thKhung").scrollIntoView({behavior:"smooth", block:"start"});
      };
      el.querySelector("#thWord").onclick = () => Xuat.tongHop(thu());
      el.querySelector("#thExcel").onclick = () => {
        if (!coXLSX()) return;
        const ten = g ? g.ten : [];
        const aoa = [["Tổ","Số GV","GV nộp BC","Ngày công","Tiết dạy","Tiết dự giờ",
                      "Giáo án nộp","Đã duyệt","Chờ duyệt","Cần sửa","Tiết dự giờ ghi phiếu",
                      "Lượt HS xếp loại", ...ten, "Tỉ lệ đạt trở lên (%)","HS chưa đạt"]];
        daChon.forEach(b => { const s = b.soLieu, c = s.chatLuong;
          aoa.push([b.to, s.soGV, s.bcNop, s.ngayCong, s.tietDay, s.tietDuGio,
            s.giaoAn.nop, s.giaoAn.duyet, s.giaoAn.cho, s.giaoAn.tra, s.duGio.so,
            c.n, ...ten.map(t => c.dem?.[t] || 0),
            c.n ? Number(U.tyle(c.n - (c.dem?.[c.mucCuoi]||0), c.n).toFixed(1)) : "", s.hsYeu.so]);
        });
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(aoa), "Tong hop");
        XLSX.writeFile(wb, `TongHop_ChuyenMon_${thang.replace("-","_")}.xlsx`);
      };
    }
  }
};
