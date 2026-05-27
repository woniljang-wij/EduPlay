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
function goCreate(isEdit) {
  isEdit = isEdit === true;
  const list = document.getElementById("page-list");
  const create = document.getElementById("page-create");

  list.classList.add("hidden");
  create.classList.remove("hidden");

  const box = create.querySelector(".container-box");
  box.classList.remove("fade-anim");
  void box.offsetWidth;
  box.classList.add("fade-anim");

  setActive("create");

  if (!isEdit) {
    editingId = null;

    document.getElementById("title").value = "";
    document.getElementById("time").value = 25;

    selectedSpeed = "medium";

    tempQuestions = [];

    renderQuestions();

    history.pushState({}, "", "/games/quizfruit.html?mode=create");
  }

  document.querySelectorAll(".speed-btn").forEach((btn) => {
    btn.classList.remove("active-speed");
    if (btn.dataset.speed === selectedSpeed) {
      btn.classList.add("active-speed");
    }
  });
}

function goCreateNew() {
  editingId = null;
  tempQuestions = [];

  goCreate(false);

  renderQuestions();
}

function goHome() {
  const list = document.getElementById("page-list");
  const create = document.getElementById("page-create");

  editingId = null;

  tempQuestions = [];

  history.pushState({}, "", "/games/quizfruit.html");

  create.classList.add("hidden");
  list.classList.remove("hidden");

  const box = list.querySelector(".container-box");

  box.classList.remove("fade-anim");

  void box.offsetWidth;

  box.classList.add("fade-anim");

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
  if (tempQuestions.length < 1) {
    showToast("⚠️ Cần ít nhất 1 câu hỏi!", "error");
    return;
  }

  for (let i = 0; i < tempQuestions.length; i++) {
    const q = tempQuestions[i];

    if (!q.question.trim()) {
      showToast(`⚠️ Câu ${i + 1} chưa có nội dung!`, "error");
      return;
    }

    if (q.answers.some((a) => !a.trim())) {
      showToast(`⚠️ Câu ${i + 1} chưa đủ đáp án!`, "error");
      return;
    }
  }

  // ===== AUTO SCALE SCORE =====
  const totalQuestions = tempQuestions.length;
  const scorePerQuestion = 10 / totalQuestions;

  const questionsWithScore = tempQuestions.map((q) => ({
    ...q,
    score: scorePerQuestion,
  }));

  const user = JSON.parse(localStorage.getItem("user"));

  if (!user || !user.id) {
    showToast("Bạn chưa đăng nhập!", "error");
    return;
  }

  const payload = {
    title,

    subject: "QuizFruit",

    music: "",

    game_type: "quizfruit",

    game_data: {
      title,
      time,
      speed: selectedSpeed,
      questions: questionsWithScore,
    },
  };

  // ===== EDIT =====
  if (editingId) {
    fetch(`http://127.0.0.1:5000/api/games/${editingId}`, {
      method: "PUT",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify(payload),
    })
      .then((res) => res.json())

      .then(() => {
        showToast("✅ Cập nhật thành công!");

        editingId = null;

        goHome();
      });

    return;
  }

  // ===== CREATE =====
  fetch("http://127.0.0.1:5000/api/games", {
    method: "POST",

    headers: {
      "Content-Type": "application/json",
    },

    body: JSON.stringify({
      user_id: user.id,
      ...payload,
    }),
  })
    .then((res) => res.json())

    .then(() => {
      showToast("🎉 Lưu thành công!");

      goHome();
    });
}

