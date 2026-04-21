// ===== NAVIGATION =====
function goIndex() {
  window.location.href = "../index.html";
}

let editingId = null;

function goCreate(isEdit = false) {
  if (!isEdit) {
    history.pushState({}, "", "/frontend/games/turnbased.html?mode=create");
  }

  document.getElementById("page-list").classList.add("hidden");
  document.getElementById("page-create").classList.remove("hidden");

  setActive("create");

  if (!isEdit) {
    editingId = null;
    tempQuestions = [];

    const titleInput = document.querySelector(
      "input[placeholder='Tiêu đề bài chơi']",
    );
    if (titleInput) titleInput.value = "";

    const playerCount = document.getElementById("playerCount");
    if (playerCount) {
      playerCount.value = 2;
      renderPlayers(2);
    }

    const slider = document.getElementById("slider");
    const value = document.getElementById("value");
    if (slider && value) {
      slider.value = 1;
      value.innerText = 1;
    }

    const firstBtn = document.querySelector(".music-btn");
    if (firstBtn) {
      selectedMusic = firstBtn.dataset.src;

      document
        .querySelectorAll(".music-btn")
        .forEach((b) => b.classList.remove("bg-green-500", "text-white"));

      firstBtn.classList.add("bg-green-500", "text-white");
    }
  }

  updateQuestionCount();
  renderQuestionPreview();
}

function goHome() {
  history.pushState({}, "", "/frontend/games/turnbased.html");
  document.getElementById("page-create").classList.add("hidden");
  document.getElementById("page-list").classList.remove("hidden");
  setActive("home");
  renderGames();
}

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

// ===== PLAYER INPUT =====
const playerSelect = document.getElementById("playerCount");
const playerInputs = document.getElementById("playerInputs");

function renderPlayers(count) {
  if (!playerInputs) return;

  playerInputs.innerHTML = "";
  const icons = ["🐸", "🐱", "🐶", "🦊", "🐼", "🐵", "🐯"];

  for (let i = 1; i <= count; i++) {
    const input = document.createElement("input");
    input.className = "w-full p-3 border rounded-xl";
    input.placeholder = `${icons[i - 1]} Người ${i}`;
    playerInputs.appendChild(input);
  }
}

playerSelect?.addEventListener("change", (e) => {
  renderPlayers(parseInt(e.target.value));
});

let selectedMusic = null;

function setupMusicButtons() {
  const musicBtns = document.querySelectorAll(".music-btn");

  musicBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      selectedMusic = btn.dataset.src;

      musicBtns.forEach((b) => {
        b.classList.remove("bg-green-500", "text-white");
      });

      btn.classList.add("bg-green-500", "text-white");
    });
  });
}

// ===== LOAD STATE =====
window.onload = () => {
  if (location.search.includes("mode=edit")) goCreate();
  else goHome();

  const slider = document.getElementById("slider");
  const value = document.getElementById("value");

  if (slider) {
    slider.oninput = () => (value.innerText = slider.value);
  }

  if (playerSelect) {
    renderPlayers(parseInt(playerSelect.value));
  }

  setupMusicButtons();
  const firstBtn = document.querySelector(".music-btn");
  if (firstBtn) {
    selectedMusic = firstBtn.dataset.src;
    firstBtn.classList.add("bg-green-500", "text-white");
  }

  renderGames();
};

window.onpopstate = () => {
  if (location.search.includes("mode=edit")) goCreate();
  else goHome();
};

// ===== GENERATE OBSTACLE =====
function generateObstacles(count, maxCell = 48) {
  let arr = [];

  while (arr.length < count) {
    let r = Math.floor(Math.random() * (maxCell - 2)) + 1;

    if (!arr.includes(r)) arr.push(r);
  }

  return arr;
}

