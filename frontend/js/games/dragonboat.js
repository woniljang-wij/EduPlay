let tempQuestions = [];

// ===== INDEPENDENT MODE =====
let blueQuestions = [];
let redQuestions = [];

let currentQuestionTeam = "shared";

let editingId = null;

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

function loadSavedMusic() {
  if (!db) return;

  const tx = db.transaction("music", "readonly");

  const store = tx.objectStore("music");

  const req = store.getAll();

  req.onsuccess = () => {
    const musics = req.result || [];

    musics.forEach((music) => {
      // tránh render trùng
      const existed = [...document.querySelectorAll(".music-btn")].some(
        (btn) => btn.dataset.src === music.id,
      );

      if (existed) return;

      const url = URL.createObjectURL(music.file);

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

      btn.dataset.src = music.id;

      btn.dataset.name = music.name;

      btn.dataset.custom = "true";

      const control = document.createElement("span");

      control.innerHTML = "▶";

      control.className = "text-green-500 text-xs cursor-pointer";

      const name = document.createElement("span");

      name.textContent = music.name;

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
    });
  };
}

function isIndependentMode() {
  const selected = document.querySelector("input[name='mode']:checked");

  if (!selected) return false;

  return selected.parentElement.innerText.toLowerCase().includes("độc lập");
}

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

    blueQuestions = [];
    redQuestions = [];

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
async function saveGame() {
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

  const controlMode =
    document.querySelector("input[name='control']:checked")?.value || "screen";

  const user = JSON.parse(localStorage.getItem("user"));

  if (!user || !user.id) {
    showToast("Bạn chưa đăng nhập!", "error");
    return;
  }

  const payload = {
    title,
    duration,
    freeze,
    winScore,
    players: [team1, team2],
    mode,
    controlMode,
    music,
    sharedQuestions: tempQuestions || [],
    blueQuestions: blueQuestions || [],
    redQuestions: redQuestions || [],
  };

  try {
    // ===== EDIT =====
    if (editingId) {
      await fetch(`http://127.0.0.1:5000/api/games/${editingId}`, {
        method: "PUT",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          user_id: user.id,

          game_type: "dragonboat",

          title,

          subject: "Dragon Boat",

          music: music || "",

          game_data: payload,
        }),
      });

      showToast("✅ Đã cập nhật!", "success");

      editingId = null;

      await loadGames();

      goHome();

      return;
    }

    // ===== CREATE =====
    await fetch("http://127.0.0.1:5000/api/games", {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        user_id: user.id,

        game_type: "dragonboat",

        title,

        subject: "Dragon Boat",

        music: music || "",

        game_data: payload,
      }),
    });

    showToast("🎉 Đã lưu!", "success");

    await loadGames();

    goHome();
  } catch (err) {
    console.error(err);

    showToast("❌ Lỗi database!", "error");
  }
}

function isIndependentGame(game) {
  return game.mode?.toLowerCase().includes("độc lập");
}

async function loadGames() {
  const user = JSON.parse(localStorage.getItem("user"));

  if (!user || !user.id) {
    games = [];
    renderGames();
    return;
  }

  try {
    const res = await fetch(`http://127.0.0.1:5000/api/games/${user.id}`);

    const dbGames = await res.json();

    games = dbGames
      .filter((g) => g.game_type === "dragonboat")
      .map((g) => ({
        ...JSON.parse(g.game_data),

        db_id: g.id,
      }));

    renderGames();
  } catch (err) {
    console.error("LOAD GAME ERROR:", err);
  }
}

