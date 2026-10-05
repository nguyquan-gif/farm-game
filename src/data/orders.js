export const FIRST_ORDER = {
  id: "first",
  name: "Bữa cơm đoàn tụ",
  person: "Linh",
  note: "Bữa cơm đầu tiên để gọi mọi người về chợ.",
  needs: { veg: 3, eggs: 1 },
  coins: 70,
  gems: 1,
};
export const SPECIAL_ORDER = {
  id: "special",
  name: "Bữa trưa của chú Bình",
  person: "Chú Bình",
  note: "Chú mang bàn ghế đến. Cháu lo bữa trưa nhé!",
  needs: { tomatoes: 4, eggs: 2 },
  coins: 120,
  gems: 1,
};
export const FEAST_ORDER = {
  id: "feast",
  name: "Giỏ nông sản hội mùa",
  person: "Cả thung lũng",
  note: "Mỗi món từ khu vườn đều có một chỗ trên bàn tiệc.",
  needs: { veg: 3, tomatoes: 2, flowers: 3, eggs: 2 },
  coins: 100,
  gems: 0,
};
export function dailyOrders(state) {
  return [
    {
      id: "linh",
      name: "Bếp nhỏ của Linh",
      person: "Linh",
      note: "Canh cải và trứng hấp cho bữa cơm trưa.",
      needs: { veg: 3, eggs: 1 },
      coins: 70,
      gems: 1,
    },
    {
      id: "mai",
      name: "Giỏ rau cô Mai",
      person: "Cô Mai",
      note: "Một giỏ cải cho những người khách ghé làng.",
      needs: { veg: state.day % 2 ? 6 : 4 },
      coins: state.day % 2 ? 100 : 65,
      gems: 0,
    },
    ...(state.houseFixed
      ? [
          {
            id: "binh",
            name: "Bếp vườn chú Bình",
            person: "Chú Bình",
            note: "Cà chua nhà trồng lúc nào cũng ngọt hơn.",
            needs: { tomatoes: 4, eggs: 1 },
            coins: 125,
            gems: 1,
          },
        ]
      : []),
  ];
}
export const canFulfill = (state, order) =>
  Object.entries(order.needs).every(([item, count]) => state[item] >= count);
