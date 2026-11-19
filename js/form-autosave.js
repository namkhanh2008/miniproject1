// =====================================================
// OCEAN SEAFOOD - FILE: js/form-autosave.js
// Tu luu nhap form vao LocalStorage, khoi phuc khi mo lai.
// KHONG BAO GIO luu o mat khau (ly do bao mat).
// Goi: setupFormAutosave("ten-form-id", "ten-khoa-luu")
// Xoa nhap sau khi gui thanh cong: clearFormDraft("ten-khoa-luu")
// =====================================================

function setupFormAutosave(formId, storageKey) {
  const form = document.getElementById(formId);
  if (!form) return;

  const textFields = form.querySelectorAll(
    'input:not([type="password"]):not([type="radio"]):not([type="checkbox"]), textarea'
  );
  const radioFields = form.querySelectorAll('input[type="radio"]');

  function loadDraft() {
    try { return JSON.parse(localStorage.getItem(storageKey)) || {}; }
    catch (e) { return {}; }
  }

  function saveDraft() {
    const data = {};
    textFields.forEach(function (field) {
      if (field.id) data[field.id] = field.value;
    });
    radioFields.forEach(function (radio) {
      if (radio.checked) data["radio_" + radio.name] = radio.value;
    });
    localStorage.setItem(storageKey, JSON.stringify(data));
  }

  function restoreDraft() {
    const data = loadDraft();
    // Chỉ điền vào ô ĐANG TRỐNG, để không ghi đè dữ liệu đã tự điền sẵn (ví dụ từ tài khoản đăng nhập)
    textFields.forEach(function (field) {
      if (field.id && data[field.id] && !field.value) field.value = data[field.id];
    });
    Object.keys(data).forEach(function (key) {
      if (key.indexOf("radio_") === 0) {
        const name = key.slice(6);
        const radio = form.querySelector('input[type="radio"][name="' + name + '"][value="' + data[key] + '"]');
        if (radio) radio.checked = true;
      }
    });
  }

  restoreDraft();
  textFields.forEach(function (field) { field.addEventListener("input", saveDraft); });
  radioFields.forEach(function (radio) { radio.addEventListener("change", saveDraft); });
}

function clearFormDraft(storageKey) {
  localStorage.removeItem(storageKey);
}