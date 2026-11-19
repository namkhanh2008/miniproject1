/* =====================================================
   OCEAN SEAFOOD - FILE: js/auth.js
   Nội dung: đăng ký, đăng nhập, quản lý thông tin tài khoản
   (MÔ PHỎNG bằng LocalStorage, không dùng cho tài khoản thật)
   Cần nạp SAU products.js, cart.js, main.js
   ===================================================== */

/* ---------- 1. CÀI ĐẶT ---------- */
const USERS_KEY = "oceanSeafoodUsers";   // ngăn kéo lưu danh sách tài khoản đã đăng ký
// (CURRENT_USER_KEY, getCurrentUser, logout đã có trong main.js)

/* ---------- 2. HÀM HỖ TRỢ KIỂM TRA FORM ---------- */
// Các hàm này giống trong checkout.js và booking.js. Không sao vì
// trang đăng nhập/đăng ký không nạp hai file kia.

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

function isValidPhone(phone) {
  return /^(0|\+84)[0-9]{9}$/.test(phone.replace(/\s/g, ""));
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Email không phân biệt hoa thường: "An@Mail.com" và "an@mail.com" là một
function normalizeEmail(email) {
  return email.trim().toLowerCase();
}

/* ---------- 3. BĂM MẬT KHẨU ---------- */
// KHÔNG BAO GIỜ lưu mật khẩu dạng chữ gốc. Ta lưu "dấu vân tay" (hash) của nó.
// Cùng một mật khẩu luôn cho cùng một hash, nhưng không suy ngược được mật khẩu.
// Đây vẫn chỉ là mô phỏng: web thật phải băm trên server.

// Cách 1: SHA-256 có sẵn trong trình duyệt (chỉ chạy trên localhost hoặc https)
async function sha256Hex(text) {
  const bytes = new TextEncoder().encode(text);
  const buffer = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(buffer))
    .map(function (b) { return b.toString(16).padStart(2, "0"); })
    .join("");
}

// Cách 2 (dự phòng khi trình duyệt không hỗ trợ cách 1): hàm băm đơn giản
function simpleHash(text) {
  let hash = 2166136261;
  for (let i = 0; i < text.length; i++) {
    hash ^= text.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16);
}

function supportsSha256() {
  return !!(window.crypto && window.crypto.subtle);
}

// Trả về chuỗi dạng "sha256:abc..." hoặc "simple:abc...".
// Trộn thêm email vào ("salt") để hai người trùng mật khẩu vẫn ra hash khác nhau.
// Trả về null nếu yêu cầu sha256 mà trình duyệt không hỗ trợ.
async function hashPassword(password, email, method) {
  const salted = "ocean|" + email + "|" + password;
  if (method === "sha256") {
    if (!supportsSha256()) return null;
    return "sha256:" + (await sha256Hex(salted));
  }
  return "simple:" + simpleHash(salted);
}

