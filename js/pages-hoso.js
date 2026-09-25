/* =========================================================
   TRANG: Tổng quan – Báo cáo tháng – Giáo án – Dự giờ
   ========================================================= */
window.Pages = window.Pages || {};

/* Đọc tệp đính kèm nhỏ thành chuỗi để lưu kèm hồ sơ */
function docFile(input, max = 600 * 1024){
  return new Promise((res, rej) => {
    const f = input && input.files && input.files[0];
    if (!f) return res(null);
    if (f.size > max) return rej(new Error(`Tệp ${(f.size/1024/1024).toFixed(1)} MB vượt mức cho phép (0,6 MB). Hãy tải lên Google Drive rồi dán đường dẫn.`));
    const r = new FileReader();
    r.onload = () => res({ ten: f.name, kichThuoc: f.size, data: r.result });
    r.onerror = () => rej(new Error("Không đọc được tệp."));
    r.readAsDataURL(f);
  });
}
function oTaiVe(f, nhan){
  if (!f) return "—";
  return `<a href="${f.data}" download="${U.esc(f.ten)}">${U.esc(nhan || f.ten)}</a>`;
}
function moLink(link, nhan){
  if (!link) return "";
  return `<a href="${U.esc(link)}" target="_blank" rel="noopener">${U.esc(nhan||"Mở liên kết")}</a>`;
}

/* ================= TỔNG QUAN ================= */
Pages.tongquan = {
  eyebrow: "Hồ sơ chuyên môn", title: "Tổng quan",
  render(el){
    const me = Auth.me, thang = UI.thangMacDinh(), s = Store.settings;
    const gv = Store.list("users", u => u.active !== false);
    const bcThang = Store.list("baocao", b => b.thang === thang);
    const gaCho = Store.list("giaoan", g => g.trangThai === "cho");
    const dgThang = Store.list("dugio", d => (d.ngay||"").startsWith(thang));
    const chuaNop = gv.filter(u => !bcThang.some(b => b.uid === u.id));
    const conLai = new Date(new Date().getFullYear(), new Date().getMonth(), s.hanBaoCao||25) - new Date();
    const ngayConLai = Math.ceil(conLai / 86400000);

    const cuaToi = {
      baocao: bcThang.some(b => b.uid === me.id),
      giaoan: Store.list("giaoan", g => g.uid === me.id).length,
      dugio:  Store.list("dugio",  d => d.nguoiDuId === me.id).length,
      viec:   Store.list("congviec", c => c.loai !== "chuyende" && c.nguoiNhanId === me.id && (c.mucDo||0) < 100).length
    };

    el.innerHTML = `
      <div class="grid g4" style="margin-bottom:18px">
        <div class="stat"><b>${gv.length}</b><span>Thành viên tổ</span></div>
        <div class="stat ${bcThang.length===gv.length?"s-ok":"s-warn"}"><b>${bcThang.length}/${gv.length}</b><span>Đã nộp báo cáo tháng ${Number(thang.slice(5))}</span></div>
        <div class="stat ${gaCho.length?"s-warn":"s-ok"}"><b>${gaCho.length}</b><span>Giáo án chờ duyệt</span></div>
        <div class="stat"><b>${dgThang.length}</b><span>Tiết dự giờ trong tháng</span></div>
      </div>

      <div class="card">
        <div class="card-head"><h3>Việc của tôi<span class="sub">${U.esc(me.hoTen)} · ${VAI_TRO[me.role]}</span></h3></div>
        <div class="card-body">
          <table class="tbl">
            <tbody>
              <tr><td>Báo cáo công tác tháng ${Number(thang.slice(5))}</td>
                  <td class="nowrap">${cuaToi.baocao?'<span class="tag t-ok">Đã nộp</span>':'<span class="tag t-wait">Chưa nộp</span>'}</td>
                  <td class="nowrap"><button class="btn btn-sm btn-line" data-di="baocao">Mở</button></td></tr>
              <tr><td>Giáo án đã nộp trong năm học</td><td class="num">${cuaToi.giaoan}</td>
                  <td class="nowrap"><button class="btn btn-sm btn-line" data-di="giaoan">Mở</button></td></tr>
              <tr><td>Phiếu dự giờ tôi đã ghi</td><td class="num">${cuaToi.dugio}</td>
                  <td class="nowrap"><button class="btn btn-sm btn-line" data-di="dugio">Mở</button></td></tr>
              <tr><td>Công việc được giao chưa hoàn thành</td>
                  <td>${cuaToi.viec ? `<span class="tag t-wait">${cuaToi.viec} việc</span>` : '<span class="tag t-ok">Không còn việc tồn</span>'}</td>
                  <td class="nowrap"><button class="btn btn-sm btn-line" data-di="congviec">Mở</button></td></tr>
            </tbody>
          </table>
          ${ngayConLai >= 0 ? `<p class="note" style="margin:14px 0 0">Hạn nộp báo cáo tháng này là ngày ${s.hanBaoCao||25} — còn ${ngayConLai} ngày.</p>` : ""}
        </div>
      </div>

      ${Auth.toanTo() ? `
      <div class="card">
        <div class="card-head"><h3>Chưa nộp báo cáo tháng ${Number(thang.slice(5))}<span class="sub">Nhắc trực tiếp hoặc gửi lời nhắc trong cuộc họp</span></h3>
          <span class="tag ${chuaNop.length?"t-no":"t-ok"}">${chuaNop.length} người</span></div>
        <div class="card-body tight">
          ${chuaNop.length ? `<div class="tbl-wrap"><table class="tbl"><tbody>${
            chuaNop.map(u => `<tr><td>${U.esc(u.hoTen)}</td><td>${U.esc(u.monDay||"")}</td><td>${U.esc(u.chucVu||"")}</td></tr>`).join("")
          }</tbody></table></div>` : UI.trong("Cả tổ đã nộp đủ", "Có thể chốt số liệu và lập biên bản họp.")}
        </div>
      </div>` : ""}

      <div class="card">
        <div class="card-head"><h3>Hoạt động gần đây</h3></div>
        <div class="card-body tight">
          ${(() => {
            const nk = Store.list("nhatky").sort((a,b)=>a.luc<b.luc?1:-1).slice(0,8);
            return nk.length ? `<div class="tbl-wrap"><table class="tbl"><tbody>${nk.map(x=>
              `<tr><td class="nowrap" style="color:var(--muted)">${U.dmyGio(x.luc)}</td><td>${U.esc(x.ai)}</td><td>${U.esc(x.hanhDong)} ${U.esc(x.chiTiet||"")}</td></tr>`
            ).join("")}</tbody></table></div>` : UI.trong("Chưa có hoạt động", "Nhật ký sẽ ghi lại các thao tác nộp, duyệt, kết xuất.");
          })()}
        </div>
      </div>`;

    el.querySelectorAll("[data-di]").forEach(b => b.onclick = () => App.di(b.dataset.di));
  }
};

