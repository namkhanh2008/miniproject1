// =====================================================
// OCEAN SEAFOOD - FILE: js/qr-widget.js
// Nut noi + modal hien ma QR dan toi trang Dat ban
// Dung thu vien qrcodejs (CDN) - khong can npm/build
// =====================================================

(function () {
  function buildWidget() {
    if (document.getElementById("qr-fab")) return;

    var fab = document.createElement("button");
    fab.type = "button";
    fab.id = "qr-fab";
    fab.className = "qr-fab";
    fab.innerHTML = "📱";
    fab.setAttribute("aria-label", "Mã QR đặt bàn nhanh");
    document.body.appendChild(fab);

    var modal = document.createElement("div");
    modal.className = "qr-modal";
    modal.id = "qr-modal";
    modal.innerHTML =
      '<div class="qr-modal-box">' +
        '<button type="button" class="qr-modal-close" id="qr-modal-close" aria-label="Đóng">✕</button>' +
        "<h3>Đặt bàn nhanh qua điện thoại</h3>" +
        '<p>Quét mã QR bên dưới để mở trang Đặt bàn ngay trên di động.</p>' +
        '<div id="qr-code-box"></div>' +
      "</div>";
    document.body.appendChild(modal);

    fab.addEventListener("click", function () {
      modal.classList.add("qr-modal-open");

      var box = document.getElementById("qr-code-box");
      if (!box.dataset.rendered) {
       box.innerHTML = '<img src="images/my-qr.png" alt="Mã QR đặt bàn" style="width:180px;height:180px;object-fit:contain;border-radius:8px">';
       box.dataset.rendered = "1";
    }
    });

    document.getElementById("qr-modal-close").addEventListener("click", function () {
      modal.classList.remove("qr-modal-open");
    });
    modal.addEventListener("click", function (e) {
      if (e.target === modal) modal.classList.remove("qr-modal-open");
    });
  }

  document.addEventListener("DOMContentLoaded", buildWidget);
})();