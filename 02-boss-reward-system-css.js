// HỢP ĐỒNG TRÒ CHƠI v1 - GIAI ĐOẠN 17

(function() {
    // PHỤ THUỘC TRẠNG THÁI TRUNG TÂM:
    // playerState, gameState, equipmentDefs, isCurrentRoomBoss, renderUIState, generateRoom (Global variables)

    // --- 1. TIÊM CSS CHO GIAO DIỆN PHÒNG PHẦN THƯỞNG BOSS VÀ ĐỒ HỌA SỰ KIỆN ---
    const rewardSystemStyles = `
        <style>
            /* Lớp phủ sự kiện Boss tối hậu choáng ngợp */
            #boss-reward-overlay {
                position: absolute;
                top: 0; left: 0; width: 100%; height: 100%;
                background: rgba(15, 23, 42, 0.98);
                z-index: 1000;
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                padding: 30px;
                box-sizing: border-box;
                color: var(--text-light);
                font-family: 'Segoe UI', sans-serif;
            }
            .reward-title {
                color: #fbbf24;
                text-shadow: 0 0 15px rgba(251, 191, 36, 0.6);
                font-size: 26px;
                margin-bottom: 5px;
                text-transform: uppercase;
                letter-spacing: 2px;
            }
            .reward-subtitle {
                color: #94a3b8;
                font-size: 14px;
                margin-bottom: 30px;
            }
            .choices-container {
                display: flex;
                gap: 20px;
                width: 100%;
                max-width: 600px;
            }
            .choice-card {
                flex: 1;
                background: #1e293b;
                border: 2px solid #334155;
                border-radius: var(--border-radius);
                padding: 20px;
                cursor: pointer;
                transition: all 0.2s ease;
                display: flex;
                flex-direction: column;
                align-items: center;
                text-align: center;
            }
            .choice-card:hover {
                border-color: var(--text-color);
                background: #0f172a;
                transform: translateY(-5px);
                box-shadow: 0 5px 15px rgba(233, 69, 96, 0.3);
            }
            .choice-icon {
                font-size: 45px;
                margin-bottom: 15px;
            }
            /* Thiết kế khu sắm đồ của Gian Thương & Máy Đánh Bạc */
            .sub-event-panel {
                width: 100%;
                max-width: 550px;
                background: #0f172a;
                border: 1px solid #334155;
                border-radius: var(--border-radius);
                padding: 20px;
                box-sizing: border-box;
                display: flex;
                flex-direction: column;
                align-items: center;
            }
            .merchant-item-box {
                background: #1e293b;
                border-left: 4px solid #10b981;
                padding: 15px;
                width: 100%;
                box-sizing: border-box;
                margin-bottom: 20px;
                border-radius: 4px;
            }
            .shop-btn {
                width: 100%;
                margin: 6px 0;
                font-size: 14px;
                padding: 12px;
            }
            .gamble-slider {
                width: 100%;
                margin: 20px 0;
                accent-color: #8b5cf6;
            }
            /* Biến ô trang bị thành nút tương tác */
            .interactive-equip {
                cursor: pointer;
                display: inline-flex;
                align-items: center;
                background: #1e293b;
                padding: 4px 8px;
                border-radius: 4px;
                border: 1px solid #334155;
                transition: all 0.2s;
            }
            .interactive-equip:hover {
                border-color: #fbbf24;
                background: #334155;
                transform: scale(1.05);
            }
        </style>
    `;
    document.head.insertAdjacentHTML("beforeend", rewardSystemStyles);

    // --- 2. GHI ĐÈ HÀM UI KHO ĐỒ - CHO PHÉP NHẤN VÀO ĐỂ XEM HIỆU ỨNG CHI TIẾT ---

    // Hàm toàn cục chịu trách nhiệm hiển thị thông tin trang bị khi tương tác
    window.inspectEquipmentEffect = function(id) {
        let eq = equipmentDefs[id];
        if (eq) {
            alert(`🛡️ TRANG BỊ: [${eq.name}]\n──────────────────\nHiệu ứng: ${eq.desc}`);
        }
    };

    // --- 3. PHÒNG VỆ NGĂN CHẶN CÂU HỎI MỚI NẠP ĐÈ KHI ĐANG CHỌN PHẦN THƯỞNG ---
    playerState.isChoosingReward = false;

    const oldGenerateRoom = window.generateRoom;

    // --- 4. CƠ CHẾ ĐIỀU PHỐI ĐA SỰ KIỆN SAU KHI DIỆT BOSS ĐỘT PHÁ ---

    // --- 5. XỬ LÝ LỘ TRÌNH CỦA SỰ KIỆN ĐƯỢC CHỌN ---
    

    // --- 6. HÀM PHỤ TRỢ CẤP PHÁT TRANG BỊ CHO GIAN THƯƠNG ---
    

    // --- 7. GIẢI PHÓNG TRẠNG THÁI SỰ KIỆN ĐỂ QUAY LẠI MẠCH PHÒNG THƯỜNG ---
    function exitRewardPhase() {
        let overlay = document.getElementById('boss-reward-overlay');
        if (overlay) overlay.remove();

        playerState.isChoosingReward = false; // Mở khóa luồng game
        renderUIState();
        
        // Đưa người chơi sang phòng thi đấu thông thường tiếp theo kế tiếp chuẩn chỉ
        if (typeof generateRoom === 'function') {
            generateRoom();
        }
    }

    // Chạy đồng bộ nạp lại UI Kho Đồ tương tác ngay khi nạp Phase mới

})();
// ============================================ //
