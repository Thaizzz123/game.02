// ─── CORE PATCH (FIX ADMIN, SHUFFLE & PLAYER NAME) ───

// --- 1. TIÊM KHUNG NHẬP TÊN VÀO GIAO DIỆN CHỌN NHÂN VẬT ---
const nameInputHtml = `
    <div id="player-name-container" style="margin-bottom: 20px;">
        <h3 style="color: var(--text-color); margin-bottom: 8px;">Tên Hiển Thị Của Bạn:</h3>
        <input type="text" id="player-display-name" placeholder="Nhập tên chiến binh..." style="width: 100%; padding: 12px; background: #0f172a; color: #fff; border: 1px solid #334155; border-radius: var(--border-radius); box-sizing: border-box; font-size: 16px;">
    </div>
`;
const charSelectionContainer = document.getElementById('character-selection');
if (charSelectionContainer && !document.getElementById('player-display-name')) {
    charSelectionContainer.previousElementSibling.insertAdjacentHTML('beforebegin', nameInputHtml);
}

// --- 2. SỬA LỖI KHÔNG CHECK CÂU HỎI TRỐNG KHI CHỌN NHÂN VẬT ---
window.renderCharacterSelectionUI = function() {
    const container = document.getElementById('character-selection');
    container.innerHTML = '';
    // Luôn đưa "Random" xuống hàng cuối cùng, bất kể sau này thêm bao nhiêu nhân vật mới
    const orderedChars = Object.values(characterDefs).sort((a, b) => {
        if (a.id === 'random') return 1;
        if (b.id === 'random') return -1;
        return 0;
    });
    orderedChars.forEach(char => {
        let btn = document.createElement('button');
        btn.classList.add('clearfix');
        btn.style.width = '100%';
        btn.style.textAlign = 'left';
        btn.style.marginBottom = '10px';
        btn.style.border = '1px solid var(--text-color)';
        
        btn.innerHTML = `
            <img src="${char.img}" class="char-img-select">
            <div style="padding-top: 5px;">
                <strong>${char.name}</strong><br>
                <span style="font-size:12px; font-weight:normal;">${char.desc}</span>
            </div>
        `;
        
        btn.addEventListener('click', () => {
            Array.from(container.children).forEach(b => b.style.backgroundColor = 'var(--btn-primary)');
            btn.style.backgroundColor = 'var(--btn-hover)';
            playerState.character = char.id;
            // Đã loại bỏ hoàn toàn cảnh báo lỗi chặn người chơi, cho chọn nhân vật ngay lập tức
        });
        container.appendChild(btn);
    });
};
renderCharacterSelectionUI(); // Chạy lại để áp dụng luôn thay đổi

// --- 3. ĐƠN GIẢN HÓA BỘ PHÂN TÍCH CÂU HỎI ADMIN (MẶC ĐỊNH ĐÁP ÁN A, KHÔNG CẦN DÒNG ĐÁP ÁN) ---
window.parseAdminQuestions = function(rawText) {
    let questions = [];
    let blocks = rawText.split(/Câu\s+\d+[:.]/i).filter(b => b.trim().length > 0);
    
    blocks.forEach((block, index) => {
        let qTextMatch = block.match(/(.*?)(?=A\.)/is);
        let aMatch = block.match(/A\.\s*(.*?)(?=B\.)/is);
        let bMatch = block.match(/B\.\s*(.*?)(?=C\.)/is);
        let cMatch = block.match(/C\.\s*(.*?)(?=D\.)/is);
        // Tách phương án D đến hết block hoặc đến câu tiếp theo, bỏ qua ràng buộc cụm từ "Đáp án:"
        let dMatch = block.match(/D\.\s*(.*?)(?=(?:Câu\s+\d+[:.]|$))/is);
        
        if(qTextMatch && aMatch && bMatch && cMatch && dMatch) {
            questions.push({
                id: 'q_' + Date.now() + '_' + index,
                content: qTextMatch[1].trim(),
                options: [
                    aMatch[1].trim(), 
                    bMatch[1].trim(), 
                    cMatch[1].trim(), 
                    dMatch[1].trim()
                ],
                correctIndex: 0 // Mặc định đáp án đầu tiên (A) luôn luôn là đáp án đúng gốc
            });
        }
    });
    return questions;
};

// --- 4. SỬA LỖI NÚT "LƯU VÀO GAME" BỊ KHÓA DO LỆCH STATE BIẾN DOM Ở PHẦN TRƯỚC ---
const btnValidatePatch = document.getElementById('btn-admin-validate');
const btnImportPatch = document.getElementById('btn-admin-import');

const newValidateNode = btnValidatePatch.cloneNode(true);
const newImportNode = btnImportPatch.cloneNode(true);
btnValidatePatch.parentNode.replaceChild(newValidateNode, btnValidatePatch);
btnImportPatch.parentNode.replaceChild(newImportNode, btnImportPatch);

