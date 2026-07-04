// ─── IN-GAME CORE ───

let gameInterval;
let roomStartTime;
let activeQuestion = null;
let isCurrentRoomBoss = false;

// 1. Hàm bắt đầu vòng lặp game
function startGameLoop() {
    renderUIState();
    
    // Bộ đếm thời gian tổng (6 phút)
    gameInterval = setInterval(() => {
        gameState.timer--;
        
        // Mô phỏng các Bot đang chơi (tăng điểm và số phòng ngẫu nhiên)
        simulateBots();

        renderUIState(); // Cập nhật UI timer liên tục

        if (gameState.timer <= 0 || playerState.hp <= 0) {
            endGame();
        }
    }, 1500);

    generateRoom();
}

// 2. Mô phỏng Bot ảo
function simulateBots() {
    if (!gameState.bots || gameState.bots.length === 0) return;

    gameState.bots.forEach(b => {
        // Bot đã chết rồi thì đóng băng vĩnh viễn — không được tăng thêm điểm/số phòng nữa
        // (cùng nguyên tắc chống-tăng-điểm-ảo-sau-khi-chết đã áp dụng cho SYNC_STATE của người chơi thật)
        if ((b.hp || 0) <= 0) {
            b.hp = 0;
            return;
        }

        // Mỗi tick (1.5s), bot có ~55% cơ hội "qua phòng" tiếp theo
        if (Math.random() < 0.55) {
            b.roomCount = (b.roomCount || 1) + 1;

            // ~78% xác suất trả lời đúng => cộng điểm, ngược lại mất máu
            let isCorrect = Math.random() < 0.78;
            if (isCorrect) {
                b.score = (b.score || 0) + (80 + Math.floor(Math.random() * 60)); // +80 → +140 điểm
            } else {
                let dmg = 60 + Math.floor(Math.random() * 60); // -60 → -120 máu
                b.hp = Math.max(0, (b.hp || 0) - dmg);
                if (b.hp <= 0) b.isDead = true;
            }
        }
    });
}


// 3. Khởi tạo Phòng Mới (Quái / Boss / Câu hỏi)


// 4. Render câu hỏi lên UI


// 5. Xử lý khi người chơi chọn đáp án


// 6. Tính toán Điểm số dựa trên thời gian và Buff (Nguồn state duy nhất)


// 7. Tính toán Sát thương nhận vào (Nguồn state duy nhất)


// 8. Cập nhật mọi chỉ số lên Màn hình Game (Single source of truth for UI)


// CÁC HÀM HOOK DÀNH CHO PHẦN 5 SẼ ĐƯỢC GHI ĐÈ 
// (Tạo sẵn để tránh lỗi Undefined khi chạy Phần 4)
