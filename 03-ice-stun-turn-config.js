// HỢP ĐỒNG TRÒ CHƠI v1 - GIAI ĐOẠN 41 (40 là phần trước đó)

(function() {
    // PHỤ THUỘC TRẠNG THÁI TRUNG TÂM:
    // p2p, playerState, gameState, questionBank, rankingState (Global objects)
    // changeScreen, renderLobbyP2P, getValidPlayerName, characterDefs (Previous phases)

    // ─── 1. CẤU HÌNH LIÊN MẠNG CHUYÊN SÂU CHỐNG CHẶN NAT (ICE / STUN SERVERS) ───
    // Việc chơi chung máy (Local/Loopback) không bị lỗi nhưng chơi 2 máy mạng khác nhau bị treo là do
    // tường lửa chặn kết nối P2P trực tiếp. Cấu hình này ép WebRTC tìm đường truyền xuyên NAT qua STUN của Google.
    const robustPeerConfig = {
        config: {
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' },
                { urls: 'stun:stun1.l.google.com:19302' },
                { urls: 'stun:stun2.l.google.com:19302' },
                { urls: 'stun:stun3.l.google.com:19302' },
                { urls: 'stun:stun4.l.google.com:19302' },
                { urls: 'stun:stun.ekiga.net' },
                { urls: 'stun:stun.ideasip.com' },
                { urls: 'stun:stun.iptel.org' }
            ],
            sdpSemantics: 'unified-plan'
        },
        debug: 1 // Chỉ ghi nhận lỗi nghiêm trọng để tối ưu hóa hiệu năng
    };

    // ─── 2. VÁ LỖI 1: CHỦ PHÒNG (HOST) KHÔNG HIỆN MÃ PHÒNG HOẶC BỊ TREO MÀN HÌNH ───
    window.hostCreateRoom = function () {
        if (!playerState.character) { alert('Vui lòng chọn nhân vật trước!'); return; }
        if (questionBank.length === 0) { alert('⚠️ Mày là Chủ phòng, mày phải vào [Cài đặt Admin] nhập câu hỏi trước khi tạo phòng!'); return; }

        let myName = getValidPlayerName();

        changeScreen('screen-matchmaking');
        document.getElementById('matchmaking-status').innerText = 'Đang khởi tạo máy chủ phòng...';

        const randomCode = Math.floor(1500 + Math.random() * 8499).toString();
        p2p.roomId  = 'DTTT-' + randomCode;
        p2p.isHost  = true;
        
        // Khởi tạo Peer với cấu hình băng thông xuyên NAT nâng cao
        p2p.peer = new Peer(p2p.roomId, robustPeerConfig);

        // Thiết lập bộ định thời giám sát (Watchdog) - Nếu quá 10 giây cloud sập không phản hồi thì tự động reset
        let hostWatchdog = setTimeout(() => {
            if (p2p.isHost && (!p2p.peer || !p2p.peer.open)) {
                alert('⚠️ Máy chủ PeerJS Đám mây không phản hồi! Đang tự động thử lại mã phòng khác...');
                try { p2p.peer.destroy(); } catch(e){}
                hostCreateRoom();
            }
        }, 10000);

        p2p.peer.on('open', (id) => {
            clearTimeout(hostWatchdog);
            gameState.status = 'LOBBY';
            changeScreen('screen-lobby');
            document.querySelector('#screen-lobby h2').innerHTML =
                `Sảnh Chờ <br><span style="color:#fbbf24;font-size:24px;">MÃ PHÒNG: ${id}</span>`;
            document.getElementById('btn-lobby-start').innerText = 'BẮT ĐẦU GAME (Ép tất cả vào trận)';

            p2p.playersData = [{
                peerId:    id,
                name:      '👑 ' + myName,
                character: playerState.character,
                score: 0, roomCount: 1,
                hp:        characterDefs[playerState.character].baseHp,
                isDead:    false
            }];
            renderLobbyP2P();
        });

        p2p.peer.on('error', (err) => {
            clearTimeout(hostWatchdog);
            console.error('[Host Peer Error]', err);
            if (err.type === 'id-taken') {
                // Sửa lỗi trùng ID ngầm định khiến phòng bị treo
                setTimeout(() => { hostCreateRoom(); }, 500);
            } else {
                alert('⚠️ Lỗi khởi tạo máy chủ: ' + err.message + ' (' + err.type + ')');
                changeScreen('screen-home');
            }
        });

        p2p.peer.on('connection', (conn) => {
            p2p.connections.push(conn);

            conn.on('error', (err) => { console.error('[Host Conn Error]', err); });

            conn.on('data', (data) => {
                if (data.type === 'JOIN') {
                    let clientName = (data.name && data.name.trim()) ? data.name.trim() : 'Chiến Binh Bí Ẩn';
                    p2p.playersData.push({
                        peerId:    conn.peer,
                        name:      clientName,
                        character: data.character,
                        score: 0, roomCount: 1,
                        hp:        characterDefs[data.character].baseHp,
                        isDead:    false
                    });
                    renderLobbyP2P();
                    // Phát sóng trạng thái cập nhật phòng cho tất cả các máy con đang mở kết nối
                    p2p.connections.forEach(c => { if(c.open) c.send({ type: 'LOBBY_UPDATE', players: p2p.playersData }); });
                }
                else if (data.type === 'SYNC_STATE') {
                    let idx = p2p.playersData.findIndex(p => p.peerId === conn.peer);
                    if (idx !== -1) {
                        // FIX: Một khi Host đã ghi nhận người này CHẾT, không cho bất kỳ gói SYNC_STATE
                        // nào sau đó ghi đè lại điểm/số phòng nữa (chặn điểm tăng ảo sau khi chết do
                        // gói tin đến trễ/lệch thứ tự qua mạng P2P, hoặc do các đường endGame() bị đè
                        // chồng lên nhau chưa dừng kịp việc gửi đồng bộ ở phía client).
                        if (p2p.playersData[idx].isDead) {
                            // Chỉ cho phép xác nhận lại là vẫn chết, không cho hồi hoặc tăng điểm ngầm
                            p2p.playersData[idx].isDead = true;
                            p2p.playersData[idx].hp = 0;
                        } else {
                            p2p.playersData[idx].score     = data.score;
                            p2p.playersData[idx].roomCount = data.roomCount;
                            p2p.playersData[idx].hp        = data.hp;
                            p2p.playersData[idx].isDead    = data.isDead;
                        }
                        if (data.name && data.name.trim()) p2p.playersData[idx].name = data.name.trim();
                    }
                }
            });

            conn.on('close', () => {
                p2p.playersData = p2p.playersData.filter(p => p.peerId !== conn.peer);
                p2p.connections = p2p.connections.filter(c => c.peer  !== conn.peer);
                renderLobbyP2P();
                p2p.connections.forEach(c => { if(c.open) c.send({ type: 'LOBBY_UPDATE', players: p2p.playersData }); });
            });
        });
    };

    // Vá tương tự cho máy chủ phòng tự động của Admin (Observer Mode)
    window.hostCreateRoomAsObserver = function () {
        changeScreen('screen-matchmaking');
        document.getElementById('matchmaking-status').innerText = 'Đang thiết lập Máy Chủ Trung Tâm...';

        const randomCode = Math.floor(1500 + Math.random() * 8499).toString();
        p2p.roomId  = 'DTTT-' + randomCode;
        p2p.isHost  = true;
        p2p.peer    = new Peer(p2p.roomId, robustPeerConfig);

        let observerWatchdog = setTimeout(() => {
            if (p2p.isHost && (!p2p.peer || !p2p.peer.open)) {
                alert('⚠️ Máy Chủ Trung Tâm phản hồi chậm! Đang thử lại tiến trình...');
                try { p2p.peer.destroy(); } catch(e){}
                hostCreateRoomAsObserver();
            }
        }, 10000);

        p2p.peer.on('open', (id) => {
            clearTimeout(observerWatchdog);
            gameState.status = 'LOBBY';
            changeScreen('screen-lobby');
            document.querySelector('#screen-lobby h2').innerHTML = `
                <div class="lobby-glow-text">SẢNH CHỜ TRUNG TÂM</div>
                <span style="color:#fbbf24;font-size:32px;letter-spacing:5px;">MÃ: ${id}</span>
            `;
            document.getElementById('btn-lobby-start').innerText = '🚀 PHÓNG TÀU (Bắt đầu giải đấu)';
            document.getElementById('btn-lobby-start').style.backgroundColor = 'var(--btn-danger)';
            p2p.playersData = [];
            renderLobbyP2P();
        });

        p2p.peer.on('error', (err) => {
            clearTimeout(observerWatchdog);
            if (err.type === 'id-taken') {
                setTimeout(() => { hostCreateRoomAsObserver(); }, 500);
            } else {
                alert('⚠️ Lỗi máy chủ điều phối Admin: ' + err.message);
                changeScreen('screen-admin');
            }
        });

        p2p.peer.on('connection', (conn) => {
            p2p.connections.push(conn);
            conn.on('error', (err) => { console.error(err); });
            conn.on('data', (data) => {
                if (data.type === 'JOIN') {
                    let clientName = (data.name && data.name.trim()) ? data.name.trim() : 'Chiến Binh Bí Ẩn';
                    p2p.playersData.push({
                        peerId:    conn.peer,
                        name:      clientName,
                        character: data.character,
                        score: 0, roomCount: 1,
                        hp:        characterDefs[data.character].baseHp,
                        isDead:    false
                    });
                    renderLobbyP2P();
                    p2p.connections.forEach(c => { if(c.open) c.send({ type: 'LOBBY_UPDATE', players: p2p.playersData }); });
                }
                else if (data.type === 'SYNC_STATE') {
                    let idx = p2p.playersData.findIndex(p => p.peerId === conn.peer);
                    if (idx !== -1) {
                        // FIX: Một khi Host đã ghi nhận người này CHẾT, không cho bất kỳ gói SYNC_STATE
                        // nào sau đó ghi đè lại điểm/số phòng nữa (chặn điểm tăng ảo sau khi chết do
                        // gói tin đến trễ/lệch thứ tự qua mạng P2P, hoặc do các đường endGame() bị đè
                        // chồng lên nhau chưa dừng kịp việc gửi đồng bộ ở phía client).
                        if (p2p.playersData[idx].isDead) {
                            // Chỉ cho phép xác nhận lại là vẫn chết, không cho hồi hoặc tăng điểm ngầm
                            p2p.playersData[idx].isDead = true;
                            p2p.playersData[idx].hp = 0;
                        } else {
                            p2p.playersData[idx].score     = data.score;
                            p2p.playersData[idx].roomCount = data.roomCount;
                            p2p.playersData[idx].hp        = data.hp;
                            p2p.playersData[idx].isDead    = data.isDead;
                        }
                        if (data.name && data.name.trim()) p2p.playersData[idx].name = data.name.trim();
                    }
                }
            });
            conn.on('close', () => {
                p2p.playersData = p2p.playersData.filter(p => p.peerId !== conn.peer);
                p2p.connections = p2p.connections.filter(c => c.peer  !== conn.peer);
                renderLobbyP2P();
                p2p.connections.forEach(c => { if(c.open) c.send({ type: 'LOBBY_UPDATE', players: p2p.playersData }); });
            });
        });
    };


    // ─── 3. VÁ LỖI 2: KHÁCH (CLIENT) NHẬP MÃ BỊ TREO, CHỦ PHÒNG KHÔNG THẤY VÀO ───


    // ─── 4. PHÒNG VỆ LUỒNG ĐỒNG BỘ TRONG TRẬN ───
    const oldStartRealGamePhase41 = window.startRealGame;
    window.startRealGame = function() {
        if (typeof oldStartRealGamePhase41 === 'function') oldStartRealGamePhase41();
        
        // Sửa lỗi gửi gói tin lên kết nối đã chết gây crash luồng game realtime
        if (p2p.isHost && p2p.syncInterval) {
            clearInterval(p2p.syncInterval);
            p2p.syncInterval = setInterval(() => {
                if (gameState.status !== 'PLAYING') return;
                let myData = p2p.playersData[0];
                if (myData) {
                    myData.score = playerState.score;
                    myData.roomCount = playerState.roomCount;
                    myData.hp = playerState.hp;
                    myData.isDead = (playerState.hp <= 0);
                }
                p2p.connections.forEach(conn => {
                    if (conn && conn.open) { // Phòng vệ defensive: Chỉ bắn dữ liệu khi kết nối thật sự mở
                        conn.send({ type: 'LEADERBOARD_UPDATE', ranking: p2p.playersData });
                    }
                });
                rankingState = p2p.playersData;
            }, 1500);
        }
    };


    // ─── 5. XÓA NÚT TẠO PHÒNG & THAY THẾ BẰNG NÚT ADMIN SANG TRỌNG ───
    function runHomeButtonsRestyleEngine() {
        const btnCreate = document.getElementById('btn-create-room');
        const btnAdmin = document.getElementById('btn-goto-admin');
        const btnJoin = document.getElementById('btn-join-room');

        // 5.1 Loại bỏ vĩnh viễn nút Tạo phòng thủ công bị lỗi thời ra khỏi luồng render UI
        if (btnCreate) {
            btnCreate.remove();
        }

        // 5.2 Di chuyển nút [Cài đặt Admin] lên làm nút chính bên cạnh nút [Vào phòng]
        if (btnAdmin && btnJoin && btnAdmin.nextElementSibling !== btnJoin && btnJoin.nextElementSibling !== btnAdmin) {
            // Thiết lập phong cách UI đồng bộ, sang trọng cho ô cấu hình Admin thay thế
            btnAdmin.style.fontSize = '16px';
            btnAdmin.style.padding = '12px 20px';
            btnAdmin.style.backgroundColor = '#8b5cf6'; // Đồng bộ màu tím thương hiệu của cụm Host hệ thống cũ
            btnAdmin.style.color = '#fff';
            btnAdmin.style.margin = '5px';
            btnAdmin.style.borderRadius = 'var(--border-radius)';
            btnAdmin.style.fontWeight = 'bold';
            btnAdmin.style.cursor = 'pointer';
            btnAdmin.style.display = 'inline-block';
            btnAdmin.innerText = '⚙️ Cài đặt Admin (Tạo Phòng)';

            // Đưa nút Admin lên vị trí đắc địa ngay trước nút Vào Phòng
            btnJoin.parentNode.insertBefore(btnAdmin, btnJoin);
            
            // Xóa bỏ các thẻ <br> rác thừa để hàng nút nằm ngang đẹp mắt
            let brElements = btnJoin.parentNode.querySelectorAll('br');
            brElements.forEach(br => br.remove());
        }
    }

    // Thiết lập tiến trình tuần tra (Polling loop) chạy ngầm liên tục để ép giao diện luôn giữ đúng cấu trúc nút mới
    setInterval(runHomeButtonsRestyleEngine, 250);

})();
// ============================================ //
