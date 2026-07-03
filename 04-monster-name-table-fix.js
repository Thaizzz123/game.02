// HỢP ĐỒNG TRÒ CHƠI v1 - GIAI ĐOẠN 39 (38 là phần trước đó)
(function() {
    // PHỤ THUỘC TRẠNG THÁI TRUNG TÂM:
    // playerState, gameState, isCurrentRoomBoss, activeQuestion, questionBank,
    // roomStartTime, renderQuestion, renderUIState, window.renderVectorCharacterHTML

    // --- NGUYÊN NHÂN LỖI GIAI ĐOẠN 38 ---
    // Giai đoạn 38 tham chiếu biến `vectorMonsterDatabase` vốn được khai báo bằng `const`
    // bên trong IIFE đóng kín của Giai đoạn 27. Stage 38 chạy trong closure riêng nên
    // không thể truy cập → ReferenceError thầm lặng → generateRoom bị gãy toàn bộ
    // → game rơi về hành vi cũ có bug (boss xuất hiện ở phòng thường).
    // FIX: Giai đoạn 39 tự duy trì bảng tên quái nội bộ, KHÔNG tham chiếu vectorMonsterDatabase.

    // --- BẢNG TÊN NỘI BỘ: Khớp 1:1 với vectorMonsterDatabase của Giai đoạn 27 ---
    // Chỉ mục 0-14: Quái thường | Chỉ mục 15-19: Boss siêu cấp
    const _monsterNames = [
        "Tiểu Quỷ Sừng Băng",          // 0
        "Hắc Binh Đội Mũ",              // 1
        "Yêu Tinh Sát Thủ",             // 2
        "Giáp Sĩ Hoàng Kim",            // 3
        "Thợ Săn Bộ Lạc",               // 4
        "Cơ Giáp Tàn Bạo",              // 5
        "Kẻ Nguyền Rủa",                // 6
        "Đại Đội Trưởng Orc",           // 7
        "Lính Đánh Thuê Biển",          // 8
        "Kẻ Kích Nổ Cuồng Loạn",        // 9
        "Hiệp Sĩ Tro Tàn",              // 10
        "Tinh Linh Rừng Sâu",           // 11
        "Sát Thủ Sa Mạc",               // 12
        "Kẻ Trộm Bóng Tối",             // 13
        "Chiến Binh Đầm Lầy",           // 14
        // --- BOSS (chỉ mục 15-19) ---
        "👹 CHÚA TỂ ĐẠI NGỤC (BOSS)",  // 15
        "⚡ THẦN CƠ ĐẾ QUỐC (BOSS)",   // 16
        "🐉 CỔ LONG BĂNG GIÁ (BOSS)",  // 17
        "🔮 PHÙ THỦY HƯ KHÔNG (BOSS)", // 18
        "💥 KHỔNG LỒ DIỆT THẾ (BOSS)"  // 19
    ];

    window.generateRoom = function() {
        if (playerState.hp <= 0 || gameState.timer <= 0) return;

        // 1. PHÂN ĐỊNH BOSS HAY QUÁI THƯỜNG
        // Boss chỉ xuất hiện tại phòng chia hết cho 10 (10,20,30,...) hoặc khi Cần Câu Cá kích hoạt
        isCurrentRoomBoss = (playerState.roomCount % 10 === 0) || (playerState.bossRoomsRemaining > 0);

        let enemyNameUI = document.getElementById('ui-enemy-name');
        let enemyImgUI  = document.getElementById('ui-enemy-img');

        // Giữ nguyên thiết kế Giai đoạn 27: Ẩn ảnh tĩnh cũ, nhường chỗ Vector Art
        if (enemyImgUI) enemyImgUI.classList.add('hidden');

        // Gỡ mesh nhân vật cũ trước khi render thực thể phòng mới
        let oldMesh = document.getElementById('vector-avatar-mesh');
        if (oldMesh) oldMesh.remove();

        // 2. KHÓA CHẶT DOMAIN CHỈ SỐ (KHÔNG PHỤ THUỘC vectorMonsterDatabase NGOÀI SCOPE)
        let currentMonsterIndex = playerState.roomCount - 1; // room 1 → index 0
        let renderIndex;  // Chỉ số thực sự dùng cho renderVectorCharacterHTML
        let monsterName;

        if (isCurrentRoomBoss) {
            // BOSS: chỉ số render nằm trong phân đoạn 15-19
            // renderVectorCharacterHTML nhận bất kỳ số nguyên + isBoss=true, nó tự tính 15 + (index%5)
            // Truyền currentMonsterIndex thô, để hàm tự ánh xạ → đảm bảo nhất quán tên + hình
            renderIndex = currentMonsterIndex;
            let bossSlot = 15 + (currentMonsterIndex % 5);
            monsterName = _monsterNames[bossSlot];

            // Trừ số phòng boss liên tiếp (Cần Câu Cá)
            if (playerState.bossRoomsRemaining > 0) playerState.bossRoomsRemaining--;

        } else {
            // QUÁI THƯỜNG: KHÓA CỨNG trong phân đoạn 0-14, tuyệt đối không chạm 15-19
            renderIndex = currentMonsterIndex % 15;
            monsterName = _monsterNames[renderIndex];
        }

        // 3. THIẾT LẬP TÊN VÀ MÀU TIÊU ĐỀ
        enemyNameUI.innerText = monsterName;
        enemyNameUI.style.color = isCurrentRoomBoss ? "var(--btn-danger)" : "#fbbf24";

        // 4. KÍCH HOẠT KẾT XUẤT MÔ HÌNH VECTOR ART GIAI ĐOẠN 27 (GIỮ NGUYÊN HÌNH ẢNH)
        if (typeof window.renderVectorCharacterHTML === 'function') {
            let renderHTML = window.renderVectorCharacterHTML(renderIndex, isCurrentRoomBoss);
            enemyNameUI.insertAdjacentHTML('afterend', renderHTML);
        }

        // 5. NẠP CÂU HỎI TỪ NGÂN HÀNG (ƯU TIÊN CÂU SÀI NẾU CÓ)
        let sourcePool = questionBank;
        if (playerState.failedQuestions.length > 0 && Math.random() < 0.2) {
            sourcePool = playerState.failedQuestions;
        }
        if (sourcePool.length === 0) sourcePool = questionBank;

        activeQuestion = sourcePool[Math.floor(Math.random() * sourcePool.length)];
        renderQuestion(activeQuestion);
        roomStartTime = Date.now();
        renderUIState();
    };

})();
// ============================================ //
