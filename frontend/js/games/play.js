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
  "../assets/videos/Win.mp4",
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
const autoPlay = params.get("autoplay");
if (autoPlay) {
  setTimeout(() => {
    startGameMusic();
  }, 300);
}

const games = JSON.parse(localStorage.getItem("games")) || [];

const game = games.find((g) => g.id === id);
const gameInfo = document.getElementById("gameInfo");
let obstacleCells = [];
let questions = [];

const playerLayer = document.getElementById("playerLayer");
const cellLayer = document.getElementById("cellLayer");
const rollBtn = document.getElementById("rollBtn");
let isRolling = false;
let timer = null;
let timeLeft = 0;
// ===== STATE =====
let positions = [];
let currentPlayer = 0;

const playerIcons = ["🐸", "🐱", "🐶", "🦊", "🐼", "🐵", "🐯"];

const path = [
  // ===== ROW 1 =====
  { x: 17, y: 20 },
  { x: 26, y: 20 },
  { x: 36, y: 19.5 },
  { x: 46, y: 19.5 },
  { x: 56, y: 19.5 },
  { x: 66, y: 19 },
  { x: 76, y: 19 },
  { x: 86, y: 19 },
  { x: 92, y: 27 },

  // ===== ROW 2 (ngược) =====
  { x: 87, y: 34 },
  { x: 76, y: 34 },
  { x: 66, y: 34 },
  { x: 56, y: 34 },
  { x: 46, y: 34 },
  { x: 36, y: 34 },
  { x: 26, y: 34 },
  { x: 17, y: 34 },

  // ===== ROW 3 =====
  { x: 11, y: 41 },
  { x: 17, y: 48.5 },
  { x: 26, y: 49 },
  { x: 36, y: 49 },
  { x: 46, y: 49 },
  { x: 56, y: 49 },
  { x: 66, y: 49.5 },
  { x: 76, y: 49.5 },
  { x: 86, y: 50 },

  // ===== ROW 4 (ngược) =====
  { x: 92, y: 58 },
  { x: 86, y: 65 },
  { x: 76, y: 65 },
  { x: 66, y: 65 },
  { x: 56, y: 64.5 },
  { x: 46, y: 64.5 },
  { x: 36, y: 64 },
  { x: 26, y: 64 },
  { x: 17, y: 65 },

  // ===== ROW 5 =====
  { x: 11, y: 72.5 },
  { x: 17, y: 81 },
  { x: 26, y: 81 },
  { x: 36, y: 81 },
  { x: 46, y: 81 },
  { x: 56, y: 81 },
  { x: 66, y: 81 },
  { x: 76, y: 81 },
  { x: 85, y: 82 },
];

// ===== INIT =====
if (game) {
  positions = new Array(game.players.length).fill(0);

  obstacleCells = game.obstacleCells || [];
  questions = game.questions || [];

  updateInfo();
  renderCells();
  renderPlayersOnMap();
} else {
  gameInfo.innerHTML = "Không tìm thấy game ❌";
}

function updateInfo() {
  const playersHTML = game.players
    .map((p, i) => {
      return `
        <div class="
          player-badge
          ${i === currentPlayer ? "player-active" : ""}
        ">
          <span class="player-icon">${playerIcons[i]}</span>
          <span>${p}</span>
        </div>
      `;
    })
    .join("");

  gameInfo.innerHTML = `
<div class="game-header-x10">

  <div class="header-top">

    <div class="header-left">

      <div class="hero-icon-wrap">
        <div class="hero-glow"></div>

        <div class="hero-icon">
          🎲
        </div>
      </div>

      <div class="hero-info">
        <div class="hero-subtitle">
          ◈ GAME THEO LƯỢT ◈
        </div>

        <div class="hero-title">
          ${game.title}
        </div>

        <div class="hero-desc">
          Chiến đấu vượt chướng ngại và trở thành người chiến thắng cuối cùng.
        </div>
      </div>

    </div>

    <div class="header-right">

      <div class="obstacle-card-x10">

        <div class="obstacle-icon">
          🚧
        </div>

        <div class="obstacle-info">
          <div class="obstacle-label">
            Chướng ngại
          </div>

          <div class="obstacle-value">
            ${game.obstacles}
          </div>
        </div>

      </div>

    </div>

  </div>

  <div class="player-section-x10">

    <div class="player-section-title">
      Người chơi
    </div>

    <div class="player-row-modern">
      ${playersHTML}
    </div>

  </div>

</div>
`;
}

