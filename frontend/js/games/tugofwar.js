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
      playMusic(src);
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

// ===== UPLOAD MUSIC =====
document.getElementById("uploadBtn").onclick = () => {
  document.getElementById("musicUpload").click();
};

document.getElementById("musicUpload").addEventListener("change", function (e) {
  const file = e.target.files[0];
  if (!file || !file.type.startsWith("audio/")) return;

  const url = URL.createObjectURL(file);

  const btn = document.createElement("button");
  btn.className = "music-btn";
  btn.textContent = file.name;
  btn.dataset.src = url;

  btn.onclick = () => {
    playMusic(url);
    setActiveMusicButton(btn);
  };

  document.getElementById("musicList").appendChild(btn);
  btn.click();
});

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