/* ================= BÁO CÁO CÔNG TÁC THÁNG ================= */
Pages.baocao = {
  eyebrow: "Hồ sơ chuyên môn", title: "Báo cáo công tác tháng",
  render(el){
    const thang = this.thang || UI.thangMacDinh();
    this.thang = thang;
    const cuaToi = Store.list("baocao").find(b => b.uid === Auth.me.id && b.thang === thang);
    const caTo = Store.list("baocao", b => b.thang === thang);
    const gv = Store.list("users", u => u.active !== false);

    el.innerHTML = `
      <div class="card">
        <div class="card-head">
          <h3>Báo cáo của tôi<span class="sub">Nộp trước ngày ${Store.settings.hanBaoCao||25} hằng tháng</span></h3>
          <select id="chonThang" style="width:auto">${UI.chon(UI.dsThang(), thang)}</select>
        </div>
        <div class="card-body">
          <form id="fBC">
            <div class="grid g4">
              <label class="fld"><span>Số ngày công</span><input type="number" step="0.5" min="0" name="ngayCong" value="${cuaToi?.ngayCong ?? ""}"></label>
              <label class="fld"><span>Số tiết đã dạy</span><input type="number" min="0" name="soTiet" value="${cuaToi?.soTiet ?? ""}"></label>
              <label class="fld"><span>Tiết dự giờ</span><input type="number" min="0" name="tietDuGio" value="${cuaToi?.tietDuGio ?? ""}"></label>
              <label class="fld"><span>Tiết dạy thay / nghỉ</span><input type="text" name="dayThay" value="${U.esc(cuaToi?.dayThay||"")}"></label>
            </div>
            <div class="grid g2">
              <label class="fld"><span>Chương trình đã thực hiện (Đại số, Hình học, Thống kê – Xác suất, Chuyên đề…)</span>
                <textarea name="chuongTrinh">${U.esc(cuaToi?.chuongTrinh||"")}</textarea></label>
              <label class="fld"><span>Công việc đã làm trong tháng</span>
                <textarea name="daLam">${U.esc(cuaToi?.daLam||"")}</textarea></label>
              <label class="fld"><span>Kết quả nổi bật (bồi dưỡng, phụ đạo, chuyên đề…)</span>
                <textarea name="ketQua">${U.esc(cuaToi?.ketQua||"")}</textarea></label>
              <label class="fld"><span>Khó khăn, vướng mắc</span>
                <textarea name="khoKhan">${U.esc(cuaToi?.khoKhan||"")}</textarea></label>
              <label class="fld"><span>Đề xuất, kiến nghị</span>
                <textarea name="deXuat">${U.esc(cuaToi?.deXuat||"")}</textarea></label>
              <label class="fld"><span>Kế hoạch tháng tới</span>
                <textarea name="keHoach">${U.esc(cuaToi?.keHoach||"")}</textarea></label>
            </div>
            <div class="row">
              <button class="btn btn-primary" type="submit">${cuaToi ? "Cập nhật báo cáo" : "Nộp báo cáo"}</button>
              ${cuaToi ? `<span class="tag t-ok">Đã nộp ${U.dmyGio(cuaToi.taoLuc)}</span>` : ""}
            </div>
          </form>
        </div>
      </div>

      ${Auth.toanTo() ? `
      <div class="card">
        <div class="card-head"><h3>Tổng hợp cả tổ<span class="sub">${caTo.length}/${gv.length} thành viên đã nộp · ${U.tenThang(thang)}</span></h3>
          <button class="btn btn-sm btn-line" id="btnXuatTH">Tải bảng tổng hợp</button></div>
        <div class="card-body tight">
          ${caTo.length ? `<div class="tbl-wrap"><table class="tbl">
            <thead><tr><th>Giáo viên</th><th class="num">Ngày công</th><th class="num">Tiết dạy</th><th class="num">Dự giờ</th><th>Công việc chính</th><th>Đề xuất</th><th></th></tr></thead>
            <tbody>${caTo.map(b => `<tr>
              <td class="nowrap"><b>${U.esc(b.hoTen)}</b></td>
              <td class="num">${U.so(b.ngayCong)}</td><td class="num">${b.soTiet||""}</td><td class="num">${b.tietDuGio||""}</td>
              <td>${U.esc((b.daLam||"").slice(0,90))}${(b.daLam||"").length>90?"…":""}</td>
              <td>${U.esc((b.deXuat||"").slice(0,60))}</td>
              <td class="nowrap"><button class="btn btn-sm btn-line" data-xem="${b.id}">Xem</button></td>
            </tr>`).join("")}</tbody></table></div>` : UI.trong("Chưa ai nộp báo cáo tháng này", "")}
        </div>
      </div>` : ""}`;

    el.querySelector("#chonThang").onchange = e => { this.thang = e.target.value; this.render(el); };

    el.querySelector("#fBC").onsubmit = async ev => {
      ev.preventDefault();
      const f = Object.fromEntries(new FormData(ev.target));
      const obj = Object.assign(cuaToi || {}, f, {
        uid: Auth.me.id, hoTen: Auth.me.hoTen, thang,
        ngayCong: Number(f.ngayCong)||0, soTiet: Number(f.soTiet)||0, tietDuGio: Number(f.tietDuGio)||0
      });
      cuaToi ? await Store.put("baocao", obj) : await Store.add("baocao", obj);
      await Store.log("Nộp báo cáo tháng", U.tenThang(thang));
      UI.toast("Đã lưu báo cáo.", "ok");
      this.render(el);
    };

    el.querySelectorAll("[data-xem]").forEach(b => b.onclick = () => {
      const r = Store.get("baocao", b.dataset.xem);
      UI.modal(`Báo cáo — ${r.hoTen}`, `
        <p><b>Ngày công:</b> ${U.so(r.ngayCong)} · <b>Tiết dạy:</b> ${r.soTiet||0} · <b>Dự giờ:</b> ${r.tietDuGio||0}</p>
        ${["chuongTrinh|Chương trình đã thực hiện","daLam|Công việc đã làm","ketQua|Kết quả nổi bật","khoKhan|Khó khăn","deXuat|Đề xuất","keHoach|Kế hoạch tháng tới"]
          .map(k => { const [f,n] = k.split("|"); return r[f] ? `<p><b>${n}:</b><br>${U.esc(r[f]).replace(/\n/g,"<br>")}</p>` : ""; }).join("")}`);
    });

    const btn = el.querySelector("#btnXuatTH");
    if (btn) btn.onclick = () => {
      if (!coXLSX()) return;
      const aoa = [["Giáo viên","Ngày công","Tiết dạy","Dự giờ","Chương trình","Công việc đã làm","Kết quả","Khó khăn","Đề xuất","Kế hoạch"]];
      caTo.forEach(b => aoa.push([b.hoTen,b.ngayCong,b.soTiet,b.tietDuGio,b.chuongTrinh,b.daLam,b.ketQua,b.khoKhan,b.deXuat,b.keHoach]));
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(aoa), "Tong hop");
      XLSX.writeFile(wb, `TongHop_BaoCao_${thang.replace("-","_")}.xlsx`);
    };
  }
};

