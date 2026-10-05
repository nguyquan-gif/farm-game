export const CHAPTERS = [
  {
    id: 1,
    title: "Lời hẹn ngày trở về",
    subtitle: "Một giỏ rau. Một người bạn. Một khởi đầu.",
    start: 0,
    end: 6,
  },
  {
    id: 2,
    title: "Đêm hội mùa xanh",
    subtitle: "Biến khu vườn của ông thành nơi mọi người trở về.",
    start: 6,
    end: 13,
  },
];
export const MISSIONS = [
  {
    title: "Giỏ rau ông để lại",
    desc: "Thu hoạch luống cải chín ở vườn.",
    target: "field",
    flag: "harvest",
    action: "Hái giỏ rau đầu tiên",
    story:
      "Cậu về thật rồi! Ông vẫn để dành luống cải này cho cậu. Mình muốn dùng nó nấu bữa cơm mở lại phiên chợ của làng.",
    reward: "+3 cải · +12 xu",
    chapter: 1,
  },
  {
    title: "Nối lại dòng nước",
    desc: "Sửa đường ống · 40 xu và 1 năng lượng.",
    target: "water",
    flag: "repair",
    action: "Đến bể nước",
    story:
      "Rau mới hái thơm quá! Nhưng nghe kìa, ống nước đang rò. Chú Bình để sẵn đồ nghề. Sửa nó để khu vườn có nước cho những mùa sau nhé.",
    reward: "Nước hồi nhiều hơn mỗi đêm",
    chapter: 1,
  },
  {
    title: "Bữa sáng của Mơ & Mận",
    desc: "Cho hai cô gà ăn tại chuồng.",
    target: "coop",
    flag: "feed",
    action: "Cho Mơ & Mận ăn",
    story:
      "Dòng nước chảy lại rồi! Hai cô gà Mơ và Mận cũng đang gọi cậu. Cho chúng ăn nhé, bữa cơm làng còn thiếu trứng đấy.",
    reward: "Mở vòng nuôi gà lấy trứng",
    chapter: 1,
  },
  {
    title: "Món quà trong ổ rơm",
    desc: "Chờ trứng hoặc nghỉ sang ngày mới.",
    target: "coop",
    flag: "egg",
    action: "Ghé ổ trứng",
    story:
      "Mơ và Mận cần nghỉ một chút. Trong lúc chờ, cậu thử gieo rồi tưới một luống mới nhé. Hoặc về nhà ngủ, sáng mai vườn và ổ trứng đều sẵn sàng.",
    reward: "+2 trứng tươi",
    chapter: 1,
  },
  {
    title: "Bữa cơm đoàn tụ",
    desc: "Mang 3 cải và 1 trứng cho Linh.",
    target: "market",
    flag: "order",
    action: "Mang giỏ sang cho Linh",
    story:
      "Mình đã nhóm bếp. Cậu mang ba bó cải và một quả trứng nhé. Bữa cơm này sẽ là lời mời mọi người quay lại phiên chợ.",
    reward: "+70 xu · +1 ngọc",
    chapter: 1,
  },
  {
    title: "Phiên chợ thức giấc",
    desc: "Cùng Linh mở lại phiên chợ.",
    target: "market",
    flag: "market",
    action: "Mở cửa phiên chợ",
    story:
      "Mọi người nghe mùi canh đã ghé tới rồi! Cùng mình kéo tấm bạt lên nhé. Nông trại của cậu đã có những vị khách đầu tiên.",
    reward: "Mở bảng đơn hàng · Chương 2",
    chapter: 1,
  },
  {
    title: "Lá thư dưới mái ngói",
    desc: "Tu sửa nhà · 80 xu và 1 năng lượng.",
    target: "house",
    flag: "home",
    action: "Tìm lại lá thư của ông",
    story:
      "Ngày trước ông hay tổ chức hội mùa. Trong nhà vẫn còn hòm hạt giống và lá thư ông để lại. Sửa mái nhà, rồi mình cùng tìm nhé.",
    reward: "Mở giống cà chua",
    chapter: 2,
  },
  {
    title: "Chừa đất cho điều mới",
    desc: "Mở luống thứ ba · 70 xu.",
    target: "field",
    flag: "expansion",
    action: "Mở rộng khu vườn",
    story:
      "“Để dành một khoảng đất cho điều con chưa từng thử.” Ông viết vậy đấy. Mở thêm một luống để trồng cả cải và cà chua cho hội mùa nhé.",
    reward: "+1 luống · thêm lựa chọn trồng",
    chapter: 2,
  },
  {
    title: "Sắc đỏ đầu mùa",
    desc: "Gieo rồi thu hoạch một luống cà chua.",
    target: "field",
    flag: "tomato",
    action: "Trồng cà chua của ông",
    story:
      "Cà chua của ông ngọt lắm, nhưng lớn chậm hơn cải. Mỗi luống cần hai túi hạt. Tưới một lần sẽ lớn nhanh hơn và cho thêm một quả khi hái.",
    reward: "Cà chua cho đơn hàng đặc biệt",
    chapter: 2,
  },
  {
    title: "Một lời mời gửi chú Bình",
    desc: "Giao 4 cà chua và 2 trứng.",
    target: "market",
    flag: "specialOrder",
    action: "Chuẩn bị giỏ của chú Bình",
    story:
      "Chú Bình sẽ mang bàn ghế đến hội mùa. Chú nhờ cậu bốn quả cà chua và hai quả trứng làm bữa trưa. Đổi lại, chú có hạt hướng dương từ vườn nhà.",
    reward: "+120 xu · mở hướng dương",
    chapter: 2,
  },
  {
    title: "Những mặt trời nhỏ",
    desc: "Trồng và thu hoạch hướng dương.",
    target: "field",
    flag: "flowers",
    action: "Trồng hoa cho đêm hội",
    story:
      "Hoa hướng dương là loài ông thích nhất. Mình sẽ cắm một bình ở bàn tiệc. Cậu trồng một luống nhé, còn mình lo đèn và khăn trải bàn.",
    reward: "Hoa trang trí hội mùa",
    chapter: 2,
  },
  {
    title: "Một bàn tiệc từ khu vườn",
    desc: "Góp 3 cải, 2 cà chua, 3 hoa và 2 trứng.",
    target: "market",
    flag: "feast",
    action: "Góp giỏ cho hội mùa",
    story:
      "Bàn ghế đã đủ, chỉ còn giỏ nông sản của cậu. Ba cải, hai cà chua, ba hoa và hai trứng. Không có hạn chót đâu, mình chuẩn bị cùng nhau.",
    reward: "Dựng bàn tiệc · +100 xu",
    chapter: 2,
  },
  {
    title: "Thắp sáng thung lũng",
    desc: "Mở đêm hội và đọc lời nhắn của ông.",
    target: "market",
    flag: "festival",
    action: "Thắp đèn hội mùa",
    story:
      "Cả làng đã ở đây. Từ một luống cải cũ, cậu đã làm được tất cả chuyện này. Cậu thắp chiếc đèn đầu tiên nhé? Ông sẽ vui lắm.",
    reward: "Kết thúc câu chuyện · +3 ngọc",
    chapter: 2,
  },
];
export const CHAPTER_TWO = "Đêm hội mùa xanh";
export const ZONE_NAMES = {
  field: "Vườn của ông",
  coop: "Mơ & Mận",
  water: "Bể nước",
  house: "Mái nhà nhỏ",
  market: "Phiên chợ của Linh",
};
