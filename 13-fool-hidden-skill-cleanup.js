// HỢP ĐỒNG TRÒ CHƠI v1 - GIAI ĐOẠN 34

(function() {
    // PHỤ THUỘC TRẠNG THÁI TRUNG TÂM:
    // characterDefs, renderCharacterSelectionUI

    // CHUYỂN HIỆU ỨNG HỒI SINH CỦA GÃ KHỜ THÀNH KĨ NĂNG ẨN TUYỆT ĐỐI (XÓA CHÚ THÍCH CÔNG KHAI TẠI SẢNH CHỌN)
    if (typeof characterDefs !== 'undefined' && characterDefs.fool) {
        // Khôi phục lại phần mô tả nội tại cốt lõi, ẩn đi thông tin clan hỗ trợ hồi sinh 10% để làm kĩ năng bí mật
        characterDefs.fool.desc = 'Nội tại: Luôn loại bỏ 1 đáp án sai.';
    }

    // Ép cập nhật và kết xuất lại giao diện chọn nhân vật tại sảnh chờ ngay lập tức để làm sạch văn bản hiển thị
    if (typeof renderCharacterSelectionUI === 'function') {
        renderCharacterSelectionUI();
    }

})();
// ============================================ // 