/* ================= GIÁO ÁN ================= */
Pages.giaoan = {
  eyebrow: "Hồ sơ chuyên môn", title: "Giáo án",
  render(el){
    const tab = this.tab || "cuatoi";
    this.tab = tab;
    const tatCa = Store.list("giaoan").sort((a,b)=>a.taoLuc<b.taoLuc?1:-1);
    const ds = tab === "cuatoi" ? tatCa.filter(g => g.uid === Auth.me.id)
             : tab === "cho"    ? tatCa.filter(g => g.trangThai === "cho")
             :                    tatCa.filter(g => g.trangThai === "duyet");

    el.innerHTML = `
      <div class="card">
        <div class="card-head"><h3>Nộp giáo án<span class="sub">Dán liên kết Google Drive (khuyên dùng) hoặc đính kèm tệp nhỏ dưới 0,6 MB</span></h3></div>
        <div class="card-body">
          <form id="fGA">
            <div class="grid g4">
              <label class="fld"><span>Môn</span><input name="mon" value="${U.esc(Auth.me.monDay||"")}" required></label>
              <label class="fld"><span>Khối / lớp</span><input name="khoi" placeholder="12A1" required></label>
              <label class="fld"><span>Tuần</span><input type="number" min="1" max="40" name="tuan" required></label>
              <label class="fld"><span>Tiết PPCT</span><input name="tiet" placeholder="Tiết 25"></label>
            </div>
            <label class="fld"><span>Tên bài dạy</span><input name="tenBai" required></label>
            <div class="grid g2">
              <label class="fld"><span>Liên kết tệp giáo án</span><input name="link" type="url" placeholder="https://drive.google.com/..."></label>
              <label class="fld"><span>Hoặc đính kèm tệp</span><input type="file" name="tep" accept=".doc,.docx,.pdf,.ppt,.pptx"></label>
            </div>
            <button class="btn btn-primary" type="submit">Nộp giáo án</button>
          </form>
        </div>
      </div>

      <div class="card">
        <div class="card-head">
          <h3>Kho giáo án</h3>
          <div class="row" style="gap:6px">
            <button class="btn btn-sm ${tab==="cuatoi"?"btn-primary":"btn-line"}" data-tab="cuatoi">Của tôi</button>
            <button class="btn btn-sm ${tab==="duyet"?"btn-primary":"btn-line"}" data-tab="duyet">Đã duyệt (cả tổ)</button>
            ${Auth.duyet() ? `<button class="btn btn-sm ${tab==="cho"?"btn-primary":"btn-line"}" data-tab="cho">Chờ duyệt (${tatCa.filter(g=>g.trangThai==="cho").length})</button>` : ""}
          </div>
        </div>
        <div class="card-body tight">
          ${ds.length ? `<div class="tbl-wrap"><table class="tbl">
            <thead><tr><th>Ngày nộp</th><th>Giáo viên</th><th>Môn</th><th class="num">Tuần</th><th>Tên bài</th><th>Tệp</th><th>Trạng thái</th><th></th></tr></thead>
            <tbody>${ds.map(g => `<tr>
              <td class="nowrap">${U.dmy(g.taoLuc)}</td>
              <td class="nowrap">${U.esc(g.hoTen)}</td>
              <td>${U.esc(g.mon)} ${U.esc(g.khoi)}</td>
              <td class="num">${g.tuan||""}</td>
              <td>${U.esc(g.tenBai)}${g.nhanXet && (g.uid === Auth.me.id || Auth.duyet())
                ? `<br><i style="font-size:12px;color:var(--seal)">Góp ý: ${U.esc(g.nhanXet)}</i>` : ""}</td>
              <td class="nowrap">${g.link ? moLink(g.link,"Xem") : oTaiVe(g.tep,"Tải")}</td>
              <td>${theTrangThai(g.trangThai)}</td>
              <td class="nowrap">
                ${Auth.duyet() && g.trangThai !== "duyet" ? `<button class="btn btn-sm btn-ok" data-duyet="${g.id}">Duyệt</button>` : ""}
                ${Auth.duyet() ? `<button class="btn btn-sm btn-line" data-tra="${g.id}">Góp ý</button>` : ""}
                ${(g.uid === Auth.me.id || Auth.quanTri()) ? `<button class="btn btn-sm btn-line" data-xoa="${g.id}">Xoá</button>` : ""}
              </td></tr>`).join("")}</tbody></table></div>`
          : UI.trong("Chưa có giáo án nào ở mục này", "Giáo án được duyệt sẽ hiện ở tab “Đã duyệt” cho cả tổ tham khảo.")}
        </div>
      </div>`;

    el.querySelectorAll("[data-tab]").forEach(b => b.onclick = () => { this.tab = b.dataset.tab; this.render(el); });

    el.querySelector("#fGA").onsubmit = async ev => {
      ev.preventDefault();
      const fd = new FormData(ev.target), f = Object.fromEntries(fd);
      let tep = null;
      try { tep = await docFile(ev.target.querySelector('[name="tep"]')); }
      catch (e) { UI.toast(e.message, "err"); return; }
      if (!f.link && !tep) { UI.toast("Cần dán liên kết hoặc đính kèm tệp giáo án.", "err"); return; }
      await Store.add("giaoan", {
        uid: Auth.me.id, hoTen: Auth.me.hoTen, mon: f.mon, khoi: f.khoi, tuan: Number(f.tuan)||null,
        tiet: f.tiet, tenBai: f.tenBai, link: f.link, tep, trangThai: "cho", nhanXet: ""
      });
      await Store.log("Nộp giáo án", f.tenBai);
      UI.toast("Đã nộp giáo án, chờ tổ trưởng duyệt.", "ok");
      ev.target.reset(); this.tab = "cuatoi"; this.render(el);
    };

    el.querySelectorAll("[data-duyet]").forEach(b => b.onclick = async () => {
      const g = Store.get("giaoan", b.dataset.duyet);
      g.trangThai = "duyet"; g.nguoiDuyet = Auth.me.hoTen; g.ngayDuyet = U.now();
      await Store.put("giaoan", g);
      await Store.log("Duyệt giáo án", `${g.hoTen} — ${g.tenBai}`);
      UI.toast("Đã duyệt.", "ok"); this.render(el);
    });

    el.querySelectorAll("[data-tra]").forEach(b => b.onclick = () => {
      const g = Store.get("giaoan", b.dataset.tra);
      UI.modal("Góp ý cho giáo án", `
        <p style="margin-top:0"><b>${U.esc(g.hoTen)}</b> — ${U.esc(g.tenBai)}</p>
        <label class="fld"><span>Nội dung góp ý gửi lại giáo viên</span><textarea id="gy">${U.esc(g.nhanXet||"")}</textarea></label>`,
        [{text:"Huỷ", cls:"btn-line"}, {text:"Gửi lại giáo viên", cls:"btn-primary", fn: async () => {
          g.nhanXet = document.getElementById("gy").value;
          g.trangThai = "tra"; g.nguoiDuyet = Auth.me.hoTen;
          await Store.put("giaoan", g); UI.toast("Đã gửi góp ý.", "ok"); this.render(el);
        }}]);
    });

    el.querySelectorAll("[data-xoa]").forEach(b => b.onclick = () => UI.hoi("Xoá giáo án này?", async () => {
      await Store.del("giaoan", b.dataset.xoa); UI.toast("Đã xoá."); this.render(el);
    }));
  }
};

