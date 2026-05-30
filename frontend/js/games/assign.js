let currentAssignGame = null;

let games = [];

function openAssign(gameId, gameType = "turnbased") {
  const game = games.find((g) => String(g.db_id) === String(gameId));
  if (!game) {
    showToast("❌ Không tìm thấy game!", "error");
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

async function createAssign() {
  const name = document.getElementById("assignName").value.trim();

  if (!name) {
    showToast("⚠️ Nhập tên gợi nhớ!", "error");
    return;
  }

  const user = JSON.parse(localStorage.getItem("user"));

  if (!user || !user.id) {
    showToast("❌ Chưa đăng nhập!", "error");
    return;
  }

  const roomCode = generateRoomCode();

  const activeDay = document.querySelector(".assign-time.active");

  const expireDay = parseInt(activeDay.dataset.day);

  try {
    const res = await fetch("http://127.0.0.1:5000/api/rooms", {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      body: JSON.stringify({
        game_id: currentAssignGame.db_id,

        game_title: currentAssignGame.title,

        teacher_id: user.id,

        game_type: currentAssignGame.gameType,

        room_code: roomCode,

        assign_name: name,

        expire_day: expireDay,
      }),
    });

    // ===== CHECK ERROR =====
    if (!res.ok) {
      const errorText = await res.text();

      console.error("CREATE ROOM ERROR:", errorText);

      showToast("❌ Tạo phòng thất bại!", "error");

      return;
    }

    const data = await res.json();

    closeAssign();

    // ===== ADD UI NGAY =====
    const newRoom = {
      id: data.id,

      roomCode,

      assignName: name,

      gameId: currentAssignGame.db_id,

      gameTitle: currentAssignGame.title,

      gameType: currentAssignGame.gameType,

      expireDay,

      createdAt: Date.now(),

      results: [],
    };

    // tạo nếu chưa có
    if (!window.assignRooms) {
      window.assignRooms = [];
    }

    // thêm lên đầu
    window.assignRooms.unshift(newRoom);

    // render ngay
    renderAssignmentsPage();

    // popup success
    showAssignSuccess({
      roomCode,
    });

    showToast("✅ Đã tạo bài tập!", "success");
  } catch (err) {
    console.error(err);

    showToast("❌ Lỗi tạo phòng!", "error");
  }
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

// ================= LOAD GAMES FROM DATABASE =================
async function loadAssignGames() {
  try {
    const user = JSON.parse(localStorage.getItem("user"));

    if (!user || !user.id) return;

    // ===== LOAD GAMES =====
    const res = await fetch(`http://127.0.0.1:5000/api/games/${user.id}`);

    const data = await res.json();

    games = data.map((g) => ({
      ...JSON.parse(g.game_data),

      db_id: g.id,

      title: g.title,

      subject: g.subject,

      music: g.music,

      game_type: g.game_type,
    }));

    // ===== LOAD ROOMS =====
    const roomRes = await fetch(`http://127.0.0.1:5000/api/rooms/${user.id}`);

    const roomData = await roomRes.json();

    let resultData = [];

    for (const room of roomData) {
      try {
        const res = await fetch(`http://127.0.0.1:5000/api/results/${room.id}`);

        const data = await res.json();

        resultData.push(...data);
      } catch (err) {
        console.error("LOAD RESULT ERROR:", err);
      }
    }

    window.assignRooms = roomData.map((r) => {
      const roomResults = resultData.filter(
        (x) => Number(x.room_id) === Number(r.id),
      );

      const game = games.find((g) => Number(g.db_id) === Number(r.game_id));

      return {
        id: r.id,

        roomCode: r.room_code,

        assignName: r.assign_name,

        gameId: r.game_id,

        gameTitle: game?.title || r.game_title || "Bài đã bị xóa",

        gameType: r.game_type,

        expireDay: r.expire_day,

        createdAt: new Date(r.created_at).getTime(),

        results: roomResults,
      };
    });

    renderAssignmentsPage();
  } catch (err) {
    console.error("LOAD ASSIGN GAMES ERROR:", err);

    showToast("❌ Lỗi tải dữ liệu!", "error");
  }
}

// ================= ASSIGN PAGE =================
if (window.location.pathname.includes("assign.html")) {
  (async () => {
    await loadAssignGames();

    setInterval(() => {
      if (window.assignRooms?.length) {
        renderAssignmentsPage();
      }
    }, 1000);
  })();
}

function renderAssignmentsPage() {
  const container = document.getElementById("assignmentsContainer");

  if (!container) return;

  const rooms = Array.isArray(window.assignRooms) ? window.assignRooms : null;

  if (!rooms) {
    return;
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
    const gameExist = games.some(
      (g) => String(g.db_id) === String(room.gameId),
    );

    const submits = room.results || [];

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
  ${!gameExist ? "deleted" : isRoomExpired(room) ? "expired" : ""}
">

${
  !gameExist
    ? "⚫ Bài đã bị xóa"
    : isRoomExpired(room)
      ? "🔴 Đã kết thúc"
      : "⏰ " + getRemainingTime(room)
}

</div>

  </div>

<!-- NỘP -->
<div class="assign-col submit">
  <i class="bi bi-check2-circle"></i>

  ${(() => {
    // ===== QUIZ / MEMORY =====
    if (room.gameType === "quizfruit" || room.gameType === "memory") {
      const matches = [
        ...new Set(submits.map((s) => s.match_id || s.submitted_at)),
      ];

      return matches.length;
    }

    // ===== TURNBASED =====
    if (room.gameType === "turnbased") {
      const game = games.find((g) => String(g.db_id) === String(room.gameId));

      if (!game) return 0;

      const matches = [
        ...new Set(submits.map((s) => s.match_id || s.submitted_at)),
      ];

      return matches.length;
    }

    // ===== DRAGONBOAT =====
    const matches = [
      ...new Set(submits.map((s) => s.match_id || s.submitted_at)),
    ];

    return matches.length;
  })()}
</div>

<!-- THAO TÁC -->
<div class="assign-col action">

${
  !gameExist || isRoomExpired(room)
    ? `
      <button
        class="assign-action-btn assign-delete-btn"
        onclick="deleteAssignment('${room.roomCode}', '${room.gameType}')"
      >
        <i class="bi bi-trash-fill"></i>
      </button>
    `
    : `
      <button
        class="assign-action-btn assign-view-btn"
        onclick="openAssignDetail('${room.roomCode}')"
      >
        <i class="bi bi-eye-fill"></i>
      </button>
    `
}

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

  const rooms = window.assignRooms || [];

  const room = rooms.find((r) => r.roomCode === roomCode);

  if (!room) return;

  document.getElementById("detailTitle").innerText =
    room.assignName || room.gameTitle;

  document.getElementById("detailCode").innerText = "Mã phòng: " + roomCode;

  const submits = room.results || [];

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
        const key = s.match_id || "old";

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
                ${s.player_name}
              </div>

              <div class="submit-time">
                🕒 ${
                  s.submitted_at
                    ? new Date(s.submitted_at).toLocaleString("vi-VN")
                    : "Không có thời gian"
                }
              </div>

            </div>

          </div>

          <div class="submit-result">
            ${s.result_text === "WIN" ? "🏆 Người chiến thắng" : "💀 Người thua"}
          </div>

        </div>
      `;
        });

        html += `</div>`;
      });
    } else if (room.gameType === "quizfruit" || room.gameType === "memory") {
      const grouped = {};

      submits.forEach((s) => {
        const key = s.match_id || s.submitted_at || crypto.randomUUID();

        if (!grouped[key]) {
          grouped[key] = [];
        }

        grouped[key].push(s);
      });

      Object.values(grouped).forEach((attempts, index) => {
        const s = attempts[0];

        html += `
      <div class="submit-group">

        <div class="submit-item">

          <div class="submit-left">

            <div class="submit-stt">
              ${index + 1}
            </div>

            <div>

              <div class="submit-name">
                ${s.player_name || "Không rõ"}
              </div>

              <div class="submit-time">
                🕒 ${
                  s.submitted_at
                    ? new Date(s.submitted_at).toLocaleString("vi-VN")
                    : s.time || "Không có thời gian"
                }
              </div>

            </div>

          </div>

          <div class="submit-result">

${
  room.gameType === "quizfruit"
    ? (() => {
        let extra = {};

        try {
          if (typeof s.extra_data === "object") {
            extra = s.extra_data || {};
          } else if (typeof s.extra_data === "string") {
            extra = JSON.parse(s.extra_data);
          }
        } catch (e) {
          extra = {};
        }

        return `
          🎯 ${extra.correct || 0}/${extra.total || 0}
          • ⭐ ${s.score || 0}/10
        `;
      })()
    : "🧠 Hoàn thành"
}

          </div>

        </div>

      </div>
    `;
      });
    }

    // ===== DRAGONBOAT =====
    else if (room.gameType === "dragonboat") {
      const grouped = {};

      submits.forEach((s) => {
        const key = s.match_id || "old";

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
                ${s.player_name}
              </div>

              <div class="submit-time">
                🕒 ${
                  s.submitted_at
                    ? new Date(s.submitted_at).toLocaleString("vi-VN")
                    : "Không có thời gian"
                }
              </div>

            </div>

          </div>

          <div class="submit-result">

            ${
              s.result_text === "WIN"
                ? "🏆 Người chiến thắng"
                : s.result_text === "DRAW"
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
  }

  overlay.classList.remove("hidden");
}

function closeAssignDetail() {
  document.getElementById("assignDetailOverlay").classList.add("hidden");
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

async function deleteAssignment(roomCode) {
  try {
    const res = await fetch(`http://127.0.0.1:5000/api/rooms/${roomCode}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      throw new Error("DELETE FAILED");
    }

    // ===== XÓA KHỎI ARRAY =====
    window.assignRooms = window.assignRooms.filter(
      (r) => r.roomCode !== roomCode,
    );

    // ===== RENDER LẠI =====
    renderAssignmentsPage();

    // ===== TOAST =====
    showToast("🗑 Đã xóa bài tập!", "success");
  } catch (err) {
    console.error("DELETE ASSIGN ERROR:", err);

    showToast("❌ Lỗi xóa!", "error");
  }
}
