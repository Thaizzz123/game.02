// HỢP ĐỒNG TRÒ CHƠI v1 - GIAI ĐOẠN 44 (NHÂN VẬT MỚI: DORAEMON)
// File này đứng riêng ở gốc repo, KHÔNG thuộc 9 nhóm tính năng cũ — giống hệt cách
// `14-admin-force-end-match.js` đã làm. Phải là thẻ <script> nằm SAU CÙNG trong index.html
// (sau cả 14-admin-force-end-match.js), vì nó cần bọc (wrap) bản handleAnswer/applyBuffTick/
// initRealPlayerState CUỐI CÙNG đã được các giai đoạn trước ghi đè chồng lên nhau.

(function() {
    // PHỤ THUỘC TRẠNG THÁI TRUNG TÂM:
    // playerState, characterDefs, gameState, currentRoomCorrectIndex, isCurrentRoomBoss,
    // handleAnswer, applyBuffTick, initRealPlayerState, generateRoom, generateBots,
    // renderCharacterSelectionUI, updateStatusBarUI, renderUIState, showToast, playGameSound

    // --- 1. KHAI BÁO NHÂN VẬT MỚI: DORAEMON ---
    characterDefs.doraemon = {
        id: 'doraemon',
        name: 'Doraemon',
        baseHp: 1500,
        desc: 'Kỹ năng: Du Hành Thời Gian. Đúng 6 câu liên tục để đặt 1 Mốc Thời Gian (lưu số phòng, ' +
              'điểm, máu, trang bị, buff, streak). Đúng thêm 3 câu liên tục sẽ dời Mốc tới hiện tại; ' +
              'sai liên tục 3 câu sẽ mất Mốc (phải tích lại chuỗi 6 câu đúng từ đầu). Đúng/sai đan xen ' +
              'không đủ 3 liên tục thì Mốc vẫn giữ nguyên. Có thể chủ động dùng kỹ năng để quay ngược ' +
              'về đúng Mốc đã lưu bất cứ lúc nào (thời gian trận đấu vẫn trôi, câu hỏi vẫn ngẫu nhiên, ' +
              'không lặp lại câu cũ).'
    };
    characterDefs.doraemon.img = 'https://placehold.co/100x100/1e88e5/fff?text=DORA';

    // Cập nhật lại số lượng thân phận trong mô tả của Random (5 → 6 thân phận)
    if (characterDefs.random) {
        characterDefs.random.desc = 'Hệ thống tự chọn 1 trong 6 thân phận. Nhận thêm 100 máu.';
    }

    // Vẽ lại ngay giao diện chọn nhân vật để hiển thị Doraemon
    if (typeof renderCharacterSelectionUI === 'function') {
        renderCharacterSelectionUI();
    }

    // --- 2. THÊM DORAEMON VÀO DÀN BOT NGẪU NHIÊN Ở SẢNH GHÉP TRẬN ---
    // (Ghi đè toàn bộ vì hàm gốc hard-code mảng charKeys 5 phần tử, không thể "bọc" thêm được)
    window.generateBots = function() {
        gameState.bots = [];
        const charKeys = ['gambler', 'madman', 'fool', 'guard', 'scholar', 'doraemon'];

        let availableNames = [...botNames].sort(() => 0.5 - Math.random());

        for (let i = 0; i < 9; i++) {
            let randomChar = charKeys[Math.floor(Math.random() * charKeys.length)];
            gameState.bots.push({
                id: 'bot_' + i,
                name: availableNames[i] || 'Bot_' + i,
                character: randomChar,
                score: 0,
                roomCount: 1,
                hp: characterDefs[randomChar].baseHp
            });
        }
    };

    // --- 3. THÊM TỈ LỆ RA DORAEMON KHI NGƯỜI CHƠI CHỌN "RANDOM" ---
    // Không ghi đè initRealPlayerState (sẽ làm gãy chuỗi wrap chống gian lận + reset combo streak
    // của các giai đoạn trước). Thay vào đó: nếu người chơi chọn "random", tự bốc thăm đều 1/6 giữa
    // 6 thân phận. Nếu trúng Doraemon thì gán thẳng playerState.character = 'doraemon' TRƯỚC khi gọi
    // hàm gốc — luồng random 5-thân-phận cũ chỉ chạy khi playerState.character vẫn còn là 'random',
    // nên nó sẽ tự động bỏ qua và không random đè lên nữa. Xác suất mỗi thân phận vẫn đúng 1/6:
    // P(Doraemon) = 1/6; P(1 trong 5 thân phận cũ) = 5/6 (để nguyên 'random') × 1/5 (random gốc) = 1/6.
    const oldInitRealPlayerState_dora = window.initRealPlayerState;
    window.initRealPlayerState = function() {
        let forcedDoraemon = false;

        if (playerState.character === 'random') {
            const sixWayPool = ['gambler', 'madman', 'fool', 'guard', 'scholar', 'doraemon'];
            let picked = sixWayPool[Math.floor(Math.random() * sixWayPool.length)];
            if (picked === 'doraemon') {
                forcedDoraemon = true;
                playerState.character = 'doraemon'; // Chặn nhánh random gốc chạy lại
            }
        }

        if (typeof oldInitRealPlayerState_dora === 'function') {
            oldInitRealPlayerState_dora();
        }

        if (forcedDoraemon) {
            // Luồng gốc không cộng 100 HP / không hiện thông báo vì nó không thấy 'random' nữa —
            // tự bù lại đúng luật của hệ Random ở đây.
            playerState.hp = characterDefs.doraemon.baseHp + 100;
            playerState.originalSelectedCharacter = 'random'; // Khôi phục đúng lựa chọn gốc cho anti-cheat
            alert(`Hệ thống đã chọn ngẫu nhiên cho bạn thân phận: ${characterDefs.doraemon.name} (+100 HP)`);
        }

        // Khởi tạo trạng thái riêng cho kỹ năng Du Hành Thời Gian
        playerState.dorTimeCheckpoint = null;
        playerState.dorCorrectSinceCheckpoint = 0;
        playerState.dorWrongSinceCheckpoint = 0;
        playerState.dorRewindCooldown = 0;
    };

    // --- 4. HÀM LƯU 1 MỐC THỜI GIAN (SNAPSHOT TRẠNG THÁI HIỆN TẠI) ---
    function setDoraemonCheckpoint() {
        playerState.dorTimeCheckpoint = {
            hp: playerState.hp,
            score: playerState.score,
            roomCount: playerState.roomCount,
            equipments: JSON.parse(JSON.stringify(playerState.equipments || [])),
            activeBuffs: JSON.parse(JSON.stringify(playerState.activeBuffs || [])),
            comboStreak: playerState.comboStreak || 0,
            isPistolReady: playerState.isPistolReady,
            isGambleActive: playerState.isGambleActive,
            gambleCooldown: playerState.gambleCooldown,
            fishingRodRoomsSpent: playerState._fishingRodRoomsSpent || 0
        };
    }

    // --- 5. THEO DÕI CHUỖI ĐÚNG/SAI ĐỂ ĐẶT / DỜI / XÓA MỐC THỜI GIAN ---
    const oldHandleAnswer_dora = window.handleAnswer;
    window.handleAnswer = function(selectedIndex) {
        let isCorrectAnswer = (selectedIndex === currentRoomCorrectIndex);
        let wasDoraemon = (playerState.character === 'doraemon');

        if (typeof oldHandleAnswer_dora === 'function') {
            oldHandleAnswer_dora(selectedIndex);
        }

        if (!wasDoraemon) return;
        if (gameState.status !== 'PLAYING') return; // Trận vừa kết thúc thì thôi, khỏi xử lý thêm

        if (!playerState.dorTimeCheckpoint) {
            // CHƯA CÓ MỐC: cần đúng 6 câu liên tục (dùng lại comboStreak toàn cục — vốn đã ngắt về 0
            // ngay khi có 1 câu sai, đúng nghĩa "liên tục" mà yêu cầu đề bài).
            if (isCorrectAnswer && (playerState.comboStreak || 0) >= 6) {
                setDoraemonCheckpoint();
                playerState.dorCorrectSinceCheckpoint = 0;
                playerState.dorWrongSinceCheckpoint = 0;
                if (typeof showToast === 'function') {
                    showToast('⏳ [DORAEMON] Đã đặt Mốc Thời Gian!', 'equip', 3200);
                } else {
                    alert('⏳ Doraemon đã đặt được 1 Mốc Thời Gian!');
                }
                if (typeof playGameSound === 'function') playGameSound('equip');
            }
        } else {
            // ĐÃ CÓ MỐC: theo dõi chuỗi riêng kể từ lúc có Mốc (độc lập với comboStreak toàn cục)
            if (isCorrectAnswer) {
                playerState.dorWrongSinceCheckpoint = 0;
                playerState.dorCorrectSinceCheckpoint = (playerState.dorCorrectSinceCheckpoint || 0) + 1;

                if (playerState.dorCorrectSinceCheckpoint >= 3) {
                    setDoraemonCheckpoint(); // Dời Mốc tới đúng trạng thái hiện tại
                    playerState.dorCorrectSinceCheckpoint = 0;
                    playerState.dorWrongSinceCheckpoint = 0;
                    if (typeof showToast === 'function') {
                        showToast('⏳ [DORAEMON] Mốc Thời Gian đã dời tới hiện tại!', 'equip', 3200);
                    }
                    if (typeof playGameSound === 'function') playGameSound('equip');
                }
            } else {
                playerState.dorCorrectSinceCheckpoint = 0;
                playerState.dorWrongSinceCheckpoint = (playerState.dorWrongSinceCheckpoint || 0) + 1;

                if (playerState.dorWrongSinceCheckpoint >= 3) {
                    playerState.dorTimeCheckpoint = null;
                    playerState.dorCorrectSinceCheckpoint = 0;
                    playerState.dorWrongSinceCheckpoint = 0;
                    if (typeof showToast === 'function') {
                        showToast('💥 [DORAEMON] Mất Mốc Thời Gian! Phải tích lại chuỗi 6 câu đúng.', 'damage', 3800);
                    } else {
                        alert('💥 Doraemon đã mất Mốc Thời Gian! Phải tích lại chuỗi 6 câu đúng từ đầu.');
                    }
                    if (typeof playGameSound === 'function') playGameSound('wrong');
                }
            }
        }
    };

    // --- 6. GIẢM HỒI CHIÊU KỸ NĂNG "QUAY NGƯỢC" MỖI KHI QUA PHÒNG ---
    const oldApplyBuffTick_dora = window.applyBuffTick;
    window.applyBuffTick = function() {
        if (typeof oldApplyBuffTick_dora === 'function') {
            oldApplyBuffTick_dora();
        }
        if (playerState.character === 'doraemon' && playerState.dorRewindCooldown > 0) {
            playerState.dorRewindCooldown--;
        }
    };

    // --- 7. TIÊM NÚT KỸ NĂNG "QUAY NGƯỢC VỀ MỐC THỜI GIAN" VÀO GIAO DIỆN ---
    let btnTimeTravel = document.createElement('button');
    btnTimeTravel.id = 'btn-skill-doraemon';
    btnTimeTravel.style.marginLeft = '10px';
    btnTimeTravel.style.backgroundColor = '#0ea5e9'; // Xanh dương đặc trưng Doraemon
    btnTimeTravel.classList.add('hidden');
    let pistolBtnRef = document.getElementById('btn-skill-pistol');
    if (pistolBtnRef && pistolBtnRef.parentElement) {
        pistolBtnRef.parentElement.appendChild(btnTimeTravel);
    }

    btnTimeTravel.addEventListener('click', () => {
        if (playerState.character !== 'doraemon') return;
        if (!playerState.dorTimeCheckpoint) return;
        if (playerState.dorRewindCooldown > 0) return;
        if (gameState.status !== 'PLAYING') return;
        if (isCurrentRoomBoss || playerState.isChoosingReward) return;

        const cp = playerState.dorTimeCheckpoint;

        // Chỉ quay lại đúng những chỉ số đề bài yêu cầu: số phòng, điểm, máu, trang bị, buff, streak.
        // KHÔNG đụng vào gameState.timer (tổng thời gian trận vẫn trôi tiếp bình thường) và KHÔNG
        // đụng vào câu hỏi hiện tại (generateRoom bên dưới sẽ tự random câu mới, không lặp câu cũ).
        playerState.hp = cp.hp;
        playerState.score = cp.score;
        playerState.roomCount = cp.roomCount;
        playerState.equipments = JSON.parse(JSON.stringify(cp.equipments));
        playerState.activeBuffs = JSON.parse(JSON.stringify(cp.activeBuffs));
        playerState.comboStreak = cp.comboStreak;
        playerState.isPistolReady = cp.isPistolReady;
        playerState.isGambleActive = cp.isGambleActive;
        playerState.gambleCooldown = cp.gambleCooldown;
        playerState._fishingRodRoomsSpent = cp.fishingRodRoomsSpent;

        // Reset lại 2 bộ đếm cục bộ, coi như vừa mới đứng tại Mốc
        playerState.dorCorrectSinceCheckpoint = 0;
        playerState.dorWrongSinceCheckpoint = 0;
        // Hồi chiêu 5 phòng trước khi được dùng lại, tránh spam quay vòng vô hạn
        playerState.dorRewindCooldown = 5;

        // Làm mới ngay hiển thị streak trên top-bar (hàm updateComboStreakUI gốc không lộ ra global)
        let comboUI = document.getElementById('ui-combo-streak-display');
        if (comboUI) {
            let s = playerState.comboStreak || 0;
            if (s >= 3) {
                let bonus = "10%";
                if (s >= 30) bonus = "100%";
                else if (s >= 10) bonus = "50%";
                else if (s >= 5) bonus = "20%";
                comboUI.innerHTML = `🔥 Streak: ${s} (+${bonus} Pts)`;
            } else {
                comboUI.innerHTML = "";
            }
        }

        if (typeof updateStatusBarUI === 'function') updateStatusBarUI();

        if (typeof showToast === 'function') {
            showToast('⏳ Doraemon đã quay ngược về Mốc Thời Gian!', 'info', 3200);
        } else {
            alert('⏳ Doraemon đã quay ngược về Mốc Thời Gian!');
        }
        if (typeof playGameSound === 'function') playGameSound('heal');

        if (playerState.hp <= 0) {
            endGame();
        } else {
            generateRoom(); // Sinh phòng & câu hỏi mới ngẫu nhiên theo đúng số phòng vừa quay về
        }
    });

    // Vòng lặp điều phối trạng thái hiển thị nút (ẩn/hiện, hồi chiêu) — cùng kiểu với nút Đánh Bạc
    setInterval(() => {
        let btn = document.getElementById('btn-skill-doraemon');
        if (!btn) return;

        if (gameState.status === 'PLAYING' && playerState.character === 'doraemon') {
            if (isCurrentRoomBoss || playerState.isChoosingReward || !playerState.dorTimeCheckpoint) {
                btn.classList.add('hidden');
                return;
            }

            btn.classList.remove('hidden');
            if (playerState.dorRewindCooldown > 0) {
                btn.innerText = `⏳ Du Hành Thời Gian (Hồi chiêu: ${playerState.dorRewindCooldown} phòng)`;
                btn.disabled = true;
                btn.style.opacity = "0.6";
            } else {
                btn.innerText = "⏳ Quay Ngược Về Mốc Thời Gian";
                btn.disabled = false;
                btn.style.opacity = "1";
            }
        } else {
            btn.classList.add('hidden');
        }
    }, 200);

})();
// ============================================ //
