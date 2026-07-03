// HỢP ĐỒNG TRÒ CHƠI v1 - GIAI ĐOẠN 33

(function() {
    // PHỤ THUỘC TRẠNG THÁI TRUNG TÂM:
    // playerState, characterDefs, renderCharacterSelectionUI, updateStatusBarUI

    // --- 1. XÓA BỎ CHÚ THÍCH PHẦN CLAN HỖ TRỢ CỦA HỌC BÁ TẠI GIAO DIỆN SẢNH CHỌN THÂN PHẬN ---
    if (typeof characterDefs !== 'undefined' && characterDefs.scholar) {
        // Trả mô tả về nguyên bản nội tại cốt lõi, loại bỏ hoàn toàn các dòng chữ giới thiệu clan hỗ trợ công khai
        characterDefs.scholar.desc = 'Nội tại: Cuối game nếu lọt vào Top 10 người đứng đầu, toàn bộ số điểm đang có sẽ được nhân đôi (x2).';
    }

    // Cập nhật lại giao diện chọn nhân vật ngay lập tức để làm sạch văn bản hiển thị
    if (typeof renderCharacterSelectionUI === 'function') {
        renderCharacterSelectionUI();
    }


    // --- 2. TÁI CẤU TRÚC PHẢN XẠ NỘI TẠI CỘNG DỒN CHO CẦN CÂU CÁ (1 CẦN CÂU = ĐÚNG 3 PHÒNG BOSS) ---
    // Khởi tạo bộ đếm số phòng Boss đã tiêu hao của Cần Câu Cá hiện tại
    if (typeof playerState !== 'undefined' && !playerState.hasOwnProperty('_fishingRodRoomsSpent')) {
        playerState._fishingRodRoomsSpent = 0;
    }

    // Xóa bỏ thuộc tính thô cũ để thiết lập cơ chế chặn bắt Getter/Setter phản xạ (Reactive Proxy Data)
    if (typeof playerState !== 'undefined') {
        delete playerState.bossRoomsRemaining;

        Object.defineProperty(playerState, 'bossRoomsRemaining', {
            get: function() {
                // Đếm số lượng cần câu cá thực tế đang sở hữu trong kho đồ để tính tổng mốc phòng Boss tích lũy
                let rodCount = (playerState.equipments || []).filter(id => id === 'fishing_rod').length;
                return Math.max(0, (rodCount * 3) - (playerState._fishingRodRoomsSpent || 0));
            },
            set: function(newValue) {
                let rodCount = (playerState.equipments || []).filter(id => id === 'fishing_rod').length;
                let oldValue = Math.max(0, (rodCount * 3) - (playerState._fishingRodRoomsSpent || 0));
                
                // Trường hợp mã lõi game thực hiện trừ phòng (ví dụ: playerState.bossRoomsRemaining--) khi qua phòng Boss
                if (newValue < oldValue) {
                    playerState._fishingRodRoomsSpent++;
                    
                    // Nếu đã sử dụng hết chu kỳ đúng 3 phòng Boss, tiến hành tiêu hao phá hủy chính xác 1 chiếc cần câu
                    if (playerState._fishingRodRoomsSpent >= 3) {
                        playerState._fishingRodRoomsSpent = 0;
                        if (playerState.equipments) {
                            let idx = playerState.equipments.indexOf('fishing_rod');
                            if (idx !== -1) {
                                playerState.equipments.splice(idx, 1);
                                console.log("[Cần Câu Cá] Đã tiêu hao hoàn toàn 1 chiếc cần câu sau khi sài hết 3 phòng Boss.");
                            }
                        }
                    }
                    
                    // Đồng bộ làm mới lại thanh hiển thị kho đồ ngay lập tức
                    if (typeof window.updateStatusBarUI === 'function') {
                        window.updateStatusBarUI();
                    }
                }
                // Nếu newValue >= oldValue (các hàm từ giai đoạn trước cộng điểm hoặc cộng phòng thô), 
                // hệ thống sẽ tự động bỏ qua để ưu tiên tính toán trực tiếp dựa vào số lượng Cần câu có trong mảng equipments.
            },
            configurable: true,
            enumerable: true
        });
    }

})();
// ============================================ // 
