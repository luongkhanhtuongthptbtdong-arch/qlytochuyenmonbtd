/* =========================================================
   TRANG: Giao việc & chuyên đề – Biên bản – Báo cáo tổ –
          Tài khoản – Cài đặt
   ========================================================= */
window.Pages = window.Pages || {};

/* ================= GIAO VIỆC & ĐĂNG KÝ CHUYÊN ĐỀ ================= */
Pages.congviec = {
  eyebrow: "Điều hành tổ", title: "Giao việc & chuyên đề",
  render(el){
    const gv = Store.list("users", u => u.active !== false);
    const viec = Store.list("congviec", c => c.loai !== "chuyende")
      .filter(c => Auth.toanTo() || c.nguoiNhanId === Auth.me.id)
      .sort((a,b)=> (a.hanChot||"") < (b.hanChot||"") ? -1 : 1);
    const cd = Store.list("congviec", c => c.loai === "chuyende").sort((a,b)=>(a.thang||"")<(b.thang||"")?-1:1);

    el.innerHTML = `
      ${Auth.duyet() ? `
      <div class="card">
        <div class="card-head"><h3>Giao việc<span class="sub">Việc giao sẽ hiện trên trang của giáo viên nhận</span></h3></div>
        <div class="card-body"><form id="fCV">
          <div class="grid g4">
            <label class="fld"><span>Người nhận</span><select name="nguoiNhanId" required>${UI.chon([["","— chọn —"],...gv.map(u=>[u.id,u.hoTen])])}</select></label>
            <label class="fld"><span>Hạn hoàn thành</span><input type="date" name="hanChot" required></label>
            <label class="fld" style="grid-column:span 2"><span>Nội dung công việc</span><input name="tieuDe" required></label>
          </div>
          <button class="btn btn-primary" type="submit">Giao việc</button>
        </form></div>
      </div>` : ""}

      <div class="card">
        <div class="card-head"><h3>Danh sách công việc<span class="sub">${viec.filter(v=>v.mucDo<100).length} việc chưa xong</span></h3></div>
        <div class="card-body tight">
          ${viec.length ? `<div class="tbl-wrap"><table class="tbl">
            <thead><tr><th>Nội dung</th><th>Người nhận</th><th>Hạn</th><th class="num">Mức hoàn thành</th><th>Kết quả</th><th></th></tr></thead>
            <tbody>${viec.map(v => {
              const tre = v.mucDo < 100 && v.hanChot && v.hanChot < U.today();
              return `<tr><td>${U.esc(v.tieuDe)}</td><td class="nowrap">${U.esc(v.nguoiNhan)}</td>
                <td class="nowrap">${U.dmy(v.hanChot)} ${tre?'<span class="tag t-no">Trễ hạn</span>':""}</td>
                <td class="num">${v.mucDo||0}%</td>
                <td>${U.esc(v.ketQua||"")}</td>
                <td class="nowrap">${(v.nguoiNhanId===Auth.me.id||Auth.duyet())?`<button class="btn btn-sm btn-line" data-bc="${v.id}">Cập nhật</button>`:""}
                ${Auth.duyet()?`<button class="btn btn-sm btn-line" data-xv="${v.id}">Xoá</button>`:""}</td></tr>`;
            }).join("")}</tbody></table></div>` : UI.trong("Chưa có công việc nào","")}
        </div>
      </div>

      <div class="card">
        <div class="card-head"><h3>Đăng ký chuyên đề<span class="sub">Mỗi tháng chỉ một người báo cáo — hệ thống nhắc nếu tháng đã có người đăng ký</span></h3></div>
        <div class="card-body"><form id="fCD">
          <div class="grid g3">
            <label class="fld"><span>Tên chuyên đề</span><input name="tieuDe" required></label>
            <label class="fld"><span>Tháng báo cáo</span><select name="thang">${UI.chon(UI.dsThang())}</select></label>
            <label class="fld"><span>&nbsp;</span><button class="btn btn-primary" type="submit">Đăng ký</button></label>
          </div>
        </form>
        ${cd.length ? `<div class="tbl-wrap"><table class="tbl">
          <thead><tr><th>Tháng</th><th>Tên chuyên đề</th><th>Người báo cáo</th><th></th></tr></thead>
          <tbody>${cd.map(c=>`<tr><td class="nowrap">${U.tenThang(c.thang)}</td><td>${U.esc(c.tieuDe)}</td>
            <td>${U.esc(c.nguoiNhan)}</td>
            <td class="nowrap">${(c.nguoiNhanId===Auth.me.id||Auth.duyet())?`<button class="btn btn-sm btn-line" data-xv="${c.id}">Huỷ</button>`:""}</td></tr>`).join("")}
          </tbody></table></div>` : ""}
        </div>
      </div>`;

    const fcv = el.querySelector("#fCV");
    if (fcv) fcv.onsubmit = async ev => {
      ev.preventDefault();
      const f = Object.fromEntries(new FormData(ev.target));
      await Store.add("congviec", Object.assign(f, {
        nguoiNhan: Store.get("users", f.nguoiNhanId)?.hoTen, mucDo:0, nguoiGiao:Auth.me.hoTen
      }));
      UI.toast("Đã giao việc.", "ok"); this.render(el);
    };

    el.querySelector("#fCD").onsubmit = async ev => {
      ev.preventDefault();
      const f = Object.fromEntries(new FormData(ev.target));
      const trung = Store.list("congviec").find(c => c.loai === "chuyende" && c.thang === f.thang);
      if (trung) { UI.toast(`${U.tenThang(f.thang)} đã có ${trung.nguoiNhan} đăng ký. Hãy chọn tháng khác.`, "err"); return; }
      await Store.add("congviec", Object.assign(f, { loai:"chuyende", nguoiNhan:Auth.me.hoTen, nguoiNhanId:Auth.me.id }));
      UI.toast("Đã đăng ký chuyên đề.", "ok"); ev.target.reset(); this.render(el);
    };

    el.querySelectorAll("[data-bc]").forEach(b => b.onclick = () => {
      const v = Store.get("congviec", b.dataset.bc);
      const body = UI.modal("Cập nhật tiến độ", `
        <label class="fld"><span>Mức hoàn thành (%)</span><input type="number" min="0" max="100" id="md" value="${v.mucDo||0}"></label>
        <label class="fld"><span>Kết quả / minh chứng</span><textarea id="kq">${U.esc(v.ketQua||"")}</textarea></label>`,
        [{text:"Huỷ",cls:"btn-line"},{text:"Lưu",cls:"btn-primary",fn:async()=>{
          v.mucDo = Number(body.querySelector("#md").value)||0;
          v.ketQua = body.querySelector("#kq").value;
          await Store.put("congviec", v); UI.toast("Đã cập nhật.","ok"); this.render(el);
        }}]);
    });

    el.querySelectorAll("[data-xv]").forEach(b => b.onclick = () => UI.hoi("Xoá mục này?", async () => {
      await Store.del("congviec", b.dataset.xv); this.render(el);
    }));
  }
};

