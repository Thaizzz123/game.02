// ─── GEARS, SKILLS & RANKING ───

// --- 1. HỆ THỐNG RƠI ĐỒ TỪ BOSS ---


// --- 2. TÍNH TỔNG BUFF/DEBUFF (%) ---


// --- 3. CẬP NHẬT TRẠNG THÁI THEO PHÒNG (BUFF TICK) ---


// Cập nhật dòng text hiển thị trang bị ở dưới cùng màn hình Game


// --- 4. KỸ NĂNG KÍCH HOẠT: SÚNG LỤC & ĐÁNH BẠC ---

// Xử lý nút Súng Lục
document.getElementById('btn-skill-pistol').addEventListener('click', () => {
    if (!playerState.isPistolReady) return;
    
    if (isCurrentRoomBoss) {
        alert("⚠️ Không thể dùng Súng Lục lên Boss!");
        return;
    }

    // Tiêu diệt quái thường ngay lập tức
    playerState.score += 100; // Nhận full 100 điểm
    playerState.roomCount++;
    playerState.isPistolReady = false;
    document.getElementById('btn-skill-pistol').classList.add('hidden');
    
    // Nếu đây là câu sai xuất hiện lại, xóa nó khỏi danh sách phạt
    if (activeQuestion) {
        playerState.failedQuestions = playerState.failedQuestions.filter(q => q.id !== activeQuestion.id);
    }

    applyBuffTick(); // Qua phòng nên tính tick
    generateRoom();  // Kéo quái mới
});

// Tiêm (Inject) nút Đánh Bạc vào giao diện vì ở Phần 1 chưa có
let btnGamble = document.createElement('button');
btnGamble.id = 'btn-skill-gamble';
btnGamble.style.marginLeft = '10px';
btnGamble.style.backgroundColor = '#8b5cf6'; // Màu tím cho Con Bạc
btnGamble.classList.add('hidden');
document.getElementById('btn-skill-pistol').parentElement.appendChild(btnGamble);

// Xử lý nút Đánh Bạc
btnGamble.addEventListener('click', () => {
    if (playerState.gambleCooldown > 0 || playerState.isGambleActive) return;
    
    playerState.isGambleActive = true;
    playerState.gambleCooldown = 2; // Hồi sau 2 phòng
    btnGamble.innerText = "🔥 Đang Đánh Bạc (x3 Điểm / x2 Máu)";
    btnGamble.disabled = true;
});

// Vòng lặp siêu nhỏ để liên tục check UI nút Đánh Bạc (Không can thiệp vào timer game)
setInterval(() => {
    if (gameState.status === 'PLAYING' && playerState.character === 'gambler') {
        btnGamble.classList.remove('hidden');
        if (playerState.gambleCooldown > 0) {
            btnGamble.innerText = `🎲 Đánh Bạc (Hồi chiêu: ${playerState.gambleCooldown})`;
            btnGamble.disabled = true;
        } else if (!playerState.isGambleActive) {
            btnGamble.innerText = "🎲 Đánh Bạc (Nhấn trước khi chọn!)";
            btnGamble.disabled = false;
        }
    } else {
        btnGamble.classList.add('hidden');
    }
}, 500);


// --- 5. END GAME & BẢNG XẾP HẠNG ---


// 5.4. Chuyển Tab Bảng Xếp Hạng
document.getElementById('tab-score').addEventListener('click', () => renderLeaderboard('score'));
document.getElementById('tab-room').addEventListener('click', () => renderLeaderboard('room'));

// 5.5. Nút Chơi Lại
document.getElementById('btn-play-again').addEventListener('click', () => {
    playerState.character = null; 
    document.getElementById('btn-matchmake').disabled = true; // Reset nút ghép trận
    // Bỏ highlight nhân vật ở màn hình HOME
    Array.from(document.getElementById('character-selection').children).forEach(b => b.style.backgroundColor = 'var(--btn-primary)');
    
    changeScreen('screen-home');
});
