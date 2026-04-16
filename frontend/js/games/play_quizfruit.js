const gameArea = document.getElementById("gameArea");

let fruits = [];
let mouseTrail = [];

// 🍉 map trái
const fruitMap = ["grape.png", "tomato.png", "watermelon.png", "pear.png"];

// 🎯 spawn liên tục
setInterval(spawnFruit, 800);

function playSlash() {
  const s = new Audio("../assets/sounds/slash.mp3");
  s.volume = 0.5;
  s.play();
}

// 🎯 spawn 1 trái (FREE MODE - không quiz)
function spawnFruit() {
  const fruit = document.createElement("div");
  fruit.className = "fruit";

  const x = Math.random() * (window.innerWidth - 100);
  let y = window.innerHeight;

  let vx = (Math.random() - 0.5) * 8;
  let vy = -20 - Math.random() * 10;

  // 🔥 random loại trái
  const img = fruitMap[Math.floor(Math.random() * fruitMap.length)];

  fruit.innerHTML = `
    <img src="../assets/images/${img}">
  `;

  gameArea.appendChild(fruit);

  // 🔥 object chuẩn
  const obj = {
    el: fruit,
    x,
    y,
    vx,
    vy,
    alive: true,
    type: img,
  };

  fruits.push(obj);
  animateFruit(obj);
}

// 🎯 physics bay cong
function animateFruit(fruit) {
  const gravity = 0.5;

  function loop() {
    if (!fruit.alive) return;

    fruit.vy += gravity;
    fruit.x += fruit.vx;
    fruit.y += fruit.vy;

    fruit.rotation = (fruit.rotation || 0) + 5;

    fruit.el.style.transform = `translate(${fruit.x}px, ${fruit.y}px) rotate(${fruit.rotation}deg)`;

    if (fruit.y > window.innerHeight + 100) {
      fruit.el.remove();
      fruit.alive = false;
      return;
    }

    requestAnimationFrame(loop);
  }

  loop();
}
// 🖱️ swipe detection
document.addEventListener("mousemove", (e) => {
  mouseTrail.push({ x: e.clientX, y: e.clientY });

  if (mouseTrail.length > 5) mouseTrail.shift();

  createSlash(e.clientX, e.clientY);

  checkSlice();
});

//vệt chém
function createSlash(x, y) {
  const slash = document.createElement("div");
  slash.className = "slash";

  slash.style.left = x + "px";
  slash.style.top = y + "px";

  gameArea.appendChild(slash);

  setTimeout(() => slash.remove(), 300);
}

// 🎯 check chém
function checkSlice() {
  fruits.forEach((fruit) => {
    if (!fruit.alive) return;

    const rect = fruit.el.getBoundingClientRect();

    mouseTrail.forEach((p) => {
      if (
        p.x > rect.left &&
        p.x < rect.right &&
        p.y > rect.top &&
        p.y < rect.bottom
      ) {
        sliceFruit(fruit);
      }
    });
  });
}

// 🔥 chém trái
function sliceFruit(fruit) {
  if (!fruit.alive) return;

  fruit.alive = false;
  fruit.el.remove();

  playSlash();

  createHalf(fruit, -5);
  createHalf(fruit, 5);
  createSplash(fruit.x, fruit.y, fruit.type);
}

// ✂️ tạo 2 nửa
function createHalf(fruit, dir) {
  const half = document.createElement("img");

  // 🔥 dùng lại ảnh gốc
  half.src = `../assets/images/${fruit.type}`;

  half.className = "half";

  // 🔥 phân trái / phải bằng CSS
  if (dir < 0) {
    half.classList.add("left");
  } else {
    half.classList.add("right");
  }

  gameArea.appendChild(half);

  let x = fruit.x;
  let y = fruit.y;
  let vx = dir * 4; // bay mạnh hơn
  let vy = -8; // nảy lên mạnh hơn
  let rotation = Math.random() * 360;

  function loop() {
    vy += 0.5;
    x += vx;
    y += vy;
    rotation += 8;

    half.style.transform = `translate(${x}px, ${y}px) rotate(${rotation}deg)`;

    if (y > window.innerHeight + 100) {
      half.remove();
      return;
    }

    requestAnimationFrame(loop);
  }

  loop();
}

// 💦 splash
function createSplash(x, y, type) {
  const splash = document.createElement("div");
  splash.className = "splash";

  let color = "red";

  if (type.includes("grape")) color = "#a020f0";
  if (type.includes("pear")) color = "#7CFC00";
  if (type.includes("watermelon")) color = "#ff3b3b";
  if (type.includes("tomato")) color = "#ff0000";

  splash.style.background = `radial-gradient(circle, ${color}, transparent)`;

  splash.style.left = x + "px";
  splash.style.top = y + "px";

  splash.style.transform = "translate(-50%, -50%) scale(0.5)";
  splash.style.opacity = "1";

  gameArea.appendChild(splash);

  // animation
  setTimeout(() => {
    splash.style.transform = "translate(-50%, -50%) scale(2)";
    splash.style.opacity = "0";
  }, 10);

  setTimeout(() => splash.remove(), 400);
}

function openExit() {
  document.getElementById("exitModal").style.display = "flex";
}

function closeExit() {
  document.getElementById("exitModal").style.display = "none";
}

function confirmExit() {
  window.location.href = "quizfruit.html";
}