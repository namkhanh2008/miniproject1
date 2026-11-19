// =====================================================
// OCEAN SEAFOOD - FILE: js/ocean-fx.js
// Canvas: ca boi tu dong, duoi theo con tro chuot,
// va gon song lan toa tai vi tri chuot
// Chi chay o trang co #ocean-fx (index.html)
// =====================================================

(function () {
  var canvas = document.getElementById("ocean-fx");
  if (!canvas) return;
  if (window.matchMedia("(max-width: 900px)").matches) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  var ctx = canvas.getContext("2d");
  var container = canvas.parentElement;
  var width = 0, height = 0;
  var mouse = { x: -9999, y: -9999, active: false };
  var ripples = [];
  var fishes = [];
  var FISH_COUNT = 7;

  // ---------- Kich thuoc canvas khop voi khung chua ----------
  function resize() {
    width = container.clientWidth;
    height = container.clientHeight;
    canvas.width = width;
    canvas.height = height;
  }
  window.addEventListener("resize", resize);
  resize();

  // ---------- Theo doi chuot ----------
  container.addEventListener("mousemove", function (e) {
    var rect = container.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
    mouse.active = true;

    // Cu moi 90ms thi tha 1 vong gon song moi tai vi tri chuot
    var now = Date.now();
    if (!mouse.lastRipple || now - mouse.lastRipple > 90) {
      mouse.lastRipple = now;
      ripples.push({ x: mouse.x, y: mouse.y, r: 2, life: 1 });
      if (ripples.length > 40) ripples.shift();
    }
  });
  container.addEventListener("mouseleave", function () { mouse.active = false; });

  // ---------- Tao dan ca ----------
  var colors = ["rgba(255,210,170,0.85)", "rgba(200,230,255,0.8)", "rgba(255,235,190,0.85)"];
  for (var i = 0; i < FISH_COUNT; i++) {
    fishes.push({
      x: Math.random() * 800,
      y: 60 + Math.random() * 400,
      vx: 0, vy: 0,
      angle: 0,
      size: 16 + Math.random() * 10,
      color: colors[i % colors.length],
      wander: Math.random() * Math.PI * 2,
      wagPhase: Math.random() * Math.PI * 2,
      followDelay: Math.random() * 0.4   // moi con "phan ung" cham som khac nhau, tranh boi dong loat
    });
  }

  // ---------- Ve 1 con ca tai (x,y), huong theo angle ----------
  function drawFish(f) {
    ctx.save();
    ctx.translate(f.x, f.y);
    ctx.rotate(f.angle);

    var s = f.size;
    var wag = Math.sin(f.wagPhase) * 0.5;   // duoi vay qua lai

    // Than ca
    ctx.fillStyle = f.color;
    ctx.beginPath();
    ctx.ellipse(0, 0, s, s * 0.45, 0, 0, Math.PI * 2);
    ctx.fill();

    // Duoi (tam giac vay theo wag)
    ctx.beginPath();
    ctx.moveTo(-s * 0.9, 0);
    ctx.lineTo(-s * 1.6, -s * 0.5 + wag * s * 0.3);
    ctx.lineTo(-s * 1.6, s * 0.5 + wag * s * 0.3);
    ctx.closePath();
    ctx.fill();

    // Mat
    ctx.fillStyle = "rgba(10,30,50,0.7)";
    ctx.beginPath();
    ctx.arc(s * 0.55, -s * 0.1, s * 0.09, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  // ---------- Cap nhat vi tri ca moi khung hinh ----------
  function updateFish(f, dt) {
    var targetX, targetY;

    if (mouse.active) {
      // Ca "to mo" boi ve phia con tro, nhung giu khoang cach vua phai (khong chong len chuot)
      var dx = mouse.x - f.x, dy = mouse.y - f.y;
      var dist = Math.sqrt(dx * dx + dy * dy) || 1;
      var desiredDist = 38 + (f.size);
      var pull = Math.min(1, (dist - desiredDist) / 120);
      targetX = f.x + (dx / dist) * pull * 160;
      targetY = f.y + (dy / dist) * pull * 160;
    } else {
      // Khong co chuot: boi lang thang tu nhien
      f.wander += (Math.random() - 0.5) * 0.4;
      targetX = f.x + Math.cos(f.wander) * 120;
      targetY = f.y + Math.sin(f.wander) * 60;
    }

    targetX = Math.max(20, Math.min(width - 20, targetX));
    targetY = Math.max(20, Math.min(height - 20, targetY));

    var ax = (targetX - f.x) * 0.02;
    var ay = (targetY - f.y) * 0.02;
    f.vx += ax; f.vy += ay;
    f.vx *= 0.92; f.vy *= 0.92;   // ma sat, tranh tang toc vo han

    var speed = Math.sqrt(f.vx * f.vx + f.vy * f.vy);
    f.wagPhase += dt * (4 + speed * 0.6);

    f.x += f.vx; f.y += f.vy;

    if (speed > 0.05) {
      var targetAngle = Math.atan2(f.vy, f.vx);
      // xoay muot (khong giat) ve huong boi moi
      var diff = targetAngle - f.angle;
      while (diff > Math.PI) diff -= Math.PI * 2;
      while (diff < -Math.PI) diff += Math.PI * 2;
      f.angle += diff * 0.1;
    }
  }

  // ---------- Ve gon song lan toa ----------
  function drawRipples() {
    ripples.forEach(function (r) {
      r.r += 2.4;
      r.life -= 0.018;
      if (r.life <= 0) return;

      ctx.beginPath();
      ctx.arc(r.x, r.y, r.r, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(255,255,255," + (r.life * 0.35).toFixed(3) + ")";
      ctx.lineWidth = 1.6;
      ctx.stroke();
    });
    ripples = ripples.filter(function (r) { return r.life > 0; });
  }

  // ---------- Vong lap chinh ----------
  var lastTime = performance.now();
  function loop(now) {
    var dt = Math.min(0.05, (now - lastTime) / 1000);
    lastTime = now;

    ctx.clearRect(0, 0, width, height);

    drawRipples();
    fishes.forEach(function (f) { updateFish(f, dt); drawFish(f); });

    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
})();