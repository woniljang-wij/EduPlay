import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
  getAuth,
  GoogleAuthProvider,
  FacebookAuthProvider,
  signInWithPopup,
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

// ================= FIREBASE CONFIG =================
const firebaseConfig = {
  apiKey: "AIzaSyDI8Va2_jJlBWThK8csN1E9U5XoUVdIZg4",
  authDomain: "eduplay-8679a.firebaseapp.com",
  projectId: "eduplay-8679a",
  storageBucket: "eduplay-8679a.firebasestorage.app",
  messagingSenderId: "159510401618",
  appId: "1:159510401618:web:c8d0cab2a839585733458b",
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

// ================= PROVIDERS =================
const googleProvider = new GoogleAuthProvider();

const facebookProvider = new FacebookAuthProvider();

// RESET PARAMS
facebookProvider.setCustomParameters({
  display: "popup",
});

// CHỈ XIN public_profile
facebookProvider.addScope("public_profile");

// ================= GOOGLE LOGIN =================
const googleBtn = document.getElementById("googleLoginBtn");

if (googleBtn) {
  googleBtn.addEventListener("click", async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);

      const user = result.user;

      const userData = {
        full_name: user.displayName || "",

        email: user.email || "",

        avatar: user.photoURL ? user.photoURL.replace("s96-c", "s400-c") : "",

        loginType: "google",
      };

      localStorage.setItem("user", JSON.stringify(userData));

      window.showToast("Đăng nhập Google thành công 🎉", "success");

      setTimeout(() => {
        window.location.href = "index.html";
      }, 600);
    } catch (err) {
      console.error(err);

      console.log("ERROR CODE:", err.code);

      console.log("ERROR MESSAGE:", err.message);

      window.showToast("Đăng nhập Google thất bại!", "error");
    }
  });
}

// ================= FACEBOOK LOGIN =================
const facebookBtn = document.getElementById("facebookLoginBtn");

if (facebookBtn) {
  facebookBtn.addEventListener("click", async () => {
    try {
      // FORCE CLEAR PREVIOUS FACEBOOK SESSION
      await auth.signOut();

      const result = await signInWithPopup(auth, facebookProvider);

      const user = result.user;

      const userData = {
        full_name: user.displayName || "",

        // DEV MODE có thể không trả email
        email: user.email || "",

        avatar: user.photoURL || "",

        loginType: "facebook",
      };

      localStorage.setItem("user", JSON.stringify(userData));

      console.log("FACEBOOK USER:", user);

      window.showToast("Đăng nhập Facebook thành công 🎉", "success");

      setTimeout(() => {
        window.location.href = "index.html";
      }, 600);
    } catch (err) {
      console.error(err);

      console.log("ERROR CODE:", err.code);

      console.log("ERROR MESSAGE:", err.message);

      window.showToast("Đăng nhập Facebook thất bại!", "error");
    }
  });
}
