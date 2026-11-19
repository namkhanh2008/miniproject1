/* =====================================================
   OCEAN SEAFOOD - FILE: js/chatbot.js
   Nội dung: trợ lý ảo trả lời dựa trên từ khóa (rule-based)
   Không gọi AI bên ngoài, chạy hoàn toàn trong trình duyệt.
   Nạp ở MỌI TRANG, sau main.js (cần RESTAURANT_INFO, escapeHTML)
   và sau products.js (cần CATEGORIES, PRODUCTS, formatPrice)
   ===================================================== */

(function () {

  const HISTORY_KEY = "oceanSeafoodChatHistory";
  const BOT_NAME = "Sứa Tư Vấn";

  /* ---------- 1. BỎ DẤU TIẾNG VIỆT để so khớp từ khóa dễ hơn ---------- */
  function normalize(text) {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d");
  }

  /* ---------- 2. KHO CÂU TRẢ LỜI ---------- */
  // Mỗi mục: keywords (các từ khóa không dấu) + answer (chuỗi, hoặc hàm trả về chuỗi để lấy dữ liệu thời gian thực)
  function buildKnowledgeBase() {
    const info = (typeof RESTAURANT_INFO !== "undefined") ? RESTAURANT_INFO : null;

    return [
      {
        id: "greeting",
        keywords: ["chao", "hi", "hello", "alo"],
        answer: "Chào bạn! Mình là " + BOT_NAME + " 🪼, trợ lý ảo của OCEAN SEAFOOD. Bạn muốn hỏi về thực đơn, đặt bàn, ưu đãi hay thông tin liên hệ?"
      },
      {
        id: "hours",
        keywords: ["gio mo cua", "gio hoat dong", "may gio", "mo cua luc", "dong cua"],
        answer: function () {
          return info ? "Nhà hàng mở cửa từ " + info.hours + "." : "Nhà hàng mở cửa hằng ngày, bạn xem chi tiết ở trang Liên hệ nhé.";
        }
      },
      {
        id: "address",
        keywords: ["dia chi", "o dau", "nam o", "duong nao"],
        answer: function () {
          return info ? "Nhà hàng ở " + info.address + ". Bạn có thể xem bản đồ ở trang Liên hệ." : "Bạn xem địa chỉ chi tiết ở trang Liên hệ nhé.";
        }
      },
      {
        id: "phone",
        keywords: ["so dien thoai", "hotline", "goi dien", "lien lac"],
        answer: function () {
          return info ? "Bạn gọi hotline " + info.phone + " để được hỗ trợ nhanh nhất nhé!" : "Bạn xem số hotline ở trang Liên hệ nhé.";
        }
      },
      {
        id: "booking",
        keywords: ["dat ban", "giu cho", "reserve", "book ban"],
        answer: "Bạn vào mục **Đặt bàn** trên thanh menu, điền họ tên, số điện thoại, ngày giờ và số khách là xong. Mình sẽ đưa bạn tới đó nhé!",
        link: { text: "Đi tới trang Đặt bàn", href: "booking.html" }
      },
      {
        id: "promo",
        keywords: ["uu dai", "giam gia", "ma giam gia", "khuyen mai", "voucher", "coupon"],
        answer: "Hiện có 3 mã ưu đãi: **OCEAN10** (giảm 10% mọi đơn), **WELCOME50** (giảm 50.000đ cho đơn từ 300.000đ) và **FAMILY100** (giảm 100.000đ cho đơn từ 1.000.000đ). Nhập mã ở trang giỏ hàng nhé."
      },
      {
        id: "bestseller",
        keywords: ["mon ban chay", "mon ngon", "nen an gi", "goi y mon", "recommend"],
        answer: function () {
          if (typeof PRODUCTS === "undefined") return "Bạn ghé trang Thực đơn để xem các món bán chạy nhé!";
          const top = PRODUCTS.filter(function (p) { return p.bestSeller && p.inStock; }).slice(0, 3);
          if (!top.length) return "Bạn ghé trang Thực đơn để xem các món bán chạy nhé!";
          const names = top.map(function (p) { return p.name + " (" + formatPrice(p.price) + ")"; });
          return "Món được gọi nhiều nhất hiện tại gồm: " + names.join(", ") + ". Bạn xem thêm ở trang Thực đơn nhé!";
        },
        link: { text: "Xem thực đơn", href: "menu.html" }
      },
      {
        id: "category",
        keywords: ["danh muc", "co mon gi", "loai hai san", "the loai"],
        answer: function () {
          if (typeof CATEGORIES === "undefined") return "Nhà hàng có nhiều nhóm món như tôm hùm, cua ghẹ, cá biển, ốc sò, lẩu và đồ uống.";
          const names = CATEGORIES.map(function (c) { return c.icon + " " + c.name; });
          return "Nhà hàng có các nhóm món: " + names.join(", ") + ".";
        },
        link: { text: "Xem thực đơn", href: "menu.html" }
      },
      {
        id: "shipping",
        keywords: ["phi giao hang", "ship", "giao hang", "free ship", "mien phi giao"],
        answer: "Phí giao hàng là 30.000đ, và được **miễn phí** cho đơn từ 500.000đ trở lên. Bạn cũng có thể chọn nhận tại nhà hàng để không mất phí giao."
      },
      {
        id: "payment",
        keywords: ["thanh toan", "tra tien", "chuyen khoan", "cod"],
        answer: "Nhà hàng hỗ trợ thanh toán khi nhận hàng (COD) hoặc chuyển khoản (thông tin mẫu hiện ở bước đặt hàng)."
      },
      {
        id: "cart",
        keywords: ["gio hang", "cach mua", "dat mon", "mua hang", "them vao gio"],
        answer: "Bạn chọn món ở trang Thực đơn, bấm **Thêm vào giỏ**, rồi vào biểu tượng 🛒 ở góc trên để xem lại và tiến hành đặt hàng.",
        link: { text: "Xem thực đơn", href: "menu.html" }
      },
      {
        id: "account",
        keywords: ["dang ky", "dang nhap", "tai khoan"],
        answer: "Bạn vào mục **Đăng nhập** ở góc phải thanh menu để đăng ký hoặc đăng nhập tài khoản nhé.",
        link: { text: "Đi tới Đăng nhập", href: "login.html" }
      },
      {
        id: "thanks",
        keywords: ["cam on", "thanks", "thank you"],
        answer: "Không có gì, cảm ơn bạn đã ghé OCEAN SEAFOOD! Chúc bạn một bữa ăn ngon miệng 🦞"
      },
      {
        id: "bye",
        keywords: ["tam biet", "bye", "gap lai"],
        answer: "Tạm biệt bạn, hẹn gặp lại tại OCEAN SEAFOOD! 🌊"
      },
      {
        id: "human",
        keywords: ["gap nhan vien", "noi chuyen voi nguoi", "nhan vien tu van"],
        answer: function () {
          return info ? "Bạn gọi hotline " + info.phone + " để được nhân viên hỗ trợ trực tiếp nhé." : "Bạn xem số hotline ở trang Liên hệ để được hỗ trợ trực tiếp nhé.";
        }
      }
    ];
  }

  // Câu trả lời khi không khớp từ khóa nào
  const FALLBACK_ANSWER = "Mình chưa hiểu rõ câu hỏi này 🤔. Bạn có thể hỏi về: giờ mở cửa, đặt bàn, ưu đãi, món bán chạy, phí giao hàng, hoặc thông tin liên hệ nhé.";

  const QUICK_CHIPS = [
    { text: "Giờ mở cửa?", id: "hours" },
    { text: "Cách đặt bàn", id: "booking" },
    { text: "Có ưu đãi gì?", id: "promo" },
    { text: "Món bán chạy", id: "bestseller" }
  ];

  /* ---------- 3. TÌM CÂU TRẢ LỜI KHỚP NHẤT ---------- */
  function findReply(userText) {
    const kb = buildKnowledgeBase();
    const normalized = normalize(userText);

    let bestEntry = null;
    let bestScore = 0;

    kb.forEach(function (entry) {
      let score = 0;
      entry.keywords.forEach(function (keyword) {
        if (normalized.indexOf(keyword) !== -1) score++;
      });
      if (score > bestScore) { bestScore = score; bestEntry = entry; }
    });

    if (!bestEntry) return { text: FALLBACK_ANSWER, link: null };

    const text = typeof bestEntry.answer === "function" ? bestEntry.answer() : bestEntry.answer;
    return { text: text, link: bestEntry.link || null };
  }

  function findReplyById(id) {
    const entry = buildKnowledgeBase().find(function (e) { return e.id === id; });
    if (!entry) return { text: FALLBACK_ANSWER, link: null };
    const text = typeof entry.answer === "function" ? entry.answer() : entry.answer;
    return { text: text, link: entry.link || null };
  }

  /* ---------- 4. LƯU / ĐỌC LỊCH SỬ TRÒ CHUYỆN (trong phiên hiện tại) ---------- */
  function getHistory() {
    try {
      const data = sessionStorage.getItem(HISTORY_KEY);
      return data ? JSON.parse(data) : [];
    } catch (error) { return []; }
  }
  function saveHistory(history) {
    sessionStorage.setItem(HISTORY_KEY, JSON.stringify(history.slice(-30)));   // chỉ giữ 30 tin gần nhất
  }

  /* ---------- 5. DỰNG GIAO DIỆN ---------- */
  function buildWidget() {
    const wrap = document.createElement("div");
    wrap.className = "chatbot-wrap";
    wrap.innerHTML = `
      <button type="button" class="chatbot-toggle" id="chatbot-toggle" aria-label="Mở trợ lý ảo">
        <span class="chatbot-toggle-icon">🪼</span>
        <span class="chatbot-ping"></span>
      </button>

      <div class="chatbot-panel" id="chatbot-panel">
        <div class="chatbot-header">
          <span class="chatbot-avatar">🪼</span>
          <div>
            <strong>${BOT_NAME}</strong>
            <small>Trợ lý ảo OCEAN SEAFOOD</small>
          </div>
          <button type="button" class="chatbot-close" id="chatbot-close" aria-label="Đóng">✕</button>
        </div>

        <div class="chatbot-messages" id="chatbot-messages"></div>

        <div class="chatbot-chips" id="chatbot-chips"></div>

        <form class="chatbot-input" id="chatbot-form">
          <input type="text" id="chatbot-text" placeholder="Nhập câu hỏi của bạn..." autocomplete="off">
          <button type="submit" aria-label="Gửi">➤</button>
        </form>
      </div>`;
    document.body.appendChild(wrap);
    return wrap;
  }

  function renderMessage(text, sender) {
    const box = document.getElementById("chatbot-messages");
    if (!box) return;
    const row = document.createElement("div");
    row.className = "chatbot-row chatbot-row-" + sender;
    // escapeHTML có sẵn trong main.js: làm sạch chữ người dùng gõ trước khi hiện ra
    const safeText = (typeof escapeHTML === "function") ? escapeHTML(text) : text;
    row.innerHTML = '<div class="chatbot-bubble">' + safeText.replace(/\n/g, "<br>") + '</div>';
    box.appendChild(row);
    box.scrollTop = box.scrollHeight;
  }

  function renderLinkButton(link) {
    if (!link) return;
    const box = document.getElementById("chatbot-messages");
    const row = document.createElement("div");
    row.className = "chatbot-row chatbot-row-bot";
    row.innerHTML = '<a class="chatbot-link-btn" href="' + link.href + '">' + link.text + ' →</a>';
    box.appendChild(row);
    box.scrollTop = box.scrollHeight;
  }

  function renderTyping() {
    const box = document.getElementById("chatbot-messages");
    const row = document.createElement("div");
    row.className = "chatbot-row chatbot-row-bot chatbot-typing-row";
    row.innerHTML = '<div class="chatbot-bubble chatbot-typing"><span></span><span></span><span></span></div>';
    box.appendChild(row);
    box.scrollTop = box.scrollHeight;
    return row;
  }

  function respond(userText) {
    renderMessage(userText, "user");
    saveHistory(getHistory().concat([{ sender: "user", text: userText }]));

    const typingRow = renderTyping();
    setTimeout(function () {
      typingRow.remove();
      const reply = findReply(userText);
      renderMessage(reply.text, "bot");
      renderLinkButton(reply.link);
      saveHistory(getHistory().concat([{ sender: "bot", text: reply.text }]));
    }, 500 + Math.random() * 400);   // giả lập thời gian "suy nghĩ" cho tự nhiên
  }

  function respondFromChip(id, chipLabel) {
    renderMessage(chipLabel, "user");
    saveHistory(getHistory().concat([{ sender: "user", text: chipLabel }]));

    const typingRow = renderTyping();
    setTimeout(function () {
      typingRow.remove();
      const reply = findReplyById(id);
      renderMessage(reply.text, "bot");
      renderLinkButton(reply.link);
      saveHistory(getHistory().concat([{ sender: "bot", text: reply.text }]));
    }, 450);
  }

  function renderChips() {
    const chipsBox = document.getElementById("chatbot-chips");
    chipsBox.innerHTML = QUICK_CHIPS.map(function (chip) {
      return '<button type="button" class="chatbot-chip" data-id="' + chip.id + '">' + chip.text + '</button>';
    }).join("");

    chipsBox.querySelectorAll(".chatbot-chip").forEach(function (btn) {
      btn.addEventListener("click", function () {
        respondFromChip(btn.dataset.id, btn.textContent);
      });
    });
  }

  /* ---------- 6. KHỞI ĐỘNG ---------- */
  document.addEventListener("DOMContentLoaded", function () {
    buildWidget();
    renderChips();

    const toggle = document.getElementById("chatbot-toggle");
    const panel = document.getElementById("chatbot-panel");
    const closeBtn = document.getElementById("chatbot-close");
    const form = document.getElementById("chatbot-form");
    const textInput = document.getElementById("chatbot-text");

    // Khôi phục lịch sử trò chuyện trong phiên này (nếu có), hoặc hiện lời chào đầu tiên
    const history = getHistory();
    if (history.length) {
      history.forEach(function (msg) { renderMessage(msg.text, msg.sender); });
    } else {
      renderMessage("Chào bạn! Mình là " + BOT_NAME + " 🪼. Mình có thể giúp gì cho bạn?", "bot");
    }

    toggle.addEventListener("click", function () {
      const isOpen = panel.classList.toggle("chatbot-open");
      toggle.classList.toggle("chatbot-toggle-hide", isOpen);
      if (isOpen) textInput.focus();
    });
    closeBtn.addEventListener("click", function () {
      panel.classList.remove("chatbot-open");
      toggle.classList.remove("chatbot-toggle-hide");
    });

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      const value = textInput.value.trim();
      if (!value) return;
      respond(value);
      textInput.value = "";
    });
  });
})();