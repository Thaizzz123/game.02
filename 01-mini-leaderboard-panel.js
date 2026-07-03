// HỢP ĐỒNG TRÒ CHƠI v1 - GIAI ĐOẠN 40 (39 là phần trước đó)
(function() {
    // PHỤ THUỘC TRẠNG THÁI TRUNG TÂM:
    // playerState  → .score, .roomCount, .character
    // gameState    → .bots[] (.name, .score, .roomCount), .status
    // renderUIState (ghi đè để cập nhật realtime)

    // ─── 1. CSS PANEL + TAB ───────────────────────────────────────────
    const css = `
        /* Tab toggle luôn hiển thị ở cạnh phải */
        #mlb-tab {
            position: absolute;
            right: 0;
            top: 50%;
            transform: translateY(-50%);
            width: 22px;
            height: 64px;
            background: #0f3460;
            border: 1px solid #1a5b9c;
            border-right: none;
            border-radius: 6px 0 0 6px;
            cursor: pointer;
            z-index: 200;
            display: none;              /* chỉ hiện khi đang PLAYING */
            align-items: center;
            justify-content: center;
            writing-mode: vertical-rl;
            font-size: 11px;
            color: #fbbf24;
            font-weight: bold;
            letter-spacing: 1px;
            user-select: none;
            transition: background 0.15s;
        }
        #mlb-tab:hover { background: #1a5b9c; }
        #mlb-tab.mlb-visible { display: flex; }

        /* Panel xếp hạng – ẩn bằng cách trượt ra ngoài phải */
        #mlb-panel {
            position: absolute;
            right: -162px;             /* ẩn ngoài app (overflow:hidden tự clip) */
            top: 0;
            bottom: 0;
            width: 160px;
            background: rgba(15, 23, 42, 0.93);
            border-left: 2px solid #1a5b9c;
            z-index: 199;
            display: none;             /* chỉ hiện khi PLAYING */
            flex-direction: column;
            padding: 10px 8px;
            box-sizing: border-box;
            transition: right 0.28s cubic-bezier(0.4,0,0.2,1);
            overflow: hidden;
        }
        #mlb-panel.mlb-visible { display: flex; }
        #mlb-panel.mlb-open    { right: 22px; } /* trượt vào, sát tab */

        #mlb-title {
            font-size: 11px;
            font-weight: bold;
            color: #e94560;
            text-align: center;
            margin-bottom: 8px;
            letter-spacing: 0.5px;
            border-bottom: 1px solid #334155;
            padding-bottom: 5px;
            flex-shrink: 0;
        }

        #mlb-list {
            flex: 1;
            overflow-y: auto;
            overflow-x: hidden;
            scrollbar-width: thin;
            scrollbar-color: #334155 transparent;
        }

        .mlb-row {
            display: flex;
            flex-direction: column;
            padding: 5px 4px;
            margin-bottom: 4px;
            border-radius: 4px;
            border-left: 3px solid #334155;
            background: rgba(30,41,59,0.7);
            font-size: 10px;
            line-height: 1.45;
            transition: background 0.2s;
        }
        .mlb-row.mlb-you {
            border-left-color: #10b981;
            background: rgba(16,185,129,0.12);
        }
        .mlb-row.mlb-top1  { border-left-color: #f59e0b; }
        .mlb-row.mlb-top2  { border-left-color: #94a3b8; }
        .mlb-row.mlb-top3  { border-left-color: #b45309; }

        .mlb-rank-name {
            display: flex;
            align-items: center;
            gap: 4px;
            font-weight: bold;
            color: #e2e8f0;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
        .mlb-badge {
            font-size: 9px;
            background: #1e293b;
            border-radius: 3px;
            padding: 0 3px;
            color: #fbbf24;
            flex-shrink: 0;
        }
        .mlb-stats {
            color: #94a3b8;
            margin-top: 2px;
            font-size: 9.5px;
        }
        .mlb-score-val { color: #fbbf24; font-weight: bold; }
    `;
    const styleTag = document.createElement('style');
    styleTag.textContent = css;
    document.head.appendChild(styleTag);

    // ─── 2. HTML VÀO #app ────────────────────────────────────────────
    const appEl = document.getElementById('app');

    const tabEl = document.createElement('div');
    tabEl.id = 'mlb-tab';
    tabEl.title = 'Bảng xếp hạng realtime';
    tabEl.innerHTML = '▶';
    appEl.appendChild(tabEl);

    const panelEl = document.createElement('div');
    panelEl.id = 'mlb-panel';
    panelEl.innerHTML = `
        <div id="mlb-title">🏆 XẾP HẠNG REALTIME</div>
        <div id="mlb-list"></div>
    `;
    appEl.appendChild(panelEl);

    // ─── 3. TOGGLE LOGIC ─────────────────────────────────────────────
    let _mlbOpen = false;

    tabEl.addEventListener('click', () => {
        _mlbOpen = !_mlbOpen;
        if (_mlbOpen) {
            panelEl.classList.add('mlb-open');
            tabEl.innerHTML = '◀';
        } else {
            panelEl.classList.remove('mlb-open');
            tabEl.innerHTML = '▶';
        }
    });

    // ─── 4. HÀM RENDER XẾP HẠNG ─────────────────────────────────────
    const rankMedals = ['🥇', '🥈', '🥉'];

    function _renderMiniLeaderboard() {
        // Chỉ hiển thị khi đang chơi
        const isPlaying = (gameState.status === 'PLAYING');
        tabEl.classList.toggle('mlb-visible', isPlaying);
        panelEl.classList.toggle('mlb-visible', isPlaying);
        if (!isPlaying) return;

        // Gộp player + bots thành danh sách chuẩn
        const entries = [];

        entries.push({
            name: 'Bạn',
            score: playerState.score,
            roomCount: playerState.roomCount,
            isPlayer: true
        });

        (gameState.bots || []).forEach(bot => {
            entries.push({
                name: bot.name || 'Bot',
                score: bot.score || 0,
                roomCount: bot.roomCount || 1,
                isPlayer: false
            });
        });

        // Sắp xếp theo điểm giảm dần, cùng điểm thì theo phòng
        entries.sort((a, b) => b.score - a.score || b.roomCount - a.roomCount);

        const listEl = document.getElementById('mlb-list');
        if (!listEl) return;

        // Chỉ hiển thị tối đa 8 người để không scroll nhiều
        const topEntries = entries.slice(0, 8);

        listEl.innerHTML = topEntries.map((e, idx) => {
            const rankClass = idx === 0 ? 'mlb-top1' : idx === 1 ? 'mlb-top2' : idx === 2 ? 'mlb-top3' : '';
            const youClass  = e.isPlayer ? 'mlb-you' : '';
            const badge     = e.isPlayer ? '<span class="mlb-badge">BẠN</span>' : '';
            const medal     = rankMedals[idx] || `<span style="color:#64748b;font-size:9px;">#${idx+1}</span>`;
            const nameShort = e.name.length > 9 ? e.name.slice(0, 9) + '…' : e.name;

            return `
                <div class="mlb-row ${rankClass} ${youClass}">
                    <div class="mlb-rank-name">
                        ${medal}&nbsp;${nameShort}${badge}
                    </div>
                    <div class="mlb-stats">
                        <span class="mlb-score-val">⭐${e.score}</span>
                        &nbsp;·&nbsp;P${e.roomCount}
                    </div>
                </div>
            `;
        }).join('');
    }

    // ─── 5. HOOK VÀO renderUIState ───────────────────────────────────
    const _prevRenderUIState = window.renderUIState;
    window.renderUIState = function() {
        if (typeof _prevRenderUIState === 'function') _prevRenderUIState();
        _renderMiniLeaderboard();
    };

})();
// ============================================ //
