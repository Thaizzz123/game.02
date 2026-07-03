// HỢP ĐỒNG TRÒ CHƠI v1 - GIAI ĐOẠN 19

(function() {
    // PHỤ THUỘC TRẠNG THÁI TRUNG TÂM:
    // playerState, gameState, equipmentDefs, isCurrentRoomBoss, currentRoomCorrectIndex, renderUIState, updateStatusBarUI

    // --- 1. QUẢN LÝ ĐỘ BỀN ĐỘC LẬP CHO TRÁI TIM BIỂN CẢ (HỎNG SAU 5 CÂU SAI) ---
    window.syncOceanHeartCharges = function() {
        if (!playerState.oceanHeartCharges) {
            playerState.oceanHeartCharges = [];
        }
        let currentHeartsCount = playerState.equipments.filter(id => id === 'ocean_heart').length;
        // Nếu số lượng Trái Tim Biển Cả trong kho đồ lớn hơn số lượt đếm độ bền hiện tại, nạp thêm 5 lượt cho mỗi tim mới nhận
        while (playerState.oceanHeartCharges.length < currentHeartsCount) {
            playerState.oceanHeartCharges.push(5);
        }
    };

    // Ghi đè hàm xử lý câu trả lời để khấu trừ độ bền của từng Trái Tim Biển Cả khi trả lời sai
    const oldHandleAnswer = window.handleAnswer;
    window.handleAnswer = function(selectedIndex) {
        let isCorrect = (selectedIndex === currentRoomCorrectIndex);

        if (!isCorrect) {
            window.syncOceanHeartCharges();
            let currentHeartsCount = playerState.equipments.filter(id => id === 'ocean_heart').length;
            
            // Đồng bộ kích thước mảng độ bền khớp với số lượng thực tế
            if (playerState.oceanHeartCharges.length > currentHeartsCount) {
                playerState.oceanHeartCharges = playerState.oceanHeartCharges.slice(0, currentHeartsCount);
            }

            // Trừ 1 độ bền của TẤT CẢ các Trái Tim Biển Cả hiện có khi trả lời sai
            for (let i = 0; i < playerState.oceanHeartCharges.length; i++) {
                playerState.oceanHeartCharges[i]--;
            }

            // Lọc và xử lý hủy các trang bị đã cạn kiệt độ bền (chạm mốc 0)
            let newCharges = [];
            let expiredCount = 0;
            for (let i = 0; i < playerState.oceanHeartCharges.length; i++) {
                if (playerState.oceanHeartCharges[i] > 0) {
                    newCharges.push(playerState.oceanHeartCharges[i]);
                } else {
                    expiredCount++;
                }
            }
            playerState.oceanHeartCharges = newCharges;

            // Loại bỏ chính xác số lượng Trái Tim Biển Cả bị vỡ ra khỏi túi đồ gốc
            for (let k = 0; k < expiredCount; k++) {
                let idx = playerState.equipments.indexOf('ocean_heart');
                if (idx !== -1) {
                    playerState.equipments.splice(idx, 1);
                }
            }

            if (expiredCount > 0) {
                alert(`💔 VẬN MỆNH: Đã có ${expiredCount} [Trái Tim Biển Cả] cạn kiệt năng lượng sau 5 câu trả lời sai và vỡ vụn!`);
            }
        }

        // Chạy tiếp luồng xử lý gốc (Combo Streak, Sát thương, Chuyển phòng)
        if (typeof oldHandleAnswer === 'function') {
            oldHandleAnswer(selectedIndex);
        }
        
        window.updateStatusBarUI();
    };

    // Ghi đè giao diện Kho Đồ hiển thị để bóc tách rõ ràng độ bền riêng của từng Trái Tim Biển Cả
    window.updateStatusBarUI = function() {
        let statusBar = document.getElementById('ui-status-bar');
        if (!statusBar) return;
        
        if (!playerState.equipments || playerState.equipments.length === 0) {
            statusBar.innerHTML = "Kho Đồ (Nhấp xem hiệu ứng): <span>Trống</span>";
            return;
        }
        
        window.syncOceanHeartCharges();
        
        let heartIdx = 0;
        let itemFrequencies = {};
        let renderedItems = [];
        
        playerState.equipments.forEach(id => {
            let eq = equipmentDefs[id];
            if (!eq) return;
            
            // Trái Tim Biển Cả hiển thị riêng kèm độ bền độc lập
            if (id === 'ocean_heart') {
                let charge = playerState.oceanHeartCharges[heartIdx] !== undefined ? playerState.oceanHeartCharges[heartIdx] : 5;
                renderedItems.push(`
                    <span class="interactive-equip" onclick="window.inspectEquipmentEffect('${id}')" title="Nội tại: Hồi 30 HP mỗi phòng. Sẽ vỡ sau khi trả lời sai 5 câu.">
                        <img src="${eq.img}" class="equip-icon" style="margin-right: 4px;"> ${eq.name} <span style="color:#60a5fa; font-weight:bold;">(${charge}/5❌)</span>
                    </span>
                `);
                heartIdx++;
            } else {
                itemFrequencies[id] = (itemFrequencies[id] || 0) + 1;
            }
        });
        
        // Các trang bị khác vẫn gộp nhóm hiển thị số lượng bình thường
        Object.keys(itemFrequencies).forEach(id => {
            let eq = equipmentDefs[id];
            let stackIndicator = itemFrequencies[id] > 1 ? ` <span style="color:#fbbf24; font-weight:bold;">(x${itemFrequencies[id]})</span>` : '';
            renderedItems.push(`
                <span class="interactive-equip" onclick="window.inspectEquipmentEffect('${id}')" title="${eq.desc}">
                    <img src="${eq.img}" class="equip-icon" style="margin-right: 4px;"> ${eq.name}${stackIndicator}
                </span>
            `);
        });
        
        statusBar.innerHTML = "Kho Đồ (Nhấp xem hiệu ứng): " + renderedItems.join(" &nbsp;");
    };


    // --- 2. ĐỒNG BỘ TOÀN BỘ HIỆU ỨNG PANIC TIMER Ở MỐC 30 GIÂY CUỐI (ÂM THANH + HÌNH ẢNH) ---
    
    // Phòng vệ chặn âm thanh hú còi trước mốc 30 giây
    let originalPlayPanicSiren = window.playPanicSiren;
    window.playPanicSiren = function(intensity) {
        if (gameState.timer > 30) {
            if (typeof stopPanicSiren === 'function') stopPanicSiren();
            return;
        }
        if (typeof originalPlayPanicSiren === 'function') {
            originalPlayPanicSiren(intensity);
        }
    };

    // Ghi đè hàm render giao diện để khóa chặt cả 3 hiệu ứng Panic về đúng 30 giây cuối cùng
    window.renderUIState = function() {
        let m = Math.floor(gameState.timer / 60).toString().padStart(2, '0');
        let s = (gameState.timer % 60).toString().padStart(2, '0');
        
        let timerEl = document.getElementById('ui-timer');
        let hpEl = document.getElementById('ui-hp');
        let roomEl = document.getElementById('ui-room');
        let scoreEl = document.getElementById('ui-score');
        
        if (timerEl) timerEl.innerText = `⏳ ${m}:${s}`;
        if (hpEl) hpEl.innerText = `❤️ ${Math.max(0, playerState.hp)}`;
        if (roomEl) roomEl.innerText = `Phòng: ${playerState.roomCount}`;
        if (scoreEl) scoreEl.innerText = `⭐ ${playerState.score}`;
        
        let nameUI = document.getElementById('ui-player-name-display');
        if (nameUI && playerState.playerName) {
            nameUI.innerText = "👤 " + playerState.playerName;
        }

        let pistolBtn = document.getElementById('btn-skill-pistol');
        if (pistolBtn) {
            let pistolAmt = playerState.equipments.filter(id => id === 'pistol').length;
            if (gameState.status === 'PLAYING' && pistolAmt > 0) {
                pistolBtn.classList.remove('hidden');
                pistolBtn.innerText = `🔫 Dùng Súng Lục (Còn x${pistolAmt})`;
            } else {
                pistolBtn.classList.add('hidden');
            }
        }

        // --- ĐIỀU PHỐI ĐỒNG BỘ HOÀN TOÀN PANIC TIMER Ở 30 GIÂY CUỐI ---
        let panicOverlayLayer = document.getElementById('panic-overlay');
        let gameContainerDOM = document.getElementById('app');

        if (gameState.status === 'PLAYING' && gameState.timer <= 30 && gameState.timer > 0) {
            let dangerRatio30s = (30 - gameState.timer) / 30; // Đẩy trọng số từ 0 lên 1 trong 30 giây cuối
            
            if (panicOverlayLayer) panicOverlayLayer.style.opacity = dangerRatio30s;
            if (gameContainerDOM && !gameContainerDOM.classList.contains('panic-active-vibe')) {
                gameContainerDOM.classList.add('panic-active-vibe');
            }

            window.playPanicSiren(dangerRatio30s);
        } else {
            if (panicOverlayLayer) panicOverlayLayer.style.opacity = 0;
            if (gameContainerDOM) gameContainerDOM.classList.remove('panic-active-vibe');
            if (typeof stopPanicSiren === 'function') stopPanicSiren();
        }
    };


    // --- 3. ĐỔI MỚI VẬT PHẨM GIAN THƯƠNG NGẪU NHIÊN SAU MỖI LẦN MUA ---
    window.deliverPurchasedItem = function(itemId) {
        playerState.equipments.push(itemId);
        if (itemId === 'ocean_heart') {
            window.syncOceanHeartCharges();
        }
        if (itemId === 'pistol') {
            playerState.isPistolReady = true;
        } else if (['cursed_mask', 'lucky_star', 'pumpkin'].includes(itemId)) {
            playerState.activeBuffs.push({ id: itemId, roomsLeft: 3 });
        }
        window.updateStatusBarUI();
    };

    // Ghi đè hệ thống phần thưởng Boss tối hậu để nạp tính năng xoay tua hàng hóa của Gian Thương

    // Tự động quét và đồng bộ kho đồ ngay khi khởi tạo phase mới
    window.updateStatusBarUI();

})();
// ============================================ // 
