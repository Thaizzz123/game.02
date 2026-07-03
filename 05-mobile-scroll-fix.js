// ─── Cập nhật bổ sung ───
// Mục tiêu: Fix scroll trên mobile cho màn hình game
// Không chạm state, không tạo logic mới

(function () {
    // ── A. INJECT CSS ──────────────────────────────────────────────────────────
    const _p14_style = document.createElement('style');
    _p14_style.textContent = `
        /* PHASE 14: Scrollable game area on mobile */

        /* Wrapper ôm toàn bộ nội dung cuộn được */
        #game-scroll-wrapper {
            flex: 1 1 0;
            overflow-y: auto;
            overflow-x: hidden;
            -webkit-overflow-scrolling: touch; /* smooth scroll iOS */
            display: flex;
            flex-direction: column;
            min-height: 0; /* cần thiết để flex-child scroll được */
        }

        /* game-center bên trong wrapper: bỏ flex-grow, căn top */
        #game-scroll-wrapper #game-center {
            flex-grow: 0 !important;
            flex-shrink: 0 !important;
            justify-content: flex-start !important;
            padding-top: 20px !important;
            padding-bottom: 20px !important;
            min-height: unset !important;
        }

        /* game-bottom và status bar không bị co */
        #game-scroll-wrapper #game-bottom {
            flex-shrink: 0 !important;
        }

        #game-scroll-wrapper #ui-status-bar {
            flex-shrink: 0 !important;
            padding-bottom: 20px !important;
        }

        /* Thanh cuộn đẹp hơn trên desktop */
        #game-scroll-wrapper::-webkit-scrollbar {
            width: 4px;
        }
        #game-scroll-wrapper::-webkit-scrollbar-track {
            background: transparent;
        }
        #game-scroll-wrapper::-webkit-scrollbar-thumb {
            background: #334155;
            border-radius: 4px;
        }
    `;
    document.head.appendChild(_p14_style);

    // ── B. CẤU TRÚC LẠI DOM: BỌC CONTENT VÀO WRAPPER CUỘN ĐƯỢC ───────────────
    function _p14_setupGameScroll() {
        const screenGame   = document.getElementById('screen-game');

        // Chặn chạy 2 lần
        if (!screenGame || document.getElementById('game-scroll-wrapper')) return;

        const gameTop      = document.getElementById('game-top');
        const gameCenter   = document.getElementById('game-center');
        const gameBottom   = document.getElementById('game-bottom');
        const statusBar    = document.getElementById('ui-status-bar');

        // Tìm div súng lục (phần tử ngay sau #game-top)
        const pistolArea   = gameTop ? gameTop.nextElementSibling : null;

        if (!gameCenter || !gameBottom) {
            return;
        }

        // Tạo wrapper
        const wrapper = document.createElement('div');
        wrapper.id = 'game-scroll-wrapper';

        // Chèn wrapper vào đúng vị trí (sau game-top, trước pistolArea nếu có)
        if (pistolArea && pistolArea !== gameCenter) {
            // pistolArea tồn tại và chưa phải game-center → đưa vào wrapper trước
            screenGame.insertBefore(wrapper, pistolArea);
            wrapper.appendChild(pistolArea);
        } else {
            // Không có pistolArea riêng → chèn trước game-center
            screenGame.insertBefore(wrapper, gameCenter);
        }

        // Di chuyển các phần tử chính vào wrapper
        wrapper.appendChild(gameCenter);
        wrapper.appendChild(gameBottom);
        if (statusBar) wrapper.appendChild(statusBar);

    }

    // Chạy sau khi DOM sẵn sàng
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', _p14_setupGameScroll);
    } else {
        _p14_setupGameScroll();
    }

})();
// ============================================ // 
