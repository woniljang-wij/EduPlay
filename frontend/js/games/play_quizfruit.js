let game;
const urlParams = new URLSearchParams(window.location.search);
const gameId = urlParams.get("id");

const gameArea = document.getElementById("gameArea");
const slashSound = new Audio("../assets/sounds/slash.mp3");
slashSound.volume = 0.5;

let isMouseDown = false;

document.addEventListener("mousedown", () => (isMouseDown = true));
document.addEventListener("mouseup", () => (isMouseDown = false));

let fruits = [];
let mouseTrail = [];
let currentIndex = 0;
let score = 0;
let timer;
let timeLeft = 0;
let isProcessing = false;
let startTime;
let totalTime;
let rafTimer;
let isMuted = false;

const bgm = new Audio("../assets/sounds/bai4.mp3");
bgm.loop = true;
bgm.volume = 0.4;

const soundBtn = document.getElementById("soundBtn");

if (soundBtn) {
  soundBtn.onclick = () => {
    isMuted = !isMuted;

    bgm.muted = isMuted;
    slashSound.muted = isMuted;

    soundBtn.textContent = isMuted ? "🔇" : "🔊";

    localStorage.setItem("muted", isMuted);
  };

  // load trạng thái
  if (localStorage.getItem("muted") === "true") {
    isMuted = true;
    bgm.muted = true;
    slashSound.muted = true;
    soundBtn.textContent = "🔇";
  }
}

window.onload = () => {
  if (sessionStorage.getItem("playMusic") && !isMuted) {
    bgm.play().catch(() => {});
    sessionStorage.removeItem("playMusic");
  }
  document.addEventListener(
    "mousedown",
    () => {
      bgm.play().catch(() => {});
    },
    { once: true },
  );

  loadGame();
  startQuestion();
};

function confirmExit() {
  bgm.pause();
  window.location.href = "quizfruit.html";
}

function loadGame() {
  const id = new URLSearchParams(window.location.search).get("id");

  let games = JSON.parse(localStorage.getItem("fruitGames") || "[]");

  game = games.find((g) => String(g.id) === String(id));

  if (!game) {
    alert("Không tìm thấy game!");
    window.location.href = "quizfruit.html";
  }
}

let spawnLoop;

function startQuestion() {
  clearFruits();
  clearInterval(timer);
  clearInterval(spawnLoop);
  cancelAnimationFrame(rafTimer);

  const q = game.questions[currentIndex];
  if (!q) return endGame();

  renderQuestion(q);

  // ⚡ UI flash nhẹ
  const box = document.getElementById("questionBox");
  box.style.opacity = "0";
  box.style.transform = "translateX(-50%) translateY(-20px)";

  setTimeout(() => {
    box.style.transition = "all 0.3s ease";
    box.style.opacity = "1";
    box.style.transform = "translateX(-50%) translateY(0)";
  }, 50);

  // 🔥 TIMER MƯỢT
  const maxTime = parseInt(game.time) || 10;
  totalTime = maxTime * 1000; // ms
  startTime = Date.now();

  runTimer();

  // 🍉 spawn fruit
  spawnLoop = setInterval(() => {
    if (!isProcessing && fruits.length === 0) {
      spawnAnswers(q);
    }
  }, 800);
}

function runTimer() {
  cancelAnimationFrame(rafTimer);

  function loop() {
    const now = Date.now();
    const elapsed = now - startTime;

    let remaining = Math.max(0, totalTime - elapsed);
    timeLeft = Math.ceil(remaining / 1000);

    updateTimerSmooth(remaining / totalTime);

    if (remaining <= 0) {
      cancelAnimationFrame(rafTimer);
      clearInterval(spawnLoop);
      nextQuestion();
      return;
    }

    rafTimer = requestAnimationFrame(loop);
  }

  loop();
}

function renderQuestion(q) {
  let box = document.getElementById("questionBox");

  if (!box) {
    box = document.createElement("div");
    box.id = "questionBox";
    document.body.appendChild(box);
  }

  box.innerHTML = `
    <div class="q-top">
      Câu ${currentIndex + 1}/${game.questions.length} | Điểm: ${score}/10
    </div>
    <div class="q-text">${q.question}</div>
    <div class="q-answers">
      ${q.answers
        .map(
          (a, i) => `
        <div class="ans ans-${i}">
          ${a}
        </div>
      `,
        )
        .join("")}
    </div>
  `;
}

function updateTimerSmooth(percent) {
  let t = document.getElementById("timerBox");

  if (!t) {
    t = document.createElement("div");
    t.id = "timerBox";
    t.className = "timer-circle";
    document.body.appendChild(t);
  }

  const circumference = 283;
  const offset = circumference - circumference * percent;

  t.innerHTML = `
    <svg viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="45" class="bg"/>
      <circle cx="50" cy="50" r="45" class="progress"/>
    </svg>
    <div class="timer-text">${timeLeft}</div>
  `;

  const progress = t.querySelector(".progress");
  progress.style.strokeDashoffset = offset;

  // 🔥 danger
  if (percent <= 0.3) {
    t.classList.add("danger");
  } else {
    t.classList.remove("danger");
  }
}

