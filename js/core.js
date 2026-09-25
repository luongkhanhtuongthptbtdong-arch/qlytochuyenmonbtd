/* =========================================================
   LÕI: lưu trữ – đăng nhập – tiện ích giao diện
   ========================================================= */
const CFG = window.APP_CONFIG;
const COLLS = ["users","baocao","giaoan","bangdiem","dugio","hsyeu","congviec","bienban","baocaoto","nhatky"];

/* ---------- Tiện ích chung ---------- */
const U = {
  id: () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
  esc(s){ return String(s ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c])); },
  today(){ return new Date().toISOString().slice(0,10); },
  now(){ return new Date().toISOString(); },
  dmy(iso){ if(!iso) return ""; const d=new Date(iso); return isNaN(d)?iso:`${String(d.getDate()).padStart(2,"0")}/${String(d.getMonth()+1).padStart(2,"0")}/${d.getFullYear()}`; },
  dmyGio(iso){ if(!iso) return ""; const d=new Date(iso); return isNaN(d)?iso:`${U.dmy(iso)} ${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`; },
  thangHienTai(){ const d=new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}`; },
  /* Năm học bắt đầu từ tháng 8: trước tháng 8 vẫn thuộc năm học trước */
  namBatDau(){ const d=new Date(); return d.getMonth()+1 >= 8 ? d.getFullYear() : d.getFullYear()-1; },
  namHocHienTai(){ const b=U.namBatDau(); return `${b} - ${b+1}`; },
  /* Lấy năm bắt đầu ghi trong chuỗi năm học, vd "2026 - 2027" → 2026 */
  namCuaNamHoc(nh){ const m=String(nh||"").match(/(\d{4})/); return m ? Number(m[1]) : U.namBatDau(); },
  tenThang(ym){ if(!ym) return ""; const [y,m]=ym.split("-"); return `tháng ${Number(m)} năm ${y}`; },
  so(v, n=2){ const x=Number(v); return isFinite(x) ? x.toFixed(n).replace(/\.?0+$/,"") : ""; },
  tyle(a,b){ return b ? (a*100/b) : 0; },
  async hash(user, pass){
    const data = new TextEncoder().encode(`${user}::${pass}::tcm-2026`);
    const buf = await crypto.subtle.digest("SHA-256", data);
    return [...new Uint8Array(buf)].map(b=>b.toString(16).padStart(2,"0")).join("");
  },
  tai(ten, noiDung, mime){
    const blob = noiDung instanceof Blob ? noiDung : new Blob([noiDung], {type: mime||"text/plain;charset=utf-8"});
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob); a.download = ten;
    document.body.appendChild(a); a.click(); a.remove();
    setTimeout(()=>URL.revokeObjectURL(a.href), 4000);
  }
};

/* Thư viện đọc/ghi Excel được nạp từ Internet ở lần chạy đầu tiên */
function coXLSX(){
  if (typeof XLSX === "undefined") {
    UI.toast("Chưa nạp được thư viện Excel. Hãy kiểm tra kết nối Internet rồi tải lại trang.", "err");
    return false;
  }
  return true;
}

/* ---------- Lưu trữ ---------- */
const Store = {
  mode: CFG.mode,
  fs: null,
  data: {},
  settings: {},

  async init(){
    if (this.mode === "firebase" && CFG.firebase && CFG.firebase.projectId) {
      try {
        firebase.initializeApp(CFG.firebase);
        this.fs = firebase.firestore();
      } catch(e){
        console.error(e); this.mode = "local";
        UI.toast("Không kết nối được Firebase, tạm dùng dữ liệu trên máy.", "err");
      }
    } else { this.mode = "local"; }
    await this.load();
    await this.seed();
  },

  key(c){ return CFG.prefix + c; },

  async load(){
    if (this.mode === "firebase") {
      for (const c of COLLS) {
        const snap = await this.fs.collection(this.key(c)).get();
        this.data[c] = snap.docs.map(d => ({...d.data(), id: d.id}));
      }
      const s = await this.fs.collection(this.key("cauhinh")).doc("app").get();
      this.settings = s.exists ? s.data() : {};
    } else {
      for (const c of COLLS) {
        try { this.data[c] = JSON.parse(localStorage.getItem(this.key(c)) || "[]"); }
        catch { this.data[c] = []; }
      }
      try { this.settings = JSON.parse(localStorage.getItem(this.key("cauhinh")) || "{}"); }
      catch { this.settings = {}; }
    }
    this.settings = Object.assign({}, CFG.defaults, this.settings);
    if (!this.settings.namHoc) this.settings.namHoc = U.namHocHienTai();
  },

  saveLocal(c){ localStorage.setItem(this.key(c), JSON.stringify(this.data[c] || [])); },

  list(c, loc){ const a = (this.data[c] || []).slice(); return loc ? a.filter(loc) : a; },
  get(c, id){ return (this.data[c] || []).find(x => x.id === id); },

  async add(c, obj){
    obj.id = obj.id || U.id();
    obj.taoLuc = obj.taoLuc || U.now();
    this.data[c] = this.data[c] || [];
    this.data[c].push(obj);
    if (this.mode === "firebase") { const {id, ...rest} = obj; await this.fs.collection(this.key(c)).doc(id).set(rest); }
    else this.saveLocal(c);
    return obj;
  },

  async put(c, obj){
    const i = (this.data[c] || []).findIndex(x => x.id === obj.id);
    obj.suaLuc = U.now();
    if (i >= 0) this.data[c][i] = obj; else (this.data[c] = this.data[c]||[]).push(obj);
    if (this.mode === "firebase") { const {id, ...rest} = obj; await this.fs.collection(this.key(c)).doc(id).set(rest); }
    else this.saveLocal(c);
    return obj;
  },

  async del(c, id){
    this.data[c] = (this.data[c] || []).filter(x => x.id !== id);
    if (this.mode === "firebase") await this.fs.collection(this.key(c)).doc(id).delete();
    else this.saveLocal(c);
  },

  async saveSettings(s){
    this.settings = Object.assign(this.settings, s);
    if (this.mode === "firebase") await this.fs.collection(this.key("cauhinh")).doc("app").set(this.settings);
    else localStorage.setItem(this.key("cauhinh"), JSON.stringify(this.settings));
  },

  /* Đang chia sẻ qua mạng nhưng dữ liệu vẫn nằm trên từng máy */
  caiBaoChung(){
    const h = location.hostname;
    return this.mode !== "firebase" && /^https?:/.test(location.protocol) &&
           h !== "localhost" && h !== "127.0.0.1" && h !== "";
  },

  async seed(){
    if ((this.data.users || []).length === 0) {
      await this.add("users", {
        username: "admin", hoTen: "Quản trị hệ thống", role: "admin",
        monDay: "", chucVu: "Tổ trưởng chuyên môn", active: true,
        passHash: await U.hash("admin", "admin@123")
      });
    }
  },

  async log(hanhDong, chiTiet){
    await this.add("nhatky", { ai: Auth.me?.hoTen || "?", hanhDong, chiTiet: chiTiet || "", luc: U.now() });
    if ((this.data.nhatky||[]).length > 400) {
      const cu = this.data.nhatky.sort((a,b)=>a.luc<b.luc?-1:1).slice(0, 100);
      for (const x of cu) await this.del("nhatky", x.id);
    }
  }
};

/* ---------- Đăng nhập & phân quyền ---------- */
const VAI_TRO = {
  admin:          "Quản trị",
  hieutruong:     "Hiệu trưởng",
  phohieutruong:  "Phó Hiệu trưởng",
  thukytruong:    "Thư ký hội đồng",
  totruong:       "Tổ trưởng",
  thuky:          "Thư ký tổ",
  giaovien:       "Giáo viên"
};

const Auth = {
  me: null,

  async login(username, pass){
    const u = Store.list("users").find(x => (x.username||"").toLowerCase() === username.trim().toLowerCase());
    if (!u) return { ok:false, msg:"Không có tài khoản này. Liên hệ tổ trưởng để được cấp." };
    if (u.active === false) return { ok:false, msg:"Tài khoản đang bị khoá." };
    const h = await U.hash(u.username, pass);
    if (h !== u.passHash) return { ok:false, msg:"Mật khẩu chưa đúng." };
    this.me = u;
    sessionStorage.setItem(CFG.prefix + "phien", u.id);
    return { ok:true };
  },

  khoiPhuc(){
    const id = sessionStorage.getItem(CFG.prefix + "phien");
    if (!id) return false;
    const u = Store.get("users", id);
    if (!u || u.active === false) return false;
    this.me = u; return true;
  },

  logout(){ this.me = null; sessionStorage.removeItem(CFG.prefix + "phien"); location.reload(); },

  la(...roles){ return this.me && roles.includes(this.me.role); },
  quanTri(){ return this.la("admin"); },
  duyet(){ return this.la("admin","totruong"); },                      // duyệt giáo án, hồ sơ của tổ
  toanTo(){ return this.la("admin","hieutruong","phohieutruong","thukytruong","totruong","thuky"); },
  bienBan(){ return this.la("admin","totruong","thuky"); },            // biên bản họp tổ
  xuatBaoCao(){ return this.la("admin","totruong","thuky"); },         // báo cáo của tổ
  /* Cấp trường: tổng hợp báo cáo các tổ, lập biên bản họp chuyên môn toàn trường */
  capTruong(){ return this.la("admin","hieutruong","phohieutruong","thukytruong"); },
  hieuTruong(){ return this.capTruong(); },
  /* Người đứng tên ký văn bản của trường */
  kyTruong(){ return this.la("admin","hieutruong","phohieutruong"); },
  toCuaToi(){ return this.me?.to || Store.settings.to || ""; }
};

/* ---------- Tiện ích giao diện ---------- */
const UI = {
  toast(msg, loai){
    const d = document.createElement("div");
    d.className = "toast " + (loai || "");
    d.textContent = msg;
    document.getElementById("toastWrap").appendChild(d);
    setTimeout(() => { d.style.opacity = 0; setTimeout(()=>d.remove(), 300); }, 3200);
  },

  modal(title, bodyHTML, buttons){
    const w = document.getElementById("modalWrap");
    document.getElementById("modalTitle").textContent = title;
    document.getElementById("modalBody").innerHTML = bodyHTML;
    const foot = document.getElementById("modalFoot");
    foot.innerHTML = "";
    (buttons || [{text:"Đóng", cls:"btn-line"}]).forEach(b => {
      const el = document.createElement("button");
      el.className = "btn " + (b.cls || "btn-line");
      el.textContent = b.text;
      el.onclick = () => { if (!b.fn || b.fn() !== false) UI.dongModal(); };
      foot.appendChild(el);
    });
    w.hidden = false;
    return document.getElementById("modalBody");
  },
  dongModal(){ document.getElementById("modalWrap").hidden = true; },

  hoi(msg, fn){
    UI.modal("Xác nhận", `<p style="margin:0">${U.esc(msg)}</p>`, [
      {text:"Huỷ", cls:"btn-line"},
      {text:"Đồng ý", cls:"btn-seal", fn}
    ]);
  },

  trong(tieuDe, goiY){
    return `<div class="empty"><b>${U.esc(tieuDe)}</b>${U.esc(goiY||"")}</div>`;
  },

  chon(dsGiaTri, chon){
    return dsGiaTri.map(v => {
      const [gt, nhan] = Array.isArray(v) ? v : [v, v];
      return `<option value="${U.esc(gt)}"${gt == chon ? " selected" : ""}>${U.esc(nhan)}</option>`;
    }).join("");
  },

  /* Danh sách năm học gợi ý, luôn có sẵn năm học đang cài đặt */
  dsNamHoc(){
    const b = U.namBatDau(), r = [];
    for (let i = -2; i <= 1; i++) r.push(`${b+i} - ${b+i+1}`);
    const nh = Store.settings.namHoc;
    if (nh && !r.includes(nh)) r.unshift(nh);
    return r;
  },
  /* 12 tháng của năm học đang cài đặt: tháng 8 năm trước → tháng 7 năm sau */
  dsThang(){
    const y = U.namCuaNamHoc(Store.settings.namHoc), r = [];
    for (let i = 8; i <= 19; i++) {
      const nam = i <= 12 ? y : y + 1, th = i <= 12 ? i : i - 12;
      r.push([`${nam}-${String(th).padStart(2,"0")}`, `Tháng ${th}/${nam}`]);
    }
    return r;
  },
  /* Tháng mặc định: tháng hiện tại nếu còn trong năm học, nếu không thì tháng 8 */
  thangMacDinh(){
    const ds = UI.dsThang().map(x => x[0]), t = U.thangHienTai();
    return ds.includes(t) ? t : ds[0];
  }
};

/* ---------- Thang đánh giá chất lượng ---------- */
const MUC = {
  tt58: [
    {ten:"Giỏi",  min:8.0, mau:"#1B7A57"},
    {ten:"Khá",   min:6.5, mau:"#3E86C9"},
    {ten:"T.Bình",min:5.0, mau:"#C9A227"},
    {ten:"Yếu",   min:3.5, mau:"#D97A2B"},
    {ten:"Kém",   min:0,   mau:"#B0271F"}
  ],
  tt22: [
    {ten:"Tốt",       min:8.0, mau:"#1B7A57"},
    {ten:"Khá",       min:6.5, mau:"#3E86C9"},
    {ten:"Đạt",       min:5.0, mau:"#C9A227"},
    {ten:"Chưa đạt",  min:0,   mau:"#B0271F"}
  ],
  bang(){ return MUC[Store.settings.thangDanhGia === "tt58" ? "tt58" : "tt22"]; },
  xep(diem){
    const b = MUC.bang();
    const d = Number(diem);
    if (!isFinite(d)) return null;
    return b.find(m => d >= m.min) || b[b.length-1];
  },
  thongKe(dsDiem){
    const b = MUC.bang();
    const dem = Object.fromEntries(b.map(m => [m.ten, 0]));
    let n = 0;
    dsDiem.forEach(d => { const m = MUC.xep(d); if (m) { dem[m.ten]++; n++; } });
    return { dem, n, bang: b };
  },
  thanhBar(tk){
    if (!tk.n) return `<div class="bar"></div>`;
    return `<div class="bar">` + tk.bang.map(m => {
      const p = U.tyle(tk.dem[m.ten], tk.n);
      return p ? `<i style="width:${p}%;background:${m.mau}" title="${m.ten}: ${tk.dem[m.ten]} (${p.toFixed(1)}%)"></i>` : "";
    }).join("") + `</div>`;
  }
};
