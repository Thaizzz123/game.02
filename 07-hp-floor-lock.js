// HỢP ĐỒNG TRÒ CHƠI v1 - GIAI ĐOẠN 26

(function() {
    // PHỤ THUỘC TRẠNG THÁI TRUNG TÂM:
    // playerState, gameState, rankingState, p2p, endGame, renderLeaderboard (Global variables)

    // --- 1. CORE INTERCEPTOR: KHÓA CHẶT CHỈ SỐ MÁU KHÔNG CHO ÂM (SINGLE SOURCE OF TRUTH) ---
    let _internalHp = playerState.hp;
    // Tự động giải phóng thuộc tính cũ và định hình lại cơ chế phản xạ Getter/Setter bảo vệ dữ liệu gốc
    delete playerState.hp;
    Object.defineProperty(playerState, 'hp', {
        get: function() {
            return _internalHp;
        },
        set: function(newValue) {
            _internalHp = newValue;
            // Luật ân hạn bắt buộc: Nếu máu bị trừ xuống âm, lập tức quy đổi dứt khoát về 0
            if (_internalHp <= 0) {
                _internalHp = 0;
            }
        },
        configurable: true,
        enumerable: true
    });


    // --- 2. VÁ LẠI HÀM KẾT THÚC TRẬN ĐẤU (END GAME FORCE SYNC SANITY CHECK) ---
    const oldEndGame = window.endGame;
    window.endGame = function() {
        // Ép máu về 0 nếu phát hiện trạng thái nguy kịch
        if (playerState.hp <= 0) {
            playerState.hp = 0;
        }

        // Cập nhật trạng thái mạng lưới P2P khẩn cấp trước khi chu kỳ vòng lặp chính bị đóng băng
        if (typeof p2p !== 'undefined' && p2p.peer) {
            let myPeerId = p2p.peer.id;
            
            // Đồng bộ lập tức trạng thái ĐÃ CHẾT lên danh sách phòng của Host
            if (p2p.playersData) {
                let meInLobby = p2p.playersData.find(p => p.peerId === myPeerId || (p2p.isHost && p.peerId === p2p.roomId));
                if (meInLobby && playerState.hp === 0) {
                    meInLobby.hp = 0;
                    meInLobby.isDead = true;
                }
            }
            
            // Nếu là Client, bắn khẩn cấp gói tin cuối cùng lên Host để đảm bảo bảng xếp hạng ghi nhận ĐÃ CHẾT
            if (!p2p.isHost && p2p.hostConn && p2p.hostConn.open) {
                p2p.hostConn.send({
                    type: 'SYNC_STATE',
                    score: playerState.score,
                    roomCount: playerState.roomCount,
                    hp: 0,
                    isDead: true
                });
            }
        }

        if (typeof oldEndGame === 'function') {
            oldEndGame();
        }
    };


    // --- 3. VÁ LẠI GIAO DIỆN BẢNG XẾP HẠNG (LEADERBOARD DEFENSIVE SAFEGUARD) ---
    const oldRenderLeaderboard = window.renderLeaderboard;
    window.renderLeaderboard = function(sortBy) {
        // Quét dọn toàn bộ dữ liệu thô từ mạng lưới/bộ đệm, ép tất cả đối tượng hết máu về trạng thái ĐÃ CHẾT chuẩn chỉ 100%
        if (rankingState && rankingState.length > 0) {
            rankingState.forEach(ent => {
                let isMe = false;
                if (ent.isPlayer === true) isMe = true;
                else if (typeof p2p !== 'undefined' && p2p.peer && ent.peerId === p2p.peer.id) isMe = true;

                // Nếu thực thể là Bản thân và bộ lõi báo đã cạn máu
                if (isMe && playerState.hp === 0) {
                    ent.hp = 0;
                    ent.isDead = true;
                }

                // Chữa lỗi lệch chỉ số: Máu <= 0 thì trạng thái bắt buộc hiển thị là ĐÃ CHẾT
                if (ent.hp <= 0) {
                    ent.hp = 0;
                    ent.isDead = true;
                }
            });
        }

        if (typeof oldRenderLeaderboard === 'function') {
            oldRenderLeaderboard(sortBy);
        }
    };


    // --- 4. BỘ ĐỊNH THÌ TUẦN TRA ĐỒNG BỘ NỀN KHÔNG ĐỘ TRỄ (ANTI-DESYNC BACKGROUND GUARD) ---
    // Ngăn chặn triệt để lỗi lag mạng khiến gói tin chết bị gửi chậm hơn gói tin 200 máu cũ
    setInterval(() => {
        if (gameState.status === 'PLAYING' || gameState.status === 'ENDED') {
            // Chuẩn hóa danh sách người chơi cục bộ thời gian thực
            if (typeof p2p !== 'undefined' && p2p.playersData && p2p.playersData.length > 0) {
                p2p.playersData.forEach(p => {
                    let isMe = (p2p.peer && p.peerId === p2p.peer.id);
                    if (isMe && playerState.hp === 0) {
                        p.hp = 0;
                        p.isDead = true;
                    }
                    if (p.hp <= 0) {
                        p.hp = 0;
                        p.isDead = true;
                    }
                });
            }

            // Chuẩn hóa danh sách bảng xếp hạng tổng
            if (typeof rankingState !== 'undefined' && rankingState && rankingState.length > 0) {
                rankingState.forEach(p => {
                    if (p.hp <= 0) {
                        p.hp = 0;
                        p.isDead = true;
                    }
                });
            }
        }
    }, 100);

})();
// ============================================ // 
