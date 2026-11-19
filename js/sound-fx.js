/* =====================================================
   OCEAN SEAFOOD - FILE: js/sound-fx.js
   Nội dung: âm thanh hiệu ứng tạo bằng Web Audio API
   (không cần file âm thanh), gắn vào các hàm có sẵn
   mà KHÔNG sửa trực tiếp cart.js / main.js / checkout.js
   Nạp ở MỌI TRANG, sau dark-mode.js
   ===================================================== */

(function () {
  const MUTE_KEY = "oceanSeafoodSoundMuted";
  let audioCtx = null;
  let muted = localStorage.getItem(MUTE_KEY) === "1";

  function getContext() {
    if (!audioCtx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      audioCtx = new AC();
    }
    if (audioCtx.state === "suspended") audioCtx.resume();
    return audioCtx;
  }

  // Phát 1 nốt: tần số (Hz), thời lượng (giây), kiểu sóng, độ trễ
  function tone(freq, duration, type, delay, volume) {
    if (muted) return;
    const ctx = getContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type || "sine";
    osc.frequency.value = freq;

    const startTime = ctx.currentTime + (delay || 0);
    gain.gain.setValueAtTime(0, startTime);
    gain.gain.linearRampToValueAtTime(volume || 0.12, startTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start(startTime);
    osc.stop(startTime + duration + 0.05);
  }

  const SoundFX = {
    playAdd:     function () { tone(660, 0.12, "sine", 0); tone(990, 0.12, "sine", 0.07); },
    playRemove:  function () { tone(440, 0.15, "sine", 0); tone(260, 0.18, "sine", 0.08); },
    playSuccess: function () { [523, 659, 784, 1046].forEach(function (f, i) { tone(f, 0.18, "sine", i * 0.09); }); },
    playCatch:   function (points) {
      if (points >= 0) { tone(880, 0.1, "triangle", 0); tone(1320, 0.1, "triangle", 0.06); }
      else { tone(200, 0.2, "sawtooth", 0, 0.08); }
    },
    toggleMute: function () {
      muted = !muted;
      localStorage.setItem(MUTE_KEY, muted ? "1" : "0");
      return muted;
    }
  };
  window.SoundFX = SoundFX;

  /* ---------- Gắn âm thanh vào các hàm CÓ SẴN, không sửa file gốc ---------- */
  function hookExistingFunctions() {
    if (typeof window.addToCart === "function" && !window.addToCart._hooked) {
      const original = window.addToCart;
      window.addToCart = function () { SoundFX.playAdd(); return original.apply(this, arguments); };
      window.addToCart._hooked = true;
    }
    if (typeof window.removeFromCart === "function" && !window.removeFromCart._hooked) {
      const original = window.removeFromCart;
      window.removeFromCart = function () { SoundFX.playRemove(); return original.apply(this, arguments); };
      window.removeFromCart._hooked = true;
    }
    if (typeof window.cancelBooking === "function" && !window.cancelBooking._hooked) {
      const original = window.cancelBooking;
      window.cancelBooking = function () { SoundFX.playRemove(); return original.apply(this, arguments); };
      window.cancelBooking._hooked = true;
    }
  }

  // Theo dõi các khối "thành công" (đặt hàng/đặt bàn/liên hệ) hiện ra để phát âm chúc mừng
  function watchSuccessBoxes() {
    ["order-success", "booking-success", "contact-success"].forEach(function (id) {
      const el = document.getElementById(id);
      if (!el) return;
      const observer = new MutationObserver(function () {
        if (getComputedStyle(el).display !== "none") {
          SoundFX.playSuccess();
          observer.disconnect();
        }
      });
      observer.observe(el, { attributes: true, attributeFilter: ["style"] });
    });
  }

  function injectMuteButton() {
    const actions = document.querySelector(".header-actions");
    if (!actions || document.getElementById("sound-toggle")) return;

    const btn = document.createElement("button");
    btn.type = "button";
    btn.id = "sound-toggle";
    btn.className = "icon-toggle-btn";
    btn.setAttribute("aria-label", "Bật/tắt âm thanh");
    btn.textContent = muted ? "🔇" : "🔊";

    btn.addEventListener("click", function () {
      const isMuted = SoundFX.toggleMute();
      btn.textContent = isMuted ? "🔇" : "🔊";
    });

    const themeToggle = document.getElementById("theme-toggle");
    const anchor = themeToggle || actions.querySelector(".cart-icon");
    if (anchor) anchor.insertAdjacentElement("afterend", btn);
    else actions.appendChild(btn);
  }

  document.addEventListener("DOMContentLoaded", function () {
    hookExistingFunctions();
    watchSuccessBoxes();
    injectMuteButton();
  });
})();