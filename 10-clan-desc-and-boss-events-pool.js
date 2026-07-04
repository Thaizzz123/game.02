// HỢP ĐỒNG TRÒ CHƠI v1 - GIAI ĐOẠN 29

(function() {
    // PHỤ THUỘC TRẠNG THÁI TRUNG TÂM:
    // playerState, gameState, characterDefs, equipmentDefs, isCurrentRoomBoss, renderUIState, generateRoom

    // --- 1. CẬP NHẬT CHÚ THÍCH NỘI TẠI CLAN CHO CÁC NHÂN VẬT ---
    if (typeof characterDefs !== 'undefined') {
        if (characterDefs.fool) {
            characterDefs.fool.desc = 'Nội tại: Luôn loại 1 đáp án sai. Clan hỗ trợ: Có 10% cơ hội hồi sinh với 1 máu khi cạn HP.';
        }
        if (characterDefs.scholar) {
            characterDefs.scholar.desc = 'Nội tại: Nhân đôi số điểm khi lọt Top 10. Clan hỗ trợ: Có 60% cơ hội mua vật phẩm giảm giá gấp 3 tại Gian Thương.';
        }
    }
    
    // Làm mới lập tức giao diện chọn nhân vật nếu đang ở màn hình chính
    if (typeof renderCharacterSelectionUI === 'function') {
        renderCharacterSelectionUI();
    }

    // --- 2. VÁ LẠI LUỒNG KẾT THÚC GAME: TÍCH HỢP NỘI TẠI ẨN HỒI SINH (10%) CHO GÃ KHỜ ---
    const oldEndGame = window.endGame;
    window.endGame = function() {
        // Kiểm tra điều kiện kích hoạt cơ hội hồi sinh ẩn của Gã Khờ
        if (playerState.hp <= 0 && playerState.character === 'fool') {
            if (Math.random() < 0.10) {
                playerState.hp = 1; // Hồi sinh với đúng 1 máu kịch tính
                alert("✨ [LIÊN MINH GÃ KHỜ]: Chúc mừng bạn nhận được cơ hội hồi sinh do clan của bạn, thánh nhân đãi kẻ khù khờ!");
                
                // Khôi phục trạng thái chơi, kéo người chơi quay lại trận đấu
                gameState.status = 'PLAYING';
                window.renderUIState();
                window.changeScreen('screen-game');
                
                // Tiếp tục tạo lập phòng chơi thường/boss kế tiếp thay vì đóng băng luồng game
                if (typeof generateRoom === 'function') {
                    generateRoom();
                }
                return; // Ngắt hoàn toàn chuỗi xử lý kết thúc game (Hủy cuộc gọi tử nạn)
            }
        }

        // Nếu không kích hoạt hồi sinh, tiếp tục chạy chu kỳ tử nạn mặc định
        if (typeof oldEndGame === 'function') {
            oldEndGame();
        }
    };

    // --- 3. GHI ĐÈ TOÀN DIỆN MÀN HÌNH PHẦN THƯỞNG BOSS: TÍCH HỢP 60% GIẢM GIÁ GẤP 3 CHO HỌC BÁ ---
    window.handleBossDefeat = function() {
        playerState.isChoosingReward = true; 
        
        let appFrame = document.getElementById('app');
        let oldOverlay = document.getElementById('boss-reward-overlay');
        if (oldOverlay) oldOverlay.remove();

        let rewardOverlay = document.createElement('div');
        rewardOverlay.id = 'boss-reward-overlay';
        appFrame.appendChild(rewardOverlay);

        const totalPool = [
            { id: 'chest', name: 'Rương Cổ Đại', icon: '🎁', desc: 'Rơi ngẫu nhiên vật phẩm cổ vật quý hiếm bổ trợ.' },
            { id: 'merchant', name: 'Gian Thương Bí Ẩn', icon: '🧙‍♂️', desc: 'Sử dụng điểm hoặc máu để giao dịch bảo vật tăng trưởng.' },
            { id: 'gambling', name: 'Vòng Quay May Rủi', icon: '🎰', desc: 'Thử thách vận mệnh nhân điểm thưởng hoặc mất sạch.' }
        ];

        let selectedEvents = [];
        if (playerState.isGamblingCheatTriggered) {
            let gamblingEvent = totalPool.find(e => e.id === 'gambling');
            let remainingPool = totalPool.filter(e => e.id !== 'gambling').sort(() => Math.random() - 0.5);
            selectedEvents = [gamblingEvent, remainingPool[0]];
        } else {
            selectedEvents = totalPool.sort(() => Math.random() - 0.5).slice(0, 2);
        }

        rewardOverlay.innerHTML = `
            <div class="reward-title">🐉 Chiến Thắng Boss Tối Hậu 🐉</div>
            <div class="reward-subtitle">Lựa chọn 1 trong 2 cơ duyên định mệnh xuất hiện dưới đây:</div>
            <div class="choices-container" id="events-choice-row"></div>
        `;

        let row = document.getElementById('events-choice-row');
        selectedEvents.forEach(ev => {
            let card = document.createElement('div');
            card.className = 'choice-card';
            card.innerHTML = `
                <div class="choice-icon">${ev.icon}</div>
                <h3 style="color: #fbbf24; margin: 5px 0;">${ev.name}</h3>
                <p style="font-size: 13px; color: #cbd5e1; margin-top: 10px;">${ev.desc}</p>
            `;
            card.addEventListener('click', () => {
                executeChosenEvent(ev.id);
            });
            row.appendChild(card);
        });

        function executeChosenEvent(eventId) {
            let overlay = document.getElementById('boss-reward-overlay');
            if (!overlay) return;

            overlay.innerHTML = `<div class="sub-event-panel" id="sub-event-content"></div>`;
            let panel = document.getElementById('sub-event-content');

            // === PHÂN NHÁNH 1: RƯƠNG CỔ ĐẠI ===
            if (eventId === 'chest') {
                const eqKeys = Object.keys(equipmentDefs);
                let droppedItemsText = [];
                let loops = (playerState.character === 'madman') ? 2 : 1;
                
                for (let l = 0; l < loops; l++) {
                    let droppedKey = eqKeys[Math.floor(Math.random() * eqKeys.length)];
                    let eq = equipmentDefs[droppedKey];
                    window.deliverPurchasedItem(eq.id);
                    if (eq.id === 'fishing_rod') playerState.bossRoomsRemaining += 5;
                    droppedItemsText.push(`<span style="color: #fbbf24;">[${eq.name}]</span>`);
                }

                panel.innerHTML = `
                    <div class="choice-icon">🎁</div>
                    <h2 style="color: #10b981; margin: 5px 0;">Nhận Được Trang Bị ${playerState.character === 'madman' ? 'x2 (Gã Điên)' : ''}</h2>
                    <div style="margin: 15px 0; text-align: center;">
                        <strong style="font-size: 18px;">${droppedItemsText.join(" & ")}</strong><br>
                        <p style="color: #cbd5e1; font-size: 14px; margin-top: 8px;">Vật phẩm thần thoại đã tự động rơi vào túi đồ!</p>
                    </div>
                    <button id="btn-close-reward" style="width: 100%;">Tiếp Tục Cuộc Hành Trình</button>
                `;
                document.getElementById('btn-close-reward').addEventListener('click', exitRewardPhase);

            // === PHÂN NHÁNH 2: GIAN THƯƠNG BÍ ẨN (TÍCH HỢP TƯƠNG TÁC HỌC BÁ) ===
            } else if (eventId === 'merchant') {
                const shopPool = ['short_sword', 'pistol', 'ocean_heart', 'lucky_star'];
                let randomItemKey = shopPool[Math.floor(Math.random() * shopPool.length)];
                let hasBoughtWithPoints = false;

                function renderShopUI() {
                    let soldItem = equipmentDefs[randomItemKey];
                    let pointCost = Math.floor(playerState.score * 0.4);

                    panel.innerHTML = `
                        <div class="choice-icon">🧙‍♂️</div>
                        <h2 style="color: #e94560; margin: 5px 0;">Gian Thương Bí Ẩn</h2>
                        <p style="color: #94a3b8; font-size: 13px; margin-bottom: 15px; text-align:center;">
                            ${playerState.character === 'madman' ? '🔥 Ưu đãi GÃ ĐIÊN: Mua 1 giá nhận về 2 món đồ giống nhau!' : 'Hàng hóa tự động xoay tua ngẫu nhiên sau mỗi lần mua.'}
                        </p>
                        <div class="merchant-item-box">
                            <strong style="color: #fbbf24; font-size: 16px;">💎 Vật Phẩm: ${soldItem.name}</strong><br>
                            <span style="font-size: 13px; color: #cbd5e1;">${soldItem.desc}</span>
                        </div>
                        <div style="width: 100%; margin-bottom: 10px; font-size: 12px; color: #cbd5e1; display:flex; justify-content: space-between;">
                            <span>Máu: ❤️${playerState.hp}</span>
                            <span>Điểm: ⭐${playerState.score}</span>
                        </div>
                        <button class="shop-btn" id="btn-shop-hp" style="background-color: #d90429;">❤️ Mua bằng Máu (Nhiều lần)</button>
                        <button class="shop-btn" id="btn-shop-pts" style="background-color: #0f3460;" ${hasBoughtWithPoints ? 'disabled' : ''}>⭐ Mua bằng Điểm (Chỉ 1 lần)</button>
                        <button class="shop-btn" id="btn-shop-leave" style="background-color: #475569; margin-top: 15px;">Rời Khỏi Cửa Hàng</button>
                    `;

                    // Xử lý mua bằng MÁU kèm cơ chế xúc xắc Giảm giá Clan 60% cho Học Bá
                    document.getElementById('btn-shop-hp').addEventListener('click', () => {
                        let finalHpCost = 800;
                        if (playerState.character === 'scholar' && Math.random() < 0.60) {
                            finalHpCost = Math.floor(800 / 3);
                            alert("📖 [LIÊN MINH HỌC BÁ]: Chúc mừng bạn nhận được giảm giá do clan của bạn, số máu/ điểm phải trả giảm đi 3 lần trong lần mua này!");
                        }

                        if (playerState.hp > finalHpCost) {
                            playerState.hp -= finalHpCost;
                            let currentItem = randomItemKey;
                            window.deliverPurchasedItem(currentItem);
                            if (playerState.character === 'madman') {
                                window.deliverPurchasedItem(currentItem);
                                alert(`👹 Nội tại Gã Điên nhân đôi: Nhận thành công 2 món [${equipmentDefs[currentItem].name}]!`);
                            } else {
                                alert(`Đã mua thành công: [${equipmentDefs[currentItem].name}]`);
                            }
                            randomItemKey = shopPool[Math.floor(Math.random() * shopPool.length)];
                            renderShopUI();
                        } else {
                            alert(`⚠️ Lượng Máu của bạn không đủ để giao dịch (Yêu cầu cần > ${finalHpCost} HP)!`);
                        }
                    });

                    // Xử lý mua bằng ĐIỂM kèm cơ chế xúc xắc Giảm giá Clan 60% cho Học Bá
                    document.getElementById('btn-shop-pts').addEventListener('click', () => {
                        if (hasBoughtWithPoints) return;
                        let finalPointCost = Math.floor(playerState.score * 0.4);
                        if (playerState.character === 'scholar' && Math.random() < 0.60) {
                            finalPointCost = Math.floor(finalPointCost / 3);
                            alert("📖 [LIÊN MINH HỌC BÁ]: Chúc mừng bạn nhận được giảm giá do clan của bạn, số máu/ điểm phải trả giảm đi 3 lần trong lần mua này!");
                        }

                        if (playerState.score >= finalPointCost) {
                            playerState.score -= finalPointCost;
                            hasBoughtWithPoints = true;
                            let currentItem = randomItemKey;
                            window.deliverPurchasedItem(currentItem);
                            if (playerState.character === 'madman') {
                                window.deliverPurchasedItem(currentItem);
                                alert(`👹 Nội tại Gã Điên nhân đôi: Nhận thành công 2 món [${equipmentDefs[currentItem].name}]!`);
                            } else {
                                alert(`Đã mua thành công: [${equipmentDefs[currentItem].name}]`);
                            }
                            randomItemKey = shopPool[Math.floor(Math.random() * shopPool.length)];
                            renderShopUI();
                        } else {
                            alert("⚠️ Số điểm tích lũy của bạn không đủ để hoàn tất giao dịch!");
                        }
                    });

                    document.getElementById('btn-shop-leave').addEventListener('click', exitRewardPhase);
                }
                renderShopUI();

            // === PHÂN NHÁNH 3: MÁY ĐÁNH BẠC VẬN MỆNH ===
            } else if (eventId === 'gambling') {
                let maxBet = playerState.score;
                let currentBetAmount = 0;
                let useGamblerSkillInsideMachine = false; 

                panel.innerHTML = `
                    <div class="choice-icon">🎰</div>
                    <h2 style="color: #8b5cf6; margin: 5px 0;">Máy Đánh Bạc Cổ Đại</h2>
                    <p style="color: #94a3b8; font-size: 13px; margin-bottom: 10px; text-align:center;" id="gambling-machine-desc">
                        ${playerState.character === 'madman' ? '🔥 KĨ NĂNG GÃ ĐIÊN: Thắng lớn được nhân 6 (x6) số điểm cược!' : 'Cược điểm hiện tại: Thắng x3 lượng cược, thua mất sạch.'}
                    </p>
                    <div id="gambler-skill-machine-area" style="margin-bottom: 10px; text-align:center;"></div>
                    <div style="font-size: 15px; margin-top: 10px; color:#fff;">
                        Số điểm cược: <strong id="gamble-bet-value" style="color:#fbbf24; font-size:20px;">0</strong> / ${maxBet}
                    </div>
                    <input type="range" class="gamble-slider" id="bet-range-slider" min="0" max="${maxBet}" value="0">
                    <button id="btn-gamble-spin" style="width: 100%; padding: 14px; background: #8b5cf6; font-size: 16px;" ${maxBet <= 0 ? 'disabled' : ''}>🎰 QUAY THƯỞNG VẬN MỆNH</button>
                    <button id="btn-gamble-skip" style="width: 100%; margin-top: 8px; background: #475569;">Bỏ Qua Không Cược</button>
                `;

                let skillArea = document.getElementById('gambler-skill-machine-area');
                if (playerState.character === 'gambler' && skillArea) {
                    let cooldown = playerState.gambleCooldown || 0;
                    if (cooldown > 0) {
                        skillArea.innerHTML = `<span style="color:#ef4444; font-size:12px; font-weight:bold;">🎲 Nội tại Con Bạc đang hồi chiêu (${cooldown}/5 phòng)</span>`;
                    } else {
                        skillArea.innerHTML = `<button id="btn-activate-gambler-skill-inside" style="background:#8b5cf6; color:#fff; padding:6px 12px; font-size:12px; border:1px solid #c084fc; border-radius:4px; cursor:pointer; font-weight:bold; transition:all 0.2s;">🔥 SỬ DỤNG NỘI TẠI CON BẠC (THẮNG X10 ĐIỂM)</button>`;
                        document.getElementById('btn-activate-gambler-skill-inside').addEventListener('click', function() {
                            useGamblerSkillInsideMachine = true;
                            this.disabled = true;
                            this.style.background = "#4c1d95";
                            this.style.borderColor = "#4c1d95";
                            this.innerText = "🔥 ĐÃ KÍCH HOẠT NỘI TẠI CON BẠC (THẮNG X10)";
                            document.getElementById('gambling-machine-desc').innerHTML = "🔥 <span style='color:#a855f7; font-weight:bold;'>NỘI TẠI CON BẠC ACTIVE:</span> Số điểm cược sẽ được nhân 10 (x10) nếu bạn quay trúng ô Thắng!";
                        });
                    }
                }

                let slider = document.getElementById('bet-range-slider');
                let betText = document.getElementById('gamble-bet-value');
                let spinBtn = document.getElementById('btn-gamble-spin');

                slider.addEventListener('input', function() {
                    currentBetAmount = parseInt(this.value) || 0;
                    betText.innerText = currentBetAmount;
                });

                spinBtn.addEventListener('click', () => {
                    if (currentBetAmount < 0 || currentBetAmount > playerState.score) return;
                    
                    spinBtn.disabled = true;
                    slider.disabled = true;
                    if (document.getElementById('btn-gamble-skip')) document.getElementById('btn-gamble-skip').style.display = 'none';
                    if (document.getElementById('btn-activate-gambler-skill-inside')) document.getElementById('btn-activate-gambler-skill-inside').disabled = true;

                    let rollDice = Math.random();
                    let isWin = (rollDice <= 0.25);
                    // ĐÃ GỠ BỎ: cơ chế "cheat code" ẩn (đặt cược = điểm hiện có - 1 khi chọn Con Bạc)
                    // từng khóa isGamblingCheatTriggered = true vĩnh viễn, khiến máy đánh bạc luôn
                    // thắng 100% từ đó về sau => điểm tăng theo cấp số nhân mỗi lần qua Boss.
                    // Đây là backdoor không chủ đích, gây mất cân bằng nghiêm trọng nên đã loại bỏ.

                    if (isWin) {
                        let multiplier = 3;
                        if (playerState.character === 'madman') {
                            multiplier = 6;
                        } else if (playerState.character === 'gambler' && useGamblerSkillInsideMachine) {
                            multiplier = 10; 
                            playerState.gambleCooldown = 5;
                        }
                        
                        let winProfit = currentBetAmount * (multiplier - 1); 
                        playerState.score += winProfit;
                        
                        let cheatNotification = "";

                        panel.innerHTML = `
                            <div class="choice-icon">🎉</div>
                            <h2 style="color: #10b981; margin: 5px 0;">ĐẠI THẮNG!</h2>
                            <p style="font-size: 16px; margin: 15px 0; text-align:center;">Vận may mỉm cười tối thượng! Nhận ngay <strong style="color:#10b981;">+${currentBetAmount * multiplier} Điểm (x${multiplier})</strong>!${cheatNotification}</p>
                            <button id="btn-gamble-end" style="width: 100%;">Tuyệt Vời</button>
                        `;
                    } else {
                        if (playerState.character === 'gambler' && useGamblerSkillInsideMachine) {
                            playerState.gambleCooldown = 5;
                        }
                        
                        playerState.score -= currentBetAmount;
                        panel.innerHTML = `
                            <div class="choice-icon">📉</div>
                            <h2 style="color: #d90429; margin: 5px 0;">THẤT BẠI...</h2>
                            <p style="font-size: 15px; margin: 15px 0; text-align:center;">Trắng tay! Đã đánh mất hoàn toàn <strong style="color:#d90429;">-${currentBetAmount} Điểm</strong>.</p>
                            <button id="btn-gamble-end" style="width: 100%;">Chấp Nhận Số Phận</button>
                        `;
                    }
                    document.getElementById('btn-gamble-end').addEventListener('click', exitRewardPhase);
                });

                if (document.getElementById('btn-gamble-skip')) document.getElementById('btn-gamble-skip').addEventListener('click', exitRewardPhase);
            }
        }

        function exitRewardPhase() {
            let overlay = document.getElementById('boss-reward-overlay');
            if (overlay) overlay.remove();
            playerState.isChoosingReward = false;
            window.renderUIState();
            if (typeof generateRoom === 'function') generateRoom();
        }
    };

})();
// ============================================ // 
