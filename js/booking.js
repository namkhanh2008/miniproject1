/* =====================================================
   OCEAN SEAFOOD - FILE: js/booking.js
   Nội dung: form đặt bàn, kiểm tra ngày giờ, mã đặt bàn,
             lưu và hủy lịch đặt bàn
   Cần nạp SAU products.js, cart.js, main.js
   ===================================================== */

/* ---------- 1. CÀI ĐẶT ---------- */
const BOOKINGS_KEY = "oceanSeafoodBookings";   // ngăn kéo lưu các lượt đặt bàn
const MAX_DAYS_AHEAD = 60;                     // chỉ nhận đặt trước tối đa 60 ngày
const OPEN_HOUR = 10;                          // giờ mở cửa
const LAST_BOOKING_HOUR = 21;                  // giờ đặt bàn muộn nhất (21:00)

// Các loại bàn và sức chứa tối đa
const TABLE_TYPES = [
  { id: "table-2",  name: "Bàn 2 người",   capacity: 2 },
  { id: "table-4",  name: "Bàn 4 người",   capacity: 4 },
  { id: "table-6",  name: "Bàn 6 người",   capacity: 6 },
  { id: "family",   name: "Bàn gia đình",  capacity: 10 },
  { id: "private",  name: "Phòng riêng",   capacity: 20 }
];

/* ---------- 2. HÀM HỖ TRỢ VỀ NGÀY GIỜ ---------- */

// Chuyển đối tượng ngày thành chuỗi "YYYY-MM-DD" theo GIỜ ĐỊA PHƯƠNG.
// Không dùng toISOString() vì nó tính theo giờ quốc tế (UTC), từ 0h đến 7h sáng
// ở Việt Nam sẽ ra nhầm sang ngày hôm trước.
function formatDateValue(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return year + "-" + month + "-" + day;
}

function getTodayString() {
  return formatDateValue(new Date());
}

function getMaxDateString() {
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + MAX_DAYS_AHEAD);
  return formatDateValue(maxDate);
}

// "2026-11-20" -> "20/11/2026"
function displayDate(dateString) {
  const parts = dateString.split("-");
  return parts[2] + "/" + parts[1] + "/" + parts[0];
}

// "19:30" -> 1170 (số phút tính từ 0h), để so sánh giờ với nhau
function timeToMinutes(timeString) {
  const parts = timeString.split(":");
  return Number(parts[0]) * 60 + Number(parts[1]);
}

/* ---------- 3. HÀM HỖ TRỢ KIỂM TRA FORM ---------- */
// Ba hàm dưới giống hệt trong checkout.js. Mỗi trang nạp file riêng nên
// không bị trùng; viết lại ở đây để file này chạy độc lập, dễ hiểu.

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

// Tìm thông tin loại bàn theo id
function getTableType(id) {
  return TABLE_TYPES.find(function (t) { return t.id === id; });
}

/* ---------- 4. TẠO CÁC LỰA CHỌN CHO FORM ---------- */

// Ô chọn giờ: từ 10:00 đến 21:00, cách nhau 30 phút
function fillTimeOptions() {
  const select = document.getElementById("booking-time");
  let html = '<option value="">-- Chọn giờ --</option>';

  for (let hour = OPEN_HOUR; hour <= LAST_BOOKING_HOUR; hour++) {
    const hh = String(hour).padStart(2, "0");
    html += '<option value="' + hh + ':00">' + hh + ":00</option>";
    if (hour < LAST_BOOKING_HOUR) {   // không có 21:30 vì 21:00 là giờ muộn nhất
      html += '<option value="' + hh + ':30">' + hh + ":30</option>";
    }
  }
  select.innerHTML = html;
}

// Ô chọn loại bàn
function fillTableOptions() {
  const select = document.getElementById("table-type");
  let html = '<option value="">-- Chọn loại bàn --</option>';

  TABLE_TYPES.forEach(function (table) {
    html += '<option value="' + table.id + '">' + table.name + " (tối đa " + table.capacity + " khách)</option>";
  });
  select.innerHTML = html;
}

// Không cho chọn ngày quá khứ: gán min và max cho ô ngày
function setupDateLimits() {
  const dateInput = document.getElementById("booking-date");
  dateInput.min = getTodayString();
  dateInput.max = getMaxDateString();
}

// Nếu đã đăng nhập thì điền sẵn họ tên, email, số điện thoại
function prefillFromUser() {
  const user = getCurrentUser();   // hàm của main.js
  if (!user) return;
  if (user.name)  document.getElementById("full-name").value = user.name;
  if (user.email) document.getElementById("email").value = user.email;
  if (user.phone) document.getElementById("phone").value = user.phone;
}

