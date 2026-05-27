// ================= USER INFO =================
const user = JSON.parse(localStorage.getItem("user"));

const navAuth = document.querySelector(".nav-auth");
const ctaButtons = document.querySelector(".hero-cta-wrap");

// ================= NAVBAR LOGIN =================
if (user && navAuth) {
  navAuth.innerHTML = `
    <div class="nav-user">

      <button
        class="assign-history-btn"
        onclick="goAssignments()"
      >
        📋 Bài tập đã giao
      </button>

      ${
        user.loginType === "google"
          ? `
            <img
              src="${user.avatar}"
              class="google-avatar"
              title="${user.full_name}"
              alt="avatar"
            />
          `
          : `
            <div class="user-chip">
              👤 ${user.full_name}
            </div>
          `
      }

      <button
        id="logoutBtn"
        class="logout-btn"
        title="Đăng xuất"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="22"
          height="22"
          fill="none"
          stroke="white"
          stroke-width="2"
          viewBox="0 0 24 24"
        >
          <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
          <polyline points="16 17 21 12 16 7"/>
          <line x1="21" y1="12" x2="9" y2="12"/>
        </svg>
      </button>

    </div>
  `;

  // Ẩn CTA nếu đã login
  if (ctaButtons) {
    ctaButtons.style.display = "none";
  }

  // Logout
  const logoutBtn = document.getElementById("logoutBtn");

  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      window.location.href = "logout.html";
    });
  }
}

// ================= GAME BUTTON =================
document.querySelectorAll(".game-btn").forEach((btn) => {
  btn.addEventListener("click", function (e) {
    const url = this.dataset.url;

    // chưa login
    if (!user) {
      e.preventDefault();

      localStorage.setItem("redirectAfterLogin", url);

      window.location.href = "login.html";
      return;
    }

    // đã login
    window.location.href = url;
  });
});

// ================= AUTO ENABLE VIDEO SOUND =================
(function () {
  const video = document.getElementById("bgVideo");

  if (!video) return;

  function enableSound() {
    video.muted = false;

    video.play().catch(() => {});
  }

  document.addEventListener("mousemove", enableSound, {
    once: true,
  });

  document.addEventListener("click", enableSound, {
    once: true,
  });

  document.addEventListener("touchstart", enableSound, {
    once: true,
  });
})();

// ================= FLOATING PARTICLES =================
const particleContainer = document.querySelector(".floating-particles");

if (particleContainer) {
  for (let i = 0; i < 40; i++) {
    const particle = document.createElement("span");

    particle.style.left = Math.random() * 100 + "vw";

    particle.style.bottom = "-" + Math.random() * 20 + "vh";

    particle.style.animationDuration = 6 + Math.random() * 6 + "s";

    particle.style.animationDelay = Math.random() * 5 + "s";

    const size = 6 + Math.random() * 10;

    particle.style.width = size + "px";
    particle.style.height = size + "px";

    particleContainer.appendChild(particle);
  }
}

// ================= ASSIGNMENTS =================
function goAssignments() {
  const isInsideGames = window.location.pathname.includes("/games/");

  window.location.href = isInsideGames ? "assign.html" : "games/assign.html";
}
