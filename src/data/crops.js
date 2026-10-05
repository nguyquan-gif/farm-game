export const CROPS = {
  greens: {
    name: "Cải ngọt",
    item: "veg",
    time: 120_000,
    yield: 3,
    seeds: 1,
    price: 15,
    color: "#72ad49",
    description: "Lớn nhanh · giỏ rau hằng ngày",
    unlock: null,
  },
  tomato: {
    name: "Cà chua",
    item: "tomatoes",
    time: 240_000,
    yield: 4,
    seeds: 2,
    price: 24,
    color: "#de654a",
    description: "Giá trị cao · đơn của chú Bình",
    unlock: "houseFixed",
  },
  sunflower: {
    name: "Hướng dương",
    item: "flowers",
    time: 360_000,
    yield: 3,
    seeds: 2,
    price: 18,
    color: "#efba42",
    description: "Dành cho đêm hội mùa",
    unlock: "specialOrder",
  },
};
export const cropUnlocked = (state, id) =>
  id === "greens" ||
  (id === "tomato"
    ? state.houseFixed
    : id === "sunflower" && state.milestones.specialOrder);
export const ITEM_NAMES = {
  veg: "Cải ngọt",
  eggs: "Trứng",
  tomatoes: "Cà chua",
  flowers: "Hướng dương",
};