// ===== RENDER =====
function renderGames() {
  const container = document.getElementById("gameList");
  if (!container) return;

  container.className = "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6";

  // ===== EMPTY =====
  if (games.length === 0) {
    container.innerHTML = `
      <div class="col-span-full text-center py-20">
        <div class="text-5xl mb-3">🐉</div>
        <h2 class="text-xl font-semibold mb-3">
          Chưa có bài chơi nào
        </h2>

        <button
          onclick="goCreate()"
          class="
            px-6 py-3 rounded-xl text-white font-semibold
            bg-gradient-to-r from-pink-500 via-red-500 to-purple-600
            shadow-lg hover:scale-105 transition
          "
        >
          ➕ Tạo bài đầu tiên
        </button>

      </div>
    `;
    return;
  }

  let html = "";

  games.forEach((g) => {
    const isIndependent = isIndependentGame(g);

    html += `
    <div class="w-full max-w-[420px]">

      <div class="
        card
        bg-white/80
        backdrop-blur
        rounded-2xl
        p-5
        shadow-lg
        border border-white/40
        relative
      ">

        <!-- ICON -->
        <span class="absolute top-3 right-3 text-lg">
          🐉
        </span>

        <!-- TITLE -->
        <h3 class="font-bold text-lg mb-3">
          ${g.title}
        </h3>

        <!-- TAG -->
        <div class="flex gap-2 mb-4 text-sm flex-wrap items-center">

          <span class="
            bg-blue-100
            text-blue-700
            px-3 py-1
            rounded-full whitespace-nowrap min-w-fit
          ">
            👥 ${g.players.length} đội
          </span>

          ${
            isIndependent
              ? `

                <span class="
                  bg-blue-100
                  text-blue-700
                  px-3 py-1
                  rounded-full whitespace-nowrap min-w-fit
                ">
                  🔵 ${g.blueQuestions?.length || 0}
                </span>

                <span class="
                  bg-red-100
                  text-red-700
                  px-3 py-1
                  rounded-full whitespace-nowrap min-w-fit
                ">
                  🔴 ${g.redQuestions?.length || 0}
                </span>

              `
              : `

                <span class="
                  bg-green-100
                  text-green-700
                  px-3 py-1
                  rounded-full whitespace-nowrap min-w-fit
                ">
                  🧠 ${g.sharedQuestions?.length || 0} câu
                </span>

              `
          }

          <span class="
            bg-red-100
            text-red-600
            px-3 py-1
            rounded-full whitespace-nowrap min-w-fit
          ">
            🏆 ${g.winScore || 3} điểm
          </span>

        </div>

        <!-- BUTTON -->
        <div class="flex gap-3 mb-4">

          <button
            onclick="playGame(${g.db_id})"
            class="
              play-btn
              flex-1
              py-3
              rounded-xl
              font-semibold
              shadow-lg
              relative
              overflow-hidden
            "
          >
            ▶ Chơi
          </button>

          <button
            onclick="openAssign(${g.db_id}, 'dragonboat')"
            class="
              px-4 py-2
              border border-gray-200
              rounded-xl
              text-purple-600
              hover:bg-purple-50
              transition
            "
          >
            📋 Giao
          </button>

        </div>

        <!-- ACTION -->
        <div class="flex gap-5 text-sm font-medium">

          <button
            onclick="editGame(${g.db_id})"
            class="text-orange-500 hover:underline"
          >
            ✏️ Sửa
          </button>

          <button
            onclick="fakeFeature('🔗 Chia sẻ')"
            class="text-blue-500 hover:underline"
          >
            🔗 Chia sẻ GV
          </button>

          <button
            onclick="deleteGame(${g.db_id})"
            class="text-red-500 hover:underline"
          >
            🗑 Xóa bài
          </button>

        </div>

      </div>

    </div>
    `;
  });

  container.innerHTML = html;
}