// ===== SAVE GAME =====
function saveGame() {
  const titleInput = document.querySelector("#page-create input");
  const title = titleInput ? titleInput.value.trim() : "";

  // ===== VALIDATE =====

  // ❌ chưa nhập tiêu đề
  if (!title) {
    showToast("⚠️ Vui lòng nhập tiêu đề bài chơi!", "error");
    titleInput.focus();
    return;
  }

  // ❌ chưa có câu hỏi
  if (!tempQuestions || tempQuestions.length === 0) {
    showToast("⚠️ Phải có ít nhất 1 câu hỏi!", "error");
    return;
  }

  // ❌ check từng câu hỏi
  for (let i = 0; i < tempQuestions.length; i++) {
    const q = tempQuestions[i];

    if (!q.question || q.question.trim() === "") {
      showToast(`⚠️ Câu ${i + 1} chưa có nội dung!`, "error");
      return;
    }

    if (!q.answers || q.answers.some(a => !a || a.trim() === "")) {
      showToast(`⚠️ Câu ${i + 1} chưa đủ đáp án!`, "error");
      return;
    }
  }

  // ===== LẤY DATA =====
  const players = [];
  document.querySelectorAll("#playerInputs input").forEach((input) => {
    players.push(input.value.trim() || "Người chơi");
  });

  const obstacles = parseInt(document.getElementById("slider").value);

  const activeBtn = document.querySelector(".music-btn.bg-green-500");
  const selectedMusicFinal = activeBtn
    ? activeBtn.dataset.src
    : "../assets/sounds/bai1.mp3";

  let games = JSON.parse(localStorage.getItem("games")) || [];

  // ===== EDIT MODE =====
  if (editingId) {
    const index = games.findIndex((g) => g.id === editingId);

    if (index !== -1) {
      games[index] = {
        ...games[index],
        title,
        players,
        obstacles,
        music: selectedMusicFinal,
        questions: tempQuestions,
        obstacleCells: generateObstacles(obstacles),
      };
    }

    editingId = null;
    showToast("✅ Cập nhật thành công!", "success");
  }

  // ===== CREATE MODE =====
  else {
    const newGame = {
      id: Date.now(),
      title,
      players,
      obstacles,
      music: selectedMusicFinal,
      questions: tempQuestions,
      obstacleCells: generateObstacles(obstacles),
    };

    games.push(newGame);
    showToast("🎉 Lưu thành công!", "success");
  }

  // ===== SAVE =====
  localStorage.setItem("games", JSON.stringify(games));

  updateQuestionCount();
  goHome();
  renderGames();
}

function renderGames() {
  const container = document.getElementById("gameList");
  if (!container) return;

  let games = JSON.parse(localStorage.getItem("games")) || [];

  container.className = "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6";

  // ===== EMPTY =====
  if (games.length === 0) {
    container.innerHTML = `
      <div class="col-span-full text-center py-20">
        <h2 class="text-xl font-semibold mb-4">Chưa có bài chơi nào</h2>
        <button onclick="goCreate()" class="bg-green-500 text-white px-5 py-2 rounded-xl">
          ➕ Tạo bài đầu tiên
        </button>
      </div>
    `;
    return;
  }

  let html = "";

  games.forEach((game) => {
    html += `
  <div class="w-80">
    <div class="bg-white/80 backdrop-blur rounded-2xl p-5 shadow-lg border border-white/40 hover:scale-105 transition">

      <!-- HEADER -->
      <div class="flex justify-between items-start mb-3">
        <h3 class="font-bold text-lg">${game.title}</h3>
        <span class="text-pink-500">📍</span>
      </div>

      <!-- TAG -->
      <div class="flex gap-2 mb-4 text-sm">
        <span class="bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
          🧙 ${game.players.length} người chơi
        </span>

        <span class="bg-green-100 text-green-700 px-3 py-1 rounded-full">
          🧠 ${game.questions?.length || 0} câu hỏi
        </span>
      </div>

      <!-- 🎮 BUTTON CHÍNH -->
      <div class="flex gap-3 mb-4">

        <!-- CHƠI -->
        <button onclick="playGame(${game.id})"
          class="flex-1 bg-gradient-to-r from-green-400 to-emerald-500 text-white py-3 rounded-xl font-semibold shadow">
          ▶ Chơi
        </button>

        <!-- GIAO -->
        <button onclick="openAssign(${game.id})"
          class="px-4 py-2 border rounded-xl text-purple-600 hover:bg-purple-50">
          📋 Giao
        </button>

      </div>

       <!-- ACTION -->
        <div class="flex gap-5 text-sm font-medium">
          <button onclick="editGame(${game.id})"
             class="text-orange-500 hover:underline">
             ✏️ Sửa
          </button>

        <button class="text-blue-500">
          🔗 Chia sẻ
        </button>

        <button onclick="deleteGame(${game.id})" class="text-red-500">
          🗑 Xóa
        </button>

      </div>

    </div>
  </div>
`;
  });

  container.innerHTML = html;
}

