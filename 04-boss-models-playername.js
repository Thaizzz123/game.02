// ─── BADASS BOSS MODELS & TRUE PLAYER NAME PATCH ───

// --- 1. TIÊM CSS HIỆU ỨNG MÔ HÌNH TRONG SUỐT CỰC NGẦU ---
const modelStyles = `
    <style>
        /* Xóa bỏ viền vuông cũ, thêm hiệu ứng bóng đổ và lơ lửng cho Boss */
        .boss-sprite { 
            width: 220px !important; 
            height: 220px !important; 
            border: none !important; 
            box-shadow: none !important; 
            border-radius: 0 !important;
            filter: drop-shadow(0 0 25px rgba(217, 4, 41, 0.9)); 
            animation: floatBoss 3s ease-in-out infinite;
            object-fit: contain !important;
        }
        
        @keyframes floatBoss {
            0% { transform: translateY(0px) scale(1); }
            50% { transform: translateY(-15px) scale(1.05); }
            100% { transform: translateY(0px) scale(1); }
        }

        /* Quái thường dạng GIF chuyển động */
        .sprite {
            border: none !important;
            box-shadow: none !important;
            border-radius: 0 !important;
            filter: drop-shadow(0 0 10px rgba(251, 191, 36, 0.6));
            transform: scale(1.3);
            object-fit: contain !important;
        }
    </style>
`;
document.head.insertAdjacentHTML("beforeend", modelStyles);

// Tiêm vị trí hiển thị tên ngay trong màn hình chơi Game
if (!document.getElementById('ui-player-name-display')) {
    document.getElementById('game-top').insertAdjacentHTML('beforebegin', '<div id="ui-player-name-display" style="text-align:center; color:#10b981; font-weight:bold; font-size:20px; margin-bottom: 15px; text-transform: uppercase; letter-spacing: 2px; text-shadow: 0 0 8px #10b981;"></div>');
}


// --- 2. HÀM QUẢN LÝ TÊN NGƯỜI CHƠI CHUẨN XÁC ---


// --- 3. ĐỒNG BỘ TÊN VÀO MULTIPLAYER (HOST & CLIENT) ---



// --- 4. HIỂN THỊ TÊN TRONG TRẬN ĐẤU (BẮT ĐẦU GAME) ---
const oldStartRealGamePhase9 = window.startRealGame;
window.startRealGame = function() {
    oldStartRealGamePhase9(); // Chạy logic cũ
    // Gắn tên lên đỉnh màn hình chơi game
    let nameUI = document.getElementById('ui-player-name-display');
    if (nameUI) {
        nameUI.innerText = "👤 " + playerState.playerName;
    }
};


// --- 5. LÀM LẠI MÔ HÌNH QUÁI THÚ VÀ BOSS CỰC NGẦU ---
// Boss: Mô hình Tà Long Mega Charizard Đen Lửa Xanh
const badassBossModel = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/6-mega-x.png';
// Quái thường: Ảnh động GIF quỷ/quái
const animatedMonsterBase = 'https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/showdown/'; 



// --- 6. CẬP NHẬT TÊN NẾU NGƯỜI CHƠI CHƠI CHẾ ĐỘ OFFLINE (CHƠI VỚI BOTS CHỐNG CHÁY) ---
const oldEndGameSingleFallback = window.endGame;
