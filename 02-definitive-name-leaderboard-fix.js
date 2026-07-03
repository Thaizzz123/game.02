// ─── DEFINITIVE NAME LOCK & LEADERBOARD FIX ───
// PHỤ THUỘC:
//   playerState, gameState, rankingState, p2p, gameInterval  (global)
//   characterDefs (Phase 2)
//   initRealPlayerState, startGameLoop (Phase 3/4)
//   #player-display-name (Phase 9), #ui-player-name-display (Phase 10)
//   #ranking-list (Phase 1)

// ─── A. SYNC TÊN REALTIME KHI USER GÕ ───────────────────────────────────────
(function p13_attachNameSync() {
    function attach() {
        let inp = document.getElementById('player-display-name');
        if (inp && !inp._p13) {
            inp._p13 = true;
            inp.addEventListener('input', function () {
                let v = this.value.trim();
                if (v) playerState.playerName = v;
            });
        }
    }
    attach();
    setTimeout(attach, 400); // backup nếu DOM inject muộn
})();

// ─── B. HÀM LẤY TÊN DỨT KHOÁT (ghi đè mọi version cũ) ───────────────────────
window.getValidPlayerName = function () {
    let inp = document.getElementById('player-display-name');
    let fromInput = inp && inp.value.trim();
    // Thứ tự ưu tiên: input field → state đã lock → fallback
    let name = fromInput || playerState.playerName || 'Chiến Binh Bí Ẩn';
    playerState.playerName = name;
    return name;
};

// ─── C. LOCK TÊN SỚM NHẤT CÓ THỂ Ở MỌI ĐIỂM VÀO GAME ───────────────────────

// C1. Offline — bấm "Ghép trận"
const _p13_oldMatchmake = window.startMatchmaking;
window.startMatchmaking = function () {
    getValidPlayerName();                           // Lock trước khi bất cứ thứ gì chạy
    if (typeof _p13_oldMatchmake === 'function') _p13_oldMatchmake();
};

// C2. Offline — startGame (Phase 3) không gọi startRealGame nên phải wrap riêng
const _p13_oldStartGame = window.startGame;
window.startGame = function () {
    getValidPlayerName();
    if (typeof _p13_oldStartGame === 'function') _p13_oldStartGame();
    // Hiển thị tên lên đỉnh màn hình chơi
    let nameUI = document.getElementById('ui-player-name-display');
    if (nameUI) nameUI.innerText = '👤 ' + playerState.playerName;
};

// C3. Online — startRealGame (P2P flow)
const _p13_oldStartRealGame = window.startRealGame;
window.startRealGame = function () {
    getValidPlayerName();
    if (typeof _p13_oldStartRealGame === 'function') _p13_oldStartRealGame();
    let nameUI = document.getElementById('ui-player-name-display');
    if (nameUI) nameUI.innerText = '👤 ' + playerState.playerName;
};

// ─── D. FIX JOINLOBBY OFFLINE ─────────────────────────────────────────────────
// Ghi đè joinLobby offline để hiển thị đúng tên người chơi (không hardcode 'Người Chơi')
window.joinLobby = function () {
    gameState.status = 'LOBBY';
    changeScreen('screen-lobby');

    let myName   = playerState.playerName || getValidPlayerName();
    let charDef  = characterDefs[playerState.character];
    let pList    = document.getElementById('lobby-players-list');
    let pCount   = document.getElementById('lobby-count');

    pCount.innerText  = '10';
    pList.innerHTML   = '';

    // --- Người chơi thật ---
    let me      = document.createElement('li');
    me.style.borderLeftColor = '#10b981';
    me.innerHTML = `<img src="${charDef.img}" class="avatar"> <strong>👑 ${myName} (BẠN)</strong> — Thân phận: ${charDef.name}`;
    pList.appendChild(me);

    // --- Bots ---
    gameState.bots.forEach(bot => {
        let li       = document.createElement('li');
        let botImg   = characterDefs[bot.character]
            ? characterDefs[bot.character].img
            : 'https://api.dicebear.com/7.x/adventurer/svg?seed=' + bot.id + '&backgroundColor=64748b';
        li.innerHTML = `<img src="${botImg}" class="avatar bot-avatar"> <strong>${bot.name}</strong> — Thân phận: ??? (Ẩn)`;
        pList.appendChild(li);
    });
};

// ─── E. FIX HOST/CLIENT ONLINE — LOẠI BỎ PEER-ID SUBSTRING ──────────────────
// Ghi đè hostCreateRoom — phiên bản sạch: fallback tên dùng "Chiến Binh Bí Ẩn",
// không bao giờ dùng conn.peer.substring() nữa

// Ghi đè hostCreateRoomAsObserver — cùng fix fallback tên
const _p13_oldObserver = window.hostCreateRoomAsObserver;

// Ghi đè clientJoinRoom — gửi kèm tên trong mỗi lần SYNC_STATE

// ─── F. ENDGAME OFFLINE — DÙNG TÊN ĐÃ LOCK ──────────────────────────────────
const _p13_oldEndGame = window.endGame;

// ─── G. RENDERLEADERBOARD — PHIÊN BẢN DỨT KHOÁT (ghi đè tất cả version cũ) ─
window.renderLeaderboard = function (sortBy) {
    let list = document.getElementById('ranking-list');
    if (!list) return;
    list.innerHTML = '';

    let sorted = [...rankingState];
    if (sortBy === 'room') sorted.sort((a, b) => b.roomCount - a.roomCount);
    else                   sorted.sort((a, b) => b.score     - a.score);

    sorted.forEach((ent, index) => {
        // ── Xác định có phải BẠN không (hỗ trợ cả offline và online) ──
        let isMe = false;
        if (ent.isPlayer === true) {
            isMe = true; // Offline flag
        } else if (p2p.peer && p2p.peer.id && ent.peerId === p2p.peer.id) {
            isMe = true; // Online — khớp peer ID
        }

        // ── Tên hiển thị: luôn lấy từ playerState nếu là BẠN ──────────
        let displayName = ent.name || 'Chiến Binh Bí Ẩn';
        if (isMe) {
            displayName = playerState.playerName || getValidPlayerName();
            if (!displayName.includes('(BẠN)')) displayName += ' (BẠN)';
        }

        let li        = document.createElement('li');
        let rankStr   = index === 0 ? '🏆 TOP 1' : `Top ${index + 1}`;
        let statusStr = ent.isDead
            ? '<span style="color:#d90429;">(ĐÃ CHẾT)</span>'
            : '<span style="color:#10b981;">(ĐANG SỐNG)</span>';

        li.style.borderLeftColor  = isMe ? '#10b981' : 'var(--text-color)';
        if (isMe) li.style.backgroundColor = '#1e293b';

        li.innerHTML = `
            <strong>${rankStr} — ${displayName} ${statusStr}</strong><br>
            <span style="font-size:14px;color:#94a3b8;">
                Điểm: ${ent.score} | Phòng: ${ent.roomCount} | HP: ${Math.max(0, ent.hp || 0)}
            </span>`;
        list.appendChild(li);
    });
};
