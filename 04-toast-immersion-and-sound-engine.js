// HỢP ĐỒNG TRÒ CHƠI v1 - GIAI ĐOẠN 41 (40 là phần trước đó)
(function() {
    // PHỤ THUỘC TRẠNG THÁI TRUNG TÂM:
    // playerState → .hp, .score, .roomCount, .equipments, .activeBuffs, .character
    // gameState   → .status
    // isCurrentRoomBoss, activeQuestion
    // characterDefs, equipmentDefs  (global Phase 2)
    // handleAnswer, generateRoom, handleBossDefeat, applyBuffTick, renderUIState

    // ─── 1. CSS: TOAST + IMMERSION EFFECTS ──────────────────────────
    const _css41 = `
        /* TOAST */
        #toast-container-41 {
            position: absolute;
            bottom: 76px;
            left: 10px;
            z-index: 990;
            display: flex;
            flex-direction: column-reverse;
            gap: 5px;
            pointer-events: none;
            max-width: 220px;
        }
        .toast41 {
            padding: 6px 11px;
            border-radius: 6px;
            font-size: 12px;
            font-weight: bold;
            color: #fff;
            opacity: 0;
            transform: translateX(-18px);
            animation: t41In 0.22s ease forwards, t41Out 0.28s ease 2.2s forwards;
            pointer-events: none;
            line-height: 1.4;
            box-shadow: 0 2px 10px rgba(0,0,0,0.45);
            border-left: 3px solid rgba(255,255,255,0.25);
            word-break: break-word;
        }
        .t41-success { background: rgba(16,185,129,0.88); border-left-color: #34d399; }
        .t41-damage  { background: rgba(217,4,41,0.88);   border-left-color: #ff6b6b; }
        .t41-warn    { background: rgba(180,117,9,0.92);  border-left-color: #fcd34d; }
        .t41-info    { background: rgba(15,52,96,0.92);   border-left-color: #60a5fa; }
        .t41-equip   { background: rgba(109,40,217,0.90); border-left-color: #c084fc; }
        .t41-heal    { background: rgba(5,150,105,0.88);  border-left-color: #6ee7b7; }

        @keyframes t41In  { to { opacity: 1; transform: translateX(0); } }
        @keyframes t41Out { to { opacity: 0; transform: translateX(-14px); } }

        /* IMMERSION: HP LOW PULSE */
        @keyframes hpDangerPulse {
            0%,100% { box-shadow: inset 0 0 0 0 rgba(217,4,41,0), border-color: #334155; }
            50%     { box-shadow: inset 0 0 20px 4px rgba(217,4,41,0.22); border-color: #ef4444; }
        }
        #game-center.imm-hp-danger {
            animation: hpDangerPulse 1.05s ease-in-out infinite !important;
            border-color: #7f1d1d !important;
        }

        /* IMMERSION: BOSS AURA */
        @keyframes bossAuraPulse {
            0%,100% { box-shadow: inset 0 0 0 0 rgba(239,68,68,0); }
            50%     { box-shadow: inset 0 0 30px 8px rgba(239,68,68,0.18); }
        }
        #game-center.imm-boss-aura {
            animation: bossAuraPulse 1.7s ease-in-out infinite !important;
            border-color: #7f1d1d !important;
        }

        /* IMMERSION: CORRECT ANSWER FLASH */
        @keyframes correctGlow {
            0%   { box-shadow: inset 0 0 0 0 rgba(16,185,129,0); }
            30%  { box-shadow: inset 0 0 30px 10px rgba(16,185,129,0.35); }
            100% { box-shadow: inset 0 0 0 0 rgba(16,185,129,0); }
        }
        #game-center.imm-correct-flash {
            animation: correctGlow 0.48s ease forwards !important;
        }

        /* IMMERSION: ROOM ENTER TRANSITION */
        @keyframes roomEnter41 {
            from { opacity: 0.3; transform: scale(0.975) translateY(5px); }
            to   { opacity: 1;   transform: scale(1)     translateY(0);   }
        }
        #game-center.imm-room-enter {
            animation: roomEnter41 0.3s ease forwards !important;
        }

        /* IMMERSION: AMBIENT PARTICLES */
        .imm-particle {
            position: absolute;
            border-radius: 50%;
            pointer-events: none;
            opacity: 0;
            animation: immParticleDrift linear infinite;
            z-index: 0;
        }
        @keyframes immParticleDrift {
            0%   { transform: translateY(0)     scale(1);   opacity: 0;    }
            12%  { opacity: 0.38; }
            88%  { opacity: 0.12; }
            100% { transform: translateY(-140px) scale(0.2); opacity: 0; }
        }
    `;
    const _styleEl = document.createElement('style');
    _styleEl.textContent = _css41;
    document.head.appendChild(_styleEl);

    // ─── 2. TOAST CONTAINER ──────────────────────────────────────────
    const _appEl = document.getElementById('app');
    const _toastBox = document.createElement('div');
    _toastBox.id = 'toast-container-41';
    _appEl.appendChild(_toastBox);

    window.showToast = function(msg, type, duration) {
        if (gameState.status !== 'PLAYING') return;
        type     = type     || 'info';
        duration = duration || 2500;

        // Giới hạn 4 toast đồng thời
        const existing = _toastBox.querySelectorAll('.toast41');
        if (existing.length >= 4) existing[0].remove();

        const el = document.createElement('div');
        el.className = 'toast41 t41-' + type;
        el.textContent = msg;
        _toastBox.appendChild(el);
        setTimeout(function() { if (el.parentNode) el.remove(); }, duration + 50);
    };

    // ─── 3. WEB AUDIO ENGINE (procedural, không thư viện ngoài) ─────
    let _actx = null;
    function _getACtx() {
        if (!_actx) {
            try {
                _actx = new (window.AudioContext || window.webkitAudioContext)();
            } catch(e) { _actx = null; }
        }
        return _actx;
    }

    window.playGameSound = function(type) {
        const ctx = _getACtx();
        if (!ctx) return;
        try {
            if (ctx.state === 'suspended') ctx.resume();
            const now = ctx.currentTime;
            const osc  = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);

            switch(type) {
                case 'correct':
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(440, now);
                    osc.frequency.linearRampToValueAtTime(880, now + 0.12);
                    gain.gain.setValueAtTime(0.16, now);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.38);
                    osc.start(now); osc.stop(now + 0.38);
                    break;
                case 'wrong':
                    osc.type = 'sawtooth';
                    osc.frequency.setValueAtTime(220, now);
                    osc.frequency.linearRampToValueAtTime(100, now + 0.22);
                    gain.gain.setValueAtTime(0.10, now);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.32);
                    osc.start(now); osc.stop(now + 0.32);
                    break;
                case 'boss':
                    osc.type = 'sawtooth';
                    osc.frequency.setValueAtTime(90, now);
                    osc.frequency.linearRampToValueAtTime(55, now + 0.55);
                    gain.gain.setValueAtTime(0.09, now);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.65);
                    osc.start(now); osc.stop(now + 0.65);
                    break;
                case 'room':
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(320, now);
                    osc.frequency.linearRampToValueAtTime(480, now + 0.07);
                    osc.frequency.linearRampToValueAtTime(260, now + 0.2);
                    gain.gain.setValueAtTime(0.06, now);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
                    osc.start(now); osc.stop(now + 0.22);
                    break;
                case 'equip':
                    // Fanfare 3 nốt nhanh
                    [0, 0.1, 0.2].forEach(function(t, i) {
                        const o2  = ctx.createOscillator();
                        const g2  = ctx.createGain();
                        o2.connect(g2); g2.connect(ctx.destination);
                        o2.type = 'triangle';
                        o2.frequency.setValueAtTime([523, 659, 784][i], now + t);
                        g2.gain.setValueAtTime(0.13, now + t);
                        g2.gain.exponentialRampToValueAtTime(0.001, now + t + 0.18);
                        o2.start(now + t); o2.stop(now + t + 0.18);
                    });
                    break;
                case 'heal':
                    osc.type = 'sine';
                    osc.frequency.setValueAtTime(620, now);
                    osc.frequency.linearRampToValueAtTime(820, now + 0.14);
                    gain.gain.setValueAtTime(0.07, now);
                    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);
                    osc.start(now); osc.stop(now + 0.28);
                    break;
            }
        } catch(e) {}
    };

    // ─── 4. AMBIENT PARTICLES ────────────────────────────────────────
    function _spawnParticles() {
        const gc = document.getElementById('game-center');
        if (!gc || gc.querySelector('.imm-particle')) return;
        if (getComputedStyle(gc).position === 'static') gc.style.position = 'relative';
        const colors = [
            'rgba(0,240,255,0.55)', 'rgba(251,191,36,0.45)',
            'rgba(248,113,113,0.4)', 'rgba(167,243,208,0.5)',
            'rgba(196,181,253,0.45)'
        ];
        for (let i = 0; i < 12; i++) {
            const p = document.createElement('div');
            p.className = 'imm-particle';
            const sz = 2 + Math.random() * 3.5;
            p.style.cssText =
                'width:' + sz + 'px;' +
                'height:' + sz + 'px;' +
                'left:' + (4 + Math.random() * 92) + '%;' +
                'bottom:' + (Math.random() * 25) + '%;' +
                'background:' + colors[Math.floor(Math.random() * colors.length)] + ';' +
                'animation-duration:' + (4.5 + Math.random() * 5.5) + 's;' +
                'animation-delay:' + (Math.random() * 6) + 's;';
            gc.appendChild(p);
        }
    }
    setTimeout(_spawnParticles, 900);

    // ─── 5. HELPER: thêm/xóa class immersion trên game-center ────────
    function _gcClass(add, remove) {
        const gc = document.getElementById('game-center');
        if (!gc) return;
        if (remove) remove.forEach(function(c) { gc.classList.remove(c); });
        if (add)    { void gc.offsetWidth; gc.classList.add(add); }
    }

    // ─── 6. HOOK: handleAnswer — toast + sound + correct flash ────────
    const _prevHA = window.handleAnswer;
    window.handleAnswer = function(selectedIndex) {
        // Snapshot trước khi xử lý (generateRoom bên trong sẽ thay đổi state)
        const _prevScore = playerState.score;
        const _prevHp    = playerState.hp;
        const _wasBoss   = isCurrentRoomBoss;

        // Resume AudioContext từ user gesture (button click)
        if (_actx && _actx.state === 'suspended') _actx.resume();

        if (typeof _prevHA === 'function') _prevHA(selectedIndex);

        const scoreDelta = playerState.score - _prevScore;
        const hpDelta    = playerState.hp    - _prevHp;

        if (scoreDelta > 0) {
            // Đúng
            _gcClass('imm-correct-flash', ['imm-hp-danger', 'imm-boss-aura']);
            setTimeout(function() {
                _gcClass(null, ['imm-correct-flash']);
                // Khôi phục aura trạng thái phòng mới
                if (isCurrentRoomBoss) _gcClass('imm-boss-aura', null);
            }, 520);
            playGameSound('correct');
            showToast('✅ Chính xác! +' + scoreDelta + ' điểm', 'success');
            if (_wasBoss) showToast('💀 Boss bị hạ gục!', 'equip');
        } else if (hpDelta < 0) {
            // Sai
            playGameSound('wrong');
            showToast('💢 Sai! −' + Math.abs(hpDelta) + ' máu', 'damage');
            // Cảnh báo máu nguy hiểm ngay lập tức
            const baseHp = (playerState.character && characterDefs[playerState.character])
                ? characterDefs[playerState.character].baseHp : 1500;
            if (playerState.hp > 0 && playerState.hp <= baseHp * 0.28) {
                showToast('⚠️ Máu cực thấp! Cẩn thận!', 'warn');
            }
        }
    };

    // ─── 7. HOOK: generateRoom — transition + aura + toast ───────────
    const _prevGR = window.generateRoom;
    window.generateRoom = function() {
        const _isFirstRoom = (playerState.roomCount === 1);

        if (typeof _prevGR === 'function') _prevGR();

        // Room enter animation (sau khi nội dung đã render)
        const gc = document.getElementById('game-center');
        if (gc) {
            gc.classList.remove('imm-room-enter');
            void gc.offsetWidth;
            gc.classList.add('imm-room-enter');
        }

        if (isCurrentRoomBoss) {
            _gcClass('imm-boss-aura', ['imm-hp-danger']);
            showToast('⚔️  Phòng Boss! Tập trung nào!', 'warn');
            playGameSound('boss');
        } else {
            _gcClass(null, ['imm-boss-aura']);
            playGameSound('room');
            // Mốc mỗi 5 phòng (nhưng không phải phòng 1)
            if (!_isFirstRoom && playerState.roomCount % 5 === 0) {
                showToast('🚪 Phòng ' + playerState.roomCount + ' — tiếp tục tiến!', 'info');
            }
        }

        if (_isFirstRoom) {
            setTimeout(function() {
                showToast('⚔️  Trận chiến bắt đầu! Chúc may mắn!', 'info');
            }, 350);
        }
    };

    // ─── 8. HOOK: handleBossDefeat — toast trang bị ──────────────────
    const _prevHBD = window.handleBossDefeat;
    window.handleBossDefeat = function() {
        if (typeof _prevHBD === 'function') _prevHBD();
        // Lấy trang bị vừa nhặt (phần tử cuối cùng trong mảng)
        const lastEqId = playerState.equipments[playerState.equipments.length - 1];
        if (lastEqId && typeof equipmentDefs !== 'undefined' && equipmentDefs[lastEqId]) {
            showToast('🎁 Nhận trang bị: ' + equipmentDefs[lastEqId].name, 'equip');
            playGameSound('equip');
        }
    };

    // ─── 9. HOOK: applyBuffTick — toast hồi máu ──────────────────────
    const _prevABT = window.applyBuffTick;
    window.applyBuffTick = function() {
        const _hp0 = playerState.hp;
        if (typeof _prevABT === 'function') _prevABT();
        const _healed = playerState.hp - _hp0;
        if (_healed > 0) {
            showToast('💚 Trái Tim Biển Cả +' + _healed + ' máu', 'heal');
            playGameSound('heal');
        }
    };

    // ─── 10. HOOK: renderUIState — HP danger pulse ───────────────────
    const _prevRUI = window.renderUIState;
    window.renderUIState = function() {
        if (typeof _prevRUI === 'function') _prevRUI();
        if (gameState.status !== 'PLAYING') return;

        const gc = document.getElementById('game-center');
        if (!gc) return;

        const baseHp = (playerState.character && typeof characterDefs !== 'undefined'
            && characterDefs[playerState.character])
            ? characterDefs[playerState.character].baseHp : 1500;
        const isDanger = (playerState.hp > 0 && playerState.hp <= baseHp * 0.28);

        if (isCurrentRoomBoss) {
            // Boss aura có ưu tiên, không hiện hp danger
            gc.classList.remove('imm-hp-danger');
        } else if (isDanger) {
            if (!gc.classList.contains('imm-boss-aura')) {
                gc.classList.add('imm-hp-danger');
            }
        } else {
            gc.classList.remove('imm-hp-danger');
        }
    };

})();
// ============================================ // 
