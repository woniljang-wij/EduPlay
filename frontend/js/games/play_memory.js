let timerRAF = null;
let timerStart = 0;
let timerDuration = 0;

// ===== LOAD GAME =====
const params = new URLSearchParams(window.location.search);

const id = parseInt(params.get("id"));
const roomCode = params.get("room");
const isStudentJoin = !!params.get("room");
window.addEventListener("load", () => {
  const setup = document.getElementById("playerSetup");

  if (roomCode) {
    setup.classList.remove("hidden");

    const gameNameEl = document.getElementById("setupGameName");

    if (gameNameEl) {
      gameNameEl.innerText = game?.title || "MEMORY GAME";
    }
  }
});

const startMemoryBtn = document.getElementById("startMemoryBtn");

if (startMemoryBtn) {
  startMemoryBtn.onclick = () => {
    const input = document.getElementById("playerNameInput");

    const name = input.value.trim();

    if (!name) {
      showToast("Nhập tên của bạn!", "warning");
      return;
    }

    sessionStorage.setItem("memory_player_name", name);

    document.getElementById("playerSetup").classList.add("hidden");
  };

  document
    .getElementById("playerNameInput")
    ?.addEventListener("keydown", (e) => {
      if (e.key === "Enter") {
        startMemoryBtn.click();
      }
    });
}

let game = null;

async function loadGame() {
  try {
    const res = await fetch("http://127.0.0.1:5000/api/games");

    const data = await res.json();

    const games = data
      .filter((g) => g.game_type === "memory")
      .map((g) => ({
        ...JSON.parse(g.game_data),

        db_id: g.id,

        title: g.title,
      }));

    // ===== PLAY BY ROOM =====
    if (roomCode) {
      const roomRes = await fetch(`http://127.0.0.1:5000/api/room/${roomCode}`);

      if (!roomRes.ok) {
        showToast("Không tìm thấy phòng!", "error");

        setTimeout(() => {
          window.location.href = "../join.html";
        }, 1200);

        return;
      }

      const room = await roomRes.json();

      if (!room) {
        showToast("Không tìm thấy phòng!", "error");

        setTimeout(() => {
          window.location.href = "../join.html";
        }, 1200);

        return;
      }

      game = games.find((g) => g.db_id === room.game_id);
    }

    // ===== PLAY NORMAL =====
    else {
      game = games.find((g) => g.db_id === id);
    }

    if (!game) {
      showToast("Không tìm thấy game!", "error");

      setTimeout(() => {
        window.location.href = "memory.html";
      }, 1200);

      return;
    }

    startGame();
  } catch (err) {
    console.error(err);

    showToast("Lỗi tải game!", "error");
  }
}

let gridSize = 0;

let total = 0;

let questions = [];

let imageUrl = "";

let answer = "";

let theme = "blue";

let guessDuration = 0;

let opened = [];

let doneCount = 0;

let currentIndex = null;

let selectedAnswer = null;

let guessRemain = 0;

let guessTimer = null;

let puzzleTimer = null;

let puzzleRemain = 0;

function startGame() {
  gridSize = parseInt(game.grid);

  total = gridSize * gridSize;

  questions = [...(game.questions || [])];

  questions.sort(() => Math.random() - 0.5);

  if (questions.length < total) {
    showToast("Số câu hỏi không đủ!", "error");

    setTimeout(() => {
      window.location.href = "memory.html";
    }, 1200);

    return;
  }

  imageUrl = game.image;

  answer = game.answer || game.name || "???";

  theme = game.theme || "blue";

  timerDuration = parseInt(game.time) || 0;

  guessDuration = parseInt(game.guessTime) || 0;

  opened = Array(total).fill(false);

  document.getElementById("gameTitle").innerText = game.title || "Memory Game";

  renderGrid();

  updateProgress();

  lockGuessButton();

  startPuzzleTimer();
}

loadGame();

