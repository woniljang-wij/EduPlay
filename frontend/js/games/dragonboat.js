let tempQuestions = [];
let editingId = null;
let deletedGame = null;
let undoTimer = null;

// ===== INDEXED DB =====
let db;

const requestDB = indexedDB.open("EduPlayDB", 1);

requestDB.onupgradeneeded = (e) => {
  db = e.target.result;

  if (!db.objectStoreNames.contains("music")) {
    db.createObjectStore("music", {
      keyPath: "id",
    });
  }
};

requestDB.onsuccess = (e) => {
  db = e.target.result;
};

// ===== NAV =====
function goIndex() {
  document.activeElement.blur();
  window.location.href = "../index.html";
}

function goHome() {
  document.activeElement.blur();

  document.getElementById("page-list").classList.remove("hidden");
  document.getElementById("page-create").classList.add("hidden");

  setActive("btn-home");
  renderGames();
}

function goCreate(isEdit = false) {
  document.activeElement.blur();

  document.getElementById("page-create").classList.remove("hidden");
  document.getElementById("page-list").classList.add("hidden");

  setActive("btn-create");

  if (!isEdit) {
    editingId = null;
    tempQuestions = [];

    document.querySelector("input[placeholder='Nhập tiêu đề...']").value = "";

    renderQuestionPreview();
    updateQuestionCount();
  }
}

// ===== ACTIVE =====
function setActive(id) {
  document.querySelectorAll("#btn-home, #btn-create").forEach((btn) => {
    btn.classList.remove(
      "bg-gradient-to-r",
      "from-pink-500",
      "via-red-500",
      "to-purple-600",
      "text-white",
      "shadow-lg",
      "scale-105",
    );
  });

  document
    .getElementById(id)
    .classList.add(
      "bg-gradient-to-r",
      "from-pink-500",
      "via-red-500",
      "to-purple-600",
      "text-white",
      "shadow-lg",
      "scale-105",
    );
}

// ===== MUSIC =====
let currentAudio = new Audio();

function bindMusicButtons() {
  document.querySelectorAll(".music-btn").forEach((btn) => {
    btn.onclick = () => {
      const src = btn.dataset.src;

      currentAudio.pause();

      document
        .querySelectorAll(".music-btn[data-custom='true'] span:first-child")
        .forEach((el) => (el.innerHTML = "▶"));

      currentBtn = null;
      currentControl = null;

      if (btn.dataset.custom === "true") {
        currentAudio = new Audio(src);
        currentAudio.loop = true;
        currentAudio.volume = 0.7;
        currentAudio.play().catch(() => {});

        const control = btn.querySelector("span");
        if (control) control.innerHTML = "⏸";

        currentBtn = btn;
        currentControl = control;
      }

      setActiveMusicButton(btn);
    };
  });
}

function playMusic(src) {
  if (currentAudio) currentAudio.pause();

  currentAudio = new Audio(src);
  currentAudio.loop = true;
  currentAudio.volume = 0.7;
  currentAudio.play().catch(() => {});
}

function setActiveMusicButton(activeBtn) {
  document.querySelectorAll(".music-btn").forEach((btn) => {
    btn.classList.remove("active");
  });

  if (activeBtn) activeBtn.classList.add("active");
}

// ===== MUSIC SYSTEM =====
let currentControl = null;
let currentBtn = null;

let deletedMusic = null;
let undoMusicTimer = null;

document.getElementById("uploadBtn").onclick = () => {
  document.getElementById("musicUpload").click();
};

