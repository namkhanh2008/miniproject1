/* =====================================================
   OCEAN SEAFOOD - FILE: js/dive-scroll.js
   Nội dung: đổi màu nền và đồng hồ đo độ sâu theo độ cuộn
   CHỈ CHẠY ở trang có khung .dive-bg (tức index.html)
   ===================================================== */

(function () {

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function setupDiveScroll() {
    if (!document.querySelector(".dive-bg")) return;   // không phải trang chủ thì bỏ qua

    const root = document.documentElement;
    const gaugeFill = document.getElementById("dive-gauge-fill");
    const gaugeText = document.getElementById("dive-gauge-text");
    const gaugeZone = document.getElementById("dive-gauge-zone");

    // Các "tầng nước" theo % độ sâu, dùng để đổi tên hiển thị trên đồng hồ
    const zones = [
      { max: 0.20, name: "Vùng ánh sáng mặt trời" },
      { max: 0.50, name: "Vùng hoàng hôn" },
      { max: 0.80, name: "Vùng nửa đêm" },
      { max: 1.01, name: "Đáy đại dương — OCEAN SEAFOOD" }
    ];

    const MAX_SCROLL = 2600;   // cuộn khoảng chừng này (px) là coi như đã "chạm đáy"
    let ticking = false;

    function update() {
      ticking = false;
      const scrollTop = window.scrollY || document.documentElement.scrollTop;
      const percent = clamp(scrollTop / MAX_SCROLL, 0, 1);

      // Hai lớp màu mờ dần hiện ra ở hai khoảng cuộn khác nhau, tạo chuyển màu mượt
      const tMid = clamp(percent / 0.6, 0, 1);
      const tDeep = clamp((percent - 0.4) / 0.6, 0, 1);
      root.style.setProperty("--t-mid", tMid.toFixed(3));
      root.style.setProperty("--t-deep", tDeep.toFixed(3));

      if (gaugeFill) gaugeFill.style.height = (percent * 100).toFixed(1) + "%";
      if (gaugeText) gaugeText.textContent = Math.round(percent * 300) + "m";
      if (gaugeZone) {
        const zone = zones.find(function (z) { return percent <= z.max; }) || zones[zones.length - 1];
        gaugeZone.textContent = zone.name;
      }
    }

    // Chỉ tính toán lại trước mỗi khung hình (tránh chạy quá nhiều lần khi cuộn nhanh)
    function onScroll() {
      if (!ticking) {
        requestAnimationFrame(update);
        ticking = true;
      }
    }

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
  }

  document.addEventListener("DOMContentLoaded", setupDiveScroll);
})();