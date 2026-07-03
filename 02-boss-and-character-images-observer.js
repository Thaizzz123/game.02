// ─── THE VISUAL & ADMIN OBSERVER UPDATE ───

// --- 1. TIÊM THÊM CSS HIỆU ỨNG VÀ MÔ HÌNH ---
const fxStyles = `
    <style>
        /* Hiệu ứng rung lắc khi nhận sát thương */
        @keyframes shake { 0% { transform: translateX(0); } 25% { transform: translateX(-10px) rotate(-2deg); } 50% { transform: translateX(10px) rotate(2deg); } 75% { transform: translateX(-10px) rotate(-2deg); } 100% { transform: translateX(0); } }
        .shake-anim { animation: shake 0.3s ease-in-out; border: 2px solid var(--btn-danger) !important; }
        
        /* Hiệu ứng sảnh chờ sôi động */
        @keyframes pulseLobby { 0% { text-shadow: 0 0 5px #10b981; } 50% { text-shadow: 0 0 20px #10b981, 0 0 30px #10b981; } 100% { text-shadow: 0 0 5px #10b981; } }
        .lobby-glow-text { animation: pulseLobby 2s infinite; font-weight: bold; }
        
        /* Chỉnh lại avatar cho đẹp */
        .char-img-select { background: #1e293b; padding: 2px; }
        .avatar { background: #1e293b; padding: 2px; box-shadow: 0 0 8px #10b981; }
        
        /* Kỹ năng xuất hiện mượt mà */
        @keyframes popIn { from { transform: scale(0.8); opacity: 0; } to { transform: scale(1); opacity: 1; } }
        .skill-btn-anim { animation: popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
    </style>
`;
document.head.insertAdjacentHTML("beforeend", fxStyles);

// --- 2. CẬP NHẬT HÌNH ẢNH MÔ HÌNH (DICEBEAR & ROBOHASH) ---
// Nhân vật phong cách phiêu lưu (Adventurer)
characterDefs.gambler.img = 'https://api.dicebear.com/7.x/adventurer/svg?seed=Felix&backgroundColor=c0aede';
characterDefs.madman.img = 'https://api.dicebear.com/7.x/adventurer/svg?seed=Jack&backgroundColor=ffdfbf';
characterDefs.fool.img = 'https://api.dicebear.com/7.x/adventurer/svg?seed=Bandit&backgroundColor=b6e3f4';
characterDefs.guard.img = 'https://api.dicebear.com/7.x/adventurer/svg?seed=Leo&backgroundColor=c0aede';
characterDefs.scholar.img = 'https://api.dicebear.com/7.x/adventurer/svg?seed=Jude&backgroundColor=b6e3f4';
characterDefs.random.img = 'https://api.dicebear.com/7.x/adventurer/svg?seed=Random&backgroundColor=d1d5db';

// Trang bị (Sử dụng icon hệ thống)
equipmentDefs.short_sword.img = 'https://api.dicebear.com/7.x/icons/svg?seed=sword&icon=sword';
equipmentDefs.fishing_rod.img = 'https://api.dicebear.com/7.x/icons/svg?seed=rod&icon=anchor';
equipmentDefs.pistol.img = 'https://api.dicebear.com/7.x/icons/svg?seed=gun&icon=crosshair';
equipmentDefs.cursed_mask.img = 'https://api.dicebear.com/7.x/icons/svg?seed=mask&icon=eye';
equipmentDefs.ocean_heart.img = 'https://api.dicebear.com/7.x/icons/svg?seed=heart&icon=heart';
equipmentDefs.lucky_star.img = 'https://api.dicebear.com/7.x/icons/svg?seed=star&icon=star';
equipmentDefs.pumpkin.img = 'https://api.dicebear.com/7.x/icons/svg?seed=pumpkin&icon=cloud-lightning';

// Quái vật & Boss (Dùng Robohash set 2 - Quái vật không gian/yêu tinh)
let imgBossBase = 'https://robohash.org/boss.png?set=set2&size=200x200&bgset=bg1';


// --- 3. FIX LỖI CHỌN NHÂN VẬT (Bỏ cảnh báo phiền phức) ---


// --- 4. HỆ THỐNG OBSERVER DÀNH CHO ADMIN ---
playerState.isObserver = false; // Cờ đánh dấu Admin

