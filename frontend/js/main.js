// ================= USER INFO =================
const user = JSON.parse(localStorage.getItem("user"));

const navAuth = document.querySelector(".nav-auth");
const ctaButtons = document.querySelector(".cta-buttons");

// nếu đã login → đổi navbar
if (user && navAuth) {
  navAuth.innerHTML = `
        <div style="display:flex; gap:10px; align-items:center;">
            <span style="background:#d1fae5; padding:8px 16px; border-radius:20px; font-weight:bold;">
                Xin chào, ${user.full_name}
            </span>

            <button id="logoutBtn"
                style="background:#fee2e2; padding:8px 16px; border-radius:20px; font-weight:bold;">
                Đăng xuất
            </button>
        </div>
    `;

  if (ctaButtons) {
    ctaButtons.style.display = "none";
  }

  // logout
  document.getElementById("logoutBtn").addEventListener("click", () => {
    window.location.href = "logout.html";
  });
}

// ================= GAME AUTH =================

// 👉 intercept tất cả card game
document.querySelectorAll(".require-login").forEach((card) => {
  card.addEventListener("click", function (e) {
    const user = localStorage.getItem("user");

    if (!user) {
      e.preventDefault(); // chặn link

      const url = this.getAttribute("href");

      // lưu lại trang muốn vào
      localStorage.setItem("redirectAfterLogin", url);

      // chuyển login
      window.location.href = "login.html";
    }
  });
});

function confirmLogout() {
  localStorage.removeItem("user");

  setTimeout(() => {
    window.location.href = "index.html";
  }, 300);
}