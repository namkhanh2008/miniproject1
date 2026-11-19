// =====================================================
// OCEAN SEAFOOD - FILE: js/confetti.js
// Hieu ung "phao giay" khi dat hang / dat ban thanh cong
// Goi bang: window.fireConfetti()
// =====================================================

window.fireConfetti = function () {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  var canvas = document.createElement("canvas");
  canvas.style.cssText = "position:fixed;inset:0;z-index:10050;pointer-events:none;";
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  document.body.appendChild(canvas);
  var ctx = canvas.getContext("2d");

  var colors = ["#c9a227", "#e6c65c", "#0a4d8c", "#ffffff", "#2e9e6b"];
  var pieces = [];
  for (var i = 0; i < 140; i++) {
    pieces.push({
      x: Math.random() * canvas.width,
      y: -20 - Math.random() * canvas.height * 0.4,
      size: 5 + Math.random() * 6,
      speedY: 2 + Math.random() * 3,
      speedX: (Math.random() - 0.5) * 2,
      rotation: Math.random() * 360,
      spin: (Math.random() - 0.5) * 10,
      color: colors[Math.floor(Math.random() * colors.length)]
    });
  }

  var frame = 0;
  function loop() {
    frame++;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    pieces.forEach(function (p) {
      p.y += p.speedY;
      p.x += p.speedX;
      p.rotation += p.spin;

      ctx.save();
      ctx.translate(p.x, p.y);
      ctx.rotate((p.rotation * Math.PI) / 180);
      ctx.fillStyle = p.color;
      ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
      ctx.restore();
    });

    if (frame < 150) {
      requestAnimationFrame(loop);
    } else {
      canvas.remove();
    }
  }
  loop();
};