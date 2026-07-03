// HỢP ĐỒNG TRÒ CHƠI v1 - GIAI ĐOẠN 27

(function() {
    // PHỤ THUỘC TRẠNG THÁI TRUNG TÂM:
    // playerState, gameState, isCurrentRoomBoss, currentRoomCorrectIndex, generateRoom

    // --- 1. TIÊM TOÀN BỘ CSS THIẾT KẾ ĐỒ HỌA ENGINE MÔ HÌNH NHÂN VẬT PURE CSS (CSS-BASED CHARACTER DESIGN ENGINE) ---
    const vectorArtStyles = `
        <style>
            /* KHUNG CHỨA VÀ HIỆU ỨNG DI CHUYỂN HOẠT ẢNH IDLE / FLOAT / AURA */
            .vector-monster-container {
                position: relative;
                width: 260px;
                height: 420px;
                margin: 0 auto 15px auto;
                display: flex;
                justify-content: center;
                align-items: center;
                transform-style: preserve-3d;
                perspective: 600px;
                transition: transform 0.1s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            }
            .vector-monster-container.float-idle-active {
                animation: float 3s ease-in-out infinite, idleRotate 4s ease-in-out infinite;
            }

            /* KHUNG NỀN HÀO QUANG RADIAL GRADIENT AURA THEO YÊU CẦU PROMPT */
            .vector-monster-container::before {
                content: "";
                position: absolute;
                width: 240px;
                height: 240px;
                background: radial-gradient(circle, var(--monster-aura, rgba(0,255,255,0.4)) 0%, transparent 70%);
                border-radius: 50%;
                left: 10px;
                top: 40px;
                filter: blur(25px);
                z-index: -1;
                transition: background 0.5s ease;
            }

            /* ĐỒ HỌA MÔ HÌNH CHIBI CƠ BẢN: BIG HEAD + SMALL BODY + BORDER DÀY CARTOON */
            .v-head {
                position: absolute;
                width: 170px;
                height: 150px;
                border: 7px solid #111;
                border-radius: 40%;
                left: 45px;
                top: 30px;
                z-index: 6;
                box-shadow: inset -12px -12px 24px rgba(0,0,0,0.4), inset 12px 12px 18px rgba(255,255,255,0.1);
            }
            .v-body {
                position: absolute;
                width: 110px;
                height: 115px;
                border: 7px solid #111;
                left: 75px;
                top: 170px;
                z-index: 4;
                box-shadow: inset -10px -10px 18px rgba(0,0,0,0.45), inset 8px 8px 12px rgba(255,255,255,0.08);
            }

            /* CẤU TRÚC PHỤ KIỆN ĐA DẠNG KHÔNG TRÙNG LẶP (DÙNG ĐỂ TÁCH BIỆT NGOÀI HÌNH 80% GIỮA 20 CHỦ THỂ) */
            .v-horn-l, .v-horn-r {
                position: absolute; width: 50px; height: 75px; border: 6px solid #111; border-radius: 50%; top: -30px; z-index: 2;
            }
            .v-horn-l { left: -15px; transform: rotate(-35deg); }
            .v-horn-r { right: -15px; transform: rotate(35deg); }

            .v-eye-l, .v-eye-r {
                position: absolute; width: 34px; height: 26px; background: #fff; border: 4px solid #111; border-radius: 50%; top: 60px; z-index: 7;
            }
            .v-eye-l { left: 30px; } .v-eye-r { right: 30px; }
            .v-pupil {
                position: absolute; width: 14px; height: 14px; border-radius: 50%; top: 4px; left: 6px;
                box-shadow: 0 0 14px var(--pupil-glow, #00f0ff);
            }

            .v-mouth {
                position: absolute; border: 5px solid #111; border-radius: 50%; bottom: 25px; left: 65px; z-index: 7;
            }
            .v-helmet {
                position: absolute; width: 184px; height: 80px; border: 7px solid #111; border-radius: 50% 50% 10px 10px; left: -7px; top: -15px; z-index: 8;
            }
            .v-armor {
                position: absolute; width: 96px; height: 60px; border: 6px solid #111; border-radius: 8px; left: 1px; top: 15px;
            }
            .v-shoulder-l, .v-shoulder-r {
                position: absolute; width: 45px; height: 45px; border: 5px solid #111; border-radius: 12px; top: -10px; z-index: 5;
            }
            .v-shoulder-l { left: -25px; } .v-shoulder-r { right: -25px; }
            .v-belt {
                position: absolute; width: 110px; height: 24px; border: 5px solid #111; bottom: 15px; left: -7px; z-index: 5;
            }

            /* CÁNH TAY VÀ ĐÔI CHÂN ĐỐI XỨNG */
            .v-arm-l, .v-arm-r {
                position: absolute; width: 40px; height: 95px; border: 6px solid #111; border-radius: 18px; top: 180px; z-index: 3;
            }
            .v-arm-l { left: 30px; transform: rotate(15deg); }
            .v-arm-r { right: 30px; transform: rotate(-15deg); }

            .v-leg-l, .v-leg-l-inner, .v-leg-r, .v-leg-r-inner {
                position: absolute; width: 44px; height: 80px; border: 6px solid #111; border-radius: 16px; top: 275px; z-index: 3;
            }
            .v-leg-l { left: 75px; } .v-leg-r { right: 75px; }

            /* THIẾT KẾ CÁC LOẠI VŨ KHÍ NGUYÊN BẢN THEO ĐỀ BÀI (PÙ HỢP HOÀN TOÀN CARTOON STYLE) */
            .v-weapon-container {
                position: absolute; width: 120px; height: 160px; top: 130px; right: -40px; z-index: 9; transform-origin: left bottom;
            }
            .weapon-mesh { position: relative; width: 100%; height: 100%; }

            /* 1. Đao / Kiếm */
            .mesh-blade { position: absolute; width: 22px; height: 110px; border: 5px solid #111; border-radius: 10px 10px 4px 4px; left: 10px; top: 10px; }
            .mesh-hilt { position: absolute; width: 12px; height: 35px; background: #78350f; border: 4px solid #111; left: 15px; bottom: 10px; }
            .mesh-guard { position: absolute; width: 44px; height: 12px; background: #f59e0b; border: 4px solid #111; left: -1px; bottom: 42px; border-radius: 4px; }
            /* 2. Súng */
            .mesh-barrel { position: absolute; width: 65px; height: 20px; background: #475569; border: 5px solid #111; left: 20px; top: 40px; border-radius: 4px; }
            .mesh-grip { position: absolute; width: 18px; height: 40px; background: #1e293b; border: 5px solid #111; left: 15px; top: 50px; transform: rotate(-15deg); border-radius: 4px; }
            /* 3. Thương */
            .mesh-shaft { position: absolute; width: 10px; height: 150px; background: #b45309; border: 4px solid #111; left: 25px; top: 0; }
            .mesh-spearhead { position: absolute; width: 26px; height: 40px; background: #cbd5e1; border: 5px solid #111; left: 17px; top: -35px; border-radius: 50% 50% 0 0; }
            /* 4. Nỏ */
            .mesh-crossbow-body { position: absolute; width: 14px; height: 90px; background: #78350f; border: 4px solid #111; left: 25px; top: 20px; }
            .mesh-crossbow-bow { position: absolute; width: 85px; height: 14px; background: #475569; border: 4px solid #111; left: -10px; top: 35px; border-radius: 50%; }
            /* 5. Chùy / Đinh Ba */
            .mesh-mace-head { position: absolute; width: 50px; height: 50px; background: #334155; border: 5px solid #111; border-radius: 50%; left: 5px; top: 10px; }
            .mesh-trident-fork1 { position: absolute; width: 8px; height: 45px; background: #e2e8f0; border: 4px solid #111; left: 10px; top: -20px; }
            .mesh-trident-fork2 { position: absolute; width: 8px; height: 60px; background: #e2e8f0; border: 4px solid #111; left: 26px; top: -35px; }
            .mesh-trident-fork3 { position: absolute; width: 8px; height: 45px; background: #e2e8f0; border: 4px solid #111; left: 42px; top: -20px; }
            /* 6. Lựu đạn */
            .mesh-grenade-body { position: absolute; width: 44px; height: 55px; background: #166534; border: 5px solid #111; border-radius: 15px; left: 15px; top: 40px; }
            .mesh-grenade-pin { position: absolute; width: 16px; height: 16px; border: 4px solid #111; border-radius: 50%; left: 29px; top: 22px; }

            /* ĐỒ HỌA ĐẾ BÓNG ĐỔ KHÔNG GIAN (DYNAMIC BLUR SHADOW) */
            .v-shadow {
                position: absolute; width: 160px; height: 35px; background: rgba(0,0,0,0.5); bottom: 5px; left: 50px; border-radius: 50%; filter: blur(8px); z-index: 1;
            }
            .vector-monster-container.float-idle-active .v-shadow {
                animation: shadow 3s ease-in-out infinite;
            }

            /* HOẠT ẢNH BẬT NHẢY VÀ ĐIỀU BIẾN TỶ LỆ */
            @keyframes idleRotate {
                0% { transform: rotate(-2deg); }
                50% { transform: rotate(2deg); }
                100% { transform: rotate(-2deg); }
            }
        </style>
    `;
    document.head.insertAdjacentHTML("beforeend", vectorArtStyles);

    // --- 2. CẤU HÌNH THƯ VIỆN DỮ LIỆU ĐỒ HỌA 20 CHỦ THỂ QUÁI VẬT VÀ BOSS ĐỘC QUYỀN (DIFFERENTIATION > 80%) ---
    // Thiết lập 2 màu chủ đạo (2 COLOR MAIN), 1 tính năng độc bản (1 UNIQUE FEATURE), Khối tối giản (SIMPLE SHAPE)
    const vectorMonsterDatabase = [
        { name: "Tiểu Quỷ Sừng Băng", c1: "#2563eb", c2: "#1e3a8a", eye: "#00f0ff", aura: "rgba(0,240,255,0.4)", horn: true, hornColor: "#22d3ee", helmet: false, mouth: "width:30px; height:15px; background:#111; border-radius: 0 0 15px 15px;", weapon: "blade", unique: "horn-frost" },
        { name: "Hắc Binh Đội Mũ", c1: "#374151", c2: "#111827", eye: "#ef4444", aura: "rgba(239,68,68,0.3)", horn: false, helmet: true, helmetColor: "#4b5563", mouth: "width:40px; height:6px; background:#111;", weapon: "pistol", unique: "iron-helm" },
        { name: "Yêu Tinh Sát Thủ", c1: "#16a34a", c2: "#14532d", eye: "#eab308", aura: "rgba(234,179,8,0.3)", horn: false, helmet: false, shoulderColor: "#15803d", mouth: "width:20px; height:20px; background:#111; border-radius:50%;", weapon: "blade", unique: "green-scout" },
        { name: "Giáp Sĩ Hoàng Kim", c1: "#d97706", c2: "#78350f", eye: "#fff", aura: "rgba(217,119,6,0.4)", horn: true, hornColor: "#f59e0b", helmet: true, helmetColor: "#b45309", mouth: "width:35px; height:10px; background:#111; border-radius:4px;", weapon: "spear", unique: "golden-guard" },
        { name: "Thợ Săn Bộ Lạc", c1: "#ea580c", c2: "#7c2d12", eye: "#22c55e", aura: "rgba(34,197,94,0.3)", horn: true, hornColor: "#fdba74", helmet: false, mouth: "width:25px; height:8px; background:#111; border-radius:50%;", weapon: "crossbow", unique: "tribal-mask" },
        { name: "Cơ Giáp Tàn Bạo", c1: "#4b5563", c2: "#1f2937", eye: "#c084fc", aura: "rgba(192,132,252,0.4)", horn: false, helmet: true, helmetColor: "#374151", mouth: "width:40px; height:12px; background:#ef4444; border-radius:2px;", weapon: "pistol", unique: "neon-visor" },
        { name: "Kẻ Nguyền Rủa", c1: "#7c3aed", c2: "#4c1d95", eye: "#f43f5e", aura: "rgba(244,63,94,0.4)", horn: true, hornColor: "#a78bfa", helmet: false, mouth: "width:30px; height:15px; border-bottom: 6px solid #111; border-radius:50%;", weapon: "mace", unique: "void-touched" },
        { name: "Đại Đội Trưởng Orc", c1: "#047857", c2: "#064e3b", eye: "#f97316", aura: "rgba(249,115,22,0.3)", horn: true, hornColor: "#34d399", helmet: true, helmetColor: "#065f46", mouth: "width:44px; height:20px; background:#111; border-radius:6px;", weapon: "trident", unique: "heavy-tusks" },
        { name: "Lính Đánh Thuê Biển", c1: "#0284c7", c2: "#0c4a6e", eye: "#38bdf8", aura: "rgba(56,189,248,0.3)", horn: false, helmet: false, mouth: "width:32px; height:5px; background:#111;", weapon: "trident", unique: "deep-diver" },
        { name: "Kẻ Kích Nổ Cuồng Loạn", c1: "#dc2626", c2: "#7f1d1d", eye: "#eab308", aura: "rgba(255,0,0,0.5)", horn: false, helmet: true, helmetColor: "#991b1b", mouth: "width:36px; height:16px; background:#111; border-radius:50% 50% 0 0;", weapon: "grenade", unique: "bomber-goggles" },
        { name: "Hiệp Sĩ Tro Tàn", c1: "#4b5563", c2: "#1f2937", eye: "#f43f5e", aura: "rgba(244,63,94,0.3)", horn: true, hornColor: "#9ca3af", helmet: true, helmetColor: "#111827", mouth: "width:30px; height:4px; background:#111;", weapon: "blade", unique: "ash-plate" },
        { name: "Tinh Linh Rừng Sâu", c1: "#059669", c2: "#022c22", eye: "#67e8f9", aura: "rgba(6,182,212,0.4)", horn: true, hornColor: "#6ee7b7", helmet: false, mouth: "width:22px; height:10px; background:#111; border-radius:50%;", weapon: "crossbow", unique: "leaf-ears" },
        { name: "Sát Thủ Sa Mạc", c1: "#ca8a04", c2: "#451a03", eye: "#f43f5e", aura: "rgba(234,179,8,0.3)", horn: false, helmet: true, helmetColor: "#854d0e", mouth: "width:28px; height:4px; background:#111;", weapon: "blade", unique: "sand-shroud" },
        { name: "Kẻ Trộm Bóng Tối", c1: "#1e1b4b", c2: "#311042", eye: "#a855f7", aura: "rgba(168,85,247,0.4)", horn: true, hornColor: "#4c1d95", helmet: false, mouth: "width:30px; height:12px; background:#111; border-radius:0 0 10px 10px;", weapon: "blade", unique: "shadow-cloak" },
        { name: "Chiến Binh Đầm Lầy", c1: "#15803d", c2: "#14532d", eye: "#f59e0b", aura: "rgba(21,128,61,0.3)", horn: false, helmet: false, mouth: "width:34px; height:14px; background:#111; border-radius:4px;", weapon: "spear", unique: "moss-skin" },
        // DÀN BOSS SIÊU CẤP (16 - 20): KÍCH THƯỚC ĐỒ SỘ, PHỤ KIỆN PHỨC TẠP
        { name: "👹 CHÚA TỂ ĐẠI NGỤC (BOSS)", c1: "#991b1b", c2: "#450a0a", eye: "#ff0000", aura: "rgba(255,0,0,0.7)", horn: true, hornColor: "#111827", helmet: true, helmetColor: "#7f1d1d", mouth: "width:50px; height:25px; background:#111; border-radius:6px; border-top: 5px solid #ef4444;", weapon: "blade", unique: "hell-lord" },
        { name: "⚡ THẦN CƠ ĐẾ QUỐC (BOSS)", c1: "#2563eb", c2: "#1e3a8a", eye: "#00f0ff", aura: "rgba(0,240,255,0.7)", horn: false, helmet: true, helmetColor: "#0f172a", mouth: "width:60px; height:10px; background:#00f0ff;", weapon: "pistol", unique: "cyber-god" },
        { name: "🐉 CỔ LONG BĂNG GIÁ (BOSS)", c1: "#0891b2", c2: "#164e63", eye: "#fff", aura: "rgba(34,211,238,0.6)", horn: true, hornColor: "#cffafe", helmet: false, mouth: "width:45px; height:22px; background:#111; border-radius:0 0 20px 20px;", weapon: "spear", unique: "frost-dragon" },
        { name: "🔮 PHÙ THỦY HƯ KHÔNG (BOSS)", c1: "#6d28d9", c2: "#2e1065", eye: "#f43f5e", aura: "rgba(168,85,247,0.7)", horn: true, hornColor: "#c084fc", helmet: true, helmetColor: "#4c1d95", mouth: "width:40px; height:15px; background:#111; border-radius:50%;", weapon: "trident", unique: "void-emperor" },
        { name: "💥 KHỔNG LỒ DIỆT THẾ (BOSS)", c1: "#ea580c", c2: "#431407", eye: "#fbbf24", aura: "rgba(234,88,12,0.8)", horn: true, hornColor: "#7c2d12", helmet: true, helmetColor: "#111827", mouth: "width:55px; height:25px; background:#111; border-radius:4px;", weapon: "mace", unique: "world-breaker" }
    ];

    // --- 3. ENGINE KẾT XUẤT NHÂN VẬT VECTOR ART BẰNG HTML DOM (HTML/CSS ART RENDERING INTERFACE) ---
    window.renderVectorCharacterHTML = function(index, isBoss) {
        // Đảm bảo chỉ số nằm trong giới hạn mảng dữ liệu cấu hình 20 con quái vật
        let cfg = vectorMonsterDatabase[index % vectorMonsterDatabase.length];
        
        // Nếu là Boss, ép lấy dữ liệu từ dàn Boss tối thượng (chỉ mục 15 - 19) để gia tăng độ nguy hiểm
        if (isBoss) {
            cfg = vectorMonsterDatabase[15 + (index % 5)];
        }

        // Khởi tạo các chuỗi nhánh HTML phụ thuộc dựa trên Unique Config của từng con
        let hornHTML = cfg.horn ? `
            <div class="v-horn-l" style="background: linear-gradient(${cfg.hornColor}, ${cfg.c2});"></div>
            <div class="v-horn-r" style="background: linear-gradient(${cfg.hornColor}, ${cfg.c2});"></div>
        ` : '';
        
        let helmetHTML = cfg.helmet ? `
            <div class="v-helmet" style="background: linear-gradient(145deg, ${cfg.helmetColor}, #111);"></div>
        ` : '';

        let shoulderColor = cfg.shoulderColor || cfg.c2;
        let beltColor = cfg.helmetColor || "#78350f";

        // Sinh mã dựng hình Vũ khí ngẫu nhiên/cố định chuẩn chỉ cartoon style hình khối
        let weaponHTML = '';
        if (cfg.weapon === 'blade') {
            weaponHTML = `<div class="mesh-blade" style="background: linear-gradient(#cbd5e1, #64748b);"></div><div class="mesh-guard"></div><div class="mesh-hilt"></div>`;
        } else if (cfg.weapon === 'pistol') {
            weaponHTML = `<div class="mesh-barrel"></div><div class="mesh-grip"></div>`;
        } else if (cfg.weapon === 'spear') {
            weaponHTML = `<div class="mesh-shaft"></div><div class="mesh-spearhead"></div>`;
        } else if (cfg.weapon === 'crossbow') {
            weaponHTML = `<div class="mesh-crossbow-body"></div><div class="mesh-crossbow-bow"></div>`;
        } else if (cfg.weapon === 'mace') {
            weaponHTML = `<div class="mesh-shaft" style="height:120px; top:30px;"></div><div class="mesh-mace-head"></div>`;
        } else if (cfg.weapon === 'trident') {
            weaponHTML = `<div class="mesh-shaft"></div><div class="mesh-trident-fork1"></div><div class="mesh-trident-fork2"></div><div class="mesh-trident-fork3"></div>`;
        } else if (cfg.weapon === 'grenade') {
            weaponHTML = `<div class="mesh-grenade-body"></div><div class="mesh-grenade-pin"></div>`;
        }

        // Tích hợp biến đổi CSS Variables động cho khối Hào quang Aura và Ánh mắt Glow rực lửa tinh anh
        let bossScaleStyle = isBoss ? 'transform: scale(1.2);' : '';

        return `
            <div class="vector-monster-container float-idle-active" id="vector-avatar-mesh" style="--monster-aura: ${cfg.aura}; --pupil-glow: ${cfg.eye}; ${bossScaleStyle}">
                <div class="v-head" style="background: linear-gradient(145deg, ${cfg.c1}, ${cfg.c2});">
                    ${hornHTML}
                    ${helmetHTML}
                    <div class="v-eye-l"><div class="v-pupil" style="background: ${cfg.eye};"></div></div>
                    <div class="v-eye-r"><div class="v-pupil" style="background: ${cfg.eye};"></div></div>
                    <div class="v-mouth" style="${cfg.mouth}"></div>
                </div>

                <div class="v-body" style="background: linear-gradient(145deg, ${cfg.c1}, ${cfg.c2});">
                    <div class="v-armor" style="background: ${cfg.c2}; border-color: #111;"></div>
                    <div class="v-shoulder-l" style="background: ${shoulderColor};"></div>
                    <div class="v-shoulder-r" style="background: ${shoulderColor};"></div>
                    <div class="v-belt" style="background: ${beltColor};"></div>
                </div>

                <div class="v-arm-l" style="background: linear-gradient(${cfg.c1}, ${cfg.c2});"></div>
                <div class="v-arm-r" style="background: linear-gradient(${cfg.c1}, ${cfg.c2});"></div>

                <div class="v-leg-l" style="background: linear-gradient(${cfg.c1}, ${cfg.c2});"></div>
                <div class="v-leg-r" style="background: linear-gradient(${cfg.c1}, ${cfg.c2});"></div>

                <div class="v-weapon-container">
                    <div class="weapon-mesh">${weaponHTML}</div>
                </div>

                <div class="v-shadow"></div>
            </div>
        `;
    };

    // --- 4. GHI ĐÈ LUỒNG LOAD PHÒNG IN-GAME ĐỂ INJECT MÔ HÌNH CSS VECTOR THAY CHO LỚP ẢNH CŨ ---


    // --- 5. TÍCH HỢP HIỆU ỨNG TRÚNG ĐÒN KHẨN CẤP (HIT EFFECT TRANSFORM PACK) KHI TRẢ LỜI SAI ---
    const oldHandleAnswer = window.handleAnswer;
    window.handleAnswer = function(selectedIndex) {
        let isCorrect = (selectedIndex === (typeof currentRoomCorrectIndex !== 'undefined' ? currentRoomCorrectIndex : activeQuestion.correctIndex));
        
        // Nếu trả lời sai, kích hoạt ngay lập tức hoạt ảnh biến đổi chớp nhoáng theo yêu cầu prompt đề bài
        if (!isCorrect) {
            let characterMeshDOM = document.getElementById('vector-avatar-mesh');
            if (characterMeshDOM) {
                // Tắt tạm hoạt ảnh cuộn idle để tránh xung đột ma trận transform hình học
                characterMeshDOM.classList.remove('float-idle-active');
                
                // Tiêm hiệu ứng trúng đòn khẩn cấp dứt khoát
                characterMeshDOM.style.transform = "scale(0.9) rotate(-5deg)";

                setTimeout(() => {
                    if (characterMeshDOM) {
                        characterMeshDOM.style.transform = "scale(1)";
                        // Tái kích hoạt lại mạch hoạt ảnh lơ lửng sống động bình thường
                        characterMeshDOM.classList.add('float-idle-active');
                    }
                }, 100);
            }
        }

        // Chuyển giao tiếp tục luồng xử lý cốt lõi của lõi game gốc
        if (typeof oldHandleAnswer === 'function') {
            oldHandleAnswer(selectedIndex);
        }
    };

})();
// ============================================ // 