/* ================= BIÊN BẢN HỌP TỔ ================= */
Pages.bienban = {
  eyebrow: "Văn bản của tổ", title: "Biên bản họp tổ",
  render(el){
    if (!Auth.bienBan()) { el.innerHTML = UI.trong("Chỉ tổ trưởng và thư ký được lập biên bản", "Liên hệ tổ trưởng nếu bạn cần quyền này."); return; }
    const thang = this.thang || U.thangHienTai(); this.thang = thang;
    const s = Store.settings;
    const gv = Store.list("users", u => u.active !== false);
    const daLuu = Store.list("bienban").sort((a,b)=>a.ngay<b.ngay?1:-1);

    el.innerHTML = `
      <div class="card">
        <div class="card-head"><h3>Lập biên bản<span class="sub">Chọn nội dung cần đưa vào — số liệu được lấy tự động từ hồ sơ đã nộp</span></h3>
          <select id="bbThang" style="width:auto">${UI.chon(UI.dsThang(), thang)}</select></div>
        <div class="card-body">
          <div class="grid g4">
            <label class="fld"><span>Số biên bản</span><input id="bbSo" value="${daLuu.length+1}"></label>
            <label class="fld"><span>Ngày họp</span><input type="date" id="bbNgay" value="${U.today()}"></label>
            <label class="fld"><span>Bắt đầu</span><input id="bbGioBD" value="14 giờ 00 phút"></label>
            <label class="fld"><span>Kết thúc</span><input id="bbGioKT" value="16 giờ 00 phút"></label>
            <label class="fld"><span>Chủ trì</span><input id="bbChuTri" value="${U.esc(s.toTruong||"")}"></label>
            <label class="fld"><span>Thư ký</span><input id="bbThuKy" value="${U.esc(s.thuKy||Auth.me.hoTen)}"></label>
            <label class="fld"><span>Có mặt</span><input id="bbCoMat" value="${gv.length}"></label>
            <label class="fld"><span>Vắng</span><input id="bbVang" value="không"></label>
          </div>
          <label class="fld"><span>Địa điểm</span><input id="bbDiaDiem" value="Phòng họp tổ chuyên môn, ${U.esc(s.truong||"")}"></label>

          <p class="note" style="margin-top:6px">Đánh dấu nội dung đưa vào biên bản:</p>
          <div class="grid g2">
            ${[
              ["cong","Đánh giá việc thực hiện nhiệm vụ trong tháng","Bảng ngày công, tiết dạy, dự giờ của từng giáo viên"],
              ["chatluong","Thống kê chất lượng bộ môn","Bảng so sánh tỉ lệ giữa các lớp theo đợt kiểm tra"],
              ["giaoan","Kiểm tra hồ sơ, giáo án","Số giáo án đã nộp, đã duyệt, cần chỉnh sửa"],
              ["dugio","Dự giờ, thao giảng","Danh sách tiết dự và xếp loại"],
              ["hsyeu","Học sinh chưa đạt và biện pháp","Danh sách phụ đạo kèm nguyên nhân, biện pháp"],
              ["chuyende","Chuyên đề đã đăng ký","Người báo cáo theo từng tháng"],
              ["kehoach","Kế hoạch tháng tiếp theo","Tổng hợp từ báo cáo cá nhân"]
            ].map(([k,t,m])=>`<label class="chk"><input type="checkbox" data-muc="${k}" checked><span><b>${t}</b><i>${m}</i></span></label>`).join("")}
          </div>
          <div class="grid g2">
            <label class="fld"><span>Ý kiến thảo luận</span><textarea id="bbYKien"></textarea></label>
            <label class="fld"><span>Kết luận của chủ trì</span><textarea id="bbKetLuan"></textarea></label>
          </div>
          <div class="row">
            <button class="btn btn-primary" id="bbXem">Xem trước</button>
            <button class="btn btn-seal" id="bbWord">Xuất Word</button>
            <button class="btn btn-line" id="bbLuu">Lưu vào sổ biên bản</button>
            <span class="spacer"></span>
            <button class="btn btn-line no-print" id="bbIn">In</button>
          </div>
        </div>
      </div>

      <div class="card in-duoc" id="khungXem" hidden>
        <div class="card-head"><h3>Xem trước văn bản<span class="sub">Đúng thể thức Nghị định 30/2020/NĐ-CP</span></h3></div>
        <div class="sheet-shell"><div class="sheet" id="sheet"></div></div>
      </div>

      <div class="card">
        <div class="card-head"><h3>Sổ biên bản<span class="sub">${daLuu.length} biên bản đã lưu</span></h3></div>
        <div class="card-body tight">
          ${daLuu.length ? `<div class="tbl-wrap"><table class="tbl">
            <thead><tr><th>Số</th><th>Ngày họp</th><th>Kỳ họp</th><th>Thư ký</th><th></th></tr></thead>
            <tbody>${daLuu.map(b=>`<tr><td class="num">${U.esc(b.so)}</td><td class="nowrap">${U.dmy(b.ngay)}</td>
              <td>${U.tenThang(b.thang)}</td><td>${U.esc(b.thuKy)}</td>
              <td class="nowrap"><button class="btn btn-sm btn-line" data-tai="${b.id}">Tải Word</button>
              <button class="btn btn-sm btn-line" data-xbb="${b.id}">Xoá</button></td></tr>`).join("")}</tbody></table></div>`
          : UI.trong("Sổ biên bản còn trống", "Biên bản đã lưu có thể tải lại bất cứ lúc nào.")}
        </div>
      </div>`;

    el.querySelector("#bbThang").onchange = e => { this.thang = e.target.value; this.render(el); };

    const thu = () => {
      const g = id => el.querySelector(id)?.value || "";
      const chon = [...el.querySelectorAll("[data-muc]")].filter(c=>c.checked).map(c=>c.dataset.muc);
      const bb = {
        so: g("#bbSo"), ngay: g("#bbNgay"), gioBD: g("#bbGioBD"), gioKT: g("#bbGioKT"),
        diaDiem: g("#bbDiaDiem"), chuTri: g("#bbChuTri"), thuKy: g("#bbThuKy"),
        coMat: g("#bbCoMat"), vangMat: g("#bbVang"), thang, mucs: []
      };
      chon.forEach(k => { const m = Bien.muc(k, thang, Auth.toCuaToi()); if (m) bb.mucs.push(m); });
      if (g("#bbYKien").trim()) bb.mucs.push({ tieuDe:"Ý kiến thảo luận", noiDung: g("#bbYKien") });
      if (g("#bbKetLuan").trim()) bb.mucs.push({ tieuDe:"Kết luận của chủ trì", noiDung: g("#bbKetLuan") });
      return bb;
    };

    el.querySelector("#bbXem").onclick = () => {
      el.querySelector("#khungXem").hidden = false;
      el.querySelector("#sheet").innerHTML = Xuat.thanBienBan(thu());
      el.querySelector("#khungXem").scrollIntoView({behavior:"smooth", block:"start"});
    };
    el.querySelector("#bbWord").onclick = () => Xuat.bienBan(thu());
    el.querySelector("#bbIn").onclick = () => {
      el.querySelector("#khungXem").hidden = false;
      el.querySelector("#sheet").innerHTML = Xuat.thanBienBan(thu());
      setTimeout(()=>window.print(), 200);
    };
    el.querySelector("#bbLuu").onclick = async () => {
      await Store.add("bienban", thu());
      await Store.log("Lưu biên bản", U.tenThang(thang));
      UI.toast("Đã lưu vào sổ biên bản.", "ok"); this.render(el);
    };
    el.querySelectorAll("[data-tai]").forEach(b => b.onclick = () => Xuat.bienBan(Store.get("bienban", b.dataset.tai)));
    el.querySelectorAll("[data-xbb]").forEach(b => b.onclick = () => UI.hoi("Xoá biên bản này?", async () => {
      await Store.del("bienban", b.dataset.xbb); this.render(el);
    }));
  }
};

