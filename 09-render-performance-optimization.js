// HỢP ĐỒNG TRÒ CHƠI v1 - GIAI ĐOẠN 43 (42 là phần trước đó)
(function() {
    /*
     * PHỤ THUỘC TRẠNG THÁI TRUNG TÂM:
     *   gameState          (Phase 2)  — .status
     *   playerState        (Phase 2)  — .hp, .score, .roomCount
     *   changeScreen       (Phase 2 fn) — override: cached DOM list thay querySelectorAll
     *   renderUIState      (chain: Phase20→40→41) — bọc RAF dedup, tránh multi-write/tick
     *   generateRoom       (chain: Phase4→41) — hook question fade-in mỗi phòng
     *   runHomeButtonsRestyleEngine  (Phase 41 block-2) — short-circuit sau khi setup xong
     *
     * KHÔNG tạo logic mới — chỉ tối ưu hoá hiệu năng rendering hiện có.
     */

    // ─── 1. CSS: GPU PROMOTION + SMOOTH TRANSITIONS ────────────────────
    var _s43 = document.createElement('style');
    _s43.id = 'style-smooth-43';
    _s43.textContent =
        '#game-center{will-change:box-shadow,border-color}\n' +
        '.imm-particle,.toast41{will-change:transform,opacity}\n' +
        '#ui-question-text{will-change:opacity,transform}\n' +
        '@keyframes _sF43{' +
            'from{opacity:0;transform:translateY(5px)}' +
            'to{opacity:1;transform:translateY(0)}' +
        '}\n' +
        '.screen.active{animation:_sF43 0.18s ease forwards!important}\n' +
        '.option-btn{\n' +
        '  transform:translateZ(0);\n' +
        '  transition:background-color 0.12s ease,transform 0.07s ease,' +
                     'border-color 0.12s ease!important\n' +
        '}\n' +
        '.option-btn:active:not(:disabled){transform:scale(0.96) translateZ(0)!important}\n' +
        '@keyframes _qF43{' +
            'from{opacity:0;transform:translateY(5px)}' +
            'to{opacity:1;transform:translateY(0)}' +
        '}\n' +
        '#ui-question-text.q43n{animation:_qF43 0.24s ease forwards!important}\n';
    document.head.appendChild(_s43);

    // ─── 2. DOM CACHE (build 1 lần tại load time) ──────────────────────
    var _dc43 = {
        screens: Array.from(document.querySelectorAll('.screen'))
    };

    // ─── 3. OVERRIDE changeScreen — cached list, bỏ querySelectorAll ───
    window.changeScreen = function(screenId) {
        _dc43.screens.forEach(function(s) { s.classList.remove('active'); });
        var t = document.getElementById(screenId);
        if (t) t.classList.add('active');
    };

    // ─── 4. SHORT-CIRCUIT runHomeButtonsRestyleEngine (Phase 41 block-2) ─
    if (typeof window.runHomeButtonsRestyleEngine === 'function') {
        var _origR43 = window.runHomeButtonsRestyleEngine;
        var _r43done = false;
        window.runHomeButtonsRestyleEngine = function() {
            if (_r43done) return;
            if (!document.getElementById('btn-create-room')) {
                _r43done = true; return;
            }
            _origR43();
            if (!document.getElementById('btn-create-room')) _r43done = true;
        };
        window.runHomeButtonsRestyleEngine();
    }

    // ─── 5. RAF-DEDUP renderUIState ────────────────────────────────────
    var _rafUI43 = false;
    var _prevRUI43 = window.renderUIState;
    window.renderUIState = function() {
        if (_rafUI43) return;
        _rafUI43 = true;
        requestAnimationFrame(function() {
            _rafUI43 = false;
            if (typeof _prevRUI43 === 'function') _prevRUI43();
        });
    };

    // ─── 6. HOOK generateRoom — question text fade-in ──────────────────
    var _prevGR43 = window.generateRoom;
    window.generateRoom = function() {
        var qt = document.getElementById('ui-question-text');
        if (qt) qt.style.opacity = '0';
        if (typeof _prevGR43 === 'function') _prevGR43();
        requestAnimationFrame(function() {
            if (!qt) return;
            qt.style.opacity = '';
            qt.classList.remove('q43n');
            void qt.offsetWidth;
            qt.classList.add('q43n');
        });
    };

})();
// ============================================ //
