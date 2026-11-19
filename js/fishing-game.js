// =====================================================
// OCEAN SEAFOOD - FILE: js/fishing-game.js
// Noi dung: mini-game cau ca bien, 15 loai, 60 giay/van
// Kem bang xep hang Top 5 va moc am thanh (sound-fx.js)
// Chi chay o fishing-game.html (noi co #game-ocean)
// =====================================================

(function () {

  var BEST_SCORE_KEY = "oceanSeafoodFishingBest";
  var LEADERBOARD_KEY = "oceanSeafoodFishingLeaderboard";
  var LEADERBOARD_SIZE = 5;
  var GAME_DURATION = 60;

  // ---------- 1. DANH SACH 15 LOAI ----------
  var CREATURES = [
    { id: "ca-com",    name: "Cá cơm",        emoji: "🐟", points: 5,  weight: 20, size: 34 },
    { id: "ca-nuc",    name: "Cá nục",        emoji: "🐠", points: 5,  weight: 18, size: 36 },
    { id: "ca-chim",   name: "Cá chim",       emoji: "🐡", points: 8,  weight: 14, size: 38 },
    { id: "ca-thu",    name: "Cá thu",        emoji: "🐟", points: 10, weight: 12, size: 42 },
    { id: "ca-hong",   name: "Cá hồng",       emoji: "🐠", points: 10, weight: 12, size: 42 },
    { id: "tom-he",    name: "Tôm he",        emoji: "🦐", points: 12, weight: 10, size: 40 },
    { id: "muc-ong",   name: "Mực ống",       emoji: "🦑", points: 12, weight: 10, size: 44 },
    { id: "cua-bien",  name: "Cua biển",      emoji: "🦀", points: 20, weight: 7,  size: 46 },
    { id: "ghe-xanh",  name: "Ghẹ xanh",      emoji: "🦀", points: 20, weight: 6,  size: 44 },
    { id: "so-diep",   name: "Sò điệp",       emoji: "🦪", points: 18, weight: 8,  size: 38 },
    { id: "bach-tuoc", name: "Bạch tuộc",     emoji: "🐙", points: 25, weight: 5,  size: 48 },
    { id: "ca-mu",     name: "Cá mú",         emoji: "🐡", points: 25, weight: 5,  size: 46 },
    { id: "ca-ngu",    name: "Cá ngừ đại dương", emoji: "🐟", points: 35, weight: 3, size: 50, fast: true },
    { id: "tom-hum",   name: "Tôm hùm bông",  emoji: "🦞", points: 50, weight: 2,  size: 52, fast: true },
    { id: "sua",       name: "Sứa biển",      emoji: "🪼", points: -8,  weight: 10, size: 40, bad: true },
    { id: "rua-bien",  name: "Rùa biển (loài bảo vệ)", emoji: "🐢", points: -20, weight: 4, size: 48, bad: true }
  ];

  var score = 0;
  var timeLeft = GAME_DURATION;
  var timerId = null;
  var spawnTimeoutId = null;
  var gameRunning = false;
  var activeCreatures = [];

  // ---------- 2. CHON NGAU NHIEN 1 LOAI THEO TRONG SO ----------
  function pickRandomCreature() {
    var totalWeight = CREATURES.reduce(function (sum, c) { return sum + c.weight; }, 0);
    var roll = Math.random() * totalWeight;
    for (var i = 0; i < CREATURES.length; i++) {
      roll -= CREATURES[i].weight;
      if (roll <= 0) return CREATURES[i];
    }
    return CREATURES[0];
  }

  // ---------- 3. TAO 1 CON BOI QUA MAN HINH ----------
  function spawnCreature() {
    if (!gameRunning) return;

    var ocean = document.getElementById("game-ocean");
    var data = pickRandomCreature();
    var fromLeft = Math.random() < 0.5;

    var el = document.createElement("div");
    el.className = "game-creature" + (fromLeft ? "" : " game-flip");
    el.style.fontSize = data.size + "px";
    el.style.top = (10 + Math.random() * 70) + "%";
    el.style.left = fromLeft ? "-60px" : "auto";
    el.style.right = fromLeft ? "auto" : "-60px";
    el.textContent = data.emoji;

    ocean.appendChild(el);
    activeCreatures.push(el);

    var baseDuration = data.fast ? 2.1 : 4.2;
    var duration = baseDuration + Math.random() * 1.6;
    var oceanWidth = ocean.clientWidth;
    var travel = oceanWidth + 120;

    var animation = el.animate(
      [
        { transform: "translateX(0)" },
        { transform: "translateX(" + (fromLeft ? travel : -travel) + "px)" }
      ],
      { duration: duration * 1000, easing: "linear" }
    );

    function cleanup() {
      el.remove();
      activeCreatures = activeCreatures.filter(function (c) { return c !== el; });
    }
    animation.onfinish = cleanup;

    el.addEventListener("click", function () {
      if (el.classList.contains("game-caught")) return;
      animation.cancel();
      catchCreature(el, data);
    });

    spawnTimeoutId = setTimeout(spawnCreature, 420 + Math.random() * 500);
  }

  // ---------- 4. XU LY KHI BAM TRUNG 1 CON ----------
  function catchCreature(el, data) {
    score += data.points;
    if (score < 0) score = 0;
    document.getElementById("game-score").textContent = score;
    if (window.SoundFX) { SoundFX.playCatch(data.points); }

    el.classList.add("game-caught");
    showFloatingPoints(el, data);
    setTimeout(function () { el.remove(); }, 350);
    activeCreatures = activeCreatures.filter(function (c) { return c !== el; });
  }

  function showFloatingPoints(el, data) {
    var layer = document.getElementById("game-float-layer");
    var rect = el.getBoundingClientRect();
    var oceanRect = document.getElementById("game-ocean").getBoundingClientRect();

    var pop = document.createElement("div");
    pop.className = "game-float-pop" + (data.points < 0 ? " game-float-bad" : "");
    pop.textContent = (data.points >= 0 ? "+" : "") + data.points;
    pop.style.left = (rect.left - oceanRect.left) + "px";
    pop.style.top = (rect.top - oceanRect.top) + "px";
    layer.appendChild(pop);
    setTimeout(function () { pop.remove(); }, 900);
  }

  // ---------- 5. DONG HO DEM NGUOC ----------
  function tickTimer() {
    timeLeft--;
    document.getElementById("game-time").textContent = timeLeft;
    if (timeLeft <= 0) endGame();
  }

  // ---------- 6. BAT DAU / KET THUC VAN CHOI ----------
  function startGame() {
    score = 0;
    timeLeft = GAME_DURATION;
    gameRunning = true;

    document.getElementById("game-score").textContent = "0";
    document.getElementById("game-time").textContent = timeLeft;
    document.getElementById("game-start").style.display = "none";
    document.getElementById("game-end").style.display = "none";

    timerId = setInterval(tickTimer, 1000);
    spawnCreature();
  }

  function endGame() {
    gameRunning = false;
    clearInterval(timerId);
    clearTimeout(spawnTimeoutId);

    activeCreatures.forEach(function (el) { el.remove(); });
    activeCreatures = [];

    var best = getBestScore();
    var isNewBest = score > best;
    if (isNewBest) saveBestScore(score);

    document.getElementById("game-final-score").textContent = score;
    document.getElementById("game-new-best").style.display = isNewBest ? "block" : "none";
    document.getElementById("game-best").textContent = isNewBest ? score : best;

    var nameBox = document.getElementById("game-name-box");
    if (nameBox) {
      if (qualifiesForLeaderboard(score)) {
        nameBox.style.display = "block";
        document.getElementById("game-name-input").value = "";
      } else {
        nameBox.style.display = "none";
      }
    }

    document.getElementById("game-end").style.display = "flex";
  }

  function getBestScore() {
    return Number(localStorage.getItem(BEST_SCORE_KEY)) || 0;
  }
  function saveBestScore(value) {
    localStorage.setItem(BEST_SCORE_KEY, String(value));
  }

  // ---------- 7. CHU GIAI CAC LOAI ----------
  function renderLegend() {
    var legend = document.getElementById("game-legend");
    if (!legend) return;
    legend.innerHTML = CREATURES.map(function (c) {
      return '<div class="game-legend-item' + (c.bad ? " legend-bad" : "") + '">' +
        '<span class="legend-emoji">' + c.emoji + '</span>' +
        '<span>' + c.name + '</span>' +
        '<span class="legend-points">' + (c.points >= 0 ? "+" : "") + c.points + '</span>' +
        '</div>';
    }).join("");
  }

  // ---------- 8. BANG XEP HANG ----------
  function getLeaderboard() {
    try {
      var data = localStorage.getItem(LEADERBOARD_KEY);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }
  function saveLeaderboard(list) {
    localStorage.setItem(LEADERBOARD_KEY, JSON.stringify(list));
  }
  function qualifiesForLeaderboard(points) {
    var list = getLeaderboard();
    return list.length < LEADERBOARD_SIZE || points > list[list.length - 1].score;
  }
  function addToLeaderboard(name, points) {
    var list = getLeaderboard();
    list.push({ name: (name || "").trim() || "Ẩn danh", score: points });
    list.sort(function (a, b) { return b.score - a.score; });
    saveLeaderboard(list.slice(0, LEADERBOARD_SIZE));
    renderLeaderboard();
  }
  function renderLeaderboard() {
    var box = document.getElementById("game-leaderboard-list");
    if (!box) return;
    var list = getLeaderboard();
    if (list.length === 0) {
      box.innerHTML = "<li>Chưa có ai ghi điểm. Hãy là người đầu tiên!</li>";
      return;
    }
    box.innerHTML = list.map(function (entry) {
      var safeName = (typeof escapeHTML === "function") ? escapeHTML(entry.name) : entry.name;
      return "<li><strong>" + safeName + "</strong> — " + entry.score + " điểm</li>";
    }).join("");
  }

  // ---------- 9. KHOI DONG TRANG ----------
  document.addEventListener("DOMContentLoaded", function () {
    if (!document.getElementById("game-ocean")) return;

    document.getElementById("game-best").textContent = getBestScore();
    renderLegend();
    renderLeaderboard();

    document.getElementById("game-start-btn").addEventListener("click", startGame);
    document.getElementById("game-restart-btn").addEventListener("click", startGame);

    var nameForm = document.getElementById("game-name-form");
    if (nameForm) {
      nameForm.addEventListener("submit", function (event) {
        event.preventDefault();
        var name = document.getElementById("game-name-input").value;
        addToLeaderboard(name, score);
        document.getElementById("game-name-box").style.display = "none";
      });
    }
  });

  window.addEventListener("beforeunload", function () {
    clearInterval(timerId);
    clearTimeout(spawnTimeoutId);
  });
})();