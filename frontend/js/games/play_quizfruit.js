let game;
const urlParams = new URLSearchParams(window.location.search);
const gameId = urlParams.get("id");

const gameArea = document.getElementById("gameArea");

document.addEventListener("dragstart", (e) => {
  e.preventDefault();
});

document.addEventListener("selectstart", (e) => {
  e.preventDefault();
});

const slashSound = new Audio("../assets/sounds/slash.mp3");
slashSound.volume = 0.5;

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
let endVideoSkipped = false;

let isMouseDown = false;

document.addEventListener("mousedown", (e) => {
  if (e.button !== 0) return;

  const modal = document.getElementById("exitModal");

  if (modal && modal.style.display === "flex") {
    return;
  }

  isMouseDown = true;
});

document.addEventListener("mouseup", () => {
  isMouseDown = false;
});

let speedConfig = {
  fast: 1.5,
  medium: 1,
  slow: 0.5,
};

let speedMultiplier = 1;

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

function loadGame() {
  const id = new URLSearchParams(window.location.search).get("id");

  let games = JSON.parse(localStorage.getItem("fruitGames") || "[]");

  game = games.find((g) => String(g.id) === String(id));

  if (!game) {
    alert("Không tìm thấy game!");
    window.location.href = "quizfruit.html";
    return;
  }

  speedMultiplier = speedConfig[game.speed] || 1;
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

  const box = document.getElementById("questionBox");
  box.style.opacity = "0";
  box.style.transform = "translateX(-50%) translateY(-20px)";

  setTimeout(() => {
    box.style.transition = "all 0.3s ease";
    box.style.opacity = "1";
    box.style.transform = "translateX(-50%) translateY(0)";
  }, 50);

  const maxTime = parseInt(game.time) || 10;
  totalTime = maxTime * 1000;
  startTime = Date.now();

  runTimer();

  spawnLoop = setInterval(() => {
    if (!isProcessing && fruits.length === 0) {
      spawnAnswers(q);
    }
  }, 800 / speedMultiplier);
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

      showEffect("timeout");
      shakeScreen();

      setTimeout(() => {
        nextQuestion();
      }, 900);

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
  <div class="timer-ring-spin"></div>

  <svg viewBox="0 0 100 100">
    <circle cx="50" cy="50" r="45" class="bg"/>
    <circle cx="50" cy="50" r="45" class="progress"/>
  </svg>

  <div class="timer-core">
    <div class="timer-text">${timeLeft}</div>
  </div>

  <div class="timer-particle"
    style="
      animation-duration: 4s;
    ">
  </div>

  <div class="timer-particle"
    style="
      animation-duration: 5s;
      width:8px;
      height:8px;
    ">
  </div>
`;
  const progress = t.querySelector(".progress");
  progress.style.strokeDashoffset = offset;

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
      <img
        src="../assets/images/${fruitType}"
        draggable="false"
      >
    `;

    const img = fruit.querySelector("img");

    img.draggable = false;

    gameArea.appendChild(fruit);

    const x = Math.random() * window.innerWidth;

    const y = window.innerHeight + 50;

    const vx = (Math.random() - 0.5) * 8 * speedMultiplier;

    const vy = (-20 - Math.random() * 10) * speedMultiplier;

    const obj = {
      el: fruit,

      x,
      y,

      vx,
      vy,

      alive: true,

      answer: answer,

      isCorrect: q.correct === i,

      type: fruitType,
    };

    fruits.push(obj);

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
  const line = document.createElement("div");

  line.className = "slash-line";

  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;

  const length = Math.sqrt(dx * dx + dy * dy);

  const angle = (Math.atan2(dy, dx) * 180) / Math.PI;

  line.style.width = length + "px";

  line.style.left = p1.x + "px";
  line.style.top = p1.y + "px";

  line.style.transform = `
    rotate(${angle}deg)
  `;

  gameArea.appendChild(line);

  setTimeout(() => {
    line.remove();
  }, 180);
}

function spawnJuiceExplosion(x, y, color) {
  // 🔥 GIỌT NHỎ
  for (let i = 0; i < 35; i++) {
    createJuiceDrop(x, y, color, false);
  }

  // 🔥 GIỌT TO
  for (let i = 0; i < 10; i++) {
    createJuiceDrop(x, y, color, true);
  }

  // 🔥 VẾT NƯỚC TRUNG TÂM
  createGroundSplash(x, y, color);
}

