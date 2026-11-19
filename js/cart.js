/* =====================================================
   OCEAN SEAFOOD - FILE: js/cart.js
   Nội dung: giỏ hàng, mã giảm giá, phí giao hàng,
             hiển thị trang giỏ hàng
   Cần nạp SAU products.js
   ===================================================== */

/* ---------- 1. CÀI ĐẶT ---------- */
const CART_KEY = "oceanSeafoodCart";        // tên "ngăn kéo" lưu giỏ hàng
const COUPON_KEY = "oceanSeafoodCoupon";    // tên "ngăn kéo" lưu mã giảm giá
const MAX_QUANTITY = 99;                    // mỗi món tối đa 99 phần

const SHIPPING_FEE = 30000;                 // phí giao hàng mẫu
const FREE_SHIPPING_FROM = 500000;          // đơn từ 500.000đ được miễn phí giao hàng

// Danh sách mã giảm giá mẫu
const COUPONS = {
  OCEAN10:   { type: "percent", value: 10,     minOrder: 0,       label: "Giảm 10% tổng đơn" },
  WELCOME50: { type: "fixed",   value: 50000,  minOrder: 300000,  label: "Giảm 50.000đ cho đơn từ 300.000đ" },
  FAMILY100: { type: "fixed",   value: 100000, minOrder: 1000000, label: "Giảm 100.000đ cho đơn từ 1.000.000đ" },
  LUCKY20:   { type: "percent", value: 20,     minOrder: 0,       label: "Mã may mắn từ Vòng quay - giảm 20%" },
  COMBO5:    { type: "percent", value: 5,      minOrder: 0,       label: "Ưu đãi tự xây combo (3-4 món) - giảm 5%" },
  COMBO10:   { type: "percent", value: 10,     minOrder: 0,       label: "Ưu đãi tự xây combo (5+ món) - giảm 10%" }
};

/* ---------- 2. ĐỌC VÀ LƯU GIỎ HÀNG ---------- */
// Giỏ hàng chỉ lưu: [{ id: 1, quantity: 2 }, { id: 5, quantity: 1 }]
// (Tên, giá, ảnh sẽ lấy từ products.js để luôn chính xác)

