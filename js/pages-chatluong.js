/* =========================================================
   TRANG: Bảng điểm & thống kê chất lượng – Học sinh chưa đạt
   ========================================================= */
window.Pages = window.Pages || {};

const DOT = [
  ["HK1", "Học kỳ I"], ["HK2", "Học kỳ II"], ["CN", "Cả năm"],
  ["GK1", "Giữa kỳ I"], ["GK2", "Giữa kỳ II"]
];

/* Đọc một ô điểm: ô trống trả về null, chấp nhận “7,5” lẫn “7.5” */
function soDiem(v){
  if (v === "" || v == null) return null;
  const n = Number(String(v).trim().replace(",", "."));
  return isFinite(n) ? n : null;
}
const laSo = x => typeof x === "number" && isFinite(x);

/* ---- Tính điểm trung bình môn theo Thông tư 22: (ΣTX + 2·GK + 3·CK)/(n+5) ---- */
function tinhTBM(hs){
  const tx = (hs.tx || []).filter(laSo);
  const gk = hs.gk, ck = hs.ck;
  if (!laSo(gk) || !laSo(ck) || !tx.length) return null;   /* thiếu cột thì để trống */
  return (tx.reduce((a,b)=>a+b,0) + 2*gk + 3*ck) / (tx.length + 5);
}

/* ---- Nhận diện cột trong tệp Excel giáo viên nộp ---- */
function docBangDiem(aoa){
  let hIdx = -1;
  for (let i = 0; i < Math.min(aoa.length, 15); i++) {
    const d = (aoa[i] || []).map(x => String(x||"").toLowerCase());
    if (d.some(c => c.includes("họ") && c.includes("tên") || c === "họ và tên")) { hIdx = i; break; }
  }
  if (hIdx < 0) throw new Error("Không tìm thấy dòng tiêu đề có cột “Họ và tên”. Hãy dùng tệp mẫu của phần mềm.");
  const head = (aoa[hIdx] || []).map(x => String(x||"").trim().toLowerCase());
  const map = { hoTen:-1, lop:-1, tx:[], gk:-1, ck:-1, tbm:-1 };
  head.forEach((h, i) => {
    const t = h.replace(/[đ]/g,"d");
    if (map.hoTen < 0 && (h.includes("họ") && h.includes("tên"))) map.hoTen = i;
    else if (map.lop < 0 && h === "lớp") map.lop = i;
    else if (/^(tx\s*\d*|mi[eệ]ng|ddg\s*tx\s*\d*|thu[ơo]ng xuy[eê]n\s*\d*)$/.test(t)) map.tx.push(i);
    else if (map.gk < 0 && (t.includes("gk") || h.includes("giữa"))) map.gk = i;
    else if (map.ck < 0 && (t.includes("ck") || h.includes("cuối"))) map.ck = i;
    else if (map.tbm < 0 && (t.includes("tbm") || t.includes("dtb") || h.includes("trung bình"))) map.tbm = i;
  });
  if (map.hoTen < 0) throw new Error("Thiếu cột Họ và tên.");
  const hs = [];
  for (let i = hIdx + 1; i < aoa.length; i++) {
    const r = aoa[i] || [];
    const ten = String(r[map.hoTen] || "").trim();
    if (!ten || /^(tt|stt|cộng|tổng)$/i.test(ten)) continue;
    const o = {
      hoTen: ten,
      lop: map.lop >= 0 ? String(r[map.lop]||"").trim() : "",
      tx: map.tx.map(c => soDiem(r[c])).filter(laSo),
      gk: map.gk >= 0 ? soDiem(r[map.gk]) : null,
      ck: map.ck >= 0 ? soDiem(r[map.ck]) : null
    };
    o.tbm = (map.tbm >= 0 && laSo(soDiem(r[map.tbm]))) ? soDiem(r[map.tbm]) : tinhTBM(o);
    hs.push(o);
  }
  if (!hs.length) throw new Error("Tệp không có dòng học sinh nào.");
  return { hs, soCotTX: map.tx.length };
}

