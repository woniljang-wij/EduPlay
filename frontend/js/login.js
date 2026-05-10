const form = document.getElementById("loginForm");
const btn = document.getElementById("loginBtn");

form.addEventListener("submit", async (e) => {
  e.preventDefault();

  const usernameInput = document.getElementById("username");
  const passwordInput = document.getElementById("password");

  const username = usernameInput.value.trim();
  const password = passwordInput.value.trim();

  // 🔴 VALIDATE
  if (!username) {
    showToast("Nhập email!", "error");
    usernameInput.focus();
    return;
  }

  if (!password) {
    showToast("Nhập mật khẩu!", "error");
    passwordInput.focus();
    return;
  }

  // loading
  btn.disabled = true;
  btn.innerText = "Đang đăng nhập...";

  try {
    const res = await fetch("http://127.0.0.1:5000/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();

    if (res.ok) {
      showToast("Đăng nhập thành công 🎉", "success");

      localStorage.setItem("user", JSON.stringify(data.user));

      setTimeout(() => {
        window.location.href = "index.html";
      }, 400); // delay nhẹ thôi
    } else {
      showToast(data.message || "Sai tài khoản!", "error");
    }

  } catch (err) {
    showToast("Lỗi server!", "error");
    console.error(err);
  }

  btn.disabled = false;
  btn.innerText = "Đăng nhập";
});