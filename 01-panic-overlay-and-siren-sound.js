// HỢP ĐỒNG TRÒ CHƠI v1 - GIAI ĐOẠN 16

(function() {
    // PHỤ THUỘC TRẠNG THÁI TRUNG TÂM:
    // playerState, gameState, activeQuestion, isCurrentRoomBoss, currentRoomCorrectIndex (Global variables)
    
    // --- 1. TIÊM CSS CHO HIỆU ỨNG PANIC Overlays VÀ RUNG LẮC MÀN HÌNH ---
    const panicStyles = `
        <style>
            /* Lớp phủ cảnh báo đỏ lan tỏa từ rìa màn hình */
            #panic-overlay {
                position: absolute;
                top: 0; left: 0; width: 100%; height: 100%;
                background: radial-gradient(circle, rgba(217, 4, 41, 0) 30%, rgba(217, 4, 41, 0.7) 100%);
                pointer-events: none;
                z-index: 999;
                opacity: 0;
                transition: opacity 0.3s ease;
            }
            /* Hoạt ảnh rung nhẹ dồn dập khi đếm ngược khẩn cấp */
            @keyframes panicRumble {
                0% { transform: translate(0, 0); }
                20% { transform: translate(-1px, 1px); }
                40% { transform: translate(1px, -1px); }
                60% { transform: translate(-1px, -1px); }
                80% { transform: translate(1px, 1px); }
                100% { transform: translate(0, 0); }
            }
            .panic-active-vibe {
                animation: panicRumble 0.1s infinite linear !important;
            }
        </style>
    `;
    document.head.insertAdjacentHTML("beforeend", panicStyles);

    // Khởi tạo thành phần giao diện lớp phủ cảnh báo khẩn cấp vào khung máy chính
    if (!document.getElementById('panic-overlay')) {
        let appFrame = document.getElementById('app');
        if (appFrame) appFrame.insertAdjacentHTML('beforeend', '<div id="panic-overlay"></div>');
    }

    // --- 2. QUẢN LÝ THUẬT TOÁN SYNTHESIZER SIREN ÂM CAO (WEB AUDIO API KHÔNG THƯ VIỆN NGOÀI) ---
    let panicAudioCtx = null;
    let panicOscillator = null;
    let panicGainNode = null;

    function playPanicSiren(intensity) {
        if (typeof window.AudioContext === 'undefined' && typeof window.webkitAudioContext === 'undefined') return;
        
        if (!panicAudioCtx) {
            try {
                panicAudioCtx = new (window.AudioContext || window.webkitAudioContext)();
                panicOscillator = panicAudioCtx.createOscillator();
                panicGainNode = panicAudioCtx.createGain();
                
                panicOscillator.type = 'sine'; // Sóng hình sin cho âm hú trong, vang, tần số cao
                panicOscillator.connect(panicGainNode);
                panicGainNode.connect(panicAudioCtx.destination);
                panicOscillator.start(0);
            } catch (e) {
                return;
            }
        }

        if (panicAudioCtx && panicAudioCtx.state === 'suspended') {
            panicAudioCtx.resume(); // Kích hoạt lại nếu bị cơ chế bảo mật của trình duyệt treo
        }

        if (panicOscillator && panicGainNode) {
            let curTime = panicAudioCtx.currentTime;
            // Mô phỏng tiếng xe cứu hỏa (Firetruck siren) hú chu kỳ ngắn, dồn dập cao tần dựa trên mức độ nguy hiểm
            let cyclePeriod = 0.4 - (intensity * 0.2); // Càng ít thời gian, tiếng hú đổi chu kỳ càng nhanh
            let baseFreq = 850 + (intensity * 350);    // Tần số đẩy lên cực cao (850Hz -> 1200Hz)
            let sweepRange = 250 + (intensity * 100);   // Biên độ dao động âm sắc rộng dần
            
            let calculatedHz = baseFreq + Math.sin(curTime * Math.PI * 2 / cyclePeriod) * sweepRange;
            panicOscillator.frequency.setValueAtTime(calculatedHz, curTime);
            
            // Gain âm lượng nhỏ vừa đủ để không gây chói tai cho người chơi (Tối đa 0.04)
            panicGainNode.gain.setValueAtTime(0.04 * intensity, curTime);
        }
    }

    function stopPanicSiren() {
        if (panicAudioCtx && panicGainNode) {
            panicGainNode.gain.setValueAtTime(0, panicAudioCtx.currentTime);
        }
    }

    // --- 3. ĐỒNG BỘ HIỂN THỊ COMBO STREAK LÊN UI TOP-BAR ---
    function updateComboStreakUI() {
        let comboContainer = document.getElementById('ui-combo-streak-display');
        if (!comboContainer) {
            let scoreIndicator = document.getElementById('ui-score');
            if (scoreIndicator) {
                scoreIndicator.insertAdjacentHTML('afterend', '<div id="ui-combo-streak-display" style="color: #10b981; font-weight: bold; font-size: 16px; margin-left: 12px; text-shadow: 0 0 6px #10b981; transition: all 0.2s;"></div>');
                comboContainer = document.getElementById('ui-combo-streak-display');
            }
        }

        let currentStreak = playerState.comboStreak || 0;
        if (currentStreak >= 3) {
            let currentBonus = "10%";
            if (currentStreak >= 30) currentBonus = "100%";
            else if (currentStreak >= 10) currentBonus = "50%";
            else if (currentStreak >= 5) currentBonus = "20% ";
            
            comboContainer.innerHTML = `🔥 Streak: ${currentStreak} (+${currentBonus} Pts)`;
            comboContainer.style.transform = "scale(1.15)";
            setTimeout(() => comboContainer.style.transform = "scale(1)", 120);
        } else {
            comboContainer.innerHTML = "";
        }
    }

    // --- 4. GHI ĐÈ BỔ SUNG ĐỘNG LỰC TĂNG TRƯỞNG & ĐẢO ĐÁP ÁN BOSS VÀO CÁC HOOK HỆ THỐNG ---

    // 4.1 Khởi tạo biến lưu trữ Combo khi thiết lập trạng thái nhân vật thực tế
    const oldInitRealPlayerState = window.initRealPlayerState;
    window.initRealPlayerState = function() {
        if (typeof oldInitRealPlayerState === 'function') oldInitRealPlayerState();
        playerState.comboStreak = 0; // Đặt mốc chuỗi câu đúng về 0
        updateComboStreakUI();
    };

    // 4.2 Tính toán điểm số cộng thêm dựa vào hệ số tầng Combo Streak đang tích lũy
    const oldCalculateScore = window.calculateScore;

    // 4.3 Xử lý tăng/ngắt chuỗi Combo khi người chơi gửi đáp án
    const oldHandleAnswer = window.handleAnswer;
    window.handleAnswer = function(selectedIndex) {
        // Dừng khẩn cấp bộ định thời đảo vị trí đáp án của Boss để chuẩn bị chuyển giao phòng tiếp theo
        if (window.bossShuffleTimerInterval) {
            clearInterval(window.bossShuffleTimerInterval);
        }

        let isCorrect = (selectedIndex === currentRoomCorrectIndex);
        if (isCorrect) {
            playerState.comboStreak = (playerState.comboStreak || 0) + 1;
        } else {
            playerState.comboStreak = 0; // Trả lời sai ngắt chuỗi ngay lập tức
        }

        oldHandleAnswer(selectedIndex);
        updateComboStreakUI();
    };

    // 4.4 Kích hoạt vòng lặp Đảo vị trí đáp án Boss định kỳ mỗi 4 giây
    const oldGenerateRoom = window.generateRoom;

    // 4.5 Hook tiến trình đếm ngược thời gian tổng để điều phối hiệu ứng Panic Timer
    const oldRenderUIState = window.renderUIState;

    // 4.6 Dọn dẹp tài nguyên âm thanh và định thời khi kết thúc giải đấu tránh rò rỉ bộ nhớ
    const oldEndGame = window.endGame;
    window.endGame = function() {
        if (window.bossShuffleTimerInterval) {
            clearInterval(window.bossShuffleTimerInterval);
            window.bossShuffleTimerInterval = null;
        }
        
        stopPanicSiren();
        if (panicOscillator) {
            try { panicOscillator.stop(0); } catch(e) {}
            panicOscillator = null;
        }
        if (panicAudioCtx) {
            try { panicAudioCtx.close(); } catch(e) {}
            panicAudioCtx = null;
        }

        let gameContainerDOM = document.getElementById('app');
        let panicOverlayLayer = document.getElementById('panic-overlay');
        if (panicOverlayLayer) panicOverlayLayer.style.opacity = 0;
        if (gameContainerDOM) gameContainerDOM.classList.remove('panic-active-vibe');

        oldEndGame();
    };

})();
// ============================================ // 
