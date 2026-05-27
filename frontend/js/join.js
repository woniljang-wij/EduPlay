const inputs = document.querySelectorAll(".code-box");
const joinBtn = document.getElementById("joinBtn");

inputs[0].focus();

// ================= PASTE FULL CODE =================
inputs.forEach((input) => {
  input.addEventListener("paste", (e) => {
    e.preventDefault();

    const pasted = (e.clipboardData || window.clipboardData)
      .getData("text")
      .replace(/\s/g, "")
      .toUpperCase();

    if (!pasted) return;

    pasted
      .slice(0, inputs.length)
      .split("")
      .forEach((char, i) => {
        inputs[i].value = char;
      });

    checkComplete();

    const next = [...inputs].find((i) => !i.value) || inputs[inputs.length - 1];

    next.focus();
  });
});

// ================= INPUT =================
inputs.forEach((input, index) => {
  input.addEventListener("input", (e) => {
    let value = e.target.value;

    value = value.slice(-1).toUpperCase();

    e.target.value = value;

    if (value && index < inputs.length - 1) {
      inputs[index + 1].focus();
    }

    checkComplete();
  });

  input.addEventListener("keydown", (e) => {
    if (e.key === "Backspace" && !e.target.value && index > 0) {
      inputs[index - 1].focus();
    }

    if (e.key === "Enter" && !joinBtn.disabled) {
      joinBtn.click();
    }
  });
});

// ================= CHECK COMPLETE =================
function checkComplete() {
  const code = Array.from(inputs)
    .map((i) => i.value)
    .join("");

  if (code.length === inputs.length) {
    joinBtn.disabled = false;
    joinBtn.innerText = "🚀 BẮT ĐẦU CHƠI";
  } else {
    joinBtn.disabled = true;
    joinBtn.innerText = "SẴN SÀNG CHƯA?";
  }
}

// ================= JOIN ROOM =================
joinBtn.addEventListener("click", async () => {
  const code = Array.from(inputs)
    .map((i) => i.value.trim())
    .join("")
    .toUpperCase()
    .trim();

  if (!code || code.length !== 6) {
    showToast("❌ Mã phòng không hợp lệ!", "error");
    return;
  }

  console.log("JOIN CODE:", code);

  try {
    // ===== LOAD ALL ROOMS =====
    const res = await fetch("http://127.0.0.1:5000/api/rooms");

    if (!res.ok) {
      throw new Error("LOAD ROOM FAILED");
    }

    const rooms = await res.json();

    console.log("ALL ROOMS:", rooms);

    // ===== FIND ROOM =====
    const room = rooms.find(
      (r) => String(r.roomCode).trim().toUpperCase() === code,
    );

    console.log("FOUND ROOM:", room);

    // ===== NOT FOUND =====
    if (!room) {
      showToast("❌ Không tìm thấy phòng!", "error");
      return;
    }

    // ===== CHECK EXPIRE =====
    const created = new Date(room.createdAt).getTime();

    const end = created + room.expireDay * 24 * 60 * 60 * 1000;

    if (Date.now() > end) {
      showToast("⏰ Phòng đã hết hạn!", "error");
      return;
    }

    // ===== SAVE SESSION =====
    sessionStorage.setItem("joined_room", JSON.stringify(room));

    showToast("✅ Vào phòng thành công!", "success");

    // ===== REDIRECT =====
    setTimeout(() => {
      // TURNBASED
      if (room.gameType === "turnbased") {
        window.location.href = `games/play.html?room=${encodeURIComponent(code)}&join=1`;
      }

      // QUIZFRUIT
      else if (room.gameType === "quizfruit") {
        window.location.href = `games/play_quizfruit.html?room=${encodeURIComponent(code)}&join=1`;
      }

      // MEMORY
      else if (room.gameType === "memory") {
        window.location.href = `games/play_memory.html?room=${encodeURIComponent(code)}&join=1`;
      }

      // DRAGONBOAT
      else if (room.gameType === "dragonboat") {
        window.location.href = `games/play_dragonboat.html?room=${encodeURIComponent(code)}&join=1`;
      }

      // UNKNOWN
      else {
        showToast("❌ Không xác định loại game!", "error");
      }
    }, 500);
  } catch (err) {
    console.error("JOIN ROOM ERROR:", err);

    showToast("❌ Lỗi kết nối server!", "error");
  }
});
