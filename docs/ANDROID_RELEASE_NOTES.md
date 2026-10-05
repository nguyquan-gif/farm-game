# Green Valley Farm 0.2 — Mùa hội trở về

Đây là **alpha / internal testing build**, APK debug để cài thử ngoài Google Play.

- Thế giới nông trại vẽ mới, chân dung Linh, HUD gọn và thu hoạch trực tiếp trên bản đồ.
- Hai chương có mở đầu, diễn biến và kết thúc: 13 cột mốc tới đêm hội mùa xanh.
- Ba giống cây; tưới tăng sản lượng; ngày mưa; đơn hàng của Linh, Mai, Bình; thưởng ngày trọn vẹn; nâng cấp đàn gà bằng ngọc kiếm được.
- Cây, gà, ống nước, mái nhà, chợ và hội mùa thay đổi theo tiến trình.
- Giữ energy tối đa 5, ngày mới/quà hàng xóm/nước miễn phí. Không có thanh toán hoặc quảng cáo chặn tiến trình.
- Save schema 6 chuyển tiếp bản lưu 0.1 trong cùng dữ liệu ứng dụng; Cài đặt có Reset Progress để chơi lại phần mở đầu.

**Cài APK:** tải `GreenValleyFarm-v0.2.0-debug.apk`, mở trên Android và cho phép **Install unknown apps / Cài ứng dụng không rõ nguồn gốc** khi được hỏi. Game lưu cục bộ trên thiết bị, không có đồng bộ tài khoản.

Bản 0.1 được ký bằng debug key tạm của lần CI trước. Nếu Android báo `App not installed` / `INSTALL_FAILED_UPDATE_INCOMPATIBLE` khi cài đè, chữ ký không trùng: cần gỡ bản cũ rồi cài bản 0.2; việc gỡ app sẽ xóa tiến trình cũ. Các build CI debug độc lập có thể khác chữ ký. Để cập nhật giữ tiến trình, build bằng cùng debug key trên máy của bạn; bản production cần signing key riêng lưu an toàn ngoài Git.

Kiểm tra: lint, 13 bài test logic, hai chương qua UI, lưu/reset, 7 kích thước màn hình từ 360px, mọi tab/khu vực, vùng chạm không bị che, focus/Escape/vuốt đóng sheet, reduced motion. Chưa xác minh trải nghiệm trên điện thoại Android thật, haptic/native Back và thời lượng người chơi mới; đây không phải bản production đã playtest rộng.
