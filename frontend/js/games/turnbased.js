// ===== NAVIGATION =====
let editingId = null;

function goCreate() {
  history.pushState({}, "", "/frontend/games/turnbased.html?mode=edit");
  document.getElementById("page-list").classList.add("hidden");
  document.getElementById("page-create").classList.remove("hidden");
  setActive("create");
}

function goHome() {
  history.pushState({}, "", "/frontend/games/turnbased.html");
  document.getElementById("page-create").classList.add("hidden");
  document.getElementById("page-list").classList.remove("hidden");
  setActive("home");
  renderGames();
}

function setActive(type) {
  const home = document.getElementById("btn-home");
  const create = document.getElementById("btn-create");

  home.classList.remove(
    "bg-gradient-to-r",
    "from-blue-500",
    "to-purple-500",
    "text-white",
  );
  create.classList.remove(
    "bg-gradient-to-r",
    "from-blue-500",
    "to-purple-500",
    "text-white",
  );

  if (type === "home") {
    home.classList.add(
      "bg-gradient-to-r",
      "from-blue-500",
      "to-purple-500",
      "text-white",
    );
  } else {
    create.classList.add(
      "bg-gradient-to-r",
      "from-blue-500",
      "to-purple-500",
      "text-white",
    );
  }
}

// ===== PLAYER INPUT =====
const playerSelect = document.getElementById("playerCount");
const playerInputs = document.getElementById("playerInputs");

function renderPlayers(count) {
  if (!playerInputs) return;

  playerInputs.innerHTML = "";
  const icons = ["👤", "🐸", "🐱", "🐶", "🦊", "🐼", "🐵", "🐯"];

  for (let i = 1; i <= count; i++) {
    const input = document.createElement("input");
    input.className = "w-full p-3 border rounded-xl";
    input.placeholder = `${icons[i - 1]} Người ${i}`;
    playerInputs.appendChild(input);
  }
}

playerSelect?.addEventListener("change", (e) => {
  renderPlayers(parseInt(e.target.value));
});

let selectedMusic = null;

function setupMusicButtons() {
  const musicBtns = document.querySelectorAll(".music-btn");

  musicBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      selectedMusic = btn.dataset.src;

      musicBtns.forEach((b) => {
        b.classList.remove("bg-green-500", "text-white");
      });

      btn.classList.add("bg-green-500", "text-white");
    });
  });
}

// ===== LOAD STATE =====
window.onload = () => {
  if (location.search.includes("mode=edit")) goCreate();
  else goHome();

  const slider = document.getElementById("slider");
  const value = document.getElementById("value");

  if (slider) {
    slider.oninput = () => (value.innerText = slider.value);
  }

  if (playerSelect) {
    renderPlayers(parseInt(playerSelect.value));
  }

  setupMusicButtons();
  const firstBtn = document.querySelector(".music-btn");
  if (firstBtn) {
    selectedMusic = firstBtn.dataset.src;
    firstBtn.classList.add("bg-green-500", "text-white");
  }

  renderGames();
};

window.onpopstate = () => {
  if (location.search.includes("mode=edit")) goCreate();
  else goHome();
};

// ===== SAVE GAME =====
function saveGame() {
  const titleInput = document.querySelector("#page-create input");
  const title = titleInput ? titleInput.value : "Game mới";

  const players = [];
  document.querySelectorAll("#playerInputs input").forEach((input) => {
    players.push(input.value || "Người chơi");
  });

  const obstacles = document.getElementById("slider").value;

  const activeBtn = document.querySelector(".music-btn.bg-green-500");
  const selectedMusicFinal = activeBtn
    ? activeBtn.dataset.src
    : "../assets/sounds/bai1.mp3";

  let games = JSON.parse(localStorage.getItem("games")) || [];

  // ===== EDIT MODE =====
  if (editingId) {
    const index = games.findIndex((g) => g.id === editingId);

    if (index !== -1) {
      games[index] = {
        ...games[index],
        title,
        players,
        obstacles,
        music: selectedMusicFinal,
      };
    }

    editingId = null;
    alert("Cập nhật thành công!");
  }

  // ===== CREATE MODE =====
  else {
    const newGame = {
      id: Date.now(),
      title,
      players,
      obstacles,
      music: selectedMusicFinal,
    };

    games.push(newGame);
    alert("Lưu thành công!");
  }

  localStorage.setItem("games", JSON.stringify(games));

  goHome();
  renderGames();
}