/* ---- Sinh nội dung từng mục của biên bản / báo cáo ---- */
const Bien = {
  /* thuoc(): lọc hồ sơ theo tổ — bỏ trống thì lấy toàn bộ dữ liệu trên hệ thống */
  muc(key, thang, to){
    const cuaTo = uid => (Store.get("users", uid)?.to || Store.settings.to || "");
    const thuoc = uid => !to || cuaTo(uid) === to;
    const gv = Store.list("users", u => u.active !== false && (!to || (u.to || Store.settings.to) === to));
    if (key === "cong") {
      const bc = Store.list("baocao", b => b.thang === thang && thuoc(b.uid));
      if (!bc.length) return null;
      const hang = bc.map((b,i)=>`<tr><td class="num">${i+1}</td><td>${U.esc(b.hoTen)}</td>
        <td class="num">${U.so(b.ngayCong)}</td><td class="num">${b.soTiet||0}</td><td class="num">${b.tietDuGio||0}</td>
        <td>${U.esc(b.daLam||"")}</td></tr>`).join("");
      return { tieuDe:`Đánh giá việc thực hiện nhiệm vụ ${U.tenThang(thang)}`, html:
        `<p>Trong tháng, tổ có ${bc.length}/${gv.length} giáo viên nộp báo cáo công tác cá nhân. Kết quả cụ thể:</p>
         <table><thead><tr><th style="width:6%">TT</th><th>Họ và tên</th><th style="width:11%">Ngày công</th><th style="width:10%">Tiết dạy</th><th style="width:10%">Dự giờ</th><th style="width:35%">Công việc đã thực hiện</th></tr></thead><tbody>${hang}</tbody></table>` };
    }
    if (key === "chatluong") {
      const bd = Store.list("bangdiem", x => thuoc(x.uid));
      if (!bd.length) return null;
      const b = MUC.bang();
      const hang = bd.map((x,i) => {
        const tk = MUC.thongKe(x.hs.map(h=>h.tbm).filter(h=>typeof h==="number"&&isFinite(h)));
        return `<tr><td class="num">${i+1}</td><td class="num">${U.esc(x.lop)}</td><td class="num">${U.esc(x.mon)}</td><td class="num">${tk.n}</td>` +
          b.map(m=>`<td class="num">${tk.dem[m.ten]} (${U.tyle(tk.dem[m.ten],tk.n).toFixed(1)}%)</td>`).join("") + `</tr>`;
      }).join("");
      return { tieuDe:"Thống kê chất lượng bộ môn", html:
        `<table><thead><tr><th style="width:6%">TT</th><th>Lớp</th><th>Môn</th><th>Sĩ số</th>${b.map(m=>`<th>${m.ten}</th>`).join("")}</tr></thead><tbody>${hang}</tbody></table>` };
    }
    if (key === "giaoan") {
      const ga = Store.list("giaoan", g => thuoc(g.uid));
      const cho = ga.filter(g=>g.trangThai==="cho").length, duyet = ga.filter(g=>g.trangThai==="duyet").length,
            tra = ga.filter(g=>g.trangThai==="tra").length;
      if (!ga.length) return null;
      return { tieuDe:"Kiểm tra hồ sơ, giáo án", noiDung:
        `Tổng số giáo án đã nộp trên hệ thống: ${ga.length}. Trong đó đã duyệt ${duyet}; đang chờ duyệt ${cho}; đề nghị chỉnh sửa, bổ sung ${tra}. Tổ trưởng nhắc các thành viên hoàn thiện giáo án theo góp ý trước khi lên lớp.` };
    }
    if (key === "dugio") {
      const dg = Store.list("dugio", d => (d.ngay||"").startsWith(thang) && thuoc(d.nguoiDayId));
      if (!dg.length) return null;
      const hang = dg.map((d,i)=>`<tr><td class="num">${i+1}</td><td>${U.esc(d.nguoiDay)}</td><td class="num">${U.esc(d.lop)}</td>
        <td>${U.esc(d.tenBai)}</td><td>${U.esc(d.nguoiDu)}</td><td class="num">${U.so(d.diem)}</td><td class="num">${U.esc(d.xepLoai)}</td></tr>`).join("");
      return { tieuDe:"Công tác dự giờ, thao giảng", html:
        `<p>Trong tháng tổ thực hiện ${dg.length} tiết dự giờ.</p>
         <table><thead><tr><th style="width:6%">TT</th><th>Người dạy</th><th>Lớp</th><th>Tên bài</th><th>Người dự</th><th>Điểm</th><th>Xếp loại</th></tr></thead><tbody>${hang}</tbody></table>` };
    }
    if (key === "hsyeu") {
      const d = Store.list("hsyeu", h => thuoc(h.uid)).sort((a,b)=>a.taoLuc<b.taoLuc?1:-1)[0];
      if (!d) return null;
      const hang = d.ds.slice(0,60).map((h,i)=>`<tr><td class="num">${i+1}</td><td>${U.esc(h.hoTen)}</td><td class="num">${U.esc(h.lop)}</td>
        <td class="num">${U.so(h.diem)}</td><td>${U.esc(h.nguyenNhan||"")}</td><td>${U.esc(h.bienPhap||"")}</td></tr>`).join("");
      return { tieuDe:"Học sinh chưa đạt yêu cầu và biện pháp hỗ trợ", html:
        `<p>Qua rà soát điểm dưới ${U.so(d.nguong)}, tổ thống kê được ${d.ds.length} lượt học sinh chưa đạt. ${U.esc(d.ghiChu||"")}</p>
         <table><thead><tr><th style="width:6%">TT</th><th>Họ và tên</th><th>Lớp</th><th>Điểm</th><th>Nguyên nhân</th><th>Biện pháp</th></tr></thead><tbody>${hang}</tbody></table>` };
    }
    if (key === "chuyende") {
      const cd = Store.list("congviec", c => c.loai === "chuyende" && thuoc(c.nguoiNhanId));
      if (!cd.length) return null;
      return { tieuDe:"Chuyên đề chuyên môn đã đăng ký", html:
        `<table><thead><tr><th style="width:20%">Tháng</th><th>Tên chuyên đề</th><th style="width:26%">Người báo cáo</th></tr></thead><tbody>${
          cd.map(c=>`<tr><td>${U.tenThang(c.thang)}</td><td>${U.esc(c.tieuDe)}</td><td>${U.esc(c.nguoiNhan)}</td></tr>`).join("")
        }</tbody></table>` };
    }
    if (key === "kehoach") {
      const bc = Store.list("baocao", b => b.thang === thang && thuoc(b.uid)).filter(b => (b.keHoach||"").trim());
      if (!bc.length) return null;
      return { tieuDe:"Kế hoạch công tác tháng tiếp theo", html:
        bc.map(b=>`<p>- ${U.esc(b.hoTen)}: ${U.esc(b.keHoach)}</p>`).join("") };
    }
    return null;
  }
};

