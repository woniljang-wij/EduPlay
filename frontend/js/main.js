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

  document.getElementById("logoutBtn").addEventListener("click", () => {
    window.location.href = "logout.html";
  });
}

document.querySelectorAll(".game-btn").forEach((btn) => {
  btn.addEventListener("click", function (e) {
    const user = localStorage.getItem("user");
    const url = this.dataset.url;

    if (!user) {
      e.preventDefault();

      localStorage.setItem("redirectAfterLogin", url);
      window.location.href = "login.html";
    } else {
      window.location.href = url;
    }
  });
});

function confirmLogout() {
  localStorage.removeItem("user");

  setTimeout(() => {
    window.location.href = "index.html";
  }, 300);
}

// ===== AUTO ENABLE SOUND =====
(function () {
  const video = document.getElementById("bgVideo");

  if (!video) return;

  function enableSound() {
    video.muted = false;
    video.volume = 1;

    video.play().catch(() => {});
  }

  document.addEventListener("mousemove", enableSound, { once: true });
  document.addEventListener("click", enableSound, { once: true });
  document.addEventListener("touchstart", enableSound, { once: true });
})();


const container = document.querySelector(".floating-particles");

for (let i = 0; i < 40; i++) {
  const particle = document.createElement("span");

  particle.style.left = Math.random() * 100 + "vw";
  particle.style.bottom = "-" + Math.random() * 20 + "vh";

  particle.style.animationDuration = 6 + Math.random() * 6 + "s";
  particle.style.animationDelay = Math.random() * 5 + "s";

  particle.style.width = particle.style.height =
    6 + Math.random() * 10 + "px";

  container.appendChild(particle);
}