// ===== EDIT =====
function editGame(id) {
  const game = games.find((g) => Number(g.db_id) === Number(id));
  if (!game) return;

  editingId = id;
  goCreate(true);

  if (!window.musicLoadedOnce) {
    loadSavedMusic();

    window.musicLoadedOnce = true;
  }

  document.querySelector("input[placeholder='Nhập tiêu đề...']").value =
    game.title;

  // ===== RESTORE CONFIG =====

  const inputs = document.querySelectorAll(".input-ui");

  // thời gian
  if (inputs[1]) {
    inputs[1].value = game.duration || "60";
  }

  // điểm thắng
  if (inputs[2]) {
    inputs[2].value = game.winScore || 3;
  }

  // đóng băng
  if (inputs[3]) {
    inputs[3].value = game.freeze || "3";
  }

  // đội xanh
  if (inputs[4]) {
    inputs[4].value = game.players?.[0] || "Đội Xanh";
  }

  // đội đỏ
  if (inputs[5]) {
    inputs[5].value = game.players?.[1] || "Đội Đỏ";
  }

  // ===== RESTORE MODE =====

  const modeRadios = document.querySelectorAll("input[name='mode']");

  modeRadios.forEach((radio) => {
    const text = radio.parentElement.innerText.toLowerCase();

    if (
      game.mode?.toLowerCase().includes("độc lập") &&
      text.includes("độc lập")
    ) {
      radio.checked = true;
    }

    if (
      game.mode?.toLowerCase().includes("mặc định") &&
      text.includes("mặc định")
    ) {
      radio.checked = true;
    }
  });

  // ===== RESTORE CONTROL MODE =====

  const controlRadios = document.querySelectorAll("input[name='control']");

  controlRadios.forEach((radio) => {
    radio.checked = radio.value === (game.controlMode || "screen");
  });

  // ===== RESTORE QUESTIONS =====

  tempQuestions = game.sharedQuestions || [];

  blueQuestions = game.blueQuestions || [];

  redQuestions = game.redQuestions || [];

  renderQuestionPreview();
  updateQuestionCount();

  // ===== RESTORE MUSIC ACTIVE =====
  document.querySelectorAll(".music-btn").forEach((btn) => {
    btn.classList.remove("active");
  });

  // reset active nhạc
  document.querySelectorAll(".music-btn").forEach((btn) => {
    btn.classList.remove("active");
  });

  // nếu game không có nhạc -> active mặc định bài 1
  if (!game.music) {
    const defaultBtn = document.querySelector(".music-btn");

    if (defaultBtn) {
      defaultBtn.classList.add("active");
    }
  }

  if (game.music) {
    const targetBtn = [...document.querySelectorAll(".music-btn")].find(
      (btn) => btn.dataset.src === game.music,
    );

    if (targetBtn) {
      targetBtn.classList.add("active");

      // custom upload
      if (targetBtn.dataset.custom === "true") {
        const tx = db.transaction("music", "readonly");

        const req = tx.objectStore("music").get(game.music);

        req.onsuccess = () => {
          if (req.result?.file) {
            const url = URL.createObjectURL(req.result.file);

            currentAudio.pause();

            currentAudio = new Audio(url);

            currentAudio.loop = true;

            currentAudio.volume = 0.7;
          }
        };
      }
    }
  }
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

    renderGames();

    showToast("🗑 Đã xóa game!", "success");
  } catch (err) {
    console.error("DELETE GAME ERROR:", err);

    showToast("❌ Xóa thất bại!", "error");
  }
}

// ===== PLAY =====
function playGame(id) {
  window.location.href = `/games/play_dragonboat.html?id=${id}`;
}

// ===== INIT =====
window.onload = async () => {
  bindMusicButtons();

  await loadGames();

  goHome();
};

