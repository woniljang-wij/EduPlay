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

  // ảnh preview
  document.getElementById("previewImg").src = game.image;
  document.getElementById("previewBox").classList.remove("hidden");

  tempQuestions = game.questions || [];

  // đánh dấu đang edit
  window.editingId = id;

  showToast("✏️ Đang chỉnh sửa", "info");
}

// ===== SAVE GAME =====
function saveMemoryGame() {
  const title = document.getElementById("title").value.trim();
  const answer = document.getElementById("answer").value.trim();
  const grid = parseInt(document.getElementById("grid").value);
  const time = parseInt(document.getElementById("time").value);

  const imgType = document.querySelector(
    "input[name='imgType']:checked",
  )?.value;

  // ===== VALIDATE =====
  if (!title) return showToast("Nhập tiêu đề!", "error");
  if (!answer) return showToast("Nhập đáp án!", "error");
  if (!time || time <= 0) return showToast("Nhập thời gian!", "error");

  if (tempQuestions.length === 0) {
    showToast("⚠️ Chưa có câu hỏi, vẫn lưu để test", "info");
  }

  // ===== IMAGE HANDLE =====
  if (imgType === "upload") {
    const file = document.getElementById("imageFile").files[0];

    // 👉 edit không chọn file → dùng ảnh cũ
    if (!file) {
      const currentImg = document.getElementById("previewImg").src;

      if (!currentImg) {
        return showToast("Chọn ảnh!", "error");
      }

      return saveGameWithImage(currentImg);
    }

    // 👉 có file → convert base64
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
  const time = parseInt(document.getElementById("time").value);

  let games = JSON.parse(localStorage.getItem("memoryGames")) || [];

  // ===== EDIT =====
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
          questions: tempQuestions,
        };
      }
      return g;
    });

    showToast("✅ Đã cập nhật!", "success");
    window.editingId = null;
  } else {
    // ===== CREATE =====
    games.push({
      id: Date.now(),
      title,
      answer,
      image,
      grid,
      time,
      questions: tempQuestions,
    });

    showToast("🎉 Lưu thành công!", "success");
  }

  // ===== SAVE =====
  localStorage.setItem("memoryGames", JSON.stringify(games));

  // ===== UI =====
  goHome();
  renderMemoryGames();

  // ===== RESET =====
  document.getElementById("title").value = "";
  document.getElementById("answer").value = "";
  document.getElementById("time").value = "";
  document.getElementById("imageUrl").value = "";
  document.getElementById("imageFile").value = "";

  document.getElementById("previewBox").classList.add("hidden");
  document.getElementById("previewImg").src = "";

  tempQuestions = [];
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
};
