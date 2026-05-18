// ===== GET GAME =====

const params = new URLSearchParams(window.location.search);

const gameId = Number(params.get("id"));

const roomCode = params.get("room");

const isJoin = params.get("join");

let game = null;
let blueTeamName = "";
let redTeamName = "";

// lưu tên đội vào room
const rooms = JSON.parse(localStorage.getItem("dragonboat_rooms")) || [];

const roomIndex = rooms.findIndex(
  (r) => String(r.roomCode) === String(roomCode),
);

if (roomIndex !== -1) {
  rooms[roomIndex].blueTeamName = blueTeamName;

  rooms[roomIndex].redTeamName = redTeamName;

  localStorage.setItem("dragonboat_rooms", JSON.stringify(rooms));
}

// ===============================
// TEACHER PLAY DIRECT
// ===============================

if (gameId) {
  const games = JSON.parse(localStorage.getItem("dragonboatGames")) || [];

  game = games.find((g) => g.id === gameId);
}

// ===============================
// STUDENT JOIN ROOM
// ===============================
else if (roomCode) {
  const rooms = JSON.parse(localStorage.getItem("dragonboat_rooms")) || [];

  const room = rooms.find(
    (r) => String(r.roomCode).trim() === String(roomCode).trim(),
  );

  if (room) {
    const games = JSON.parse(localStorage.getItem("dragonboatGames")) || [];

    game = games.find((g) => String(g.id) === String(room.gameId));
  }
}

console.log("GAME DATA:", game);

// ===== GAME DATA =====

const gameTitle = game?.title || "Đua Thuyền Rồng";

const gameMusic = game?.music || "";

const gameDuration = parseInt(game?.duration || 60);

const freezeTime = parseInt(game?.freeze || 3);

const winScore = parseInt(game?.winScore || 3);

const teamBlue = game?.players?.[0] || "Đội Xanh";

const teamRed = game?.players?.[1] || "Đội Đỏ";

// ===== TITLE =====

const titleEl = document.getElementById("gameTitle");

if (titleEl) {
  titleEl.textContent = gameTitle;
}

// ===== QUESTIONS =====

const questions = game?.questions || [];
const raceTrack = document.querySelector(".race-track");

const totalQuestions = questions.length;

const checkpoints = [];

for (let i = 0; i < totalQuestions; i++) {
  const checkpoint = document.createElement("div");

  checkpoint.className = "checkpoint";

  const percent = ((i + 1) / (totalQuestions + 1)) * 100;

  checkpoint.style.left = `calc(${percent}% - 12px)`;

  raceTrack.appendChild(checkpoint);

  checkpoints.push(percent);
}

// ===== TEAM =====

document.querySelector(".team-blue-name").textContent = teamBlue;

document.querySelector(".team-red-name").textContent = teamRed;

// ===== MUSIC =====

const bgMusic = document.getElementById("bgMusic");

const victorySound = document.getElementById("victorySound");

const musicBtn = document.getElementById("musicBtn");

let muted = false;

if (bgMusic && gameMusic) {
  const requestDB = indexedDB.open("EduPlayDB", 1);

  requestDB.onsuccess = (e) => {
    const db = e.target.result;

    const tx = db.transaction("music", "readonly");

    const req = tx.objectStore("music").get(gameMusic);

    req.onsuccess = () => {
      // ===== CUSTOM MUSIC =====
      if (req.result) {
        const file = req.result.file;

        const url = URL.createObjectURL(file);

        bgMusic.src = url;
      }

      // ===== DEFAULT MUSIC =====
      else {
        bgMusic.src = gameMusic;
      }

      bgMusic.loop = true;

      bgMusic.volume = 0.6;

      bgMusic.autoplay = true;

      bgMusic.muted = true;

      const startMusic = () => {
        bgMusic
          .play()
          .then(() => {
            setTimeout(() => {
              bgMusic.muted = false;
            }, 300);
          })
          .catch((err) => {
            console.log("Music blocked:", err);
          });

        document.removeEventListener("click", startMusic);
      };

      startMusic();

      document.addEventListener("click", startMusic);
    };
  };
}

// ===== MUTE =====

if (musicBtn) {
  musicBtn.onclick = () => {
    muted = !muted;

    bgMusic.muted = muted;

    musicBtn.innerHTML = muted ? "🔇" : "🔊";
  };
}

// ===== FULLSCREEN =====

const fullscreenBtn = document.getElementById("fullscreenBtn");

if (fullscreenBtn) {
  fullscreenBtn.onclick = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };
}

// ===== EXIT =====
const exitBtn = document.getElementById("exitBtn");

if (exitBtn) {
  exitBtn.onclick = () => {
    if (isJoin) {
      window.location.href = "/index.html";
    } else {
      window.location.href = "/games/dragonboat.html";
    }
  };
}

