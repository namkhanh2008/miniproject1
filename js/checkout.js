/* =====================================================
   OCEAN SEAFOOD - FILE: js/checkout.js
   Nội dung: kiểm tra form đặt hàng, tạo đơn hàng mẫu,
             lưu lịch sử đơn, xóa giỏ hàng sau khi đặt
   Cần nạp SAU products.js, cart.js, main.js
   ===================================================== */

const ORDERS_KEY = "oceanSeafoodOrders";   // ngăn kéo lưu lịch sử đơn hàng

/* ---------- 1. HÀM HỖ TRỢ ---------- */

// Lấy giá trị đang được chọn của một nhóm radio
function getSelectedValue(name) {
  const checked = document.querySelector('input[name="' + name + '"]:checked');
  return checked ? checked.value : "";
}

// Hiện hoặc xóa thông báo lỗi dưới một ô nhập.
// message rỗng nghĩa là không có lỗi.
function setFieldError(groupId, message) {
  const group = document.getElementById(groupId);
  if (!group) return;
  const errorBox = group.querySelector(".error-message");

  if (message) {
    group.classList.add("error");
    if (errorBox) errorBox.textContent = message;
  } else {
    group.classList.remove("error");
    if (errorBox) errorBox.textContent = "";
  }
}

// Kiểm tra số điện thoại Việt Nam: 10 số bắt đầu bằng 0 (hoặc +84 rồi 9 số)
function isValidPhone(phone) {
  return /^(0|\+84)[0-9]{9}$/.test(phone.replace(/\s/g, ""));
}

// Kiểm tra email đơn giản: có dạng ten@mien.xx
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/* ---------- 2. HIỂN THỊ TÓM TẮT ĐƠN HÀNG ---------- */
function renderCheckoutSummary() {
  const items = getCartItems();
  const itemsBox = document.getElementById("checkout-items");

  // Giỏ hàng trống thì không cho đặt, đưa người dùng về thực đơn
  if (items.length === 0) {
    document.getElementById("checkout-layout").innerHTML = `
      <div class="empty-state" style="grid-column:1 / -1">
        <div class="empty-icon">🛒</div>
        <p>Giỏ hàng đang trống nên chưa thể đặt hàng.</p>
        <a href="menu.html" class="btn btn-primary" style="margin-top:16px">Xem thực đơn</a>
      </div>`;
    return false;
  }

  itemsBox.innerHTML = items.map(function (item) {
    return `
      <div class="summary-row">
        <span>${item.name} × ${item.quantity}</span>
        <span>${formatPrice(item.lineTotal)}</span>
      </div>`;
  }).join("");

  updateCheckoutTotals();
  return true;
}

// Tính lại tiền mỗi khi đổi phương thức nhận hàng (nhận tại nhà hàng thì không mất phí giao)
function updateCheckoutTotals() {
  const totals = getCartTotals(getSelectedValue("delivery"));
  setText("summary-subtotal", formatPrice(totals.subtotal));
  setText("summary-discount", "-" + formatPrice(totals.discount));
  setText("summary-shipping", totals.shipping === 0 ? "Miễn phí" : formatPrice(totals.shipping));
  setText("summary-total", formatPrice(totals.total));
}

/* ---------- 3. ĐỔI GIAO DIỆN THEO LỰA CHỌN ---------- */

// Nhận tại nhà hàng thì ẩn ô địa chỉ; chọn chuyển khoản thì hiện thông tin mẫu
function updateFormByChoices() {
  const isDelivery = getSelectedValue("delivery") === "delivery";
  document.getElementById("group-address").style.display = isDelivery ? "block" : "none";
  if (!isDelivery) setFieldError("group-address", "");

  const isBank = getSelectedValue("payment") === "bank";
  document.getElementById("bank-info").style.display = isBank ? "block" : "none";

  updateCheckoutTotals();
}

// Nếu đã đăng nhập thì điền sẵn thông tin vào form
function prefillFromUser() {
  const user = getCurrentUser();   // hàm của main.js
  if (!user) return;
  if (user.name)  document.getElementById("full-name").value = user.name;
  if (user.email) document.getElementById("email").value = user.email;
  if (user.phone) document.getElementById("phone").value = user.phone;
}