function createJuiceDrop(x, y, color, big = false) {
  const drop = document.createElement("div");

  drop.className = "juice-drop";

  const size = big ? 18 + Math.random() * 20 : 5 + Math.random() * 10;

  drop.style.width = size + "px";
  drop.style.height = size + "px";

  drop.style.left = x + "px";
  drop.style.top = y + "px";

  drop.style.background = color;

  gameArea.appendChild(drop);

  const angle = Math.random() * Math.PI * 2;

  const speed = big ? 10 + Math.random() * 10 : 6 + Math.random() * 12;

  let px = 0;
  let py = 0;

  let vx = Math.cos(angle) * speed;

  let vy = Math.sin(angle) * speed;

  let life = 0;

  const gravity = 0.55;

  const maxLife = 30 + Math.random() * 20;

  function loop() {
    life++;

    vy += gravity;

    px += vx;
    py += vy;

    vx *= 0.985;

    const opacity = 1 - life / maxLife;

    drop.style.opacity = opacity;

    drop.style.transform = `
      translate(${px}px, ${py}px)
      scale(${opacity})
    `;

    if (life === maxLife - 1) {
      createGroundSplash(x + px, y + py, color);
    }

    if (life < maxLife) {
      requestAnimationFrame(loop);
    } else {
      drop.remove();
    }
  }

  requestAnimationFrame(loop);
}

function createGroundSplash(x, y, color) {
  const splash = document.createElement("div");

  splash.className = "ground-splash";

  const width = 120 + Math.random() * 90;

  const height = 80 + Math.random() * 60;

  splash.style.width = width + "px";

  splash.style.height = height + "px";

  splash.style.left = x - width / 2 + "px";

  splash.style.top = y - height / 2 + "px";

  splash.style.setProperty("--juice-color", color);

  splash.style.setProperty("--rot", `${Math.random() * 360}deg`);

  gameArea.appendChild(splash);

  setTimeout(() => {
    splash.remove();
  }, 2000);
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

    showEffect("good");
  } else {
    showEffect("bad");
  }

  createHalf(fruit, -5);
  createHalf(fruit, 5);

  let juiceColor = "#ff3b3b";

  if (fruit.type.includes("grape")) {
    juiceColor = "#9333ea";
  }

  if (fruit.type.includes("pear")) {
    juiceColor = "#84cc16";
  }

  if (fruit.type.includes("tomato")) {
    juiceColor = "#ff2d2d";
  }

  spawnJuiceExplosion(fruit.x, fruit.y, juiceColor);

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

function showEffect(type) {
  const goodTexts = ["PERFECT", "GREAT", "CORRECT"];

  const badTexts = ["MISS", "WRONG", "OOPS"];

  const timeoutTexts = ["TIME OUT"];

  const e = document.createElement("div");

  e.className = `hit-effect ${type}`;

  if (type === "good") {
    e.innerText = goodTexts[Math.floor(Math.random() * goodTexts.length)];
  } else if (type === "timeout") {
    e.innerText = timeoutTexts[Math.floor(Math.random() * timeoutTexts.length)];
  } else {
    e.innerText = badTexts[Math.floor(Math.random() * badTexts.length)];
  }

  document.body.appendChild(e);
  createHitBurst(type);
  requestAnimationFrame(() => {
    e.classList.add("show");
  });

  setTimeout(() => {
    e.classList.add("hide");
  }, 900);

  setTimeout(() => {
    e.remove();
  }, 1500);
}

function createHitBurst(type) {
  const burst = document.createElement("div");

  burst.className = `hit-burst ${type}`;

  burst.style.left = "50%";
  burst.style.top = "50%";

  document.body.appendChild(burst);

  // ========================
  // LIGHT RAYS
  // ========================

  for (let i = 0; i < 10; i++) {
    const ray = document.createElement("div");

    ray.className = `hit-ray ${type}`;

    ray.style.setProperty("--rot", `${i * 36}deg`);

    burst.appendChild(ray);
  }

  // ========================
  // PARTICLES
  // ========================

  for (let i = 0; i < 22; i++) {
    const p = document.createElement("div");

    p.className = `hit-particle ${type}`;

    const angle = Math.random() * Math.PI * 2;

    const dist = 80 + Math.random() * 120;

    p.style.setProperty("--x", `${Math.cos(angle) * dist}px`);

    p.style.setProperty("--y", `${Math.sin(angle) * dist}px`);

    burst.appendChild(p);
  }

  setTimeout(() => {
    burst.remove();
  }, 900);
}

