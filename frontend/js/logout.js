// nút hủy
function cancelLogout() {
  window.history.back();
}

// xác nhận logout
function confirmLogout() {
  localStorage.removeItem("user");
  window.location.href = "index.html";
}