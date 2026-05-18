// ===== STATE =====
let positions = [];
let currentPlayer = 0;

const gameInfo = document.getElementById("gameInfo");

let obstacleCells = [];
let questions = [];

const playerLayer = document.getElementById("playerLayer");
const cellLayer = document.getElementById("cellLayer");
const rollBtn = document.getElementById("rollBtn");

let isRolling = false;
let timer = null;
let timeLeft = 0;

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

function generateObstacles(total) {
  const obstacles = [];

  while (obstacles.length < total) {
    // random từ ô 1 -> ô cuối-2
    const randomIndex = Math.floor(Math.random() * (path.length - 2)) + 1;

    // không cho trùng
    if (!obstacles.includes(randomIndex)) {
      obstacles.push(randomIndex);
    }
  }

  return obstacles;
}

// ===== LOAD GAME =====
let isGameOver = false;

const victoryVideos = [
  "../assets/videos/Lauriel.mp4",
  "../assets/videos/DoliaHGN.mp4",
  "../assets/videos/Edras.mp4",
  "../assets/videos/DoliaNKRD.mp4",
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

const urlParams = new URLSearchParams(window.location.search);

const roomCode = urlParams.get("room");

const autoPlay = urlParams.get("autoplay");

if (autoPlay || roomCode) {
  setTimeout(() => {
    startGameMusic();
  }, 300);
}

const games = JSON.parse(localStorage.getItem("games")) || [];

const rooms = JSON.parse(localStorage.getItem("turn_rooms")) || [];

let game = null;

const isStudentJoin = urlParams.get("join");

if (roomCode) {
  const room = rooms.find((r) => r.roomCode === roomCode);

  if (!room) {
    showToast("Phòng không tồn tại!", "error");

    throw new Error("ROOM_NOT_FOUND");
  }

  // ===== KIỂM TRA HẾT HẠN =====
  const expireTime = room.createdAt + room.expireDay * 24 * 60 * 60 * 1000;

  const isExpired = Date.now() > expireTime;

  // 👨‍🎓 CHẶN HỌC SINH
  if (isStudentJoin && isExpired) {
    showToast("⛔ Bài tập đã hết hạn!", "error");

    setTimeout(() => {
      window.location.href = "../join.html";
    }, 1500);

    throw new Error("ROOM_EXPIRED");
  }

  game = games.find((g) => String(g.id) === String(room.gameId));

  // 👨‍🎓 Sinh viên nhập mã phòng
  if (isStudentJoin) {
    setupRoomPlayers(game);
  }

  // 👨‍🏫 Giáo viên vào thẳng game
  else {
    startNormalGame();
  }
} else {
  const id = Number(urlParams.get("id"));

  game = games.find((g) => g.id === id);

  if (!game) {
    showToast("Không tìm thấy game!", "error");

    setTimeout(() => {
      window.location.href = "../games/turnbased.html";
    }, 1500);

    throw new Error("GAME_NOT_FOUND");
  }

  startNormalGame();
}

function setupRoomPlayers(gameData) {
  const setupScreen = document.getElementById("playerSetup");
  setupScreen.classList.remove("hidden");
  setupScreen.classList.add("flex");

  const inputsWrap = document.getElementById("setupInputs");

  const title = document.getElementById("setupGameTitle");

  const startBtn = document.getElementById("startRoomBtn");

  title.innerText = gameData.title;

  inputsWrap.innerHTML = "";

  const totalPlayers = Array.isArray(gameData.players)
    ? gameData.players.length
    : Number(gameData.players || 2);

  for (let i = 0; i < totalPlayers; i++) {
    const input = document.createElement("input");

    input.type = "text";

    input.className = "setup-input";

    input.placeholder = `👤 Người chơi ${i + 1}`;

    inputsWrap.appendChild(input);

    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        startBtn.click();
      }
    });
  }

  startBtn.onclick = () => {
    const inputs = inputsWrap.querySelectorAll("input");

    const playerNames = [];

    let valid = true;

    inputs.forEach((input, i) => {
      const value = input.value.trim();

      if (!value) valid = false;

      playerNames.push(value);
    });

    if (!valid) {
      showToast("Nhập đủ tên người chơi!", "error");

      return;
    }

    gameData.players = playerNames;

    setupScreen.remove();
    showToast("Vào phòng thành công!", "success");
    startNormalGame();
  };
}

function startNormalGame() {
  if (!game) return;

  positions = new Array(game.players.length).fill(0);

  obstacleCells = generateObstacles(Number(game.obstacles) || 0);

  questions = game.questions || [];

  updateInfo();

  renderCells();

  renderPlayersOnMap();
}

