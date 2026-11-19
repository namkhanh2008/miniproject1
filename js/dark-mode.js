/* =====================================================
   OCEAN SEAFOOD - FILE: js/dark-mode.js
   Nội dung: nút chuyển giao diện sáng/tối, lưu lựa chọn
   Không sửa main.js — tự chèn nút vào .header-actions
   Nạp ở MỌI TRANG, ngay sau main.js
   ===================================================== */

(function () {
  const THEME_KEY = "oceanSeafoodTheme";

  function getSavedTheme() {
    return localStorage.getItem(THEME_KEY) || "light";
  }

  function applyTheme(theme) {
    document.body.classList.toggle("theme-dark", theme === "dark");
  }

  // Chèn nút vào header, ngay sau biểu tượng giỏ hàng
  function injectToggleButton() {
    const actions = document.querySelector(".header-actions");
    if (!actions || document.getElementById("theme-toggle")) return;

    const btn = document.createElement("button");
    btn.type = "button";
    btn.id = "theme-toggle";
    btn.className = "icon-toggle-btn";
    btn.setAttribute("aria-label", "Chuyển giao diện sáng/tối");
    btn.textContent = getSavedTheme() === "dark" ? "☀️" : "🌙";

    btn.addEventListener("click", function () {
      const isDark = document.body.classList.toggle("theme-dark");
      localStorage.setItem(THEME_KEY, isDark ? "dark" : "light");
      btn.textContent = isDark ? "☀️" : "🌙";
    });

    const cartIcon = actions.querySelector(".cart-icon");
    if (cartIcon) cartIcon.insertAdjacentElement("afterend", btn);
    else actions.appendChild(btn);
  }

  document.addEventListener("DOMContentLoaded", function () {
    applyTheme(getSavedTheme());
    injectToggleButton();
  });
})();