/* ================= BẢNG ĐIỂM & THỐNG KÊ ================= */
Pages.diem = {
  eyebrow: "Chất lượng bộ môn", title: "Điểm & thống kê chất lượng",
  render(el){
    const dot = this.dot || "HK1"; this.dot = dot;
    const tatCa = Store.list("bangdiem", b => b.dot === dot)
      .filter(b => Auth.toanTo() || b.uid === Auth.me.id)
      .sort((a,b)=> (a.lop||"").localeCompare(b.lop||""));

    const bangTK = tatCa.map(b => {
      const diems = b.hs.map(h => h.tbm).filter(laSo);
      const tk = MUC.thongKe(diems);
      const tb = diems.length ? diems.reduce((a,c)=>a+c,0)/diems.length : 0;
      return { id:b.id, uid:b.uid, lop:b.lop, mon:b.mon, gv:b.gv, tk, tb, siSo:b.hs.length };
    });
    const gop = MUC.thongKe(tatCa.flatMap(b => b.hs.map(h=>h.tbm).filter(laSo)));

    el.innerHTML = `
      <div class="card">
        <div class="card-head">
          <h3>Nhập bảng điểm<span class="sub">Tải mẫu → giáo viên điền → nhập lại vào phần mềm</span></h3>
          <button class="btn btn-sm btn-line" id="btnMau">Tải tệp mẫu</button>
        </div>
        <div class="card-body">
          <p class="note">Phần mềm tự nhận các cột TX1…TX4, GK, CK và tính điểm trung bình môn theo công thức (tổng TX + 2×GK + 3×CK) ÷ (số cột TX + 5). Nếu tệp đã có sẵn cột trung bình môn thì lấy theo tệp.</p>
          <form id="fImp">
            <div class="grid g4">
              <label class="fld"><span>Môn</span><input name="mon" value="${U.esc(Auth.me.monDay||"Toán")}" required></label>
              <label class="fld"><span>Lớp <i style="font-weight:400;color:#7A8AA0">(bỏ trống nếu tệp có cột Lớp)</i></span><input name="lop"></label>
              <label class="fld"><span>Đợt</span><select name="dot">${UI.chon(DOT, dot)}</select></label>
              <label class="fld"><span>Tệp điểm (.xlsx, .csv)</span><input type="file" name="tep" accept=".xlsx,.xls,.csv" required></label>
            </div>
            <button class="btn btn-primary" type="submit">Nhập điểm</button>
          </form>
        </div>
      </div>

      <div class="card">
        <div class="card-head">
          <h3>So sánh chất lượng giữa các lớp<span class="sub">${tatCa.length} bảng điểm · thang ${Store.settings.thangDanhGia==="tt58"?"Giỏi–Khá–TB–Yếu–Kém":"Tốt–Khá–Đạt–Chưa đạt"}</span></h3>
          <select id="chonDot" style="width:auto">${UI.chon(DOT, dot)}</select>
          ${Auth.xuatBaoCao() ? `<button class="btn btn-sm btn-line" id="btnXuatTK">Xuất báo cáo Word</button>` : ""}
        </div>
        <div class="card-body tight">
          ${bangTK.length ? `<div class="tbl-wrap"><table class="tbl">
            <thead><tr><th>Lớp</th><th>Môn</th><th>Giáo viên</th><th class="num">Sĩ số</th>
              ${MUC.bang().map(m=>`<th class="num">${m.ten}</th>`).join("")}
              <th class="num">TB</th><th style="width:190px">Tỉ lệ</th><th></th></tr></thead>
            <tbody>${bangTK.map(r => `<tr>
              <td><b>${U.esc(r.lop)}</b></td><td>${U.esc(r.mon)}</td><td class="nowrap">${U.esc(r.gv||"")}</td>
              <td class="num">${r.siSo}</td>
              ${MUC.bang().map(m=>`<td class="num">${r.tk.dem[m.ten]}<br><i style="font-size:11px;color:#7A8AA0">${U.tyle(r.tk.dem[m.ten],r.tk.n).toFixed(1)}%</i></td>`).join("")}
              <td class="num"><b>${U.so(r.tb)}</b></td>
              <td>${MUC.thanhBar(r.tk)}</td>
              <td class="nowrap"><button class="btn btn-sm btn-line" data-xem="${r.id}">Chi tiết</button>${
                (Auth.duyet() || r.uid === Auth.me.id) ? `<button class="btn btn-sm btn-line" data-xoa="${r.id}">Xoá</button>` : ""}</td>
            </tr>`).join("")}
            <tr style="background:#F6F9FC"><td colspan="3"><b>Toàn tổ</b></td><td class="num"><b>${gop.n}</b></td>
              ${MUC.bang().map(m=>`<td class="num"><b>${gop.dem[m.ten]}</b><br><i style="font-size:11px;color:#7A8AA0">${U.tyle(gop.dem[m.ten],gop.n).toFixed(1)}%</i></td>`).join("")}
              <td class="num"></td><td>${MUC.thanhBar(gop)}</td><td></td></tr>
            </tbody></table></div>
            <div class="card-body"><div class="legend">${MUC.bang().map(m=>`<span><s style="background:${m.mau}"></s>${m.ten} (từ ${U.so(m.min)})</span>`).join("")}</div></div>`
          : UI.trong("Chưa có bảng điểm cho đợt này", "Tải tệp mẫu, phát cho giáo viên rồi nhập lại vào đây.")}
        </div>
      </div>`;

    el.querySelector("#chonDot").onchange = e => { this.dot = e.target.value; this.render(el); };

    el.querySelector("#btnMau").onclick = () => {
      if (!coXLSX()) return;
      const aoa = [["STT","Họ và tên","Lớp","TX1","TX2","TX3","TX4","GK","CK"],
                   [1,"Nguyễn Văn A","12A1",8,7.5,9,8,7,8]];
      const wb = XLSX.utils.book_new();
      const ws = XLSX.utils.aoa_to_sheet(aoa);
      ws["!cols"] = [{wch:5},{wch:26},{wch:8},{wch:6},{wch:6},{wch:6},{wch:6},{wch:6},{wch:6}];
      XLSX.utils.book_append_sheet(wb, ws, "Bang diem");
      XLSX.writeFile(wb, "Mau_Nhap_Diem.xlsx");
    };

    el.querySelector("#fImp").onsubmit = ev => {
      ev.preventDefault();
      if (!coXLSX()) return;
      const f = Object.fromEntries(new FormData(ev.target));
      const file = ev.target.querySelector('[name="tep"]')?.files?.[0];
      if (!file) { UI.toast("Hãy chọn tệp điểm cần nhập.", "err"); return; }
      const r = new FileReader();
      r.onload = async e => {
        try {
          const wb = XLSX.read(e.target.result, { type:"array" });
          const ws = wb.Sheets[wb.SheetNames[0]];
          const aoa = XLSX.utils.sheet_to_json(ws, { header:1, defval:"" });
          const { hs } = docBangDiem(aoa);
          const nhom = {};
          hs.forEach(h => { const l = (h.lop || f.lop || "Chưa rõ").trim(); (nhom[l] = nhom[l] || []).push(h); });
          for (const lop of Object.keys(nhom)) {
            const cu = Store.list("bangdiem").find(b => b.lop===lop && b.mon===f.mon && b.dot===f.dot);
            const obj = Object.assign(cu||{}, {
              mon:f.mon, lop, dot:f.dot, namHoc:Store.settings.namHoc,
              uid:Auth.me.id, gv:Auth.me.hoTen, hs:nhom[lop]
            });
            cu ? await Store.put("bangdiem", obj) : await Store.add("bangdiem", obj);
          }
          await Store.log("Nhập bảng điểm", `${f.mon} — ${Object.keys(nhom).join(", ")}`);
          UI.toast(`Đã nhập ${hs.length} học sinh của ${Object.keys(nhom).length} lớp.`, "ok");
          this.dot = f.dot; this.render(el);
        } catch (err) { UI.toast(err.message, "err"); }
      };
      r.readAsArrayBuffer(file);
    };

    el.querySelectorAll("[data-xem]").forEach(b => b.onclick = () => {
      const bd = Store.get("bangdiem", b.dataset.xem);
      const rows = bd.hs.map((h,i) => `<tr><td class="num">${i+1}</td><td>${U.esc(h.hoTen)}</td>
        <td class="num">${(h.tx||[]).join(", ")}</td><td class="num">${U.so(h.gk)}</td><td class="num">${U.so(h.ck)}</td>
        <td class="num"><b>${U.so(h.tbm)}</b></td><td>${MUC.xep(h.tbm)?.ten||""}</td></tr>`).join("");
      UI.modal(`${bd.lop} — ${bd.mon} — ${DOT.find(d=>d[0]===bd.dot)?.[1]||bd.dot}`,
        `<div class="tbl-wrap"><table class="tbl"><thead><tr><th>TT</th><th>Họ và tên</th><th>TX</th><th>GK</th><th>CK</th><th>TBM</th><th>Xếp loại</th></tr></thead><tbody>${rows}</tbody></table></div>`);
    });

    el.querySelectorAll("[data-xoa]").forEach(b => b.onclick = () => UI.hoi("Xoá bảng điểm này?", async () => {
      await Store.del("bangdiem", b.dataset.xoa); UI.toast("Đã xoá."); this.render(el);
    }));

    const bx = el.querySelector("#btnXuatTK");
    if (bx) bx.onclick = () => Xuat.thongKeChatLuong(bangTK, {
      dot: DOT.find(d=>d[0]===dot)?.[1] || dot,
      mon: [...new Set(bangTK.map(r=>r.mon))].join(", ")
    });
  }
};

