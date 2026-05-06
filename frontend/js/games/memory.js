let tempQuestions = [];

// ===== TRANG CHỦ =====
function goIndex() {
  document.activeElement.blur();
  window.location.href = "../index.html";
}

// ===== PAGE LIST =====
function goHome() {
  document.activeElement.blur();

  document.getElementById("page-list").classList.remove("hidden");
  document.getElementById("page-create").classList.add("hidden");

  setActive("btn-home");
}

// ===== PAGE CREATE =====
function goCreate() {
  document.activeElement.blur();

  document.getElementById("page-create").classList.remove("hidden");
  document.getElementById("page-list").classList.add("hidden");

  setActive("btn-create");

  tempQuestions = [];
  renderQuestionPreview();
  updateQuestionCount();
}

// ===== ACTIVE MENU =====
function setActive(id) {
  document.querySelectorAll("#btn-home, #btn-create").forEach((btn) => {
    btn.classList.remove(
      "bg-gradient-to-r",
      "from-orange-400",
      "to-orange-500",
      "text-white",
      "shadow",
    );
  });

  document
    .getElementById(id)
    .classList.add(
      "bg-gradient-to-r",
      "from-orange-400",
      "to-orange-500",
      "text-white",
      "shadow",
    );
}

// ===== TOGGLE IMAGE SOURCE =====
function handleImgTypeChange() {
  const selected = document.querySelector(
    "input[name='imgType']:checked",
  )?.value;

  document
    .getElementById("uploadBox")
    .classList.toggle("hidden", selected !== "upload");
  document
    .getElementById("urlBox")
    .classList.toggle("hidden", selected !== "url");

  // reset preview
  document.getElementById("previewBox").classList.add("hidden");
  document.getElementById("previewImg").src = "";
}

function editMemoryGame(id) {
  let games = JSON.parse(localStorage.getItem("memoryGames")) || [];
  const game = games.find((g) => g.id === id);
  if (!game) return;

  goCreate();

  document.getElementById("title").value = game.title;
  document.getElementById("answer").value = game.answer;
  document.getElementById("grid").value = game.grid;
  document.getElementById("time").value = game.time;
  document.getElementById("guessTime").value =
  game.guessTime || 0;

  document.getElementById("previewImg").src = game.image;
  document.getElementById("previewBox").classList.remove("hidden");

  tempQuestions = game.questions || [];
  renderQuestionPreview();
  updateQuestionCount();

  window.editingId = id;

  showToast("✏️ Đang chỉnh sửa", "info");
}

// ===== SAVE GAME =====
function saveMemoryGame() {
  const title = document.getElementById("title").value.trim();
  const answer = document.getElementById("answer").value.trim();
  const grid = parseInt(document.getElementById("grid").value);
  const timeRaw = document.getElementById("time").value.trim();
  const time = timeRaw === "" ? 0 : parseInt(timeRaw);
  const guessTimeRaw = document.getElementById("guessTime").value.trim();

  const guessTime = guessTimeRaw === "" ? 0 : parseInt(guessTimeRaw);

  const imgType = document.querySelector(
    "input[name='imgType']:checked",
  )?.value;

  // ===== VALIDATE =====
  if (!title) return showToast("Nhập tiêu đề!", "error");
  if (!answer) return showToast("Nhập đáp án!", "error");
  if (isNaN(time) || time < 0) {
    return showToast("Thời gian không hợp lệ!", "error");
  }

  const max = grid * grid;

  if (tempQuestions.length < max) {
    return showToast(`❌ Cần đủ ${max} câu hỏi`, "error");
  }
  // ===== IMAGE HANDLE =====
  if (imgType === "upload") {
    const file = document.getElementById("imageFile").files[0];

    if (!file) {
      const currentImg = document.getElementById("previewImg").src;

      if (!currentImg) {
        return showToast("Chọn ảnh!", "error");
      }

      return saveGameWithImage(currentImg);
    }

    const reader = new FileReader();
    reader.onload = function (e) {
      saveGameWithImage(e.target.result);
    };

    reader.readAsDataURL(file);
    return;
  }

  // ===== URL =====
  if (imgType === "url") {
    const image = document.getElementById("imageUrl").value.trim();
    if (!image) return showToast("Nhập link ảnh!", "error");

    saveGameWithImage(image);
  }
}

