// ===== LOAD GAME =====
const params = new URLSearchParams(window.location.search);
const id = Number(params.get("id"));

const games = JSON.parse(localStorage.getItem("games")) || [];
const game = games.find(g => g.id === id);

const gameInfo = document.getElementById("gameInfo");
const dice = document.getElementById("dice");
const playerList = document.getElementById("playerList");
const playerLayer = document.getElementById("playerLayer");
const cellLayer = document.getElementById("cellLayer");

// ===== STATE =====
let positions = [];
let currentPlayer = 0;

// 🔥 ICON PLAYER
const playerIcons = ["🧍", "🐸", "🐱", "🐶", "🦊", "🐼", "🐵", "🐯"]

const path = [];

const cols = 10;
const rows = 5;

for (let row = 0; row < rows; row++) {
  for (let col = 0; col < cols; col++) {

    let realCol = row % 2 === 0 ? col : cols - 1 - col;

    path.push({
      col: realCol,
      row: row
    });
  }
}

// ===== INIT =====
if (game) {
  positions = new Array(game.players.length).fill(0);

  updateInfo();
  renderCells();
  renderPlayers();
  renderPlayersOnMap();
} else {
  gameInfo.innerHTML = "Không tìm thấy game ❌";
}

// ===== INFO =====
function updateInfo() {
  gameInfo.innerHTML = `
    <h2 class="text-xl font-bold mb-2">${game.title}</h2>
    <p class="mb-1">👥 ${game.players.join(", ")}</p>
    <p>🚧 ${game.obstacles} chướng ngại</p>
    <p class="mt-2 font-semibold text-blue-600">
      👉 Lượt: ${game.players[currentPlayer]}
    </p>
  `;
}

// ===== CELLS =====
function renderCells() {
  cellLayer.innerHTML = "";
  const rect = cellLayer.getBoundingClientRect();

  const cols = 10;
  const rows = 5;

  const cellWidth = rect.width / cols;
  const cellHeight = rect.height / rows;

  path.forEach((p, index) => {

    const x = p.col * cellWidth + cellWidth / 2;
    const y = p.row * cellHeight + cellHeight / 2;

    const cell = document.createElement("div");

    cell.className = `
      absolute w-12 h-12
      bg-white/80 border rounded-xl
      flex items-center justify-center
      text-sm font-bold shadow
    `;

    cell.style.left = (x - 24) + "px";
    cell.style.top  = (y - 24) + "px";

    // 🚩 START & 🏁 END
    if (index === 0) {
      cell.innerText = "🚩";
    } else if (index === path.length - 1) {
      cell.innerText = "🏁";
    } else {
      cell.innerText = index;
    }

    cellLayer.appendChild(cell);
  });
}

// ===== PLAYER =====
function renderPlayersOnMap() {
  playerLayer.innerHTML = "";
  const rect = playerLayer.getBoundingClientRect();

  const cols = 10;
  const rows = 5;

  const cellWidth = rect.width / cols;
  const cellHeight = rect.height / rows;

  positions.forEach((pos, i) => {
    const p = path[pos];
    if (!p) return;

    const x = p.col * cellWidth + cellWidth / 2;
    const y = p.row * cellHeight + cellHeight / 2;

    const el = document.createElement("div");

    el.className = "absolute text-2xl transition-all duration-300";

    // tránh chồng
    el.style.left = (x - 12 + i * 10) + "px";
    el.style.top  = (y - 12 + i * 5) + "px";
    
    el.innerText = playerIcons[i];

    playerLayer.appendChild(el);
  });
}

// ===== PLAYER LIST =====
function renderPlayers() {
  playerList.innerHTML = game.players.map((p, i) => `
    <div class="
      p-2 rounded-xl mb-2 flex justify-between
      ${i === currentPlayer ? "bg-green-200 font-bold" : "bg-white"}
    ">
      <span>${playerIcons[i]} ${p}</span>
      <span>Ô ${positions[i]}</span>
    </div>
  `).join("");
}

// ===== ROLL =====
function rollDice() {
  let roll = Math.floor(Math.random() * 6) + 1;

  let count = 0;
  const interval = setInterval(() => {
    dice.innerText = Math.floor(Math.random() * 6) + 1;
    count++;

    if (count > 10) {
      clearInterval(interval);
      dice.innerText = roll;
      movePlayer(roll);
    }
  }, 80);
}

// ===== MOVE =====
function movePlayer(steps) {
  let pos = positions[currentPlayer];

  const moveInterval = setInterval(() => {

    pos++;
    if (pos >= path.length) pos = path.length - 1;

    positions[currentPlayer] = pos;

    renderPlayersOnMap();

    steps--;

    if (steps === 0) {
      clearInterval(moveInterval);
      afterMove();
    }

  }, 250);
}

// ===== AFTER =====
function afterMove() {
  if (positions[currentPlayer] >= path.length - 1) {
    alert(`🏆 ${game.players[currentPlayer]} tới đích ⭐`);
    return;
  }

  currentPlayer = (currentPlayer + 1) % game.players.length;

  updateInfo();
  renderPlayers();
}

// ===== RESIZE =====
window.addEventListener("resize", () => {
  renderCells();
  renderPlayersOnMap();
});

// ===== MUSIC =====
const music = document.getElementById("bgMusic");
const musicButtons = document.querySelectorAll(".music-btn");

if (game && game.music) {
  music.src = game.music;
} else {
  music.src = "../assets/sounds/bai1.mp3";
}

function updateMusicUI() {
  const currentFile = music.src.split("/").pop();

  musicButtons.forEach(btn => {
    const btnFile = btn.dataset.src.split("/").pop();

    if (btnFile === currentFile) {
      btn.classList.add("bg-green-500", "text-white");
    } else {
      btn.classList.remove("bg-green-500", "text-white");
    }
  });
}

setTimeout(updateMusicUI, 100);

musicButtons.forEach(btn => {
  btn.addEventListener("click", () => {

    music.src = btn.dataset.src;
    music.play();

    updateMusicUI();
  });
});

music.play().catch(() => {
  document.body.addEventListener("click", () => {
    music.play().catch(() => {});
  }, { once: true });
});