function editGame(id) {
  const games = JSON.parse(localStorage.getItem("games")) || [];
  const game = games.find((g) => g.id === id);

  if (!game) return;

  editingId = id;

  goCreate(true);
  history.pushState(
    {},
    "",
    `/frontend/games/turnbased.html?mode=edit&id=${id}`,
  );

  // ===== TITLE =====
  document.querySelector("input[placeholder='Tiêu đề bài chơi']").value =
    game.title;

  // ===== PLAYER =====
  document.getElementById("playerCount").value = game.players.length;
  renderPlayers(game.players.length);

  setTimeout(() => {
    const inputs = document.querySelectorAll("#playerInputs input");
    inputs.forEach((input, index) => {
      input.value = game.players[index] || "";
    });
  }, 50);

  // ===== OBSTACLE =====
  document.getElementById("slider").value = game.obstacles;
  document.getElementById("value").innerText = game.obstacles;

  // ===== QUESTIONS =====
  tempQuestions = game.questions || [];
  updateQuestionCount();
  renderQuestionPreview();

  // ===== MUSIC =====
  selectedMusic = game.music;

  const musicBtns = document.querySelectorAll(".music-btn");

  musicBtns.forEach((btn) => {
    btn.classList.remove("bg-green-500", "text-white");

    if (btn.dataset.src === selectedMusic) {
      btn.classList.add("bg-green-500", "text-white");
    }
  });
}

function openAssign(gameId) {
  const games = JSON.parse(localStorage.getItem("games")) || [];
  const game = games.find((g) => g.id === gameId);

  if (!game) return;

  document.getElementById("assignTitle").innerText = game.title;

  const modal = document.getElementById("assignModal");
  modal.classList.remove("hidden");
  modal.classList.add("flex");
}

function closeAssign() {
  const modal = document.getElementById("assignModal");
  modal.classList.add("hidden");
  modal.classList.remove("flex");
}

// ===== QUESTION SYSTEM =====
let tempQuestions = [];
let backupQuestions = [];

