// ============================================ //
// ─── ADMIN: MÃ QR CỐ ĐỊNH VÀO GAME ───
//
// File độc lập: chỉ THÊM 1 khối QR vào cuối màn hình Admin.
// - Bấm vào ảnh QR  -> phóng to toàn màn hình (có nút X góc phải trên để đóng)
// - Nút "Lưu ảnh QR" -> tải ảnh QR về máy
// Không đụng vào state, P2P, hay bất kỳ logic game nào.
// Ảnh QR được nhúng thẳng trong file này (không cần upload thêm ảnh).
// Muốn đổi link game: tạo QR mới rồi thay chuỗi QR_DATA_URI bên dưới.
//
(function () {
    'use strict';

    var QR_DATA_URI = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAABwgAAAcIAQAAAAAA6KgrAAAWfmNhQlgAABZ+anVtYgAAAB5qdW1kYzJwYQARABCAAACqADibcQNjMnBhAAAAFlhqdW1iAAAAR2p1bWRjMm1hABEAEIAAAKoAOJtxA3VybjpjMnBhOjE3NDQ3NmIwLWE2MDktNGI4Ni04NzM4LWY3ZjMxMjkyZWQxYgAAAAOTanVtYgAAAClqdW1kYzJhcwARABCAAACqADibcQNjMnBhLmFzc2VydGlvbnMAAAAAuGp1bWIAAABEanVtZGNib3IAEQAQgAAAqgA4m3ETYzJwYS5pbmdyZWRpZW50LnYzAAAAABhjMnNoVouPiHwrBYfbUeM5w2uSfAAAAGxjYm9yo2lkYzpmb3JtYXRpaW1hZ2UvcG5namluc3RhbmNlSUR4LHhtcDppaWQ6ZjIzNDdhZDYtOTFkYS00M2Q3LTlhMzktZDc4NTI4YzdiNDJibHJlbGF0aW9uc2hpcGhwYXJlbnRPZgAAAeJqdW1iAAAAQWp1bWRjYm9yABEAEIAAAKoAOJtxE2MycGEuYWN0aW9ucy52MgAAAAAYYzJzaGWNFz/XLlJVOtw5J5hXEGYAAAGZY2JvcqJnYWN0aW9uc4KiZmFjdGlvbmtjMnBhLm9wZW5lZGpwYXJhbWV0ZXJzoWtpbmdyZWRpZW50c4GiY3VybHgtc2VsZiNqdW1iZj1jMnBhLmFzc2VydGlvbnMvYzJwYS5pbmdyZWRpZW50LnYzZGhhc2hYIMTcLyPrtTL/atfgyDN0AK8HKmHMLWLLpghVBTjsA7gRpGZhY3Rpb254HWNvbS5hbnRocm9waWMuY2xhdWRlLnByb3ZpZGVkanBhcmFtZXRlcnOheB9jb20uYW50aHJvcGljLm9yaWdpbi1jb25maWRlbmNlZ3Vua25vd25rZGVzY3JpcHRpb254ZkNsYXVkZSBwcm92aWRlZCB0aGlzIGZpbGUgYXQgdGhlIHJlcXVlc3Qgb2YgYSB1c2VyIGFuZCBtYXkgaGF2ZSBjcmVhdGVkIG9yIG1vZGlmaWVkIHRoZSBmaWxlIGNvbnRlbnRzLm1zb2Z0d2FyZUFnZW50oWRuYW1lZkNsYXVkZXJhbGxBY3Rpb25zSW5jbHVkZWT1AAAAyGp1bWIAAABAanVtZGNib3IAEQAQgAAAqgA4m3ETYzJwYS5oYXNoLmRhdGEAAAAAGGMyc2gwI67h7K2+QdGOIqU8wbeNAAAAgGNib3KlY2FsZ2ZzaGEyNTZjcGFkTQAAAAAAAAAAAAAAAABkaGFzaFggevhJTZZIiJtyuqGdLksn7TOg1+8NrwQActHlSNFdxRdkbmFtZW5qdW1iZiBtYW5pZmVzdGpleGNsdXNpb25zgaJlc3RhcnQYIWZsZW5ndGgZFooAAAI+anVtYgAAACdqdW1kYzJjbAARABCAAACqADibcQNjMnBhLmNsYWltLnYyAAAAAg9jYm9ypWNhbGdmc2hhMjU2aXNpZ25hdHVyZXhNc2VsZiNqdW1iZj0vYzJwYS91cm46YzJwYToxNzQ0NzZiMC1hNjA5LTRiODYtODczOC1mN2YzMTI5MmVkMWIvYzJwYS5zaWduYXR1cmVqaW5zdGFuY2VJRHgseG1wOmlpZDo0Mzc1NDdiMS0yODgyLTQ4Y2QtYWIzNS1kODJlYjNiM2MzMzByY3JlYXRlZF9hc3NlcnRpb25zg6JjdXJseC1zZWxmI2p1bWJmPWMycGEuYXNzZXJ0aW9ucy9jMnBhLmluZ3JlZGllbnQudjNkaGFzaFggxNwvI+u1Mv9q1+DIM3QArwcqYcwtYsumCFUFOOwDuBGiY3VybHgqc2VsZiNqdW1iZj1jMnBhLmFzc2VydGlvbnMvYzJwYS5hY3Rpb25zLnYyZGhhc2hYIEj5E/zc2nWg4sX67+lXPpabuqvFFv5gv0x/0WQPGgUxomN1cmx4KXNlbGYjanVtYmY9YzJwYS5hc3NlcnRpb25zL2MycGEuaGFzaC5kYXRhZGhhc2hYIMBZlwk1O91LRBTg3ngZRNJN7XjJgmg4TwlIzKAPZ5YGdGNsYWltX2dlbmVyYXRvcl9pbmZvo2RuYW1lb0FudGhyb3BpYyBGaWxlc2d2ZXJzaW9uZTEuMC4wa3NwZWNWZXJzaW9uZTIuNC4wAAAQOGp1bWIAAAAoanVtZGMyY3MAEQAQgAAAqgA4m3EDYzJwYS5zaWduYXR1cmUAAAAQCGNib3LShFkCEqIBJhghWQIKMIICBjCCAY2gAwIBAgIUQOWgCu7COdC+uIP6BkIFPWdVEwAwCgYIKoZIzj0EAwMwSTEXMBUGA1UEChMOQW50aHJvcGljLCBQQkMxLjAsBgNVBAMTJUFudGhyb3BpYyBDb250ZW50IENyZWRlbnRpYWxzIFJvb3QgQ0EwHhcNMjYwODA3MTg0MzU2WhcNMjgwODA2MTk0MzU2WjBEMRcwFQYDVQQKEw5BbnRocm9waWMsIFBCQzEpMCcGA1UEAxMgQW50aHJvcGljIENsYXVkZSBDb250ZW50IFNpZ25pbmcwWTATBgcqhkjOPQIBBggqhkjOPQMBBwNCAASYegpry1AYBRTVNL1CpTlbROnY3dey+UrsF9C3phYrATN3ZHf93Mo8RQN0KOUuOn19P4oWNFWe5n2/She9N7eTo1gwVjAOBgNVHQ8BAf8EBAMCB4AwFQYDVR0lBA4wDAYKKwYBBAGD6F4CATAMBgNVHRMBAf8EAjAAMB8GA1UdIwQYMBaAFM5R4gSBTmRbI/jjxM+aPpzB11zCMAoGCCqGSM49BAMDA2cAMGQCMDFzHRSeAXrSy1WOzkbhPZ6Km2wGTmZ/2gK18k8BQGXyqz88Rdrz6CTX9flAnYNVxgIwcF9c3fVhqmJKpi+UhasNUMko69cyX6STPfta3Q8EjyzDjzoyrol46FP6VFHhvUcJoWNwYWRZDZ4AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD2WEAMSzVk/QAhsXD5Nnz9LVSUGF7zd5Houxw8W9MzfjZM6yU4ltMJjdtxKsc3tcRgf3513gZ69Zuh6Ug69WKJiKavnnJpYwAAC0xJREFUeJzt3cFu6zgWQEF6MP//y5ndMyJcykw/NAalnFoEsS3JPuD2gnx9rYf7z//7B/zrKvRV6KvQV6GvQl+Fvgp9Ffoq9FXoq9BXoa9CX4W+Cn0V+ir0Veir0Fehr0Jfhb4KfRX6KvRV6KvQV6GvQl+Fvgp9Ffoq9FXoq9BXoa9CX4W+Cn0V+ir0Veir0Fehr0Jfhb4KfRX6KvRV6KvQV6GvQl+Fvgp9Ffoq9FXoq9BXoa9CX4W+Cn0V+ir0Veir0Fehr0Jfhb4KfRX6KvRV6KvQV6GvQl+Fvgp9/53efH2+7+v7dZeX2zsuj3/fNj3vH/6qi+evYYW+Cn0V+ir0Veir0Fehr0Jfhb4KfRX6KvRV6KvQV6GvQl+Fvgp9FfrGeZq11jybstaa51ouMzFfw6fTk7cjMts7fvSr1lq/YQ0r9FXoq9BXoa9CX4W+Cn0V+ir0Veir0Fehr0Jfhb4KfRX6KvRV6KvQt5+nWWvdzLVc3rtcN205Mw3aTA/YTuX86Fe9PX8NK/RV6KvQV6GvQl+Fvgp9Ffoq9FXoq9BXoa9CX4W+Cn0V+ir0Veir0PdhnubedvRl2k9m2kDm/tSo+6GaU89fwwp9Ffoq9FXoq9BXoa9CX4W+Cn0V+ir0Veir0Fehr0Jfhb4KfRX6KvT91TzNWmseqtke/3SwSc1fD9BcPH8NK/RV6KvQV6GvQl+Fvgp9Ffoq9FXoq9BXoa9CX4W+Cn0V+ir0Veir0PdhnuZ+uGW7s8z9dMzpcU2v3SU/Grl5/hpW6KvQV6GvQl+Fvgp9Ffoq9FXoq9BXoa9CX4W+Cn0V+ir0Veir0Fehbz9PM53PNLnMzky3TdvVbLewme74+a96e/4aVuir0Fehr0Jfhb4KfRX6KvRV6KvQV6GvQl+Fvgp9Ffoq9FXoq9BXoW+cp/nR/i/3ozTr9tMfTcf8w4Ognr+GFfoq9FXoq9BXoa9CX4W+Cn0V+ir0Veir0Fehr0Jfhb4KfRX6KvRV6Ptw3tN0NNP2HKf3e6eTNdPL6b/tCVEHR0c9fw0r9FXoq9BXoa9CX4W+Cn0V+ir0Veir0Fehr0Jfhb4KfRX6KvRV6KvQ92GeZq11NPWyvl8y3fa+ZDsOczCGcz/HM3n+Glboq9BXoa9CX4W+Cn0V+ir0Veir0Fehr0Jfhb4KfRX6KvRV6KvQV6HvdXCK0jTmsp2xed/xNfw33bt1P65zcMda6zesYYW+Cn0V+ir0Veir0Fehr0Jfhb4KfRX6KvRV6KvQV6GvQl+Fvgp9FfrG/Wm2czKXnWWmjWa+/vy5XLK9ePq21/f/tkM/B0dMPX8NK/RV6KvQV6GvQl+Fvgp9Ffoq9FXoq9BXoa9CX4W+Cn0V+ir0Veir0DfO07zHXLYHMl0mZu4Hbe7Hay7uT43abnqz9fw1rNBXoa9CX4W+Cn0V+ir0Veir0Fehr0Jfhb4KfRX6KvRV6KvQV6GvQt84T7N1MDZzeTlN5Wwfevrl94dNXTx/DSv0Veir0Fehr0Jfhb4KfRX6KvRV6KvQV6GvQl+Fvgp9Ffoq9FXoq9D3moZRtqMq90czre+fbjeVWd9fHuwxc/8z7idrnr+GFfoq9FXoq9BXoa9CX4W+Cn0V+ir0Veir0Fehr0Jfhb4KfRX6KvRV6Ptw3tP689/2pKZpWObg0+3FF9txnVPPX8MKfRX6KvRV6KvQV6GvQl+Fvgp9Ffoq9FXoq9BXoa9CX4W+Cn0V+ir0HZ/3tB2vWX9ebnevmTazmbamubzc7kpzecD9LjfPX8MKfRX6KvRV6KvQV6GvQl+Fvgp9Ffoq9FXoq9BXoa9CX4W+Cn0V+ir0fZinOZ1w+frz5/RIqMnBBjfbAZrtnjXPX8MKfRX6KvRV6KvQV6GvQl+Fvgp9Ffoq9FXoq9BXoa9CX4W+Cn0V+ir0vbZzKPdbyWyPZro//mm6ePu9ly8/3fTm4vlrWKGvQl+Fvgp9Ffoq9FXoq9BXoa9CX4W+Cn0V+ir0Veir0Fehr0Jfhb5xf5rLYMzpTjA/Op/pcsl2G5r7rzzw/DWs0Fehr0Jfhb4KfRX6KvRV6KvQV6GvQl+Fvgp9Ffoq9FXoq9BXoa9C3zhPcz/cMh25dH/U0+meNe87tl+0vXjr+WtYoa9CX4W+Cn0V+ir0Veir0Fehr0Jfhb4KfRX6KvRV6KvQV6GvQl+FvvG8p+0gy7QDzel77wdMQzDbw5wOftr9kM7z17BCX4W+Cn0V+ir0Veir0Fehr0Jfhb4KfRX6KvRV6KvQV6GvQl+Fvgp9+/1ppve2MyzvMZeDvWgOdq/ZHgR1eejBGM7z17BCX4W+Cn0V+ir0Veir0Fehr0Jfhb4KfRX6KvRV6KvQV6GvQl+Fvgp94zzNNB1zcFzTj7aruR++ORibmYZvJs9fwwp9Ffoq9FXoq9BXoa9CX4W+Cn0V+ir0Veir0Fehr0Jfhb4KfRX6KvSN8zT3ppGW7XDLZWLm8un29KbtB/fPmzx/DSv0Veir0Fehr0Jfhb4KfRX6KvRV6KvQV6GvQl+Fvgp9Ffoq9FXoq9D3mracmYZb3i/fl2z3ndk+4P696Wdsv3J7VtTF89ewQl+Fvgp9Ffoq9FXoq9BXoa9CX4W+Cn0V+ir0Veir0Fehr0Jfhb4Kfft5mu2AysEkzP3F2/mc6ZLLe/fjOtNvef4aVuir0Fehr0Jfhb4KfRX6KvRV6KvQV6GvQl+Fvgp9Ffoq9FXoq9BXoe/DeU/TXMvBoM10yekozeXiaQea06Oe1lq/YQ0r9FXoq9BXoa9CX4W+Cn0V+ir0Veir0Fehr0Jfhb4KfRX6KvRV6KvQ92GeZq11c6zT5eX9iMzkMjEzjci8hv/eT77fSWet9RvWsEJfhb4KfRX6KvRV6KvQV6GvQl+Fvgp9Ffoq9FXoq9BXoa9CX4W+Cn3jPM3X8N/06WXW5ev2uvupl+nbtlM5p+M6a63fsIYV+ir0Veir0Fehr0Jfhb4KfRX6KvRV6KvQV6GvQl+Fvgp9Ffoq9FXoe00TKQdHKW0nXC6fXnag2T5getT20Kfpku1Dn7+GFfoq9FXoq9BXoa9CX4W+Cn0V+ir0Veir0Fehr0Jfhb4KfRX6KvRV6Nuf93Qw8DJdvB2buZ+Oma67/0EHd6y1fsMaVuir0Fehr0Jfhb4KfRX6KvRV6KvQV6GvQl+Fvgp9Ffoq9FXoq9BXoW8/T7PW+rSpzPTpdMmP3rscIjV90XTbdvzn+WtYoa9CX4W+Cn0V+ir0Veir0Fehr0Jfhb4KfRX6KvRV6KvQV6GvQl+Fvg/zNAe2QzDr+3v3+8lMO9Vsn/LafdHk+WtYoa9CX4W+Cn0V+ir0Veir0Fehr0Jfhb4KfRX6KvRV6KvQV6GvQl+Fvr+fp7k4PSZqe9TT6R2v4eLpy5+/hhX6KvRV6KvQV6GvQl+Fvgp9Ffoq9FXoq9BXoa9CX4W+Cn0V+ir0Vej7ME+znY55f/ra/Xf/gMuONveP2u5oc+D5a1ihr0Jfhb4KfRX6KvRV6KvQV6GvQl+Fvgp9Ffoq9FXoq9BXoa9CX4W+/TzN6XlKb9PUy8/v2A7aTA6+7flrWKGvQl+Fvgp9Ffoq9FXoq9BXoa9CX4W+Cn0V+ir0Veir0Fehr0Jfhb7X6TYvrOevYYW+Cn0V+ir0Veir0Fehr0Jfhb4KfRX6KvRV6KvQV6GvQl+Fvgp9Ffoq9FXoq9BXoa9CX4W+Cn0V+ir0Veir0Fehr0Jfhb4KfRX6KvRV6KvQV6GvQl+Fvgp9Ffoq9FXoq9BXoa9CX4W+Cn0V+ir0Veir0Fehr0Jfhb4KfRX6KvRV6KvQV6GvQl+Fvgp9Ffoq9FXoq9BXoa9CX4W+Cn0V+ir0Veir0Feh73/ge1Ut3r63AwAAAABJRU5ErkJggg==';
    var QR_FILE_NAME = 'QR-Dau-Truong-Tri-Thuc.png';

    try {
        var adminScreen = document.getElementById('screen-admin');
        if (!adminScreen || document.getElementById('dttt-qr-box')) return;

        // ── A. CSS (mọi selector đều có tiền tố dttt-qr- hoặc gắn riêng #screen-admin) ──
        var style = document.createElement('style');
        style.textContent = [
            /* Màn hình admin cuộn được trên điện thoại (không ảnh hưởng màn khác) */
            '#screen-admin{overflow-y:auto;overflow-x:hidden;-webkit-overflow-scrolling:touch;overscroll-behavior:contain;}',
            '#screen-admin > *{flex-shrink:0;}',

            '#dttt-qr-box{margin-top:18px;padding:14px;border:1px solid #334155;border-radius:10px;',
            'background:#0f172a;display:flex;align-items:center;gap:16px;flex-wrap:wrap;box-sizing:border-box;}',
            '#dttt-qr-thumb{width:140px;height:140px;border-radius:8px;background:#fff;cursor:pointer;',
            'display:block;flex:0 0 auto;-webkit-tap-highlight-color:transparent;border:0;padding:0;}',
            '#dttt-qr-thumb:hover{box-shadow:0 0 0 3px #1a5b9c;}',
            '#dttt-qr-info{flex:1 1 160px;min-width:0;display:flex;flex-direction:column;align-items:flex-start;}',
            '#dttt-qr-title{font-weight:bold;color:#fbbf24;font-size:15px;margin-bottom:4px;}',
            '#dttt-qr-hint{color:#94a3b8;font-size:13px;line-height:1.4;margin-bottom:6px;}',
            '#dttt-qr-save{margin:0;}',

            /* Lớp phủ toàn màn hình */
            '#dttt-qr-overlay{display:none;position:fixed;top:0;left:0;right:0;bottom:0;',
            'background:rgba(2,6,23,.94);z-index:1000000;align-items:center;justify-content:center;',
            'flex-direction:column;padding:16px;box-sizing:border-box;}',
            '#dttt-qr-overlay.dttt-qr-open{display:flex;}',
            '#dttt-qr-big{width:min(92vw,86vh);height:min(92vw,86vh);max-width:900px;max-height:900px;',
            'background:#fff;border-radius:12px;object-fit:contain;display:block;}',
            '#dttt-qr-big-hint{color:#cbd5e1;font-size:14px;margin-top:12px;text-align:center;}',
            '#dttt-qr-close{position:absolute;top:calc(env(safe-area-inset-top,0px) + 12px);',
            'right:calc(env(safe-area-inset-right,0px) + 12px);margin:0;padding:0;width:46px;height:46px;',
            'border-radius:50%;background:#d90429;color:#fff;font-size:26px;line-height:46px;',
            'text-align:center;font-weight:bold;box-shadow:0 2px 10px rgba(0,0,0,.5);}',
            '#dttt-qr-close:hover{background:#ef233c;}'
        ].join('\n');
        document.head.appendChild(style);

        // ── B. KHỐI QR TRONG MÀN HÌNH ADMIN ──
        var box = document.createElement('div');
        box.id = 'dttt-qr-box';
        box.innerHTML =
            '<img id="dttt-qr-thumb" alt="Mã QR vào game" title="Bấm để phóng to" src="' + QR_DATA_URI + '">' +
            '<div id="dttt-qr-info">' +
                '<div id="dttt-qr-title">📱 Mã QR vào game</div>' +
                '<div id="dttt-qr-hint">Cho người chơi quét để vào thẳng game. Bấm vào ảnh để phóng to.</div>' +
                '<button id="dttt-qr-save" type="button">💾 Lưu ảnh QR</button>' +
            '</div>';
        adminScreen.appendChild(box);

        // ── C. LỚP PHỦ PHÓNG TO (gắn vào body để không bị #app cắt / transform ảnh hưởng) ──
        var overlay = document.createElement('div');
        overlay.id = 'dttt-qr-overlay';
        overlay.setAttribute('role', 'dialog');
        overlay.setAttribute('aria-label', 'Mã QR vào game');
        overlay.innerHTML =
            '<button id="dttt-qr-close" type="button" aria-label="Đóng">✕</button>' +
            '<img id="dttt-qr-big" alt="Mã QR vào game" src="' + QR_DATA_URI + '">' +
            '<div id="dttt-qr-big-hint">Chạm ra ngoài hoặc bấm ✕ để đóng</div>';
        document.body.appendChild(overlay);

        function openOverlay() { overlay.classList.add('dttt-qr-open'); }
        function closeOverlay() { overlay.classList.remove('dttt-qr-open'); }

        document.getElementById('dttt-qr-thumb').addEventListener('click', openOverlay);
        document.getElementById('dttt-qr-close').addEventListener('click', function (e) {
            e.stopPropagation();
            closeOverlay();
        });
        // Bấm ra vùng tối bên ngoài ảnh cũng đóng (bấm lên chính ảnh thì không đóng)
        overlay.addEventListener('click', function (e) {
            if (e.target === overlay || e.target.id === 'dttt-qr-big-hint') closeOverlay();
        });
        document.addEventListener('keydown', function (e) {
            if ((e.key === 'Escape' || e.key === 'Esc') && overlay.classList.contains('dttt-qr-open')) closeOverlay();
        });

        // ── D. NÚT LƯU ẢNH ──
        function notify(msg, type) {
            if (typeof window._dttt_toast === 'function') {
                try { window._dttt_toast(msg, type || 'suc', 3000); return; } catch (err) { /* rơi xuống alert */ }
            }
            alert(msg);
        }

        function dataUriToBlob(uri) {
            var parts = uri.split(',');
            var bin = atob(parts[1]);
            var arr = new Uint8Array(bin.length);
            for (var i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
            return new Blob([arr], { type: 'image/png' });
        }

        document.getElementById('dttt-qr-save').addEventListener('click', function () {
            try {
                var blob = dataUriToBlob(QR_DATA_URI);
                var url = URL.createObjectURL(blob);
                var a = document.createElement('a');
                a.href = url;
                a.download = QR_FILE_NAME;
                a.style.display = 'none';
                document.body.appendChild(a);
                a.click();
                setTimeout(function () {
                    document.body.removeChild(a);
                    URL.revokeObjectURL(url);
                }, 1500);
                notify('✅ Đã tải ảnh QR về máy!', 'suc');
            } catch (err) {
                // Trình duyệt không cho tải tự động -> mở ảnh to để giữ lâu rồi lưu thủ công
                openOverlay();
                notify('Không tải tự động được. Hãy giữ lâu vào ảnh QR rồi chọn Lưu ảnh.', 'wrn');
            }
        });
    } catch (err) {
        console.error('[QR Admin] Lỗi khởi tạo (không ảnh hưởng game):', err);
    }
})();
