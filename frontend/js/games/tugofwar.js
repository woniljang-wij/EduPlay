let tempQuestions = [];
let editingId = null;
let deletedGame = null;
let undoTimer = null;

// ===== NAV =====
function goIndex() {
  document.activeElement.blur();
  window.location.href = "../index.html";
}

function goHome() {
  document.activeElement.blur();

  document.getElementById("page-list").classList.remove("hidden");
  document.getElementById("page-create").classList.add("hidden");

  setActive("btn-home");
  renderGames();
}

function goCreate(isEdit = false) {
  document.activeElement.blur();

  document.getElementById("page-create").classList.remove("hidden");
  document.getElementById("page-list").classList.add("hidden");

  setActive("btn-create");

  if (!isEdit) {
    editingId = null;
    tempQuestions = [];

    document.querySelector("input[placeholder='Nhập tiêu đề...']").value = "";

    renderQuestionPreview();
    updateQuestionCount();
  }
}

// ===== ACTIVE =====
function setActive(id) {
  document.querySelectorAll("#btn-home, #btn-create").forEach((btn) => {
    btn.classList.remove(
      "bg-gradient-to-r",
      "from-pink-500",
      "via-red-500",
      "to-purple-600",
      "text-white",
      "shadow-lg",
      "scale-105",
    );
  });

  document
    .getElementById(id)
    .classList.add(
      "bg-gradient-to-r",
      "from-pink-500",
      "via-red-500",
      "to-purple-600",
      "text-white",
      "shadow-lg",
      "scale-105",
    );
}

// ===== MUSIC =====
let currentAudio = new Audio();

function bindMusicButtons() {
  document.querySelectorAll(".music-btn").forEach((btn) => {
    btn.onclick = () => {
      const src = btn.dataset.src;

      currentAudio.pause();

      document
        .querySelectorAll(".music-btn[data-custom='true'] span:first-child")
        .forEach((el) => (el.innerHTML = "▶"));

      currentBtn = null;
      currentControl = null;

      if (btn.dataset.custom === "true") {
        currentAudio = new Audio(src);
        currentAudio.loop = true;
        currentAudio.volume = 0.7;
        currentAudio.play().catch(() => {});

        const control = btn.querySelector("span");
        if (control) control.innerHTML = "⏸";

        currentBtn = btn;
        currentControl = control;
      }

      setActiveMusicButton(btn);
    };
  });
}

function playMusic(src) {
  if (currentAudio) currentAudio.pause();

  currentAudio = new Audio(src);
  currentAudio.loop = true;
  currentAudio.volume = 0.7;
  currentAudio.play().catch(() => {});
}

function setActiveMusicButton(activeBtn) {
  document.querySelectorAll(".music-btn").forEach((btn) => {
    btn.classList.remove("active");
  });

  if (activeBtn) activeBtn.classList.add("active");
}

// ===== MUSIC SYSTEM =====
let currentControl = null;
let currentBtn = null;

let deletedMusic = null;
let undoMusicTimer = null;

document.getElementById("uploadBtn").onclick = () => {
  document.getElementById("musicUpload").click();
};

