const form = document.getElementById("registerForm");
const btn = document.getElementById("registerBtn");

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const firstName = document.getElementById("firstName").value.trim();
    const lastName = document.getElementById("lastName").value.trim();
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();

    const full_name = firstName + " " + lastName;

    if (!firstName || !lastName || !username || !password) {
        alert("Vui lòng nhập đầy đủ thông tin!");
        return;
    }

    // loading
    btn.disabled = true;
    btn.innerText = "Đang tạo tài khoản...";

    try {
        const res = await fetch("http://127.0.0.1:5000/auth/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                full_name,
                username,
                password
            })
        });

        const data = await res.json();

        if (res.ok) {
            alert("Đăng ký thành công!");

            // 👉 chuyển qua login
            window.location.href = "login.html";
        } else {
            alert(data.message);
        }

    } catch (err) {
        alert("Lỗi kết nối server!");
    }

    btn.disabled = false;
    btn.innerText = "Đăng ký tham gia";
});