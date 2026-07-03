// HỢP ĐỒNG TRÒ CHƠI v1 - GIAI ĐOẠN 28

(function() {
    // PHỤ THUỘC TRẠNG THÁI TRUNG TÂM:
    // playerState, characterDefs, equipmentDefs, applyBuffTick, deliverPurchasedItem

    // --- 1. SỬA ĐỔI CHỈ SỐ MÁU KHỞI ĐẦU VÀ CHÚ THÍCH NỘI TẠI CỦA BẢO VỆ THÀNH 2500 HP KỊCH TRẦN ---
    if (typeof characterDefs !== 'undefined' && characterDefs.guard) {
        characterDefs.guard.baseHp = 2500;
        characterDefs.guard.desc = 'Nội tại: Cộng thêm 1000 máu khởi đầu (Tổng 2500 HP).';
    }

    // Tái tạo lại lập tức giao diện chọn nhân vật tại sảnh chờ để cập nhật nội dung văn bản mới
    if (typeof renderCharacterSelectionUI === 'function') {
        renderCharacterSelectionUI();
    }


    // --- 2. HIỆU ỨNG TƯƠNG TÁC ĐẶC BIỆT KHI BẢO VỆ NHẬN ĐƯỢC TRÁI TIM BIỂN CẢ TỪ CLAN ---
    const oldDeliverPurchasedItem = window.deliverPurchasedItem;
    window.deliverPurchasedItem = function(itemId) {
        if (itemId === 'ocean_heart' && playerState.character === 'guard') {
            alert("🛡️ [LIÊN MINH BẢO VỆ]: Chúc mừng bạn nhận được trang bị trấn phái do clan của bạn, khả năng hồi phục của trang bị sẽ tăng lên!");
        }
        if (typeof oldDeliverPurchasedItem === 'function') {
            oldDeliverPurchasedItem(itemId);
        }
    };


    // --- 3. GHI ĐÈ TIẾN TRÌNH DUY TRÌ THEO VÒNG ĐỂ TĂNG 100% HIỆU LỰC HỒI MÁU (GẤP ĐÔI) CHO BẢO VỆ ---
    window.applyBuffTick = function() {
        if (playerState.gambleCooldown > 0) playerState.gambleCooldown--;

        // Khấu trừ số phòng duy trì của các trạng thái Buff tạm thời
        playerState.activeBuffs.forEach(buff => buff.roomsLeft--);
        let expiredBuffs = playerState.activeBuffs.filter(b => b.roomsLeft <= 0);
        playerState.activeBuffs = playerState.activeBuffs.filter(b => b.roomsLeft > 0);

        // Giải phóng cổ vật hết thời gian duy trì ra khỏi kho đồ
        expiredBuffs.forEach(expired => {
            let itemIndex = playerState.equipments.indexOf(expired.id);
            if (itemIndex !== -1) {
                playerState.equipments.splice(itemIndex, 1);
            }
        });

        // XỬ LÝ HỒI MÁU: Kiểm tra số lượng Trái Tim Biển Cả và nhân đôi hiệu quả hồi phục nếu là Bảo Vệ
        let oceanHeartCount = playerState.equipments.filter(id => id === 'ocean_heart').length;
        if (oceanHeartCount > 0) {
            let healMultiplier = (playerState.character === 'guard') ? 2 : 1; // Bảo vệ tăng 100% hiệu ứng (Hồi gấp đôi = 60 HP/phòng cho mỗi tim)
            playerState.hp += oceanHeartCount * 30 * healMultiplier;
        }

        if (typeof updateStatusBarUI === 'function') {
            updateStatusBarUI();
        }
    };


    // --- 4. GIÁM SÁT BIẾN ĐỘNG DOM GIAO DIỆN SỰ KIỆN: HIỆN THÔNG BÁO BÍ MẬT CLAN CHO CON BẠC ---
    const clanRewardObserver = new MutationObserver((mutations) => {
        let panel = document.getElementById('sub-event-content');
        // Kiểm tra xem màn hình phụ đã nạp thành công Máy Đánh Bạc Cổ Đại lên giao diện chưa
        if (panel && panel.innerText.includes('Máy Đánh Bạc Cổ Đại')) {
            if (playerState.character === 'gambler' && !panel._hasAlertedGamblerClanSecretEvent) {
                panel._hasAlertedGamblerClanSecretEvent = true; // Đánh dấu cờ chống lặp lại hộp thoại thông báo
                alert("🎰 [LIÊN MINH CON BẠC]: Chúc mừng bạn gặp được sự kiện bí mật nhờ vào clan của bạn, bạn có thể dùng kĩ năng để nhận nhiều quà hơn!");
            }
        }
    });

    // Định kỳ thiết lập neo cổng giám sát lên khung cấu trúc lớp phủ sự kiện Boss tối hậu
    setInterval(() => {
        let overlay = document.getElementById('boss-reward-overlay');
        if (overlay && !overlay._observedByPhase28) {
            overlay._observedByPhase28 = true;
            clanRewardObserver.observe(overlay, { childList: true, subtree: true });
        }
    }, 500);

})();
// ============================================ // 