function createHalf(fruit, dir) {
  const half = document.createElement("img");

  half.src = `../assets/images/${fruit.type}`;

  half.className = "half";

  half.draggable = false;

  half.style.pointerEvents = "none";

  if (dir < 0) {
    half.classList.add("left");
  } else {
    half.classList.add("right");
  }

  gameArea.appendChild(half);

  let x = fruit.x;
  let y = fruit.y;

  let vx = dir * 5;
  let vy = -10;

  let rotation = Math.random() * 360;

  function loop() {
    vy += 0.55;

    x += vx;
    y += vy;

    rotation += 8;

    half.style.transform = `
      translate(${x}px, ${y}px)
      rotate(${rotation}deg)
    `;

    if (y > window.innerHeight + 200) {
      half.remove();

      return;
    }

    requestAnimationFrame(loop);
  }

  requestAnimationFrame(loop);
}

function openExit() {
  isMouseDown = false;
  mouseTrail = [];

  const modal = document.getElementById("exitModal");

  modal.style.display = "flex";

  requestAnimationFrame(() => {
    modal.classList.add("show");
  });
}

function closeExit() {
  const modal = document.getElementById("exitModal");

  modal.classList.remove("show");

  setTimeout(() => {
    modal.style.display = "none";
  }, 250);
}

function endGame() {
  const total = game.questions.length;
  const correct = score;

  bgm.pause();

  document.querySelector(".game-controls").style.display = "none";

  showEndScene(correct, total);
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

function shakeScreen() {
  document.body.classList.add("screen-shake");

  setTimeout(() => {
    document.body.classList.remove("screen-shake");
  }, 450);
}

function showEndScene(correct, total) {
  const scene = document.getElementById("endScene");

  const video = document.getElementById("endVideo");

  const overlay = document.getElementById("endOverlay");

  const title = document.getElementById("endTitle");

  const scoreEl = document.getElementById("endScore");

  overlay.classList.add("hidden");

  video.currentTime = 0;

  endVideoSkipped = false;

  const finalScore = (correct / total) * 10;

  if (finalScore >= 9) {
    const victoryVideos = [
      "../assets/videos/Victory.mp4",
      "../assets/videos/Victory1.mp4",
    ];

    const randomIndex = Math.floor(Math.random() * victoryVideos.length);

    video.src = victoryVideos[randomIndex];

    title.innerText = finalScore === 10 ? "PERFECT!" : "CHIẾN THẮNG!";
  } else {
    video.src = "../assets/videos/Defeat.mp4";

    title.innerText = "THẤT BẠI!";
  }

  let rankMedia = "";

  if (finalScore === 10) {
    rankMedia = `
      <video class="rank-video sss"
        autoplay
        muted
        loop
        playsinline>

        <source
          src="../assets/videos/T1Limited.mp4"
          type="video/mp4">
      </video>
    `;
  } else if (finalScore >= 9) {
    rankMedia = `
      <video class="rank-video ss"
        autoplay
        muted
        loop
        playsinline>

        <source
          src="../assets/videos/T2Limited.mp4"
          type="video/mp4">
      </video>
    `;
  } else if (finalScore >= 7) {
    rankMedia = `<img src="../assets/images/T25limited.png">`;
  } else if (finalScore >= 5) {
    rankMedia = `<img src="../assets/images/T35limited.png">`;
  } else {
    rankMedia = `<img src="../assets/images/T6limited.png">`;
  }

  document.querySelectorAll(".rank-img").forEach((el) => el.remove());

  title.insertAdjacentHTML(
    "beforebegin",
    `
      <div class="rank-img">
        ${rankMedia}
      </div>
    `,
  );

  scoreEl.innerHTML = `
    <div class="score-line">
      🎯 ${correct}/${total} câu đúng
    </div>

    <div class="score-line">
      ⭐ ${finalScore.toFixed(1)}/10 điểm
    </div>
  `;

  scene.classList.remove("hidden");

  video.play();

  function finishEndVideo() {
    if (endVideoSkipped) return;

    endVideoSkipped = true;

    video.pause();

    video.currentTime = Math.max(0, video.duration - 0.05);

    video.style.filter = "brightness(0.5) blur(3px)";

    overlay.classList.remove("hidden");

    if (finalScore >= 9 && typeof launchConfetti === "function") {
      launchConfetti();
    }

    if (finalScore === 10 && typeof launchConfetti === "function") {
      setTimeout(() => {
        launchConfetti();
      }, 200);
    }
  }

  video.onended = () => {
    finishEndVideo();
  };

  scene.onclick = () => {
    finishEndVideo();
  };
}

function replayGame() {
  document.querySelector(".game-controls").style.display = "none";
  sessionStorage.setItem("playMusic", "1");
  location.reload();
}

function confirmExit() {
  bgm.pause();
  window.location.href = "quizfruit.html";
}
