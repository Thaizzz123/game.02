// HỢP ĐỒNG TRÒ CHƠI v1 - GIAI ĐOẠN 45 (44 là phần trước đó)
// ============================================ //
(function () {
    /*
     * PHỤ THUỘC TRẠNG THÁI TRUNG TÂM:
     *   p2p           (Phase 7B) — .peer, .hostConn, .connections, .playersData, .isHost
     *   playerState   (Phase 2)  — .character, .isObserver
     *   gameState     (Phase 2)  — .status
     *   questionBank, rankingState (global)
     *   ADMIN_PASSWORD (Phase 7A)
     *   getValidPlayerName (Phase 10→12)
     *   changeScreen, renderLobbyP2P, startRealGame, renderLeaderboard (global)
     *
     * MỤC TIÊU:
     *   1. Thay toàn bộ alert() / prompt() bản địa bằng toast + modal in-game
     *      → Không bao giờ xuất hiện nút "Prevent this page from creating additional dialogs" trên iOS
     *      → Loại bỏ tình trạng đơ game khi người dùng vô tình bấm Dismiss trên iPhone
     *   2. Cấu hình PeerJS với STUN + TURN servers đầy đủ
     *      → Cho phép kết nối qua WiFi trường, 3G/4G, Symmetric NAT, mọi kiểu mạng
     *
     * KHÔNG tạo logic game mới — chỉ vá tầng giao tiếp người dùng và tầng mạng.
     */

    // ═══════════════════════════════════════════════════════════════════
    // A. HỆ THỐNG TOAST & MODAL (thay thế alert / prompt bản địa)
    // ═══════════════════════════════════════════════════════════════════

    var _s45 = document.createElement('style');
    _s45.textContent = [
        /* Toast */
        '#dttt-tc{position:fixed;bottom:16px;left:50%;transform:translateX(-50%);',
        'z-index:99999;display:flex;flex-direction:column-reverse;align-items:center;',
        'gap:8px;width:92%;max-width:480px;pointer-events:none;}',

        '.dttt-t{background:#16213e;border:1px solid #334155;color:#e2e8f0;',
        'padding:11px 16px;border-radius:10px;font-size:14px;line-height:1.5;',
        'text-align:center;word-break:break-word;box-shadow:0 6px 24px rgba(0,0,0,.55);',
        'pointer-events:auto;width:100%;box-sizing:border-box;animation:_t45in .25s ease;}',

        '.dttt-t.suc{border-left:4px solid #10b981;}',
        '.dttt-t.wrn{border-left:4px solid #fbbf24;}',
        '.dttt-t.dng{border-left:4px solid #d90429;}',
        '.dttt-t.inf{border-left:4px solid #0f3460;}',

        '@keyframes _t45in{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}',
        '@keyframes _t45out{from{opacity:1;transform:translateY(0)}to{opacity:0;transform:translateY(-10px)}}',

        /* Modal overlay */
        '#dttt-mo{position:fixed;top:0;left:0;width:100%;height:100%;',
        'background:rgba(0,0,0,.72);z-index:999999;',
        'display:flex;align-items:center;justify-content:center;backdrop-filter:blur(3px);}',

        '#dttt-mb{background:#16213e;border:2px solid #334155;border-radius:14px;',
        'padding:26px 20px;width:88%;max-width:380px;',
        'text-align:center;box-shadow:0 10px 50px rgba(0,0,0,.75);}',

        '#dttt-mt{color:#e94560;font-size:15px;font-weight:bold;margin-bottom:16px;line-height:1.5;}',

        '#dttt-mi{width:100%;padding:13px;background:#0f172a;color:#fff;',
        'border:1px solid #334155;border-radius:8px;font-size:16px;',
        'box-sizing:border-box;margin-bottom:14px;text-align:center;',
        'letter-spacing:2px;outline:none;}',
        '#dttt-mi:focus{border-color:#e94560;}',

        '.dttt-mok{background:#0f3460;color:#fff;border:none;border-radius:8px;',
        'padding:12px 22px;font-size:15px;font-weight:bold;cursor:pointer;margin:4px;}',
        '.dttt-mok:hover{background:#1a5b9c;}',
        '.dttt-mnk{background:#334155;color:#94a3b8;border:none;border-radius:8px;',
        'padding:12px 22px;font-size:15px;cursor:pointer;margin:4px;}',
        '.dttt-mnk:hover{background:#475569;color:#fff;}'
    ].join('');
    document.head.appendChild(_s45);

    // --- Toast container ---
    var _tc45 = document.createElement('div');
    _tc45.id = 'dttt-tc';
    document.body.appendChild(_tc45);

    // --- API: showToast(msg, type, ms) ---
    window._dttt_toast = function (msg, type, ms) {
        type = type || 'inf';
        ms   = ms   || 3800;
        var t = document.createElement('div');
        t.className = 'dttt-t ' + type;
        t.innerHTML = String(msg).replace(/\n/g, '<br>');
        _tc45.appendChild(t);
        setTimeout(function () {
            t.style.animation = '_t45out .3s ease forwards';
            setTimeout(function () { if (t.parentNode) t.parentNode.removeChild(t); }, 310);
        }, ms);
    };

    // --- Override window.alert — tất cả alert() trong game giờ dùng toast ---
    window.alert = function (msg) {
        if (msg === undefined || msg === null) return;
        var s   = String(msg);
        var typ = 'inf';
        if (/⚠️|Lỗi|Sai|không đủ|sập|Hủy/i.test(s))                     typ = 'wrn';
        if (/CHÚC MỪNG|Thành công|✅|🎉|mua thành|nhận thành/i.test(s)) typ = 'suc';
        if (/⛔|sập kết|CHẾT|đã đầy|HỌC BÁ/i.test(s))                    typ = 'dng';
        // Thông báo quan trọng (boss, trang bị, kỹ năng) hiện lâu hơn
        var dur = /boss|Rơi|trang bị|HỌC BÁ|Gã Điên|thân phận|mua|TOP 1/i.test(s) ? 5500 : 3800;
        window._dttt_toast(s, typ, dur);
    };

    // --- API: showPromptModal(title, placeholder, callback, inputType) ---
    window._dttt_prompt = function (title, placeholder, cb, inputType) {
        var old = document.getElementById('dttt-mo');
        if (old) old.parentNode.removeChild(old);

        var o = document.createElement('div');
        o.id  = 'dttt-mo';
        o.innerHTML =
            '<div id="dttt-mb">' +
            '<div id="dttt-mt">' + title + '</div>' +
            '<input id="dttt-mi" type="' + (inputType || 'text') + '" ' +
            'placeholder="' + (placeholder || '') + '" ' +
            'autocomplete="off" autocorrect="off" autocapitalize="none" spellcheck="false"><br>' +
            '<button class="dttt-mok" id="dttt-mok">✔ Xác nhận</button>' +
            '<button class="dttt-mnk" id="dttt-mnk">✖ Hủy</button>' +
            '</div>';
        document.body.appendChild(o);

        var inp = document.getElementById('dttt-mi');
        setTimeout(function () { inp.focus(); }, 80);

        function done(val) {
            if (o.parentNode) o.parentNode.removeChild(o);
            cb(val);
        }
        document.getElementById('dttt-mok').addEventListener('click',  function () { done(inp.value.trim() || null); });
        document.getElementById('dttt-mnk').addEventListener('click',  function () { done(null); });
        inp.addEventListener('keydown', function (e) {
            if (e.key === 'Enter')  done(inp.value.trim() || null);
            if (e.key === 'Escape') done(null);
        });
    };

    // ═══════════════════════════════════════════════════════════════════
    // B. REFACTOR clientJoinRoom — modal thay cho prompt()
    //    Ghi đè toàn bộ, bao gồm luôn ROOM_FULL handler của Phase 44
    // ═══════════════════════════════════════════════════════════════════
    window.clientJoinRoom = function () {
        if (!playerState.character) {
            window._dttt_toast('⚠️ Vui lòng chọn nhân vật trước!', 'wrn', 3000);
            return;
        }
        var myName = getValidPlayerName();

        window._dttt_prompt(
            '🎮 Nhập Mã Phòng<br><span style="color:#94a3b8;font-size:12px;">Ví dụ: DTTT-1234</span>',
            'DTTT-0000',
            function (roomCode) {
                if (!roomCode) return;
                roomCode = roomCode.toUpperCase();

                changeScreen('screen-matchmaking');
                document.getElementById('matchmaking-status').innerText = 'Đang kết nối tới ' + roomCode + '...';

                p2p.peer = new Peer();

                p2p.peer.on('open', function () {
                    p2p.hostConn = p2p.peer.connect(roomCode);

                    p2p.hostConn.on('open', function () {
                        p2p.hostConn.send({ type: 'JOIN', character: playerState.character, name: myName });
                        gameState.status = 'LOBBY';
                        changeScreen('screen-lobby');
                        document.querySelector('#screen-lobby h2').innerHTML =
                            'Sảnh Chờ <br><span style="color:#10b981;font-size:18px;">Đang ở trong phòng: ' + roomCode + '</span>';
                        document.getElementById('btn-lobby-start').style.display = 'none';
                        if (!document.getElementById('waiting-msg')) {
                            document.getElementById('btn-lobby-start').insertAdjacentHTML(
                                'afterend',
                                '<p id="waiting-msg" style="color:#fbbf24;">Đang chờ Chủ phòng bắt đầu game...</p>'
                            );
                        }
                    });

                    p2p.hostConn.on('data', function (data) {
                        if      (data.type === 'LOBBY_UPDATE')      { p2p.playersData = data.players; renderLobbyP2P(); }
                        else if (data.type === 'START_GAME')         { questionBank = data.qBank; startRealGame(); }
                        else if (data.type === 'LEADERBOARD_UPDATE') { rankingState = data.ranking; renderLeaderboard('score'); }
                        else if (data.type === 'ROOM_FULL') {
                            window._dttt_toast('⛔ ' + (data.message || 'Phòng đã đầy!'), 'dng', 5000);
                            try { if (p2p.peer) p2p.peer.destroy(); } catch (e) {}
                            changeScreen('screen-home');
                        }
                    });

                    p2p.hostConn.on('close', function () {
                        window._dttt_toast('⚠️ Máy chủ đã đóng hoặc sập kết nối!', 'dng', 5000);
                        setTimeout(function () { window.location.reload(); }, 2200);
                    });
                });

                p2p.peer.on('error', function (err) {
                    window._dttt_toast('Lỗi kết nối: ' + err.message, 'wrn', 5000);
                    changeScreen('screen-home');
                });
            }
        );
    };

    // ═══════════════════════════════════════════════════════════════════
    // C. REFACTOR nút Admin — modal thay cho prompt()
    //    Clone lại nút Admin hiện tại (bất kỳ phase nào đang giữ nó)
    // ═══════════════════════════════════════════════════════════════════
    var _ab45 = document.getElementById('btn-goto-admin');
    if (_ab45) {
        var _nb45 = _ab45.cloneNode(true);
        _ab45.parentNode.replaceChild(_nb45, _ab45);
        _nb45.addEventListener('click', function () {
            window._dttt_prompt(
                '🔒 Khu vực Admin<br><span style="color:#94a3b8;font-size:12px;">Nhập mã PIN để tiếp tục</span>',
                '••••',
                function (pass) {
                    if (pass === null) return;
                    if (pass === ADMIN_PASSWORD) {
                        playerState.isObserver = true;
                        changeScreen('screen-admin');
                        window._dttt_toast('✅ Xác thực thành công. Chào Admin!', 'suc', 3000);
                    } else {
                        window._dttt_toast('⚠️ Sai mật khẩu!', 'wrn', 3000);
                    }
                },
                'password'
            );
        });
    }

    // ═══════════════════════════════════════════════════════════════════
    // D. PEERJS ICE CONFIG — Dynamic TURN credentials từ Metered.ca
    //    API: gamecuathaiii.metered.live (500MB free/tháng, credentials động)
    //    Fallback: STUN Google + openrelay demo nếu API chưa kịp trả về
    // ═══════════════════════════════════════════════════════════════════

    var _stunOnly = [
        { urls: 'stun:stun.l.google.com:19302' },
        { urls: 'stun:stun1.l.google.com:19302' },
        { urls: 'stun:stun2.l.google.com:19302' },
        { urls: 'stun:stun3.l.google.com:19302' },
        { urls: 'stun:stun4.l.google.com:19302' },
        { urls: 'stun:stun.cloudflare.com:3478'  }
    ];

    var _turnFallback = [
        { urls: 'turn:openrelay.metered.ca:80',
          username: 'openrelayproject', credential: 'openrelayproject' },
        { urls: 'turn:openrelay.metered.ca:443',
          username: 'openrelayproject', credential: 'openrelayproject' },
        { urls: 'turn:openrelay.metered.ca:443?transport=tcp',
          username: 'openrelayproject', credential: 'openrelayproject' },
        { urls: 'turns:openrelay.metered.ca:443?transport=tcp',
          username: 'openrelayproject', credential: 'openrelayproject' }
    ];

    // Khởi tạo bằng fallback — sẽ được thay bằng credentials động khi API trả về
    var _ice45 = _stunOnly.concat(_turnFallback);
    var _meteredReady = false;

    // Fetch dynamic TURN credentials từ Metered.ca (gamecuathaiii)
    fetch('https://gamecuathaiii.metered.live/api/v1/turn/credentials?apiKey=3040c3a64e55aae0976b6ddc899eb8fa1afb')
        .then(function (res) {
            if (!res.ok) throw new Error('HTTP ' + res.status);
            return res.json();
        })
        .then(function (data) {
            if (Array.isArray(data) && data.length > 0) {
                _ice45 = _stunOnly.concat(data);
                _meteredReady = true;
            }
        })
        .catch(function (err) {
        });

    function _wrapPeer45() {
        if (!window.Peer || window.Peer._p45_done) return;

        var _Orig = window.Peer;

        function PeerICE(id, opts) {
            var merged = Object.assign({}, opts);
            // iceServers đọc _ice45 TẠI THỜI ĐIỂM gọi new Peer()
            // → nếu Metered API đã load: dùng credentials động (tốt hơn)
            // → chưa load: dùng fallback openrelay (vẫn có TURN)
            merged.config = Object.assign({}, (opts && opts.config) || {}, { iceServers: _ice45 });

            if (arguments.length === 0) return new _Orig(merged);
            return new _Orig(id, merged);
        }

        PeerICE.prototype  = _Orig.prototype;
        PeerICE._p45_done  = true;
        window.Peer        = PeerICE;

    }

    var _poll45 = setInterval(function () {
        if (typeof window.Peer === 'function') {
            _wrapPeer45();
            clearInterval(_poll45);
        }
    }, 150);

})();