async function renderGames() {
  const container = document.getElementById("gameList");

  const user = JSON.parse(localStorage.getItem("user"));

  if (!user || !user.id) return;

  const res = await fetch(`http://127.0.0.1:5000/api/games/${user.id}`);

  const data = await res.json();

  games = data
    .filter((g) => g.game_type === "quizfruit")

    .map((g) => ({
      ...JSON.parse(g.game_data),

      db_id: g.id,

      title: g.title,
    }));

  container.className = "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6";

  if (games.length === 0) {
    container.innerHTML = `
      <div class="col-span-full text-center py-20">

        <div class="text-5xl mb-3">
          🍉
        </div>

        <h2 class="text-xl font-semibold mb-4">
          Chưa có bài học nào
        </h2>

        <button
          onclick="goCreate()"
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
<div
  class="w-80"
  data-id="${g.db_id}"
>

<div class="card bg-white/80 backdrop-blur rounded-2xl p-5 shadow-lg border border-white/40 relative">

<span class="absolute top-3 right-3 text-lg">
🍉
</span>

<h3 class="font-bold text-lg mb-3">
${g.title}
</h3>

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

<div class="flex gap-3 mb-4">

<button
onclick="playGame(${g.db_id})"
class="play-btn flex-1 py-3 rounded-xl font-semibold shadow-lg relative overflow-hidden">

▶ Chơi

</button>

<button
onclick="openAssign(${g.db_id}, 'quizfruit')"
class="px-4 py-2 border rounded-xl text-purple-600 hover:bg-purple-50">

📋 Giao

</button>

</div>

<div class="flex gap-5 text-sm font-medium flex-wrap">

<button
onclick="editGame(${g.db_id})"
class="text-orange-500 hover:underline">

✏️ Sửa

</button>

<button
onclick="shareGame(${g.db_id})"
class="text-blue-500 hover:underline">

🔗 Chia sẻ GV

</button>

<button
onclick="deleteGame(${g.db_id})"
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

// ===== SHARE =====
function shareGame(id) {
  const link = `${window.location.origin}/games/play_quizfruit.html?id=${id}`;

  navigator.clipboard.writeText(link);

  showToast("🔗 Đã copy link giáo viên!");
}

async function deleteGame(id) {
  const game = games.find((g) => Number(g.db_id) === Number(id));

  if (!game) return;

  try {
    const res = await fetch(`http://127.0.0.1:5000/api/games/${id}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      throw new Error("DELETE FAILED");
    }

    games = games.filter((g) => Number(g.db_id) !== Number(id));

    // ===== RENDER LẠI =====
    renderGames();

    // ===== TOAST =====
    showToast("🗑 Đã xóa bài chơi!", "success");
  } catch (err) {
    console.error("DELETE GAME ERROR:", err);

    showToast("❌ Xóa thất bại!", "error");
  }
}

// ===== EDIT =====
async function editGame(id) {
  const user = JSON.parse(localStorage.getItem("user"));

  if (!user || !user.id) return;

  const res = await fetch(`http://127.0.0.1:5000/api/games/${user.id}`);

  const data = await res.json();

  const games = data
    .filter((g) => g.game_type === "quizfruit")
    .map((g) => ({
      ...JSON.parse(g.game_data),

      db_id: g.id,

      title: g.title,
    }));

  const game = games.find((g) => Number(g.db_id) === Number(id));

  if (!game) return;

  editingId = id;

  history.pushState({}, "", `?mode=edit&id=${id}`);

  selectedSpeed = game.speed;

  tempQuestions = JSON.parse(JSON.stringify(game.questions || []));

  goCreate(true);

  document.getElementById("title").value = game.title;

  document.getElementById("time").value = game.time;

  document.querySelectorAll(".speed-btn").forEach((b) => {
    b.classList.remove("active-speed");

    if (b.dataset.speed === game.speed) {
      b.classList.add("active-speed");
    }
  });

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

  setTimeout(() => {
    const items = document.querySelectorAll("#questionList > div");
    const last = items[items.length - 1];

    if (last) {
      last.scrollIntoView({ behavior: "smooth", block: "center" });

      const input = last.querySelector("input");
      if (input) input.focus();
    }
  }, 50);
}

function renderQuestions() {
  const box = document.getElementById("questionList");
  const btn = document.getElementById("btnAddFirst");

  if (tempQuestions.length === 0) {
    box.innerHTML = `<p class="text-gray-400 text-center">Chưa có câu hỏi nào</p>`;
    document.getElementById("questionCount").innerHTML =
      `<i class="bi bi-patch-question"></i> Câu hỏi (0)`;

    if (btn) btn.style.display = "inline-block";

    return;
  }

  box.innerHTML = tempQuestions
    .map(
      (q, i) => `
      <div class="bg-white p-4 rounded-xl shadow border question-item">
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

        ${q.answers
          .map(
            (a, j) => `
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
        `,
          )
          .join("")}

        ${
          i === tempQuestions.length - 1
            ? `<button onclick="addQuestion()"
                class="mt-3 px-4 py-2 rounded-xl bg-green-500 text-white">
                ➕ Thêm câu hỏi
              </button>`
            : ""
        }

      </div>
    `,
    )
    .join("");

  document.getElementById("questionCount").innerHTML =
    `<i class="bi bi-patch-question"></i> Câu hỏi (${tempQuestions.length})`;

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
  const params = new URLSearchParams(window.location.search);

  if (params.get("mode") === "edit") {
    const id = parseInt(params.get("id"));
    setTimeout(() => editGame(id), 50);
  } else {
    goHome();
  }
};

// ===== CREATE PAGE MUSIC =====
const createMusic = document.getElementById("bgMusic");

function startCreateMusic() {
  if (!createMusic) return;

  createMusic.volume = 0.35;

  const playPromise = createMusic.play();

  if (playPromise !== undefined) {
    playPromise.catch(() => {
      document.body.addEventListener(
        "click",
        () => {
          createMusic.play().catch(() => {});
        },
        { once: true },
      );
    });
  }
}

window.addEventListener("load", () => {
  setTimeout(() => {
    startCreateMusic();
  }, 300);
});

function goAssignments() {
  window.location.href = "assign.html";
}