/* ---------- 4. ĐỌC VÀ LƯU DANH SÁCH TÀI KHOẢN ---------- */
function getUsers() {
  try {
    const data = localStorage.getItem(USERS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    return [];
  }
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function findUserByEmail(email) {
  const target = normalizeEmail(email);
  return getUsers().find(function (user) { return user.email === target; });
}

// Lưu người đang đăng nhập (KHÔNG lưu mật khẩu hay hash vào đây)
function setCurrentUser(user) {
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify({
    name: user.name,
    email: user.email,
    phone: user.phone
  }));
}

/* ---------- 5. ĐĂNG KÝ ---------- */
async function handleRegister(event) {
  event.preventDefault();

  const name = document.getElementById("full-name").value.trim();
  const email = normalizeEmail(document.getElementById("email").value);
  const phone = document.getElementById("phone").value.trim();
  const password = document.getElementById("password").value;
  const confirm = document.getElementById("confirm-password").value;

  let isValid = true;

  if (name.length < 2) {
    setFieldError("group-name", "Vui lòng nhập họ và tên (ít nhất 2 ký tự).");
    isValid = false;
  } else {
    setFieldError("group-name", "");
  }

  if (!isValidEmail(email)) {
    setFieldError("group-email", "Email không hợp lệ (ví dụ: ten@example.com).");
    isValid = false;
  } else if (findUserByEmail(email)) {
    setFieldError("group-email", "Email này đã được đăng ký. Hãy đăng nhập hoặc dùng email khác.");
    isValid = false;
  } else {
    setFieldError("group-email", "");
  }

  if (!isValidPhone(phone)) {
    setFieldError("group-phone", "Số điện thoại không hợp lệ (ví dụ: 0901234567).");
    isValid = false;
  } else {
    setFieldError("group-phone", "");
  }

  // Mật khẩu: tối thiểu 6 ký tự, có cả chữ và số
  if (password.length < 6) {
    setFieldError("group-password", "Mật khẩu phải có ít nhất 6 ký tự.");
    isValid = false;
  } else if (!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
    setFieldError("group-password", "Mật khẩu phải gồm cả chữ và số.");
    isValid = false;
  } else {
    setFieldError("group-password", "");
  }

  if (confirm === "") {
    setFieldError("group-confirm", "Vui lòng nhập lại mật khẩu.");
    isValid = false;
  } else if (confirm !== password) {
    setFieldError("group-confirm", "Mật khẩu xác nhận không khớp.");
    isValid = false;
  } else {
    setFieldError("group-confirm", "");
  }

  if (!isValid) {
    showToast("Vui lòng kiểm tra lại các thông tin bị báo lỗi.", "error");
    return;
  }

  // Băm mật khẩu rồi lưu tài khoản mới
  const method = supportsSha256() ? "sha256" : "simple";
  const passwordHash = await hashPassword(password, email, method);

  const users = getUsers();
  users.push({
    name: name,
    email: email,
    phone: phone,
    passwordHash: passwordHash,
    createdAt: new Date().toLocaleString("vi-VN")
  });
  saveUsers(users);

  // Chuyển sang trang đăng nhập, thông báo sẽ hiện ở đó (hàm setFlash của main.js)
  setFlash("Đăng ký thành công! Hãy đăng nhập để tiếp tục.", "success");
  window.location.href = "login.html";
}

/* ---------- 6. ĐĂNG NHẬP ---------- */
async function handleLogin(event) {
  event.preventDefault();

  const email = normalizeEmail(document.getElementById("email").value);
  const password = document.getElementById("password").value;

  let isValid = true;

  if (!isValidEmail(email)) {
    setFieldError("group-email", "Vui lòng nhập email hợp lệ.");
    isValid = false;
  } else {
    setFieldError("group-email", "");
  }

  if (password === "") {
    setFieldError("group-password", "Vui lòng nhập mật khẩu.");
    isValid = false;
  } else {
    setFieldError("group-password", "");
  }

  if (!isValid) return;

  // Tìm tài khoản. Dù sai email hay sai mật khẩu đều báo CÙNG một câu,
  // để người lạ không dò ra email nào đã tồn tại.
  const user = findUserByEmail(email);
  const failMessage = "Email hoặc mật khẩu không đúng.";

  if (!user) {
    setFieldError("group-password", failMessage);
    return;
  }

  // Băm lại mật khẩu vừa nhập theo ĐÚNG cách đã dùng lúc đăng ký rồi so sánh
  const method = user.passwordHash.split(":")[0];
  const inputHash = await hashPassword(password, email, method);

  if (inputHash === null) {
    showToast("Trình duyệt này không hỗ trợ kiểu mã hóa của tài khoản. Hãy mở web bằng Live Server (localhost).", "error", 5000);
    return;
  }

  if (inputHash !== user.passwordHash) {
    setFieldError("group-password", failMessage);
    return;
  }

  // Đăng nhập thành công
  setCurrentUser(user);
  setFlash("Đăng nhập thành công! Xin chào, " + user.name + ".", "success");
  window.location.href = "index.html";
}

/* ---------- 7. TRANG "TÀI KHOẢN CỦA TÔI" (khi đã đăng nhập) ---------- */

// Trang đăng nhập: thay form bằng khung quản lý tài khoản
function showAccountBox(user) {
  document.getElementById("page-title").textContent = "Tài khoản của tôi";

  document.getElementById("auth-content").innerHTML = `
    <div class="form-box">
      <h2>Xin chào, <span id="account-name">${escapeHTML(user.name)}</span></h2>
      <p style="margin-bottom:18px">Email: <strong>${escapeHTML(user.email)}</strong></p>

      <form id="profile-form" novalidate>
        <div class="form-group" id="group-name">
          <label for="full-name">Họ và tên</label>
          <input type="text" id="full-name" value="${escapeHTML(user.name)}">
          <div class="error-message"></div>
        </div>

        <div class="form-group" id="group-phone">
          <label for="phone">Số điện thoại</label>
          <input type="tel" id="phone" value="${escapeHTML(user.phone || "")}">
          <div class="error-message"></div>
        </div>

        <button type="submit" class="btn btn-primary btn-block">Lưu thông tin</button>
      </form>

      <div style="display:flex; gap:12px; flex-wrap:wrap; margin-top:18px">
        <a href="menu.html" class="btn btn-outline-blue">Xem thực đơn</a>
        <a href="booking.html" class="btn btn-outline-blue">Đặt bàn</a>
        <button class="btn btn-gold" onclick="logout()">Đăng xuất</button>
      </div>
    </div>`;

  document.getElementById("profile-form").addEventListener("submit", handleProfileUpdate);
}

// Trang đăng ký: người đã đăng nhập thì không cần đăng ký nữa
function showAlreadyLoggedIn(user) {
  document.getElementById("auth-content").innerHTML = `
    <div class="form-box" style="text-align:center">
      <div class="success-icon" style="font-size:3rem">👋</div>
      <h2>Bạn đã đăng nhập</h2>
      <p style="margin-bottom:18px">Đang đăng nhập với tên <strong>${escapeHTML(user.name)}</strong>.</p>
      <div style="display:flex; gap:12px; flex-wrap:wrap; justify-content:center">
        <a href="index.html" class="btn btn-primary">Về trang chủ</a>
        <a href="login.html" class="btn btn-outline-blue">Tài khoản của tôi</a>
        <button class="btn btn-gold" onclick="logout()">Đăng xuất</button>
      </div>
    </div>`;
}

// Lưu thông tin tài khoản đã chỉnh sửa
function handleProfileUpdate(event) {
  event.preventDefault();

  const name = document.getElementById("full-name").value.trim();
  const phone = document.getElementById("phone").value.trim();
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

  if (!isValid) return;

  const current = getCurrentUser();
  if (!current) return;

  // Cập nhật trong danh sách tài khoản
  const users = getUsers();
  const user = users.find(function (u) { return u.email === current.email; });
  if (user) {
    user.name = name;
    user.phone = phone;
    saveUsers(users);
  }

  // Cập nhật người đang đăng nhập
  current.name = name;
  current.phone = phone;
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(current));

  // Vẽ lại header để tên mới hiện ngay (các hàm của main.js và cart.js)
  renderHeader();
  setupMobileMenu();
  updateCartCount();
  document.getElementById("account-name").textContent = name;

  showToast("Đã cập nhật thông tin tài khoản.", "success");
}

