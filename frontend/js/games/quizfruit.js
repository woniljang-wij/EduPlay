function goIndex() {
  window.location.href = "../index.html";
}

let selectedSpeed = "medium";
let tempQuestions = [];
let editingId = null;

function setActive(type) {
  const home = document.getElementById("btn-home");
  const create = document.getElementById("btn-create");

  home.classList.remove(
    "bg-gradient-to-r",
    "from-blue-500",
    "to-purple-500",
    "text-white",
  );

  create.classList.remove(
    "bg-gradient-to-r",
    "from-blue-500",
    "to-purple-500",
    "text-white",
  );

  if (type === "home") {
    home.classList.add(
      "bg-gradient-to-r",
      "from-blue-500",
      "to-purple-500",
      "text-white",
    );
  } else {
    create.classList.add(
      "bg-gradient-to-r",
      "from-blue-500",
      "to-purple-500",
      "text-white",
    );
  }
}

// NAV
function goCreate() {
  document.getElementById("page-list").classList.add("hidden");
  document.getElementById("page-create").classList.remove("hidden");

  setActive("create");

  // 🟢 CREATE MODE
  if (editingId === null) {
    tempQuestions = [];

    document.getElementById("title").value = "";
    document.getElementById("time").value = 25;
    document.getElementById("hideCamera").checked = false;
    document.getElementById("noCamera").checked = false;

    selectedSpeed = "medium";

    renderQuestions();
  }

  // 🔵 EDIT MODE
  else {
    renderQuestions();
  }

  // update speed UI
  document.querySelectorAll(".speed-btn").forEach((btn) => {
    btn.classList.remove("active-speed");
    if (btn.dataset.speed === selectedSpeed) {
      btn.classList.add("active-speed");
    }
  });
}

function goCreateNew() {
  editingId = null; 
  goCreate();
}

function goHome() {
  document.getElementById("page-create").classList.add("hidden");
  document.getElementById("page-list").classList.remove("hidden");

  setActive("home");
  renderGames();
}
// SPEED
document.querySelectorAll(".speed-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    selectedSpeed = btn.dataset.speed;

    document
      .querySelectorAll(".speed-btn")
      .forEach((b) => b.classList.remove("active-speed"));

    btn.classList.add("active-speed");
  });
});

// SAVE
function saveGame() {
  const title = document.getElementById("title").value.trim();
  const time = document.getElementById("time").value;

  // ===== VALIDATE TITLE =====
  if (!title) {
    showToast("⚠️ Vui lòng nhập tiêu đề!", "error");
    return;
  }

  // ===== VALIDATE QUESTIONS =====
  if (tempQuestions.length < 10) {
    showToast("⚠️ Cần ít nhất 10 câu hỏi!", "error");
    return;
  }

  for (let i = 0; i < tempQuestions.length; i++) {
    const q = tempQuestions[i];

    if (!q.question.trim()) {
      showToast(`⚠️ Câu ${i + 1} chưa có nội dung!`, "error");
      return;
    }

    if (q.answers.some(a => !a.trim())) {
      showToast(`⚠️ Câu ${i + 1} chưa đủ đáp án!`, "error");
      return;
    }
  }

  // ===== AUTO SCALE SCORE =====
  const totalQuestions = tempQuestions.length;
  const scorePerQuestion = 10 / totalQuestions;

  const questionsWithScore = tempQuestions.map(q => ({
    ...q,
    score: scorePerQuestion
  }));

  let games = JSON.parse(localStorage.getItem("fruitGames")) || [];

  if (editingId) {
    const index = games.findIndex((g) => g.id === editingId);

    if (index !== -1) {
      games[index] = {
        ...games[index],
        title,
        time,
        speed: selectedSpeed,
        questions: questionsWithScore
      };
    }

    editingId = null;
    showToast("✅ Cập nhật thành công!");
  } else {
    const newGame = {
      id: Date.now(),
      title,
      time,
      speed: selectedSpeed,
      questions: questionsWithScore
    };

    games.push(newGame);
    showToast("🎉 Lưu thành công!");
  }

  localStorage.setItem("fruitGames", JSON.stringify(games));
  goHome();
}

// RENDER
function renderGames() {
  const container = document.getElementById("gameList");
  let games = JSON.parse(localStorage.getItem("fruitGames")) || [];

  container.className = "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6";

  if (games.length === 0) {
    container.innerHTML = `
      <div class="col-span-full text-center py-20">
        <h2 class="text-xl font-semibold mb-4">Chưa có bài học nào</h2>
        <button onclick="goCreate()" 
          class="bg-green-500 text-white px-5 py-2 rounded-xl">
          ➕ Tạo bài đầu tiên
        </button>
      </div>
    `;
    return;
  }

  container.innerHTML = games
    .map(
      (g) => `
     <div class="w-80">
     <div class="card bg-white/80 backdrop-blur rounded-2xl p-5 shadow-lg border border-white/40 relative">

      <span class="absolute top-3 right-3 text-lg">🍉</span>

      <h3 class="font-bold text-lg mb-3">${g.title}</h3>

      <div class="flex gap-2 mb-4 text-sm">
        <span class="bg-green-100 text-green-700 px-3 py-1 rounded-full">
          🧠 ${g.questions.length} câu
        </span>

        <span class="bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
          ⏱ ${g.time}s
        </span>

        <span class="bg-red-100 text-red-600 px-3 py-1 rounded-full">
          🚀 ${g.speed || "medium"}
        </span>
      </div>

      <!-- BUTTON -->
      <div class="flex gap-3 mb-4">

        <button onclick="playGame(${g.id})"
          class="play-btn flex-1 py-3 rounded-xl font-semibold shadow-lg relative overflow-hidden">
          ▶ Chơi
        </button>

        <button onclick="assignGame(${g.id})"
          class="px-4 py-2 border rounded-xl text-purple-600 hover:bg-purple-50">
          📋 Giao
        </button>

      </div>

      <!-- ACTION -->
      <div class="flex gap-5 text-sm font-medium">

        <button onclick="editGame(${g.id})"
          class="text-orange-500 hover:underline">
          ✏️ Sửa
        </button>

        <button onclick="shareGame(${g.id})"
          class="text-blue-500 hover:underline">
          🔗 Chia sẻ GV
        </button>

        <button onclick="deleteGame(${g.id})"
          class="text-red-500 hover:underline">
          🗑 Xóa bài
        </button>

      </div>

    </div>
  </div>
`,
    )
    .join("");
}