function theTrangThai(t){
  return t === "duyet" ? '<span class="tag t-ok">Đã duyệt</span>'
       : t === "tra"   ? '<span class="tag t-no">Cần chỉnh sửa</span>'
       :                 '<span class="tag t-wait">Chờ duyệt</span>';
}

/* ================= DỰ GIỜ ================= */
Pages.dugio = {
  eyebrow: "Hồ sơ chuyên môn", title: "Phiếu dự giờ",
  render(el){
    const ds = Store.list("dugio").sort((a,b)=>a.ngay<b.ngay?1:-1)
      .filter(d => Auth.toanTo() || d.nguoiDuId === Auth.me.id || d.nguoiDayId === Auth.me.id);
    const gv = Store.list("users", u => u.active !== false);

    el.innerHTML = `
      <div class="card">
        <div class="card-head"><h3>Ghi phiếu dự giờ<span class="sub">Xếp loại theo tổng điểm: Giỏi từ 18, Khá từ 14, Đạt từ 10</span></h3></div>
        <div class="card-body">
          <form id="fDG">
            <div class="grid g4">
              <label class="fld"><span>Người dạy</span><select name="nguoiDayId" required>${UI.chon([["", "— chọn —"], ...gv.map(u=>[u.id,u.hoTen])])}</select></label>
              <label class="fld"><span>Lớp</span><input name="lop" required></label>
              <label class="fld"><span>Tiết</span><input name="tiet" placeholder="Tiết 3"></label>
              <label class="fld"><span>Ngày dự</span><input type="date" name="ngay" value="${U.today()}" required></label>
            </div>
            <div class="grid g2">
              <label class="fld"><span>Tên bài dạy</span><input name="tenBai" required></label>
              <label class="fld"><span>Tổng điểm (thang 20)</span><input type="number" step="0.5" min="0" max="20" name="diem" required></label>
              <label class="fld"><span>Ưu điểm</span><textarea name="uuDiem"></textarea></label>
              <label class="fld"><span>Hạn chế, góp ý</span><textarea name="tonTai"></textarea></label>
            </div>
            <button class="btn btn-primary" type="submit">Lưu phiếu dự giờ</button>
          </form>
        </div>
      </div>

      <div class="card">
        <div class="card-head"><h3>Phiếu đã ghi<span class="sub">${ds.length} phiếu</span></h3></div>
        <div class="card-body tight">
          ${ds.length ? `<div class="tbl-wrap"><table class="tbl">
            <thead><tr><th>Ngày</th><th>Người dạy</th><th>Lớp</th><th>Tên bài</th><th>Người dự</th><th class="num">Điểm</th><th>Xếp loại</th><th></th></tr></thead>
            <tbody>${ds.map(d => `<tr>
              <td class="nowrap">${U.dmy(d.ngay)}</td><td class="nowrap">${U.esc(d.nguoiDay)}</td><td>${U.esc(d.lop)}</td>
              <td>${U.esc(d.tenBai)}</td><td class="nowrap">${U.esc(d.nguoiDu)}</td>
              <td class="num">${U.so(d.diem)}</td><td><span class="tag ${d.xepLoai==="Giỏi"?"t-ok":d.xepLoai==="Chưa đạt"?"t-no":"t-info"}">${U.esc(d.xepLoai)}</span></td>
              <td class="nowrap"><button class="btn btn-sm btn-line" data-in="${d.id}">Xuất Word</button>
              ${(d.nguoiDuId===Auth.me.id||Auth.quanTri())?`<button class="btn btn-sm btn-line" data-xoa="${d.id}">Xoá</button>`:""}</td>
            </tr>`).join("")}</tbody></table></div>` : UI.trong("Chưa có phiếu dự giờ", "Ghi phiếu ngay sau tiết dự để không bỏ sót nhận xét.")}
        </div>
      </div>`;

    el.querySelector("#fDG").onsubmit = async ev => {
      ev.preventDefault();
      const f = Object.fromEntries(new FormData(ev.target));
      const d = Number(f.diem);
      const xl = d >= 18 ? "Giỏi" : d >= 14 ? "Khá" : d >= 10 ? "Đạt" : "Chưa đạt";
      const nd = Store.get("users", f.nguoiDayId);
      await Store.add("dugio", Object.assign(f, {
        diem: d, xepLoai: xl, nguoiDay: nd?.hoTen || "", mon: nd?.monDay || "",
        nguoiDu: Auth.me.hoTen, nguoiDuId: Auth.me.id
      }));
      await Store.log("Ghi phiếu dự giờ", `${nd?.hoTen} — ${f.tenBai}`);
      UI.toast("Đã lưu phiếu dự giờ.", "ok"); ev.target.reset(); this.render(el);
    };

    el.querySelectorAll("[data-in]").forEach(b => b.onclick = () => Xuat.phieuDuGio(Store.get("dugio", b.dataset.in)));
    el.querySelectorAll("[data-xoa]").forEach(b => b.onclick = () => UI.hoi("Xoá phiếu dự giờ này?", async () => {
      await Store.del("dugio", b.dataset.xoa); UI.toast("Đã xoá."); this.render(el);
    }));
  }
};