/* ---------- 8. HIỆN HOẶC ẨN MẬT KHẨU ---------- */
function setupShowPassword() {
  const checkbox = document.getElementById("show-password");
  if (!checkbox) return;

  checkbox.addEventListener("change", function () {
    ["password", "confirm-password"].forEach(function (id) {
      const input = document.getElementById(id);
      if (input) input.type = checkbox.checked ? "text" : "password";
    });
  });
}

/* ---------- 9. KHỞI ĐỘNG ---------- */
document.addEventListener("DOMContentLoaded", function () {
  const loginForm = document.getElementById("login-form");
  const registerForm = document.getElementById("register-form");
  const user = getCurrentUser();

  // Đã đăng nhập: không hiện form nữa
  if (user && loginForm) {
    showAccountBox(user);
    return;
  }
  if (user && registerForm) {
    showAlreadyLoggedIn(user);
    return;
  }

  // Chưa đăng nhập: gắn xử lý cho form có trên trang
  if (loginForm) loginForm.addEventListener("submit", handleLogin);
  if (registerForm) registerForm.addEventListener("submit", handleRegister);
  setupShowPassword();

  // Người dùng sửa lại ô nào thì xóa báo lỗi của ô đó
  document.querySelectorAll(".form-group input").forEach(function (input) {
    input.addEventListener("input", function () {
      const group = input.closest(".form-group");
      if (group) group.classList.remove("error");
    });
  });
});