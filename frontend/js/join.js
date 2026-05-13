const inputs = document.querySelectorAll(".code-box");
const joinBtn = document.getElementById("joinBtn");

inputs[0].focus();

// ===== PASTE FULL CODE =====
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

// ===== INPUT =====
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

// ===== CHECK =====
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

// ===== JOIN =====
joinBtn.addEventListener("click", () => {
  const code = Array.from(inputs)
    .map((i) => i.value.trim())
    .join("")
    .toUpperCase()
    .trim();

  if (!code || code.length !== 6) {
    showToast("Mã phòng không hợp lệ!", "error");
    return;
  }

  console.log("JOIN CODE:", code);

  // ==================================================
  // TURNBASED
  // ==================================================
  const turnRooms = JSON.parse(localStorage.getItem("turn_rooms")) || [];

  console.log("TURN ROOMS:", turnRooms);

  const turnRoom = turnRooms.find(
    (r) => String(r.roomCode).trim().toUpperCase() === code,
  );

  console.log("FOUND TURN ROOM:", turnRoom);

  if (turnRoom) {
    sessionStorage.setItem("joined_room", JSON.stringify(turnRoom));

    showToast("Vào phòng thành công!", "success");

    setTimeout(() => {
      window.location.href = `games/play.html?room=${encodeURIComponent(code)}&join=1`;
    }, 500);

    return;
  }

  // ==================================================
  // QUIZFRUIT
  // ==================================================
  const fruitRooms = JSON.parse(localStorage.getItem("fruit_rooms")) || [];

  console.log("FRUIT ROOMS:", fruitRooms);

  const fruitRoom = fruitRooms.find(
    (r) => String(r.roomCode).trim().toUpperCase() === code,
  );

  console.log("FOUND FRUIT ROOM:", fruitRoom);

  if (fruitRoom) {
    sessionStorage.setItem("joined_room", JSON.stringify(fruitRoom));

    showToast("Vào phòng thành công!", "success");

    setTimeout(() => {
      window.location.href = `games/play_quizfruit.html?room=${encodeURIComponent(code)}&join=1`;
    }, 500);

    return;
  }

  // ==================================================
  // MEMORY
  // ==================================================
  const memoryRooms = JSON.parse(localStorage.getItem("memory_rooms")) || [];

  console.log("MEMORY ROOMS:", memoryRooms);

  const memoryRoom = memoryRooms.find(
    (r) => String(r.roomCode).trim().toUpperCase() === code,
  );

  console.log("FOUND MEMORY ROOM:", memoryRoom);

  if (memoryRoom) {
    sessionStorage.setItem("joined_room", JSON.stringify(memoryRoom));

    showToast("Vào phòng thành công!", "success");

    setTimeout(() => {
      window.location.href = `games/play_memory.html?room=${encodeURIComponent(code)}&join=1`;
    }, 500);

    return;
  }

  // ==================================================
  // DRAGON BOAT
  // ==================================================
  const dragonRooms =
    JSON.parse(localStorage.getItem("dragonboat_rooms")) || [];

  console.log("DRAGON ROOMS:", dragonRooms);

  const dragonRoom = dragonRooms.find(
    (r) => String(r.roomCode).trim().toUpperCase() === code,
  );

  console.log("FOUND DRAGON ROOM:", dragonRoom);

  if (dragonRoom) {
    sessionStorage.setItem("joined_room", JSON.stringify(dragonRoom));

    showToast("Vào phòng thành công!", "success");

    setTimeout(() => {
      window.location.href = `games/play_dragonboat.html?room=${encodeURIComponent(code)}&join=1`;
    }, 500);

    return;
  }
  
  showToast("Không tìm thấy phòng!", "error");
});
