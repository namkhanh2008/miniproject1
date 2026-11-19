/* =====================================================
   OCEAN SEAFOOD - FILE: js/intro.js
   Nội dung: màn hình tải "lặn biển" + con trỏ tùy chỉnh
   Nạp ở MỌI TRANG, ngay sau main.js
   ===================================================== */

(function () {

  /* ---------- 1. MÀN HÌNH TẢI (chỉ hiện 1 lần mỗi phiên truy cập) ---------- */
  const INTRO_SEEN_KEY = "oceanSeafoodIntroSeen";

  function buildPreloader() {
    // sessionStorage: chỉ hiện lại nếu người dùng mở TAB MỚI, không hiện lại khi chuyển trang
    if (sessionStorage.getItem(INTRO_SEEN_KEY)) return;
    sessionStorage.setItem(INTRO_SEEN_KEY, "1");

    const overlay = document.createElement("div");
    overlay.className = "dive-preloader";
    overlay.innerHTML = `
      <div class="dive-bubbles">
        ${Array.from({ length: 14 }).map(function (_, i) {
          const left = Math.round(Math.random() * 100);
          const delay = (Math.random() * 2).toFixed(2);
          const size = Math.round(10 + Math.random() * 26);
          return '<span style="left:' + left + '%; animation-delay:' + delay + 's; width:' + size + 'px; height:' + size + 'px"></span>';
        }).join("")}
      </div>
      <div class="dive-text">
        <span>O</span><span>C</span><span>E</span><span>A</span><span>N</span>
        <span class="dive-gap"></span>
        <span class="dive-gold">S</span><span class="dive-gold">E</span><span class="dive-gold">A</span><span class="dive-gold">F</span><span class="dive-gold">O</span><span class="dive-gold">O</span><span class="dive-gold">D</span>
      </div>
      <div class="dive-sub">Đang lặn xuống đại dương...</div>
    `;
    document.body.appendChild(overlay);
    document.body.classList.add("no-scroll");   // chặn cuộn trang khi đang tải

    // Sau 2.2 giây: cho chữ "chìm xuống" rồi gỡ màn hình tải
    setTimeout(function () {
      overlay.classList.add("dive-out");
      document.body.classList.remove("no-scroll");
      setTimeout(function () { overlay.remove(); }, 900);
    }, 2200);
  }

  /* ---------- 2. CON TRỎ CHUỘT TÙY CHỈNH (bong bóng) ---------- */
  function setupBubbleCursor() {
    if (!window.matchMedia("(hover: hover)").matches) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const dot = document.createElement("div");
    dot.className = "bubble-cursor";
    document.body.appendChild(dot);

    let mouseX = 0, mouseY = 0, dotX = 0, dotY = 0;
    let lastTrailTime = 0;

    document.addEventListener("mousemove", function (event) {
      mouseX = event.clientX;
      mouseY = event.clientY;

      // Thỉnh thoảng thả một bong bóng nhỏ làm vệt theo chuột (giới hạn tần suất cho nhẹ máy)
      const now = Date.now();
      if (now - lastTrailTime > 70) {
        lastTrailTime = now;
        spawnTrailBubble(mouseX, mouseY);
      }
    });

    // Chuột hình bong bóng "đuổi theo" vị trí thật của chuột cho mượt, không bị giật
    function followLoop() {
      dotX += (mouseX - dotX) * 0.2;
      dotY += (mouseY - dotY) * 0.2;
      dot.style.transform = "translate(" + dotX + "px," + dotY + "px)";
      requestAnimationFrame(followLoop);
    }
    followLoop();

    // Bấm vào link/nút thì bong bóng phình to
    document.addEventListener("mouseover", function (event) {
      if (event.target.closest("a, button, .product-card, .category-card")) {
        dot.classList.add("bubble-cursor-big");
      }
    });
    document.addEventListener("mouseout", function (event) {
      if (event.target.closest("a, button, .product-card, .category-card")) {
        dot.classList.remove("bubble-cursor-big");
      }
    });

    function spawnTrailBubble(x, y) {
      const bubble = document.createElement("span");
      bubble.className = "trail-bubble";
      bubble.style.left = x + "px";
      bubble.style.top = y + "px";
      document.body.appendChild(bubble);
      setTimeout(function () { bubble.remove(); }, 900);
    }
  }

  document.addEventListener("DOMContentLoaded", function () {
    buildPreloader();
    setupBubbleCursor();
  });
})();