// ===== PLAY =====
function playGame(id) {
  sessionStorage.setItem("playMusic", "true");

  window.location.href = `play_quizfruit.html?id=${id}`;
}

// ===== ASSIGN =====
function assignGame(id) {
  showToast("📋 Giao bài " + id);
}

// ===== SHARE =====
function shareGame(id) {
  showToast("🔗 Đã copy link chia sẻ (fake 😆)");
}

// ===== DELETE =====
let deletedGame = null;
let undoTimer = null;

function deleteGame(id) {
  let games = JSON.parse(localStorage.getItem("fruitGames")) || [];
  const game = games.find(g => g.id === id);

  if (!game) return;

  // 🔥 lưu lại để undo
  deletedGame = game;

  // ❌ xóa
  games = games.filter(g => g.id !== id);
  localStorage.setItem("fruitGames", JSON.stringify(games));

  renderGames();

  // 💥 toast có undo + firework
  showUndoToast("🗑 Đã xóa bài chơi", () => {
    undoDelete();
  }, 4000);

  // ⏳ reset undo sau 4s
  clearTimeout(undoTimer);
  undoTimer = setTimeout(() => {
    deletedGame = null;
  }, 4000);
}

function undoDelete() {
  if (!deletedGame) return;

  let games = JSON.parse(localStorage.getItem("fruitGames")) || [];

  games.push(deletedGame);

  localStorage.setItem("fruitGames", JSON.stringify(games));

  renderGames();

  showToast("↩ Đã khôi phục!", "success");

  deletedGame = null;
}

// ===== EDIT =====
function editGame(id) {
  let games = JSON.parse(localStorage.getItem("fruitGames")) || [];
  const game = games.find((g) => String(g.id) === String(id));

  if (!game) return;

  editingId = id;

  goCreate();

  document.getElementById("title").value = game.title;
  document.getElementById("time").value = game.time;
  document.getElementById("hideCamera").checked = game.hideCamera;
  document.getElementById("noCamera").checked = game.noCamera;

  selectedSpeed = game.speed;

  document.querySelectorAll(".speed-btn").forEach((b) => {
    b.classList.remove("active-speed");
    if (b.dataset.speed === game.speed) {
      b.classList.add("active-speed");
    }
  });

  tempQuestions = JSON.parse(JSON.stringify(game.questions || []));
  renderQuestions();
}

function addQuestion() {
  const q = {
    question: "",
    answers: ["", "", "", ""],
    correct: 0,
  };

  tempQuestions.push(q);

  renderQuestions();
}

function renderQuestions() {
  const box = document.getElementById("questionList");
  const btn = document.getElementById("btnAddFirst");

  if (tempQuestions.length === 0) {
    box.innerHTML = `<p class="text-gray-400 text-center">Chưa có câu hỏi nào</p>`;
    document.getElementById("questionCount").innerText = "Câu hỏi (0)";

    if (btn) btn.style.display = "inline-block";

    return;
  }

  box.innerHTML = tempQuestions
    .map((q, i) => `
      <div class="bg-white p-4 rounded-xl shadow border">
        <div class="flex justify-between items-center mb-2">
          <b>Câu ${i + 1}</b>
          <button onclick="deleteQuestion(${i})" class="text-red-500">🗑</button>
        </div>

        <input 
          class="w-full border p-2 mb-3 rounded"
          placeholder="Nhập câu hỏi..."
          value="${q.question}"
          oninput="updateQuestion(${i}, this.value)"
        />

        ${q.answers.map((a, j) => `
          <div class="flex items-center gap-2 mb-2">
            <input type="radio" name="correct_${i}"
              ${q.correct === j ? "checked" : ""}
              onchange="setCorrect(${i}, ${j})"
            />

            <input 
              class="flex-1 border p-2 rounded"
              placeholder="Đáp án ${j + 1}"
              value="${a}"
              oninput="updateAnswer(${i}, ${j}, this.value)"
            />
          </div>
        `).join("")}

        ${
          i === tempQuestions.length - 1
            ? `<button onclick="addQuestion()"
                class="mt-3 px-4 py-2 rounded-xl bg-green-500 text-white">
                ➕ Thêm câu hỏi
              </button>`
            : ""
        }

      </div>
    `)
    .join("");

  document.getElementById("questionCount").innerText =
    "Câu hỏi (" + tempQuestions.length + ")";

  if (btn) btn.style.display = "none";
}

function startAddQuestion() {
  if (tempQuestions.length > 0) return;
  addQuestion();

  const btn = document.getElementById("btnAddFirst");
  if (btn) btn.style.display = "none";
}

function updateQuestion(i, value) {
  tempQuestions[i].question = value;
}

function updateAnswer(i, j, value) {
  tempQuestions[i].answers[j] = value;
}

function setCorrect(i, j) {
  tempQuestions[i].correct = j;
}

function deleteQuestion(i) {
  tempQuestions.splice(i, 1);
  renderQuestions();
}

window.onload = () => {
  goHome();
};