/* ---------- 4. KIỂM TRA FORM ---------- */
// Trả về dữ liệu form nếu hợp lệ, trả về null nếu có lỗi
function validateCheckoutForm() {
  const name = document.getElementById("full-name").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const email = document.getElementById("email").value.trim();
  const address = document.getElementById("address").value.trim();
  const note = document.getElementById("note").value.trim();
  const delivery = getSelectedValue("delivery");
  const payment = getSelectedValue("payment");

  let isValid = true;

  if (name.length < 2) {
    setFieldError("group-name", "Vui lòng nhập họ và tên (ít nhất 2 ký tự).");
    isValid = false;
  } else {
    setFieldError("group-name", "");
  }

  if (!isValidPhone(phone)) {
    setFieldError("group-phone", "Số điện thoại không hợp lệ (ví dụ: 0901234567).");
    isValid = false;
  } else {
    setFieldError("group-phone", "");
  }

  if (!isValidEmail(email)) {
    setFieldError("group-email", "Email không hợp lệ (ví dụ: ten@example.com).");
    isValid = false;
  } else {
    setFieldError("group-email", "");
  }

  // Chỉ bắt buộc địa chỉ khi chọn giao hàng tận nơi
  if (delivery === "delivery" && address.length < 8) {
    setFieldError("group-address", "Vui lòng nhập địa chỉ giao hàng đầy đủ.");
    isValid = false;
  } else {
    setFieldError("group-address", "");
  }

  if (!isValid) return null;

  return { name: name, phone: phone, email: email, address: address, note: note,
           delivery: delivery, payment: payment };
}

