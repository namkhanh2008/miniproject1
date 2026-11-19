// =====================================================
// OCEAN SEAFOOD - FILE: js/wishlist.js
// Danh sach yeu thich, luu LocalStorage
// Nap o MOI TRANG co the hien card mon an, truoc the <script> rieng cua trang
// =====================================================

const WISHLIST_KEY = "oceanSeafoodWishlist";

function getWishlist() {
  try {
    const data = localStorage.getItem(WISHLIST_KEY);
    return data ? JSON.parse(data) : [];
  } catch (e) { return []; }
}

function isWishlisted(id) {
  return getWishlist().indexOf(Number(id)) !== -1;
}

function toggleWishlist(id) {
  id = Number(id);
  let list = getWishlist();
  const exists = list.indexOf(id) !== -1;

  if (exists) {
    list = list.filter(function (x) { return x !== id; });
  } else {
    list.push(id);
  }
  localStorage.setItem(WISHLIST_KEY, JSON.stringify(list));

  // Cap nhat tat ca icon trai tim cua mon nay dang hien tren trang (co the co nhieu card trung id)
  document.querySelectorAll('.wishlist-btn[data-id="' + id + '"]').forEach(function (btn) {
    btn.classList.toggle("wishlist-active", !exists);
    btn.textContent = !exists ? "❤️" : "🤍";
  });

  if (typeof showToast === "function") {
    showToast(exists ? "Đã bỏ khỏi yêu thích." : "Đã thêm vào yêu thích!", exists ? "info" : "success");
  }
}

function renderWishlistPage() {
  const box = document.getElementById("wishlist-list");
  if (!box) return;   // khong phai trang wishlist.html

  const ids = getWishlist();
  const products = ids.map(getProductById).filter(Boolean);

  if (products.length === 0) {
    box.innerHTML = `
      <div class="empty-state">
        <div class="empty-icon">🤍</div>
        <p>Bạn chưa thích món nào.</p>
        <a href="menu.html" class="btn btn-primary" style="margin-top:16px">Khám phá thực đơn</a>
      </div>`;
    return;
  }
  box.innerHTML = products.map(createProductCard).join("");
}

document.addEventListener("DOMContentLoaded", renderWishlistPage);