/* ---------- 5. KIỂM TRA FORM ---------- */
// Trả về dữ liệu nếu hợp lệ, trả về null nếu có lỗi
function validateBookingForm() {
  const name = document.getElementById("full-name").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const email = document.getElementById("email").value.trim();
  const date = document.getElementById("booking-date").value;     // dạng "YYYY-MM-DD"
  const time = document.getElementById("booking-time").value;     // dạng "19:30"
  const guestsText = document.getElementById("guests").value.trim();
  const tableId = document.getElementById("table-type").value;
  const request = document.getElementById("request").value.trim();

  let isValid = true;

  // Họ tên
  if (name.length < 2) {
    setFieldError("group-name", "Vui lòng nhập họ tên (ít nhất 2 ký tự).");
    isValid = false;
  } else {
    setFieldError("group-name", "");
  }

  // Số điện thoại
  if (!isValidPhone(phone)) {
    setFieldError("group-phone", "Số điện thoại không hợp lệ (ví dụ: 0901234567).");
    isValid = false;
  } else {
    setFieldError("group-phone", "");
  }

  // Email
  if (!isValidEmail(email)) {
    setFieldError("group-email", "Email không hợp lệ (ví dụ: ten@example.com).");
    isValid = false;
  } else {
    setFieldError("group-email", "");
  }

  // Ngày: bắt buộc, không quá khứ, không quá xa.
  // So sánh chuỗi "YYYY-MM-DD" hoạt động đúng vì năm-tháng-ngày xếp từ lớn đến nhỏ.
  if (date === "") {
    setFieldError("group-date", "Vui lòng chọn ngày đặt bàn.");
    isValid = false;
  } else if (date < getTodayString()) {
    setFieldError("group-date", "Không thể chọn ngày trong quá khứ.");
    isValid = false;
  } else if (date > getMaxDateString()) {
    setFieldError("group-date", "Chỉ nhận đặt bàn trước tối đa " + MAX_DAYS_AHEAD + " ngày.");
    isValid = false;
  } else {
    setFieldError("group-date", "");
  }

  // Giờ: bắt buộc, và nếu đặt cho hôm nay thì giờ phải chưa qua
  if (time === "") {
    setFieldError("group-time", "Vui lòng chọn giờ đặt bàn.");
    isValid = false;
  } else if (date === getTodayString()) {
    const now = new Date();
    const nowMinutes = now.getHours() * 60 + now.getMinutes();
    if (timeToMinutes(time) <= nowMinutes) {
      setFieldError("group-time", "Giờ này đã qua, vui lòng chọn giờ muộn hơn.");
      isValid = false;
    } else {
      setFieldError("group-time", "");
    }
  } else {
    setFieldError("group-time", "");
  }

  // Số khách phải là số nguyên từ 1 đến 20
  const guests = Number(guestsText);
  if (guestsText === "" || !Number.isInteger(guests) || guests < 1) {
    setFieldError("group-guests", "Vui lòng nhập số khách là số nguyên từ 1 trở lên.");
    isValid = false;
  } else if (guests > 20) {
    setFieldError("group-guests", "Nhóm trên 20 khách vui lòng gọi hotline để được hỗ trợ.");
    isValid = false;
  } else {
    setFieldError("group-guests", "");
  }

  // Loại bàn: bắt buộc, và đủ chỗ cho số khách
  const table = getTableType(tableId);
  if (!table) {
    setFieldError("group-table", "Vui lòng chọn loại bàn.");
    isValid = false;
  } else if (guests > table.capacity && guests <= 20) {
    setFieldError("group-table", table.name + " chỉ chứa tối đa " + table.capacity + " khách, hãy chọn bàn lớn hơn.");
    isValid = false;
  } else {
    setFieldError("group-table", "");
  }

  if (!isValid) return null;

  return {
    name: name, phone: phone, email: email,
    date: date, time: time, guests: guests,
    tableId: tableId, tableName: table.name,
    request: request
  };
}