/* ---------- 5. LƯU LỊCH SỬ ĐƠN HÀNG ---------- */
function getOrders() {
  try {
    const data = localStorage.getItem(ORDERS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    return [];
  }
}

function saveOrder(order) {
  const orders = getOrders();
  orders.push(order);
  localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
}

/* ---------- 6. XỬ LÝ KHI BẤM "XÁC NHẬN ĐẶT HÀNG" ---------- */
function handleCheckoutSubmit(event) {
  event.preventDefault();   // chặn trình duyệt tải lại trang

  // Giỏ hàng phải có món
  if (getCart().length === 0) {
    showToast("Giỏ hàng đang trống, hãy chọn món trước nhé!", "error");
    return;
  }

  const formData = validateCheckoutForm();
  if (!formData) {
    showToast("Vui lòng kiểm tra lại các thông tin bị báo lỗi.", "error");
    return;
  }

  // Tạo đơn hàng
  const totals = getCartTotals(formData.delivery);
  const order = {
    code: makeCode("DH"),                          // hàm của main.js, ví dụ DH-483920
    createdAt: new Date().toLocaleString("vi-VN"),
    customer: formData,
    items: getCartItems(),
    coupon: getAppliedCoupon(),
    totals: totals,
    status: "Đã tiếp nhận (mô phỏng)"
  };

  saveOrder(order);
  clearCart();                  // xóa giỏ hàng sau khi đặt thành công
  showOrderSuccess(order);
}

/* ---------- 7. HIỂN THỊ THÔNG BÁO THÀNH CÔNG ---------- */
function showOrderSuccess(order) {
  clearFormDraft("oceanSeafoodDraftCheckout");
  if (window.fireConfetti) fireConfetti();
  const c = order.customer;
  const deliveryText = c.delivery === "delivery" ? "Giao hàng tận nơi" : "Nhận tại nhà hàng";
  const paymentText = c.payment === "cod" ? "Thanh toán khi nhận hàng (COD)" : "Chuyển khoản";

  // Dữ liệu người dùng nhập phải qua escapeHTML để tránh chèn mã HTML
  const addressLine = c.delivery === "delivery"
    ? "<p><strong>Giao đến:</strong> " + escapeHTML(c.address) + "</p>"
    : "<p><strong>Nhận tại:</strong> " + RESTAURANT_INFO.address + "</p>";

  const bankNote = c.payment === "bank"
    ? '<div class="info-box" style="text-align:left">Vui lòng chuyển khoản với nội dung: <strong>' +
      order.code + "</strong> (thông tin mẫu, không cần chuyển tiền thật).</div>"
    : "";

  const successBox = document.getElementById("order-success");
  successBox.innerHTML = `
    <div class="success-box">
      <div class="success-icon">✅</div>
      <h3>Đặt hàng thành công!</h3>
      <p>Cảm ơn <strong>${escapeHTML(c.name)}</strong> đã tin tưởng OCEAN SEAFOOD.</p>
      <div>Mã đơn hàng của bạn:<br><span class="order-code">${order.code}</span></div>
    </div>

    <div class="form-box">
      <h2>Chi tiết đơn hàng</h2>
      <p><strong>Thời gian:</strong> ${order.createdAt}</p>
      <p><strong>Người nhận:</strong> ${escapeHTML(c.name)} - ${escapeHTML(c.phone)}</p>
      ${addressLine}
      <p><strong>Nhận hàng:</strong> ${deliveryText}</p>
      <p><strong>Thanh toán:</strong> ${paymentText}</p>
      ${c.note ? "<p><strong>Ghi chú:</strong> " + escapeHTML(c.note) + "</p>" : ""}

      <div style="margin:16px 0">
        ${order.items.map(function (item) {
          return '<div class="summary-row"><span>' + item.name + " × " + item.quantity +
                 "</span><span>" + formatPrice(item.lineTotal) + "</span></div>";
        }).join("")}
        <div class="summary-row"><span>Tạm tính</span><span>${formatPrice(order.totals.subtotal)}</span></div>
        <div class="summary-row"><span>Giảm giá</span><span>-${formatPrice(order.totals.discount)}</span></div>
        <div class="summary-row"><span>Phí giao hàng</span><span>${order.totals.shipping === 0 ? "Miễn phí" : formatPrice(order.totals.shipping)}</span></div>
        <div class="summary-row total"><span>Tổng thanh toán</span><span>${formatPrice(order.totals.total)}</span></div>
      </div>

      ${bankNote}

      <div class="no-print" style="display:flex; gap:12px; flex-wrap:wrap; margin-top:16px">
        <button type="button" class="btn btn-gold" onclick="window.print()">🖨️ In hóa đơn</button>
        <a href="index.html" class="btn btn-primary">Về trang chủ</a>
        <a href="menu.html" class="btn btn-outline-blue">Tiếp tục xem thực đơn</a>
      </div>
      <p style="font-size:0.85rem; color:var(--color-text-light); margin-top:12px">
        Đây là đơn hàng mô phỏng phục vụ học tập, không có giao dịch thật.
      </p>
    </div>`;

  // Ẩn form, hiện kết quả, cuộn lên đầu
  document.getElementById("checkout-layout").style.display = "none";
  successBox.style.display = "block";
  window.scrollTo({ top: 0, behavior: "smooth" });
  showToast("Đặt hàng thành công! Mã đơn: " + order.code, "success", 4500);
}

/* ---------- 8. KHỞI ĐỘNG ---------- */
document.addEventListener("DOMContentLoaded", function () {
  // Chỉ chạy nếu có form (giỏ hàng trống thì renderCheckoutSummary đã thay nội dung)
  const hasItems = renderCheckoutSummary();
  if (!hasItems) return;

  prefillFromUser();
  setupFormAutosave("checkout-form", "oceanSeafoodDraftCheckout");
  updateFormByChoices();

  document.getElementById("checkout-form").addEventListener("submit", handleCheckoutSubmit);

  // Đổi lựa chọn nhận hàng hoặc thanh toán thì cập nhật giao diện
  document.querySelectorAll('input[name="delivery"], input[name="payment"]').forEach(function (radio) {
    radio.addEventListener("change", updateFormByChoices);
  });

  // Người dùng sửa lại ô nào thì xóa báo lỗi của ô đó
  ["full-name", "phone", "email", "address"].forEach(function (id) {
    document.getElementById(id).addEventListener("input", function () {
      const group = document.getElementById(id).closest(".form-group");
      if (group) group.classList.remove("error");
    });
  });
});