/* ================= BÁO CÁO CỦA TỔ ================= */
Pages.baocaoto = {
  eyebrow: "Văn bản của tổ", title: "Báo cáo tổ chuyên môn",
  render(el){
    if (!Auth.xuatBaoCao()) { el.innerHTML = UI.trong("Chỉ tổ trưởng và thư ký được xuất báo cáo tổ", ""); return; }
    const thang = this.thang || U.thangHienTai(); this.thang = thang;
    const to = Auth.toCuaToi();
    const daNop = Store.list("baocaoto", b => b.to === to).sort((a,b)=>a.thang<b.thang?1:-1);
    const nopThangNay = daNop.find(b => b.thang === thang);
    const sl = Bien.soLieu(thang, to);

    el.innerHTML = `
      <div class="card">
        <div class="card-head"><h3>Báo cáo gửi Ban Giám hiệu<span class="sub">Số liệu lấy từ hồ sơ giáo viên ${U.esc(to)} đã nộp trong tháng</span></h3>
          <select id="bcThang" style="width:auto">${UI.chon(UI.dsThang(), thang)}</select></div>
        <div class="card-body">
          <div class="grid g4" style="margin-bottom:16px">
            <div class="stat"><b>${sl.bcNop}/${sl.soGV}</b><span>Giáo viên đã nộp báo cáo</span></div>
            <div class="stat"><b>${sl.tietDay}</b><span>Tiết đã dạy</span></div>
            <div class="stat s-ok"><b>${sl.giaoAn.duyet}/${sl.giaoAn.nop}</b><span>Giáo án đã duyệt</span></div>
            <div class="stat ${sl.hsYeu.so?"s-warn":"s-ok"}"><b>${sl.hsYeu.so}</b><span>Lượt học sinh chưa đạt</span></div>
          </div>
          <div class="grid g3">
            <label class="fld"><span>Số báo cáo</span><input id="bcSo" value="${daNop.length+1}"></label>
            <label class="fld"><span>Người ký</span><input id="bcKy" value="${U.esc(Store.settings.toTruong||"")}"></label>
            <label class="fld"><span>Tổ</span><input id="bcTo" value="${U.esc(to)}"></label>
          </div>
          <div class="grid g2">
            ${[["cong","Kết quả thực hiện nhiệm vụ"],["chatluong","Chất lượng bộ môn"],["giaoan","Hồ sơ, giáo án"],
               ["dugio","Dự giờ, thao giảng"],["hsyeu","Phụ đạo học sinh chưa đạt"],["chuyende","Chuyên đề"],["kehoach","Kế hoạch tháng tới"]]
              .map(([k,t])=>`<label class="chk"><input type="checkbox" data-muc="${k}" checked><span><b>${t}</b></span></label>`).join("")}
          </div>
          <div class="grid g2">
            <label class="fld"><span>Đánh giá chung</span><textarea id="bcChung">${U.esc(nopThangNay?.danhGia||"")}</textarea></label>
            <label class="fld"><span>Đề xuất với Ban Giám hiệu</span><textarea id="bcDeXuat">${U.esc(nopThangNay?.deXuat||"")}</textarea></label>
          </div>
          <div class="row">
            <button class="btn btn-primary" id="bcXem">Xem trước</button>
            <button class="btn btn-seal" id="bcWord">Xuất Word</button>
            <button class="btn btn-ok" id="bcNop">${nopThangNay ? "Nộp lại lên trường" : "Nộp lên trường"}</button>
            <button class="btn btn-line" id="bcGoi">Tải gói báo cáo (.json)</button>
            ${nopThangNay ? `<span class="tag t-ok">Đã nộp ${U.dmyGio(nopThangNay.taoLuc)}</span>` : ""}
          </div>
          <p class="note" style="margin-top:14px">Nộp lên trường để hiệu trưởng gộp vào báo cáo chung. Nếu tổ dùng bản cài riêng thì tải gói <code>.json</code> rồi gửi cho văn phòng nhập vào mục Tổng hợp toàn trường.</p>
        </div>
      </div>

      <div class="card in-duoc" id="kx" hidden>
        <div class="card-head"><h3>Xem trước văn bản</h3></div>
        <div class="sheet-shell"><div class="sheet" id="sheet2"></div></div>
      </div>

      <div class="card">
        <div class="card-head"><h3>Báo cáo đã nộp lên trường<span class="sub">${daNop.length} kỳ</span></h3></div>
        <div class="card-body tight">
          ${daNop.length ? `<div class="tbl-wrap"><table class="tbl">
            <thead><tr><th>Kỳ báo cáo</th><th>Ngày nộp</th><th>Người ký</th><th class="num">Tiết dạy</th><th class="num">HS chưa đạt</th><th></th></tr></thead>
            <tbody>${daNop.map(b=>`<tr><td class="nowrap">${U.tenThang(b.thang)}</td><td class="nowrap">${U.dmy(b.taoLuc)}</td>
              <td>${U.esc(b.nguoiKy||"")}</td><td class="num">${b.soLieu?.tietDay??""}</td><td class="num">${b.soLieu?.hsYeu?.so??""}</td>
              <td class="nowrap"><button class="btn btn-sm btn-line" data-tb="${b.id}">Tải Word</button>
              <button class="btn btn-sm btn-line" data-xb="${b.id}">Thu hồi</button></td></tr>`).join("")}</tbody></table></div>`
          : UI.trong("Chưa nộp báo cáo nào lên trường", "")}
        </div>
      </div>`;

    el.querySelector("#bcThang").onchange = e => { this.thang = e.target.value; this.render(el); };

    const thu = () => {
      const bc = { so: el.querySelector("#bcSo").value, thang, nguoiKy: el.querySelector("#bcKy").value, mucs: [] };
      [...el.querySelectorAll("[data-muc]")].filter(c=>c.checked).forEach(c => {
        const m = Bien.muc(c.dataset.muc, thang, el.querySelector("#bcTo").value); if (m) bc.mucs.push(m);
      });
      const chung = el.querySelector("#bcChung").value.trim();
      const dx = el.querySelector("#bcDeXuat").value.trim();
      if (chung) bc.mucs.push({ tieuDe:"Đánh giá chung", noiDung: chung });
      if (dx) bc.mucs.push({ tieuDe:"Đề xuất, kiến nghị", noiDung: dx });
      return bc;
    };

    const goi = () => {
      const bc = thu();
      return {
        loai: "BAOCAO_TO", to: el.querySelector("#bcTo").value || to,
        truong: Store.settings.truong, namHoc: Store.settings.namHoc,
        thang, so: bc.so, nguoiKy: bc.nguoiKy, mucs: bc.mucs,
        danhGia: el.querySelector("#bcChung").value, deXuat: el.querySelector("#bcDeXuat").value,
        soLieu: Bien.soLieu(thang, el.querySelector("#bcTo").value || to),
        taoLuc: U.now()
      };
    };

    el.querySelector("#bcXem").onclick = () => {
      el.querySelector("#kx").hidden = false;
      el.querySelector("#sheet2").innerHTML = Xuat.thanBaoCaoTo(thu());
    };
    el.querySelector("#bcWord").onclick = () => Xuat.baoCaoTo(thu());

    el.querySelector("#bcNop").onclick = async () => {
      const g = goi();
      if (nopThangNay) { Object.assign(nopThangNay, g); await Store.put("baocaoto", nopThangNay); }
      else await Store.add("baocaoto", g);
      await Store.log("Nộp báo cáo tổ lên trường", `${g.to} — ${U.tenThang(thang)}`);
      UI.toast("Đã nộp lên trường.", "ok"); this.render(el);
    };

    el.querySelector("#bcGoi").onclick = () => {
      const g = goi();
      U.tai(`BaoCao_${(g.to||"To").replace(/\s+/g,"")}_${thang.replace("-","_")}.json`, JSON.stringify(g, null, 1), "application/json");
    };

    el.querySelectorAll("[data-tb]").forEach(b => b.onclick = () => {
      const r = Store.get("baocaoto", b.dataset.tb);
      Xuat.baoCaoTo({ so:r.so, thang:r.thang, nguoiKy:r.nguoiKy, mucs:r.mucs });
    });
    el.querySelectorAll("[data-xb]").forEach(b => b.onclick = () => UI.hoi("Thu hồi báo cáo đã nộp lên trường?", async () => {
      await Store.del("baocaoto", b.dataset.xb); UI.toast("Đã thu hồi."); this.render(el);
    }));
  }
};

