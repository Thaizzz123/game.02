// ─── NAME PERSISTENCE & NEW BOSS IMAGE FIX ───

// --- 1. SỬA LỖI MẤT TÊN NGƯỜI CHƠI KHI VÀO TRẬN ---
// Viết lại hàm lấy tên để đảm bảo lúc nào cũng có dữ liệu chuẩn, không bị undefined

// Ghi đè lại luồng bắt đầu game để ép hệ thống đọc lại tên 1 lần nữa ngay trước khi render UI trận đấu
const oldStartRealGamePhase10 = window.startRealGame;
window.startRealGame = function() {
    // Ép lấy tên thật cập nhật vào playerState ngay lập tức
    getValidPlayerName(); 
    
    oldStartRealGamePhase10(); // Chạy luồng khởi tạo game cũ
    
    // Gắn cứng tên lên UI
    let nameUI = document.getElementById('ui-player-name-display');
    if (nameUI) {
        nameUI.innerText = "👤 " + playerState.playerName;
    }
};

// Cập nhật luôn cho lúc Host tạo phòng hoặc Client vào phòng để đồng bộ mạng tốt nhất
const oldHostCreateRoomPhase10 = window.hostCreateRoom;

const oldClientJoinRoomPhase10 = window.clientJoinRoom;


// --- 2. THAY ĐỔI ẢNH BOSS CUỐI (Fix ảnh lỗi, đổi sang Tà Long ảnh động) ---
// Sử dụng ảnh động (GIF) Tà long bóng tối có link cực kỳ ổn định từ máy chủ Showdown
const newBadassBossModel = 'https://play.pokemonshowdown.com/sprites/ani/giratina-origin.gif';

// Ghi đè một phần hàm tạo phòng để cập nhật riêng Boss
const oldGenerateRoomPhase10 = window.generateRoom;
    // ─── CORE NAME PERSISTENCE & LEADERBOARD SAFEGUARD ───

    // 1. Khóa cứng hàm lấy tên từ DOM, chống trả về chuỗi rỗng hoặc undefined

    // 2. Ép cập nhật tên hiển thị liên tục mỗi khi UI trong trận thay đổi
    const oldRenderUIStatePhase12 = window.renderUIState;

    // 3. Vá lỗi đồng bộ tên trong Sảnh chờ Multiplayer (Chống fallback về chuỗi ID cắt ngắn)
    const oldRenderLobbyP2PPhase12 = window.renderLobbyP2P;
    window.renderLobbyP2P = function() {
        if (!p2p.playersData) return;
        
        // Trước khi vẽ sảnh, tìm bản thân trong danh sách mạng để áp tên chuẩn vào
        p2p.playersData.forEach(p => {
            let isMe = (p2p.peer && p.peerId === p2p.peer.id) || (!p2p.isHost && p.peerId === (p2p.peer ? p2p.peer.id : null));
            if (isMe && playerState.playerName) {
                p.name = playerState.playerName; // Khử hoàn toàn chuỗi ID lạ
            }
        });

        // Tái cấu trúc UI danh sách sảnh chờ
        const lobbyPlayersList = document.getElementById('lobby-players-list');
        if (!lobbyPlayersList) return;
        document.getElementById('lobby-count').innerText = p2p.playersData.length;
        lobbyPlayersList.innerHTML = '';

        p2p.playersData.forEach(p => {
            let charDef = characterDefs[p.character];
            let li = document.createElement('li');
            let isMe = (p2p.peer && p.peerId === p2p.peer.id);
            
            if (isMe) li.style.borderLeftColor = '#10b981';
            
            let displayName = p.name;
            if (isMe && !displayName.includes('(BẠN)')) {
                displayName = "👑 " + displayName + " (BẠN)";
            }

            li.innerHTML = `<img src="${charDef.img}" class="avatar"> <strong>${displayName}</strong> - ${charDef.name}`;
            lobbyPlayersList.appendChild(li);
        });
    };

    // 4. Khóa tên ngay trong vòng lặp gửi dữ liệu mạng của Chủ phòng (Host)
    setInterval(() => {
        if (gameState.status === 'PLAYING' && p2p.isHost && p2p.playersData && p2p.playersData.length > 0) {
            // Ép phần tử đầu tiên (Host) luôn phải giữ đúng tên đã đăng ký
            if (playerState.playerName) {
                p2p.playersData[0].name = "👑 " + playerState.playerName;
            }
        }
    }, 500);

    // 5. Viết lại hàm dựng Bảng Xếp Hạng - Sửa triệt để lỗi crash do thiếu thuộc tính peerId khi chơi Offline