function openQuestionManager(team = "shared") {
  currentQuestionTeam = team;

  const modal = document.getElementById("questionManager");

  modal.classList.remove("hidden");
  modal.classList.add("flex");

  const list = document.getElementById("questionList");

  list.innerHTML = "";

  const data = isIndependentMode()
    ? team === "blue"
      ? blueQuestions
      : redQuestions
    : tempQuestions;

  if (data.length === 0) {
    list.innerHTML = `
      <p class="text-gray-400 text-center">
        Chưa có câu hỏi nào
      </p>
    `;
  } else {
    data.forEach((q, i) => {
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
              oninput="updateAnswer(${i},0,this.value)"
              class="border p-2 rounded"
            />

            <input
              value="${q.answers[1]}"
              oninput="updateAnswer(${i},1,this.value)"
              class="border p-2 rounded"
            />

            <input
              value="${q.answers[2]}"
              oninput="updateAnswer(${i},2,this.value)"
              class="border p-2 rounded"
            />

            <input
              value="${q.answers[3]}"
              oninput="updateAnswer(${i},3,this.value)"
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

            <option value="0" ${q.correct == 0 ? "selected" : ""}>
              ✅ A đúng
            </option>

            <option value="1" ${q.correct == 1 ? "selected" : ""}>
              ✅ B đúng
            </option>

            <option value="2" ${q.correct == 2 ? "selected" : ""}>
              ✅ C đúng
            </option>

            <option value="3" ${q.correct == 3 ? "selected" : ""}>
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

  if (isIndependentMode()) {
    if (currentQuestionTeam === "blue") {
      blueQuestions = newQuestions;
    } else if (currentQuestionTeam === "red") {
      redQuestions = newQuestions;
    }
  } else {
    tempQuestions = newQuestions;
  }

  closeQuestionManager();

  updateQuestionCount();

  renderQuestionPreview();

  showToast(
    editingId ? "✅ Đã cập nhật thành công" : "✅ Đã lưu câu hỏi",
    "success",
  );
}

function updateQuestion(index, key, value) {
  let target = tempQuestions;

  if (isIndependentMode()) {
    target = currentQuestionTeam === "blue" ? blueQuestions : redQuestions;
  }

  if (!target[index]) {
    target[index] = {
      question: "",
      answers: ["", "", "", ""],
      correct: 0,
    };
  }

  target[index][key] = value;
}

function updateAnswer(index, answerIndex, value) {
  let target = tempQuestions;

  if (isIndependentMode()) {
    target = currentQuestionTeam === "blue" ? blueQuestions : redQuestions;
  }

  if (!target[index]) {
    target[index] = {
      question: "",
      answers: ["", "", "", ""],
      correct: 0,
    };
  }

  target[index].answers[answerIndex] = value;
}

function updateQuestionCount() {
  const el = document.getElementById("questionCount");

  if (!el) return;

  // ===== MODE ĐỘC LẬP =====
  if (isIndependentMode()) {
    el.classList.add("hidden");
  }

  // ===== MODE MẶC ĐỊNH =====
  else {
    el.classList.remove("hidden");

    el.innerText = `❓ Bộ câu hỏi (${tempQuestions.length})`;
  }
}

function updateQuestionCount2() {
  const count = document.querySelectorAll("#questionList > div").length;

  document.getElementById("questionCount2").innerText = count;
}

function renderQuestionPreview() {
  const box = document.getElementById("questionPreview");

  const manualBtn = document.getElementById("manualQuestionBtn");

  if (!box) return;

  // ===== MODE ĐỘC LẬP =====

  if (isIndependentMode()) {
    manualBtn.classList.add("hidden");

    box.innerHTML = `
  <div class="grid grid-cols-2 gap-10 relative">

    <div class="
      absolute
      left-1/2
      top-0
      -translate-x-1/2
      w-px
      h-full
      bg-gradient-to-b
      from-transparent
      via-gray-300
      to-transparent
    "></div>

        <div>

          <div class="text-blue-600 font-bold mb-3">
            🔵 Bộ câu hỏi đội xanh (${blueQuestions.length})
          </div>

          <button
            onclick="openQuestionManager('blue')"
            class="mb-4 px-4 py-2 rounded-xl border border-blue-300 text-blue-600"
          >
            ✏️ Nhập câu hỏi đội xanh
          </button>

          <div id="bluePreview"></div>

        </div>

        <div>

          <div class="text-red-600 font-bold mb-3">
            🔴 Bộ câu hỏi đội đỏ (${redQuestions.length})
          </div>

          <button
            onclick="openQuestionManager('red')"
            class="mb-4 px-4 py-2 rounded-xl border border-red-300 text-red-600"
          >
            ✏️ Nhập câu hỏi đội đỏ
          </button>

          <div id="redPreview"></div>

        </div>

      </div>
    `;

    renderPreviewList("bluePreview", blueQuestions);

    renderPreviewList("redPreview", redQuestions);

    return;
  }

  // ===== MODE MẶC ĐỊNH =====

  manualBtn.classList.remove("hidden");

  if (tempQuestions.length === 0) {
    box.innerHTML = `
      <div class="text-gray-400 text-center py-6">
        📭 Chưa có câu hỏi
      </div>
    `;

    return;
  }

  renderPreviewList("questionPreview", tempQuestions);
}

function renderPreviewList(id, data) {
  const box = document.getElementById(id);

  if (!box) return;

  let html = "";

  data.forEach((q, i) => {
    html += `
      <div class="border-b py-4">

        <div class="font-semibold mb-3">
          ${i + 1}. ${q.question}
        </div>

        <div class="grid grid-cols-2 gap-2">

          ${q.answers
            .map((a, idx) => {
              const labels = ["A", "B", "C", "D"];

              return `
                <div class="
                  p-3 rounded-xl border text-center font-semibold

                  ${
                    idx === q.correct
                      ? "bg-green-100 border-green-400 text-green-700"
                      : "bg-gray-100 border-gray-200 text-gray-600"
                  }
                ">

                  ${labels[idx]}: ${a}

                  ${idx === q.correct ? "✔" : ""}

                </div>
              `;
            })
            .join("")}

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

document.querySelectorAll("input[name='mode']").forEach((radio) => {
  radio.addEventListener("change", () => {
    renderQuestionPreview();

    updateQuestionCount();
  });
});

function goAssignments() {
  window.location.href = "assign.html";
}
