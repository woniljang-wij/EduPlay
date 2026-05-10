const inputs = document.querySelectorAll(".code-box");
const joinBtn = document.getElementById("joinBtn");

inputs[0].focus();

// ===== INPUT =====
inputs.forEach((input, index) => {
  input.addEventListener("input", (e) => {
    let value = e.target.value;

    // chỉ lấy 1 ký tự cuối
    value = value.slice(-1).toUpperCase();

    e.target.value = value;

    // auto next
    if (value && index < inputs.length - 1) {
      inputs[index + 1].focus();
    }

    checkComplete();
  });

  // backspace về ô trước
  input.addEventListener("keydown", (e) => {
    if (e.key === "Backspace" && !e.target.value && index > 0) {
      inputs[index - 1].focus();
    }

    // enter join
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
  const turnRooms =
    JSON.parse(localStorage.getItem("turn_rooms")) || [];

  console.log("TURN ROOMS:", turnRooms);

  const turnRoom = turnRooms.find(
    (r) =>
      String(r.roomCode).trim().toUpperCase() === code
  );

  console.log("FOUND TURN ROOM:", turnRoom);

  if (turnRoom) {
    sessionStorage.setItem(
      "joined_room",
      JSON.stringify(turnRoom)
    );

    showToast("Vào phòng thành công!", "success");

    setTimeout(() => {
      window.location.href =
        `games/play.html?room=${encodeURIComponent(code)}`;
    }, 500);

    return;
  }

  // ==================================================
  // QUIZFRUIT
  // ==================================================
  const fruitRooms =
    JSON.parse(localStorage.getItem("fruit_rooms")) || [];

  console.log("FRUIT ROOMS:", fruitRooms);

  const fruitRoom = fruitRooms.find(
    (r) =>
      String(r.roomCode).trim().toUpperCase() === code
  );

  console.log("FOUND FRUIT ROOM:", fruitRoom);

  if (fruitRoom) {
    sessionStorage.setItem(
      "joined_room",
      JSON.stringify(fruitRoom)
    );

    showToast("Vào phòng thành công!", "success");

    setTimeout(() => {
      window.location.href =
        `games/play_quizfruit.html?room=${encodeURIComponent(code)}`;
    }, 500);

    return;
  }

  // ==================================================
  // NOT FOUND
  // ==================================================
  showToast("Không tìm thấy phòng!", "error");
});