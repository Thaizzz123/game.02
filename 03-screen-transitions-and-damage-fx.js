// HỢP ĐỒNG TRÒ CHƠI v1 - GIAI ĐOẠN 35

(function() {
    // PHỤ THUỘC TRẠNG THÁI TRUNG TÂM:
    // changeScreen, handleAnswer, calculateDamage, isCurrentRoomBoss, gameState, playerState

    // --- 1. TIÊM ĐỒ HỌA HOẠT ẢNH CHUYỂN MÀN MƯỢT MÀ VÀ HIỆU ỨNG SÁT THƯƠNG (ADVANCED VISUAL FX ENGINE) ---
    const visualFxStyles = `
        <style>
            /* HOẠT ẢNH CHUYỂN MÀN HÌNH (SCREEN TRANSITIONS) */
            .screen-exit-fade-zoom {
                opacity: 0 !important;
                transform: scale(0.96) translateY(15px) !important;
                transition: opacity 0.25s ease-in-out, transform 0.25s ease-in-out !important;
            }
            .screen-enter-fade-zoom {
                animation: screenEntrance 0.35s cubic-bezier(0.34, 1.56, 0.64, 1) forwards !important;
            }
            @keyframes screenEntrance {
                0% {
                    opacity: 0;
                    transform: scale(1.04) translateY(-15px);
                }
                100% {
                    opacity: 1;
                    transform: scale(1) translateY(0);
                }
            }

            /* HIỆU ỨNG CHỚP SÁNG KHẨN CẤP KHI CHỊU ĐÒN (PLAYER HIT FLASH & SHAKE) */
            #player-hit-flash-overlay {
                position: absolute;
                top: 0; left: 0; width: 100%; height: 100%;
                background: rgba(255, 255, 255, 0.85);
                pointer-events: none;
                z-index: 10000;
                opacity: 0;
                mix-blend-mode: overlay;
            }
            @keyframes flashImpact {
                0% { opacity: 1; background: rgba(255, 255, 255, 0.9); }
                30% { background: rgba(217, 4, 41, 0.4); }
                100% { opacity: 0; }
            }
            .trigger-flash-active {
                animation: flashImpact 0.35s ease-out forwards;
            }

            /* HOẠT ẢNH RUNG LẮC MÀN HÌNH CỰC ĐẠI KHI TRÚNG ĐÒN KHỔNG LỒ */
            @keyframes extremePlayerVibe {
                0% { transform: translate(0, 0) rotate(0deg); }
                15% { transform: translate(-6px, 4px) rotate(-1.5deg); }
                30% { transform: translate(6px, -4px) rotate(1.5deg); }
                45% { transform: translate(-4px, -2px) rotate(-1deg); }
                60% { transform: translate(4px, 3px) rotate(1deg); }
                75% { transform: translate(-2px, 2px) rotate(-0.5deg); }
                90% { transform: translate(2px, -1px) rotate(0.5deg); }
                100% { transform: translate(0, 0) rotate(0deg); }
            }
            .player-shake-severe-active {
                animation: extremePlayerVibe 0.35s cubic-bezier(.36,.07,.19,.97) both !important;
            }

            /* CHUỖI TIA LỬA NỔ NHỎ KHI KIẾM ĐÁNH TRÚNG (SPARK PARTICLES MESH) */
            .hit-spark-fragment {
                position: absolute;
                width: 8px;
                height: 8px;
                border-radius: 50%;
                pointer-events: none;
                z-index: 9999;
                box-shadow: 0 0 12px #ff6b6b;
                animation: sparkBurstOut 0.45s cubic-bezier(0.1, 0.8, 0.2, 1) forwards;
            }
            @keyframes sparkBurstOut {
                0% { transform: translate(0, 0) scale(1.5); opacity: 1; }
                100% { transform: translate(var(--mx), var(--my)) scale(0); opacity: 0; }
            }

            /* SỐ SÁT THƯƠNG BAY TRỰC QUAN (FLOATING DAMAGE TEXT INDICATOR) */
            .floating-damage-text {
                position: absolute;
                font-family: 'Impact', 'Segoe UI', sans-serif;
                font-size: 38px;
                font-weight: 900;
                color: #ff003c;
                text-shadow: 0 0 4px #000, 2px 2px 0px #000, -2px -2px 0px #000, 2px -2px 0px #000, -2px 2px 0px #000;
                pointer-events: none;
                z-index: 10005;
                letter-spacing: 1px;
                animation: damageFloatUpAnim 0.75s cubic-bezier(0.18, 0.89, 0.32, 1.28) forwards;
            }
            @keyframes damageFloatUpAnim {
                0% { transform: translateY(0) scale(0.4); opacity: 0; }
                20% { transform: translateY(-30px) scale(1.3); opacity: 1; }
                40% { transform: translateY(-45px) scale(1.0); opacity: 1; }
                100% { transform: translateY(-130px) scale(0.7); opacity: 0; }
            }
        </style>
    `;
    document.head.insertAdjacentHTML("beforeend", visualFxStyles);

    // Tạo sẵn lớp phủ chớp sáng trong app để tối ưu hiệu năng render runtime
    if (!document.getElementById('player-hit-flash-overlay')) {
        let appFrame = document.getElementById('app');
        if (appFrame) {
            appFrame.insertAdjacentHTML('beforeend', '<div id="player-hit-flash-overlay"></div>');
        }
    }


    // --- 2. GHI ĐÈ PATCH HOÀN TOÀN LUỒNG CHUYỂN MÀN HÌNH MƯỢT MÀ (ADDITIVE SCREEN TRANSITION HOOK) ---
    const oldChangeScreen = window.changeScreen;


    // --- 3. ĐỘNG CƠ LIÊN XOÀNG PHÁT HIỆU ỨNG TIA LỬA NỔ VÀ CHỮ SỐ SÁT THƯƠNG BAY TRỰC QUAN ---
    window.triggerPlayerHitVisuals = function(damageValue) {
        let appFrame = document.getElementById('app');
        let gameCenterDOM = document.getElementById('game-center') || appFrame;
        if (!appFrame) return;

        // 3.1 Kích hoạt chớp sáng màn hình cường độ cao đòn đánh trúng đích
        let flashOverlay = document.getElementById('player-hit-flash-overlay');
        if (flashOverlay) {
            flashOverlay.classList.remove('trigger-flash-active');
            void flashOverlay.offsetWidth; // Force reflow trigger
            flashOverlay.classList.add('trigger-flash-active');
        }

        // 3.2 Kích hoạt hoạt ảnh rung giật ma trận màn hình dồn dập mang tính cartoon gàn bối
        appFrame.classList.remove('player-shake-severe-active');
        void appFrame.offsetWidth; // Force reflow trigger
        appFrame.classList.add('player-shake-severe-active');
        setTimeout(() => appFrame.classList.remove('player-shake-severe-active'), 350);

        // 3.3 Khởi tạo bùng nổ 18 mảnh hạt tia lửa (Spark Splashes) lan tỏa từ tâm chấn câu hỏi
        let rect = gameCenterDOM.getBoundingClientRect();
        let centerX = rect.left + rect.width / 2;
        let centerY = rect.top + rect.height / 2 - 40;

        let colorsPool = ['#ff2a00', '#ff7b00', '#ffcc00', '#ffffff', '#e94560'];
        for (let i = 0; i < 18; i++) {
            let spark = document.createElement('div');
            spark.className = 'hit-spark-fragment';
            let clr = colorsPool[Math.floor(Math.random() * colorsPool.length)];
            spark.style.backgroundColor = clr;
            spark.style.boxShadow = `0 0 10px ${clr}`;
            spark.style.left = centerX + 'px';
            spark.style.top = centerY + 'px';

            // Phóng vector góc xòe tròn đều ngẫu nhiên ma trận tia lửa
            let angle = Math.random() * Math.PI * 2;
            let force = 40 + Math.random() * 120;
            let mx = Math.cos(angle) * force;
            let my = Math.sin(angle) * force;

            spark.style.setProperty('--mx', `${mx}px`);
            spark.style.setProperty('--my', `${my}px`);

            document.body.appendChild(spark);
            setTimeout(() => spark.remove(), 450);
        }

        // 3.4 Đúc và đẩy số Sát thương bay (Floating Damage Text Indicator) hiển thị trực diện con số mất máu
        let damageTextNode = document.createElement('div');
        damageTextNode.className = 'floating-damage-text';
        damageTextNode.innerText = `-${damageValue} HP`;
        // Đặt tọa độ động ngay phía trên tâm điểm chịu đòn một chút để dễ nhìn
        damageTextNode.style.left = (centerX - 50) + (Math.random() * 30 - 15) + 'px';
        damageTextNode.style.top = (centerY - 20) + 'px';

        document.body.appendChild(damageTextNode);
        setTimeout(() => damageTextNode.remove(), 750);
    };


    // --- 4. INTERCEPTOR HOOK BẮT TRỌN VÒNG LẶP ĐÁP ÁN ĐỂ KÍCH HOẠT CHUỖI HIỆU ỨNG TỬ NẠN TRỰC QUAN ---
    const oldHandleAnswer = window.handleAnswer;
    window.handleAnswer = function(selectedIndex) {
        // Trích xuất chỉ số kiểm tra đáp án đúng/sai của phòng đấu hiện hành trước khi bộ nhớ đè
        let expectedCorrectIndex = (typeof currentRoomCorrectIndex !== 'undefined') ? currentRoomCorrectIndex : (activeQuestion ? activeQuestion.correctIndex : -1);
        let isCorrect = (selectedIndex === expectedCorrectIndex);

        // Nếu trả lời sai và trạng thái trận đấu đang diễn ra ổn định, tính toán và bung sát thương bay trực quan
        if (!isCorrect && gameState.status === 'PLAYING') {
            let calculatedHitDamage = 0;
            if (typeof window.calculateDamage === 'function') {
                calculatedHitDamage = window.calculateDamage(isCurrentRoomBoss);
            } else {
                calculatedHitDamage = isCurrentRoomBoss ? 300 : 100;
            }

            // Gọi lập tức bộ engine kích hoạt nổ tia lửa, số sát thương bay, và giật lắc khung hình
            window.triggerPlayerHitVisuals(calculatedHitDamage);
        }

        // Chuyển tiếp chạy luồng logic lõi game xử lý trừ máu hay chuyển phòng gốc
        if (typeof oldHandleAnswer === 'function') {
            oldHandleAnswer(selectedIndex);
        }
    };

})();

// ============================================ //
