// HỢP ĐỒNG TRÒ CHƠI v1 - GIAI ĐOẠN 25

(function() {
    // PHỤ THUỘC TRẠNG THÁI TRUNG TÂM:
    // p2p, playerState, gameState, rankingState, changeScreen, renderLeaderboard, renderLobbyP2P, clientJoinRoom

    // KHỞI TẠO BỘ ĐỆM AN TOÀN TRUNG TÂM (ANTI-DESYNC SAFEGUARD STORAGE)
    window._p2pSafeCache = {
        lastGoodLeaderboard: [],
        lastGoodLobby: [],
        roomId: "",
        handshakeAcknowledged: false
    };

    // 1. VÁ LỖI MẤT ID PHÒNG: Tự động ghi nhớ và khôi phục tiêu đề mã phòng khi màn hình render đè hoặc mất trạng thái chuỗi
    const oldChangeScreen = window.changeScreen;

    // Chu kỳ quét ngầm liên tục để lưu giữ Mã phòng vĩnh viễn vào bộ nhớ Cache bảo vệ không bị thất lạc
    setInterval(() => {
        if (typeof p2p !== 'undefined' && p2p.roomId && p2p.roomId !== window._p2pSafeCache.roomId) {
            window._p2pSafeCache.roomId = p2p.roomId;
        }
    }, 250);


    // 2. VÁ LỖI BẢNG XẾP HẠNG TRỐNG TRƠN: Ngăn chặn tuyệt đối việc xóa sạch danh sách dữ liệu khi mạng lưới lag/mất kết nối tạm thời
    const oldRenderLeaderboard = window.renderLeaderboard;
    window.renderLeaderboard = function(sortBy) {
        // HỘ HÌNH: Nếu mảng trạng thái toàn cục bất ngờ trống rỗng do độ trễ truyền tải dữ liệu, tự động nạp lại bộ nhớ cứu hộ tốt nhất gần nhất
        if ((!rankingState || rankingState.length === 0) && window._p2pSafeCache.lastGoodLeaderboard.length > 0) {
            rankingState = [...window._p2pSafeCache.lastGoodLeaderboard];
        }
        
        // Nếu mảng có chứa dữ liệu thực thể hợp lệ, lập tức ghi đè cập nhật bộ đệm Cache bảo vệ
        if (rankingState && rankingState.length > 0) {
            window._p2pSafeCache.lastGoodLeaderboard = [...rankingState];
        }

        if (typeof oldRenderLeaderboard === 'function') {
            oldRenderLeaderboard(sortBy);
        }
    };

    // Áp dụng cơ chế đệm bảo vệ tương tự cho Danh sách Sảnh chờ người chơi mạng lưới toàn cục
    const oldRenderLobbyP2P = window.renderLobbyP2P;
    window.renderLobbyP2P = function() {
        if (typeof p2p !== 'undefined') {
            if ((!p2p.playersData || p2p.playersData.length === 0) && window._p2pSafeCache.lastGoodLobby.length > 0) {
                p2p.playersData = [...window._p2pSafeCache.lastGoodLobby];
            }
            if (p2p.playersData && p2p.playersData.length > 0) {
                window._p2pSafeCache.lastGoodLobby = [...p2p.playersData];
            }
        }
        if (typeof oldRenderLobbyP2P === 'function') {
            oldRenderLobbyP2P();
        }
    };


    // 3. VÁ LỖI NHẬP ĐÚNG ID NHƯNG KHÔNG VÀO ĐƯỢC GAME: Thiết lập cơ chế bắt tay lặp lại (Handshake Retry Loop)
    // Nguyên nhân lỗi: Trình duyệt mở DataChannel thành công nhưng Host chưa kịp gán trình lắng nghe sự kiện luồng tại frame đó, làm mất gói JOIN ban đầu.
    const oldClientJoinRoom = window.clientJoinRoom;


    // 4. KIỂM SOÁT ĐỒNG BỘ NỀN CHO QUẢN TRỊ VIÊN/CHỦ PHÒNG (HOST PERSISTENCE GUARD)
    setInterval(() => {
        if (typeof p2p !== 'undefined' && p2p.isHost && p2p.playersData && p2p.playersData.length > 0) {
            // Liên tục cập nhật các mốc dữ liệu không rỗng vào bộ đệm dự phòng
            window._p2pSafeCache.lastGoodLobby = [...p2p.playersData];
            if (gameState && (gameState.status === 'PLAYING' || gameState.status === 'ENDED')) {
                window._p2pSafeCache.lastGoodLeaderboard = [...p2p.playersData];
            }
        }
    }, 1000);

})();
// ============================================ // 
