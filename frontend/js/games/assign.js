let currentAssignGame = null;

function openAssign(gameId, gameType = "turnbased") {
  let storageKey = "games";

  if (gameType === "quizfruit") {
    storageKey = "fruitGames";
  }

  const games = JSON.parse(localStorage.getItem(storageKey)) || [];

  const game = games.find((g) => String(g.id) === String(gameId));

  if (!game) {
    console.log("GAME NOT FOUND", gameId, storageKey);
    return;
  }

  currentAssignGame = {
    ...game,
    gameType,
  };

  document.getElementById("assignTitle").innerText = game.title;

  document.getElementById("assignModal").classList.remove("hidden");
}

function closeAssign() {
  document.getElementById("assignModal").classList.add("hidden");
}

document.addEventListener("click", (e) => {
  if (e.target.classList.contains("assign-time")) {
    document
      .querySelectorAll(".assign-time")
      .forEach((btn) => btn.classList.remove("active"));

    e.target.classList.add("active");
  }
});

function generateRoomCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

function createAssign() {
  const name = document.getElementById("assignName").value.trim();

  if (!name) {
    showToast("⚠️ Nhập tên gợi nhớ!", "error");
    return;
  }

  const roomCode = generateRoomCode();

  const activeDay = document.querySelector(".assign-time.active");

  const expireDay = parseInt(activeDay.dataset.day);

  const roomStorage =
    currentAssignGame.gameType === "quizfruit" ? "fruit_rooms" : "turn_rooms";

  let rooms = JSON.parse(localStorage.getItem(roomStorage)) || [];

  const roomData = {
    roomCode,
    gameId: currentAssignGame.id,
    gameTitle: currentAssignGame.title,
    gameData: currentAssignGame,
    createdAt: Date.now(),
    expireDay,
  };

  rooms.push(roomData);

  localStorage.setItem(roomStorage, JSON.stringify(rooms));

  closeAssign();

  showAssignSuccess(roomData);
}

function showAssignSuccess(data) {
  document.getElementById("assignSuccess").classList.remove("hidden");

  document.getElementById("roomCode").innerText = data.roomCode;

  const link = `${location.origin}/frontend/join.html?room=${data.roomCode}`;

  document.getElementById("roomLink").value = link;

  document.getElementById("qrImage").src =
    `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(link)}`;
}

function closeAssignSuccess() {
  document.getElementById("assignSuccess").classList.add("hidden");
}

function copyRoomLink() {
  const input = document.getElementById("roomLink");

  input.select();

  document.execCommand("copy");

  showToast("📋 Đã sao chép link!", "success");
}
