// ─── ADMIN SECURITY PATCH ───

// Mật khẩu ADMIN_PASSWORD giờ nằm riêng ở file 00-admin-config.js
// (load trước file này trong index.html), sửa mật khẩu thì mở file đó.

// Ghi đè lại sự kiện click của nút vào Admin đã viết ở Phần 2
const btnGotoAdmin = document.getElementById('btn-goto-admin');

// Xóa sự kiện cũ bằng cách clone node (mẹo JS thuần để reset event listener)
const newBtnGotoAdmin = btnGotoAdmin.cloneNode(true);
btnGotoAdmin.parentNode.replaceChild(newBtnGotoAdmin, btnGotoAdmin);

// Gắn sự kiện mới có check pass
newBtnGotoAdmin.addEventListener('click', () => {
    let pass = prompt("Khu vực tuyệt mật. Vui lòng nhập mã PIN Admin:");
    
    if (pass === ADMIN_PASSWORD) {
        changeScreen('screen-admin');
        alert("Xác thực thành công. Chào mừng Admin!");
    } else if (pass !== null) {
        alert("Sai mật khẩu! Cút ra ngoài.");
    }
});

// Chỉnh lại một chút UI màn hình Admin cho ngầu
document.getElementById('screen-admin').insertAdjacentHTML('afterbegin', '<div style="color: #10b981; font-weight: bold; margin-bottom: 10px;">[🔒 KẾT NỐI ADMIN ĐƯỢC MÃ HÓA]</div>');
