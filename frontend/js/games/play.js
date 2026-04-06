// ===== LOAD GAME =====
let isGameOver = false;

const victoryVideos = [
  "../assets/videos/Dolia.mp4",
  "../assets/videos/Lauriel.mp4",
  "../assets/videos/DoliaHGN.mp4",
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
const rows = 2;

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
        <div class="
  px-4 py-2 rounded-full
  font-semibold text-sm
  transition-all duration-300
  ${
    i === currentPlayer
      ? "bg-green-500 text-white shadow-lg scale-110"
      : "bg-gray-200 text-gray-700"
  }
">
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
  flex items-center justify-center
  text-sm font-bold
  rounded-2xl
  backdrop-blur-md
  bg-white/70
  border border-white/40
  shadow-lg
  transition-all duration-300
  hover:scale-125 hover:shadow-xl
`;

    cell.style.boxShadow = "0 4px 15px rgba(0,0,0,0.2)";

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
  if (isGameOver || isRolling) return;

  isRolling = true;

  const diceSound = document.getElementById("diceSound");
  diceSound.currentTime = 0;
  diceSound.play().catch(() => {});

  const rollBtn = document.getElementById("rollBtn");
  const dice = document.getElementById("dice3D");

  rollBtn.disabled = true;
  rollBtn.innerText = "⏳ Đang tung...";

  // 🎲 random kết quả
  let roll = Math.floor(Math.random() * 6) + 1;

  // 💥 reset animation
  dice.style.transition = "none";

  // 🔥 random quay nhiều vòng (fake physics)
  const randomX = 360 * (3 + Math.floor(Math.random() * 3));
  const randomY = 360 * (3 + Math.floor(Math.random() * 3));

  dice.style.transform = `rotateX(${randomX}deg) rotateY(${randomY}deg)`;

  // 💫 force reflow
  dice.offsetHeight;

  // 🚀 easing mượt khi dừng
  dice.style.transition = "transform 0.7s cubic-bezier(0.22, 1, 0.36, 1)";

  // 🎯 mặt cuối
  const finalRotation = {
    1: "rotateX(0deg) rotateY(0deg)",
    2: "rotateX(90deg) rotateY(0deg)",
    3: "rotateX(0deg) rotateY(-90deg)",
    4: "rotateX(0deg) rotateY(90deg)",
    5: "rotateX(-90deg) rotateY(0deg)",
    6: "rotateX(180deg) rotateY(0deg)",
  };

  // ⏳ delay để nhìn như đang quay
  setTimeout(() => {
    dice.style.transform = finalRotation[roll];
  }, 100);

  // 🎬 kết thúc
  setTimeout(() => {
    isRolling = false;
    movePlayer(roll);
  }, 800);
}

function createTrailEffect(pos) {
  const rect = playerLayer.getBoundingClientRect();
  const p = path[pos];
  if (!p) return;

  const x = (p.col + 0.5) * (rect.width / 10);
  const y = (p.row + 0.5) * (rect.height / 5);

  const trail = document.createElement("div");

  trail.className = "trail";

  trail.style.left = x + "px";
  trail.style.top = y + "px";

  playerLayer.appendChild(trail);

  setTimeout(() => trail.remove(), 500);
}

function zoomEffect() {
  const map = document.querySelector(".relative");

  map.style.transform = "scale(1.1)";
  map.style.transition = "transform 0.3s";

  setTimeout(() => {
    map.style.transform = "scale(1)";
  }, 300);
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
      createTrailEffect(pos);
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
    zoomEffect();
    setTimeout(() => showQuestion(), 300);

    rollBtn.disabled = true;

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
  if (!questions || questions.length === 0) {
    showToast("⚠️ Chưa có câu hỏi!", "error");
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

    const labels = ["A", "B", "C", "D"];

    btn.className = `
  answer-card flex items-center gap-3
`;

    btn.innerHTML = `
  <div class="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 font-bold">
    ${labels[i]}
  </div>
  <span>${ans}</span>
`;

    btn.onclick = () => {
      const buttons = answersDiv.querySelectorAll("button");

      // ❌ disable click
      buttons.forEach((b) => (b.style.pointerEvents = "none"));

      if (i === q.correct) {
        btn.classList.add("answer-correct");
      } else {
        btn.classList.add("answer-wrong");
        buttons[q.correct].classList.add("answer-correct");
      }

      setTimeout(() => handleAnswer(i, q.correct), 800);
    };

    answersDiv.appendChild(btn);
  });

  popup.classList.remove("hidden");
  popup.classList.add("flex");
}

function handleAnswer(selected, correct) {
  const popup = document.getElementById("questionPopup");

  const isCorrect = selected === correct;

  const correctSound = document.getElementById("correctSound");
  const wrongSound = document.getElementById("wrongSound");

  // 🔊 PLAY SOUND
  if (isCorrect) {
    correctSound.currentTime = 0;
    correctSound.play().catch(() => {});
    launchConfettiBurst();
  } else {
    wrongSound.currentTime = 0;
    wrongSound.play().catch(() => {});
  }

  // 🎨 overlay kết quả
  const result = document.createElement("div");

  result.className = `
    absolute inset-0 flex items-center justify-center
    bg-black/40 backdrop-blur-sm z-50
  `;

  const boxClass = isCorrect ? "correct-popup" : "wrong-popup";

  result.innerHTML = `
    <div class="bg-white p-6 rounded-2xl w-[320px] text-center shadow-xl animate-fadeIn ${boxClass}">

      <div class="text-5xl mb-3">
        ${isCorrect ? "🎉" : "💀"}
      </div>

      <h2 class="text-2xl font-bold mb-2 ${
        isCorrect ? "text-green-500" : "text-red-500"
      }">
        ${isCorrect ? "Chính xác!" : "Sai rồi!"}
      </h2>

      <p class="text-gray-500 mb-2">
        ${isCorrect ? "Bạn được đi tiếp!" : "Bạn bị mất lượt!"}
      </p>

    </div>
  `;

  popup.appendChild(result);

  // 💥 RUNG KHI SAI
  if (!isCorrect) {
    document.body.classList.add("shake");
    flashRed();
    setTimeout(() => document.body.classList.remove("shake"), 300);
  }

  // ⏳ delay
  setTimeout(() => {
    result.remove();

    popup.classList.add("hidden");
    popup.classList.remove("flex");

    if (isCorrect) {
      const rollBtn = document.getElementById("rollBtn");
      rollBtn.disabled = false;
      rollBtn.innerText = "🎲 Tung xúc xắc";
    } else {
      nextTurn();
    }
  }, 1200);
}

function launchConfettiBurst() {
  const centerX = window.innerWidth / 2;
  const centerY = window.innerHeight / 2;

  for (let i = 0; i < 40; i++) {
    const piece = document.createElement("div");
    piece.className = "confetti-pro";

    // vị trí xuất phát (giữa)
    piece.style.left = centerX + "px";
    piece.style.top = centerY + "px";

    // hướng bay
    const angle = Math.random() * 2 * Math.PI;
    const velocity = 6 + Math.random() * 6;

    const dx = Math.cos(angle) * velocity;
    const dy = Math.sin(angle) * velocity;

    piece.style.setProperty("--dx", dx);
    piece.style.setProperty("--dy", dy);

    // màu random
    piece.style.background = `hsl(${Math.random() * 360},100%,50%)`;

    document.body.appendChild(piece);

    setTimeout(() => piece.remove(), 1200);
  }
}

function flashRed() {
  const flash = document.createElement("div");

  flash.className = "flash";

  document.body.appendChild(flash);

  setTimeout(() => flash.remove(), 300);
}

function nextTurn() {
  const rollBtn = document.getElementById("rollBtn");

  currentPlayer = (currentPlayer + 1) % game.players.length;

  updateInfo();

  rollBtn.disabled = false;
  rollBtn.innerText = "🎲 Tung xúc xắc";
}

function showToast(message, type = "success") {
  const toast = document.getElementById("toast");

  toast.innerText = message;

  toast.className = `
    fixed top-5 right-5 z-[9999]
    px-5 py-3 rounded-xl shadow-lg text-white font-semibold
    transition-all duration-500 ease-out
    translate-x-full opacity-0
  `;

  toast.classList.add(type === "error" ? "bg-red-500" : "bg-green-500");

  setTimeout(() => {
    toast.classList.remove("translate-x-full", "opacity-0");
  }, 50);

  setTimeout(() => {
    toast.classList.add("translate-x-full", "opacity-0");
  }, 2500);
}

function restartGame() {
  document.body.classList.remove("modal-open");
  location.reload();
}

function goHome() {
  document.body.classList.remove("modal-open");
  window.location.href = "/frontend/games/turnbased.html";
}
