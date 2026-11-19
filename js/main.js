/* =====================================================
   OCEAN SEAFOOD - FILE: js/main.js
   Nội dung: header, footer, thông báo, menu điện thoại,
             nút nổi, hiệu ứng cuộn, trạng thái đăng nhập
   Cần nạp SAU products.js và cart.js
   ===================================================== */

/* ---------- 1. CÀI ĐẶT CHUNG ---------- */
// Tên "ngăn kéo" LocalStorage lưu người dùng đang đăng nhập.
// File auth.js (Phần 10) sẽ dùng lại đúng tên này.
const CURRENT_USER_KEY = "oceanSeafoodCurrentUser";
const FLASH_KEY = "oceanSeafoodFlash";   // thông báo "chuyển trang rồi mới hiện"

// Thông tin nhà hàng (dữ liệu mẫu). Sửa ở đây thì footer và trang liên hệ cùng đổi.
const RESTAURANT_INFO = {
  address: "123 Đường Biển Xanh, Quận Hải Châu, Đà Nẵng",
  phone: "0342338888",
  phoneLink: "19001234",
  email: "chungtrang0000@gmail.com",
  hours: "10:00 - 22:00 (Thứ Hai - Chủ Nhật)",
  facebook: "https://www.facebook.com/",
  instagram: "https://www.instagram.com/"
};

// Danh sách menu điều hướng: file, chữ hiển thị
const NAV_LINKS = [
  { href: "index.html",   text: "Trang chủ" },
  { href: "about.html",   text: "Giới thiệu" },
  { href: "menu.html",    text: "Thực đơn" },
  { href: "booking.html", text: "Đặt bàn" },
  { href: "fishing-game.html", text: "Phòng chờ 🎣" },
  { href: "news.html",    text: "Tin tức" },
  { href: "contact.html", text: "Liên hệ" }
];

/* ---------- 2. HÀM TIỆN ÍCH ---------- */

// Chống chèn mã HTML độc hại khi hiển thị chữ người dùng nhập
// Ví dụ: tên "<b>An</b>" sẽ hiện nguyên chữ thay vì in đậm
function escapeHTML(text) {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

// Lấy giá trị trên thanh địa chỉ. Ví dụ ...?id=5 -> getQueryParam("id") trả về "5"
function getQueryParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}

// Tên file của trang hiện tại, ví dụ "menu.html"
function getCurrentPageName() {
  const name = window.location.pathname.split("/").pop();
  return name === "" ? "index.html" : name;
}

// Tạo mã ngẫu nhiên, ví dụ makeCode("DH") -> "DH-483920"
// Dùng cho mã đơn hàng và mã đặt bàn
function makeCode(prefix) {
  const number = Math.floor(100000 + Math.random() * 900000);
  return prefix + "-" + number;
}

/* ---------- 3. THÔNG BÁO NỔI (TOAST) ---------- */
// type: "success" (xanh lá), "error" (đỏ), "info" (xanh biển)
function showToast(message, type, duration) {
  type = type || "success";
  duration = duration || 3000;

  // Tạo khung chứa thông báo nếu chưa có
  let container = document.querySelector(".toast-container");
  if (!container) {
    container = document.createElement("div");
    container.className = "toast-container";
    document.body.appendChild(container);
  }

  const toast = document.createElement("div");
  toast.className = "toast" + (type === "error" ? " toast-error" : "") + (type === "info" ? " toast-info" : "");
  toast.textContent = message;   // dùng textContent cho an toàn
  container.appendChild(toast);

  // Sau một lúc thì mờ dần rồi xóa khỏi trang
  setTimeout(function () {
    toast.classList.add("hide");
    setTimeout(function () { toast.remove(); }, 400);
  }, duration);
}

// "Thông báo chờ": lưu lại để hiện ở trang kế tiếp.
// Ví dụ: đăng nhập xong chuyển về trang chủ thì mới hiện "Đăng nhập thành công".
function setFlash(message, type) {
  sessionStorage.setItem(FLASH_KEY, JSON.stringify({ message: message, type: type || "success" }));
}

function showFlash() {
  const data = sessionStorage.getItem(FLASH_KEY);
  if (!data) return;
  sessionStorage.removeItem(FLASH_KEY);   // chỉ hiện một lần
  try {
    const flash = JSON.parse(data);
    showToast(flash.message, flash.type);
  } catch (error) { /* bỏ qua nếu dữ liệu hỏng */ }
}

/* ---------- 4. ĐĂNG NHẬP: ĐỌC TRẠNG THÁI ---------- */
// Trả về người dùng đang đăng nhập, hoặc null nếu chưa đăng nhập
function getCurrentUser() {
  try {
    const data = localStorage.getItem(CURRENT_USER_KEY);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    return null;
  }
}

// Đăng xuất: xóa người dùng hiện tại rồi về trang chủ
function logout() {
  localStorage.removeItem(CURRENT_USER_KEY);
  setFlash("Bạn đã đăng xuất.", "info");
  window.location.href = "index.html";
}

