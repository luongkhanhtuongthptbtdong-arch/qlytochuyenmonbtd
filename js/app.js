/* =========================================================
   KHỞI ĐỘNG – MENU – ĐIỀU HƯỚNG
   ========================================================= */
const MENU = [
  { nhom: "Hồ sơ chuyên môn", muc: [
    { key:"tongquan", ten:"Tổng quan",            ic:"◧" },
    { key:"baocao",   ten:"Báo cáo tháng",         ic:"✎" },
    { key:"giaoan",   ten:"Giáo án",               ic:"▤" },
    { key:"dugio",    ten:"Phiếu dự giờ",          ic:"◉" }
  ]},
  { nhom: "Chất lượng", muc: [
    { key:"diem",     ten:"Điểm & thống kê",       ic:"▦" },
    { key:"hsyeu",    ten:"Học sinh chưa đạt",     ic:"⚑" }
  ]},
  { nhom: "Điều hành tổ", muc: [
    { key:"congviec", ten:"Giao việc & chuyên đề", ic:"☰" },
    { key:"bienban",  ten:"Biên bản họp tổ",       ic:"§", quyen:"bienBan" },
    { key:"baocaoto", ten:"Báo cáo tổ",            ic:"⌸", quyen:"xuatBaoCao" }
  ]},
  { nhom: "Toàn trường", muc: [
    { key:"tonghop",  ten:"Tổng hợp các tổ",       ic:"◈", quyen:"hieuTruong" }
  ]},
  { nhom: "Quản trị", muc: [
    { key:"taikhoan", ten:"Tài khoản",             ic:"◍", quyen:"quanTri" },
    { key:"caidat",   ten:"Cài đặt",               ic:"⚙" }
  ]}
];

const App = {
  trang: "tongquan",

  async khoiDong(){
    await Store.init();
    const s = Store.settings;
    document.getElementById("loginSchool").textContent = `${s.to || ""} · ${s.truong || ""}`;
    document.title = `Quản lý ${s.to || "tổ chuyên môn"}`;

    document.getElementById("loginForm").onsubmit = async ev => {
      ev.preventDefault();
      const err = document.getElementById("loginErr");
      const kq = await Auth.login(document.getElementById("loginUser").value, document.getElementById("loginPass").value);
      if (!kq.ok) { err.textContent = kq.msg; err.hidden = false; return; }
      err.hidden = true;
      App.vaoApp();
    };

    if (Auth.khoiPhuc()) App.vaoApp();
  },

  vaoApp(){
    document.getElementById("loginScreen").hidden = true;
    document.getElementById("app").hidden = false;
    App.nhan();
    App.veMenu();
    document.getElementById("btnLogout").onclick = () => UI.hoi("Đăng xuất khỏi hệ thống?", () => Auth.logout());
    document.getElementById("btnMenu").onclick = () => App.menuDiDong(true);
    document.getElementById("scrim").onclick = () => App.menuDiDong(false);
    document.getElementById("modalClose").onclick = () => UI.dongModal();
    document.getElementById("modalWrap").onclick = e => { if (e.target.id === "modalWrap") UI.dongModal(); };
    document.addEventListener("keydown", e => { if (e.key === "Escape") UI.dongModal(); });
    App.di(location.hash.slice(1) || "tongquan");
  },

  nhan(){
    const s = Store.settings, me = Auth.me;
    document.getElementById("sideTo").textContent = s.to || "Tổ chuyên môn";
    document.getElementById("sideTruong").textContent = s.truong || "";
    document.getElementById("whoName").textContent = me.hoTen;
    document.getElementById("whoRole").textContent = VAI_TRO[me.role] + (me.monDay ? " · " + me.monDay : "");
    document.getElementById("pillNamHoc").textContent = "Năm học " + (s.namHoc || "—");
    document.getElementById("pillMode").textContent = Store.mode === "firebase" ? "Dùng chung" : "Cục bộ";
  },

  veMenu(){
    const nav = document.getElementById("sideNav");
    nav.innerHTML = "";
    MENU.forEach(g => {
      const muc = g.muc.filter(m => !m.quyen || Auth[m.quyen]());
      if (!muc.length) return;
      const h = document.createElement("div");
      h.className = "nav-group"; h.textContent = g.nhom; nav.appendChild(h);
      muc.forEach(m => {
        const b = document.createElement("button");
        b.className = "nav-item"; b.dataset.key = m.key;
        let badge = "";
        if (m.key === "giaoan" && Auth.duyet()) {
          const n = Store.list("giaoan", g2 => g2.trangThai === "cho").length;
          if (n) badge = `<span class="badge">${n}</span>`;
        }
        b.innerHTML = `<span class="ic">${m.ic}</span><span>${m.ten}</span>${badge}`;
        b.onclick = () => App.di(m.key);
        nav.appendChild(b);
      });
    });
  },

  di(key){
    const p = Pages[key] ? key : "tongquan";
    App.trang = p;
    location.hash = p;
    document.querySelectorAll(".nav-item").forEach(b => b.classList.toggle("active", b.dataset.key === p));
    document.getElementById("crumbEyebrow").textContent = Pages[p].eyebrow;
    document.getElementById("crumbTitle").textContent = Pages[p].title;
    const el = document.getElementById("page");
    el.innerHTML = "";
    try { Pages[p].render(el); }
    catch (e) { console.error(e); el.innerHTML = UI.trong("Không mở được trang này", e.message); }
    App.menuDiDong(false);
    App.veMenu();
    document.querySelectorAll(".nav-item").forEach(b => b.classList.toggle("active", b.dataset.key === p));
    window.scrollTo({ top: 0 });
  },

  menuDiDong(mo){
    document.getElementById("sidebar").classList.toggle("open", mo);
    document.getElementById("scrim").hidden = !mo;
  }
};

window.addEventListener("hashchange", () => {
  const k = location.hash.slice(1);
  if (k && k !== App.trang) App.di(k);
});

App.khoiDong();