function saveGameWithImage(image) {
  const title = document.getElementById("title").value.trim();

  const answer = document.getElementById("answer").value.trim();

  const grid = parseInt(document.getElementById("grid").value);

  const timeRaw = document.getElementById("time").value.trim();

  const time = timeRaw === "" ? 0 : parseInt(timeRaw);

  // ===== GUESS TIME =====
  const guessTimeRaw = document.getElementById("guessTime").value.trim();

  const guessTime = guessTimeRaw === "" ? 0 : parseInt(guessTimeRaw);

  let games = JSON.parse(localStorage.getItem("memoryGames")) || [];

  // =========================================
  // EDIT
  // =========================================

  if (window.editingId) {
    games = games.map((g) => {
      if (g.id === window.editingId) {
        return {
          ...g,

          title,
          answer,
          image,

          grid,

          time,

          // ===== FIX =====
          guessTime,

          questions: tempQuestions,

          theme: selectedTheme,
        };
      }

      return g;
    });

    showToast("✅ Đã cập nhật!", "success");

    window.editingId = null;
  }

  // =========================================
  // CREATE
  // =========================================
  else {
    games.push({
      id: Date.now(),

      title,

      answer,

      image,

      grid,

      time,

      // ===== FIX =====
      guessTime,

      questions: tempQuestions,

      theme: selectedTheme,
    });

    showToast("🎉 Lưu thành công!", "success");
  }

  // =========================================
  // SAVE
  // =========================================

  localStorage.setItem("memoryGames", JSON.stringify(games));

  // =========================================
  // UI
  // =========================================

  goHome();

  renderMemoryGames();

  // =========================================
  // RESET
  // =========================================

  document.getElementById("title").value = "";

  document.getElementById("answer").value = "";

  document.getElementById("time").value = "";

  document.getElementById("guessTime").value = "";

  document.getElementById("imageUrl").value = "";

  document.getElementById("imageFile").value = "";

  document.getElementById("previewBox").classList.add("hidden");

  document.getElementById("previewImg").src = "";

  tempQuestions = [];

  renderQuestionPreview();

  updateQuestionCount();

  selectedTheme = "blue";

  document.querySelectorAll(".color-option").forEach((btn) => {
    btn.classList.remove("ring-2");
  });

  const defaultBtn = document.querySelector('[data-color="blue"]');

  if (defaultBtn) {
    defaultBtn.classList.add("ring-2");
  }
}

// ===== RENDER LIST =====
function renderMemoryGames() {
  const container = document.getElementById("memoryList");
  if (!container) return;

  let games = JSON.parse(localStorage.getItem("memoryGames")) || [];

  container.className = "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6";

  if (games.length === 0) {
    container.innerHTML = `
  <div class="col-span-full text-center py-20 text-gray-500">
    <div class="text-5xl mb-3">🧩</div>

    <p>Chưa có bài chơi nào</p>

    <button
      onclick="goCreate()"
      class="mt-5 px-6 py-3 rounded-xl text-white font-semibold 
      bg-gradient-to-r from-orange-400 to-orange-500 shadow hover:scale-105 transition"
    >
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

        <img src="${game.image}" 
          class="w-full h-40 object-cover rounded-xl mb-3">

        <div class="flex justify-between items-start mb-3">
          <h3 class="font-bold text-lg">${game.title}</h3>
          <span class="text-orange-500">🧩</span>
        </div>

        <div class="flex gap-2 mb-4 text-sm">
          <span class="bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
            🔲 ${game.grid}x${game.grid}
          </span>

          <span class="bg-green-100 text-green-700 px-3 py-1 rounded-full">
            ⏱ ${game.time}s
          </span>

          <span class="bg-purple-100 text-purple-700 px-3 py-1 rounded-full">
            🧠 ${game.questions?.length || 0}
          </span>
        </div>

       <div class="flex gap-3 mb-4">

       <!-- CHƠI -->
       <button onclick="playMemory(${game.id})"
        class="flex-1 bg-gradient-to-r from-green-400 to-emerald-500 text-white py-3 rounded-xl font-semibold shadow">
        ▶ Chơi
       </button>

       <!-- GIAO -->
       <button onclick="assignMemoryGame(${game.id})"
        class="px-4 py-2 border rounded-xl text-purple-600 hover:bg-purple-50">
        📋 Giao
       </button>

       </div>

        <div class="flex gap-5 text-sm font-medium">
          <button onclick="editMemoryGame(${game.id})"
           class="text-orange-500 hover:underline">✏️ Sửa</button>

          <button onclick="shareMemoryGame(${game.id})"
           class="text-blue-500 hover:underline">🔗 Chia sẻ</button>
          <button onclick="deleteMemoryGame(${game.id})" class="text-red-500">🗑 Xóa</button>
        </div>

      </div>
    </div>
    `;
  });

  container.innerHTML = html;
}