function spawnAnswers(q) {
  const fruitTypes = ["watermelon.png", "tomato.png", "pear.png", "grape.png"];

  q.answers.forEach((answer, i) => {
    const fruitType = fruitTypes[i];

    const fruit = document.createElement("div");
    fruit.className = "fruit";

    fruit.innerHTML = `
      <img src="../assets/images/${fruitType}">
    `;

    gameArea.appendChild(fruit);

    // ✅ thêm vị trí & vận tốc
    const x = Math.random() * window.innerWidth;
    const y = window.innerHeight;

    const vx = (Math.random() - 0.5) * 8;
    const vy = -20 - Math.random() * 10;

    const obj = {
      el: fruit,
      x,
      y,
      vx,
      vy,
      alive: true,

      answer: answer,
      isCorrect: q.correct === i || String(answer) === String(q.correct),
      type: fruitType,
    };

    fruits.push(obj);

    // 🔥 QUAN TRỌNG NHẤT
    animateFruit(obj);
  });
}

function nextQuestion() {
  clearInterval(spawnLoop);
  clearInterval(timer);

  currentIndex++;

  if (currentIndex >= game.questions.length) {
    endGame();
    return;
  }

  startQuestion();
}

function clearFruits() {
  fruits.forEach((f) => f.el.remove());
  fruits = [];
}

function playSlash() {
  slashSound.currentTime = 0;
  slashSound.play().catch(() => {});
}

// 🎯 physics bay cong
function animateFruit(fruit) {
  const gravity = 0.5;

  function loop() {
    if (!fruit.alive) return;

    fruit.vy += gravity;
    fruit.vx *= 0.99;
    fruit.x += fruit.vx;
    fruit.y += fruit.vy;

    fruit.rotation = (fruit.rotation || 0) + 5;

    fruit.el.style.transform = `translate(${fruit.x}px, ${fruit.y}px) rotate(${fruit.rotation}deg)`;

    if (fruit.y > window.innerHeight + 100) {
      fruit.el.remove();
      fruit.alive = false;

      fruits = fruits.filter((f) => f !== fruit);
      return;
    }

    requestAnimationFrame(loop);
  }

  loop();
}
// 🖱️ swipe detection
let lastPoint = null;

document.addEventListener("mousemove", (e) => {
  if (!isMouseDown) {
    lastPoint = null;
    return;
  }

  const current = { x: e.clientX, y: e.clientY };

  if (lastPoint) {
    createSlashLine(lastPoint, current);
  }

  lastPoint = current;

  mouseTrail.push(current);
  if (mouseTrail.length > 5) mouseTrail.shift();

  checkSlice();
});

function createSlashLine(p1, p2) {
  const slash = document.createElement("div");
  slash.className = "slash-line";

  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const length = Math.sqrt(dx * dx + dy * dy);

  const angle = Math.atan2(dy, dx) * (180 / Math.PI);

  slash.style.width = length + "px";
  slash.style.left = p1.x + "px";
  slash.style.top = p1.y + "px";
  slash.style.transform = `rotate(${angle}deg)`;

  gameArea.appendChild(slash);

  setTimeout(() => slash.remove(), 200);
}

//vệt chém
function createSlash(x, y) {
  const slash = document.createElement("div");
  slash.className = "slash";

  slash.style.left = x + "px";
  slash.style.top = y + "px";

  gameArea.appendChild(slash);

  setTimeout(() => slash.remove(), 300);
}

// 🎯 check chém
function checkSlice() {
  for (let fruit of fruits) {
    if (!fruit.alive) continue;

    const rect = fruit.el.getBoundingClientRect();

    for (let p of mouseTrail) {
      if (
        p.x > rect.left &&
        p.x < rect.right &&
        p.y > rect.top &&
        p.y < rect.bottom
      ) {
        sliceFruit(fruit);
        mouseTrail = [];
        return;
      }
    }
  }
}

// 🔥 chém trái
function sliceFruit(fruit) {
  if (!fruit.alive || isProcessing) return;

  isProcessing = true;

  fruit.alive = false;
  fruit.el.remove();

  playSlash();

  if (fruit.isCorrect) {
    score++;
    showEffect("ĐÚNG ✅");
  } else {
    showEffect("SAI ❌");
  }

  createHalf(fruit, -5);
  createHalf(fruit, 5);
  createSplash(fruit.x, fruit.y, fruit.type);

  clearInterval(timer);
  clearInterval(spawnLoop);
  cancelAnimationFrame(rafTimer);
  mouseTrail = [];

  setTimeout(() => {
    clearFruits();
    isProcessing = false;

    currentIndex++;

    if (currentIndex >= game.questions.length) {
      endGame();
    } else {
      startQuestion();
    }
  }, 800);
}

