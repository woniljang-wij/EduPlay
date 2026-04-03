// ===== LOAD GAME =====
let isGameOver = false;

const victoryVideos = [
  "../assets/videos/Dolia.mp4",
  "../assets/videos/Lauriel.mp4",
  "../assets/videos/Edras.mp4",
  "../assets/videos/DoliaNKRD.mp4",
  "../assets/videos/Billow.mp4",
  "../assets/videos/Baron.mp4",
  "../assets/videos/Victory.mp4",
];

let lastVideo = -1;

function getRandomVideo() {
  let index;

  do {
    index = Math.floor(Math.random() * victoryVideos.length);
  } while (index === lastVideo);

  lastVideo = index;
  return victoryVideos[index];
}

const params = new URLSearchParams(window.location.search);
const id = Number(params.get("id"));
const games = JSON.parse(localStorage.getItem("games")) || [];

const game = games.find((g) => g.id === id);
const gameInfo = document.getElementById("gameInfo");
let obstacleCells = [];
let questions = [];

const dice = document.getElementById("dice");
const playerLayer = document.getElementById("playerLayer");
const cellLayer = document.getElementById("cellLayer");
const diceFaces = ["⚀", "⚁", "⚂", "⚃", "⚄", "⚅"];
const rollBtn = document.getElementById("rollBtn");
let isRolling = false;
// ===== STATE =====
let positions = [];
let currentPlayer = 0;

const playerIcons = ["🐸", "🐱", "🐶", "🦊", "🐼", "🐵", "🐯"];

const path = [];

const cols = 10;
const rows = 1;

for (let row = 0; row < rows; row++) {
  if (row % 2 === 0) {
    // đi từ trái sang phải
    for (let col = 0; col < cols; col++) {
      path.push({ col, row });
    }
  } else {
    // đi từ phải sang trái
    for (let col = cols - 1; col >= 0; col--) {
      path.push({ col, row });
    }
  }
}

// ===== INIT =====
if (game) {
  positions = new Array(game.players.length).fill(0);

  // 🔥 load dữ liệu
  obstacleCells = game.obstacleCells || [];
  questions = game.questions || [];

  updateInfo();
  renderCells();
  renderPlayersOnMap();
} else {
  gameInfo.innerHTML = "Không tìm thấy game ❌";
}

// ===== INFO =====
function updateInfo() {
  const playersHTML = game.players
    .map((p, i) => {
      return `
        <div class="player-badge ${i === currentPlayer ? "player-active" : ""}">
          ${playerIcons[i]} ${p}
        </div>
      `;
    })
    .join("");

  gameInfo.innerHTML = `
    <div class="game-title">🎮 ${game.title}</div>

    <div class="player-row">
      ${playersHTML}
    </div>

    <div class="game-meta">
      <span>🚧 ${game.obstacles} chướng ngại</span>
    </div>
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
      transition-all duration-300
      hover:scale-110
    `;

    cell.style.left = x - 24 + "px";
    cell.style.top = y - 24 + "px";

    // 🚩 START
    if (index === 0) {
      cell.innerText = "🚩";
      cell.style.background = "rgba(34,197,94,0.3)";
    }

    // 🏁 END
    else if (index === path.length - 1) {
      cell.innerText = "🏁";
      cell.style.background = "rgba(251,191,36,0.3)";
    }

    // 💀 OBSTACLE
    else if (obstacleCells.includes(index)) {
      cell.innerText = "💀";

      // 🔥 hiệu ứng nâng cấp mạnh
      cell.style.background = "rgba(255,0,0,0.25)";
      cell.style.boxShadow = "0 0 12px rgba(255,0,0,0.7)";
      cell.style.border = "1px solid rgba(255,0,0,0.7)";

      // animation pulse
      cell.style.animation = "obstaclePulse 1.2s infinite";
    }

    // 🔢 NORMAL
    else {
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
    el.style.left = x - 12 + i * 10 + "px";
    el.style.top = y - 12 + i * 5 + "px";

    el.innerText = playerIcons[i];

    playerLayer.appendChild(el);
  });
}

// ===== ROLL =====
function rollDice() {
  if (isGameOver) return;

  const rollBtn = document.getElementById("rollBtn");
  const dice = document.getElementById("dice3D");

  rollBtn.disabled = true;
  rollBtn.innerText = "⏳ Đang tung...";

  dice.classList.add("dice-rolling");

  let roll = Math.floor(Math.random() * 6) + 1;

  setTimeout(() => {
    dice.classList.remove("dice-rolling");

    dice.offsetHeight;

    const rotations = {
      1: "rotateX(0deg) rotateY(0deg)",
      2: "rotateX(90deg) rotateY(0deg)",
      3: "rotateX(0deg) rotateY(-90deg)",
      4: "rotateX(0deg) rotateY(90deg)",
      5: "rotateX(-90deg) rotateY(0deg)",
      6: "rotateX(180deg) rotateY(0deg)",
    };
    dice.style.transform = rotations[roll];

    movePlayer(roll);
  }, 1000);
}