// ===== CELLS =====
function renderCells() {
  cellLayer.innerHTML = "";

  path.forEach((p, index) => {
    const x = p.x;
    const y = p.y;

    const cell = document.createElement("div");

    cell.className = `
  absolute w-9 h-9
  flex items-center justify-center

  text-[11px] font-bold text-gray-700

  rounded-full

  bg-white/70
  backdrop-blur-lg

  border border-white/40
  shadow-[0_4px_12px_rgba(0,0,0,0.15)]

  transition-all duration-300 ease-out

  hover:scale-125
  hover:bg-white/90
  hover:shadow-[0_6px_18px_rgba(0,0,0,0.25)]

  active:scale-95
`;

    cell.style.boxShadow = "0 6px 18px rgba(0,0,0,0.2)";
    cell.style.left = x + "%";
    cell.style.top = y + "%";
    cell.style.transform = "translate(-50%, -50%)";

    // 🚩 START
    if (index === 0) {
      cell.innerText = "🚩";

      cell.style.background = "rgba(34,197,94,0.25)";
      cell.style.border = "1px solid rgba(34,197,94,0.6)";
      cell.style.animation = "startGlow 1.5s infinite ease-in-out";
    }

    // 🏁 END
    else if (index === path.length - 1) {
      cell.innerText = "🏁";

      cell.style.background = "rgba(251,191,36,0.25)";
      cell.style.border = "1px solid rgba(251,191,36,0.6)";
      cell.style.animation = "endPulse 1.5s infinite ease-in-out";
    }

    // 💀 OBSTACLE
    else if (obstacleCells.includes(index)) {
      cell.innerText = "💀";
      cell.style.background = "rgba(255,0,0,0.25)";
      cell.style.boxShadow = "0 0 12px rgba(255,0,0,0.7)";
      cell.style.border = "1px solid rgba(255,0,0,0.7)";
      cell.style.animation = "obstaclePulse 1.2s infinite";
    }

    if (positions.includes(index)) {
      cell.classList.add("ring-2", "ring-green-400", "scale-110");
    }

    cellLayer.appendChild(cell);
  });
}

// ===== PLAYER =====
function renderPlayersOnMap() {
  playerLayer.innerHTML = "";

  positions.forEach((pos, i) => {
    const p = path[pos];
    if (!p) return;

    const x = p.x;
    const y = p.y;

    const el = document.createElement("div");

    el.className =
      "absolute flex items-center justify-center transition-all duration-300";

    el.style.left = x + "%";
    el.style.top = y + "%";

    el.style.transform = `translate(-50%, -50%)`;
    el.style.marginLeft = i * 10 + "px";
    el.style.marginTop = i * 6 + "px";

    el.innerHTML = `<span class="player-icon">${playerIcons[i]}</span>`;

    playerLayer.appendChild(el);
  });
}

// ===== ROLL =====
function rollDice() {
  if (isGameOver || isRolling) return;

  isRolling = true;

  const dice = document.getElementById("dice3D");
  const rollBtn = document.getElementById("rollBtn");

  // 🔊 SOUND DICE
  const diceSound = document.getElementById("diceSound");
  if (diceSound) {
    diceSound.currentTime = 0;
    diceSound.play().catch(() => {});
  }

  rollBtn.disabled = true;
  rollBtn.innerText = "⏳ Đang tung...";

  let roll = Math.floor(Math.random() * 6) + 1;

  const current = dice.style.transform || "";

  const spinX = 360 * 4 + Math.random() * 360;
  const spinY = 360 * 4 + Math.random() * 360;

  dice.style.transition = "transform 0.6s ease";

  dice.style.transform = `${current} rotateX(${spinX}deg) rotateY(${spinY}deg)`;

  const finalRotation = {
    1: "rotateX(0deg) rotateY(0deg)",
    2: "rotateX(90deg) rotateY(0deg)",
    3: "rotateX(0deg) rotateY(-90deg)",
    4: "rotateX(0deg) rotateY(90deg)",
    5: "rotateX(-90deg) rotateY(0deg)",
    6: "rotateX(180deg) rotateY(0deg)",
  };

  setTimeout(() => {
    dice.style.transition = "transform 0.7s cubic-bezier(0.22,1,0.36,1)";
    dice.style.transform = finalRotation[roll];
  }, 200);

  setTimeout(() => {
    isRolling = false;
    movePlayer(roll);
  }, 900);
}

function createTrailEffect(pos) {
  const rect = playerLayer.getBoundingClientRect();
  const p = path[pos];
  if (!p) return;

  const x = (p.x / 100) * rect.width;
  const y = (p.y / 100) * rect.height;

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

    if (pos >= pathLength - 1) {
      clearInterval(moveInterval);
      afterMove();
      return;
    }

    if (steps <= 0) {
      clearInterval(moveInterval);
      afterMove();
      return;
    }

    pos++;
    positions[currentPlayer] = pos;
    renderPlayersOnMap();
    createTrailEffect(pos);

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

    btn.classList.remove("active");

    if (btnFile === currentFile) {
      btn.classList.add("active");
    }
  });
}

setTimeout(updateMusicUI, 100);

musicButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    const newSrc = btn.dataset.src;

    if (!music.paused) {
      music.pause();
      music.currentTime = 0;
    }

    music.src = newSrc;

    music.play().catch(() => {});

    updateMusicUI();
  });
});

function startGameMusic() {
  const music = document.getElementById("bgMusic");

  music.muted = true;

  music
    .play()
    .then(() => {
      setTimeout(() => {
        music.muted = false;
        music.volume = 0.5;
      }, 200);
    })
    .catch(() => {});
}

