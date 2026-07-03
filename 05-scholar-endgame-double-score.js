// HỢP ĐỒNG TRÒ CHƠI v1 - GIAI ĐOẠN 15

(function() {
    // 1. CẬP NHẬT CẤU HÌNH DỮ LIỆU NỘI TẠI NHÂN VẬT HỌC BÁ
    if (typeof characterDefs !== 'undefined' && characterDefs.scholar) {
        characterDefs.scholar.desc = 'Nội tại: Cuối game nếu lọt vào Top 10 người đứng đầu, toàn bộ số điểm đang có sẽ được nhân đôi (x2).';
    }

    // Tái hiển thị giao diện chọn nhân vật để cập nhật mô tả mới ngay lập tức
    if (typeof renderCharacterSelectionUI === 'function') {
        renderCharacterSelectionUI();
    }

    // 2. GHI ĐÈ HOÀN TOÀN HÀM KẾT THÚC GAME ĐỂ VÁ LẠI CƠ CHẾ NHÂN ĐÔI ĐIỂM SỐ (HỖ TRỢ CẢ OFFLINE VÀ ONLINE)
    window.endGame = function () {
        clearInterval(gameInterval);
        if (typeof p2p !== 'undefined' && p2p.syncInterval) clearInterval(p2p.syncInterval);
        
        gameState.status = 'ENDED';
        changeScreen('screen-result');

        let isOffline = !p2p.isHost && (!p2p.hostConn || !p2p.hostConn.open);

        // --- TRƯỜNG HỢP CHƠI OFFLINE (VỚI BOTS) ---
        if (isOffline) {
            let myName = playerState.playerName || getValidPlayerName();

            let allEntities = [
                {
                    id: 'player', isPlayer: true,
                    name:      myName,
                    score:     playerState.score,
                    roomCount: playerState.roomCount,
                    hp:        Math.max(0, playerState.hp),
                    isDead:    playerState.hp <= 0
                },
                ...gameState.bots.map(b => ({
                    id: b.id, isPlayer: false,
                    name:      b.name,
                    score:     b.score,
                    roomCount: b.roomCount,
                    hp:        Math.max(0, b.hp || 0),
                    isDead:    (b.hp || 0) <= 0
                }))
            ];

            // Sắp xếp thử để kiểm tra thứ hạng thực tế
            allEntities.sort((a, b) => b.score - a.score);

            // Kích hoạt nội tại Học Bá mới (Nhân đôi điểm nếu nằm trong Top 10)
            if (playerState.character === 'scholar') {
                let pi = allEntities.findIndex(e => e.isPlayer);
                if (pi >= 0 && pi < 10) {
                    playerState.score *= 2;
                    allEntities[pi].score = playerState.score;
                    alert(`📖 Nội tại HỌC BÁ kích hoạt: Bạn kết thúc trận đấu ở vị trí thứ ${pi + 1} (Thuộc Top 10). Toàn bộ điểm số được NHÂN ĐÔI (x2)!`);
                    // Tái sắp xếp lại bảng xếp hạng sau khi nhân điểm
                    allEntities.sort((a, b) => b.score - a.score);
                }
            }

            rankingState = allEntities;
            renderLeaderboard('score');
        } 
        // --- TRƯỜNG HỢP CHƠI MULTIPLAYER P2P (ONLINE) ---
        else {
            if (playerState.isObserver) {
                // Nếu là Admin/Quan sát viên thì chỉ render bảng điểm thời gian thực của các máy khách
                setTimeout(() => {
                    rankingState = [...p2p.playersData];
                    renderLeaderboard('score');
                }, 1500);
                return;
            }

            // Chờ các kết nối mạng đồng bộ gói tin cuối cùng
            setTimeout(() => {
                rankingState.sort((a, b) => b.score - a.score);
                let myPeerId = p2p.peer ? p2p.peer.id : null;
                let playerIndex = rankingState.findIndex(e => e.peerId === myPeerId);
                
                // Kiểm tra điều kiện lọt Top 10 trên mạng mạng lưới toàn cục
                if (playerState.character === 'scholar' && playerIndex >= 0 && playerIndex < 10) {
                    playerState.score *= 2;
                    rankingState[playerIndex].score = playerState.score;
                    alert(`📖 Nội tại HỌC BÁ kích hoạt: Bạn đã lọt vào Top 10 của giải đấu! Toàn bộ điểm số được NHÂN ĐÔI (x2)!`);
                    
                    // Client gửi cập nhật điểm tối hậu đã nhân đôi lên Host để đồng bộ toàn phòng
                    if (!p2p.isHost && p2p.hostConn && p2p.hostConn.open) {
                        p2p.hostConn.send({ 
                            type: 'SYNC_STATE', 
                            score: playerState.score, 
                            roomCount: playerState.roomCount, 
                            hp: playerState.hp, 
                            isDead: playerState.hp <= 0 
                        });
                    }
                    // Sắp xếp lại danh sách phòng sau khi điểm số được đột biến nhân đôi
                    rankingState.sort((a, b) => b.score - a.score);
                }
                renderLeaderboard('score');
            }, 1500);
        }
    };

})();
// ============================================ // 