function openQuestionManager() {
  backupQuestions = JSON.parse(JSON.stringify(tempQuestions));

  const modal = document.getElementById("questionManager");

  modal.classList.remove("hidden");
  modal.classList.add("flex");

  const list = document.getElementById("questionList");
  list.innerHTML = "";

  if (tempQuestions.length === 0) {
    list.innerHTML = `<p class="text-gray-400 text-center">Chưa có câu hỏi nào</p>`;
  } else {
    tempQuestions.forEach((q, i) => {
      list.insertAdjacentHTML(
        "beforeend",
        `
        <div class="border p-4 rounded-xl bg-gray-50 shadow-sm">

          <div class="flex justify-between mb-2">
            <p class="text-sm font-semibold">Câu ${i + 1}</p>

            <button onclick="deleteQuestionForm(${i}, this)"
              class="text-red-500">🗑</button>
          </div>

          <input value="${q.question}"
            oninput="updateQuestion(${i}, 'question', this.value)"
            class="w-full mb-2 border p-2 rounded" />

          <div class="grid grid-cols-2 gap-2">
            <input value="${q.answers[0]}" oninput="updateAnswer(${i}, 0, this.value)" class="border p-2 rounded" />
            <input value="${q.answers[1]}" oninput="updateAnswer(${i}, 1, this.value)" class="border p-2 rounded" />
            <input value="${q.answers[2]}" oninput="updateAnswer(${i}, 2, this.value)" class="border p-2 rounded" />
            <input value="${q.answers[3]}" oninput="updateAnswer(${i}, 3, this.value)" class="border p-2 rounded" />
          </div>

          <select onchange="updateQuestion(${i}, 'correct', this.value)"
            class="mt-2 border p-2 rounded w-full">
            <option value="0" ${q.correct == 0 ? "selected" : ""}>✅ A đúng</option>
            <option value="1" ${q.correct == 1 ? "selected" : ""}>✅ B đúng</option>
            <option value="2" ${q.correct == 2 ? "selected" : ""}>✅ C đúng</option>
            <option value="3" ${q.correct == 3 ? "selected" : ""}>✅ D đúng</option>
          </select>

          <!-- ✅ TIME -->
          <input type="number"
            value="${q.time || ""}"
            placeholder="⏱ Nhập thời gian câu hỏi..."
            oninput="updateQuestion(${i}, 'time', this.value)"
            class="mt-2 border p-2 rounded w-full"
          />

        </div>
      `,
      );
    });
  }

  updateQuestionCount2();
}

function closeQuestionManager() {
  const modal = document.getElementById("questionManager");

  modal.classList.add("hidden");
  modal.classList.remove("flex");
}

function addQuestionForm() {
  const list = document.getElementById("questionList");

  if (list.innerText.includes("Chưa có câu hỏi")) {
    list.innerHTML = "";
  }

  const index = document.querySelectorAll("#questionList > div").length;

  list.insertAdjacentHTML(
    "beforeend",
    `
    <div class="border p-4 rounded-xl bg-gray-50 shadow-sm">

      <div class="flex justify-between mb-2">
        <p class="text-sm font-semibold">Câu ${index + 1}</p>

        <button onclick="deleteQuestionForm(${index}, this)"
          class="text-red-500">🗑</button>
      </div>

      <input placeholder="Nhập câu hỏi..."
        oninput="updateQuestion(${index}, 'question', this.value)"
        class="w-full mb-2 border p-2 rounded" />

      <div class="grid grid-cols-2 gap-2">
        <input placeholder="Đáp án A" oninput="updateAnswer(${index}, 0, this.value)" class="border p-2 rounded" />
        <input placeholder="Đáp án B" oninput="updateAnswer(${index}, 1, this.value)" class="border p-2 rounded" />
        <input placeholder="Đáp án C" oninput="updateAnswer(${index}, 2, this.value)" class="border p-2 rounded" />
        <input placeholder="Đáp án D" oninput="updateAnswer(${index}, 3, this.value)" class="border p-2 rounded" />
      </div>

      <select onchange="updateQuestion(${index}, 'correct', this.value)"
        class="mt-2 border p-2 rounded w-full">
        <option value="0">✅ A đúng</option>
        <option value="1">✅ B đúng</option>
        <option value="2">✅ C đúng</option>
        <option value="3">✅ D đúng</option>
      </select>

      <!-- ✅ TIME -->
      <input type="number"
        placeholder="⏱ Nhập thời gian câu hỏi..."
        oninput="updateQuestion(${index}, 'time', this.value)"
        class="mt-2 border p-2 rounded w-full"
      />

    </div>
  `,
  );

  updateQuestionCount2();
}