// ===== PLAY =====
function playMemory(id) {
  window.location.href = `play_memory.html?id=${id}`;
}

// ===== DELETE + UNDO =====
let deletedGame = null;
let undoTimer = null;

function deleteMemoryGame(id) {
  let games = JSON.parse(localStorage.getItem("memoryGames")) || [];
  const game = games.find((g) => g.id === id);

  if (!game) return;

  deletedGame = game;

  games = games.filter((g) => g.id !== id);
  localStorage.setItem("memoryGames", JSON.stringify(games));

  renderMemoryGames();

  showUndoToast(
    "🗑 Đã xóa game",
    () => {
      undoDeleteMemory();
    },
    4000,
  );

  clearTimeout(undoTimer);
  undoTimer = setTimeout(() => {
    deletedGame = null;
  }, 4000);
}

function undoDeleteMemory() {
  if (!deletedGame) return;

  let games = JSON.parse(localStorage.getItem("memoryGames")) || [];

  games.push(deletedGame);

  localStorage.setItem("memoryGames", JSON.stringify(games));

  renderMemoryGames();

  showToast("↩ Đã khôi phục!", "success");

  deletedGame = null;
}

// ===== INIT =====
window.onload = () => {
  goHome();
  handleImgTypeChange();
  renderMemoryGames();

  // RADIO
  document.querySelectorAll("input[name='imgType']").forEach((r) => {
    r.addEventListener("change", handleImgTypeChange);
  });

  // PREVIEW FILE
  const fileInput = document.getElementById("imageFile");
  if (fileInput) {
    fileInput.addEventListener("change", function () {
      const file = this.files[0];
      if (!file) return;

      const img = document.getElementById("previewImg");
      const box = document.getElementById("previewBox");

      img.src = URL.createObjectURL(file);
      box.classList.remove("hidden");
    });
  }

  // PREVIEW URL
  const urlInput = document.getElementById("imageUrl");
  if (urlInput) {
    urlInput.addEventListener("input", function () {
      const url = this.value.trim();
      const img = document.getElementById("previewImg");
      const box = document.getElementById("previewBox");

      if (!url) {
        box.classList.add("hidden");
        return;
      }

      img.src = url;
      box.classList.remove("hidden");
    });
  }

  document.getElementById("grid").addEventListener("change", () => {
    const grid = parseInt(document.getElementById("grid").value);
    const max = grid * grid;

    if (tempQuestions.length > max) {
      tempQuestions = tempQuestions.slice(0, max);
    }

    renderQuestionPreview();
    updateQuestionCount();
  });
};

function openQuestionManager() {
  const modal = document.getElementById("questionManager");

  modal.classList.remove("hidden");
  modal.classList.add("flex");

  renderQuestionForm();
}

function updateQuestionCount() {
  const grid = parseInt(document.getElementById("grid").value);
  const max = grid * grid;

  const el = document.querySelector("#page-create .question-title");

  if (el) {
    el.innerText = `📚 Câu hỏi (${tempQuestions.length}/${max})`;
  }
}

function closeQuestionManager() {
  const modal = document.getElementById("questionManager");

  modal.classList.add("hidden");
  modal.classList.remove("flex");
}

function editQuestion(i) {
  openQuestionManager();

  setTimeout(() => {
    const inputs = document.querySelectorAll("#questionList input");
    if (inputs[i * 5]) {
      inputs[i * 5].focus();
    }
  }, 100);
}

function deleteQuestion(i) {
  tempQuestions.splice(i, 1);
  renderQuestionForm();
  renderQuestionPreview();
  updateQuestionCount();
}

function addQuestionForm() {
  const grid = parseInt(document.getElementById("grid").value);
  const max = grid * grid;

  if (tempQuestions.length >= max) {
    showToast(`⚠️ Tối đa ${max} câu hỏi`, "error");
    return;
  }

  tempQuestions.push({
    question: "",
    answers: ["", "", "", ""],
    correct: 0,
  });

  renderQuestionForm();
  updateQuestionCount();

  setTimeout(() => {
    const list = document.getElementById("questionList");
    const inputs = list.querySelectorAll("input");

    if (inputs.length > 0) {
      list.scrollTop = list.scrollHeight;

      inputs[inputs.length - 5].focus();
    }
  }, 50);
}