function showVictory(playerName, playerIndex) {
  const screen = document.getElementById("victoryScreen");

  if (!screen.classList.contains("hidden")) return;
  const video = document.getElementById("victoryVideo");
  const popup = document.getElementById("victoryPopup");
  const winnerText = document.getElementById("winnerText");
  const box = document.getElementById("victoryBox");
  const winnerIcon = document.getElementById("winnerIcon");

  winnerText.innerText = playerName + " chiến thắng!";
  if (winnerIcon) {
    winnerIcon.innerText = playerIcons[playerIndex];
  }

  document.body.classList.add("modal-open");

  const randomVideo = getRandomVideo();

  video.pause();
  video.src = randomVideo;
  video.currentTime = 0;

  screen.classList.remove("hidden");
  screen.style.opacity = "1";

  video.muted = true;
  video.play().catch(() => {});

  video.onended = null;

  video.onended = () => {
    console.log("VIDEO END");

    popup.classList.remove("hidden");
    popup.classList.add("flex");

    void popup.offsetWidth;

    box.classList.remove("victory-card");
    void box.offsetWidth;
    box.classList.add("victory-card");

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
  const btn = document.getElementById("fullscreenBtn");
  const text = btn.querySelector(".fs-text");

  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen();
    text.innerText = "Thu nhỏ";
  } else {
    document.exitFullscreen();
    text.innerText = "Toàn màn hình";
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

  timeLeft = q.time || 10;

  title.innerHTML = `
    ${q.question}
    <div style="margin-top:8px; font-size:14px; color:red;">
      ⏱ ${timeLeft}s
    </div>
  `;

  answersDiv.innerHTML = "";

  startTimer();

  q.answers.forEach((ans, i) => {
    const btn = document.createElement("button");

    const labels = ["A", "B", "C", "D"];

    btn.className = `answer-card flex items-center gap-3`;

    btn.innerHTML = `
      <div class="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 font-bold">
        ${labels[i]}
      </div>
      <span>${ans}</span>
    `;

    btn.onclick = () => {
      clearInterval(timer);

      const buttons = answersDiv.querySelectorAll("button");
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

function startTimer() {
  clearInterval(timer);

  timer = setInterval(() => {
    timeLeft--;

    const title = document.getElementById("qTitle");
    if (title) {
      const text = title.innerText.split("\n")[0];
      title.innerHTML = `
        ${text}
        <div style="margin-top:8px; font-size:14px; color:red;">
          ⏱ ${timeLeft}s
        </div>
      `;
    }

    if (timeLeft <= 0) {
      clearInterval(timer);
      handleTimeout();
    }
  }, 1000);
}

function handleTimeout() {
  const popup = document.getElementById("questionPopup");

  const buttons = popup.querySelectorAll("button");
  buttons.forEach((b) => (b.style.pointerEvents = "none"));

  handleAnswer(-1, -1, true);
}

function handleAnswer(selected, correct, isTimeout = false) {
  clearInterval(timer);

  const popup = document.getElementById("questionPopup");

  const isCorrect = !isTimeout && selected === correct;

  const correctSound = document.getElementById("correctSound");
  const wrongSound = document.getElementById("wrongSound");

  if (isCorrect) {
    correctSound.currentTime = 0;
    correctSound.play().catch(() => {});

    if (typeof launchConfetti === "function") {
      launchConfetti();
    }
  } else {
    wrongSound.currentTime = 0;
    wrongSound.play().catch(() => {});
  }

  const result = document.createElement("div");

  result.className = `
    absolute inset-0 flex items-center justify-center
    bg-black/40 backdrop-blur-sm z-50
  `;

  const boxClass = isCorrect ? "correct-popup" : "wrong-popup";

  result.innerHTML = `
    <div class="bg-white p-6 rounded-2xl w-[320px] text-center shadow-xl animate-fadeIn ${boxClass}">

      <div class="text-5xl mb-3">
        ${isTimeout ? "⏰" : isCorrect ? "🎉" : "💀"}
      </div>

      <h2 class="text-2xl font-bold mb-2 ${
        isCorrect ? "text-green-500" : "text-red-500"
      }">
        ${isTimeout ? "Hết giờ!" : isCorrect ? "Chính xác!" : "Sai rồi!"}
      </h2>

      <p class="text-gray-500 mb-2">
        ${
          isTimeout
            ? "Bạn không trả lời kịp"
            : isCorrect
              ? "Bạn được đi tiếp!"
              : "Bạn bị mất lượt!"
        }
      </p>

    </div>
  `;

  popup.appendChild(result);

  if (!isCorrect) {
    document.body.classList.add("shake");
    flashRed();
    setTimeout(() => document.body.classList.remove("shake"), 300);
  }

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

function restartGame() {
  document.body.classList.remove("modal-open");
  location.reload();
}

function goHome() {
  document.body.classList.remove("modal-open");
  window.location.href = "/frontend/games/turnbased.html";
}
