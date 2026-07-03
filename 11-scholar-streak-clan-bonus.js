// HỢP ĐỒNG TRÒ CHƠI v1 - GIAI ĐOẠN 30

(function() {
    // PHỤ THUỘC TRẠNG THÁI TRUNG TÂM:
    // playerState, characterDefs, calculateScore, handleAnswer, updateComboStreakUI

    // --- 1. CẬP NHẬT MÔ TẢ NỘI TẠI NHÂN VẬT HỌC BÁ TẠI SẢNH CHỜ ---
    if (typeof characterDefs !== 'undefined' && characterDefs.scholar) {
        characterDefs.scholar.desc = 'Nội tại: Cuối game nếu lọt vào Top 10, toàn bộ điểm số được nhân đôi (x2). Clan hỗ trợ: Đạt Streak sẽ được NHÂN ĐÔI (x2) hiệu ứng điểm thưởng.';
    }

    // Làm mới giao diện sảnh chọn thân phận ngay lập tức
    if (typeof renderCharacterSelectionUI === 'function') {
        renderCharacterSelectionUI();
    }


    // --- 2. GHI ĐÈ TIẾN TRÌNH TÍNH ĐIỂM: NHÂN ĐÔI HIỆU ỨNG TRÊN MỖI TẦNG COMBO STREAK CHO HỌC BÁ ---
    const oldCalculateScore = window.calculateScore;


    // --- 3. THEO DÕI VÀ BẮN THÔNG BÁO ƯU ĐÃI CLAN KHI ĐẠT CÁC MỐC COMBO STREAK ---
    const oldHandleAnswer = window.handleAnswer;
    window.handleAnswer = function(selectedIndex) {
        let prevStreak = playerState.comboStreak || 0;
        
        if (typeof oldHandleAnswer === 'function') {
            oldHandleAnswer(selectedIndex);
        }
        
        let currentStreak = playerState.comboStreak || 0;
        // Kiểm tra điều kiện: Nếu là Học Bá và chuỗi đúng vừa tăng kịch trần chạm đúng các mốc cột mốc 3, 5, 10, 30
        if (playerState.character === 'scholar' && currentStreak > prevStreak) {
            if (currentStreak === 3 || currentStreak === 5 || currentStreak === 10 || currentStreak === 30) {
                alert("✨ [LIÊN MINH HỌC BÁ]: Chúc mừng bạn nhận được tăng cường hiệu ứng Streak do clan của bạn, hiệu quả của Streak sẽ được X2!");
            }
        }
    };


    // --- 4. CẬP NHẬT ĐỒNG BỘ HIỂN THỊ CHỈ SỐ PHẦN TRĂM STREAK X2 LÊN THANH TRẠNG THÁI TOP BAR UI ---
    // Kiểm tra định kỳ và cập nhật nhãn hiển thị trực quan cho Học Bá
    setInterval(() => {
        if (typeof gameState !== 'undefined' && gameState.status === 'PLAYING' && playerState.character === 'scholar') {
            let comboContainer = document.getElementById('ui-combo-streak-display');
            let currentStreak = playerState.comboStreak || 0;
            
            if (comboContainer && currentStreak >= 3) {
                let doubledBonusText = "20%";
                if (currentStreak >= 30) doubledBonusText = "200%";
                else if (currentStreak >= 10) doubledBonusText = "100%";
                else if (currentStreak >= 5) doubledBonusText = "40%";
                
                comboContainer.innerHTML = `🔥 Streak: ${currentStreak} (+${doubledBonusText} Pts) [Clan Buff]`;
            }
        }
    }, 250);

})();
// ============================================ // 