function showEffect(text) {
  const e = document.createElement("div");
  e.innerText = text;
  e.style.position = "absolute";
  e.style.top = "40%";
  e.style.left = "50%";
  e.style.transform = "translate(-50%, -50%)";
  e.style.fontSize = "40px";
  e.style.color = "white";

  gameArea.appendChild(e);

  setTimeout(() => e.remove(), 800);
}

// ✂️ tạo 2 nửa
function createHalf(fruit, dir) {
  const half = document.createElement("img");

  // 🔥 dùng lại ảnh gốc
  half.src = `../assets/images/${fruit.type}`;

  half.className = "half";

  // 🔥 phân trái / phải bằng CSS
  if (dir < 0) {
    half.classList.add("left");
  } else {
    half.classList.add("right");
  }

  gameArea.appendChild(half);

  let x = fruit.x;
  let y = fruit.y;
  let vx = dir * 4; // bay mạnh hơn
  let vy = -8; // nảy lên mạnh hơn
  let rotation = Math.random() * 360;

  function loop() {
    vy += 0.5;
    x += vx;
    y += vy;
    rotation += 8;

    half.style.transform = `translate(${x}px, ${y}px) rotate(${rotation}deg)`;

    if (y > window.innerHeight + 100) {
      half.remove();
      return;
    }

    requestAnimationFrame(loop);
  }

  loop();
}

// 💦 splash
function createSplash(x, y, type) {
  const splash = document.createElement("div");
  splash.className = "splash";

  let color = "red";

  if (type.includes("grape")) color = "#a020f0";
  if (type.includes("pear")) color = "#7CFC00";
  if (type.includes("watermelon")) color = "#ff3b3b";
  if (type.includes("tomato")) color = "#ff0000";

  splash.style.background = `radial-gradient(circle, ${color}, transparent)`;

  splash.style.left = x + "px";
  splash.style.top = y + "px";

  splash.style.transform = "translate(-50%, -50%) scale(0.5)";
  splash.style.opacity = "1";

  gameArea.appendChild(splash);

  // animation
  setTimeout(() => {
    splash.style.transform = "translate(-50%, -50%) scale(2)";
    splash.style.opacity = "0";
  }, 10);

  setTimeout(() => splash.remove(), 400);
}

function openExit() {
  document.getElementById("exitModal").style.display = "flex";
}

function closeExit() {
  document.getElementById("exitModal").style.display = "none";
}

function endGame() {
  const modal = document.createElement("div");
  modal.className = "end-modal";

  const finalScore = ((score / game.questions.length) * 10).toFixed(1);

  const message =
    finalScore >= 8
      ? "Tuyệt vời! 🏆"
      : finalScore >= 5
        ? "Tốt lắm! 👍"
        : "Cố gắng hơn nhé! 💪";

  modal.innerHTML = `
  <div class="end-box">
    <h2 class="end-title">${message}</h2>
    
    <div class="end-score">${finalScore}/10</div>

    <p class="end-sub">
      Bạn đã chém ${game.questions.length} câu!
    </p>

    <div class="end-actions">
      <button class="btn-replay" onclick="replayGame()">
        🔄 Chơi lại
      </button>
      <button class="btn-exit" onclick="location.href='quizfruit.html'">
        🚪 Thoát
      </button>
    </div>
  </div>
`;

  document.body.appendChild(modal);
  animateScore(finalScore);
  flashWin();
  if (typeof launchConfetti === "function") launchConfetti();
  if (typeof playVictorySound === "function") playVictorySound();
}

function launchConfetti() {
  for (let i = 0; i < 80; i++) {
    const c = document.createElement("div");
    c.className = "confetti";

    c.style.left = Math.random() * 100 + "vw";
    c.style.background = `hsl(${Math.random() * 360}, 100%, 60%)`;
    c.style.animationDuration = 2 + Math.random() * 2 + "s";

    document.body.appendChild(c);

    setTimeout(() => c.remove(), 4000);
  }
}

function animateScore(finalScore) {
  const el = document.querySelector(".end-score");
  let current = 0;

  const interval = setInterval(() => {
    current += 0.2;
    if (current >= finalScore) {
      current = finalScore;
      clearInterval(interval);
    }
    el.textContent = current.toFixed(1) + "/10";
  }, 30);
}

function flashWin() {
  const flash = document.createElement("div");
  flash.style.position = "fixed";
  flash.style.inset = 0;
  flash.style.background = "white";
  flash.style.opacity = "0.5";
  flash.style.zIndex = 9998;

  document.body.appendChild(flash);
  setTimeout(() => flash.remove(), 120);
}

function playVictorySound() {
  const audio = new Audio("../assets/sounds/victory.mp3");
  audio.volume = 0.6;
  audio.play();
}

function replayGame() {
  sessionStorage.setItem("playMusic", "1");
  location.reload();
}
