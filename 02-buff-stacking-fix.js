// HỢP ĐỒNG TRÒ CHƠI v1 - GIAI ĐOẠN 18

(function() {
// PHỤ THUỘC TRẠNG THÁI TRUNG TÂM:
// playerState.equipments, playerState.activeBuffs, gameState.timer, equipmentDefs
// getEquipmentBuffSum(), applyBuffTick(), renderUIState() (Global overrides)
// --- 1. SỬA LỖI CỘNG DỒN ĐA TẦNG CỦA TRANG BỊ BỊ ĐỘNG & THỜI GIAN THEO VÒNG ---

// Ghi đè hoàn toàn bộ tính toán Buff để quét số lượng trang bị cộng dồn chính xác
window.getEquipmentBuffSum = function(type) {
    let sum = 0;
    
    // Tính Buff Điểm Số (score)
    if (type === 'score') {
        // Đếm số Đao Ngắn đang sở hữu thực tế trong rương đồ để nhân chuỗi tỉ lệ (Mỗi cây +20%)
        let shortSwordCount = playerState.equipments.filter(id => id === 'short_sword').length;
        sum += shortSwordCount * 20;
        
        // Duyệt toàn bộ danh sách các Buff tạm thời đang hoạt động (Càng nhiều trang bị kích hoạt cùng loại càng tăng cấp cộng dồn)
        playerState.activeBuffs.forEach(buff => {
            if (buff.id === 'cursed_mask') sum -= 50;
            if (buff.id === 'lucky_star') sum += 50; // 2 Ngôi sao may mắn tích lũy cộng dồn thành +100% điểm
            if (buff.id === 'pumpkin') sum += 100;
        });
    } 
    // Tính toán Sát Thương Nhận Vào (damage)
    else if (type === 'damage') {
        playerState.activeBuffs.forEach(buff => {
            if (buff.id === 'pumpkin') sum += 100; // Hiệu ứng Bí Ngô tăng sát thương gánh chịu
        });
    }
    
    return sum;
};

// Ghi đè tiến trình Đếm bước vòng của Buff - Giải quyết triệt để lỗi vật phẩm vòng không biến mất khỏi kho đồ

// Ghi đè kết xuất giao diện Kho đồ hiển thị để gom nhóm số lượng trang bị trùng nhau trực quan


// --- 2. XỬ LÝ LƯỢNG SỬ DỤNG CHO SÚNG LỤC (BẮN ĐA LẦN KHI CÓ NHIỀU SÚNG) ---
function patchPistolActionSkill() {
    let pistolBtn = document.getElementById('btn-skill-pistol');
    if (!pistolBtn) return;

    // Nhân bản Node để triệt tiêu hoàn toàn listener cũ tránh xung đột logic xếp chồng câu hỏi
    let newPistolBtn = pistolBtn.cloneNode(true);
    pistolBtn.parentNode.replaceChild(newPistolBtn, pistolBtn);

    newPistolBtn.addEventListener('click', () => {
        // Kiểm tra trực tiếp số lượng súng lục còn lại trong túi đồ thực tế
        let currentPistolCount = playerState.equipments.filter(id => id === 'pistol').length;
        if (currentPistolCount <= 0) return;
        
        if (isCurrentRoomBoss) {
            alert("⚠️ Không thể dùng Súng Lục lên Boss!");
            return;
        }

        // Tiêu hao chính xác một chiếc Súng Lục khỏi túi đồ người chơi
        let itemIndex = playerState.equipments.indexOf('pistol');
        if (itemIndex !== -1) {
            playerState.equipments.splice(itemIndex, 1);
        }

        // Kích hoạt hiệu ứng tiêu diệt mục tiêu quái thường
        playerState.score += 100;
        playerState.roomCount++;
        
        if (activeQuestion) {
            playerState.failedQuestions = playerState.failedQuestions.filter(q => q.id !== activeQuestion.id);
        }

        applyBuffTick(); // Chuyển phòng tính toán bước nhảy hiệu ứng
        generateRoom();  // Tạo lập phòng tiếp theo
    });
}

// Khởi chạy nạp đè sự kiện bắn súng lục ngay lập tức
patchPistolActionSkill();


// --- 3. VÁ LẠI HIỆU ỨNG PANIC TIMER KHẨN CẤP (CHỈ KÍCH HOẠT TRONG 20 GIÂY CUỐI CÙNG) ---
const oldRenderUIState = window.renderUIState;

// Thực thi cập nhật giao diện để đồng bộ hóa kho vật phẩm ngay lập tức tại màn hình sảnh chờ

})();
// ============================================ // 