document.getElementById("musicUpload").addEventListener("change", function (e) {
  const file = e.target.files[0];
  if (!file) return;

  if (!file.type.startsWith("audio/")) {
    showToast("❌ Chỉ chấp nhận file âm thanh!", "error");
    return;
  }

  const MAX_SIZE = 20 * 1024 * 1024;
  if (file.size > MAX_SIZE) {
    showToast("⚠️ File quá lớn! Tối đa 20MB", "error");
    return;
  }

  const existed = [...document.querySelectorAll(".music-btn")].some(
    (btn) => btn.dataset.name === file.name,
  );

  if (existed) {
    showToast("⚠️ Nhạc này đã tồn tại!", "info");
    return;
  }

  const url = URL.createObjectURL(file);

  // ===== BUTTON =====
  const btn = document.createElement("button");
  btn.type = "button";
  btn.className = `
    music-btn inline-flex items-center gap-2
    px-4 py-2 rounded-full
    border border-gray-300
    bg-white text-gray-700
    hover:bg-gray-100
    transition-all text-sm
  `;

  btn.dataset.src = url;
  btn.dataset.name = file.name;
  btn.dataset.custom = "true";

  // ===== ICON PLAY =====
  const control = document.createElement("span");
  control.innerHTML = "▶";
  control.className = "text-green-500 text-xs cursor-pointer";

  control.onclick = (ev) => {
    ev.stopPropagation();

    document
      .querySelectorAll(".music-btn span:first-child")
      .forEach((el) => (el.innerHTML = "▶"));

    if (currentBtn === btn) {
      currentAudio.pause();

      document
        .querySelectorAll(".music-btn[data-custom='true'] span:first-child")
        .forEach((el) => (el.innerHTML = "▶"));

      currentBtn = null;
      currentControl = null;
      return;
    }

    currentAudio.pause();

    currentAudio = new Audio(url);
    currentAudio.loop = true;
    currentAudio.volume = 0.7;
    currentAudio.play().catch(() => {});

    control.innerHTML = "⏸";

    currentBtn = btn;
    currentControl = control;
  };

  const name = document.createElement("span");
  name.textContent = file.name;

  const deleteBtn = document.createElement("span");
  deleteBtn.innerHTML = "✖";
  deleteBtn.className = "text-red-400 text-xs cursor-pointer";

  deleteBtn.onclick = (ev) => {
    ev.stopPropagation();

    const parent = btn.parentElement;

    deletedMusic = {
      element: btn,
      parent: parent,
      url: url,
    };

    currentAudio.pause();

    btn.remove();

    showUndoToast("🗑 Đã xóa nhạc", () => undoDeleteMusic(), 5000);

    clearTimeout(undoMusicTimer);
    undoMusicTimer = setTimeout(() => {
      if (deletedMusic?.url) URL.revokeObjectURL(deletedMusic.url);
      deletedMusic = null;
    }, 5000);
  };

  // ===== SELECT =====
  btn.onclick = () => {
    if (btn.dataset.custom !== "true") {
      setActiveMusicButton(btn);
      return;
    }

    setActiveMusicButton(btn);

    document
      .querySelectorAll(".music-btn[data-custom='true'] span:first-child")
      .forEach((el) => (el.innerHTML = "▶"));

    currentAudio.pause();

    currentAudio = new Audio(url);
    currentAudio.loop = true;
    currentAudio.volume = 0.7;
    currentAudio.play().catch(() => {});

    control.innerHTML = "⏸";

    currentBtn = btn;
    currentControl = control;
  };

  btn.appendChild(control);
  btn.appendChild(name);
  btn.appendChild(deleteBtn);

  document.getElementById("musicList").appendChild(btn);

  // 🔥 AUTO ACTIVE NGAY
  setActiveMusicButton(btn);

  const sizeMB = (file.size / (1024 * 1024)).toFixed(2);
  showToast(`🎵 ${file.name} (${sizeMB}MB)`, "success");

  e.target.value = "";
});

function undoDeleteMusic() {
  if (!deletedMusic) return;

  deletedMusic.parent.appendChild(deletedMusic.element);
  showToast("↩ Đã khôi phục", "success");

  deletedMusic = null;
}

// ===== SAVE GAME =====
function saveGame() {
  const title =
    document.querySelector("input[placeholder='Nhập tiêu đề...']")?.value ||
    "Chưa đặt tên";

  const inputs = document.querySelectorAll(".input-ui");

  const duration = inputs[1]?.value || "60";
  const freeze = inputs[3]?.value || "3";

  const team1 = inputs[4]?.value || "Đội Xanh";
  const team2 = inputs[5]?.value || "Đội Đỏ";

  const musicBtn = document.querySelector(".music-btn.active");
  const music = musicBtn?.dataset.src || null;

  const mode =
    document.querySelector("input[name='mode']:checked")?.parentElement
      .innerText || "default";

  let games = JSON.parse(localStorage.getItem("tugofwarGames")) || [];

  if (editingId) {
    const index = games.findIndex((g) => g.id === editingId);

    if (index !== -1) {
      games[index] = {
        ...games[index],
        title,
        duration,
        freeze,
        players: [team1, team2],
        mode,
        music,
        questions: tempQuestions,
      };
    }

    editingId = null;
    showToast("✅ Đã cập nhật!", "success");
  } else {
    const game = {
      id: Date.now(),
      title,
      duration,
      freeze,
      players: [team1, team2],
      mode,
      music,
      questions: tempQuestions || [],
    };

    games.push(game);
    showToast("🎉 Đã lưu!", "success");
  }

  localStorage.setItem("tugofwarGames", JSON.stringify(games));
  goHome();
}

