// ─── STATIC DATA & ADMIN ───

// --- 1. GLOBAL STATES ---
let gameState = {
    status: 'HOME', // HOME, MATCHMAKING, LOBBY, PLAYING, ENDED
    timer: 360,     // 6 phút
    bots: []
};

let playerState = {
    hp: 1500,
    score: 0,
    roomCount: 1,
    character: null,
    equipments: [],
    activeBuffs: [],     // Lưu các buff đang có tác dụng (theo số phòng)
    failedQuestions: [], // Lưu các câu sai để xuất hiện lại
    isPistolReady: false,
    isGambleActive: false,
    gambleCooldown: 0,
    bossRoomsRemaining: 0 // Dành cho trang bị Cần câu cá
};

let questionBank = [];
let rankingState = [];
let adminState = {
    tempQuestions: []
};

// --- 2. STATIC DEFINITIONS (HARD-CODED CONFIG) ---
const characterDefs = {
    gambler: { id: 'gambler', name: 'Con Bạc', baseHp: 1500, desc: 'Kỹ năng: Đánh bạc trước khi thấy câu hỏi. Thắng x3 điểm, thua x2 sát thương. Hồi chiêu: 2 phòng.' },
    madman: { id: 'madman', name: 'Gã Điên', baseHp: 1500, desc: 'Nội tại: Điểm thưởng luôn x2 (kể cả boss). Thua 1 câu là chết (Mất 1500 HP).' },
    fool: { id: 'fool', name: 'Gã Khờ', baseHp: 1500, desc: 'Nội tại: Luôn loại 1 đáp án sai (câu hỏi chỉ còn 3 lựa chọn).' },
    guard: { id: 'guard', name: 'Bảo Vệ', baseHp: 2000, desc: 'Nội tại: Cộng thêm 1000 máu khởi đầu (Tổng 2000 HP).' },
    scholar: { id: 'scholar', name: 'Học Bá', baseHp: 1500, desc: 'Nội tại: Cuối game nếu Top 10 thì tự lên Top 1 (+1 điểm so với top 1 hiện tại).' },
    random: { id: 'random', name: 'Random', baseHp: 1100, desc: 'Hệ thống tự chọn 1 trong 5 thân phận. Nhận thêm 100 máu.' }
};

const equipmentDefs = {
    short_sword: { id: 'short_sword', name: 'Đao Ngắn', type: 'passive', desc: '+20% điểm thưởng.' },
    fishing_rod: { id: 'fishing_rod', name: 'Cần Câu Cá', type: 'passive', desc: '3 phòng tiếp theo đều là Boss.' },
    pistol: { id: 'pistol', name: 'Súng Lục', type: 'active', desc: 'Giết ngay 1 quái thường, nhận 100 điểm. Dùng 1 lần.' },
    cursed_mask: { id: 'cursed_mask', name: 'Mặt Nạ Bị Nguyền', type: 'passive', desc: '3 phòng tiếp theo giảm 50% điểm.' },
    ocean_heart: { id: 'ocean_heart', name: 'Trái Tim Biển Cả', type: 'passive', desc: 'Mỗi phòng hồi 30 máu.' },
    lucky_star: { id: 'lucky_star', name: 'Ngôi Sao May Mắn', type: 'passive', desc: '3 phòng tiếp theo tăng 50% điểm.' },
    pumpkin: { id: 'pumpkin', name: 'Bí Ngô', type: 'passive', desc: '3 phòng tiếp theo tăng 100% điểm, nhưng máu bị trừ tăng 100%.' }
};

// --- 3. CORE FUNCTIONS (UTILITIES & NAVIGATION) ---


// Lấy tham chiếu các DOM Elements cho Admin
const domAdminTextarea = document.getElementById('admin-textarea');
const domAdminLog = document.getElementById('admin-log');
const btnAdminValidate = document.getElementById('btn-admin-validate');
const btnAdminImport = document.getElementById('btn-admin-import');

// --- 4. ADMIN PANEL LOGIC ---

// Hàm bóc tách câu hỏi bằng Regex


// Xử lý nút Validate
btnAdminValidate.addEventListener('click', () => {
    let rawText = domAdminTextarea.value;
    if (!rawText.trim()) {
        domAdminLog.innerText = "Lỗi: Khung nhập liệu đang trống!";
        domAdminLog.style.color = "var(--btn-danger)";
        btnAdminImport.disabled = true;
        return;
    }

    let parsed = parseAdminQuestions(rawText);
    if (parsed.length > 0) {
        adminState.tempQuestions = parsed;
        domAdminLog.innerText = `Thành công: Đã nhận diện được ${parsed.length} câu hỏi hợp lệ.`;
        domAdminLog.style.color = "#10b981"; // Xanh lá
        btnAdminImport.disabled = false;
    } else {
        domAdminLog.innerText = "Lỗi: Không nhận diện được câu hỏi nào. Hãy kiểm tra lại format A. B. C. D.";
        domAdminLog.style.color = "var(--btn-danger)";
        btnAdminImport.disabled = true;
    }
});

// Xử lý nút Import
btnAdminImport.addEventListener('click', () => {
    questionBank = [...adminState.tempQuestions];
    alert(`Đã import ${questionBank.length} câu hỏi vào hệ thống! Sẵn sàng chiến.`);
    domAdminTextarea.value = "";
    domAdminLog.innerText = "Chưa có dữ liệu.";
    btnAdminImport.disabled = true;
    changeScreen('screen-home');
});

// Nút mở Admin Panel & Nút Quay lại
document.getElementById('btn-goto-admin').addEventListener('click', () => changeScreen('screen-admin'));
document.getElementById('btn-admin-back').addEventListener('click', () => changeScreen('screen-home'));

// Render nhanh danh sách nhân vật ở màn HOME (Khởi tạo UI cơ bản)


// Khởi chạy khi script load xong