// ===== QUESTION =====
let blueQuestionIndex = 0;
let redQuestionIndex = 0;
let blueFrozen = false;
let redFrozen = false;
let gameEnded = false;

function renderQuestion() {
  renderTeamQuestion("blue");
  renderTeamQuestion("red");
}

function renderTeamQuestion(team) {
  const index = team === "blue" ? blueQuestionIndex : redQuestionIndex;

  const q = questions[index];

  if (!q) return;

  const questionBox = team === "blue" ? ".blue-question" : ".red-question";

  const answerBox = team === "blue" ? ".blue-answers" : ".red-answers";

  document.querySelector(questionBox).innerHTML = `<p>${q.question}</p>`;

  renderAnswers(answerBox, q, team);
}

function renderAnswers(container, q, team) {
  const box = document.querySelector(container);

  if (!box) return;

  box.innerHTML = "";

  q.answers.forEach((answer, index) => {
    const btn = document.createElement("button");

    btn.className = "answer-btn";

    btn.innerHTML = `<span>${answer}</span>`;

    btn.onclick = () => {
      chooseAnswer(index, team);
    };

    box.appendChild(btn);
  });
}

// ===== MOVE =====

let bluePos = 0;
let redPos = 0;

function moveBoat(team) {
  if (team === "blue") {
    bluePos++;

    const percent = checkpoints[Math.min(bluePos - 1, checkpoints.length - 1)];

    document.querySelector(".blue-racer").style.left =
      `calc(${percent}% - 22px)`;
  }

  if (team === "red") {
    redPos++;

    const percent = checkpoints[Math.min(redPos - 1, checkpoints.length - 1)];

    document.querySelector(".red-racer").style.left =
      `calc(${percent}% - 22px)`;
  }
}

// ===== ANSWER =====
let locked = false;
function chooseAnswer(index, team) {
  if (gameEnded) return;

  if (team === "blue" && blueFrozen) return;
  if (team === "red" && redFrozen) return;

  const questionIndex = team === "blue" ? blueQuestionIndex : redQuestionIndex;

  const q = questions[questionIndex];

  if (!q) return;

  const isCorrect = index === q.correct;

  // ===== ĐÚNG =====
  if (isCorrect) {
    moveBoat(team);

    if (team === "blue") {
      blueQuestionIndex++;

      const score = document.getElementById("blueScore");

      score.textContent = Number(score.textContent) + 1;
    }

    if (team === "red") {
      redQuestionIndex++;

      const score = document.getElementById("redScore");

      score.textContent = Number(score.textContent) + 1;
    }

    checkWinner();
  }

  // ===== SAI =====
  else {
    freezeTeam(team);
  }

  renderQuestion();
}

function freezeTeam(team) {
  const freezeBox =
    team === "blue"
      ? document.querySelector(".blue-panel")
      : document.querySelector(".red-panel");

  freezeBox.classList.add("frozen");

  freezeBox.insertAdjacentHTML(
    "beforeend",
    `
      <div class="freeze-overlay">

        <div class="freeze-glow"></div>

        <div class="freeze-icon">
          ❄️
        </div>

        <div class="freeze-text">
          ĐÓNG BĂNG
        </div>

        <div class="freeze-time">
          ${freezeTime}
        </div>

        <div class="freeze-desc">
          Trả lời sai • Mất lượt tạm thời
        </div>

      </div>
    `,
  );

  if (team === "blue") {
    blueFrozen = true;
  } else {
    redFrozen = true;
  }

  const overlay = freezeBox.querySelector(".freeze-overlay");

  const timeEl = overlay.querySelector(".freeze-time");

  let remain = freezeTime;

  const interval = setInterval(() => {
    remain--;

    if (remain > 0) {
      timeEl.textContent = remain;
    }
  }, 1000);

  setTimeout(() => {
    clearInterval(interval);

    freezeBox.classList.remove("frozen");

    overlay.remove();

    if (team === "blue") {
      blueFrozen = false;
    } else {
      redFrozen = false;
    }
  }, freezeTime * 1000);
}

function checkWinner() {
  const blue = Number(document.getElementById("blueScore").textContent);

  const red = Number(document.getElementById("redScore").textContent);

  // ===== WIN BY FINISH =====
  if (blueQuestionIndex >= questions.length) {
    showWinner(blueTeamName || teamBlue);
    return;
  }

  if (redQuestionIndex >= questions.length) {
    showWinner(redTeamName || teamRed);
    return;
  }

  // ===== WIN BY GAP =====
  if (blue - red >= winScore) {
    showWinner(blueTeamName || teamBlue);
    return;
  }

  if (red - blue >= winScore) {
    showWinner(redTeamName || teamRed);
    return;
  }
}