/* ================= TÀI KHOẢN ================= */
Pages.taikhoan = {
  eyebrow: "Quản trị", title: "Tài khoản giáo viên",
  render(el){
    if (!Auth.quanTri()) { el.innerHTML = UI.trong("Chỉ quản trị được cấp tài khoản", ""); return; }
    const ds = Store.list("users").sort((a,b)=> (a.hoTen||"").localeCompare(b.hoTen||""));

    el.innerHTML = `
      <div class="card">
        <div class="card-head"><h3>Cấp tài khoản<span class="sub">Giáo viên đăng nhập bằng tên tài khoản và mật khẩu bạn đặt tại đây</span></h3>
          <button class="btn btn-sm btn-line" id="btnMauGV">Tải mẫu nhập hàng loạt</button></div>
        <div class="card-body">
          <form id="fU">
            <div class="grid g3">
              <label class="fld"><span>Họ và tên</span><input name="hoTen" required></label>
              <label class="fld"><span>Tên đăng nhập</span><input name="username" required pattern="[A-Za-z0-9._-]+" title="Không dấu, không khoảng trắng"></label>
              <label class="fld"><span>Mật khẩu</span><input name="pass" required minlength="6"></label>
              <label class="fld"><span>Vai trò</span><select name="role">${UI.chon(Object.entries(VAI_TRO).map(([k,v])=>[k,v]), "giaovien")}</select></label>
              <label class="fld"><span>Môn dạy</span><input name="monDay" value="Toán"></label>
              <label class="fld"><span>Chức vụ</span><input name="chucVu" placeholder="Giáo viên"></label>
              <label class="fld"><span>Tổ chuyên môn</span><input name="to" list="dsToCM" value="${U.esc(Store.settings.to||"")}"><datalist id="dsToCM">${(Store.settings.dsTo||"").split("\n").filter(x=>x.trim()).map(x=>`<option value="${U.esc(x.trim())}">`).join("")}</datalist></label>
            </div>
            <div class="row">
              <button class="btn btn-primary" type="submit">Tạo tài khoản</button>
              <label class="fld" style="max-width:280px;margin:0"><span>Hoặc nhập từ tệp Excel</span><input type="file" id="fileGV" accept=".xlsx,.xls,.csv"></label>
            </div>
          </form>
          <p class="note warn" style="margin-top:14px">Vai trò <b>Thư ký</b> được lập và xuất biên bản; <b>Tổ trưởng</b> thêm quyền duyệt giáo án và xuất báo cáo tổ; <b>Quản trị</b> có toàn quyền.</p>
        </div>
      </div>

      <div class="card">
        <div class="card-head"><h3>Danh sách tài khoản<span class="sub">${ds.length} tài khoản</span></h3></div>
        <div class="card-body tight"><div class="tbl-wrap"><table class="tbl">
          <thead><tr><th>Họ và tên</th><th>Đăng nhập</th><th>Vai trò</th><th>Tổ</th><th>Môn</th><th>Chức vụ</th><th>Trạng thái</th><th></th></tr></thead>
          <tbody>${ds.map(u=>`<tr>
            <td><b>${U.esc(u.hoTen)}</b></td><td>${U.esc(u.username)}</td>
            <td><span class="tag ${u.role==="giaovien"?"t-grey":"t-info"}">${VAI_TRO[u.role]}</span></td>
            <td>${U.esc(u.to||Store.settings.to||"")}</td><td>${U.esc(u.monDay||"")}</td><td>${U.esc(u.chucVu||"")}</td>
            <td>${u.active===false?'<span class="tag t-no">Đã khoá</span>':'<span class="tag t-ok">Hoạt động</span>'}</td>
            <td class="nowrap">
              <button class="btn btn-sm btn-line" data-mk="${u.id}">Đổi mật khẩu</button>
              <button class="btn btn-sm btn-line" data-khoa="${u.id}">${u.active===false?"Mở":"Khoá"}</button>
              ${u.id!==Auth.me.id?`<button class="btn btn-sm btn-line" data-xu="${u.id}">Xoá</button>`:""}
            </td></tr>`).join("")}</tbody></table></div></div>
      </div>`;

    el.querySelector("#btnMauGV").onclick = () => {
      if (!coXLSX()) return;
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([
        ["Họ và tên","Tên đăng nhập","Mật khẩu","Vai trò","Tổ chuyên môn","Môn dạy","Chức vụ"],
        ["Nguyễn Văn A","nguyenvana","123456","giaovien","Tổ Toán","Toán","Giáo viên"]
      ]), "Giao vien");
      XLSX.writeFile(wb, "Mau_Nhap_GiaoVien.xlsx");
    };

    el.querySelector("#fU").onsubmit = async ev => {
      ev.preventDefault();
      const f = Object.fromEntries(new FormData(ev.target));
      if (Store.list("users").some(u => u.username.toLowerCase() === f.username.toLowerCase())) {
        UI.toast("Tên đăng nhập đã tồn tại.", "err"); return;
      }
      await Store.add("users", { hoTen:f.hoTen, username:f.username, role:f.role, monDay:f.monDay,
        chucVu:f.chucVu, to:f.to, active:true, passHash: await U.hash(f.username, f.pass) });
      await Store.log("Cấp tài khoản", f.hoTen);
      UI.toast("Đã tạo tài khoản.", "ok"); this.render(el);
    };

    el.querySelector("#fileGV").onchange = ev => {
      const file = ev.target.files[0]; if (!file) return;
      if (!coXLSX()) return;
      const r = new FileReader();
      r.onload = async e => {
        try {
          const wb = XLSX.read(e.target.result, {type:"array"});
          const rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], {defval:""});
          let n = 0;
          for (const row of rows) {
            const ten = row["Họ và tên"], un = String(row["Tên đăng nhập"]||"").trim();
            if (!ten || !un || Store.list("users").some(u=>u.username.toLowerCase()===un.toLowerCase())) continue;
            await Store.add("users", { hoTen:ten, username:un, role: row["Vai trò"]||"giaovien",
              to: row["Tổ chuyên môn"]||Store.settings.to||"",
              monDay: row["Môn dạy"]||"", chucVu: row["Chức vụ"]||"Giáo viên", active:true,
              passHash: await U.hash(un, String(row["Mật khẩu"]||"123456")) });
            n++;
          }
          UI.toast(`Đã nhập ${n} tài khoản.`, "ok"); this.render(el);
        } catch (err) { UI.toast("Tệp không đọc được: " + err.message, "err"); }
      };
      r.readAsArrayBuffer(file);
    };

    el.querySelectorAll("[data-mk]").forEach(b => b.onclick = () => {
      const u = Store.get("users", b.dataset.mk);
      const body = UI.modal("Đổi mật khẩu — " + u.hoTen,
        `<label class="fld"><span>Mật khẩu mới</span><input id="mkm" minlength="6"></label>`,
        [{text:"Huỷ",cls:"btn-line"},{text:"Đổi",cls:"btn-primary",fn:async()=>{
          const v = body.querySelector("#mkm").value;
          if (v.length < 6) { UI.toast("Mật khẩu tối thiểu 6 ký tự.","err"); return false; }
          u.passHash = await U.hash(u.username, v); await Store.put("users", u);
          UI.toast("Đã đổi mật khẩu.","ok");
        }}]);
    });

    el.querySelectorAll("[data-khoa]").forEach(b => b.onclick = async () => {
      const u = Store.get("users", b.dataset.khoa);
      u.active = u.active === false; await Store.put("users", u); this.render(el);
    });

    el.querySelectorAll("[data-xu]").forEach(b => b.onclick = () => UI.hoi("Xoá tài khoản này?", async () => {
      await Store.del("users", b.dataset.xu); UI.toast("Đã xoá."); this.render(el);
    }));
  }
};