function getCart() {
  try {
    const data = localStorage.getItem(CART_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    return [];   // dữ liệu hỏng thì coi như giỏ trống
  }
}

function saveCart(cart) {
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  updateCartCount();
}

/* ---------- 3. THÊM, SỬA, XÓA MÓN ---------- */

// Thêm món vào giỏ (quantity mặc định là 1)
function addToCart(productId, quantity) {
  quantity = quantity || 1;
  const product = getProductById(productId);

  if (!product) {
    notify("Không tìm thấy món ăn này.", "error");
    return;
  }
  if (!product.inStock) {
    notify("Món \"" + product.name + "\" hiện đã hết hàng.", "error");
    return;
  }

  const cart = getCart();
  const existing = cart.find(function (item) { return item.id === product.id; });

  if (existing) {
    existing.quantity = Math.min(existing.quantity + quantity, MAX_QUANTITY); // món đã có thì tăng số lượng
  } else {
    cart.push({ id: product.id, quantity: Math.min(quantity, MAX_QUANTITY) });
  }

  saveCart(cart);
  notify("Đã thêm \"" + product.name + "\" vào giỏ hàng!", "success");
}

// Tăng hoặc giảm số lượng (delta = +1 hoặc -1). Giảm về 0 thì xóa món.
function changeCartQuantity(productId, delta) {
  let cart = getCart();
  const item = cart.find(function (i) { return i.id === Number(productId); });
  if (!item) return;

  item.quantity += delta;

  if (item.quantity <= 0) {
    cart = cart.filter(function (i) { return i.id !== Number(productId); });
  } else if (item.quantity > MAX_QUANTITY) {
    item.quantity = MAX_QUANTITY;
    notify("Mỗi món tối đa " + MAX_QUANTITY + " phần.", "info");
  }

  saveCart(cart);
  renderCartPage();
}

// Xóa hẳn một món khỏi giỏ (có hiệu ứng trước khi xóa thật)
function removeFromCart(productId) {
  const row = document.querySelector('.cart-item[data-id="' + productId + '"]');
  const btn = row ? row.querySelector(".remove-btn") : null;

  function doRemove() {
    const cart = getCart().filter(function (i) { return i.id !== Number(productId); });
    saveCart(cart);
    renderCartPage();
    notify("Đã xóa món khỏi giỏ hàng.", "info");
  }

  if (row && btn) {
    btn.classList.add("removing");
    row.classList.add("removing-row");
    setTimeout(doRemove, 400);
  } else {
    doRemove();   // phòng trường hợp không tìm thấy phần tử (vẫn xóa đúng, chỉ không có hiệu ứng)
  }
}

// Xóa toàn bộ giỏ hàng (dùng sau khi đặt hàng thành công)
function clearCart() {
  localStorage.removeItem(CART_KEY);
  localStorage.removeItem(COUPON_KEY);
  updateCartCount();
}

/* ---------- 4. LẤY THÔNG TIN GIỎ HÀNG ĐẦY ĐỦ ---------- */

// Trả về danh sách món kèm tên, giá, ảnh, thành tiền
function getCartItems() {
  const items = [];
  getCart().forEach(function (cartItem) {
    const product = getProductById(cartItem.id);
    if (product) {   // bỏ qua món không còn tồn tại trong dữ liệu
      items.push({
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        quantity: cartItem.quantity,
        lineTotal: product.price * cartItem.quantity
      });
    }
  });
  return items;
}

/* ---------- 5. MÃ GIẢM GIÁ ---------- */

function getAppliedCoupon() {
  return localStorage.getItem(COUPON_KEY) || "";
}

// Tính số tiền được giảm dựa trên tạm tính
function calculateDiscount(subtotal) {
  const coupon = COUPONS[getAppliedCoupon()];
  if (!coupon || subtotal < coupon.minOrder) return 0;

  if (coupon.type === "percent") {
    return Math.round(subtotal * coupon.value / 100);
  }
  return Math.min(coupon.value, subtotal);   // giảm cố định, không vượt quá tổng đơn
}

// Áp dụng mã. Trả về { success: true/false, message: "..." }
function applyCoupon(code) {
  code = code.trim().toUpperCase();
  const subtotal = getCartTotals().subtotal;

  if (code === "") {
    return { success: false, message: "Vui lòng nhập mã giảm giá." };
  }
  if (subtotal === 0) {
    return { success: false, message: "Giỏ hàng đang trống, hãy thêm món trước." };
  }
  if (!COUPONS[code]) {
    return { success: false, message: "Mã giảm giá không hợp lệ." };
  }
  if (subtotal < COUPONS[code].minOrder) {
    return {
      success: false,
      message: "Mã này chỉ áp dụng cho đơn từ " + formatPrice(COUPONS[code].minOrder) + "."
    };
  }

  localStorage.setItem(COUPON_KEY, code);
  return { success: true, message: "Áp dụng thành công: " + COUPONS[code].label + "." };
}

/* ---------- 6. TÍNH TIỀN ---------- */
// deliveryMethod: "delivery" (giao tận nơi) hoặc "pickup" (nhận tại nhà hàng)
function getCartTotals(deliveryMethod) {
  deliveryMethod = deliveryMethod || "delivery";
  const items = getCartItems();

  let subtotal = 0;
  let count = 0;
  items.forEach(function (item) {
    subtotal += item.lineTotal;
    count += item.quantity;
  });

  const discount = calculateDiscount(subtotal);

  let shipping = 0;
  if (items.length > 0 && deliveryMethod === "delivery" && subtotal < FREE_SHIPPING_FROM) {
    shipping = SHIPPING_FEE;
  }

  return {
    count: count,                                   // tổng số phần
    subtotal: subtotal,                             // tạm tính
    discount: discount,                             // tiền giảm
    shipping: shipping,                             // phí giao hàng
    total: subtotal - discount + shipping           // tổng thanh toán
  };
}

/* ---------- 7. CẬP NHẬT SỐ TRÊN BIỂU TƯỢNG GIỎ HÀNG ---------- */
function updateCartCount() {
  const count = getCartTotals().count;
  document.querySelectorAll(".cart-count").forEach(function (badge) {
    badge.textContent = count;
    badge.style.display = count > 0 ? "flex" : "none";   // giỏ trống thì ẩn chấm
  });
}

/* ---------- 8. HIỂN THỊ TRANG GIỎ HÀNG (cart.html) ---------- */
// Các id cần có trong cart.html (Phần 8 sẽ tạo):
//   #cart-items, #summary-subtotal, #summary-discount, #summary-shipping,
//   #summary-total, #coupon-input, #coupon-message

function renderCartPage() {
  const container = document.getElementById("cart-items");
  if (!container) return;   // không phải trang giỏ hàng thì bỏ qua

  const items = getCartItems();

  if (items.length === 0) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🛒</div>
        <p>Giỏ hàng của bạn đang trống.</p>
        <a href="menu.html" class="btn btn-primary" style="margin-top:16px">Xem thực đơn</a>
      </div>`;
  } else {
    container.innerHTML = items.map(function (item) {
      return `
        <div class="cart-item" data-id="${item.id}">
          <img src="${item.image}" alt="${item.name}" onerror="handleImageError(this)">
          <div>
            <h3>${item.name}</h3>
            <div class="item-price">${formatPrice(item.price)} / phần</div>
          </div>
          <div class="qty-control">
            <button onclick="changeCartQuantity(${item.id}, -1)" aria-label="Giảm">−</button>
            <span>${item.quantity}</span>
            <button onclick="changeCartQuantity(${item.id}, 1)" aria-label="Tăng">+</button>
          </div>
          <div class="item-total">${formatPrice(item.lineTotal)}</div>
          <button class="remove-btn" onclick="removeFromCart(${item.id})" title="Xóa món" aria-label="Xóa">🗑</button>
        </div>`;
    }).join("");
  }

  renderCartSummary();
}

// Cập nhật khung tổng tiền bên phải
function renderCartSummary() {
  const totals = getCartTotals();
  setText("summary-subtotal", formatPrice(totals.subtotal));
  setText("summary-discount", "-" + formatPrice(totals.discount));
  setText("summary-shipping", totals.shipping === 0 ? "Miễn phí" : formatPrice(totals.shipping));
  setText("summary-total", formatPrice(totals.total));

  // Hiện mã đang áp dụng trong ô thông báo mã giảm giá
  const messageBox = document.getElementById("coupon-message");
  const code = getAppliedCoupon();
  if (messageBox && code && totals.discount > 0) {
    messageBox.textContent = "Đang áp dụng mã " + code + ": " + COUPONS[code].label + ".";
    messageBox.style.color = "var(--color-success)";
  } else if (messageBox && code && totals.discount === 0) {
    messageBox.textContent = "Mã " + code + " chưa đủ điều kiện cho đơn hàng hiện tại.";
    messageBox.style.color = "var(--color-danger)";
  }
}

// Ghi chữ vào phần tử theo id (có kiểm tra tồn tại để không báo lỗi)
function setText(elementId, text) {
  const element = document.getElementById(elementId);
  if (element) element.textContent = text;
}

// Gắn vào nút "Áp dụng" mã giảm giá
function applyCouponFromInput() {
  const input = document.getElementById("coupon-input");
  const messageBox = document.getElementById("coupon-message");
  if (!input) return;

  const result = applyCoupon(input.value);
  if (messageBox) {
    messageBox.textContent = result.message;
    messageBox.style.color = result.success ? "var(--color-success)" : "var(--color-danger)";
  }
  renderCartSummary();
}

// Gắn vào nút "Tiến hành đặt hàng"
function goToCheckout() {
  if (getCart().length === 0) {
    notify("Giỏ hàng đang trống, hãy chọn món trước nhé!", "error");
    return;
  }
  window.location.href = "checkout.html";
}

/* ---------- 9. HÀM THÔNG BÁO ---------- */
// Dùng showToast (viết ở main.js, Phần 5). Nếu main.js chưa có thì dùng alert tạm.
function notify(message, type) {
  if (typeof showToast === "function") {
    showToast(message, type);
  } else {
    alert(message);
  }
}

/* ---------- 10. KHỞI ĐỘNG ---------- */
document.addEventListener("DOMContentLoaded", function () {
  updateCartCount();   // hiện số món trên biểu tượng giỏ hàng
  renderCartPage();    // chỉ chạy nếu đang ở trang giỏ hàng
});

// Nếu mở website ở 2 tab, giỏ hàng ở tab này đổi thì tab kia cũng cập nhật
window.addEventListener("storage", function () {
  updateCartCount();
  renderCartPage();
});