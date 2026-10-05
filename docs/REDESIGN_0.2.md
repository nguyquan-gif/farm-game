# Hướng sửa bản 0.2 — Mùa hội trở về

## Audit bản 0.1 trước khi sửa

- Stack: React 19, Vite 8, CSS thuần, Capacitor 8; local bằng `npm install` / `npm run dev`.
- Core đang hoạt động: `src/game/state.js`, `src/game/engine.js`, `src/hooks/useGame.js`; giữ transition nguyên tử, timer, localStorage, âm thanh, haptic và Android Back.
- Build và 9 bài test logic cơ bản pass. Chương 1 làm được, nhưng bài test không chứng minh trải nghiệm thú vị.
- Bản đồ SVG cũ là một diorama nhỏ giữa nhiều thẻ thông tin; mỗi vùng mở bảng, chưa có thao tác trực tiếp trên luống.
- Sáu nhiệm vụ nối nhau chủ yếu bằng checklist. Chương 2 chỉ là lời hứa và hai upgrade, thiếu đích đến và phần kết.
- Chỉ có một loại cây và một đơn lặp lại; tưới không tăng sản lượng, ngọc không có công dụng thực tế, nâng cấp ít làm thay đổi cảnh.

## Quyết định thiết kế

Thiết kế mobile game theo chiều dọc. HUD gọn nổi trên cảnh; thế giới là màn hình chính; nhiệm vụ của Linh ở vùng ngón cái; bốn tab cố định. Cảnh nông thôn có suối, mái ngói, vườn, chuồng gà và chợ; không thêm framework hoặc renderer 3D. Hai ảnh WebP local và SVG trạng thái giữ tải nhẹ, không có URL ảnh bên ngoài.

Cốt truyện: trở về vườn ông → bữa cơm mở lại phiên chợ → tìm lá thư/hạt giống → giúp hàng xóm → hội mùa. Mỗi hành động tạo nguồn lực hoặc thay đổi cần cho sự kiện kế tiếp. Hai chương, 13 mốc, có phần kết thật; sau kết vẫn trồng và giao đơn được.

| Cây         | Mở khóa           | Hạt/luống | Thời gian | Sản lượng | Vai trò                           |
| ----------- | ----------------- | --------- | --------- | --------- | --------------------------------- |
| Cải ngọt    | Từ đầu            | 1         | 2 phút    | 3         | Đơn thường, nguồn thu nhanh       |
| Cà chua     | Sửa nhà           | 2         | 4 phút    | 4         | Giỏ của chú Bình, đơn giá trị cao |
| Hướng dương | Giao giỏ chú Bình | 2         | 6 phút    | 3         | Bàn tiệc hội mùa                  |

Tưới dùng 1 năng lượng + 10% nước, giảm thời gian còn lại xuống tối đa nửa thời gian gốc và tăng 1 sản lượng. Ngày mới miễn phí làm cây chín, gà đã ăn có trứng, hồi 5 năng lượng; ngày chia hết cho 3 có mưa, bổ sung 40% nước và tưới cây đang lớn. Giữ lựa chọn đợi timer hoặc nghỉ, không buộc chờ đủ phút.

Mỗi ngày có 2–3 đơn lựa chọn (Linh, Mai, Bình), mỗi đơn chỉ giao một lần/ngày. Quà “Một ngày trọn vẹn” yêu cầu thu hoạch, chăm và giao/bán trong cùng ngày. Ngọc dùng đón thêm gà (tối đa 4), tăng số trứng thu mỗi lượt. Quà hàng xóm, hứng nước và ngủ miễn phí ngăn soft-lock.

Cảnh phản ánh tiến trình: cây trên từng luống; hai đến bốn gà; trứng; ống rò; mái vá được sửa; luống thứ ba mở; quầy hàng và cờ; bàn tiệc, khách và đèn hội. Đêm hội chuyển lại ngày thường khi nghỉ, đồ trang trí được giữ.

## Giới hạn cần đánh giá bằng người chơi

Bài test UI chơi hết hai chương trong 6 ngày game bằng nguồn lực kiếm được, không nạp tiền/tiêm state. Đây là chứng minh tính hoàn thành, không phải chứng minh game vui hay thời lượng chơi của người mới. Mục tiêu 8–15 phút cho Chương 1 cần playtest người thật; người biết đường đi có thể dùng Next Day để hoàn thành nhanh hơn. Không thêm chờ bắt buộc để kéo dài thời lượng.
