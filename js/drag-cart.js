/* =====================================================
   OCEAN SEAFOOD - FILE: js/drag-cart.js
   Nội dung: kéo-thả thẻ món ăn vào biểu tượng giỏ hàng
   Chỉ hoạt động trên thiết bị có chuột (HTML5 Drag and Drop
   không được trình duyệt điện thoại hỗ trợ tốt).
   Nút "Thêm vào giỏ" cũ không bị ảnh hưởng.
   Cần nạp SAU products.js, cart.js, main.js
   ===================================================== */

(function () {

  // Dùng "ủy quyền sự kiện" (gắn vào document) vì:
  // - Thẻ món ăn được tạo lại liên tục khi lọc/tìm kiếm ở trang thực đơn
  // - Biểu tượng giỏ hàng nằm trong header do main.js tạo ra sau
  // Nhờ vậy không cần gắn lại sự kiện mỗi lần danh sách thay đổi.

  let draggedImageSrc = null;
  let draggedImageRect = null;

  /* ---------- 1. BẮT ĐẦU KÉO ---------- */
  document.addEventListener("dragstart", function (event) {
    const card = event.target.closest(".product-card");
    if (!card || card.dataset.soldout === "true") {
      event.preventDefault();   // món hết hàng thì không cho kéo
      return;
    }

    event.dataTransfer.setData("text/plain", card.dataset.productId);
    event.dataTransfer.effectAllowed = "move";

    const img = card.querySelector(".product-image img");
    draggedImageSrc = img ? img.src : "";
    draggedImageRect = img ? img.getBoundingClientRect() : card.getBoundingClientRect();

    // Để trình duyệt kịp vẽ "ảnh bóng" đi theo chuột trước khi làm mờ thẻ gốc
    setTimeout(function () { card.classList.add("dragging"); }, 0);
  });

  document.addEventListener("dragend", function (event) {
    const card = event.target.closest(".product-card");
    if (card) card.classList.remove("dragging");
  });

  /* ---------- 2. RÊ QUA GIỎ HÀNG: cho phép thả + hiện viền sáng ---------- */
  document.addEventListener("dragover", function (event) {
    const cartIcon = event.target.closest(".cart-icon");
    if (!cartIcon) return;
    event.preventDefault();          // bắt buộc phải có dòng này thì mới "thả" được
    cartIcon.classList.add("cart-drop-hover");
  });

  document.addEventListener("dragleave", function (event) {
    const cartIcon = event.target.closest(".cart-icon");
    if (cartIcon) cartIcon.classList.remove("cart-drop-hover");
  });

  /* ---------- 3. THẢ VÀO GIỎ HÀNG ---------- */
  document.addEventListener("drop", function (event) {
    const cartIcon = event.target.closest(".cart-icon");
    if (!cartIcon) return;
    event.preventDefault();
    cartIcon.classList.remove("cart-drop-hover");

    const productId = Number(event.dataTransfer.getData("text/plain"));
    if (!productId) return;

    addToCart(productId);                 // hàm có sẵn trong cart.js
    shakeCart(cartIcon);
    if (draggedImageSrc && draggedImageRect) {
      flyToCart(draggedImageSrc, draggedImageRect, cartIcon.getBoundingClientRect());
    }
  });

  /* ---------- 4. HIỆU ỨNG: giỏ hàng rung lắc ---------- */
  function shakeCart(cartIcon) {
    cartIcon.classList.remove("cart-shake");
    void cartIcon.offsetWidth;          // ép trình duyệt tính toán lại, để có thể chạy lại animation liên tiếp
    cartIcon.classList.add("cart-shake");
  }

  /* ---------- 5. HIỆU ỨNG: ảnh món ăn "bay" vào giỏ ---------- */
  function flyToCart(imageSrc, fromRect, toRect) {
    const flyer = document.createElement("img");
    flyer.src = imageSrc;
    flyer.className = "fly-to-cart";
    flyer.style.left = fromRect.left + "px";
    flyer.style.top = fromRect.top + "px";
    flyer.style.width = fromRect.width + "px";
    flyer.style.height = fromRect.height + "px";
    document.body.appendChild(flyer);

    const deltaX = (toRect.left + toRect.width / 2) - (fromRect.left + fromRect.width / 2);
    const deltaY = (toRect.top + toRect.height / 2) - (fromRect.top + fromRect.height / 2);

    // Đợi 1 khung hình rồi mới đổi transform, để trình duyệt kịp "ghi nhận" vị trí ban đầu
    requestAnimationFrame(function () {
      flyer.style.transform = "translate(" + deltaX + "px," + deltaY + "px) scale(0.15)";
      flyer.style.opacity = "0.15";
    });

    flyer.addEventListener("transitionend", function () { flyer.remove(); });
    setTimeout(function () { flyer.remove(); }, 900);   // dự phòng nếu transitionend không chạy
  }
})();