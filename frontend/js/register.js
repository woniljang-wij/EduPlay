const form = document.getElementById("registerForm");
const btn = document.getElementById("registerBtn");

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const firstNameInput = document.getElementById("firstName");
    const lastNameInput = document.getElementById("lastName");
    const usernameInput = document.getElementById("username");
    const passwordInput = document.getElementById("password");

    const firstName = firstNameInput.value.trim();
    const lastName = lastNameInput.value.trim();
    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();

    const full_name = firstName + " " + lastName;

    // 🔴 VALIDATE
    if (!firstName) {
        showToast("Nhập tên!", "error");
        firstNameInput.focus();
        return;
    }

    if (!lastName) {
        showToast("Nhập họ!", "error");
        lastNameInput.focus();
        return;
    }

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
    btn.innerText = "Đang tạo tài khoản...";

    try {
        const res = await fetch("http://127.0.0.1:5000/auth/register", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ full_name, username, password })
        });

        const data = await res.json();

        if (res.ok) {
            showToast("Đăng ký thành công 🎉", "success");

            setTimeout(() => {
                window.location.href = "login.html";
            }, 500); // delay nhẹ cho đẹp
        } else {
            showToast(data.message || "Đăng ký thất bại!", "error");
        }

    } catch (err) {
        showToast("Lỗi kết nối server!", "error");
        console.error(err);
    }

    btn.disabled = false;
    btn.innerText = "Đăng ký tham gia";
});