// ===== MOVE =====
function movePlayer(steps) {
  if (isGameOver) return;

  let pos = positions[currentPlayer];
  const pathLength = path.length;

  let moveInterval = setInterval(() => {
    if (isGameOver) {
      clearInterval(moveInterval);
      return;
    }

    if (steps <= 0) {
      clearInterval(moveInterval);
      afterMove();
      return;
    }

    if (pos < pathLength - 1) {
      pos++;
      positions[currentPlayer] = pos;
      renderPlayersOnMap();
    }

    steps--;
  }, 250);
}

// ===== AFTER =====
function afterMove() {
  const rollBtn = document.getElementById("rollBtn");

  // 🎯 nếu thắng
  if (positions[currentPlayer] >= path.length - 1) {
    isGameOver = true;
    showVictory(game.players[currentPlayer], currentPlayer);
    rollBtn.disabled = true;
    return;
  }

  const pos = positions[currentPlayer];

  if (obstacleCells.includes(pos)) {
    showQuestion();

    rollBtn.disabled = false;
    rollBtn.innerText = "🎲 Tung xúc xắc";

    return;
  }

  currentPlayer = (currentPlayer + 1) % game.players.length;

  updateInfo();

  rollBtn.disabled = false;
  rollBtn.innerText = "🎲 Tung xúc xắc";
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

  musicButtons.forEach((btn) => {
    const btnFile = btn.dataset.src.split("/").pop();

    if (btnFile === currentFile) {
      btn.classList.add("bg-green-500", "text-white");
    } else {
      btn.classList.remove("bg-green-500", "text-white");
    }
  });
}

setTimeout(updateMusicUI, 100);

musicButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    music.src = btn.dataset.src;
    music.play();

    updateMusicUI();
  });
});

music.play().catch(() => {
  document.body.addEventListener(
    "click",
    () => {
      music.play().catch(() => {});
    },
    { once: true },
  );
});

function showVictory(playerName, playerIndex) {
  if (
    isGameOver &&
    document.getElementById("victoryScreen").classList.contains("hidden") ===
      false
  )
    return;

  const screen = document.getElementById("victoryScreen");
  const video = document.getElementById("victoryVideo");
  const popup = document.getElementById("victoryPopup");
  const winnerText = document.getElementById("winnerText");
  const box = document.getElementById("victoryBox");
  const winnerIcon = document.getElementById("winnerIcon");

  // 🎯 nội dung
  winnerText.innerText = playerName + " chiến thắng!";
  if (winnerIcon) {
    winnerIcon.innerText = playerIcons[playerIndex];
  }

  document.body.classList.add("modal-open");

  // 🎲 random video
  const randomVideo = getRandomVideo();

  video.pause();
  video.src = randomVideo;
  video.currentTime = 0;

  // 🎬 hiện video
  screen.classList.remove("hidden");
  screen.style.opacity = "1";

  video.play().catch(() => {
    document.body.addEventListener("click", () => video.play(), { once: true });
  });

  // ❗ reset event
  video.onended = null;

  video.onended = () => {
    // 🏆 hiện popup
    popup.classList.remove("hidden");

    // animation
    box.classList.remove("victory-card");
    void box.offsetWidth;
    box.classList.add("victory-card");

    // fade video
    screen.style.transition = "opacity 0.6s ease";
    screen.style.opacity = "0";

    setTimeout(() => {
      screen.classList.add("hidden");
      screen.style.opacity = "1";
    }, 600);
  };
}

function toggleSound() {
  const music = document.getElementById("bgMusic");
  const btn = document.getElementById("soundBtn");

  music.muted = !music.muted;

  if (music.muted) {
    btn.innerText = "🔇";
  } else {
    btn.innerText = "🔊";
  }
}

function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen();
  } else {
    document.exitFullscreen();
  }
}

function showQuestion() {
  if (questions.length === 0) {
    alert("Chưa có câu hỏi!");
    nextTurn();
    return;
  }

  const q = questions[Math.floor(Math.random() * questions.length)];

  const popup = document.getElementById("questionPopup");
  const title = document.getElementById("qTitle");
  const answersDiv = document.getElementById("answers");

  title.innerText = q.question;
  answersDiv.innerHTML = "";

  q.answers.forEach((ans, i) => {
    const btn = document.createElement("button");

    btn.className =
      "w-full border px-3 py-2 rounded hover:bg-gray-100 text-left";

    btn.innerText = ans;

    btn.onclick = () => handleAnswer(i, q.correct);

    answersDiv.appendChild(btn);
  });

  popup.classList.remove("hidden");
  popup.classList.add("flex");
}

function handleAnswer(selected, correct) {
  const popup = document.getElementById("questionPopup");

  popup.classList.add("hidden");
  popup.classList.remove("flex");

  if (selected === correct) {
    alert("✅ Đúng! Đi thêm lượt");
    // giữ lượt
  } else {
    alert("❌ Sai! Mất lượt");
    nextTurn();
  }
}

function nextTurn() {
  const rollBtn = document.getElementById("rollBtn");

  currentPlayer = (currentPlayer + 1) % game.players.length;

  updateInfo();

  rollBtn.disabled = false;
  rollBtn.innerText = "🎲 Tung xúc xắc";
}

function restartGame() {
  document.body.classList.remove("modal-open");
  location.reload();
}

function goHome() {
  document.body.classList.remove("modal-open");
  window.location.href = "/frontend/games/turnbased.html";
}
