let timerRAF = null;
let timerStart = 0;
let timerDuration = 0;

// ===== LOAD GAME =====
const params = new URLSearchParams(window.location.search);
const id = parseInt(params.get("id"));

const games = JSON.parse(localStorage.getItem("memoryGames")) || [];
const game = games.find((g) => g.id === id);

if (!game) {
  showToast("Không tìm thấy game!", "error");
  setTimeout(() => {
    window.location.href = "memory.html";
  }, 1200);
}

// ===== DATA =====
const gridSize = parseInt(game.grid);
const total = gridSize * gridSize;

let questions = [...(game.questions || [])];
questions.sort(() => Math.random() - 0.5);

if (questions.length < total) {
  showToast("Số câu hỏi không đủ!", "error");
  setTimeout(() => {
    window.location.href = "memory.html";
  }, 1200);
}

const imageUrl = game.image;
const answer = game.answer || game.name || "???";
const theme = game.theme || "blue";
timerDuration = parseInt(game.time) || 0;

const guessDuration = parseInt(game.guessTime) || 0;

let guessTimer = null;
let guessRemain = guessDuration;

// ===== STATE =====
let opened = Array(total).fill(false);
let currentIndex = null;
let doneCount = 0;
let selectedAnswer = null;

// ===== INIT =====
window.onload = () => {
  document.getElementById("gameTitle").innerText = game.title || "Memory Game";

  renderGrid();
  updateProgress();
};

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

  // ===== TIMER UI =====
  const timerWrap = document.querySelector(".timer-wrap");

  if (timerDuration <= 0) {
    timerWrap.style.display = "none";
  } else {
    timerWrap.style.display = "block";
    startQuestionTimer();
  }

  document.getElementById("questionModal").classList.remove("hidden");
}

// ===== SUBMIT =====
function submitAnswer() {
  cancelAnimationFrame(timerRAF);

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

  if (doneCount === total) {
    startGuessCountdown();
  }
}

// ===== PROGRESS =====
function updateProgress() {
  const percent = Math.floor((doneCount / total) * 100);

  document.getElementById("progressText").innerText = percent + "%";

  document.getElementById("progressBar").style.width = percent + "%";
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

      showLose();
    }
  }, 1000);
}

// ===== LOSE =====
function showLose() {
  closeGuess();

  showToast("❌ Hết thời gian giải mã!", "error");

  const audio = new Audio("../assets/sounds/lose.mp3");

  audio.volume = 0.6;
  audio.play();

  revealAll();

  const box = document.getElementById("resultBox");

  const card = box.querySelector(".result-card");

  card.classList.add("lose-mode");

  document.getElementById("resultIcon").innerText = "💀";

  document.getElementById("resultTitle").innerText = "THẤT BẠI";

  document.getElementById("finalAnswer").innerText = answer;

  box.classList.remove("hidden");
}

// ===== WIN =====
function showWin() {
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

// ===== GUESS =====
function openGuess() {
  document.getElementById("guessModal").classList.remove("hidden");
}

function closeGuess() {
  document.getElementById("guessModal").classList.add("hidden");
}

function submitGuess() {
  const input = document
    .getElementById("guessInput")
    .value.trim()
    .toLowerCase();

  if (!input) {
    showToast("Nhập đáp án!", "warning");
    return;
  }

  const correct = answer.toLowerCase();

  if (input === correct) {
    showToast("🎉 Chính xác!", "success");

    // stop countdown
    clearInterval(guessTimer);

    // hide timer UI
    document.getElementById("guessCountdown")?.classList.add("hidden");

    revealAll();

    closeGuess();

    showWin();
  } else {
    showToast("Sai rồi!", "error");
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

// ===== NAV =====
function goBack() {
  window.location.href = "memory.html";
}
