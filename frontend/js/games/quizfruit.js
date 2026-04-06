function goIndex() {
  window.location.href = "../index.html";
}

let selectedSpeed = "medium";
let tempQuestions = [];
let editingId = null;

// NAV
function goCreate() {
  document.getElementById("page-list").classList.add("hidden");
  document.getElementById("page-create").classList.remove("hidden");
}

function goHome() {
  document.getElementById("page-create").classList.add("hidden");
  document.getElementById("page-list").classList.remove("hidden");
  renderGames();
}

// SPEED
document.querySelectorAll(".speed-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    selectedSpeed = btn.dataset.speed;

    document.querySelectorAll(".speed-btn")
      .forEach(b => b.classList.remove("active-speed"));

    btn.classList.add("active-speed");
  });
});

// SAVE
function saveGame() {
  const title = document.getElementById("title").value;
  const time = document.getElementById("time").value;
  const hideCamera = document.getElementById("hideCamera").checked;
  const noCamera = document.getElementById("noCamera").checked;

  let games = JSON.parse(localStorage.getItem("fruitGames")) || [];

  const newGame = {
    id: Date.now(),
    title,
    time,
    speed: selectedSpeed,
    hideCamera,
    noCamera,
    questions: tempQuestions
  };

  games.push(newGame);

  localStorage.setItem("fruitGames", JSON.stringify(games));

  showToast("🎉 Lưu thành công!");
  goHome();
}

// RENDER
function renderGames() {
  const container = document.getElementById("gameList");
  let games = JSON.parse(localStorage.getItem("fruitGames")) || [];

  if (games.length === 0) {
    container.innerHTML = "Chưa có bài";
    return;
  }

  container.innerHTML = games.map(g => `
    <div class="p-4 border rounded-xl mb-3">
      <h3 class="font-bold">${g.title}</h3>
      <p>${g.questions.length} câu hỏi</p>
    </div>
  `).join("");
}

// TOAST
function showToast(msg) {
  const toast = document.getElementById("toast");

  toast.innerText = msg;
  toast.className = `
    fixed top-5 right-5 bg-green-500 text-white
    px-5 py-3 rounded-xl shadow-lg
    transition-all duration-500
  `;

  setTimeout(() => toast.style.opacity = 1, 50);
  setTimeout(() => toast.style.opacity = 0, 2000);
}