/* ================= HỌC SINH CHƯA ĐẠT ================= */
Pages.hsyeu = {
  eyebrow: "Chất lượng bộ môn", title: "Học sinh chưa đạt",
  render(el){
    const st = this.st || { dot:"HK1", cot:"tbm", nguong: Store.settings.nguongYeu || 5 };
    this.st = st;
    const bd = Store.list("bangdiem", b => b.dot === st.dot).filter(b => Auth.toanTo() || b.uid === Auth.me.id);

    /* Lọc theo cột điểm được chọn */
    const loc = [];
    bd.forEach(b => b.hs.forEach(h => {
      let d = null, nhan = "";
      if (st.cot === "tbm") { d = h.tbm; nhan = "TBM"; }
      else if (st.cot === "gk") { d = h.gk; nhan = "Giữa kỳ"; }
      else if (st.cot === "ck") { d = h.ck; nhan = "Cuối kỳ"; }
      else { const i = Number(st.cot.replace("tx","")) - 1; d = (h.tx||[])[i]; nhan = "TX" + (i+1); }
      if (laSo(d) && d < Number(st.nguong))
        loc.push({ hoTen:h.hoTen, lop:b.lop, mon:b.mon, gv:b.gv, diem:Number(d), cot:nhan });
    }));
    loc.sort((a,b) => a.lop === b.lop ? a.diem - b.diem : a.lop.localeCompare(b.lop));

    const theoLop = {};
    loc.forEach(h => theoLop[h.lop] = (theoLop[h.lop]||0) + 1);
    const daLuu = Store.list("hsyeu", h => h.dot === st.dot).sort((a,b)=>a.taoLuc<b.taoLuc?1:-1);

    el.innerHTML = `
      <div class="card">
        <div class="card-head"><h3>Lọc theo khoảng điểm<span class="sub">Chọn cột kiểm tra và ngưỡng điểm để trích danh sách cần phụ đạo</span></h3></div>
        <div class="card-body">
          <div class="row">
            <label class="fld"><span>Đợt</span><select id="fDot">${UI.chon(DOT, st.dot)}</select></label>
            <label class="fld"><span>Cột điểm</span><select id="fCot">${UI.chon([
              ["tbm","Trung bình môn"],["tx1","TX1"],["tx2","TX2"],["tx3","TX3"],["tx4","TX4"],["gk","Giữa kỳ"],["ck","Cuối kỳ"]
            ], st.cot)}</select></label>
            <label class="fld"><span>Điểm dưới</span><input type="number" step="0.1" id="fNg" value="${st.nguong}"></label>
            <button class="btn btn-primary" id="btnLoc">Lọc</button>
            ${loc.length ? `<button class="btn btn-line" id="btnWord">Xuất danh sách Word</button>
                            <button class="btn btn-line" id="btnLuu">Lưu thành danh sách theo dõi</button>` : ""}
          </div>
          ${loc.length ? `<div class="grid g4" style="margin-top:16px">
            ${Object.entries(theoLop).map(([l,n]) => `<div class="stat s-warn"><b>${n}</b><span>Lớp ${U.esc(l)}</span></div>`).join("")}
            <div class="stat s-seal"><b>${loc.length}</b><span>Tổng số lượt chưa đạt</span></div>
          </div>` : ""}
        </div>
        <div class="card-body tight">
          ${loc.length ? `<div class="tbl-wrap"><table class="tbl">
            <thead><tr><th class="num">TT</th><th>Họ và tên</th><th>Lớp</th><th>Môn</th><th>Giáo viên</th><th>Cột</th><th class="num">Điểm</th></tr></thead>
            <tbody>${loc.map((h,i)=>`<tr><td class="num">${i+1}</td><td>${U.esc(h.hoTen)}</td><td>${U.esc(h.lop)}</td>
              <td>${U.esc(h.mon)}</td><td class="nowrap">${U.esc(h.gv||"")}</td><td>${U.esc(h.cot)}</td>
              <td class="num" style="color:var(--seal);font-weight:600">${U.so(h.diem)}</td></tr>`).join("")}</tbody></table></div>`
          : UI.trong("Không có học sinh nào dưới ngưỡng", "Hoặc chưa nhập bảng điểm cho đợt này.")}
        </div>
      </div>

      <div class="card">
        <div class="card-head"><h3>Danh sách theo dõi phụ đạo<span class="sub">Ghi nguyên nhân và biện pháp để đưa vào biên bản họp tổ</span></h3></div>
        <div class="card-body tight">
          ${daLuu.length ? `<div class="tbl-wrap"><table class="tbl">
            <thead><tr><th>Ngày lập</th><th>Người lập</th><th>Đợt</th><th class="num">Số HS</th><th>Ghi chú chung</th><th></th></tr></thead>
            <tbody>${daLuu.map(d=>`<tr><td class="nowrap">${U.dmy(d.taoLuc)}</td><td>${U.esc(d.nguoiLap)}</td>
              <td>${U.esc(DOT.find(x=>x[0]===d.dot)?.[1]||d.dot)}</td><td class="num">${d.ds.length}</td>
              <td>${U.esc((d.ghiChu||"").slice(0,70))}</td>
              <td class="nowrap"><button class="btn btn-sm btn-line" data-sua="${d.id}">Nguyên nhân / biện pháp</button>
              <button class="btn btn-sm btn-line" data-inds="${d.id}">Word</button>
              <button class="btn btn-sm btn-line" data-xds="${d.id}">Xoá</button></td></tr>`).join("")}</tbody></table></div>`
          : UI.trong("Chưa lưu danh sách nào", "Lọc ở khung trên rồi bấm “Lưu thành danh sách theo dõi”.")}
        </div>
      </div>`;

    el.querySelector("#btnLoc").onclick = () => {
      this.st = { dot: el.querySelector("#fDot").value, cot: el.querySelector("#fCot").value, nguong: Number(el.querySelector("#fNg").value) };
      this.render(el);
    };

    const bw = el.querySelector("#btnWord");
    if (bw) bw.onclick = () => Xuat.hsYeu(loc, {
      mon: [...new Set(loc.map(h=>h.mon))].join(", "),
      dot: DOT.find(d=>d[0]===st.dot)?.[1] || st.dot, nguong: st.nguong
    });

    const bl = el.querySelector("#btnLuu");
    if (bl) bl.onclick = async () => {
      await Store.add("hsyeu", { dot: st.dot, cot: st.cot, nguong: st.nguong,
        nguoiLap: Auth.me.hoTen, uid: Auth.me.id, ghiChu: "",
        ds: loc.map(h => ({...h, nguyenNhan:"", bienPhap:""})) });
      await Store.log("Lưu danh sách học sinh chưa đạt", `${loc.length} em`);
      UI.toast("Đã lưu danh sách theo dõi.", "ok"); this.render(el);
    };

    el.querySelectorAll("[data-sua]").forEach(b => b.onclick = () => {
      const d = Store.get("hsyeu", b.dataset.sua);
      const body = UI.modal("Nguyên nhân và biện pháp hỗ trợ", `
        <label class="fld"><span>Ghi chú chung của tổ</span><textarea id="ghiChu" style="min-height:56px">${U.esc(d.ghiChu||"")}</textarea></label>
        <div class="tbl-wrap"><table class="tbl"><thead><tr><th>Học sinh</th><th>Lớp</th><th>Nguyên nhân</th><th>Biện pháp</th></tr></thead>
        <tbody>${d.ds.map((h,i)=>`<tr><td>${U.esc(h.hoTen)}</td><td>${U.esc(h.lop)}</td>
          <td><input data-nn="${i}" value="${U.esc(h.nguyenNhan||"")}"></td>
          <td><input data-bp="${i}" value="${U.esc(h.bienPhap||"")}"></td></tr>`).join("")}</tbody></table></div>`,
        [{text:"Huỷ", cls:"btn-line"}, {text:"Lưu", cls:"btn-primary", fn: async () => {
          d.ghiChu = body.querySelector("#ghiChu").value;
          body.querySelectorAll("[data-nn]").forEach(i => d.ds[Number(i.dataset.nn)].nguyenNhan = i.value);
          body.querySelectorAll("[data-bp]").forEach(i => d.ds[Number(i.dataset.bp)].bienPhap = i.value);
          await Store.put("hsyeu", d); UI.toast("Đã lưu.", "ok"); this.render(el);
        }}]);
    });

    el.querySelectorAll("[data-inds]").forEach(b => b.onclick = () => {
      const d = Store.get("hsyeu", b.dataset.inds);
      Xuat.hsYeu(d.ds, { mon:[...new Set(d.ds.map(h=>h.mon))].join(", "),
        dot: DOT.find(x=>x[0]===d.dot)?.[1]||d.dot, nguong:d.nguong, nguoiLap:d.nguoiLap });
    });

    el.querySelectorAll("[data-xds]").forEach(b => b.onclick = () => UI.hoi("Xoá danh sách này?", async () => {
      await Store.del("hsyeu", b.dataset.xds); UI.toast("Đã xoá."); this.render(el);
    }));
  }
};
