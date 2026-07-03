// ─── VISUAL & IMAGE PATCH ───

// --- 1. TIÊM CSS CHO HÌNH ẢNH ---
const imgStyles = `
    <style>
        .sprite { width: 120px; height: 120px; object-fit: cover; margin-bottom: 15px; border-radius: 8px; border: 3px solid var(--text-color); box-shadow: 0 0 15px rgba(233, 69, 96, 0.5); }
        .boss-sprite { width: 160px; height: 160px; border-color: var(--btn-danger); box-shadow: 0 0 25px rgba(217, 4, 41, 0.8); }
        .avatar { width: 40px; height: 40px; border-radius: 50%; vertical-align: middle; margin-right: 10px; border: 2px solid #10b981; }
        .bot-avatar { border-color: #64748b; }
        .equip-icon { width: 24px; height: 24px; border-radius: 4px; vertical-align: middle; margin-right: 5px; border: 1px solid #fbbf24; }
        .lobby-banner { width: 100%; height: 100px; object-fit: cover; border-radius: var(--border-radius); margin-bottom: 15px; border: 2px solid #334155; }
        .char-img-select { width: 50px; height: 50px; border-radius: 8px; float: left; margin-right: 15px; border: 1px solid #fff; }
        .clearfix::after { content: ""; clear: both; display: table; }
    </style>
`;
document.head.insertAdjacentHTML("beforeend", imgStyles);

// --- 2. BỔ SUNG DỮ LIỆU ẢNH VÀO CONTRACT CŨ ---
characterDefs.gambler.img = 'https://placehold.co/100x100/8b5cf6/fff?text=BẠC';
characterDefs.madman.img = 'https://placehold.co/100x100/dc2626/fff?text=ĐIÊN';
characterDefs.fool.img = 'https://placehold.co/100x100/f59e0b/fff?text=KHỜ';
characterDefs.guard.img = 'https://placehold.co/100x100/3b82f6/fff?text=VỆ';
characterDefs.scholar.img = 'https://placehold.co/100x100/10b981/fff?text=BÁ';
characterDefs.random.img = 'https://placehold.co/100x100/64748b/fff?text=???';

equipmentDefs.short_sword.img = 'https://placehold.co/50x50/334155/fff?text=Đao';
equipmentDefs.fishing_rod.img = 'https://placehold.co/50x50/334155/fff?text=Câu';
equipmentDefs.pistol.img = 'https://placehold.co/50x50/d90429/fff?text=Súng';
equipmentDefs.cursed_mask.img = 'https://placehold.co/50x50/8b5cf6/fff?text=Mặt';
equipmentDefs.ocean_heart.img = 'https://placehold.co/50x50/3b82f6/fff?text=Tim';
equipmentDefs.lucky_star.img = 'https://placehold.co/50x50/f59e0b/fff?text=Sao';
equipmentDefs.pumpkin.img = 'https://placehold.co/50x50/ea580c/fff?text=Ngô';

const imgMonster = 'https://placehold.co/150x150/fbbf24/000?text=QUÁI\nTHƯỜNG';
const imgBoss = 'https://placehold.co/200x200/d90429/fff?text=BIG\nBOSS';

// --- 3. TIÊM KHUNG ẢNH VÀO DOM (Tránh sửa HTML Phase 1) ---
document.getElementById('screen-lobby').insertAdjacentHTML('afterbegin', '<img src="https://placehold.co/800x200/0f3460/fff?text=SẢNH+CHỜ+ĐẤU+TRƯỜNG" class="lobby-banner" id="lobby-banner-img">');
document.getElementById('ui-enemy-name').insertAdjacentHTML('afterend', '<br><img src="" id="ui-enemy-img" class="sprite hidden">');

// --- 4. GHI ĐÈ (OVERRIDE) CÁC HÀM HIỂN THỊ ĐỂ CÓ ẢNH ---

// 4.1 Ghi đè màn chọn nhân vật

// 4.2 Ghi đè màn Sảnh chờ

// 4.3 Ghi đè hàm Load Phòng (Thêm ảnh Quái/Boss)
const originalGenerateRoom = window.generateRoom; // Giữ lại luồng gốc

// 4.4 Ghi đè cập nhật thanh trạng thái (Thêm icon trang bị)