/* ---------- 5. TẠO HEADER ---------- */
// Trang HTML chỉ cần có: <div id="site-header"></div>
function renderHeader() {
  const holder = document.getElementById("site-header");
  if (!holder) return;

  const currentPage = getCurrentPageName();
  // Trang chi tiết món ăn thuộc về mục "Thực đơn" nên làm sáng mục đó
  const activePage = currentPage === "product-detail.html" ? "menu.html" : currentPage;

  const navHTML = NAV_LINKS.map(function (link) {
    const activeClass = link.href === activePage ? "active" : "";
    return '<a href="' + link.href + '" class="' + activeClass + '">' + link.text + "</a>";
  }).join("");

  // Phần đăng nhập: đã đăng nhập thì hiện tên + nút đăng xuất
  const user = getCurrentUser();
  let authHTML;
  if (user) {
    authHTML =
      '<span class="user-greeting">Xin chào, ' + escapeHTML(user.name) + "</span>" +
      '<button class="btn btn-outline-blue btn-sm" onclick="logout()">Đăng xuất</button>';
  } else {
    authHTML = '<a href="login.html" class="btn btn-primary btn-sm">Đăng nhập</a>';
  }

  holder.innerHTML =
    '<header class="header">' +
      '<div class="container header-inner">' +
        '<a href="index.html" class="logo">OCEAN <span>SEAFOOD</span></a>' +
        '<nav class="nav" id="main-nav">' + navHTML + "</nav>" +
        '<div class="header-actions">' +
          '<a href="cart.html" class="cart-icon" title="Giỏ hàng" aria-label="Giỏ hàng">🛒' +
            '<span class="cart-count">0</span></a>' +
          authHTML +
          '<button class="menu-toggle" id="menu-toggle" aria-label="Mở menu">☰</button>' +
        "</div>" +
      "</div>" +
    "</header>";
}

/* ---------- 6. TẠO FOOTER ---------- */
// Trang HTML chỉ cần có: <div id="site-footer"></div>
function renderFooter() {
  const holder = document.getElementById("site-footer");
  if (!holder) return;

  const info = RESTAURANT_INFO;
  const year = new Date().getFullYear();

  holder.innerHTML =
    '<footer class="footer">' +
      '<div class="container footer-grid">' +
        "<div>" +
          '<a href="index.html" class="logo" style="color:#fff">OCEAN <span>SEAFOOD</span></a>' +
          '<p style="margin-top:12px">Tinh hoa đại dương – Trọn vị yêu thương.</p>' +
          "<p>Hải sản tươi sống mỗi ngày, phục vụ tận tâm cho gia đình và bạn bè.</p>" +
        "</div>" +
        "<div>" +
          "<h3>Liên kết</h3>" +
          "<ul>" +
            NAV_LINKS.map(function (l) { return '<li><a href="' + l.href + '">' + l.text + "</a></li>"; }).join("") +
          "</ul>" +
        "</div>" +
        "<div>" +
          "<h3>Hỗ trợ</h3>" +
          "<ul>" +
            '<li><a href="cart.html">Giỏ hàng</a></li>' +
            '<li><a href="order-history.html">Lịch sử đơn hàng</a></li>' +
            '<li><a href="login.html">Đăng nhập</a></li>' +
            '<li><a href="register.html">Đăng ký</a></li>' +
            '<li><a href="about.html#privacy-policy">Chính sách bảo mật</a></li>' +
          "</ul>" +
        "</div>" +
        "<div>" +
          "<h3>Liên hệ</h3>" +
          "<p>📍 " + info.address + "</p>" +
          '<p>📞 <a href="tel:' + info.phoneLink + '">' + info.phone + "</a></p>" +
          '<p>✉️ <a href="mailto:' + info.email + '">' + info.email + "</a></p>" +
          "<p>🕒 " + info.hours + "</p>" +
          '<div class="social-hover-group">' +
  '<a href="' + info.facebook + '" target="_blank" rel="noopener" class="social-hover-link">' +
    '📘 Facebook<span class="social-hover-card">Theo dõi OCEAN SEAFOOD để nhận tin ưu đãi mới nhất mỗi tuần!</span>' +
  '</a>' +
  '<a href="' + info.instagram + '" target="_blank" rel="noopener" class="social-hover-link">' +
    '📷 Instagram<span class="social-hover-card">Ngắm những khoảnh khắc hải sản tươi ngon mỗi ngày tại nhà hàng.</span>' +
  '</a>' +
'</div>' +
        "</div>" +
      "</div>" +
      '<div class="footer-bottom">© ' + year + " OCEAN SEAFOOD. Website demo phục vụ học tập.</div>" +
    "</footer>";
}

