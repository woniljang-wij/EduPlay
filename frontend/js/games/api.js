// =========================================
// api.js — Gemini AI Integration
// Dùng chung cho: turnbased, dragonboat, quizfruit, memory
// =========================================

const GEMINI_API_KEY = "AIzaSyC0Cn0-EQBcTX0qCn3LMYDpOmz4hUTgFYw";
// ⚠ Key frontend không an toàn — sau này nên chuyển qua backend proxy.

const GEMINI_MODEL = "gemini-3-flash-preview";

// =========================================
// MODAL CONTROLS
// Các hàm này override hàm trùng tên ở file game.js
// (khai báo sau sẽ ghi đè — chỉ dùng khi cả hai file cùng tồn tại)
// =========================================

function openAIModal() {
  const modal   = document.getElementById("aiModal");
  const content = document.getElementById("aiModalContent");
  if (!modal || !content) return;

  modal.classList.remove("hidden");
  modal.classList.add("flex");

  setTimeout(() => {
    content.classList.remove("scale-95", "opacity-0");
    content.classList.add("scale-100", "opacity-100");
  }, 10);
}

function closeAIModal() {
  const modal   = document.getElementById("aiModal");
  const content = document.getElementById("aiModalContent");
  if (!modal || !content) return;

  content.classList.remove("scale-100", "opacity-100");
  content.classList.add("scale-95", "opacity-0");

  setTimeout(() => {
    modal.classList.add("hidden");
    modal.classList.remove("flex");
  }, 200);
}

// =========================================
// TAB SWITCH — text / file
// =========================================

function toggleSource(type) {
  const textArea = document.getElementById("aiSourceText");
  const fileArea = document.getElementById("aiSourceFile");
  const tabText  = document.getElementById("tabText");
  const tabFile  = document.getElementById("tabFile");

  if (!textArea || !fileArea || !tabText || !tabFile) return;

  if (type === "text") {
    textArea.classList.remove("hidden");
    fileArea.classList.add("hidden");
    tabText.classList.add("bg-white", "shadow-sm");
    tabFile.classList.remove("bg-white", "shadow-sm");
  } else {
    textArea.classList.add("hidden");
    fileArea.classList.remove("hidden");
    tabFile.classList.add("bg-white", "shadow-sm");
    tabText.classList.remove("bg-white", "shadow-sm");
  }
}

// Hiển thị tên file khi người dùng chọn
document.addEventListener("DOMContentLoaded", () => {
  document.getElementById("aiFileInput")?.addEventListener("change", function (e) {
    const fileName = e.target.files[0]?.name;
    const label = this.closest("label") || this.nextElementSibling;
    const p = label?.querySelector?.("p.text-purple-600");
    if (fileName && p) p.innerText = "Đã chọn: " + fileName;
  });
});

// =========================================
// LOADING STATE
// =========================================

function toggleAILoading(isLoading) {
  const content = document.getElementById("aiModalContent");
  const loading  = document.getElementById("aiLoading");
  if (!content || !loading) return;

  if (isLoading) {
    content.classList.add("hidden");
    loading.classList.remove("hidden");
  } else {
    content.classList.remove("hidden");
    loading.classList.add("hidden");
  }
}

// =========================================
// DETECT GAME — dựa trên hàm tồn tại trong file game.js
// =========================================

function detectGameType() {
  if (typeof saveDraft === "function")         return "turnbased";  // chỉ turnbased có saveDraft
  if (typeof renderMemoryGames === "function") return "memory";
  if (typeof renderGames === "function" && typeof selectedSpeed !== "undefined") return "quizfruit";
  return "dragonboat";
}

// =========================================
// BUILD PROMPT — tạo prompt gửi Gemini
// =========================================

function buildPrompt({ subject, grade, quantity, bloom, sourceText }) {
  const bloomMap = {
    NB:  "Nhận biết (Remember)",
    TH:  "Thông hiểu (Understand)",
    VD:  "Vận dụng (Apply)",
    VDC: "Vận dụng cao (Analyze/Evaluate)",
  };

  const bloomLabels = bloom.length
    ? bloom.map((b) => bloomMap[b] || b).join(", ")
    : "Nhận biết, Thông hiểu";

  return `Bạn là chuyên gia soạn thảo câu hỏi trắc nghiệm theo chuẩn GDPT 2018.

Hãy tạo CHÍNH XÁC ${quantity} câu hỏi trắc nghiệm 4 đáp án:
- Môn học: ${subject}
- Lớp: ${grade}
- Mức độ Bloom: ${bloomLabels}
- Dựa vào nội dung sau:

"""
${sourceText || "Tạo câu hỏi tổng quát về môn học."}
"""

YÊU CẦU BẮT BUỘC:
1. Chỉ trả về một JSON array thuần túy.
2. Không có markdown, không có text, không có giải thích ngoài JSON.
3. Mỗi phần tử có đúng các key: "question", "answers", "correct".
4. "answers" là array 4 string.
5. "correct" là số 0, 1, 2 hoặc 3 (index của đáp án đúng trong "answers").

Format chính xác (không thêm bất kỳ thứ gì khác):
[
  {
    "question": "Nội dung câu hỏi?",
    "answers": ["Đáp án A", "Đáp án B", "Đáp án C", "Đáp án D"],
    "correct": 0
  }
]`;
}

// =========================================
// PARSE GEMINI RESPONSE
// =========================================

function parseGeminiResponse(text) {
  try {
    // Xóa markdown code fences nếu có
    const cleaned = text
      .replace(/```json\s*/gi, "")
      .replace(/```\s*/g, "")
      .trim();

    // Lấy đúng đoạn JSON array
    const start = cleaned.indexOf("[");
    const end   = cleaned.lastIndexOf("]");

    if (start === -1 || end === -1 || end <= start) return [];

    return JSON.parse(cleaned.slice(start, end + 1));
  } catch (err) {
    console.error("[API] JSON parse error:", err);
    return [];
  }
}

