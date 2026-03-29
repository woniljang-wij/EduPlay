const inputs = document.querySelectorAll('.code-box');
const joinBtn = document.getElementById('joinBtn');

inputs[0].focus();

inputs.forEach((input, index) => {

    input.addEventListener('input', (e) => {
        let value = e.target.value;

        // ✅ CHỈ GIỮ 1 KÝ TỰ
        value = value.slice(-1);
        e.target.value = value;

        if (value && index < inputs.length - 1) {
            inputs[index + 1].focus();
        }

        checkComplete();
    });

    input.addEventListener('keydown', (e) => {
        if (e.key === 'Backspace' && !e.target.value && index > 0) {
            inputs[index - 1].focus();
        }
    });

});

// check đủ code
function checkComplete() {
    const code = Array.from(inputs).map(i => i.value).join('');

    if (code.length === inputs.length) {
        joinBtn.disabled = false;
        joinBtn.innerText = "🚀 BẮT ĐẦU CHƠI";
    } else {
        joinBtn.disabled = true;
        joinBtn.innerText = "SẴN SÀNG CHƯA?";
    }
}