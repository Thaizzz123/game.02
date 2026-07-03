// HỢP ĐỒNG TRÒ CHƠI v1 - GIAI ĐOẠN 32

(function() {
    // PHỤ THUỘC TRẠNG THÁI TRUNG TÂM:
    // playerState, gameState, calculateScore, handleAnswer, getEquipmentBuffSum

    // --- 1. TIÊM CSS HIỆU ỨNG PHÁO BÔNG (FIREWORK CELEBRATION EFFECTS) ---
    const fireworkStyles = `
        <style>
            .firework-particle {
                position: absolute;
                width: 6px;
                height: 6px;
                border-radius: 50%;
                pointer-events: none;
                z-index: 9999;
                box-shadow: 0 0 8px currentColor;
                animation: explodeParticle 1.2s cubic-bezier(0.1, 0.8, 0.3, 1) forwards;
            }
            @keyframes explodeParticle {
                0% {
                    transform: translate(0, 0) scale(1.5);
                    opacity: 1;
                }
                100% {
                    transform: translate(var(--x), var(--y)) scale(0.2);
                    opacity: 0;
                }
            }
        </style>
    `;
    document.head.insertAdjacentHTML("beforeend", fireworkStyles);

    // --- 2. HÀM SINH HẠT PHÁO BÔNG TRỰC QUAN KHI ĐẠT THÀNH TỰU ---
    window.triggerFireworkCelebration = function() {
        let appFrame = document.getElementById('app') || document.body;
        let colors = ['#ff0055', '#00ffcc', '#ffcc00', '#ff00ff', '#00ff00', '#ffffff', '#ff5500', '#38bdf8'];
        
        // Tạo liên tiếp 5 đợt pháo bông nổ rực rỡ ở các vị trí ngẫu nhiên nửa trên màn hình
        for (let b = 0; b < 6; b++) {
            setTimeout(() => {
                let burstX = Math.random() * (appFrame.clientWidth || window.innerWidth);
                let burstY = Math.random() * ((appFrame.clientHeight || window.innerHeight) * 0.5) + 50; 
                
                for (let i = 0; i < 50; i++) {
                    let particle = document.createElement('div');
                    particle.className = 'firework-particle';
                    let chosenColor = colors[Math.floor(Math.random() * colors.length)];
                    particle.style.color = chosenColor;
                    particle.style.backgroundColor = chosenColor;
                    particle.style.left = burstX + 'px';
                    particle.style.top = burstY + 'px';
                    
                    // Tính toán ma trận vector nổ tròn đều
                    let angle = Math.random() * Math.PI * 2;
                    let distance = 30 + Math.random() * 150;
                    let x = Math.cos(angle) * distance;
                    let y = Math.sin(angle) * distance;
                    
                    particle.style.setProperty('--x', `${x}px`);
                    particle.style.setProperty('--y', `${y}px`);
                    
                    appFrame.appendChild(particle);
                    // Tự động dọn dẹp hạt sau khi kết thúc hoạt ảnh tránh rác DOM
                    setTimeout(() => particle.remove(), 1200);
                }
            }, b * 250);
        }
    };

    // --- 3. GHI ĐÈ BỘ TÍNH ĐIỂM TOÀN CỤC: BỔ SUNG MỐC STREAK 100 (+1000% ĐIỂM, HỌC BÁ X2 THÀNH +2000%) ---
    window.calculateScore = function(timeTaken) {
        // Thuật toán tính điểm gốc dựa trên thời gian phản hồi câu hỏi
        let baseScore = Math.max(10, 100 - Math.floor(timeTaken * 5)); 
        
        let passiveMultiplier = 1;
        if (playerState.character === 'madman') passiveMultiplier *= 2;
        if (playerState.character === 'gambler' && playerState.isGambleActive) passiveMultiplier *= 5;
        
        let equipmentBuffPercent = typeof getEquipmentBuffSum === 'function' ? getEquipmentBuffSum('score') : 0;
        
        // Tính toán hệ số nhân tầng Combo Streak mới xuất bản
        let streak = playerState.comboStreak || 0;
        let comboMultiplier = 0;
        
        if (streak >= 100) comboMultiplier = 10.0;    // ĐỘT PHÁ: Đạt 100 Streak tăng 1000% (+10.0 hệ số)
        else if (streak >= 30) comboMultiplier = 1.0;  // Thưởng +100%
        else if (streak >= 10) comboMultiplier = 0.5;  // Thưởng +50%
        else if (streak >= 5) comboMultiplier = 0.2;   // Thưởng +20%
        else if (streak >= 3) comboMultiplier = 0.1;   // Thưởng +10%
        
        // Kĩ năng ẩn bảo mật của Học Bá: Nhân đôi (X2) toàn bộ hiệu ứng của chuỗi Streak (Mốc 100 sẽ thành +2000%)
        if (playerState.character === 'scholar' && comboMultiplier > 0) {
            comboMultiplier *= 2;
        }
        
        let finalScore = baseScore * passiveMultiplier * (1 + comboMultiplier) * (1 + (equipmentBuffPercent / 100));
        return Math.floor(finalScore);
    };

    // --- 4. THEO DÕI ĐÁP ÁN: KÍCH HOẠT PHÁO BÔNG VÀ KHUNG THÔNG BÁO THÀNH TỰU KHI CHẠM MỐC STREAK 100 ---
    const oldHandleAnswer = window.handleAnswer;
    window.handleAnswer = function(selectedIndex) {
        let prevStreak = playerState.comboStreak || 0;
        
        if (typeof oldHandleAnswer === 'function') {
            oldHandleAnswer(selectedIndex);
        }
        
        let currentStreak = playerState.comboStreak || 0;
        
        // Kích hoạt duy nhất một lần tại khoảnh khắc chuỗi đúng đạt chính xác 100 câu liên tiếp
        if (currentStreak === 100 && prevStreak < 100) {
            // Kích hoạt chuỗi hiệu ứng pháo bông rực rỡ toàn diện
            window.triggerFireworkCelebration();
            
            // Hiện hộp thoại thông báo thành tựu ẩn
            setTimeout(() => {
                alert("🎉 Chúc mừng bạn đạt streak 100, mở khóa thành tựu học giả tăng 1000% số điểm kiếm được!");
            }, 100);
        }
    };

    // --- 5. ĐỒNG BỘ HIỂN THỊ CHỈ SỐ BONUS LÊN THANH TRẠNG THÁI TOP BAR THEO THỜI GIAN THỰC ---
    setInterval(() => {
        if (typeof gameState !== 'undefined' && gameState.status === 'PLAYING') {
            let comboContainer = document.getElementById('ui-combo-streak-display');
            let currentStreak = playerState.comboStreak || 0;
            
            if (comboContainer && currentStreak >= 3) {
                let isScholar = (playerState.character === 'scholar');
                let bonusText = "";
                
                if (currentStreak >= 100) bonusText = isScholar ? "2000%" : "1000%";
                else if (currentStreak >= 30) bonusText = isScholar ? "200%" : "100%";
                else if (currentStreak >= 10) bonusText = isScholar ? "100%" : "50%";
                else if (currentStreak >= 5) bonusText = isScholar ? "40%" : "20%";
                else if (currentStreak >= 3) bonusText = isScholar ? "20%" : "10%";
                
                comboContainer.innerHTML = `🔥 Streak: ${currentStreak} (+${bonusText} Pts) ${isScholar ? '[Clan Buff]' : ''}`;
            }
        }
    }, 250);

})();
// ============================================ // 