function startPuzzleTimer() {
  if (timerDuration <= 0) return;

  puzzleRemain = timerDuration;

  const box = document.getElementById("puzzleTimerBox");
  const text = document.getElementById("puzzleTimerText");

  box.classList.remove("hidden");

  text.innerText = puzzleRemain;

  clearInterval(puzzleTimer);

  puzzleTimer = setInterval(() => {
    puzzleRemain--;

    text.innerText = puzzleRemain;

    if (puzzleRemain <= 10) {
      box.classList.add("low");
    }

    if (puzzleRemain <= 0) {
      clearInterval(puzzleTimer);

      if (doneCount < total) {
        closeModal();
        closeGuess();

        showLose("puzzle-timeout");
      }
    }
  }, 1000);
}

// ===== GRID =====
function renderGrid() {
  const board = document.getElementById("grid");

  board.innerHTML = "";

  const img = document.createElement("img");
  img.id = "gameImage";
  img.src = imageUrl;

  board.appendChild(img);

  img.onload = () => {
    const ratio = img.naturalWidth / img.naturalHeight;

    let width, height;

    if (ratio > 1) {
      width = Math.min(600, window.innerWidth * 0.9);
      height = width / ratio;
    } else {
      height = Math.min(600, window.innerHeight * 0.6);
      width = height * ratio;
    }

    board.style.width = width + "px";
    board.style.height = height + "px";

    board.style.gridTemplateColumns = `repeat(${gridSize}, 1fr)`;
    board.style.gridTemplateRows = `repeat(${gridSize}, 1fr)`;

    for (let i = 0; i < total; i++) {
      const tile = document.createElement("div");

      tile.className = `tile theme-${theme}`;

      tile.innerHTML = `
    <div class="tile-glow"></div>

    <div class="tile-content">
      <span>${i + 1}</span>
    </div>

    <div class="tile-border"></div>
  `;

      tile.onclick = () => handleTileClick(i);

      board.appendChild(tile);
    }
  };
}

// ===== CLICK =====
function handleTileClick(index) {
  if (opened[index]) return;

  currentIndex = index;
  showQuestion(index);
}

// ===== SHOW QUESTION =====
function showQuestion(index) {
  const q = questions[index];

  if (!q) {
    showToast("Lỗi câu hỏi!", "error");
    return;
  }

  selectedAnswer = null;

  document.getElementById("questionText").innerText = q.question;

  const answersBox = document.getElementById("answers");
  answersBox.innerHTML = "";

  q.answers.forEach((a, i) => {
    const btn = document.createElement("button");

    btn.className = "answer-btn";
    btn.innerText = a;

    btn.onclick = () => {
      selectedAnswer = i;

      document
        .querySelectorAll(".answer-btn")
        .forEach((b) => b.classList.remove("active"));

      btn.classList.add("active");
    };

    answersBox.appendChild(btn);
  });

  const timerWrap = document.querySelector(".timer-wrap");

  if (timerWrap) {
    timerWrap.style.display = "none";
  }

  document.getElementById("questionModal").classList.remove("hidden");
}

// ===== SUBMIT =====
function submitAnswer() {
  if (selectedAnswer === null) {
    showToast("Chọn đáp án!", "warning");
    return;
  }

  checkAnswer(selectedAnswer);
}

// ===== CHECK =====
function checkAnswer(selected) {
  const q = questions[currentIndex];

  if (!q) return;

  if (selected === q.correct) {
    openTile(currentIndex);
    showToast("Chính xác!", "success");
  } else {
    showToast("Sai rồi!", "error");
  }

  closeModal();
}

