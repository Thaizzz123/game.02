// HỢP ĐỒNG TRÒ CHƠI v1 - GIAI ĐOẠN 23

(function() {
    // PHỤ THUỘC TRẠNG THÁI TRUNG TÂM:
    // playerState, gameState, equipmentDefs, isCurrentRoomBoss, renderUIState, generateRoom, deliverPurchasedItem

    // --- 1. CẬP NHẬT GIỚI THIỆU NHÂN VẬT CON BẠC (GAMBLER) ---
    if (typeof characterDefs !== 'undefined' && characterDefs.gambler) {
        characterDefs.gambler.desc = 'Kỹ năng: Đánh bạc trước khi thấy câu hỏi. Thắng x5 điểm, thua x5 sát thương phải chịu. Hồi chiêu: 5 phòng.';
    }
    if (typeof renderCharacterSelectionUI === 'function') {
        renderCharacterSelectionUI();
    }

    // --- 2. GHI ĐÈ BỘ TÍNH TOÁN ĐIỂM SỐ & SÁT THƯƠNG THEO MỐC MULTIPLIER X5 MỚI ---

    window.calculateDamage = function(isBoss) {
        let baseDamage = isBoss ? 300 : 100;
        
        let passiveMultiplier = 1;
        // ĐIỀU CHỈNH: Kĩ năng Con Bạc câu hỏi thường thua gánh nhân 5 (x5) lần sát thương phải chịu
        if (playerState.character === 'gambler' && playerState.isGambleActive) passiveMultiplier *= 5;
        
        let equipmentDebuffPercent = typeof getEquipmentBuffSum === 'function' ? getEquipmentBuffSum('damage') : 0;
        
        let finalDamage = baseDamage * passiveMultiplier * (1 + (equipmentDebuffPercent / 100));
        return Math.floor(finalDamage);
    };

    // --- 3. VÁ LẠI NÚT KÍCH HOẠT KĨ NĂNG PHÒNG THƯỜNG (HỒI CHIÊU 5 VÒNG) ---
    function patchStandardGambleButton() {
        let btnGamble = document.getElementById('btn-skill-gamble');
        if (btnGamble) {
            let newBtnGamble = btnGamble.cloneNode(true);
            btnGamble.parentNode.replaceChild(newBtnGamble, btnGamble);
            
            newBtnGamble.addEventListener('click', () => {
                if (playerState.gambleCooldown > 0 || playerState.isGambleActive) return;
                
                playerState.isGambleActive = true;
                playerState.gambleCooldown = 5; // ĐIỀU CHỈNH: Hồi chiêu tăng lên thành 5 phòng
                newBtnGamble.innerText = "🔥 Đang Đánh Bạc (x5 Điểm / x5 Máu)";
                newBtnGamble.disabled = true;
            });
        }
    }
    patchStandardGambleButton();

    // Vòng quét liên tục để đồng bộ hóa văn bản hiển thị hồi chiêu 5 phòng của Phase 5 ngoài trận đấu
    setInterval(() => {
        let btnGamble = document.getElementById('btn-skill-gamble');
        if (btnGamble && gameState.status === 'PLAYING' && playerState.character === 'gambler') {
            if (playerState.gambleCooldown > 0) {
                btnGamble.innerText = `🎲 Đánh Bạc (Hồi chiêu: ${playerState.gambleCooldown}/5)`;
            }
        }
    }, 200);


    // --- 4. GHI ĐÈ TOÀN DIỆN MÁY ĐÁNH BẠC PHÒNG BOSS (KĨ NĂNG THẮNG NHÂN X10 ĐIỂM, HỒI CHIÊU 5 PHÒNG) ---

})();
// ============================================ // 