function showWinner(teamName) {
  if (gameEnded) return;

  saveDragonBoatResult(teamName);

  gameEnded = true;

  // ===== STOP GAME =====

  clearInterval(timerInterval);

  blueFrozen = true;
  redFrozen = true;

  // ===== STOP MUSIC =====

  if (bgMusic) {
    bgMusic.pause();
  }

  // ===== PLAY VICTORY =====

  if (victorySound) {
    victorySound.src = "../assets/sounds/win.mp3";

    victorySound.volume = 1;

    victorySound.currentTime = 0;

    victorySound.play().catch(() => {});
  }

  // ===== SHOW POPUP =====

  const popup = document.getElementById("winnerPopup");

  const winnerText = document.getElementById("winnerTeam");

  const winnerSub = popup.querySelector(".winner-sub");

  winnerText.textContent = teamName;

  if (teamName === "Hòa") {
    winnerSub.textContent = "Hai đội ngang tài ngang sức!";
  } else {
    winnerSub.textContent = "đã giành chiến thắng!";
  }

  popup.classList.remove("hidden");
  document.body.classList.add("game-finished");

  // ===== REPLAY =====
  document.getElementById("replayBtn").onclick = () => {
    location.reload();
  };

  document.getElementById("backBtn").onclick = () => {
    if (isJoin) {
      window.location.href = "/index.html";
    } else {
      window.location.href = "/games/dragonboat.html";
    }
  };
}

// ===== TIMER =====

let time = gameDuration;

function updateTimer() {
  const min = String(Math.floor(time / 60)).padStart(2, "0");

  const sec = String(time % 60).padStart(2, "0");

  const timer = document.getElementById("timer");

  if (timer) {
    timer.textContent = `${min}:${sec}`;
  }

  time--;

  if (time < 0) {
    clearInterval(timerInterval);

    endGame();
  }
}

let timerInterval = null;

// ===== END GAME =====
function endGame() {
  if (gameEnded) return;

  const blue = Number(document.getElementById("blueScore").textContent);

  const red = Number(document.getElementById("redScore").textContent);

  let winner = "Hòa";

  if (blue > red) {
    winner = blueTeamName || teamBlue;
  }

  if (red > blue) {
    winner = redTeamName || teamRed;
  }

  showWinner(winner);
}

// ===== START =====

if (isJoin) {
  document.querySelector(".question-layout").style.pointerEvents = "none";

  document.querySelector(".race-section").style.pointerEvents = "none";

  openTeamSetup();
} else {
  startDragonGame();
}

function startDragonGame() {
  renderQuestion();

  if (!timerInterval) {
    timerInterval = setInterval(updateTimer, 1000);

    updateTimer();
  }

  if (bgMusic) {
    bgMusic.play().catch(() => {});
  }
}

function openTeamSetup() {
  const popup = document.getElementById("playerSetup");

  if (!popup) {
    renderQuestion();
    return;
  }

  popup.style.display = "flex";

  popup.classList.add("flex");

  document.getElementById("setupGameTitle").innerText =
    game?.title || "Đua Thuyền Rồng";
}

document.getElementById("startRoomBtn")?.addEventListener("click", () => {
  const blueInput = document.getElementById("blueTeamInput");

  const redInput = document.getElementById("redTeamInput");

  const blue = blueInput.value.trim();
  const red = redInput.value.trim();

  if (!blue || !red) {
    showToast("Nhập tên cho cả 2 đội!", "error");
    return;
  }

  blueTeamName = blue;
  redTeamName = red;

  document.querySelector(".team-blue-name").textContent = blueTeamName;

  document.querySelector(".team-red-name").textContent = redTeamName;

  document.getElementById("playerSetup").classList.remove("flex");

  document.getElementById("playerSetup").style.display = "none";

  document.querySelector(".question-layout").style.pointerEvents = "auto";

  document.querySelector(".race-section").style.pointerEvents = "auto";

  startDragonGame();
});

function saveDragonBoatResult(winnerTeam) {
  if (!roomCode) return;

  let submits =
    JSON.parse(localStorage.getItem("dragonboat_submit_" + roomCode)) || [];

  const matchId = Date.now();

  const blueName = blueTeamName || teamBlue;

  const redName = redTeamName || teamRed;

  // ===== HÒA =====
  if (winnerTeam === "Hòa") {
    submits.push({
      name: blueName,

      result: "DRAW",

      submittedAt: Date.now(),

      roomCode,

      matchId,
    });

    submits.push({
      name: redName,

      result: "DRAW",

      submittedAt: Date.now(),

      roomCode,

      matchId,
    });
  }

  // ===== CÓ THẮNG THUA =====
  else {
    submits.push({
      name: blueName,

      result: winnerTeam === blueName ? "WIN" : "LOSE",

      submittedAt: Date.now(),

      roomCode,

      matchId,
    });

    submits.push({
      name: redName,

      result: winnerTeam === redName ? "WIN" : "LOSE",

      submittedAt: Date.now(),

      roomCode,

      matchId,
    });
  }

  localStorage.setItem(
    "dragonboat_submit_" + roomCode,
    JSON.stringify(submits),
  );
}
