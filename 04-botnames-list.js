// ─── MISSING FIXES ───

// ─── FIX 1: BOTNAMES KHÔNG TỒN TẠI ──────────────────────────────────────────
// generateBots() dùng botNames nhưng nó chưa được định nghĩa ở đâu cả
if (typeof botNames === 'undefined') {
    window.botNames = [
        "Thần Tốc", "Bão Lửa", "Lạnh Lùng", "Thép Đen", "Cú Đêm",
        "Sấm Sét", "Ẩn Mình", "Vô Địch", "Độc Cô", "Thiên Lôi"
    ];
}