// Ghi đè sự kiện nút Admin
const btnAdminFinal = document.getElementById('btn-goto-admin');
const newBtnAdminFinal = btnAdminFinal.cloneNode(true);
btnAdminFinal.parentNode.replaceChild(newBtnAdminFinal, btnAdminFinal);

newBtnAdminFinal.addEventListener('click', () => {
    let pass = prompt("Nhập mã PIN Admin :");
    if (pass === ADMIN_PASSWORD) {
        playerState.isObserver = true; // Xác nhận chức danh Admin
        changeScreen('screen-admin');
        alert("Xin chào Admin. Vui lòng nạp bộ câu hỏi, hệ thống sẽ TỰ ĐỘNG TẠO PHÒNG sau khi nạp.");
    } else if (pass !== null) {
        alert("Sai mật khẩu!");
    }
});

// Ghi đè nút "Lưu vào Game" ở màn hình Admin để TỰ TẠO PHÒNG
const btnImportFinal = document.getElementById('btn-admin-import');
const newBtnImportFinal = btnImportFinal.cloneNode(true);
btnImportFinal.parentNode.replaceChild(newBtnImportFinal, btnImportFinal);

newBtnImportFinal.addEventListener('click', () => {
    questionBank = [...adminState.tempQuestions];
    document.getElementById('admin-textarea').value = "";
    document.getElementById('admin-log').innerText = "Chưa có dữ liệu.";
    newBtnImportFinal.disabled = true;
    
    // Admin đã nạp xong, tự động host phòng với tư cách quan sát viên
    hostCreateRoomAsObserver();
});


// Ghi đè nút Bắt Đầu ở Lobby
const btnLobbyStartFinal = document.getElementById('btn-lobby-start');
const newBtnLobbyStartFinal = btnLobbyStartFinal.cloneNode(true);
btnLobbyStartFinal.parentNode.replaceChild(newBtnLobbyStartFinal, btnLobbyStartFinal);

newBtnLobbyStartFinal.addEventListener('click', () => {
    if(!p2p.isHost) return;
    
    // Ra lệnh cho mọi Player bắt đầu
    p2p.connections.forEach(conn => conn.send({ type: 'START_GAME', qBank: questionBank }));
    
    if (playerState.isObserver) {
        // Admin bay thẳng ra Bảng Xếp Hạng để xem Realtime
        gameState.status = 'PLAYING';
        changeScreen('screen-result');
        document.querySelector('#screen-result h2').innerText = "BẢNG XẾP HẠNG THỜI GIAN THỰC (ADMIN)";
        document.getElementById('btn-play-again').style.display = 'none'; // Giấu nút chơi lại của Admin
        
        // Vòng lặp bắn BXH cho Client và tự render cho Admin
        p2p.syncInterval = setInterval(() => {
            rankingState = [...p2p.playersData];
            p2p.connections.forEach(conn => conn.send({ type: 'LEADERBOARD_UPDATE', ranking: rankingState }));
            
            // Lấy ID tab hiện tại đang active để render cho đúng
            let currentTab = document.getElementById('tab-room').style.backgroundColor === 'var(--btn-hover)' ? 'room' : 'score';
            renderLeaderboard(currentTab);
        }, 1500);
    } else {
        startRealGame(); // Nếu là Host mà vẫn muốn chơi (phòng khi bạn dùng chức năng host cũ)
    }
});

// Xử lý Client khi vào Lobby không bị trống nếu host là Admin
const originalClientRenderLobby = window.renderLobbyP2P;


// --- 5. LÀM SỐNG ĐỘNG IN-GAME ---

// Ghi đè hàm Load Phòng để render quái ngẫu nhiên liên tục
const oldGenerateRoomPhase8 = window.generateRoom;

// Ghi đè HandleAnswer để thêm hiệu ứng màn hình
const oldHandleAnswerPhase8 = window.handleAnswer;

// Thêm hiệu ứng cho nút skill
if(document.getElementById('btn-skill-pistol')) document.getElementById('btn-skill-pistol').classList.add('skill-btn-anim');
if(document.getElementById('btn-skill-gamble')) document.getElementById('btn-skill-gamble').classList.add('skill-btn-anim');
