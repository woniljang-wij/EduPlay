# 🎮 EduPlay – Nền tảng học tập qua trò chơi

## 📌 Giới thiệu

**EduPlay** là hệ thống học tập tương tác giúp biến kiến thức thành trải nghiệm game sinh động.
Người dùng có thể tạo, quản lý và chơi các trò chơi học tập ngay trên nền tảng web.

---

## 🎯 Mục tiêu

* Gamification trong giáo dục
* Tăng hứng thú học tập
* Kết hợp:

  * 🧠 Tư duy
  * ⚡ Phản xạ
  * 🎮 Trải nghiệm game

---

## 🎮 Các chế độ chơi

---

### 🍉 1. Chém Hoa Quả (Fruit Quiz)

#### 🔹 Mô tả

Người chơi chém các trái cây bay trên màn hình để chọn đáp án đúng.

#### 🔹 Tính năng

* Physics trái cây (bay, rơi, xoay)
* Chém bằng chuột (swipe detection)
* Timer vòng tròn mượt (requestAnimationFrame)
* Hiệu ứng:

  * ✂️ Cắt đôi trái
  * 💦 Splash màu theo loại quả
  * 🗡️ Slash trail
* 🔊 Âm thanh + nhạc nền (có mute)

#### 🔹 Code chính

* Logic game: 

---

### 🎲 2. Game Theo Lượt (Turn-Based)

#### 🔹 Mô tả

Người chơi tung xúc xắc, di chuyển trên bản đồ và trả lời câu hỏi để vượt chướng ngại vật.

#### 🔹 Gameplay

* Tung xúc xắc → di chuyển
* Dính ô 💀 → trả lời câu hỏi
* Đúng → đi tiếp
* Sai → mất lượt

#### 🔹 Tính năng nổi bật

* 🎲 Dice 3D animation
* 🗺️ Bản đồ di chuyển
* 👥 Nhiều người chơi
* 🎬 Video intro + victory random
* 🎉 Confetti + animation chiến thắng
* ⏱ Câu hỏi có timer

#### 🔹 Code chính

* UI + logic tạo game: 
* Gameplay: 
* Giao diện play: 

---

### 🧠 3. Kéo Co Kiến Thức (Tug of War) *(Đang phát triển)*

#### 🔹 Ý tưởng

* 2 đội thi đấu
* Trả lời đúng → kéo dây về phía mình
* Đội kéo về hết → thắng

#### 🔹 Trạng thái

* ✅ Đã có UI route
* ❌ Chưa triển khai gameplay

---

### 🧩 4. Lật Mảnh Ghép (Memory Game) *(Đang phát triển)*

#### 🔹 Ý tưởng

* Lật các ô để tìm cặp đúng
* Kết hợp câu hỏi kiến thức

#### 🔹 Trạng thái

* ✅ Đã có UI route
* ❌ Chưa triển khai logic

---

## 🚀 Tính năng hệ thống

### 📚 Quản lý bài học

* Tạo / sửa / xoá game
* Thêm câu hỏi
* Lưu bằng LocalStorage

### 🎨 UI/UX

* Full background (X10THINK style)
* Animation mượt
* Game feel thay vì web form

### 🔊 Âm thanh

* Nhạc nền
* Sound effect
* Toggle mute (không pause nhạc)

---

## 🧱 Công nghệ sử dụng

### Frontend

* HTML5
* CSS3 (Animation, UI game)
* JavaScript (Vanilla)

### Backend

* Python (Flask)
* SQLite

---

## 📁 Cấu trúc project

```bash
EDUPLAY/
│
├── backend/
│   ├── database/
│   ├── models/
│   ├── routes/
│   └── app.py
│
├── frontend/
│   ├── assets/
│   │   ├── images/
│   │   ├── sounds/
│   │   └── videos/
│
│   ├── css/
│   ├── games/
│   │   ├── quizfruit.html
│   │   ├── play_quizfruit.html
│   │   ├── turnbased.html
│   │   ├── play.html
│   │   ├── tugofwar.html
│   │   └── memory.html
│
│   ├── js/
│   │   ├── games/
│   │   │   ├── quizfruit.js
│   │   │   ├── play_quizfruit.js
│   │   │   ├── turnbased.js
│   │   │   ├── play.js
│   │   │   ├── tugofwar.js
│   │   │   └── memory.js
│
│   └── index.html
```

---

## 🎮 Cách sử dụng

### 👨‍🏫 Giáo viên

1. Đăng nhập
2. Tạo game
3. Thêm câu hỏi
4. Chia sẻ cho học sinh

### 🎮 Học sinh

1. Nhập mã
2. Tham gia game
3. Học qua chơi

---

## 💡 Điểm nổi bật

* 🎮 Trải nghiệm như game thật
* ⚡ Animation mượt (60fps)
* 🧠 Kết hợp nhiều thể loại gameplay
* 🔥 Dễ mở rộng thêm game mới

---

## 🔮 Hướng phát triển

* Multiplayer real-time
* AI đối thủ
* Ranking / leaderboard
* Mobile app
* Database server (thay LocalStorage)

---

## 👨‍💻 Tác giả

* EduPlay 
* Sinh viên:
Nguyễn Nhật Trường
Lê Chí Hưng
Bùi Phong Nhận

---

## 📜 License

Dự án phục vụ mục đích học tập.