document.getElementById("musicUpload").addEventListener("change", function (e) {
  const file = e.target.files[0];
  if (!file) return;

  if (!file.type.startsWith("audio/")) {
    showToast("❌ Chỉ chấp nhận file âm thanh!", "error");
    return;
  }

  const MAX_SIZE = 20 * 1024 * 1024;
  if (file.size > MAX_SIZE) {
    showToast("⚠️ File quá lớn! Tối đa 20MB", "error");
    return;
  }

  const existed = [...document.querySelectorAll(".music-btn")].some(
    (btn) => btn.dataset.name === file.name,
  );

  if (existed) {
    showToast("⚠️ Nhạc này đã tồn tại!", "info");
    return;
  }

  const musicId = Date.now().toString();

  const tx = db.transaction("music", "readwrite");

  tx.objectStore("music").put({
    id: musicId,
    file: file,
    name: file.name,
  });

  const url = URL.createObjectURL(file);

  // ===== BUTTON =====

  const btn = document.createElement("button");

  btn.type = "button";

  btn.className = `
music-btn inline-flex items-center gap-2
px-4 py-2 rounded-full
border border-gray-300
bg-white text-gray-700
hover:bg-gray-100
transition-all text-sm
`;

  btn.dataset.src = musicId;

  btn.dataset.name = file.name;

  btn.dataset.custom = "true";

  // ===== ICON =====

  const control = document.createElement("span");

  control.innerHTML = "▶";

  control.className = "text-green-500 text-xs cursor-pointer";

  const name = document.createElement("span");

  name.textContent = file.name;

  // ===== PLAY =====

  btn.onclick = () => {
    setActiveMusicButton(btn);

    currentAudio.pause();

    currentAudio = new Audio(url);

    currentAudio.loop = true;

    currentAudio.volume = 0.7;

    currentAudio.play().catch(() => {});

    document
      .querySelectorAll(".music-btn span:first-child")
      .forEach((el) => (el.innerHTML = "▶"));

    control.innerHTML = "⏸";
  };

  btn.appendChild(control);

  btn.appendChild(name);

  document.getElementById("musicList").appendChild(btn);

  setActiveMusicButton(btn);

  showToast(`🎵 ${file.name}`, "success");

  e.target.value = "";
});

function undoDeleteMusic() {
  if (!deletedMusic) return;

  deletedMusic.parent.appendChild(deletedMusic.element);
  showToast("↩ Đã khôi phục", "success");

  deletedMusic = null;
}

// ===== SAVE GAME =====
function saveGame() {
  const title =
    document.querySelector("input[placeholder='Nhập tiêu đề...']")?.value ||
    "Chưa đặt tên";

  const inputs = document.querySelectorAll(".input-ui");

  const duration = inputs[1]?.value || "60";
  const freeze = inputs[3]?.value || "3";
  const winScore = parseInt(inputs[2]?.value || 3);

  const team1 = inputs[4]?.value || "Đội Xanh";
  const team2 = inputs[5]?.value || "Đội Đỏ";

  const musicBtn = document.querySelector(".music-btn.active");
  const music = musicBtn?.dataset.src || null;

  const mode =
    document.querySelector("input[name='mode']:checked")?.parentElement
      .innerText || "default";

  let games = JSON.parse(localStorage.getItem("dragonboatGames")) || [];

  if (editingId) {
    const index = games.findIndex((g) => g.id === editingId);

    if (index !== -1) {
      games[index] = {
        ...games[index],
        title,
        duration,
        freeze,
        winScore,
        players: [team1, team2],
        mode,
        music,
        questions: tempQuestions,
      };
    }

    editingId = null;
    showToast("✅ Đã cập nhật!", "success");
  } else {
    const game = {
      id: Date.now(),
      title,
      duration,
      freeze,
      winScore,
      players: [team1, team2],
      mode,
      music,
      questions: tempQuestions || [],
    };

    games.push(game);
    showToast("🎉 Đã lưu!", "success");
  }

  localStorage.setItem("dragonboatGames", JSON.stringify(games));
  goHome();
}

