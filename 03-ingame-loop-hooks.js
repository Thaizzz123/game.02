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


// 3. Khởi tạo Phòng Mới (Quái / Boss / Câu hỏi)


// 4. Render câu hỏi lên UI


// 5. Xử lý khi người chơi chọn đáp án


// 6. Tính toán Điểm số dựa trên thời gian và Buff (Nguồn state duy nhất)


// 7. Tính toán Sát thương nhận vào (Nguồn state duy nhất)


// 8. Cập nhật mọi chỉ số lên Màn hình Game (Single source of truth for UI)


// CÁC HÀM HOOK DÀNH CHO PHẦN 5 SẼ ĐƯỢC GHI ĐÈ 
// (Tạo sẵn để tránh lỗi Undefined khi chạy Phần 4)
