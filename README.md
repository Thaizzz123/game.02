# Cấu trúc file — Đấu Trường Tri Thức

Game gốc là 1 file `index.html` 5556 dòng. Đã tách thành 44 file: 1 HTML + 1 CSS + 42 JS,
gom theo 9 nhóm tính năng. Load game **chỉ cần mở `index.html`**, các file còn lại được nó tự gọi qua thẻ `<script>`.

Thứ tự các thẻ `<script>` trong `index.html` đã được xếp đúng y hệt thứ tự chạy của file gốc.
Đây là điều bắt buộc phải giữ nguyên, vì code gốc viết theo kiểu "vá đè" (patch chồng patch — đoạn
sau ghi đè hàm của đoạn trước), đổi thứ tự chạy là game gãy ngay. Còn việc up từng file lên GitHub
theo thứ tự nào, kéo folder nào trước, thì thoải mái — không ảnh hưởng gì.

## Bản đồ tính năng → file

| Muốn sửa cái gì | Vào file |
|---|---|
| Bố cục 5 màn hình (home/lobby/game/result) | `css/style.css`, `js/core/01-state-and-data-definitions.js` |
| Luồng ghép trận, sinh bot, vào lobby | `js/core/02-outgame-flow-matchmaking.js` |
| Vòng lặp game chính (timer, render phòng) | `js/core/03-ingame-loop-hooks.js` |
| Danh sách tên bot | `js/core/04-botnames-list.js` |
| Scroll mobile | `js/core/05-mobile-scroll-fix.js` |
| Máu không cho xuống âm (giới hạn HP) | `js/core/07-hp-floor-lock.js` |
| Cỡ chữ câu hỏi, tối ưu render (không phải tính năng mới) | `js/core/08-question-font-size.js`, `js/core/09-render-performance-optimization.js` |
| **Nhân vật** — mô tả, chỉ số, nội tại từng thân phận | `js/character/*` (13 file, xem chi tiết bên dưới) |
| Ảnh đại diện nhân vật (Dicebear/Robohash) | `js/character/01-visual-image-patch.js`, `js/character/02-boss-and-character-images-observer.js` |
| Ô nhập tên người chơi ở màn chọn nhân vật | `js/character/03-shuffle-and-playername-input.js` |
| Học Bá (nhân đôi điểm Top 10, streak clan) | `js/character/05-scholar-endgame-double-score.js`, `js/character/11-scholar-streak-clan-bonus.js`, `js/character/12-scholar-desc-cleanup.js` |
| Con Bạc (đánh bạc x5, mô tả) | `js/character/06-gambler-desc-x5-multiplier.js`, `js/character/07-gambler-desc-fix-and-ui.js` |
| Bảo Vệ (2500 HP) | `js/character/09-guard-2500hp.js` |
| Gã Khờ (kỹ năng ẩn loại đáp án sai + hồi sinh bí mật) | `js/character/13-fool-hidden-skill-cleanup.js`, hồi sinh bí mật nằm chung với **sự kiện ẩn theo nhân vật** trong `js/character/10-clan-desc-and-boss-events-pool.js` |
| Mô hình đồ họa CSS thuần cho nhân vật/quái/boss | `js/character/08-vector-art-character-boss-models.js` |
| **Boss** — máu, mô hình, phần thưởng khi hạ boss | `js/boss/*` |
| Ảnh/tên boss, độ bền theo boss | `js/boss/01-name-persistence-boss-image-fix.js`, `js/boss/04-monster-name-table-fix.js` |
| Giao diện + logic màn thưởng sau khi hạ Boss | `js/boss/02-boss-reward-system-css.js` |
| Tích hợp kỹ năng Con Bạc vào màn thưởng Boss | `js/boss/03-boss-reward-gambling-skill.js` |
| **3 sự kiện ngẫu nhiên sau Boss** (Rương Cổ Đại / Gian Thương Bí Ẩn / Vòng Quay May Rủi) | `js/character/10-clan-desc-and-boss-events-pool.js` (tìm biến `totalPool`) — file này tên theo "clan" vì nó đi chung với mô tả clan nhân vật trong code gốc, nhưng phần sự kiện nằm ngay trong đó |
| **Sự kiện ẩn theo từng nhân vật** (bí mật của Con Bạc, hồi sinh bí mật của Gã Khờ...) | `js/character/10-clan-desc-and-boss-events-pool.js` (Con Bạc), `js/character/13-fool-hidden-skill-cleanup.js` (Gã Khờ) |
| **Trang bị** — định nghĩa, buff cộng dồn, độ bền | `js/equipment/*` |
| Danh sách trang bị + rơi đồ + kỹ năng Súng Lục/Đánh Bạc cơ bản | `js/equipment/01-gear-skills-endgame-base.js` |
| Fix cộng dồn buff nhiều tầng | `js/equipment/02-buff-stacking-fix.js` |
| Trái Tim Biển Cả (độ bền riêng, hỏng sau 5 câu sai) | `js/equipment/03-ocean-heart-durability.js` |
| Phần thưởng Boss dành riêng Gã Điên | `js/equipment/04-madman-boss-reward-fix.js` |
| **Hiệu ứng +/- điểm, sát thương, streak/combo** | `js/equipment/01-gear-skills-endgame-base.js` (tính điểm/damage gốc), `js/character/06-gambler-desc-x5-multiplier.js` (nhân x5), `js/character/11-scholar-streak-clan-bonus.js` (x2 theo streak) |
| **Admin** — mật khẩu, đăng nhập | `js/admin/01-admin-security-password.js` |
| Chống gian lận chọn nhân vật Random, khóa tên người chơi, bảng xếp hạng chốt bản cuối | `js/admin/02-definitive-name-leaderboard-fix.js` |
| **Admin quan sát** (observer mode xem trận không tham gia) | `js/character/02-boss-and-character-images-observer.js` (phần 4: "HỆ THỐNG OBSERVER") |
| **Bảng xếp hạng** — giao diện, mini-panel realtime | `js/leaderboard/01-mini-leaderboard-panel.js`, cốt lõi render nằm ở `js/equipment/01-gear-skills-endgame-base.js` (mục 5) và `js/admin/02-definitive-name-leaderboard-fix.js` (mục G) |
| **Đồng bộ multiplayer (P2P)** — kết nối, phòng, chống mất đồng bộ | `js/multiplayer/*` |
| Kết nối PeerJS nền tảng (host/client) | `js/multiplayer/01-peerjs-p2p-base.js` |
| Cache chống mất đồng bộ, giữ mã phòng | `js/multiplayer/02-p2p-anti-desync-cache.js` |
| Cấu hình STUN/TURN xuyên NAT (chơi 2 mạng khác nhau) | `js/multiplayer/03-ice-stun-turn-config.js` |
| Tối ưu để chịu tải ~100 người chơi cùng lúc | `js/multiplayer/04-scale-100-players-sync.js` |
| Thay alert()/prompt() bằng toast/modal, TURN server đầy đủ | `js/multiplayer/05-toast-modal-and-turn-config.js` |
| **Hiệu ứng động (animation)** | `js/effects/01-panic-overlay-and-siren-sound.js` (rung màn hình khi nguy), `js/effects/02-firework-celebration.js` (pháo bông), `js/effects/03-screen-transitions-and-damage-fx.js` (chuyển màn mượt + hiệu ứng nhận sát thương) |
| **Hiệu ứng âm thanh** | `js/effects/01-panic-overlay-and-siren-sound.js` (còi báo động khi HP thấp), `js/effects/04-toast-immersion-and-sound-engine.js` (Web Audio Engine — hàm `playGameSound`) |
| **Cơ sở dữ liệu câu hỏi** | Khai báo mảng `questionBank` ở `js/core/01-state-and-data-definitions.js`; logic nhập/parse câu hỏi từ Admin Panel cũng nằm trong file này (mục 4) |
| Xáo trộn thứ tự câu hỏi/đáp án khi hiển thị | `js/character/03-shuffle-and-playername-input.js` (mục 5-6) |

## Lưu ý quan trọng

Code gốc không tách bạch tuyệt đối theo tính năng — nhiều đoạn "vá" cùng lúc sửa 2-3 thứ khác nhau
(ví dụ file `character/10-clan-desc-and-boss-events-pool.js` vừa sửa mô tả nhân vật vừa chứa luôn
logic 3 sự kiện sau Boss, vì người viết code gốc làm chung 1 lần). Claude đã cố gắng đặt file theo
tính năng **chiếm phần lớn nội dung** của đoạn đó, và bảng trên liệt kê đủ các trường hợp bị chung đụng.
Nếu sửa 1 file mà không thấy đúng chỗ, tìm theo tên biến/hàm liên quan (`characterDefs`, `equipmentDefs`,
`totalPool`, `playGameSound`...) bằng Ctrl+F trong repo là ra.

Đã verify: ráp lại toàn bộ 44 file này cho ra đúng 100% nội dung file gốc (diff bằng tool, không lệch
dòng code nào, chỉ lệch vài dòng trắng vô hại ở ranh giới file). Từng file `.js` đã chạy `node --check`
qua, không lỗi cú pháp.
