// ===== NAVIGATION =====
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

  home.classList.remove("bg-gradient-to-r","from-blue-500","to-purple-500","text-white");
  create.classList.remove("bg-gradient-to-r","from-blue-500","to-purple-500","text-white");

  if (type === "home") {
    home.classList.add("bg-gradient-to-r","from-blue-500","to-purple-500","text-white");
  } else {
    create.classList.add("bg-gradient-to-r","from-blue-500","to-purple-500","text-white");
  }
}

// ===== PLAYER INPUT =====
const playerSelect = document.getElementById("playerCount");
const playerInputs = document.getElementById("playerInputs");

function renderPlayers(count) {
  if (!playerInputs) return;

  playerInputs.innerHTML = "";
  const icons = ["👤","🐸","🐱","🐶","🦊","🐼","🐵","🐯"];

  for (let i = 1; i <= count; i++) {
    const input = document.createElement("input");
    input.className = "w-full p-3 border rounded-xl";
    input.placeholder = `${icons[i-1]} Người ${i}`;
    playerInputs.appendChild(input);
  }
}

playerSelect?.addEventListener("change", (e) => {
  renderPlayers(parseInt(e.target.value));
});

let selectedMusic = null;

function setupMusicButtons() {
  const musicBtns = document.querySelectorAll(".music-btn");

  musicBtns.forEach(btn => {
    btn.addEventListener("click", () => {

      selectedMusic = btn.dataset.src;

      musicBtns.forEach(b => {
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
    slider.oninput = () => value.innerText = slider.value;
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
  document.querySelectorAll("#playerInputs input").forEach(input => {
    players.push(input.value || "Người chơi");
  });

  const obstacles = document.getElementById("slider").value;
  const activeBtn = document.querySelector(".music-btn.bg-green-500");

  const selectedMusicFinal = activeBtn
    ? activeBtn.dataset.src
    : "../assets/sounds/bai1.mp3";

  const games = JSON.parse(localStorage.getItem("games")) || [];

  const newGame = {
    id: Date.now(),
    title,
    players,
    obstacles,
    music: selectedMusicFinal
  };

  games.push(newGame);
  localStorage.setItem("games", JSON.stringify(games));

  alert("Lưu thành công!");
  goHome();
}

function renderGames() {
  const container = document.querySelector("#page-list .bg-white");
  if (!container) return;

  let games = JSON.parse(localStorage.getItem("games")) || [];

  if (games.length === 0) {
    container.innerHTML = `
      <div class="text-center py-20">
        <h2 class="text-xl font-semibold mb-4">Chưa có bài chơi nào</h2>
        <button onclick="goCreate()" class="bg-green-500 text-white px-5 py-2 rounded-xl">
          ➕ Tạo bài đầu tiên
        </button>
      </div>
    `;
    return;
  }

  let html = `
    <div class="mb-6">
      <h1 class="text-2xl font-bold mb-2">🎲 Bài chơi của tôi</h1>
      <p class="text-gray-500">Quản lý các bài Game theo Lượt đã tạo</p>
    </div>
  `;

  games.forEach(game => {
    html += `
      <div class="border rounded-xl p-4 mb-4 shadow hover:shadow-md transition">
        <h3 class="font-bold text-lg">${game.title}</h3>

        <div class="text-sm text-gray-500 mb-2">
          ${game.players.length} người chơi • ${game.obstacles} chướng ngại
        </div>

        <div class="flex gap-3 mt-2">
          <button onclick="playGame(${game.id})"
            class="text-green-600 font-semibold">▶ CHƠI</button>

          <button onclick="deleteGame(${game.id})"
            class="text-red-500">🗑 Xóa</button>
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
}

// ===== PLAY =====
function playGame(id) {
  window.location.href = `/frontend/games/play.html?id=${id}`;
}

// ===== DELETE =====
function deleteGame(id) {
  let games = JSON.parse(localStorage.getItem("games")) || [];
  games = games.filter(g => g.id !== id);
  localStorage.setItem("games", JSON.stringify(games));
  renderGames();
}