// ===== RENDER =====
function renderGames() {
  const container = document.getElementById("gameList");
  if (!container) return;

  let games = JSON.parse(localStorage.getItem("dragonboatGames")) || [];

  container.className = "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6";

  // ===== EMPTY =====
  if (games.length === 0) {
    container.innerHTML = `
      <div class="col-span-full text-center py-20">
        <div class="text-5xl mb-3">🐉</div>
        <h2 class="text-xl font-semibold mb-3">Chưa có bài chơi nào</h2>

       <button onclick="goCreate()"
        class="px-6 py-3 rounded-xl text-white font-semibold 
        bg-gradient-to-r from-pink-500 via-red-500 to-purple-600 
        shadow-lg hover:scale-105 transition">
        ➕ Tạo bài đầu tiên
       </button>
      </div>
    `;
    return;
  }

  let html = "";

  games.forEach((g) => {
    html += `
    <div class="w-80 relative">

      <!-- PIN -->
      <div class="absolute top-2 right-2 text-pink-500">
        📍
      </div>

      <div class="bg-white/80 backdrop-blur rounded-2xl p-5 shadow-lg hover:scale-105 transition">

        <h3 class="font-bold text-lg mb-2">${g.title}</h3>

        <div class="flex gap-2 mb-4 text-sm flex-wrap">
          <span class="bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
            👥 ${g.players.length} đội
          </span>

          <span class="bg-green-100 text-green-700 px-3 py-1 rounded-full">
            🧠 ${g.questions?.length || 0} câu
          </span>
        </div>

        <div class="flex gap-3 mb-4">
          <button onclick="playGame(${g.id})"
            class="flex-1 bg-green-500 text-white py-2 rounded-xl">
            ▶ Chơi
          </button>

          <button onclick="fakeFeature('📋 Giao')"
            class="px-3 py-2 border rounded-xl">
            📋
          </button>
        </div>

        <div class="flex gap-4 text-sm flex-wrap">

          <button onclick="editGame(${g.id})" class="text-orange-500">
            ✏️ Sửa
          </button>

          <button onclick="fakeFeature('🔗 Chia sẻ')" class="text-blue-500">
            🔗 Chia sẻ
          </button>

          <button onclick="deleteGame(${g.id})" class="text-red-500">
            🗑 Xóa
          </button>

        </div>

      </div>
    </div>
    `;
  });

  container.innerHTML = html;
}

// ===== FAKE FEATURE =====
function fakeFeature(name) {
  showToast(name + " (đang phát triển)", "info");
}

// ===== EDIT =====
function editGame(id) {
  const games = JSON.parse(localStorage.getItem("dragonboatGames")) || [];
  const game = games.find((g) => g.id === id);
  if (!game) return;

  editingId = id;
  goCreate(true);

  document.querySelector("input[placeholder='Nhập tiêu đề...']").value =
    game.title;

  tempQuestions = game.questions || [];

  renderQuestionPreview();
  updateQuestionCount();

  // ===== RESTORE MUSIC ACTIVE =====
  document.querySelectorAll(".music-btn").forEach((btn) => {
    btn.classList.remove("active");
  });

  if (game.music) {
    const targetBtn = [...document.querySelectorAll(".music-btn")].find(
      (btn) => btn.dataset.src === game.music,
    );

    if (targetBtn) {
      targetBtn.classList.add("active");
    }
  }
}

// ===== DELETE =====
function deleteGame(id) {
  let games = JSON.parse(localStorage.getItem("dragonboatGames")) || [];
  const game = games.find((g) => g.id === id);
  if (!game) return;

  deletedGame = game;

  games = games.filter((g) => g.id !== id);

  localStorage.setItem("dragonboatGames", JSON.stringify(games));

  renderGames();

  showUndoToast("🗑 Đã xóa", () => undoDelete(), 4000);

  clearTimeout(undoTimer);
  undoTimer = setTimeout(() => {
    deletedGame = null;
  }, 4000);
}

function undoDelete() {
  if (!deletedGame) return;

  let games = JSON.parse(localStorage.getItem("dragonboatGames")) || [];

  games.push(deletedGame);
  localStorage.setItem("dragonboatGames", JSON.stringify(games));

  renderGames();
  showToast("↩ Đã khôi phục!", "success");

  deletedGame = null;
}

// ===== PLAY =====
function playGame(id) {
  window.location.href = `/games/play_dragonboat.html?id=${id}`;
}

// ===== INIT =====
window.onload = () => {
  goHome();
  bindMusicButtons();
};

// ===== QUESTION SYSTEM =====

