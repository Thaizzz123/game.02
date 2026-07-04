// HỢP ĐỒNG TRÒ CHƠI v1 - GIAI ĐOẠN 46
// ============================================ //
(function () {
    /*
     * PHỤ THUỘC TRẠNG THÁI TRUNG TÂM:
     *   p2p           (Phase 7B) — .isHost, .connections, .playersData, .syncInterval, .hostConn
     *   playerState   (Phase 2)  — .isObserver  (CHỈ true khi đã nhập ĐÚNG mã PIN Admin — Phase 45)
     *   gameState     (Phase 2)  — .status
     *   rankingState, changeScreen, renderLeaderboard, endGame (global, chain nhiều phase)
     *
     * MỤC TIÊU:
     *   Thêm nút [🛑 Cưỡng chế Kết thúc Trận đấu] ngay dưới Bảng Xếp Hạng.
     *   Nút này CHỈ hiện khi:
     *     1. Đang xem màn hình Bảng Xếp Hạng (screen-result)
     *     2. Đang là Chủ phòng (p2p.isHost === true)
     *     3. playerState.isObserver === true  → CHỈ được set true ở Phase 45
     *        sau khi nhập ĐÚNG mã PIN Admin. Người chơi thường KHÔNG BAO GIỜ
     *        có isObserver = true nên KHÔNG BAO GIỜ thấy nút này.
     *
     *   Khi Admin bấm & xác nhận:
     *     - Dừng vòng đồng bộ BXH realtime.
     *     - Gửi lệnh FORCE_END kèm bảng điểm cuối cùng cho toàn bộ client đang online.
     *     - Mỗi client nhận lệnh sẽ tự chạy lại luồng endGame() có sẵn (giữ nguyên toàn bộ
     *       logic tính điểm / nội tại nhân vật đã có), thay vì phải chờ hết 6 phút.
     *
     *   KHÔNG đổi cơ chế đếm giờ 6 phút mặc định của trận đấu bình thường — chỉ thêm
     *   một lối tắt THỦ CÔNG dành riêng cho Admin.
     */

    // ═══════════════════════════════════════════════════════════════════
    // A. TIÊM CSS + NÚT (ẨN THEO MẶC ĐỊNH) NGAY DƯỚI BẢNG XẾP HẠNG
    // ═══════════════════════════════════════════════════════════════════
    var _css46 = document.createElement('style');
    _css46.textContent = [
        '#btn-admin-force-end{display:none;width:100%;padding:14px;margin-top:12px;',
        'background:#d90429;color:#fff;border:none;border-radius:8px;',
        'font-size:15px;font-weight:bold;cursor:pointer;letter-spacing:.3px;}',
        '#btn-admin-force-end:hover{background:#ef233c;}',
        '#btn-admin-force-end:disabled{background:#334155;color:#94a3b8;cursor:not-allowed;}',

        '#fem46-ov{position:fixed;top:0;left:0;width:100%;height:100%;',
        'background:rgba(0,0,0,.72);z-index:999999;display:flex;align-items:center;',
        'justify-content:center;backdrop-filter:blur(3px);}',
        '#fem46-bx{background:#16213e;border:2px solid #d90429;border-radius:14px;',
        'padding:26px 22px;width:88%;max-width:380px;text-align:center;',
        'box-shadow:0 10px 50px rgba(0,0,0,.75);}',
        '#fem46-bx h3{color:#e94560;font-size:16px;margin:0 0 12px;line-height:1.4;}',
        '#fem46-bx p{color:#cbd5e1;font-size:14px;line-height:1.5;margin:0 0 18px;}',
        '.fem46-yes{background:#d90429;color:#fff;border:none;border-radius:8px;',
        'padding:12px 20px;font-size:15px;font-weight:bold;cursor:pointer;margin:4px;}',
        '.fem46-yes:hover{background:#ef233c;}',
        '.fem46-no{background:#334155;color:#e2e8f0;border:none;border-radius:8px;',
        'padding:12px 20px;font-size:15px;cursor:pointer;margin:4px;}',
        '.fem46-no:hover{background:#475569;}'
    ].join('');
    document.head.appendChild(_css46);

    var _rankList46 = document.getElementById('ranking-list');
    if (_rankList46 && !document.getElementById('btn-admin-force-end')) {
        _rankList46.insertAdjacentHTML(
            'afterend',
            '<button id="btn-admin-force-end" type="button">🛑 Cưỡng chế Kết thúc Trận đấu (Admin)</button>'
        );
    }

    // ═══════════════════════════════════════════════════════════════════
    // B. MODAL XÁC NHẬN — tránh bấm nhầm làm sập kết quả của cả trăm người
    // ═══════════════════════════════════════════════════════════════════
    function _showConfirm46(onYes) {
        var old = document.getElementById('fem46-ov');
        if (old && old.parentNode) old.parentNode.removeChild(old);

        var ov = document.createElement('div');
        ov.id = 'fem46-ov';
        ov.innerHTML =
            '<div id="fem46-bx">' +
                '<h3>⚠️ Cưỡng chế kết thúc trận đấu ngay bây giờ?</h3>' +
                '<p>Toàn bộ người chơi đang online sẽ nhận KẾT QUẢ CUỐI CÙNG ngay lập tức, ' +
                'không cần chờ hết giờ. Hành động này không thể hoàn tác.</p>' +
                '<button class="fem46-yes" id="fem46-yes" type="button">✔ Kết thúc ngay</button>' +
                '<button class="fem46-no" id="fem46-no" type="button">✖ Huỷ</button>' +
            '</div>';
        document.body.appendChild(ov);

        function _close() { if (ov.parentNode) ov.parentNode.removeChild(ov); }
        document.getElementById('fem46-yes').addEventListener('click', function () { _close(); onYes(); });
        document.getElementById('fem46-no').addEventListener('click', _close);
    }

    // ═══════════════════════════════════════════════════════════════════
    // C. XỬ LÝ PHÍA ADMIN (HOST) — thực thi khi bấm & xác nhận
    // ═══════════════════════════════════════════════════════════════════
    function _doForceEnd46() {
        // Chốt an toàn kép (defense-in-depth): dù nút có lỡ hiện ra thế nào,
        // hàm này CHỈ chạy khi đúng là Admin đã xác thực PIN và đang là Chủ phòng.
        if (!playerState.isObserver || !p2p || !p2p.isHost) return;
        if (gameState.status === 'ENDED') return; // đã kết thúc rồi, tránh bấm đúp

        gameState.status = 'ENDED';

        // Dừng vòng đồng bộ BXH realtime hiện tại (setInterval hoặc setTimeout-chain đều clear được)
        if (p2p.syncInterval) {
            clearInterval(p2p.syncInterval);
            clearTimeout(p2p.syncInterval);
            p2p.syncInterval = null;
        }

        var finalRanking = (p2p.playersData || []).slice();

        // Bắn kết quả cuối cùng cho toàn bộ client còn kết nối
        p2p.connections = (p2p.connections || []).filter(function (c) { return c && c.open; });
        p2p.connections.forEach(function (conn) {
            try { conn.send({ type: 'FORCE_END', ranking: finalRanking }); } catch (e) { /* bỏ qua conn hỏng */ }
        });

        // Hiển thị kết quả cuối cùng ngay trên màn hình Admin
        rankingState = finalRanking;
        if (typeof renderLeaderboard === 'function') renderLeaderboard('score');

        var h2 = document.querySelector('#screen-result h2');
        if (h2) h2.innerText = '🛑 TRẬN ĐẤU ĐÃ ĐƯỢC ADMIN KẾT THÚC';

        var btn = document.getElementById('btn-admin-force-end');
        if (btn) {
            btn.disabled = true;
            btn.innerText = '✅ Đã kết thúc trận đấu';
        }

        if (typeof window._dttt_toast === 'function') {
            window._dttt_toast('🛑 Đã cưỡng chế kết thúc trận đấu. Mọi người chơi đã nhận kết quả cuối cùng.', 'dng', 5500);
        } else {
            alert('Đã cưỡng chế kết thúc trận đấu.');
        }
    }

    document.addEventListener('click', function (e) {
        if (e.target && e.target.id === 'btn-admin-force-end' && !e.target.disabled) {
            _showConfirm46(_doForceEnd46);
        }
    });

    // ═══════════════════════════════════════════════════════════════════
    // D. XỬ LÝ PHÍA CLIENT (người chơi thường) — nhận lệnh FORCE_END từ Admin
    //    Gắn THÊM 1 listener 'data' vào hostConn — KHÔNG thay thế listener cũ,
    //    vì PeerJS DataConnection cho phép nhiều listener cùng lắng nghe 1 event.
    //    Nhờ vậy các luồng JOIN / LOBBY_UPDATE / LEADERBOARD_UPDATE đã có từ các
    //    phase trước không bị đụng tới hay ghi đè.
    // ═══════════════════════════════════════════════════════════════════
    var _femAttached46 = false;
    setInterval(function () {
        if (_femAttached46) return;
        if (!p2p || !p2p.hostConn || typeof p2p.hostConn.on !== 'function') return;

        _femAttached46 = true;
        p2p.hostConn.on('data', function (data) {
            if (!data || data.type !== 'FORCE_END') return;
            if (gameState.status === 'ENDED') return; // client đã tự kết thúc đúng lúc rồi (VD hết máu/hết giờ)

            if (Array.isArray(data.ranking)) rankingState = data.ranking;

            if (typeof window._dttt_toast === 'function') {
                window._dttt_toast('🛑 Admin đã cưỡng chế kết thúc trận đấu!', 'dng', 5000);
            }

            // Tái sử dụng toàn bộ luồng endGame() có sẵn (đã xử lý sort điểm, nội tại
            // nhân vật như Học Bá x2 điểm, render bảng xếp hạng...) — không viết lại logic mới.
            if (typeof window.endGame === 'function') window.endGame();
        });
    }, 400);

    // ═══════════════════════════════════════════════════════════════════
    // E. HIỆN/ẨN NÚT — CHỈ HIỆN CHO ADMIN ĐÃ XÁC THỰC PIN, ĐANG XEM BXH REALTIME
    // ═══════════════════════════════════════════════════════════════════
    var _prevCS46 = window.changeScreen;
    window.changeScreen = function (screenId) {
        if (typeof _prevCS46 === 'function') _prevCS46(screenId);

        var btn = document.getElementById('btn-admin-force-end');
        if (!btn) return;

        var isAdminWatchingLive =
            screenId === 'screen-result' &&
            playerState.isObserver === true &&
            p2p && p2p.isHost === true &&
            gameState.status !== 'ENDED';

        btn.style.display = isAdminWatchingLive ? 'block' : 'none';

        if (isAdminWatchingLive) {
            btn.disabled = false;
            btn.innerText = '🛑 Cưỡng chế Kết thúc Trận đấu (Admin)';
        }
    };

})();
// ============================================ //
