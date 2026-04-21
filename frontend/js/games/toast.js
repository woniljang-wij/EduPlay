// ===== STATE =====
let currentToast = null;
let toastTimer = null;

// undo global
let undoCallback = null;

// ===== SOUND =====
const sounds = {
  success: new Audio("../assets/sounds/success.mp3"),
  error: new Audio("../assets/sounds/error.mp3"),
  info: new Audio("../assets/sounds/info.mp3")
};

// 🔊 play sound
function playSound(type) {
  const sound = sounds[type] || sounds.info;

  try {
    sound.pause();        // 🔥 fix overlap
    sound.currentTime = 0;
    sound.play();
  } catch (e) {
    console.warn("Sound blocked");
  }
}

// ===== MAIN =====
function showToast(message, type = "success", duration = 2500) {
  let container = document.getElementById("toast-container") || createContainer();

  // 🔥 reset toast cũ
  if (currentToast) {
    clearTimeout(toastTimer);
    currentToast.remove();
    currentToast = null;
  }

  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;

  toast.innerHTML = `
    <div class="toast-message">${message}</div>
    <div class="toast-close">&times;</div>
  `;

  container.appendChild(toast);
  currentToast = toast;

  // 🔊 sound
  playSound(type);

  // 🎆 firework
  createFirework(toast, type);

  // ⏱ timer
  toastTimer = setTimeout(() => removeToast(toast), duration);

  toast.querySelector(".toast-close").onclick = () => removeToast(toast);
}

// ===== UNDO =====
function showUndoToast(message, onUndo, duration = 4000) {
  let container = document.getElementById("toast-container") || createContainer();

  if (currentToast) {
    clearTimeout(toastTimer);
    currentToast.remove();
  }

  const toast = document.createElement("div");
  toast.className = "toast toast-error";

  toast.innerHTML = `
    <div class="toast-message">${message}</div>
    <button class="toast-undo">↩ Hoàn tác</button>
  `;

  container.appendChild(toast);
  currentToast = toast;

  undoCallback = onUndo;

  playSound("error");
  createFirework(toast, "error");
  
  toast.querySelector(".toast-undo").onclick = () => {
    if (undoCallback) undoCallback();
    undoCallback = null;
    removeToast(toast);
  };

  toastTimer = setTimeout(() => {
    undoCallback = null;
    removeToast(toast);
  }, duration);
}

// ===== REMOVE =====
function removeToast(el) {
  if (!el) return;

  el.classList.add("hide");

  setTimeout(() => {
    // 🔥 remove luôn particle còn sót
    el.querySelectorAll(".toast-firework").forEach(p => p.remove());

    el.remove();
    if (currentToast === el) currentToast = null;
  }, 250);
}

// ===== CONTAINER =====
function createContainer() {
  const container = document.createElement("div");
  container.id = "toast-container";
  document.body.appendChild(container);
  return container;
}

// ===== FIREWORK =====
function createFirework(toast, type) {
  const colors = {
    success: ["#22c55e", "#4ade80", "#bbf7d0"],
    error: ["#ef4444", "#f87171", "#fecaca"],
    info: ["#3b82f6", "#60a5fa", "#bfdbfe"]
  };

  const particleColors = colors[type] || colors.info;

  const total = 14;

  for (let i = 0; i < total; i++) {
    const p = document.createElement("span");
    p.className = "toast-firework";

    const angle = (i / total) * Math.PI * 2;
    const distance = 70 + Math.random() * 40;

    const dx = Math.cos(angle) * distance;
    const dy = Math.sin(angle) * distance;

    p.style.setProperty("--dx", dx + "px");
    p.style.setProperty("--dy", dy + "px");

    p.style.background =
      particleColors[Math.floor(Math.random() * particleColors.length)];

    toast.appendChild(p);

    setTimeout(() => p.remove(), 700);
  }
}