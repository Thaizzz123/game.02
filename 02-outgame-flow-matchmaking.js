// ─── OUT-GAME FLOW ───

const btnMatchmake = document.getElementById('btn-matchmake');
const btnLobbyStart = document.getElementById('btn-lobby-start');
const lobbyPlayersList = document.getElementById('lobby-players-list');
const lobbyCount = document.getElementById('lobby-count');


// Bắt đầu ghép trận
btnMatchmake.addEventListener('click', startMatchmaking);

function startMatchmaking() {
    if (!playerState.character) return; // Chặn nếu chưa chọn nhân vật
    
    gameState.status = 'MATCHMAKING';
    changeScreen('screen-matchmaking');
    
    // Mô phỏng thời gian ghép trận 2 giây cho giống game thật
    setTimeout(() => {
        generateBots();
        joinLobby();
    }, 2000);
}

// Hàm sinh 9 Bot ảo
function generateBots() {
    gameState.bots = [];
    const charKeys = ['gambler', 'madman', 'fool', 'guard', 'scholar'];
    
    // Đảo ngẫu nhiên mảng tên để Bot không bị trùng tên
    let availableNames = [...botNames].sort(() => 0.5 - Math.random());

    for (let i = 0; i < 9; i++) {
        let randomChar = charKeys[Math.floor(Math.random() * charKeys.length)];
        gameState.bots.push({
            id: 'bot_' + i,
            name: availableNames[i] || 'Bot_' + i,
            character: randomChar,
            score: 0, // Điểm của bot sẽ tăng dần theo logic ở màn chơi
            roomCount: 1,
            hp: characterDefs[randomChar].baseHp
        });
    }
}

// Chuyển vào Sảnh Chờ


// Bắt đầu game từ Sảnh Chờ (Admin/Hệ thống bấm)
btnLobbyStart.addEventListener('click', startGame);

function startGame() {
    gameState.status = 'PLAYING';
    
    // Khởi tạo thông số máu, điểm,... thực tế
    initRealPlayerState();
    
    // Chuyển sang màn hình Game
    changeScreen('screen-game');
    
    // Gọi vòng lặp Game (Sẽ được định nghĩa ở PHẦN 4)
    if (typeof generateRoom === 'function') {
        startGameLoop(); // Hàm bao bọc timer và generateRoom của Phần 4
    } else {
        console.warn("Đang chờ PHẦN 4 tải logic vòng lặp gameplay...");
        document.getElementById('ui-question-text').innerText = "[Chờ code PHẦN 4 để load Phòng và Câu hỏi...]";
    }
}

// Cài đặt thông số cho Player khi thực sự bước vào game
function initRealPlayerState() {
    let actualCharacterId = playerState.character;
    let extraHp = 0;

    // Xử lý logic cứng: Random thân phận
    if (actualCharacterId === 'random') {
        const charKeys = ['gambler', 'madman', 'fool', 'guard', 'scholar'];
        actualCharacterId = charKeys[Math.floor(Math.random() * charKeys.length)];
        extraHp = 100; // Buff cộng thêm 100 máu của hệ Random
        alert(`Hệ thống đã chọn ngẫu nhiên cho bạn thân phận: ${characterDefs[actualCharacterId].name} (+100 HP)`);
    }

    // Set lại toàn bộ State sạch sẽ
    playerState.character = actualCharacterId; // Ghi đè ID nếu vừa quay random
    playerState.hp = characterDefs[actualCharacterId].baseHp + extraHp;
    playerState.score = 0;
    playerState.roomCount = 1;
    playerState.equipments = [];
    playerState.activeBuffs = [];
    playerState.failedQuestions = [];
    playerState.isPistolReady = false;
    playerState.isGambleActive = false;
    playerState.gambleCooldown = 0;
    playerState.bossRoomsRemaining = 0;
    playerState._scholarBonusApplied = false; // Reset cờ chống nhân đôi điểm lặp lại của Học Bá mỗi trận mới

    // Reset thời gian
    gameState.timer = 360; // 6 phút (360 giây)
}
