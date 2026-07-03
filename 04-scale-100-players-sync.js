// HỢP ĐỒNG TRÒ CHƠI v1 - GIAI ĐOẠN 44 (43 là phần trước đó)
(function() {
    /*
     * PHỤ THUỘC TRẠNG THÁI TRUNG TÂM:
     *   p2p              (Phase 7B) — .connections, .playersData, .syncInterval, .isHost, .peer
     *   playerState      (Phase 2)  — .score, .roomCount, .hp, .isObserver
     *   gameState        (Phase 2)  — .status
     *   rankingState     (global)   — leaderboard array, ghi đè bởi host
     *   startRealGame    (chain: Phase7B→41) — override sync loop adaptive
     *   renderLeaderboard (Phase 7B→41) — override để hiển thị compressed data
     *   broadcastLobbyState (Phase 7B) — override để clean dead connections
     *   clientJoinRoom   (Phase 7B→41) — override thêm ROOM_FULL handler
     *   changeScreen     (chain: Phase2→43) — override xử lý Observer sync + perf monitor
     *
     * MỤC TIÊU: Hỗ trợ ~100 người chơi mà không sập.
     *   1. Adaptive sync interval — tăng khoảng cách khi nhiều người (1.5s → 3s)
     *   2. Compressed leaderboard — chỉ gửi top 10 + vị trí của từng người (thay vì 100 entries × 99 conn)
     *   3. Dead-connection cleanup — dọn trước mỗi broadcast
     *   4. Room limit 100 người + ROOM_FULL message cho client
     *   5. Perf monitor overlay cho Host
     *   6. Observer sync loop replacement (Phase 8 click handler) qua changeScreen hook
     *
     * KHÔNG tạo logic game mới — chỉ tối ưu hoá tầng mạng/sync hiện có.
     */

    const MAX_PLAYERS_44 = 100;

    // ═══════════════════════════════════════════════════════════════════
    // 1. HELPER: ADAPTIVE SYNC INTERVAL
    //    Khi nhiều người, tăng khoảng cách để giảm tải CPU/bandwidth của host
    // ═══════════════════════════════════════════════════════════════════
    function getSyncMs44() {
        var n = (p2p.connections || []).length;
        if (n <= 20) return 1500;
        if (n <= 50) return 2000;
        if (n <= 80) return 2500;
        return 3000;
    }

    // ═══════════════════════════════════════════════════════════════════
    // 2. HELPER: COMPRESSED LEADERBOARD
    //    Gốc: gửi toàn bộ p2p.playersData (N entries) cho (N-1) connections
    //         = N × (N-1) objects/cycle → với 100 người = 9900 objects/cycle
    //    Fix: chỉ gửi top 10 + entry của chính người nhận (tối đa 11 objects/conn)
    //         = 11 × 99 = 1089 objects/cycle (~9× nhẹ hơn)
    // ═══════════════════════════════════════════════════════════════════
    function buildCompressedRanking44(targetPeerId) {
        var sorted = (p2p.playersData || []).slice().sort(function(a, b) { return b.score - a.score; });
        var total  = sorted.length;

        var top10 = sorted.slice(0, 10).map(function(p, i) {
            return { peerId: p.peerId, name: p.name, score: p.score,
                     roomCount: p.roomCount, hp: p.hp, isDead: p.isDead, _rank: i + 1 };
        });

        // Nếu bản thân không nằm trong top 10, thêm vào cuối kèm hạng thực tế
        var inTop10 = top10.some(function(p) { return p.peerId === targetPeerId; });
        if (!inTop10) {
            var myIdx = sorted.findIndex(function(p) { return p.peerId === targetPeerId; });
            if (myIdx !== -1) {
                var m = sorted[myIdx];
                top10.push({ peerId: m.peerId, name: m.name, score: m.score,
                             roomCount: m.roomCount, hp: m.hp, isDead: m.isDead, _rank: myIdx + 1 });
            }
        }

        top10._total = total; // metadata — không tính vào array.length nhưng vẫn truyền được
        return top10;
    }

    // ═══════════════════════════════════════════════════════════════════
    // 3. OVERRIDE startRealGame
    //    Thay setInterval cứng 1500ms của Phase 41 bằng setTimeout chain adaptive
    //    + compressed leaderboard broadcast
    // ═══════════════════════════════════════════════════════════════════
    var _prevStart44 = window.startRealGame;
    window.startRealGame = function() {
        if (typeof _prevStart44 === 'function') _prevStart44(); // Gọi chain Phase7B→41 như cũ

        if (!p2p.isHost) return; // Client không làm gì ở đây

        // Dừng interval của Phase 41 (nếu có)
        if (p2p.syncInterval) { clearInterval(p2p.syncInterval); p2p.syncInterval = null; }

        // Bắt đầu adaptive sync loop bằng setTimeout chain
        function doSync44() {
            if (gameState.status !== 'PLAYING') {
                p2p.syncInterval = setTimeout(doSync44, 2000);
                return;
            }

            // Dọn kết nối đã chết trước khi broadcast
            p2p.connections = (p2p.connections || []).filter(function(c) { return c && c.open; });

            // Cập nhật data bản thân host (nếu host là người chơi, không phải Observer)
            if (!playerState.isObserver && p2p.playersData && p2p.playersData[0]) {
                p2p.playersData[0].score     = playerState.score;
                p2p.playersData[0].roomCount = playerState.roomCount;
                p2p.playersData[0].hp        = playerState.hp;
                p2p.playersData[0].isDead    = (playerState.hp <= 0);
            }

            rankingState = p2p.playersData || [];

            // Gửi compressed leaderboard cá nhân hoá cho từng client
            p2p.connections.forEach(function(conn) {
                if (!conn || !conn.open) return;
                try {
                    conn.send({
                        type: 'LEADERBOARD_UPDATE',
                        ranking: buildCompressedRanking44(conn.peer)
                    });
                } catch(e) { /* bỏ qua lỗi gửi vào conn đã hỏng */ }
            });

            p2p.syncInterval = setTimeout(doSync44, getSyncMs44());
        }

        p2p.syncInterval = setTimeout(doSync44, getSyncMs44());
    };

    // ═══════════════════════════════════════════════════════════════════
    // 4. OVERRIDE renderLeaderboard
    //    Xử lý cả 2 format: compressed (có _rank, _total) và full (p2p.playersData gốc)
    // ═══════════════════════════════════════════════════════════════════
    var _prevRL44 = window.renderLeaderboard;
    window.renderLeaderboard = function(sortBy) {
        var list = document.getElementById('ranking-list');
        if (!list || !rankingState || !rankingState.length) {
            if (typeof _prevRL44 === 'function') _prevRL44(sortBy);
            return;
        }

        var myPeerId  = (p2p.peer) ? p2p.peer.id : null;
        var total     = rankingState._total || rankingState.length;
        var hasRank   = rankingState[0] && (rankingState[0]._rank !== undefined);
        var sorted    = rankingState.filter(function(p) { return p && p.peerId; }).slice();

        if (sortBy === 'room') {
            sorted.sort(function(a, b) { return b.roomCount - a.roomCount; });
        } else {
            // Compressed data: sort theo _rank; Full data: sort theo score
            if (hasRank) {
                sorted.sort(function(a, b) { return (a._rank || 999) - (b._rank || 999); });
            } else {
                sorted.sort(function(a, b) { return b.score - a.score; });
            }
        }

        list.innerHTML = '';
        sorted.forEach(function(ent, i) {
            var li = document.createElement('li');
            var isMe = (ent.peerId === myPeerId);
            li.style.borderLeftColor = isMe ? '#10b981' : 'var(--text-color)';
            if (isMe) li.style.backgroundColor = '#1e293b';

            var displayRank = hasRank ? ent._rank : (i + 1);
            var rankStr  = displayRank === 1 ? '🏆 TOP 1' : 'Top ' + displayRank;
            var statusStr = ent.isDead
                ? '<span style="color:#d90429;">(ĐÃ CHẾT)</span>'
                : '<span style="color:#10b981;">(ĐANG SỐNG)</span>';

            li.innerHTML =
                '<strong>' + rankStr + ' — ' + ent.name + ' ' + (isMe ? '(BẠN) ' : '') + statusStr + '</strong><br>' +
                '<span style="font-size:14px;color:#94a3b8;">Điểm: ' + ent.score +
                ' | Phòng: ' + ent.roomCount + ' | HP: ' + ent.hp + '</span>';
            list.appendChild(li);
        });

        // Ghi chú số người ở ngoài top 10
        if (total > 10 && sorted.length === 10) {
            var note = document.createElement('li');
            note.style.cssText = 'color:#64748b;font-size:12px;text-align:center;border-left:4px solid #334155;';
            note.innerText = '… và ' + (total - 10) + ' chiến binh khác. Tổng: ' + total + ' người.';
            list.appendChild(note);
        }
    };

    // ═══════════════════════════════════════════════════════════════════
    // 5. OVERRIDE broadcastLobbyState — dọn dead connections trước mỗi lần broadcast
    // ═══════════════════════════════════════════════════════════════════
    var _prevBLS44 = window.broadcastLobbyState;
    window.broadcastLobbyState = function() {
        p2p.connections = (p2p.connections || []).filter(function(c) { return c && c.open; });
        if (typeof _prevBLS44 === 'function') _prevBLS44();
    };

    // ═══════════════════════════════════════════════════════════════════
    // 6. ROOM LIMIT: Gửi ROOM_FULL cho kết nối vượt quá giới hạn
    //    Hook qua broadcastLobbyState vì là điểm tập trung mỗi khi có người join
    // ═══════════════════════════════════════════════════════════════════
    var _prevBLS44b = window.broadcastLobbyState;
    window.broadcastLobbyState = function() {
        // Nếu số người vượt MAX, gửi ROOM_FULL cho kết nối cuối và đẩy ra
        if (p2p.connections && p2p.connections.length > MAX_PLAYERS_44) {
            var excess = p2p.connections.splice(MAX_PLAYERS_44);
            excess.forEach(function(conn) {
                try {
                    conn.send({ type: 'ROOM_FULL', message: 'Phòng đã đủ ' + MAX_PLAYERS_44 + ' chiến binh!' });
                    setTimeout(function() { try { conn.close(); } catch(e) {} }, 400);
                } catch(e) {}
            });
        }
        if (typeof _prevBLS44b === 'function') _prevBLS44b();
    };

    // ═══════════════════════════════════════════════════════════════════
    // 7. OVERRIDE clientJoinRoom — thêm handler nhận ROOM_FULL từ host
    // ═══════════════════════════════════════════════════════════════════
    var _prevCJR44 = window.clientJoinRoom;

    // ═══════════════════════════════════════════════════════════════════
    // 8. OVERRIDE changeScreen
    //    8a. Khi Observer vào screen-result: thay sync loop Phase 8 bằng adaptive version
    //    8b. Khi vào screen-lobby / screen-result: tiêm Perf Monitor cho Host
    // ═══════════════════════════════════════════════════════════════════

    // ─── 8a. Observer adaptive sync replacement ─────────────────────
    function replaceObserverSync44() {
        // Phase 8 đã set p2p.syncInterval ở đây; ta replace bằng adaptive version
        if (p2p.syncInterval) { clearInterval(p2p.syncInterval); p2p.syncInterval = null; }

        function doObsSync44() {
            if (gameState.status !== 'PLAYING') {
                p2p.syncInterval = setTimeout(doObsSync44, 2000);
                return;
            }

            p2p.connections = (p2p.connections || []).filter(function(c) { return c && c.open; });
            rankingState = (p2p.playersData || []).slice();

            // Gửi compressed cho từng client cá nhân hoá
            p2p.connections.forEach(function(conn) {
                if (!conn || !conn.open) return;
                try {
                    conn.send({
                        type: 'LEADERBOARD_UPDATE',
                        ranking: buildCompressedRanking44(conn.peer)
                    });
                } catch(e) {}
            });

            // Render BXH cho Admin Observer
            var tabRoom = document.getElementById('tab-room');
            var currentTab = (tabRoom && tabRoom.style.backgroundColor === 'var(--btn-hover)') ? 'room' : 'score';
            renderLeaderboard(currentTab);

            p2p.syncInterval = setTimeout(doObsSync44, getSyncMs44());
        }

        p2p.syncInterval = setTimeout(doObsSync44, getSyncMs44());
    }

    // ─── 8b. Perf Monitor cho Host ───────────────────────────────────
    function injectPerfMonitor44() {
        if (!p2p.isHost) return;
        if (document.getElementById('pm-44')) return;

        var m = document.createElement('div');
        m.id = 'pm-44';
        m.style.cssText =
            'position:fixed;bottom:10px;right:10px;background:rgba(15,23,42,0.88);' +
            'color:#10b981;font-size:10px;padding:6px 11px;border-radius:6px;z-index:9999;' +
            'font-family:monospace;border:1px solid #334155;pointer-events:none;line-height:1.7;';
        document.body.appendChild(m);

        setInterval(function() {
            if (!p2p.isHost) { m.remove(); return; }
            var alive   = (p2p.connections || []).filter(function(c) { return c && c.open; }).length;
            var ms      = getSyncMs44();
            var color   = alive > 80 ? '#ef4444' : alive > 50 ? '#fbbf24' : '#10b981';
            var warning = alive >= MAX_PLAYERS_44 ? ' ⚠️MAX' : '';
            m.style.color   = color;
            m.innerHTML = '👑 HOST&nbsp; 🔗&nbsp;' + alive + '/' + MAX_PLAYERS_44 + warning + '<br>⏱&nbsp;Sync:&nbsp;' + ms + 'ms';
        }, 1500);
    }

    // ─── Ghép 8a + 8b vào changeScreen ──────────────────────────────
    var _prevCS44 = window.changeScreen;
    window.changeScreen = function(screenId) {
        if (typeof _prevCS44 === 'function') _prevCS44(screenId);

        if (screenId === 'screen-result' && p2p.isHost && playerState.isObserver) {
            // Phase 8 set syncInterval NGAY SAU changeScreen trong cùng callstack
            // → delay 100ms để Phase 8 chạy xong rồi ta replace
            setTimeout(replaceObserverSync44, 150);
        }

        if (screenId === 'screen-lobby' || screenId === 'screen-result') {
            setTimeout(injectPerfMonitor44, 700);
        }
    };

})();
// ============================================ // 