function startQuestionTimer() {
  if (timerDuration <= 0) return;

  cancelAnimationFrame(timerRAF);

  timerStart = performance.now();

  const circle = document.getElementById("timerCircle");
  const text = document.getElementById("timerText");

  const circumference = 2 * Math.PI * 20;

  function update(now) {
    const elapsed = (now - timerStart) / 1000;
    const remain = Math.max(0, timerDuration - elapsed);

    const percent = remain / timerDuration;
    const offset = circumference * (1 - percent);

    circle.style.strokeDashoffset = offset;
    text.innerText = Math.ceil(remain);

    if (remain <= 3) circle.style.stroke = "#ff4444";
    else if (remain <= 6) circle.style.stroke = "#ffaa00";
    else circle.style.stroke = "#00ff88";

    if (remain <= 0) {
      showToast("⏰ Hết giờ!", "error");
      closeModal();
      return;
    }

    timerRAF = requestAnimationFrame(update);
  }

  timerRAF = requestAnimationFrame(update);
}

// ===== CLOSE =====
function closeModal() {
  cancelAnimationFrame(timerRAF);
  document.getElementById("questionModal").classList.add("hidden");
}

// ===== OPEN TILE =====
function openTile(index) {
  opened[index] = true;
  doneCount++;

  const tiles = document.querySelectorAll("#grid .tile");
  const tile = tiles[index];

  tile.classList.add("opened");
  tile.innerText = "";

  updateProgress();

  unlockGuessButton();

  if (doneCount === total) {
    clearInterval(puzzleTimer);
    document.getElementById("puzzleTimerBox")?.classList.add("hidden");

    startGuessCountdown();
  }
}

// ===== PROGRESS =====
function updateProgress() {
  const percent = Math.floor((doneCount / total) * 100);

  document.getElementById("progressText").innerText = percent + "%";

  document.getElementById("progressBar").style.width = percent + "%";
}

function lockGuessButton() {
  const btn = document.querySelector(".top-actions .btn-red");

  if (!btn) return;

  btn.disabled = true;
  btn.style.opacity = "0.45";
  btn.style.cursor = "not-allowed";
  btn.title = "Cần mở ít nhất 1 mảnh trước khi giải mã";
}

function unlockGuessButton() {
  const btn = document.querySelector(".top-actions .btn-red");

  if (!btn) return;

  btn.disabled = false;
  btn.style.opacity = "1";
  btn.style.cursor = "pointer";
  btn.title = "";
}

// ===== START FINAL GUESS =====
function startGuessCountdown() {
  if (guessDuration <= 0) {
    openGuess();
    return;
  }

  openGuess();

  guessRemain = guessDuration;

  const wrap = document.getElementById("guessCountdown");

  const text = document.getElementById("guessCountdownText");

  const ring = document.querySelector(".guess-ring");

  wrap.classList.remove("hidden");

  text.innerText = guessRemain;

  clearInterval(guessTimer);

  guessTimer = setInterval(() => {
    guessRemain--;

    text.innerText = guessRemain;

    // low time
    if (guessRemain <= 3) {
      ring.classList.add("low");

      const beep = new Audio("../assets/sounds/warning.mp3");

      beep.volume = 0.4;
      beep.play();
    }

    // lose
    if (guessRemain <= 0) {
      clearInterval(guessTimer);

      wrap.classList.add("hidden");

      showLose("timeout");
    }
  }, 1000);
}

// ===== LOSE =====
function showLose(reason = "wrong") {
  closeGuess();

  closeConfirmGuess?.();

  const audio = new Audio("../assets/sounds/lose.mp3");

  audio.volume = 0.6;
  audio.play();

  revealAll();

  const box = document.getElementById("resultBox");

  const card = box.querySelector(".result-card");

  card.classList.add("lose-mode");

  document.getElementById("resultIcon").innerText = "💀";

  document.getElementById("resultTitle").innerText = "THẤT BẠI";

  document.getElementById("finalAnswer").innerText =
    reason === "puzzle-timeout"
      ? "Bạn chưa mở hết các mảnh trong thời gian quy định. Đáp án không được tiết lộ."
      : reason === "timeout"
        ? "Bạn đã hết thời gian giải mã tên ảnh. Đáp án không được tiết lộ."
        : "Bạn đã đoán sai. Đáp án không được tiết lộ.";
  box.classList.remove("hidden");
}

