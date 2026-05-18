let currentAssignGame = null;

function openAssign(gameId, gameType = "turnbased") {
  let storageKey = "games";

  if (gameType === "quizfruit") {
    storageKey = "fruitGames";
  } else if (gameType === "memory") {
    storageKey = "memoryGames";
  } else if (gameType === "dragonboat") {
    storageKey = "dragonboatGames";
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
  } else if (currentAssignGame.gameType === "dragonboat") {
    roomStorage = "dragonboat_rooms";
  }

  let rooms = JSON.parse(localStorage.getItem(roomStorage)) || [];

  const roomData = {
    roomCode,
    assignName: name,
    gameId: currentAssignGame.id,
    gameTitle: currentAssignGame.title,
    gameType: currentAssignGame.gameType,
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

  setInterval(() => {
    renderAssignmentsPage();
  }, 1000);
}

function renderAssignmentsPage() {
  const container = document.getElementById("assignmentsContainer");

  if (!container) return;

  const turnRooms = JSON.parse(localStorage.getItem("turn_rooms")) || [];

  const fruitRooms = JSON.parse(localStorage.getItem("fruit_rooms")) || [];

  const memoryRooms = JSON.parse(localStorage.getItem("memory_rooms")) || [];

  const dragonboatRooms =
    JSON.parse(localStorage.getItem("dragonboat_rooms")) || [];

  const rooms = [
    ...turnRooms,
    ...fruitRooms,
    ...memoryRooms,
    ...dragonboatRooms,
  ];

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
          onclick="location.href='../index.html'"
        >
          Đi tới hoạt động
        </button>

      </div>
    `;

    return;
  }

  let html = "";

  rooms.forEach((room, index) => {
    let submitKey = "turn_submit_";

    if (room.gameType === "quizfruit") {
      submitKey = "fruit_submit_";
    } else if (room.gameType === "memory") {
      submitKey = "memory_submit_";
    } else if (room.gameType === "dragonboat") {
      submitKey = "dragonboat_submit_";
    }

    const submits =
      JSON.parse(localStorage.getItem(submitKey + room.roomCode)) || [];

    html += `
<div class="assign-table-row">

  <!-- STT -->
<div class="assign-col stt">

  <div class="assign-stt-box">
    #${index + 1}
  </div>

</div>

<!-- TÊN GỢI NHỚ -->
<div class="assign-col remind">

  <div>

    <div class="assign-main-name">
      ${room.assignName || "Không tên"}
    </div>

    <div class="assign-sub-game">
      📌 Bài tập được giao
    </div>

  </div>

</div>

<!-- BÀI HỌC -->
<div class="assign-col lesson">

  <div class="assign-main-name">
    ${room.gameTitle}
  </div>

<div class="assign-sub-game">
  ${
    room.gameType === "quizfruit"
      ? "🍉 Chém Hoa Quả"
      : room.gameType === "memory"
        ? "🧩 Lật Thẻ"
        : room.gameType === "dragonboat"
          ? "🐉 Đua Thuyền Rồng"
          : "🎲 Game Theo Lượt"
  }
</div>

</div>

  <!-- MÃ + LINK -->
  <div class="assign-col code">

    <div class="assign-room-wrap">

      <div class="assign-room-code">
        ${room.roomCode}
      </div>

      <button
        class="mini-icon-btn"
        onclick="copyRoomCode('${room.roomCode}')"
        title="Sao chép mã"
      >
        <i class="bi bi-copy"></i>
      </button>

      <button
        class="mini-icon-btn"
        onclick="shareRoom('${room.roomCode}')"
        title="Chia sẻ link"
      >
        <i class="bi bi-link-45deg"></i>
      </button>

    </div>

  </div>

  <!-- TRẠNG THÁI -->
  <div class="assign-col status">

    <div class="
      assign-expire
      ${isRoomExpired(room) ? "expired" : ""}
    ">

      ${isRoomExpired(room) ? "🔴 Đã kết thúc" : "⏰ " + getRemainingTime(room)}

    </div>

  </div>

<!-- NỘP -->
<div class="assign-col submit">
  <i class="bi bi-check2-circle"></i>

  ${(() => {
    // ===== QUIZ / MEMORY =====
    if (room.gameType !== "turnbased" && room.gameType !== "dragonboat") {
      return submits.length;
    }

    // ===== TURNBASED =====
    if (room.gameType === "turnbased") {
      const games = JSON.parse(localStorage.getItem("games")) || [];

      const game = games.find((g) => String(g.id) === String(room.gameId));

      const matches = [
        ...new Set(submits.map((s) => s.matchId || s.submittedAt)),
      ];

      return matches.length;
    }

    // ===== DRAGONBOAT =====
    const matches = [
      ...new Set(submits.map((s) => s.matchId || s.submittedAt)),
    ];

    return matches.length;
  })()}
</div>

  <!-- THAO TÁC -->
  <div class="assign-col action">

    <button
      class="assign-view-btn"
      onclick="openAssignDetail('${room.roomCode}')"
    >
      <i class="bi bi-eye-fill"></i>
    </button>

  </div>

</div>
`;
  });

  container.innerHTML = html;
}

function copyRoomCode(code) {
  navigator.clipboard.writeText(code);

  showToast("📋 Đã sao chép mã phòng!", "success");
}

function shareRoom(roomCode) {
  const link = `${location.origin}/frontend/join.html?room=${roomCode}&join=1`;

  navigator.clipboard.writeText(link);

  showToast("🔗 Đã sao chép link phòng!", "success");
}

// ================= DETAIL =================

function openAssignDetail(roomCode) {
  const overlay = document.getElementById("assignDetailOverlay");

  const list = document.getElementById("detailSubmitList");

  const rooms = [
    ...(JSON.parse(localStorage.getItem("turn_rooms")) || []),
    ...(JSON.parse(localStorage.getItem("fruit_rooms")) || []),
    ...(JSON.parse(localStorage.getItem("memory_rooms")) || []),
    ...(JSON.parse(localStorage.getItem("dragonboat_rooms")) || []),
  ];

  const room = rooms.find((r) => r.roomCode === roomCode);

  if (!room) return;

  document.getElementById("detailTitle").innerText =
    room.assignName || room.gameTitle;

  document.getElementById("detailCode").innerText = "Mã phòng: " + roomCode;

  let submitKey = "turn_submit_";

  if (room.gameType === "quizfruit") {
    submitKey = "fruit_submit_";
  } else if (room.gameType === "memory") {
    submitKey = "memory_submit_";
  } else if (room.gameType === "dragonboat") {
    submitKey = "dragonboat_submit_";
  }

  const submits = JSON.parse(localStorage.getItem(submitKey + roomCode)) || [];

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

    // ===== GAME THEO LƯỢT =====
    if (room.gameType === "turnbased") {
      const grouped = {};

      submits.forEach((s) => {
        const key = s.matchId || "old";

        if (!grouped[key]) {
          grouped[key] = [];
        }

        grouped[key].push(s);
      });

      Object.values(grouped).forEach((match) => {
        html += `<div class="submit-group">`;

        match.forEach((s, index) => {
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
                🕒 ${
                  s.submittedAt
                    ? new Date(s.submittedAt).toLocaleString("vi-VN")
                    : "Không có thời gian"
                }
              </div>

            </div>

          </div>

          <div class="submit-result">
            ${s.result === "WIN" ? "🏆 Người chiến thắng" : "💀 Người thua"}
          </div>

        </div>
      `;
        });

        html += `</div>`;
      });
    }

    // ===== QUIZFRUIT + MEMORY =====
    else if (room.gameType === "quizfruit" || room.gameType === "memory") {
      const grouped = {};

      submits.forEach((s) => {
        const key = s.name || "Unknown";

        if (!grouped[key]) {
          grouped[key] = [];
        }

        grouped[key].push(s);
      });

      let globalIndex = 1;
      Object.entries(grouped).forEach(([player, attempts]) => {
        html += `
      <div class="submit-group">
    `;

        attempts.forEach((s, index) => {
          html += `
        <div class="submit-item">

          <div class="submit-left">

            <div class="submit-stt">
              ${globalIndex++}
            </div>

            <div>

              <div class="submit-name">
                ${s.name}
              </div>

              <div class="submit-time">
                🕒 ${
                  s.submittedAt
                    ? new Date(s.submittedAt).toLocaleString("vi-VN")
                    : s.time || "Không có thời gian"
                }
              </div>

            </div>

          </div>

          <div class="submit-result">

            ${
              room.gameType === "quizfruit"
                ? `🎯 ${s.correct}/${s.total} • ⭐ ${s.score}/10`
                : "🧠 Hoàn thành"
            }

          </div>

        </div>
      `;
        });

        html += `</div>`;
      });
    }

    // ===== DRAGONBOAT =====
    else if (room.gameType === "dragonboat") {
      const grouped = {};

      submits.forEach((s) => {
        const key = s.matchId || "old";

        if (!grouped[key]) {
          grouped[key] = [];
        }

        grouped[key].push(s);
      });

      Object.values(grouped).forEach((match) => {
        html += `<div class="submit-group">`;

        match.forEach((s, index) => {
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
                🕒 ${
                  s.submittedAt
                    ? new Date(s.submittedAt).toLocaleString("vi-VN")
                    : "Không có thời gian"
                }
              </div>

            </div>

          </div>

          <div class="submit-result">

            ${
              s.result === "WIN"
                ? "🏆 Người chiến thắng"
                : s.result === "DRAW"
                  ? "🤝 Hòa"
                  : "💀 Người thua"
            }

          </div>

        </div>
      `;
        });

        html += `</div>`;
      });
    }

    list.innerHTML = html;
    list.style.display = "flex";
    list.style.flexDirection = "column-reverse";
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
  // tính end đúng từ createdAt + expireDay
  const end = room.createdAt + room.expireDay * 24 * 60 * 60 * 1000;

  const now = Date.now();

  let diff = Math.floor((end - now) / 1000);

  if (diff <= 0) return "Đã kết thúc";

  const days = Math.floor(diff / 86400);
  diff %= 86400;

  const hours = Math.floor(diff / 3600);
  diff %= 3600;

  const minutes = Math.floor(diff / 60);

  const seconds = diff % 60;

  // > 1 ngày
  if (days > 0) {
    return `${days} ngày ${hours} giờ ${minutes} phút ${seconds} giây`;
  }

  // > 1 giờ
  if (hours > 0) {
    return `${hours} giờ ${minutes} phút ${seconds} giây`;
  }

  // > 1 phút
  if (minutes > 0) {
    return `${minutes} phút ${seconds} giây`;
  }

  // còn giây
  return `${seconds} giây`;
}

function clearExpiredAssignments() {
  const storages = [
    "turn_rooms",
    "fruit_rooms",
    "memory_rooms",
    "dragonboat_rooms",
  ];

  storages.forEach((key) => {
    let rooms = JSON.parse(localStorage.getItem(key)) || [];

    rooms = rooms.filter((room) => !isRoomExpired(room));

    localStorage.setItem(key, JSON.stringify(rooms));
  });

  showToast("🗑 Đã xóa bài hết hạn!", "success");

  renderAssignmentsPage();
}
