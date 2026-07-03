// HỢP ĐỒNG TRÒ CHƠI v1 - GIAI ĐOẠN 42 (41 là phần trước đó)
(function() {
    // Tăng cỡ chữ câu hỏi lên 1.5x (18px -> 27px) + in đậm
    // Override inline style bằng !important để không bị ghi đè
    var styleEl = document.createElement('style');
    styleEl.id = 'style-phase42-question-size';
    styleEl.textContent = [
        '#ui-question-text {',
        '    font-size: 27px !important;',
        '    font-weight: bold !important;',
        '    line-height: 1.6 !important;',
        '}',
    ].join('\n');
    document.head.appendChild(styleEl);

})();
// ============================================ //