newValidateNode.addEventListener('click', () => {
    let rawText = document.getElementById('admin-textarea').value;
    if (!rawText.trim()) {
        document.getElementById('admin-log').innerText = "Lỗi: Khung nhập liệu đang trống!";
        document.getElementById('admin-log').style.color = "var(--btn-danger)";
        newImportNode.disabled = true;
        return;
    }

    let parsed = parseAdminQuestions(rawText);
    if (parsed.length > 0) {
        adminState.tempQuestions = parsed;
        document.getElementById('admin-log').innerText = `Thành công: Đã nhận diện ${parsed.length} câu hỏi. (Hệ thống tự nhận phương án A là đáp án Đúng)`;
        document.getElementById('admin-log').style.color = "#10b981";
        newImportNode.disabled = false; // Kích hoạt chuẩn xác node đang hiển thị trên DOM
    } else {
        document.getElementById('admin-log').innerText = "Lỗi: Không nhận diện được cấu trúc câu hỏi dạng A. B. C. D.";
        document.getElementById('admin-log').style.color = "var(--btn-danger)";
        newImportNode.disabled = true;
    }
});

newImportNode.addEventListener('click', () => {
    questionBank = [...adminState.tempQuestions];
    document.getElementById('admin-textarea').value = "";
    document.getElementById('admin-log').innerText = "Chưa có dữ liệu.";
    newImportNode.disabled = true;
    // Gọi cơ chế tự động tạo phòng quan sát của Admin từ Phase trước
    if (typeof hostCreateRoomAsObserver === 'function') {
        hostCreateRoomAsObserver();
    }
});

// --- 5. CƠ CHẾ XÁO TRỘN ĐÁP ÁN (A, B, C, D) VÀ CÂU HỎI KHI HIỂN THỊ TRONG PHÒNG ---
let currentRoomCorrectIndex = 0; // Lưu vị trí thực tế của đáp án đúng sau khi đảo

window.renderQuestion = function(q) {
    document.getElementById('ui-question-text').innerText = q.content;
    
    // Tạo cấu trúc map để theo dõi thuộc tính đúng/sai gốc của từng phương án
    let mappedOptions = q.options.map((opt, idx) => ({
        text: opt,
        isCorrect: idx === q.correctIndex
    }));
    
    // Thực hiện xáo trộn ngẫu nhiên thứ tự các phương án hiển thị
    mappedOptions.sort(() => Math.random() - 0.5);
    
    // Cập nhật lại vị trí mới của đáp án đúng trong phòng này
    currentRoomCorrectIndex = mappedOptions.findIndex(o => o.isCorrect);
    
    // Nội tại "Gã Khờ": Loại trừ 1 đáp án sai ngẫu nhiên
    let hiddenIndex = -1;
    if (playerState.character === 'fool') {
        let wrongIndices = [];
        mappedOptions.forEach((o, idx) => {
            if (!o.isCorrect) wrongIndices.push(idx);
        });
        hiddenIndex = wrongIndices[Math.floor(Math.random() * wrongIndices.length)];
    }

    for (let i = 0; i < 4; i++) {
        let btn = document.getElementById(`btn-opt-${i}`);
        btn.innerText = String.fromCharCode(65 + i) + ". " + mappedOptions[i].text;
        btn.disabled = false;
        btn.style.opacity = 1;
        btn.style.backgroundColor = '#1e293b';
        
        if (i === hiddenIndex) {
            btn.disabled = true;
            btn.style.opacity = 0.3;
            btn.innerText = "[Gã Khờ đã loại trừ]";
        }

        btn.onclick = () => handleAnswer(i);
    }
};

// --- 6. GHI ĐỀ HÀM XỬ LÝ ĐÁP ÁN THEO VỊ TRÍ MỚI ĐÃ XÁO TRỘN ---
window.handleAnswer = function(selectedIndex) {
    let timeTaken = (Date.now() - roomStartTime) / 1500;
    // So khớp dựa trên chỉ mục đã được đảo ngẫu nhiên thay vì chỉ mục tĩnh ban đầu
    let isCorrect = (selectedIndex === currentRoomCorrectIndex);

    if (isCorrect) {
        playerState.failedQuestions = playerState.failedQuestions.filter(q => q.id !== activeQuestion.id);
        let earnedPoints = calculateScore(timeTaken);
        playerState.score += earnedPoints;
        if (isCurrentRoomBoss) handleBossDefeat(); 
    } else {
        if (!playerState.failedQuestions.find(q => q.id === activeQuestion.id)) {
            playerState.failedQuestions.push(activeQuestion);
        }
        let damage = calculateDamage(isCurrentRoomBoss);
        playerState.hp -= damage;
        if (playerState.character === 'madman') {
            playerState.hp -= 1500; 
        }
    }

    applyBuffTick(); 
    playerState.roomCount++;
    playerState.isGambleActive = false; 

    // Tái tích hợp hiệu ứng rung màn hình từ Phase trước khi làm sai
    if (!isCorrect) {
        let appDom = document.getElementById('game-center');
        if (appDom) {
            appDom.classList.add('shake-anim');
            setTimeout(() => appDom.classList.remove('shake-anim'), 300);
        }
    }

    if (playerState.hp <= 0) {
        endGame();
    } else {
        generateRoom();
    }
};

// --- 7. ĐỒNG BỘ TÊN NGƯỜI CHƠI QUA HỆ THỐNG PHÒNG MULTIPLAYER P2P ---