function openQuestionManager() {
  const modal = document.getElementById("questionManager");

  modal.classList.remove("hidden");
  modal.classList.add("flex");

  const list = document.getElementById("questionList");

  list.innerHTML = "";

  if (tempQuestions.length === 0) {
    list.innerHTML = `
      <p class="text-gray-400 text-center">
        Chưa có câu hỏi nào
      </p>
    `;
  } else {
    tempQuestions.forEach((q, i) => {
      list.insertAdjacentHTML(
        "beforeend",

        `
        <div class="border p-4 rounded-xl bg-gray-50 shadow-sm">

          <div class="flex justify-between mb-2">

            <p class="text-sm font-semibold">
              Câu ${i + 1}
            </p>

            <button
              onclick="deleteQuestionForm(${i}, this)"
              class="text-red-500">
              🗑
            </button>

          </div>

          <input
            value="${q.question}"

            oninput="
              updateQuestion(
                ${i},
                'question',
                this.value
              )
            "

            class="w-full mb-2 border p-2 rounded"
          />

          <div class="grid grid-cols-2 gap-2">

            <input
              value="${q.answers[0]}"
              oninput="
                updateAnswer(
                  ${i},
                  0,
                  this.value
                )
              "
              class="border p-2 rounded"
            />

            <input
              value="${q.answers[1]}"
              oninput="
                updateAnswer(
                  ${i},
                  1,
                  this.value
                )
              "
              class="border p-2 rounded"
            />

            <input
              value="${q.answers[2]}"
              oninput="
                updateAnswer(
                  ${i},
                  2,
                  this.value
                )
              "
              class="border p-2 rounded"
            />

            <input
              value="${q.answers[3]}"
              oninput="
                updateAnswer(
                  ${i},
                  3,
                  this.value
                )
              "
              class="border p-2 rounded"
            />

          </div>

          <select
            onchange="
              updateQuestion(
                ${i},
                'correct',
                this.value
              )
            "
            class="mt-2 border p-2 rounded w-full"
          >

            <option value="0">
              ✅ A đúng
            </option>

            <option value="1">
              ✅ B đúng
            </option>

            <option value="2">
              ✅ C đúng
            </option>

            <option value="3">
              ✅ D đúng
            </option>

          </select>

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

  if (list.innerText.includes("Chưa có")) {
    list.innerHTML = "";
  }

  const index = document.querySelectorAll("#questionList > div").length;

  list.insertAdjacentHTML(
    "beforeend",

    `
    <div class="border p-4 rounded-xl bg-gray-50 shadow-sm question-card">

      <div class="flex justify-between mb-2">

        <p class="text-sm font-semibold">
          Câu ${index + 1}
        </p>

        <button
          onclick="deleteQuestionForm(${index}, this)"
          class="text-red-500">
          🗑
        </button>

      </div>

      <input
        placeholder="Nhập câu hỏi..."
        class="question-input w-full mb-2 border p-2 rounded"

        oninput="
          updateQuestion(
            ${index},
            'question',
            this.value
          )
        "
      />

      <div class="grid grid-cols-2 gap-2">

        <input
          placeholder="Đáp án A"
          oninput="
            updateAnswer(${index},0,this.value)
          "
          class="border p-2 rounded"
        />

        <input
          placeholder="Đáp án B"
          oninput="
            updateAnswer(${index},1,this.value)
          "
          class="border p-2 rounded"
        />

        <input
          placeholder="Đáp án C"
          oninput="
            updateAnswer(${index},2,this.value)
          "
          class="border p-2 rounded"
        />

        <input
          placeholder="Đáp án D"
          oninput="
            updateAnswer(${index},3,this.value)
          "
          class="border p-2 rounded"
        />

      </div>

      <select
        onchange="
          updateQuestion(
            ${index},
            'correct',
            this.value
          )
        "
        class="mt-2 border p-2 rounded w-full"
      >

        <option value="0">
          ✅ A đúng
        </option>

        <option value="1">
          ✅ B đúng
        </option>

        <option value="2">
          ✅ C đúng
        </option>

        <option value="3">
          ✅ D đúng
        </option>

      </select>

    </div>
  `,
  );

  updateQuestionCount2();

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      const newest = document.querySelector(
        ".question-card:last-child .question-input",
      );

      if (!newest) return;

      newest.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });

      newest.focus();

      newest.click();
    });
  });
}

function saveAllQuestions() {
  const items = document.querySelectorAll("#questionList > div");

  let newQuestions = [];

  for (let i = 0; i < items.length; i++) {
    const item = items[i];

    const inputs = item.querySelectorAll("input");

    const select = item.querySelector("select");

    const question = inputs[0].value.trim();

    const answers = [
      inputs[1].value.trim(),
      inputs[2].value.trim(),
      inputs[3].value.trim(),
      inputs[4].value.trim(),
    ];

    if (!question || answers.some((a) => !a)) {
      showToast("⚠️ Nhập đầy đủ câu hỏi!", "error");

      return;
    }

    newQuestions.push({
      question,
      answers,
      correct: parseInt(select.value),
    });
  }

  tempQuestions = newQuestions;

  closeQuestionManager();

  updateQuestionCount();

  renderQuestionPreview();

  showToast(
    editingId ? "✅ Đã cập nhật thành công" : "✅ Đã lưu câu hỏi",
    "success",
  );
}

function updateQuestion(index, key, value) {
  if (!tempQuestions[index]) {
    tempQuestions[index] = {
      question: "",
      answers: ["", "", "", ""],
      correct: 0,
    };
  }

  tempQuestions[index][key] = value;
}

function updateAnswer(index, answerIndex, value) {
  if (!tempQuestions[index]) {
    tempQuestions[index] = {
      question: "",
      answers: ["", "", "", ""],
      correct: 0,
    };
  }

  tempQuestions[index].answers[answerIndex] = value;
}

function updateQuestionCount() {
  const el = document.getElementById("questionCount");

  if (el) {
    el.innerText = `❓ Bộ câu hỏi (${tempQuestions.length})`;
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
        📭 Chưa có câu hỏi
      </div>
    `;

    return;
  }

  let html = "";

  tempQuestions.forEach((q, i) => {
    html += `
    <div class="
      border-b py-4 flex justify-between items-start
    ">

      <div class="flex-1">

        <div class="font-semibold mb-2">
          ${i + 1}. ${q.question}
        </div>

        <div class="
  flex flex-wrap gap-2
  w-full
">

${q.answers
  .map((a, idx) => {
    const labels = ["A", "B", "C", "D"];

    return `
<span class="
  flex-1 min-w-[220px]
  px-4 py-2
  rounded-xl
  text-sm xl:text-base
  font-semibold
  border
  transition-all
  break-words
  text-center

        ${
          idx === q.correct
            ? "bg-green-100 text-green-700 border-green-400"
            : "bg-gray-100 text-gray-600 border-gray-200"
        }
      ">

        ${labels[idx]}: ${a}

        ${idx === q.correct ? "✔" : ""}

      </span>
    `;
  })
  .join("")}

        </div>

      </div>

      <div class="flex gap-2 ml-4">

        <button
          onclick="editQuestion(${i})"
          class="
            px-3 py-1 rounded-lg
            bg-orange-100 text-orange-600
            hover:bg-orange-200
          "
        >
          ✏️
        </button>

        <button
          onclick="deleteQuestion(${i})"
          class="
            px-3 py-1 rounded-lg
            bg-red-100 text-red-600
            hover:bg-red-200
          "
        >
          🗑
        </button>

      </div>

    </div>
  `;
  });

  box.innerHTML = html;
}

function deleteQuestionForm(index, btn) {
  btn.closest("div.border").remove();

  updateQuestionCount2();
}

function deleteQuestion(index) {
  tempQuestions.splice(index, 1);

  renderQuestionPreview();

  updateQuestionCount();

  showToast("🗑 Đã xóa câu hỏi", "success");
}

function editQuestion(index) {
  openQuestionManager();

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      const cards = document.querySelectorAll("#questionList > div");

      const target = cards[index];

      if (!target) return;

      target.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });

      const input = target.querySelector("input");

      if (input) {
        input.focus();

        input.click();
      }
    });
  });
}
