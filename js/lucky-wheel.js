// =====================================================
// OCEAN SEAFOOD - FILE: js/lucky-wheel.js
// Vong quay may man: 1 luot/ngay, trung ma giam gia
// Chi chay o trang co #wheel-canvas
// =====================================================

(function () {
  var canvas = document.getElementById("wheel-canvas");
  if (!canvas) return;

  var ctx = canvas.getContext("2d");
  var LAST_SPIN_KEY = "oceanSeafoodWheelLastSpin";

  // 8 o, moi o 45 do. Lap lai "Chuc may man" va OCEAN10 de ma hiem hon (LUCKY20) it xuat hien hon
  var SLICES = [
    { label: "OCEAN10", sub: "Giảm 10%", color: "#0a4d8c", coupon: "OCEAN10" },
    { label: "Chúc may mắn", sub: "Lần sau nhé!", color: "#5a6f82", coupon: null },
    { label: "WELCOME50", sub: "Giảm 50k", color: "#c9a227", coupon: "WELCOME50" },
    { label: "Chúc may mắn", sub: "Lần sau nhé!", color: "#5a6f82", coupon: null },
    { label: "FAMILY100", sub: "Giảm 100k", color: "#0a4d8c", coupon: "FAMILY100" },
    { label: "OCEAN10", sub: "Giảm 10%", color: "#c9a227", coupon: "OCEAN10" },
    { label: "LUCKY20", sub: "Giảm 20%", color: "#2e9e6b", coupon: "LUCKY20" },
    { label: "Chúc may mắn", sub: "Lần sau nhé!", color: "#5a6f82", coupon: null }
  ];
  var SLICE_ANGLE = 360 / SLICES.length;
  var currentRotation = 0;

  function drawWheel() {
    var r = canvas.width / 2;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    SLICES.forEach(function (slice, i) {
      var start = ((i * SLICE_ANGLE - 90) * Math.PI) / 180;
      var end = (((i + 1) * SLICE_ANGLE - 90) * Math.PI) / 180;

      ctx.beginPath();
      ctx.moveTo(r, r);
      ctx.arc(r, r, r - 4, start, end);
      ctx.closePath();
      ctx.fillStyle = slice.color;
      ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.5)";
      ctx.stroke();

      ctx.save();
      ctx.translate(r, r);
      ctx.rotate(start + (SLICE_ANGLE * Math.PI) / 360);
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 13px sans-serif";
      ctx.textAlign = "right";
      ctx.fillText(slice.label, r - 16, 2);
      ctx.font = "10px sans-serif";
      ctx.fillText(slice.sub, r - 16, 16);
      ctx.restore();
    });
  }
  drawWheel();

  function getToday() { return new Date().toDateString(); }
  function hasSpunToday() { return localStorage.getItem(LAST_SPIN_KEY) === getToday(); }

  function updateButtonState() {
    var btn = document.getElementById("wheel-spin-btn");
    var msg = document.getElementById("wheel-message");
    if (hasSpunToday()) {
      btn.disabled = true;
      btn.textContent = "Hẹn bạn ngày mai!";
      msg.textContent = "Bạn đã quay hôm nay rồi. Quay lại vào ngày mai nhé!";
    }
  }

  function spin() {
    if (hasSpunToday()) return;

    var targetIndex = Math.floor(Math.random() * SLICES.length);
    var sliceCenter = targetIndex * SLICE_ANGLE + SLICE_ANGLE / 2;
    var extraSpins = 5 * 360;
    var finalRotation = currentRotation + extraSpins + ((360 - sliceCenter) - (currentRotation % 360));

    currentRotation = finalRotation;
    canvas.style.transition = "transform 4.2s cubic-bezier(0.1, 0.7, 0.1, 1)";
    canvas.style.transform = "rotate(" + finalRotation + "deg)";

    document.getElementById("wheel-spin-btn").disabled = true;

    setTimeout(function () {
      var result = SLICES[targetIndex];
      var msg = document.getElementById("wheel-message");

      if (result.coupon) {
        msg.innerHTML = "🎉 Chúc mừng! Bạn trúng mã <strong>" + result.coupon + "</strong> — nhập ở trang giỏ hàng để dùng.";
        if (window.SoundFX) SoundFX.playSuccess();
        if (window.fireConfetti) fireConfetti();
      } else {
        msg.textContent = "Chúc bạn may mắn lần sau! Ghé lại vào ngày mai nhé.";
      }

      localStorage.setItem(LAST_SPIN_KEY, getToday());
      updateButtonState();
    }, 4300);
  }

  document.getElementById("wheel-spin-btn").addEventListener("click", spin);
  updateButtonState();
})();