// ===== WIN =====
function showWin() {
  // ===== SAVE PLAYER RESULT =====
  if (roomCode) {
    saveMemoryResult();
  }

  const box = document.getElementById("resultBox");

  const card = box.querySelector(".result-card");

  card.classList.remove("lose-mode");

  document.getElementById("resultIcon").innerText = "👑";

  document.getElementById("resultTitle").innerText = "CHIẾN THẮNG";

  document.getElementById("finalAnswer").innerText = answer;

  box.classList.remove("hidden");

  if (typeof launchConfetti === "function") {
    launchConfetti();
  }

  const audio = new Audio("../assets/sounds/win.mp3");

  audio.volume = 0.6;

  audio.play();
}

async function saveMemoryResult() {
  try {
    const roomRes = await fetch(`http://127.0.0.1:5000/api/room/${roomCode}`);

    if (!roomRes.ok) return;

    const room = await roomRes.json();

    if (!room?.id) return;

    const playerName =
      sessionStorage.getItem("memory_player_name") || "Người chơi";

    // ===== CHECK EXIST =====
    const oldRes = await fetch(`http://127.0.0.1:5000/api/results/${room.id}`);

    const oldResults = await oldRes.json();

    const existed = oldResults.find(
      (r) => r.game_type === "memory" && r.player_name === playerName,
    );

    if (existed) {
      console.log("MEMORY RESULT EXIST");
      return;
    }

    // ===== SAVE DATABASE =====
    await fetch("http://127.0.0.1:5000/api/results", {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        room_id: room.id,

        game_type: "memory",

        player_name: playerName,

        team_name: null,

        score: 10,

        result_text: "WIN",

        extra_data: {
          status: "win",
        },

        match_id: null,
      }),
    });

    console.log("MEMORY RESULT SAVED");
  } catch (err) {
    console.error("SAVE MEMORY ERROR:", err);
  }
}

// ===== GUESS =====
function openGuess() {
  if (doneCount <= 0) {
    showToast("Bạn cần mở ít nhất 1 mảnh trước khi giải mã!", "warning");
    return;
  }

  document.getElementById("guessModal").classList.remove("hidden");
}

function closeGuess() {
  document.getElementById("guessModal").classList.add("hidden");
}

let pendingGuess = "";

function submitGuess() {
  const input = document
    .getElementById("guessInput")
    .value.trim()
    .toLowerCase();

  if (!input) {
    showToast("Nhập đáp án!", "warning");
    return;
  }

  pendingGuess = input;

  document.getElementById("confirmGuessModal").classList.remove("hidden");
}

function closeConfirmGuess() {
  document.getElementById("confirmGuessModal").classList.add("hidden");
}

function confirmSubmitGuess() {
  closeConfirmGuess();

  const correct = answer.trim().toLowerCase();

  clearInterval(guessTimer);

  document.getElementById("guessCountdown")?.classList.add("hidden");

  if (pendingGuess === correct) {
    revealAll();

    closeGuess();

    showWin();
  } else {
    closeGuess();

    showLose();
  }
}

function revealAll() {
  const board = document.getElementById("grid");
  const tiles = board.querySelectorAll(".tile");

  for (let i = 0; i < total; i++) {
    if (!opened[i]) {
      opened[i] = true;
      tiles[i].classList.add("opened");
    }
  }

  doneCount = total;
  updateProgress();
}

function toggleFullscreen() {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen();
  } else {
    document.exitFullscreen();
  }
}

function goBack() {
  const params = new URLSearchParams(window.location.search);

  const roomCode = params.get("room");

  // 👨‍🎓 vào bằng mã phòng
  if (roomCode) {
    window.location.href = "../index.html";
  }

  // 👨‍🏫 vào bình thường
  else {
    window.location.href = "memory.html";
  }
}