function saveAllQuestions() {
  const items = document.querySelectorAll("#questionList > div");

  if (items.length === 0) {
    showToast("⚠️ Phải có ít nhất 1 câu hỏi!", "error");
    return;
  }

  let newQuestions = [];

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    const inputs = item.querySelectorAll("input");
    const select = item.querySelector("select");

    const question = inputs[0].value.trim();

    if (!question) {
      showToast(`⚠️ Câu ${i + 1} chưa có nội dung!`, "error");
      return;
    }

    const answers = [
      inputs[1].value.trim(),
      inputs[2].value.trim(),
      inputs[3].value.trim(),
      inputs[4].value.trim(),
    ];

    if (answers.some(a => !a)) {
      showToast(`⚠️ Câu ${i + 1} chưa đủ đáp án!`, "error");
      return;
    }

    const rawTime = inputs[5]?.value;

    if (!rawTime) {
      showToast(`⚠️ Câu ${i + 1} chưa nhập thời gian!`, "error");
      return;
    }

    const time = parseInt(rawTime);

    if (isNaN(time) || time <= 0) {
      showToast(`⚠️ Thời gian câu ${i + 1} không hợp lệ!`, "error");
      return;
    }

    newQuestions.push({
      question,
      answers,
      correct: parseInt(select.value),
      time,
    });
  }

  tempQuestions = newQuestions;

  closeQuestionManager();
  updateQuestionCount();
  renderQuestionPreview();

  showToast("✅ Đã lưu câu hỏi", "success");
}

function updateQuestionCount() {
  const el = document.getElementById("questionCount");
  if (el) {
    el.innerText = `Câu hỏi (${tempQuestions.length})`;
  }
}

function updateQuestionCount2() {
  const count = document.querySelectorAll("#questionList > div").length;
  document.getElementById("questionCount2").innerText = count;
}

function renderQuestionPreview() {
  const box = document.getElementById("questionPreview");
  if (!box) return;

  if (tempQuestions.length === 0) {
    box.innerHTML = `
      <div class="text-gray-400 text-center py-6">
        Chưa có câu hỏi nào
      </div>
    `;
    return;
  }

  let html = `
    <div class="bg-white rounded-xl border overflow-hidden">
      <div class="bg-gray-100 px-4 py-2 font-semibold">
        Danh sách câu hỏi
      </div>
  `;

  tempQuestions.forEach((q, i) => {
    html += `
      <div class="px-4 py-3 border-t flex items-start justify-between hover:bg-gray-50 transition group">

        <!-- LEFT -->
        <div class="flex-1 text-left">

          <!-- QUESTION -->
          <div class="font-medium mb-2">
            ${i + 1}. ${q.question}
          </div>

          <!-- ANSWERS (KIỂU INLINE) -->
          <div class="flex flex-wrap gap-3 text-sm">
            ${q.answers
              .map(
                (a, idx) => `
                  <span class="
                    px-3 py-1 rounded-lg border
                    transition-all duration-200
                    cursor-pointer
                    hover:scale-105 hover:shadow
                    ${
                      idx === q.correct
                        ? "bg-green-100 border-green-400 text-green-700 font-semibold"
                        : "bg-gray-50 hover:bg-gray-200"
                    }
                  ">
                    <span class="font-semibold mr-1">
                      ${String.fromCharCode(65 + idx)}:
                    </span>
                    ${a}
                    ${idx === q.correct ? " ✔" : ""}
                  </span>
                `,
              )
              .join("")}
          </div>

        </div>

        <!-- RIGHT ACTION -->
        <div class="flex items-center gap-2 ml-4">

          <button onclick="moveQuestion(${i}, -1)"
            class="px-2 py-1 border rounded text-gray-600 hover:bg-gray-200">
            ⬆
          </button>

          <button onclick="moveQuestion(${i}, 1)"
            class="px-2 py-1 border rounded text-gray-600 hover:bg-gray-200">
            ⬇
          </button>

          <button onclick="editQuestion(${i})"
            class="px-2 py-1 border rounded text-blue-500 hover:bg-blue-50">
            ✏️
          </button>

          <button onclick="deleteQuestion(${i})"
            class="px-2 py-1 border rounded text-red-500 hover:bg-red-50">
            🗑
          </button>

        </div>

      </div>
    `;
  });

  html += `</div>`;
  box.innerHTML = html;
}