function renderQuestionForm() {
  const list = document.getElementById("questionList");

  if (tempQuestions.length === 0) {
    list.innerHTML = `<p class="text-gray-400 text-center">Chưa có câu hỏi nào</p>`;

    document.getElementById("questionCount2").innerText = 0;
    updateQuestionCount();

    const btn = document.querySelector("#btnAddQuestion");
    if (btn) btn.disabled = false;

    return;
  }

  list.innerHTML = "";

  tempQuestions.forEach((q, i) => {
    list.insertAdjacentHTML(
      "beforeend",
      `
      <div class="border p-4 rounded-xl bg-gray-50 relative">

  <button onclick="deleteQuestion(${i})"
    class="absolute top-2 right-2 text-red-500 hover:scale-110">
    🗑
  </button>

        <p class="mb-2 font-semibold">Câu ${i + 1}</p>

        <input placeholder="Câu hỏi..."
          value="${q.question}"
          oninput="updateQuestion(${i}, this.value)"
          class="border rounded px-4" />

        <div class="grid grid-cols-2 gap-2">
          ${q.answers
            .map(
              (a, idx) => `
            <input placeholder="Đáp án ${String.fromCharCode(65 + idx)}"
              value="${a}"
              oninput="updateAnswer(${i}, ${idx}, this.value)"
              class="border rounded px-4" />
          `,
            )
            .join("")}
        </div>

        <select onchange="setCorrect(${i}, this.value)"
          class="mt-2 border p-2 w-full rounded">
          <option value="0" ${q.correct == 0 ? "selected" : ""}>A đúng</option>
          <option value="1" ${q.correct == 1 ? "selected" : ""}>B đúng</option>
          <option value="2" ${q.correct == 2 ? "selected" : ""}>C đúng</option>
          <option value="3" ${q.correct == 3 ? "selected" : ""}>D đúng</option>
        </select>

      </div>
    `,
    );
  });

  document.getElementById("questionCount2").innerText = tempQuestions.length;
  updateQuestionCount();

  const grid = parseInt(document.getElementById("grid").value);
  const max = grid * grid;

  const btn = document.querySelector("#btnAddQuestion");

  if (btn) {
    const isMax = tempQuestions.length >= max;

    btn.disabled = isMax;

    btn.classList.toggle("opacity-50", isMax);
    btn.classList.toggle("cursor-not-allowed", isMax);
  }
}

function updateQuestion(i, value) {
  tempQuestions[i].question = value;
}

function updateAnswer(i, idx, value) {
  tempQuestions[i].answers[idx] = value;
}

function setCorrect(i, value) {
  tempQuestions[i].correct = parseInt(value);
}

function saveAllQuestions() {
  if (tempQuestions.length === 0) {
    return showToast("❌ Phải có ít nhất 1 câu hỏi", "error");
  }

  for (let q of tempQuestions) {
    if (!q.question.trim()) {
      return showToast("❌ Thiếu nội dung câu hỏi", "error");
    }

    if (q.answers.some((a) => !a.trim())) {
      return showToast("❌ Thiếu đáp án", "error");
    }
  }

  renderQuestionPreview();
  closeQuestionManager();

  showToast("✅ Đã lưu câu hỏi", "success");
}

function renderQuestionPreview() {
  const box = document.getElementById("questionPreview");

  if (tempQuestions.length === 0) {
    box.innerHTML = `<div class="text-gray-400 text-center">Chưa có câu hỏi</div>`;
    updateQuestionCount();
    return;
  }

  let html = `<div class="bg-white rounded-xl border">`;

  tempQuestions.forEach((q, i) => {
    html += `
      <div class="p-3 border-t relative">

  <button onclick="editQuestion(${i})"
    class="absolute top-2 right-10 text-blue-500">
    ✏️
  </button>

  <button onclick="deleteQuestion(${i})"
    class="absolute top-2 right-2 text-red-500">
    🗑
  </button>
        <div class="font-semibold mb-2">${i + 1}. ${q.question}</div>

        <div class="flex flex-wrap gap-2 text-sm">
          ${q.answers
            .map(
              (a, idx) => `
            <span class="px-2 py-1 rounded 
              ${idx === q.correct ? "bg-green-200" : "bg-gray-100"}">
              ${a}
            </span>
          `,
            )
            .join("")}
        </div>
      </div>
    `;
  });

  html += "</div>";
  box.innerHTML = html;
  updateQuestionCount();
}

let selectedTheme = "blue";

window.addEventListener("load", () => {
  const defaultBtn = document.querySelector('[data-color="blue"]');
  if (defaultBtn) defaultBtn.classList.add("active-color");
});

document.querySelectorAll(".color-option").forEach((btn) => {
  btn.addEventListener("click", () => {
    selectedTheme = btn.dataset.color;

    document.querySelectorAll(".color-option").forEach((b) => {
      b.classList.remove("active-color");
    });

    btn.classList.add("active-color");
  });
});
