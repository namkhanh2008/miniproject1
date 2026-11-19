/* =====================================================
   OCEAN SEAFOOD - FILE: js/fishtank.js
   Nội dung: hiển thị món trong giỏ hàng dưới dạng "bể cá"
   Chỉ chạy ở cart.html (nơi có #fishtank).
   Không thay thế renderCartPage cũ, chỉ vẽ thêm lớp trực quan.
   Cần nạp SAU products.js, cart.js, main.js
   ===================================================== */

(function () {

  const FISH_COLORS = ["#e8703a", "#d9a441", "#3f8fb8", "#4b9a8a", "#c94a35", "#2f7fa8"];
  let draggingFish = null;     // con cá đang bị kéo (nếu có)
  let dragStartX = 0, dragStartY = 0;

  function canDragOnThisDevice() {
    return window.matchMedia("(hover: hover)").matches;   // chỉ cho kéo trên máy có chuột thật
  }

  /* ---------- 1. VẼ LẠI TOÀN BỘ BỂ CÁ TỪ GIỎ HÀNG HIỆN TẠI ---------- */
  function renderFishtank() {
    const tank = document.getElementById("fishtank");
    if (!tank) return;   // không phải trang giỏ hàng thì bỏ qua

    const items = getCartItems();   // hàm có sẵn trong cart.js

    // Xóa các con cá cũ (giữ lại lớp kính nền và dòng hướng dẫn)
    tank.querySelectorAll(".fish-swim").forEach(function (el) { el.remove(); });

    if (items.length === 0) {
      tank.classList.add("fishtank-empty");
      return;
    }
    tank.classList.remove("fishtank-empty");

    items.forEach(function (item, index) {
      const fish = document.createElement("div");
      fish.className = "fish-swim";
      fish.dataset.productId = item.id;

      const color = FISH_COLORS[index % FISH_COLORS.length];
      const topPercent = 15 + (index % 4) * 20;                 // rải cá theo nhiều tầng cao thấp
      const duration = (14 + (index % 5) * 3).toFixed(1);       // mỗi cá bơi tốc độ hơi khác nhau
      const delay = (index * 0.6).toFixed(1);
      const swimLeft = index % 2 === 0;                          // xen kẽ cá bơi trái/phải

      fish.style.top = topPercent + "%";
      fish.style.animationDuration = duration + "s";
      fish.style.animationDelay = "-" + delay + "s";             // số âm: vào thẳng giữa chừng, khỏi phải chờ xếp hàng
      fish.style.setProperty("--fish-color", color);
      if (!swimLeft) fish.classList.add("fish-swim-reverse");

            fish.innerHTML =
        '<span class="fish-body">' +
          '<svg viewBox="0 0 60 28"><g class="fish-tail"><path d="M38,14 L58,3 L58,25 Z"/></g>' +
          '<ellipse class="fish-body-shape" cx="22" cy="14" rx="18" ry="9"/>' +
          '<path class="fish-fin" d="M16,6 Q22,-5 28,6 Z"/>' +
          '<circle class="fish-eye" cx="10" cy="11" r="1.7"/></svg>' +
        '</span>' +
        '<span class="fish-label">' + item.name + '<br><small>' + formatPrice(item.price) + ' × ' + item.quantity + '</small></span>';

      if (canDragOnThisDevice()) {
        fish.draggable = true;
        attachDragEvents(fish);
      }

      tank.appendChild(fish);
    });
  }

  /* ---------- 2. KÉO CÁ RA KHỎI BỂ = XÓA MÓN ---------- */
  function attachDragEvents(fish) {
    fish.addEventListener("dragstart", function (event) {
      draggingFish = fish;
      fish.classList.add("fish-dragging");
      // Ẩn ảnh mặc định trình duyệt tự vẽ khi kéo (ta tự làm hiệu ứng riêng bằng CSS)
      const blank = document.createElement("canvas");
      event.dataTransfer.setDragImage(blank, 0, 0);
    });

    fish.addEventListener("drag", function (event) {
      if (event.clientX === 0 && event.clientY === 0) return;   // toạ độ rác lúc thả tay, bỏ qua
      fish.style.left = (event.clientX - fish.dragOffsetX) + "px";
      fish.style.top = (event.clientY - fish.dragOffsetY) + "px";
    });

    fish.addEventListener("mousedown", function (event) {
      const rect = fish.getBoundingClientRect();
      fish.dragOffsetX = event.clientX - rect.left - rect.width / 2;
      fish.dragOffsetY = event.clientY - rect.top - rect.height / 2;
    });

    fish.addEventListener("dragend", function (event) {
      const tank = document.getElementById("fishtank");
      const tankRect = tank.getBoundingClientRect();
      const outside =
        event.clientX < tankRect.left || event.clientX > tankRect.right ||
        event.clientY < tankRect.top || event.clientY > tankRect.bottom;

      if (outside && event.clientX !== 0) {
        const productId = Number(fish.dataset.productId);
        fish.classList.add("fish-splash-out");
        setTimeout(function () {
          removeFromCart(productId);   // hàm có sẵn trong cart.js: xóa món + tính lại tiền + vẽ lại danh sách cũ
          renderFishtank();             // vẽ lại bể cá cho khớp giỏ hàng mới
        }, 260);
      } else {
        // Thả lại trong bể: cho cá "bơi tự do" lại bình thường
        fish.classList.remove("fish-dragging");
        fish.style.left = "";
        fish.style.top = fish.style.top;   // giữ nguyên tầng cao đã gán lúc tạo
      }
      draggingFish = null;
    });
  }

  /* ---------- 3. KHỞI ĐỘNG + CẬP NHẬT KHI GIỎ HÀNG ĐỔI Ở NƠI KHÁC ---------- */
  document.addEventListener("DOMContentLoaded", renderFishtank);

  // Nếu người dùng tăng/giảm số lượng ở bảng chi tiết bên dưới, vẽ lại bể cá cho khớp.
  // "Ủy quyền sự kiện" lên document vì các nút +/- và xóa nằm trong nội dung được tạo lại liên tục.
  document.addEventListener("click", function (event) {
    if (event.target.closest(".qty-control button, .remove-btn")) {
      setTimeout(renderFishtank, 50);   // đợi cart.js xử lý xong rồi mới vẽ lại bể cá
    }
  });

  // Giỏ hàng đổi từ tab khác (ví dụ thêm món ở tab menu.html đang mở song song)
  window.addEventListener("storage", renderFishtank);
})();