/* ---------- 7. NÚT NỔI: LÊN ĐẦU TRANG + HOTLINE ---------- */
function setupFloatingButtons() {
  // Nút hotline (liên hệ nhanh)
  const quick = document.createElement("a");
  quick.className = "quick-contact";
  quick.href = "tel:" + RESTAURANT_INFO.phoneLink;
  quick.innerHTML = "📞 Hotline";
  document.body.appendChild(quick);

  // Trên máy tính (không có khả năng gọi điện): chặn link, hiện popup số điện thoại
  const canCall = window.matchMedia("(hover: none) and (pointer: coarse)").matches; // điện thoại/máy tính bảng
  if (!canCall) {
    quick.addEventListener("click", function (event) {
      event.preventDefault();
      showPhonePopup(RESTAURANT_INFO.phone, RESTAURANT_INFO.phoneLink);
    });
  }
  // Nút lên đầu trang
  const backToTop = document.createElement("button");
  backToTop.className = "back-to-top";
  backToTop.innerHTML = "↑";
  backToTop.setAttribute("aria-label", "Lên đầu trang");
  backToTop.addEventListener("click", function () {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
  document.body.appendChild(backToTop);

  // Cuộn xuống quá 400px thì hiện nút, cuộn lên lại thì ẩn
  window.addEventListener("scroll", function () {
    backToTop.classList.toggle("show", window.scrollY > 400);
  });
}

/* ---------- 8. MENU TRÊN ĐIỆN THOẠI ---------- */
function setupMobileMenu() {
  const toggleButton = document.getElementById("menu-toggle");
  const nav = document.getElementById("main-nav");
  if (!toggleButton || !nav) return;

  // Bấm ☰ thì bật tắt class "open" (responsive.css sẽ làm menu hiện ra)
  toggleButton.addEventListener("click", function () {
    const isOpen = nav.classList.toggle("open");
    toggleButton.textContent = isOpen ? "✕" : "☰";
  });

  // Bấm vào một mục menu thì tự đóng menu
  nav.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", function () {
      nav.classList.remove("open");
      toggleButton.textContent = "☰";
    });
  });
}

/* ---------- 9. HIỆU ỨNG TRƯỢT LÊN KHI CUỘN ---------- */
// Phần tử nào có class "reveal" sẽ hiện dần khi cuộn tới.
// Nếu bạn tạo thêm phần tử bằng JavaScript sau khi trang đã tải,
// hãy gọi initReveal() một lần nữa.
function initReveal() {
  const items = document.querySelectorAll(".reveal:not(.visible)");

  // Trình duyệt quá cũ không có IntersectionObserver thì hiện luôn
  if (!("IntersectionObserver" in window)) {
    items.forEach(function (item) { item.classList.add("visible"); });
    return;
  }

  const observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);   // hiện một lần là đủ
      }
    });
  }, { threshold: 0.12 });

  items.forEach(function (item) { observer.observe(item); });
}

/* ---------- 10. KHỞI ĐỘNG ---------- */
// Hiện popup số điện thoại khi bấm Hotline trên máy tính (không gọi được trực tiếp)
function showPhonePopup(displayPhone, rawPhone) {
  let popup = document.querySelector(".phone-popup");
  if (popup) popup.remove();   // tránh tạo trùng nếu bấm nhiều lần

  popup = document.createElement("div");
  popup.className = "phone-popup";
  popup.innerHTML = `
    <div class="phone-popup-box">
      <button type="button" class="phone-popup-close" aria-label="Đóng">✕</button>
      <div class="phone-popup-icon">📞</div>
      <p>Gọi ngay cho OCEAN SEAFOOD</p>
      <div class="phone-popup-number">${displayPhone}</div>
      <div class="phone-popup-actions">
        <button type="button" class="btn btn-gold" id="phone-copy-btn">📋 Sao chép số</button>
        <a href="tel:${rawPhone}" class="btn btn-outline-blue">Thử gọi từ máy này</a>
      </div>
      <p class="phone-popup-hint">Dùng điện thoại để gọi, hoặc sao chép số và gọi từ Zalo/Skype trên máy tính.</p>
    </div>`;
  document.body.appendChild(popup);

  function closePopup() { popup.remove(); }
  popup.querySelector(".phone-popup-close").addEventListener("click", closePopup);
  popup.addEventListener("click", function (e) { if (e.target === popup) closePopup(); });

  popup.querySelector("#phone-copy-btn").addEventListener("click", function () {
    navigator.clipboard.writeText(displayPhone).then(function () {
      showToast("Đã sao chép số điện thoại!", "success");
    }).catch(function () {
      showToast("Không thể sao chép, vui lòng chép thủ công: " + displayPhone, "info");
    });
  });
}
document.addEventListener("DOMContentLoaded", function () {
  renderHeader();
  renderFooter();
  updateCartCount();        // hàm của cart.js: cập nhật số trên biểu tượng giỏ hàng
  setupMobileMenu();
  setupFloatingButtons();
  initReveal();
  showFlash();              // hiện thông báo chờ (nếu có)
});