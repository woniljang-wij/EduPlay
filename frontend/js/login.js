const form = document.getElementById("loginForm");

form.addEventListener("submit", async (e) => {
  e.preventDefault(); // 🔥 CHẶN RELOAD

  console.log("🔥 submit login");

  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  try {
    const res = await fetch("http://127.0.0.1:5000/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username,
        password,
      }),
    });

    const data = await res.json();

    if (res.ok) {
      alert("Đăng nhập thành công 🎉");

      // lưu user
      localStorage.setItem("user", JSON.stringify(data.user));

      const redirect = localStorage.getItem("redirectAfterLogin");

      if (redirect) {
        localStorage.removeItem("redirectAfterLogin");
        window.location.href = redirect;
      } else {
        window.location.href = "index.html";
      }
      
    } else {
      alert(data.message);
    }
  } catch (err) {
    alert("Lỗi kết nối server!");
    console.error(err);
  }
});