/* ================= CÀI ĐẶT ================= */
Pages.caidat = {
  eyebrow: "Quản trị", title: "Cài đặt",
  render(el){
    const s = Store.settings;
    el.innerHTML = `
      ${(Auth.duyet() || Auth.hieuTruong()) ? `
      <div class="card">
        <div class="card-head"><h3>Thông tin đơn vị<span class="sub">Dùng cho phần đầu của mọi văn bản xuất ra</span></h3></div>
        <div class="card-body"><form id="fS">
          <div class="grid g2">
            <label class="fld"><span>Cơ quan chủ quản</span><input name="so" value="${U.esc(s.so||"")}"></label>
            <label class="fld"><span>Tên trường</span><input name="truong" value="${U.esc(s.truong||"")}"></label>
            <label class="fld"><span>Tên tổ</span><input name="to" value="${U.esc(s.to||"")}"></label>
            <label class="fld"><span>Năm học</span><select name="namHoc">${UI.chon(UI.dsNamHoc(), s.namHoc)}</select></label>
            <label class="fld"><span>Địa danh ghi trên văn bản</span><input name="diaDanh" value="${U.esc(s.diaDanh||"")}"></label>
            <label class="fld"><span>Hiệu trưởng</span><input name="hieuTruong" value="${U.esc(s.hieuTruong||"")}"></label>
            <label class="fld"><span>Tổ trưởng</span><input name="toTruong" value="${U.esc(s.toTruong||"")}"></label>
            <label class="fld"><span>Thư ký</span><input name="thuKy" value="${U.esc(s.thuKy||"")}"></label>
            <label class="fld"><span>Thang đánh giá</span><select name="thangDanhGia">${UI.chon([["tt22","Tốt – Khá – Đạt – Chưa đạt (TT22)"],["tt58","Giỏi – Khá – TB – Yếu – Kém"]], s.thangDanhGia||"tt22")}</select></label>
            <label class="fld"><span>Ngưỡng điểm chưa đạt</span><input type="number" step="0.1" name="nguongYeu" value="${s.nguongYeu||5}"></label>
            <label class="fld"><span>Hạn nộp báo cáo (ngày trong tháng)</span><input type="number" min="1" max="31" name="hanBaoCao" value="${s.hanBaoCao||25}"></label>
          </div>
          <label class="fld"><span>Danh sách tổ chuyên môn toàn trường — mỗi dòng một tổ (hiệu trưởng dùng để đối chiếu tổ nào chưa nộp)</span><textarea name="dsTo" placeholder="Tổ Toán&#10;Tổ Ngữ văn&#10;Tổ Tiếng Anh">${U.esc(s.dsTo||"")}</textarea></label>
          <button class="btn btn-primary" type="submit">Lưu cài đặt</button>
        </form></div>
      </div>` : ""}

      <div class="card">
        <div class="card-head"><h3>Mật khẩu của tôi</h3></div>
        <div class="card-body"><form id="fMK" class="row">
          <label class="fld" style="max-width:240px"><span>Mật khẩu hiện tại</span><input type="password" name="cu" required></label>
          <label class="fld" style="max-width:240px"><span>Mật khẩu mới</span><input type="password" name="moi" required minlength="6"></label>
          <button class="btn btn-primary" type="submit">Đổi mật khẩu</button>
        </form></div>
      </div>

      <div class="card">
        <div class="card-head"><h3>Sao lưu dữ liệu<span class="sub">Nên tải bản sao vào cuối mỗi học kỳ để lưu trữ theo năm học</span></h3></div>
        <div class="card-body">
          <div class="row">
            <button class="btn btn-line" id="btnLuu">Tải bản sao (.json)</button>
            <label class="fld" style="max-width:300px;margin:0"><span>Phục hồi từ bản sao</span><input type="file" id="filePH" accept=".json"></label>
          </div>
          <p class="note" style="margin-top:14px">Chế độ lưu trữ hiện tại: <b>${Store.mode === "firebase" ? "Firebase — cả tổ dùng chung" : "Cục bộ — chỉ trên máy này"}</b>. Đổi chế độ trong tệp <code>js/config.js</code>.</p>
        </div>
      </div>`;

    const fs = el.querySelector("#fS");
    if (fs) fs.onsubmit = async ev => {
      ev.preventDefault();
      const f = Object.fromEntries(new FormData(ev.target));
      f.nguongYeu = Number(f.nguongYeu); f.hanBaoCao = Number(f.hanBaoCao);
      await Store.saveSettings(f); UI.toast("Đã lưu cài đặt.", "ok"); App.nhan();
    };

    el.querySelector("#fMK").onsubmit = async ev => {
      ev.preventDefault();
      const f = Object.fromEntries(new FormData(ev.target));
      if (await U.hash(Auth.me.username, f.cu) !== Auth.me.passHash) { UI.toast("Mật khẩu hiện tại chưa đúng.", "err"); return; }
      Auth.me.passHash = await U.hash(Auth.me.username, f.moi);
      await Store.put("users", Auth.me);
      UI.toast("Đã đổi mật khẩu.", "ok"); ev.target.reset();
    };

    el.querySelector("#btnLuu").onclick = () => {
      const goi = { cauhinh: Store.settings, luc: U.now() };
      COLLS.forEach(c => goi[c] = Store.list(c));
      U.tai(`SaoLuu_TCM_${U.today()}.json`, JSON.stringify(goi, null, 1), "application/json");
    };

    el.querySelector("#filePH").onchange = ev => {
      const f = ev.target.files[0]; if (!f) return;
      UI.hoi("Phục hồi sẽ ghi đè toàn bộ dữ liệu hiện có. Tiếp tục?", () => {
        const r = new FileReader();
        r.onload = async e => {
          try {
            const goi = JSON.parse(e.target.result);
            for (const c of COLLS) {
              for (const x of Store.list(c)) await Store.del(c, x.id);
              for (const x of (goi[c] || [])) await Store.add(c, x);
            }
            if (goi.cauhinh) await Store.saveSettings(goi.cauhinh);
            UI.toast("Đã phục hồi dữ liệu.", "ok"); setTimeout(()=>location.reload(), 900);
          } catch (err) { UI.toast("Tệp sao lưu không hợp lệ.", "err"); }
        };
        r.readAsText(f);
      });
    };
  }
};