function renderGames() {
  const container = document.getElementById("gameList");
  if (!container) return;

  let games = JSON.parse(localStorage.getItem("games")) || [];

  // ✅ GRID LAYOUT
  container.className = "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6";

  // ===== EMPTY =====
  if (games.length === 0) {
    container.innerHTML = `
      <div class="col-span-full text-center py-20">
        <h2 class="text-xl font-semibold mb-4">Chưa có bài chơi nào</h2>
        <button onclick="goCreate()" class="bg-green-500 text-white px-5 py-2 rounded-xl">
          ➕ Tạo bài đầu tiên
        </button>
      </div>
    `;
    return;
  }

  let html = "";

  games.forEach((game) => {
    html += `
  <div class="w-80">
    <div class="bg-white rounded-2xl p-5 shadow border">

      <!-- HEADER -->
      <div class="flex justify-between items-start mb-3">
        <h3 class="font-bold text-lg">${game.title}</h3>
        <span class="text-pink-500">📍</span>
      </div>

      <!-- TAG -->
      <div class="flex gap-2 mb-4 text-sm">
        <span class="bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
          ${game.players.length} người chơi
        </span>

        <span class="bg-green-100 text-green-700 px-3 py-1 rounded-full">
          1 câu hỏi
        </span>
      </div>

      <!-- 🎮 BUTTON CHÍNH -->
      <div class="flex gap-3 mb-4">

        <!-- CHƠI -->
        <button onclick="playGame(${game.id})"
          class="flex-1 bg-gradient-to-r from-green-400 to-emerald-500 text-white py-3 rounded-xl font-semibold shadow">
          ▶ Chơi
        </button>

        <!-- GIAO -->
        <button onclick="openAssign(${game.id})"
          class="px-4 py-2 border rounded-xl text-purple-600 hover:bg-purple-50">
          📋 Giao
        </button>

      </div>

       <!-- ACTION -->
        <div class="flex gap-5 text-sm font-medium">
          <button onclick="editGame(${game.id})"
             class="text-orange-500 hover:underline">
             ✏️ Sửa
          </button>

        <button class="text-blue-500">
          🔗 Chia sẻ
        </button>

        <button onclick="deleteGame(${game.id})" class="text-red-500">
          🗑 Xóa
        </button>

      </div>

    </div>
  </div>
`;
  });

  container.innerHTML = html;
}

function editGame(id) {
  const games = JSON.parse(localStorage.getItem("games")) || [];
  const game = games.find((g) => g.id === id);

  if (!game) return;

  // lưu trạng thái đang edit
  editingId = id;

  // chuyển sang page create
  goCreate();

  // fill dữ liệu vào form
  document.querySelector("input[placeholder='Tiêu đề bài chơi']").value =
    game.title;

  document.getElementById("playerCount").value = game.players.length;

  // render lại input player
  renderPlayerInputs(game.players.length);

  // gán tên player
  setTimeout(() => {
    const inputs = document.querySelectorAll("#playerInputs input");
    inputs.forEach((input, index) => {
      input.value = game.players[index] || "";
    });
  }, 50);

  // slider
  document.getElementById("slider").value = game.obstacles;
  document.getElementById("value").innerText = game.obstacles;
}

function openAssign(gameId) {
  const games = JSON.parse(localStorage.getItem("games")) || [];
  const game = games.find((g) => g.id === gameId);

  if (!game) return;

  document.getElementById("assignTitle").innerText = game.title;

  const modal = document.getElementById("assignModal");
  modal.classList.remove("hidden");
  modal.classList.add("flex");
}

function closeAssign() {
  const modal = document.getElementById("assignModal");
  modal.classList.add("hidden");
  modal.classList.remove("flex");
}

// ===== PLAY =====
function playGame(id) {
  window.location.href = `/frontend/games/play.html?id=${id}`;
}

// ===== DELETE =====
function deleteGame(id) {
  let games = JSON.parse(localStorage.getItem("games")) || [];
  games = games.filter((g) => g.id !== id);
  localStorage.setItem("games", JSON.stringify(games));
  renderGames();
}