// =========================================
// RENDER QUESTIONS — theo style của turnbased
// Dùng chung cho mọi game (ghi vào #questionPreview hoặc #questionList)
// =========================================

function renderAIQuestions() {
  const gameType = detectGameType();

  // turnbased và dragonboat dùng #questionPreview
  // quizfruit và memory cũng có thể có #questionPreview (sau khi update HTML)
  // Nếu không có renderQuestionPreview thì gọi renderQuestions (quizfruit fallback)
  if (typeof renderQuestionPreview === "function") {
    renderQuestionPreview();
  } else if (typeof renderQuestions === "function") {
    renderQuestions();
  }

  // Cập nhật count
  if (typeof updateQuestionCount === "function") updateQuestionCount();
}

// =========================================
// GENERATE — hàm chính gọi Gemini API
// =========================================

async function handleGenerateAI() {
  try {
    // ===== 1. THU THẬP DỮ LIỆU =====
    const subject    = document.getElementById("aiSubject")?.value?.trim()  || "";
    const grade      = document.getElementById("aiGrade")?.value?.trim()    || "Lớp 12";
    const quantity   = parseInt(document.getElementById("aiQuantity")?.value) || 5;
    const bloom      = Array.from(document.querySelectorAll(".bloom-lvl:checked")).map((cb) => cb.value);
    const sourceText = document.getElementById("aiSourceText")?.value?.trim() || "";
    const fileInput  = document.getElementById("aiFileInput");
    const hasFile    = fileInput?.files?.length > 0;

    // ===== VALIDATE =====
    if (!subject) {
      showToast("⚠️ Vui lòng nhập môn học!", "error");
      return;
    }
    if (!sourceText && !hasFile) {
      showToast("⚠️ Vui lòng nhập nội dung tài liệu!", "error");
      return;
    }
    if (quantity < 1 || quantity > 50) {
      showToast("⚠️ Số câu hỏi phải từ 1 đến 50!", "error");
      return;
    }

    // ===== 2. LOADING ON =====
    toggleAILoading(true);

    // ===== 3. BUILD PROMPT =====
    const prompt = buildPrompt({ subject, grade, quantity, bloom, sourceText });

    // ===== 4. CALL GEMINI API =====
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature:      0.7,
            topP:             0.95,
            topK:             40,
            maxOutputTokens:  8192,
          },
        }),
      }
    );

    // ===== HTTP ERROR =====
    if (!response.ok) {
      const errText = await response.text();
      console.error("[API] HTTP error:", response.status, errText);

      if (response.status === 429) showToast("❌ Gemini đã hết quota! Thử lại sau.", "error");
      else if (response.status === 400) showToast("❌ Yêu cầu không hợp lệ!", "error");
      else showToast(`❌ Lỗi API (${response.status})`, "error");
      return;
    }

    const data = await response.json();
    console.log("[API] Gemini response:", data);

    // ===== 5. EXTRACT TEXT =====
    const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    if (!rawText) {
      showToast("❌ AI không trả về nội dung!", "error");
      return;
    }

    // ===== 6. PARSE JSON =====
    const parsed = parseGeminiResponse(rawText);

    if (!Array.isArray(parsed) || parsed.length === 0) {
      console.error("[API] Parsed result invalid:", rawText);
      showToast("❌ AI trả về dữ liệu không đúng định dạng!", "error");
      return;
    }

    // ===== 7. FORMAT — chuẩn hoá về object game dùng được =====
    // Đọc thời gian toàn cục (chỉ turnbased có #gameTime)
    const gameTimeEl = document.getElementById("gameTime");
    const globalTime = gameTimeEl ? (parseInt(gameTimeEl.value) || 30) : null;

    const formatted = parsed.map((q) => {
      const obj = {
        question: (q.question || "").trim(),
        answers: [
          (q.answers?.[0] || "").trim(),
          (q.answers?.[1] || "").trim(),
          (q.answers?.[2] || "").trim(),
          (q.answers?.[3] || "").trim(),
        ],
        correct: Number(q.correct) ?? 0,
      };

      // Chỉ thêm time nếu game là turnbased
      obj.time = globalTime || 30;

      return obj;
    });

    // ===== 8. PUSH VÀO tempQuestions =====
    // tempQuestions là biến global của từng file game.js
    if (typeof tempQuestions === "undefined") {
      console.error("[API] tempQuestions không tồn tại!");
      showToast("❌ Lỗi nội bộ!", "error");
      return;
    }

    tempQuestions.push(...formatted);

    // ===== 9. SAVE DRAFT (chỉ turnbased) =====
    if (typeof saveDraft === "function") saveDraft();

    // ===== 10. RENDER UI =====
    renderAIQuestions();

    // Nếu modal questionManager đang mở → refresh lại
    const qManager = document.getElementById("questionManager");
    if (qManager && !qManager.classList.contains("hidden")) {
      if (typeof reopenQuestionManager === "function") reopenQuestionManager();
      else if (typeof openQuestionManager === "function") openQuestionManager();
    }

    // ===== 11. DONE =====
    closeAIModal();
    showToast(`🤖 AI đã tạo ${formatted.length} câu hỏi thành công!`, "success");

  } catch (err) {
    console.error("[API] Unexpected error:", err);
    if (err?.message?.includes("Failed to fetch")) {
      showToast("❌ Không thể kết nối đến Gemini!", "error");
    } else {
      showToast("❌ Có lỗi xảy ra khi gọi AI!", "error");
    }
  } finally {
    // ===== LOADING OFF (luôn chạy) =====
    toggleAILoading(false);
  }
}