function moveQuestion(index, direction) {
  const newIndex = index + direction;

  if (newIndex < 0 || newIndex >= tempQuestions.length) return;

  // swap
  [tempQuestions[index], tempQuestions[newIndex]] = [
    tempQuestions[newIndex],
    tempQuestions[index],
  ];

  renderQuestionPreview();
  updateQuestionCount();
}

function refreshQuestionIndex() {
  const items = document.querySelectorAll("#questionList > div");

  items.forEach((item, i) => {
    item.querySelector("p").innerText = "Câu " + (i + 1);

    const deleteBtn = item.querySelector("button");
    deleteBtn.setAttribute("onclick", `deleteQuestionForm(${i}, this)`);
  });
}

function createAssign() {
  const name = document.getElementById("assignName").value;
  const title = document.getElementById("assignTitle").innerText;

  if (!name.trim()) {
    showToast("⚠️ Nhập tên trước đã!", "error");
    return;
  }

  let assigns = JSON.parse(localStorage.getItem("assigns")) || [];

  assigns.push({
    id: Date.now(),
    title,
    name,
  });

  localStorage.setItem("assigns", JSON.stringify(assigns));

  showToast("🎉 Giao bài thành công!");

  closeAssign();
}

let editingQuestionIndex = null;

function editQuestion(index) {
  const q = tempQuestions[index];
  if (!q) return;

  editingQuestionIndex = index;

  document.getElementById("editQuestionText").value = q.question || "";
  document.getElementById("editA").value = q.answers?.[0] || "";
  document.getElementById("editB").value = q.answers?.[1] || "";
  document.getElementById("editC").value = q.answers?.[2] || "";
  document.getElementById("editD").value = q.answers?.[3] || "";
  document.getElementById("editCorrect").value = q.correct ?? 0;

  document.getElementById("editTime").value = q.time || "";

  const modal = document.getElementById("editQuestionModal");
  modal.classList.remove("hidden");
  modal.classList.add("flex");
}

function saveEdit() {
  const question = document.getElementById("editQuestionText").value;
  const a = document.getElementById("editA").value;
  const b = document.getElementById("editB").value;
  const c = document.getElementById("editC").value;
  const d = document.getElementById("editD").value;
  const correct = parseInt(document.getElementById("editCorrect").value);
  const rawTime = document.getElementById("editTime").value;
  const time = rawTime ? parseInt(rawTime) : null;

  if (!question.trim()) {
    showToast("⚠️ Nhập câu hỏi!", "error");
    return;
  }

  tempQuestions[editingQuestionIndex] = {
    question,
    answers: [a, b, c, d],
    correct,
    time,
  };

  renderQuestionPreview();
  updateQuestionCount();

  showToast("✏️ Đã cập nhật câu hỏi");
  closeEdit();
}

function closeEdit() {
  const modal = document.getElementById("editQuestionModal");
  modal.classList.add("hidden");
  modal.classList.remove("flex");

  editingQuestionIndex = null;
}

function deleteQuestionForm(index, btn) {
  const item = btn.closest("#questionList > div");

  item.remove();

  refreshQuestionIndex();
  updateQuestionCount2();
}

