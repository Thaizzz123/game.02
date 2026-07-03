// ─── REAL MULTIPLAYER (PEERJS P2P) ───

// 1. Nhúng thư viện PeerJS tự động vào đầu file
const scriptPeer = document.createElement('script');
scriptPeer.src = "https://unpkg.com/peerjs@1.5.2/dist/peerjs.min.js";
document.head.appendChild(scriptPeer);

// 2. State quản lý mạng
let p2p = {
    peer: null,
    isHost: false,
    roomId: '',
    connections: [], // Dành cho Host: mảng lưu các kết nối từ client
    hostConn: null,  // Dành cho Client: kết nối tới Host
    playersData: [], // Lưu thông tin realtime của tất cả người trong phòng
    syncInterval: null
};

// 3. Chờ PeerJS tải xong thì vẽ lại giao diện HOME
scriptPeer.onload = () => {
    console.log("🚀 PeerJS Loaded. Kích hoạt chế độ Multiplayer.");
    
    // Ẩn nút "Ghép trận" fake cũ
    document.getElementById('btn-matchmake').style.display = 'none';

    // Tạo cụm nút Multiplayer mới
    const multiplayUI = document.createElement('div');
    multiplayUI.innerHTML = `
        <button id="btn-create-room" style="background-color: #8b5cf6;">👑 Tạo Phòng (Host)</button>
        <button id="btn-join-room" style="background-color: #10b981;">🎮 Vào Phòng</button>
    `;
    document.getElementById('btn-matchmake').parentElement.insertBefore(multiplayUI, document.getElementById('btn-matchmake'));

    // Gắn sự kiện
    document.getElementById('btn-create-room').addEventListener('click', hostCreateRoom);
    document.getElementById('btn-join-room').addEventListener('click', clientJoinRoom);
};

// --- LOGIC CỦA CHỦ PHÒNG (HOST) ---


function broadcastLobbyState() {
    p2p.connections.forEach(conn => conn.send({ type: 'LOBBY_UPDATE', players: p2p.playersData }));
}

// Ghi đè nút Bắt đầu Game của Host
document.getElementById('btn-lobby-start').addEventListener('click', () => {
    if(!p2p.isHost) return; // Client không bấm được
    
    // Bắn lệnh bắt đầu và quăng bộ câu hỏi cho tất cả Client
    p2p.connections.forEach(conn => conn.send({ 
        type: 'START_GAME', 
        qBank: questionBank 
    }));
    
    startRealGame();
});


// --- LOGIC CỦA NGƯỜI CHƠI BÌNH THƯỜNG (CLIENT) ---


// Render Sảnh chờ cho cả Host và Client


// --- ĐỒNG BỘ TRONG GAME ---
function startRealGame() {
    gameState.status = 'PLAYING';
    initRealPlayerState();
    changeScreen('screen-game');
    
    // Ghi đè hàm simulateBots của Phase 4, vì giờ xài người thật
    window.simulateBots = function() {}; 

    // Mở vòng lặp đồng bộ dữ liệu (Client -> Host -> Mọi người)
    p2p.syncInterval = setInterval(() => {
        if (gameState.status !== 'PLAYING') return;

        // Cập nhật State bản thân vào biến tổng (nếu là Host)
        if (p2p.isHost) {
            let myData = p2p.playersData[0];
            myData.score = playerState.score;
            myData.roomCount = playerState.roomCount;
            myData.hp = playerState.hp;
            myData.isDead = (playerState.hp <= 0);
            
            // Xóa người chết khỏi danh sách sống để tối ưu, hoặc giữ lại làm bảng xếp hạng
            // Host tổng hợp và gửi Bảng xếp hạng realtime cho mọi người
            p2p.connections.forEach(conn => conn.send({ type: 'LEADERBOARD_UPDATE', ranking: p2p.playersData }));
            
            // Host tự cập nhật rank state của mình
            rankingState = p2p.playersData;
        } 
        // Client gửi thông số của mình lên Host
        else if (p2p.hostConn && p2p.hostConn.open) {
            p2p.hostConn.send({
                type: 'SYNC_STATE',
                score: playerState.score,
                roomCount: playerState.roomCount,
                hp: playerState.hp,
                isDead: (playerState.hp <= 0)
            });
        }
    }, 1500); // Cập nhật mỗi 1 giây

    startGameLoop(); // Hàm này của Phần 4 vẫn giữ nguyên
}

// Ghi đè hàm endGame để show Bảng Xếp Hạng Multiplayer

// Ghi đè hàm render Leaderboard một chút để tương thích data mạng
const originalRenderLeaderboard = window.renderLeaderboard;
