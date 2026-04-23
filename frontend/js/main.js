// ================= USER INFO =================
const user = JSON.parse(localStorage.getItem("user"));

const navAuth = document.querySelector(".nav-auth");
const ctaButtons = document.querySelector(".cta-buttons");

// nếu đã login → đổi navbar
if (user && navAuth) {
  navAuth.innerHTML = `
  <div class="nav-user">

    <div class="user-chip">
      👤 ${user.full_name}
    </div>

 <button id="logoutBtn" class="logout-btn" title="Đăng xuất">
  <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" fill="none" stroke="white" stroke-width="2" viewBox="0 0 24 24">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
    <polyline points="16 17 21 12 16 7"/>
    <line x1="21" y1="12" x2="9" y2="12"/>
  </svg>
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
