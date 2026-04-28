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
timerDuration = parseInt(game.time) || 0;

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

      tile.className = "tile";
      tile.innerText = i + 1;

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
  startQuestionTimer();
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

  if (doneCount === total) showWin();
}

// ===== PROGRESS =====
function updateProgress() {
  const percent = Math.floor((doneCount / total) * 100);

  document.getElementById("progressText").innerText = percent + "%";

  document.getElementById("progressBar").style.width = percent + "%";
}

// ===== WIN =====
function showWin() {
  document.getElementById("winBox").classList.remove("hidden");
  document.getElementById("finalAnswer").innerText = answer;

  launchConfetti();

  const audio = new Audio("../assets/sounds/win.mp3");
  audio.volume = 0.6;
  audio.play();
}

function launchConfetti() {
  const colors = [
    "#ff4d4d",
    "#22c55e",
    "#3b82f6",
    "#facc15",
    "#a855f7",
    "#ec4899",
  ];

  const shapes = ["circle", "square", "triangle"];

  for (let i = 0; i < 100; i++) {
    const el = document.createElement("div");

    const size = Math.random() * 10 + 6;
    const color = colors[Math.floor(Math.random() * colors.length)];
    const shape = shapes[Math.floor(Math.random() * shapes.length)];

    // 🎯 spawn từ giữa màn hình
    el.style.position = "fixed";
    el.style.top = "50vh";
    el.style.left = "50vw";
    el.style.zIndex = 9999;

    // 🎨 shape
    if (shape === "circle") {
      el.style.width = size + "px";
      el.style.height = size + "px";
      el.style.borderRadius = "50%";
      el.style.background = color;
    } else if (shape === "square") {
      el.style.width = size + "px";
      el.style.height = size + "px";
      el.style.background = color;
    } else {
      el.style.width = "0";
      el.style.height = "0";
      el.style.borderLeft = size / 2 + "px solid transparent";
      el.style.borderRight = size / 2 + "px solid transparent";
      el.style.borderBottom = size + "px solid " + color;
    }

    document.body.appendChild(el);

    const angle = Math.random() * 2 * Math.PI;
    const distance = Math.random() * 400 + 150;
    const rotate = Math.random() * 720;
    const duration = 1200 + Math.random() * 800;

    el.animate(
      [
        {
          transform: `translate(-50%, -50%) scale(1)`,
          opacity: 1,
        },
        {
          transform: `
          translate(
            calc(-50% + ${Math.cos(angle) * distance}px),
            calc(-50% + ${Math.sin(angle) * distance}px)
          )
          rotate(${rotate}deg)
          scale(0.6)
        `,
          opacity: 0,
        },
      ],
      {
        duration: duration,
        easing: "ease-out",
      },
    );

    setTimeout(() => el.remove(), duration);
  }
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
