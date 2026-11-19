/* =====================================================
   OCEAN SEAFOOD - FILE: js/transition.js
   Nội dung: hiệu ứng "làn sóng" khi chuyển sang trang khác
   Nạp ở MỌI TRANG, sau main.js
   ===================================================== */

(function () {

  const WAVE_SEEN_KEY = "oceanSeafoodWaveNav";   // đánh dấu "trang này vừa được mở qua hiệu ứng sóng"

  function canAnimateWave() {
    return !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  /* ---------- 1. TẠO LỚP PHỦ SÓNG (dùng chung cho cả vào và ra) ---------- */
  function buildOverlay() {
    if (document.querySelector(".wave-overlay")) return document.querySelector(".wave-overlay");

    const overlay = document.createElement("div");
    overlay.className = "wave-overlay";
    overlay.innerHTML =
      '<svg viewBox="0 0 500 150" preserveAspectRatio="none" class="wave-svg">' +
        '<path d="M0,40 C150,110 350,-20 500,40 L500,150 L0,150 Z"></path>' +
      '</svg>' +
      '<div class="wave-fill"></div>';
    document.body.appendChild(overlay);
    return overlay;
  }

  /* ---------- 2. KHI TRANG VỪA TẢI: nếu đến từ 1 cú bấm link (sóng đang che) thì rút sóng xuống ---------- */
  function playEnterAnimation() {
    const cameFromWave = sessionStorage.getItem(WAVE_SEEN_KEY);
    sessionStorage.removeItem(WAVE_SEEN_KEY);

    if (!cameFromWave || !canAnimateWave()) return;

    const overlay = buildOverlay();
    overlay.classList.add("wave-covering");   // bắt đầu ở trạng thái che kín màn hình
    // Đợi 1 khung hình để trình duyệt "ghi nhận" trạng thái che kín, rồi mới rút xuống cho có hiệu ứng
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        overlay.classList.add("wave-receding");
        overlay.classList.remove("wave-covering");
        setTimeout(function () { overlay.remove(); }, 750);
      });
    });
  }

  /* ---------- 3. BẤM LINK NỘI BỘ: dâng sóng lên che màn hình, rồi mới chuyển trang ---------- */
  function setupLinkIntercept() {
    if (!canAnimateWave()) return;

    document.addEventListener("click", function (event) {
      // Bỏ qua nếu giữ Ctrl/Shift/Alt hoặc bấm chuột giữa (người dùng muốn mở tab mới)
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;

      const link = event.target.closest("a");
      if (!link) return;                                   // không phải link thì bỏ qua, không đụng tới nút/form

      const href = link.getAttribute("href") || "";
      if (!href || href.startsWith("#")) return;            // neo trong trang (ví dụ #privacy-policy)
      if (link.target === "_blank") return;                 // mở tab mới
      if (/^(tel:|mailto:|javascript:)/i.test(href)) return;
      if (/^https?:\/\//i.test(href) && link.hostname !== window.location.hostname) return;   // link ra ngoài site

      // Tới đây: chắc chắn là link nội bộ, điều hướng bình thường trong site
      event.preventDefault();

      const overlay = buildOverlay();
      overlay.classList.add("wave-rising");

      sessionStorage.setItem(WAVE_SEEN_KEY, "1");   // để trang kế tiếp biết cần "rút sóng" khi tải xong

      setTimeout(function () {
        window.location.href = href;
      }, 620);   // khớp với thời lượng animation wave-rising trong CSS
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    playEnterAnimation();
    setupLinkIntercept();
  });
})();