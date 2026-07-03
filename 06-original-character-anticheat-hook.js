// HỢP ĐỒNG TRÒ CHƠI v1 - GIAI ĐOẠN 21

(function() {
    // PHỤ THUỘC TRẠNG THÁI TRUNG TÂM:
    // playerState, gameState, equipmentDefs, isCurrentRoomBoss, renderUIState, generateRoom, deliverPurchasedItem

    // --- 1. HOOK GHI NHẬN THÂN PHẬN KHỞI ĐẦU CHÍNH XÁC (CHỐNG GIAN LẬN HỆ RANDOM) ---
    const oldInitRealPlayerState = window.initRealPlayerState;
    window.initRealPlayerState = function() {
        if (typeof playerState !== 'undefined') {
            // Lưu lại chính xác lựa chọn ban đầu của người chơi trước khi hệ thống Random ghi đè dữ liệu
            playerState.originalSelectedCharacter = playerState.character;
        }
        if (typeof oldInitRealPlayerState === 'function') {
            oldInitRealPlayerState();
        }
    };

    // --- 2. CẬP NHẬT ĐIỀU KIỆN KÍCH HOẠT CƠ CHẾ ẨN CHO MÁY ĐÁNH BẠC PHÒNG BOSS ---

})();
// ============================================ // 