function reopenQuestionManager() {
  const list = document.getElementById("questionList");
  list.innerHTML = "";

  if (tempQuestions.length === 0) {
    list.innerHTML = `<p class="text-gray-400 text-center">Chưa có câu hỏi nào</p>`;
    updateQuestionCount2();
    return;
  }

  tempQuestions.forEach((q, i) => {
    list.insertAdjacentHTML(
      "beforeend",
      `
      <div class="border p-4 rounded-xl bg-gray-50 shadow-sm">

        <div class="flex justify-between mb-2">
          <p class="text-sm font-semibold">Câu ${i + 1}</p>

          <button onclick="deleteQuestionForm(${i}, this)"
            class="text-red-500">🗑</button>
        </div>

        <input placeholder="Nhập câu hỏi..." value="${q.question}"
          oninput="updateQuestion(${i}, 'question', this.value)"
          class="w-full mb-2 border p-2 rounded" />

        <div class="grid grid-cols-2 gap-2">
          <input placeholder="Đáp án A" value="${q.answers[0]}" oninput="updateAnswer(${i}, 0, this.value)" class="border p-2 rounded" />
          <input placeholder="Đáp án B" value="${q.answers[1]}" oninput="updateAnswer(${i}, 1, this.value)" class="border p-2 rounded" />
          <input placeholder="Đáp án C" value="${q.answers[2]}" oninput="updateAnswer(${i}, 2, this.value)" class="border p-2 rounded" />
          <input placeholder="Đáp án D" value="${q.answers[3]}" oninput="updateAnswer(${i}, 3, this.value)" class="border p-2 rounded" />
        </div>

        <select onchange="updateQuestion(${i}, 'correct', this.value)"
          class="mt-2 border p-2 rounded w-full">
          <option value="0" ${q.correct == 0 ? "selected" : ""}>✅ A đúng</option>
          <option value="1" ${q.correct == 1 ? "selected" : ""}>✅ B đúng</option>
          <option value="2" ${q.correct == 2 ? "selected" : ""}>✅ C đúng</option>
          <option value="3" ${q.correct == 3 ? "selected" : ""}>✅ D đúng</option>
        </select>

        <input type="number"
          value="${q.time || ""}"
          placeholder="⏱ Nhập thời gian câu hỏi..."
          oninput="updateQuestion(${i}, 'time', this.value)"
          class="mt-2 border p-2 rounded w-full"
        />

      </div>
    `,
    );
  });

  updateQuestionCount2();
}

function deleteQuestion(index) {
  const rows = document.querySelectorAll("#questionPreview .border-t");

  if (rows[index]) {
    rows[index].classList.add("opacity-0", "translate-x-10", "transition");

    setTimeout(() => {
      tempQuestions.splice(index, 1);
      renderQuestionPreview();
      updateQuestionCount();
    }, 200);
  } else {
    tempQuestions.splice(index, 1);
    renderQuestionPreview();
    updateQuestionCount();
  }

  showToast("🗑 Đã xóa câu hỏi " + (index + 1));
}

// ===== PLAY =====
function playGame(id) {
  const screen = document.getElementById("introScreen");
  const video = document.getElementById("introVideo");

  screen.classList.remove("hidden");
  screen.classList.add("flex");

  video.src = "../assets/videos/Intro.mp4";
  video.currentTime = 0;

  video.play().catch(() => {
    document.body.addEventListener("click", () => video.play(), { once: true });
  });

  // 🎬 END VIDEO → CHUYỂN TRANG THẬT
  video.onended = () => {
    window.location.href = `/frontend/games/play.html?id=${id}&autoplay=1`;
  };

  screen.onclick = () => {
    video.pause();
    video.currentTime = 0;

    window.location.href = `/frontend/games/play.html?id=${id}&autoplay=1`;
  };
}
// ===== DELETE =====
let deletedGame = null;
let undoTimer = null;

function deleteGame(id) {
  let games = JSON.parse(localStorage.getItem("games")) || [];
  const game = games.find(g => g.id === id);

  if (!game) return;

  // 🔥 lưu lại
  deletedGame = game;

  // ❌ xóa
  games = games.filter(g => g.id !== id);
  localStorage.setItem("games", JSON.stringify(games));

  renderGames();

  // 💥 toast + undo thật sự
  showUndoToast("🗑 Đã xóa bài chơi", () => {
    undoDelete();
  }, 4000);

  // ⏳ timeout clear
  clearTimeout(undoTimer);
  undoTimer = setTimeout(() => {
    deletedGame = null;
  }, 4000);
}

function undoDelete() {
  if (!deletedGame) return;

  let games = JSON.parse(localStorage.getItem("games")) || [];

  games.push(deletedGame);

  localStorage.setItem("games", JSON.stringify(games));

  renderGames();

  showToast("↩ Đã khôi phục!", "success");

  deletedGame = null;
}