/* ---------- 6. LƯU VÀ ĐỌC LỊCH ĐẶT BÀN ---------- */
function getBookings() {
  try {
    const data = localStorage.getItem(BOOKINGS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    return [];   // dữ liệu hỏng thì coi như chưa có gì
  }
}

function saveBookings(bookings) {
  localStorage.setItem(BOOKINGS_KEY, JSON.stringify(bookings));
}

/* ---------- 7. XỬ LÝ KHI BẤM "XÁC NHẬN ĐẶT BÀN" ---------- */
function handleBookingSubmit(event) {
  event.preventDefault();   // chặn trình duyệt tải lại trang

  const data = validateBookingForm();
  if (!data) {
    showToast("Vui lòng kiểm tra lại các thông tin bị báo lỗi.", "error");
    return;
  }

  // Tạo đơn đặt bàn với mã mẫu dạng BAN-483920
  const booking = {
    code: makeCode("BAN"),
    createdAt: new Date().toLocaleString("vi-VN"),
    name: data.name, phone: data.phone, email: data.email,
    date: data.date, time: data.time, guests: data.guests,
    tableName: data.tableName, request: data.request
  };

  const bookings = getBookings();
  bookings.push(booking);
  saveBookings(bookings);

  clearFormDraft("oceanSeafoodDraftBooking");
  showBookingSuccess(booking);
  renderMyBookings();
}

/* ---------- 8. HIỂN THỊ THÔNG BÁO THÀNH CÔNG ---------- */
function showBookingSuccess(booking) {
  if (window.fireConfetti) fireConfetti(); 
  const box = document.getElementById("booking-success");

  // Chữ do người dùng nhập phải qua escapeHTML (hàm của main.js)
  box.innerHTML = `
    <div class="success-box">
      <div class="success-icon">✅</div>
      <h3>Đặt bàn thành công!</h3>
      <p>Cảm ơn <strong>${escapeHTML(booking.name)}</strong>, OCEAN SEAFOOD đã ghi nhận yêu cầu của bạn.</p>
      <div>Mã đặt bàn của bạn:<br><span class="order-code">${booking.code}</span></div>
    </div>

    <div class="form-box">
      <h2>Chi tiết đặt bàn</h2>
      <p><strong>Ngày giờ:</strong> ${booking.time}, ngày ${displayDate(booking.date)}</p>
      <p><strong>Số khách:</strong> ${booking.guests} người</p>
      <p><strong>Loại bàn:</strong> ${booking.tableName}</p>
      <p><strong>Người đặt:</strong> ${escapeHTML(booking.name)} - ${escapeHTML(booking.phone)}</p>
      <p><strong>Email:</strong> ${escapeHTML(booking.email)}</p>
      ${booking.request ? "<p><strong>Yêu cầu đặc biệt:</strong> " + escapeHTML(booking.request) + "</p>" : ""}
      <div class="info-box">
        Vui lòng đến đúng giờ và đọc mã đặt bàn cho nhân viên tại quầy.
        Cần thay đổi, liên hệ hotline <strong>${RESTAURANT_INFO.phone}</strong>.
      </div>

      <div style="display:flex; gap:12px; flex-wrap:wrap; margin-top:16px">
        <button class="btn btn-primary" onclick="bookAnother()">Đặt thêm bàn khác</button>
        <a href="menu.html" class="btn btn-outline-blue">Xem thực đơn</a>
        <a href="index.html" class="btn btn-outline-blue">Về trang chủ</a>
      </div>
      <p style="font-size:0.85rem; color:var(--color-text-light); margin-top:12px">
        Đây là đơn đặt bàn mô phỏng phục vụ học tập.
      </p>
    </div>`;

  document.getElementById("booking-layout").style.display = "none";
  box.style.display = "block";
  window.scrollTo({ top: 0, behavior: "smooth" });
  showToast("Đặt bàn thành công! Mã: " + booking.code, "success", 4500);
}

// Quay lại form để đặt bàn khác
function bookAnother() {
  document.getElementById("booking-form").reset();
  prefillFromUser();
  setupFormAutosave("booking-form", "oceanSeafoodDraftBooking");
  document.getElementById("booking-success").style.display = "none";
  document.getElementById("booking-layout").style.display = "grid";
  window.scrollTo({ top: 0, behavior: "smooth" });
}

/* ---------- 9. DANH SÁCH "ĐẶT BÀN CỦA BẠN" ---------- */
function renderMyBookings() {
  const container = document.getElementById("my-bookings");
  if (!container) return;

  // Lấy 5 lượt mới nhất, lượt mới đứng trên
  const latest = getBookings().slice(-5).reverse();

  if (latest.length === 0) {
    container.innerHTML = '<p style="margin-top:10px">Bạn chưa có lượt đặt bàn nào.</p>';
    return;
  }

  container.innerHTML = latest.map(function (booking) {
    return `
      <div style="padding:12px 0; border-bottom:1px dashed var(--color-border)">
        <strong style="color:var(--color-primary)">${booking.code}</strong><br>
        ${booking.time}, ${displayDate(booking.date)}<br>
        ${booking.tableName} · ${booking.guests} khách<br>
        <button class="btn btn-outline-blue btn-sm" style="margin-top:8px"
                onclick="cancelBooking('${booking.code}')">Hủy đặt bàn</button>
      </div>`;
  }).join("");
}

// Hủy một lượt đặt bàn theo mã
function cancelBooking(code) {
  if (!confirm("Bạn chắc chắn muốn hủy lượt đặt bàn " + code + "?")) return;

  const remaining = getBookings().filter(function (booking) {
    return booking.code !== code;
  });
  saveBookings(remaining);
  renderMyBookings();
  showToast("Đã hủy đặt bàn " + code + ".", "info");
}

/* ---------- 10. KHỞI ĐỘNG ---------- */
document.addEventListener("DOMContentLoaded", function () {
  fillTimeOptions();
  fillTableOptions();
  setupDateLimits();
  prefillFromUser();
  renderMyBookings();

  // Hiện số hotline trong khung lưu ý
  const hotline = document.getElementById("hotline-text");
  if (hotline) hotline.textContent = RESTAURANT_INFO.phone;

  document.getElementById("booking-form").addEventListener("submit", handleBookingSubmit);

  // Người dùng sửa lại ô nào thì xóa báo lỗi của ô đó
  ["full-name", "phone", "email", "booking-date", "booking-time", "guests", "table-type"].forEach(function (id) {
    const field = document.getElementById(id);
    const eventName = (field.tagName === "SELECT" || field.type === "date") ? "change" : "input";
    field.addEventListener(eventName, function () {
      const group = field.closest(".form-group");
      if (group) group.classList.remove("error");
    });
  });
});