function updateInfo() {
  const playersHTML = game.players
    .map((p, i) => {
      let cleanName = p || "";

      const icons = ["🐸", "🐱", "🐶", "🦊", "🐼", "🐵", "🐯"];

      icons.forEach((icon) => {
        if (cleanName.startsWith(icon)) {
          cleanName = cleanName.replace(icon, "").trim();
        }
      });

      return `
      <div class="
        player-badge
        ${i === currentPlayer ? "player-active" : ""}
      ">

        <span class="player-icon">
          ${playerIcons[i]}
        </span>

        <span>
          ${cleanName}
        </span>

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

function updatePlayerActive() {
  const badges = document.querySelectorAll(".player-badge");

  badges.forEach((badge, i) => {
    badge.classList.remove("player-active");

    if (i === currentPlayer) {
      badge.classList.add("player-active");
    }
  });
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

rounded-full

border-2 border-dashed
border-white/70

bg-transparent

transition-all duration-300 ease-out

hover:scale-110
hover:border-white
`;

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
    if (positions.filter((p) => p === pos).length > 1) {
      el.style.marginLeft = i * 10 + "px";
      el.style.marginTop = i * 6 + "px";
    } else {
      el.style.marginLeft = "0px";
      el.style.marginTop = "0px";
    }

    el.innerHTML = `
  <span class="
    player-icon
    text-[38px]
  ">
    ${playerIcons[i]}
  </span>
`;

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

  updatePlayerActive();

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

  if (!music) return;

  music.volume = 0.5;

  const playPromise = music.play();

  if (playPromise !== undefined) {
    playPromise.catch(() => {
      document.body.addEventListener(
        "click",
        () => {
          music.play().catch(() => {});
        },
        { once: true },
      );
    });
  }
}

function showVictory(playerName, playerIndex) {
  saveAllTurnResults(playerName);

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

function saveAllTurnResults(winnerName) {
  if (!roomCode) return;

  let submits =
    JSON.parse(localStorage.getItem("turn_submit_" + roomCode)) || [];

  const matchId = Date.now();

  game.players.forEach((player) => {
    submits.push({
      name: player,

      result: player === winnerName ? "WIN" : "LOSE",

      submittedAt: Date.now(),

      roomCode,

      matchId,
    });
  });

  localStorage.setItem("turn_submit_" + roomCode, JSON.stringify(submits));
}

// ================= ASSIGNMENT SUBMIT =================

function saveTurnAssignment(playerName) {
  if (!roomCode) return;

  let submits =
    JSON.parse(localStorage.getItem("turn_submit_" + roomCode)) || [];

  const existed = submits.find((s) => s.name === playerName);

  if (existed) return;

  submits.push({
    name: playerName,

    result: "HOÀN THÀNH",

    submittedAt: Date.now(),

    roomCode,
  });

  localStorage.setItem("turn_submit_" + roomCode, JSON.stringify(submits));
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

  timeLeft = parseInt(q.time) || 30;

  title.innerHTML = `
  <div class="question-category">
    📖 ${game.subject || "KIẾN THỨC"}
  </div>

  <div class="question-title-x10">
    ${q.question}
  </div>

  <div class="question-wave"></div>
`;

  // ===== UPDATE TIMER CÓ SẴN TRONG HTML =====
  const timerBox = document.getElementById("timerBox");

  if (timerBox) {
    timerBox.innerHTML = `⏱ ${timeLeft}s`;
  }

  answersDiv.innerHTML = "";

  startTimer();

  q.answers.forEach((ans, i) => {
    const btn = document.createElement("button");

    const labels = ["A", "B", "C", "D"];

    btn.className = "answer-card";

    btn.innerHTML = `
      <div class="answer-label">
        ${labels[i]}
      </div>

      <div class="answer-text">
        ${ans}
      </div>
    `;

    btn.onclick = () => {
      clearInterval(timer);

      const buttons = answersDiv.querySelectorAll("button");

      buttons.forEach((b) => {
        b.style.pointerEvents = "none";
      });

      if (i === q.correct) {
        btn.classList.add("answer-correct");
      } else {
        btn.classList.add("answer-wrong");
      }

      setTimeout(() => {
        handleAnswer(i, q.correct);
      }, 800);
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

    const timerBox = document.getElementById("timerBox");

    if (timerBox) {
      timerBox.innerHTML = `⏱ ${timeLeft}s`;

      if (timeLeft <= 5) {
        timerBox.style.color = "#ef4444";
        timerBox.style.transform = "scale(1.08)";
      } else {
        timerBox.style.color = "#ef4444";
        timerBox.style.transform = "scale(1)";
      }
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

  updatePlayerActive();

  rollBtn.disabled = false;
  rollBtn.innerText = "🎲 Tung xúc xắc";
}

function restartGame() {
  document.body.classList.remove("modal-open");
  location.reload();
}

function goHome() {
  document.body.classList.remove("modal-open");

  if (roomCode) {
    sessionStorage.removeItem("joined_room");

    window.location.href = "/index.html";
  } else {
    window.location.href = "/games/turnbased.html";
  }
}