// ===== RENDER =====
function renderGames() {
  const container = document.getElementById("gameList");
  if (!container) return;

  let games = JSON.parse(localStorage.getItem("tugofwarGames")) || [];

  container.className = "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6";

  // ===== EMPTY =====
  if (games.length === 0) {
    container.innerHTML = `
      <div class="col-span-full text-center py-20">
        <div class="text-5xl mb-3">🪢</div>
        <h2 class="text-xl font-semibold mb-3">Chưa có bài chơi nào</h2>

       <button onclick="goCreate()"
        class="px-6 py-3 rounded-xl text-white font-semibold 
        bg-gradient-to-r from-pink-500 via-red-500 to-purple-600 
        shadow-lg hover:scale-105 transition">
        ➕ Tạo bài đầu tiên
       </button>
      </div>
    `;
    return;
  }

  let html = "";

  games.forEach((g) => {
    html += `
    <div class="w-80 relative">

      <!-- PIN -->
      <div class="absolute top-2 right-2 text-pink-500">
        📍
      </div>

      <div class="bg-white/80 backdrop-blur rounded-2xl p-5 shadow-lg hover:scale-105 transition">

        <h3 class="font-bold text-lg mb-2">${g.title}</h3>

        <div class="flex gap-2 mb-4 text-sm flex-wrap">
          <span class="bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
            👥 ${g.players.length} đội
          </span>

          <span class="bg-green-100 text-green-700 px-3 py-1 rounded-full">
            🧠 ${g.questions?.length || 0} câu
          </span>
        </div>

        <div class="flex gap-3 mb-4">
          <button onclick="playGame(${g.id})"
            class="flex-1 bg-green-500 text-white py-2 rounded-xl">
            ▶ Chơi
          </button>

          <button onclick="fakeFeature('📋 Giao')"
            class="px-3 py-2 border rounded-xl">
            📋
          </button>
        </div>

        <div class="flex gap-4 text-sm flex-wrap">

          <button onclick="editGame(${g.id})" class="text-orange-500">
            ✏️ Sửa
          </button>

          <button onclick="fakeFeature('🔗 Chia sẻ')" class="text-blue-500">
            🔗 Chia sẻ
          </button>

          <button onclick="deleteGame(${g.id})" class="text-red-500">
            🗑 Xóa
          </button>

        </div>

      </div>
    </div>
    `;
  });

  container.innerHTML = html;
}

// ===== FAKE FEATURE =====
function fakeFeature(name) {
  showToast(name + " (đang phát triển)", "info");
}

// ===== EDIT =====
function editGame(id) {
  const games = JSON.parse(localStorage.getItem("tugofwarGames")) || [];
  const game = games.find((g) => g.id === id);
  if (!game) return;

  editingId = id;
  goCreate(true);

  document.querySelector("input[placeholder='Nhập tiêu đề...']").value =
    game.title;

  tempQuestions = game.questions || [];

  renderQuestionPreview();
  updateQuestionCount();
}

// ===== DELETE =====
function deleteGame(id) {
  let games = JSON.parse(localStorage.getItem("tugofwarGames")) || [];
  const game = games.find((g) => g.id === id);
  if (!game) return;

  deletedGame = game;

  games = games.filter((g) => g.id !== id);
  localStorage.setItem("tugofwarGames", JSON.stringify(games));

  renderGames();

  showUndoToast("🗑 Đã xóa", () => undoDelete(), 4000);

  clearTimeout(undoTimer);
  undoTimer = setTimeout(() => {
    deletedGame = null;
  }, 4000);
}

function undoDelete() {
  if (!deletedGame) return;

  let games = JSON.parse(localStorage.getItem("tugofwarGames")) || [];

  games.push(deletedGame);
  localStorage.setItem("tugofwarGames", JSON.stringify(games));

  renderGames();
  showToast("↩ Đã khôi phục!", "success");

  deletedGame = null;
}

// ===== PLAY =====
function playGame(id) {
  window.location.href = `/frontend/games/play_tugofwar.html?id=${id}`;
}

// ===== INIT =====
window.onload = () => {
  goHome();
  bindMusicButtons();
};
