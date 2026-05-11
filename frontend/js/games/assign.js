let currentAssignGame = null;

function openAssign(gameId, gameType = "turnbased") {
  let storageKey = "games";

  if (gameType === "quizfruit") {
    storageKey = "fruitGames";
  } else if (gameType === "memory") {
    storageKey = "memoryGames";
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

  let roomStorage = "turn_rooms";

  if (currentAssignGame.gameType === "quizfruit") {
    roomStorage = "fruit_rooms";
  } else if (currentAssignGame.gameType === "memory") {
    roomStorage = "memory_rooms";
  }

  let rooms = JSON.parse(localStorage.getItem(roomStorage)) || [];

  const roomData = {
    roomCode,

    assignName: name,

    gameId: currentAssignGame.id,

    gameTitle: currentAssignGame.title,

    gameType: currentAssignGame.gameType,

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

  const link = `${location.origin}/frontend/join.html?room=${data.roomCode}&join=1`;

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

// ================= ASSIGN PAGE =================

if (window.location.pathname.includes("assign.html")) {
  renderAssignmentsPage();
}

function renderAssignmentsPage() {
  const container = document.getElementById("assignmentsContainer");

  if (!container) return;

  const rooms = JSON.parse(localStorage.getItem("turn_rooms")) || [];

  const expiredRooms = rooms.filter((r) => isRoomExpired(r));

  const clearBtn = document.getElementById("clearExpiredBtn");

  if (clearBtn) {
    clearBtn.classList.toggle("hidden", expiredRooms.length === 0);

    clearBtn.innerText = `🗑 XÓA BÀI HẾT HẠN (${expiredRooms.length})`;
  }

  document.getElementById("assignCount").innerText = rooms.length;

  if (rooms.length === 0) {
    container.innerHTML = `
      <div class="assign-empty">

        <div class="assign-empty-icon">
          📋
        </div>

        <h2>
          Chưa có bài tập nào
        </h2>

        <p>
          Vào hoạt động của tôi và bấm nút giao
        </p>

        <button
          onclick="location.href='games/turnbased.html'"
        >
          Đi tới hoạt động
        </button>

      </div>
    `;

    return;
  }

  let html = "";

  [...rooms].reverse().forEach((room, index) => {
    const submits =
      JSON.parse(localStorage.getItem("turn_submit_" + room.roomCode)) || [];

    html += `
  <div class="assign-card">

    <div class="assign-card-left">

      <div class="assign-index">
        ${index + 1}
      </div>

      <div>

        <div class="assign-card-name">
          ${room.assignName || "Không tên"}
        </div>

        <div class="assign-card-game">
          🎲 ${room.gameTitle}
        </div>

      </div>

    </div>

    <div class="assign-card-right">

      <div class="assign-room-code">
        ${room.roomCode}
      </div>

<div class="
  assign-expire
  ${isRoomExpired(room) ? "expired" : ""}
">
  ${isRoomExpired(room) ? "🔴 Đã kết thúc" : "⏰ " + getRemainingTime(room)}
</div>

      <div class="assign-submit-count">
        👤 ${submits.length} học sinh
      </div>

      <button
        class="assign-view-btn"
        onclick="openAssignDetail('${room.roomCode}')"
      >
        👁 Xem
      </button>

    </div>

  </div>
`;
  });

  container.innerHTML = html;
}

// ================= DETAIL =================

function openAssignDetail(roomCode) {
  const overlay = document.getElementById("assignDetailOverlay");

  const list = document.getElementById("detailSubmitList");

  const rooms = JSON.parse(localStorage.getItem("turn_rooms")) || [];

  const room = rooms.find((r) => r.roomCode === roomCode);

  if (!room) return;

  document.getElementById("detailTitle").innerText =
    room.assignName || room.gameTitle;

  document.getElementById("detailCode").innerText = "Mã phòng: " + roomCode;

  const submits =
    JSON.parse(localStorage.getItem("turn_submit_" + roomCode)) || [];

  if (submits.length === 0) {
    list.innerHTML = `
      <div class="assign-no-submit">

        <div class="assign-no-icon">
          💤
        </div>

        <h3>
          Chưa có học sinh nào nộp
        </h3>

      </div>
    `;
  } else {
    let html = "";

    submits.forEach((s, index) => {
      html += `
        <div class="submit-item">

          <div class="submit-left">

            <div class="submit-stt">
              ${index + 1}
            </div>

            <div>

              <div class="submit-name">
                ${s.name}
              </div>

              <div class="submit-time">
              🕒 ${new Date(s.submittedAt).toLocaleString("vi-VN")}
              </div>

            </div>

          </div>

          <div class="submit-result">
            🏆 HOÀN THÀNH
          </div>

        </div>
      `;
    });

    list.innerHTML = html;
  }

  overlay.classList.remove("hidden");
}

function closeAssignDetail() {
  document.getElementById("assignDetailOverlay").classList.add("hidden");
}

function getTurnSubmit(roomCode) {
  return JSON.parse(localStorage.getItem("turn_submit_" + roomCode)) || [];
}

function isRoomExpired(room) {
  const end = room.createdAt + room.expireDay * 24 * 60 * 60 * 1000;

  return Date.now() > end;
}

function getRemainingTime(room) {
  const end = room.createdAt + room.expireDay * 24 * 60 * 60 * 1000;

  const diff = end - Date.now();

  if (diff <= 0) {
    return "Đã hết hạn";
  }

  const totalHours = Math.floor(diff / (1000 * 60 * 60));

  const days = Math.floor(totalHours / 24);

  const hours = totalHours % 24;

  if (days > 0) {
    return `${days} ngày ${hours} giờ`;
  }

  return `${hours} giờ`;
}

function clearExpiredAssignments() {
  let rooms =
    JSON.parse(localStorage.getItem("turn_rooms")) || [];

  rooms = rooms.filter(
    (room) => !isRoomExpired(room),
  );

  localStorage.setItem(
    "turn_rooms",
    JSON.stringify(rooms),
  );

  showToast(
    "🗑 Đã xóa bài hết hạn!",
    "success",
  );

  renderAssignmentsPage();
}