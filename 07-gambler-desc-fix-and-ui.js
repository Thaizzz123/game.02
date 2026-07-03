// HỢP ĐỒNG TRÒ CHƠI v1 - GIAI ĐOẠN 24

(function() {
    // PHỤ THUỘC TRẠNG THÁI TRUNG TÂM:
    // playerState, gameState, characterDefs, equipmentDefs, isCurrentRoomBoss, renderUIState, generateRoom

    // --- 1. SỬA CHỮ "KỸ NĂNG" THÀNH "NỘI TẠI" CHO NHÂN VẬT CON BẠC TRÊN KHUNG DỮ LIỆU ---
    if (typeof characterDefs !== 'undefined' && characterDefs.gambler) {
        characterDefs.gambler.desc = 'Nội tại: Đánh bạc trước khi thấy câu hỏi. Thắng x5 điểm, thua x5 sát thương phải chịu. Hồi chiêu: 5 phòng.';
    }
    
    // Ép cập nhật lại sảnh giao diện chọn nhân vật ngay lập tức
    if (typeof renderCharacterSelectionUI === 'function') {
        renderCharacterSelectionUI();
    }

    // --- 2. VÁ LỖI MẤT NÚT/HIỂN THỊ KĨ NĂNG CON BẠC Ở VÒNG ĐÁNH QUÁI THƯỜNG ---
    // Thiết lập một bộ điều phối chu kỳ quét UI dứt khoát hoàn chỉnh cho nút bấm Đánh bạc phòng thường
    setInterval(() => {
        let btnGamble = document.getElementById('btn-skill-gamble');
        if (btnGamble && gameState.status === 'PLAYING' && playerState.character === 'gambler') {
            // Nếu đang trong phòng Boss hoặc đang mở giao diện phần thưởng sự kiện, ẩn đi để tránh chồng chéo UI
            if (isCurrentRoomBoss || playerState.isChoosingReward) {
                btnGamble.classList.add('hidden');
                return;
            }
            
            btnGamble.classList.remove('hidden');
            
            // Xử lý đồng bộ 3 trạng thái hồi chiêu / đang kích hoạt / sẵn sàng sử dụng
            if (playerState.gambleCooldown > 0) {
                btnGamble.innerText = `🎲 Đánh Bạc (Hồi chiêu: ${playerState.gambleCooldown}/5 phòng)`;
                btnGamble.disabled = true;
                btnGamble.style.opacity = "0.6";
            } else if (playerState.isGambleActive) {
                btnGamble.innerText = "🔥 Đang Đánh Bạc (x5 Điểm / x5 Máu)";
                btnGamble.disabled = true;
                btnGamble.style.opacity = "1";
            } else {
                btnGamble.innerText = "🎲 Đánh Bạc (Nhấn trước khi chọn!)";
                btnGamble.disabled = false;
                btnGamble.style.opacity = "1";
            }
        } else if (btnGamble) {
            btnGamble.classList.add('hidden');
        }
    }, 200);

    // Tái cấu trúc cấu trúc gán sự kiện click gốc cho nút Đánh Bạc phòng thường để luôn an toàn và dứt khoát
    function patchStandardGambleAction() {
        let btnGamble = document.getElementById('btn-skill-gamble');
        if (btnGamble) {
            let newBtnGamble = btnGamble.cloneNode(true);
            btnGamble.parentNode.replaceChild(newBtnGamble, btnGamble);
            
            newBtnGamble.addEventListener('click', () => {
                if (playerState.gambleCooldown > 0 || playerState.isGambleActive) return;
                playerState.isGambleActive = true;
                playerState.gambleCooldown = 5; // Hồi chiêu 5 phòng chuẩn chỉ giai đoạn mới
            });
        }
    }
    patchStandardGambleAction();


    // --- 3. GHI ĐÈ HOÀN TOÀN HỆ THỐNG SỰ KIỆN BOSS ĐỂ ĐỒNG BỘ TOÀN DIỆN KĨ NĂNG CON BẠC TRONG MÁY ĐÁNH BẠC (THẮNG X10) ---

})();
// ============================================ // 
