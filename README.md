# 🎮 EduPlay – Gamified Learning Platform

> 🚀 Biến việc học thành trải nghiệm game tương tác  
> ⚡ Tập trung vào UI/UX, animation mượt và game feel thực tế

---

## 📌 Giới thiệu

**EduPlay** là nền tảng học tập thông qua trò chơi (Gamification), cho phép người dùng:

* 🎮 Tạo game học tập
* 🧠 Thêm câu hỏi tương tác
* ⚡ Trải nghiệm gameplay thay vì web form truyền thống

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

### 🍉 Chém Hoa Quả (Fruit Quiz)
* Chém trái cây bay để chọn đáp án
* Physics + slash effect + timer
* Âm thanh + hiệu ứng sinh động

---

### 🎲 Game Theo Lượt (Turn-Based)
* Tung xúc xắc → di chuyển → trả lời câu hỏi
* Nhiều người chơi
* Confetti + animation chiến thắng

---

### 🧩 Lật Mảnh Ghép (Memory Game)
* Lật ô → trả lời câu hỏi → mở ảnh
* Giải mã hình ảnh để thắng
* Gameplay chính đã hoàn thiện gần xong

---

### 🧠 Kéo Co Kiến Thức
* 2 đội trả lời câu hỏi để kéo dây
* Đang phát triển

---

## 🚀 Tính năng hệ thống

### 📚 Quản lý bài học
* Tạo / sửa / xoá game  
* Thêm câu hỏi  
* Lưu bằng LocalStorage  

---

### 🎨 UI/UX (X10THINK Style)
* Full background (video + animation)
* Blur + glass effect
* Gradient + hover animation
* Game feel thay vì web form

---

### 🔊 Âm thanh
* Nhạc nền  
* Sound effect  
* Toggle mute  

---

## 📊 Cập nhật tiến độ (Tuần 5)

---

### 👤 SV1 – UI/UX & Memory Game

#### 🎨 Giao diện

* Thiết kế toàn bộ UI Memory Game theo phong cách **full background**
* Sử dụng **ảnh + animation động**
* Áp dụng **blur + overlay hiện đại**
* Thiết kế lại:
  * Header
  * Top panel (title + progress + button)
* Responsive layout

---

#### 🎮 Gameplay

* Grid NxN động
* Click ô → câu hỏi → mở ảnh
* Liên kết dữ liệu câu hỏi với từng ô

---

#### 🖼️ Xử lý ảnh

* Dùng 1 ảnh nền duy nhất
* Ô chỉ là lớp overlay
* Fix:
  * Lệch ảnh
  * Khe hở grid

---

#### 🧱 Tile system

* Hover + click animation
* Fade + scale khi mở
* Gradient + bo góc

---

#### 📋 Modal câu hỏi

* Hiển thị câu hỏi + đáp án
* Highlight đáp án
* Animation mượt

---

#### 🧠 Giải mã ảnh

* Popup nhập đáp án
* Đúng → mở toàn bộ ảnh + kết thúc game

---

#### 📊 Progress bar

* Hiển thị % hoàn thành
* Update realtime

---

#### 🎉 Popup chiến thắng

* UI gradient + glow
* Animation xuất hiện
* Hiển thị đáp án

---

### 👤 SV2 – Hiệu ứng & UX

#### 🔔 Toast system

* success / error / warning / info
* Animation xuất hiện + biến mất
* Fix lỗi CSS

---

#### 🔊 Âm thanh

* Sound đúng / sai / win

---

#### 🎉 Hiệu ứng

* Confetti từ trung tâm
* Burst đa hướng
* Random màu + xoay

---

#### ⚡ Tối ưu

* Hover button
* Popup animation

---

### 👤 SV3 – Logic & Turn-based

#### 🧠 Dữ liệu

* Lấy game từ LocalStorage
* Truyền id qua URL

---

#### ⚙️ Logic

* Kiểm tra đáp án
* Mở ô
* Check win

---

#### 🎲 Turn-based

* Di chuyển theo tọa độ map (không zigzag)
* Nhân vật đi đúng đường

---

#### 🛠 Fix

* Auto focus input
* Auto scroll câu hỏi mới
* Fix bug UI + logic

---

## 🧱 Công nghệ sử dụng

### Frontend
* HTML5  
* CSS3  
* JavaScript  

### Backend
* Python (Flask)  
* SQLite  

---

## 📁 Cấu trúc project

```bash
EDUPLAY/
├── backend/
├── frontend/
│   ├── assets/
│   ├── css/
│   ├── games/
│   ├── js/
│   └── index.html