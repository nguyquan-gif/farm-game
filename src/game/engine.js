import {
  createInitialState,
  MAX_ENERGY,
  GROW_TIME,
  EGG_TIME,
} from "./state.js";
import { MISSIONS } from "../data/missions.js";
export function missionIndex(state) {
  const i = MISSIONS.findIndex((m) => !state.milestones[m.flag]);
  return i < 0 ? MISSIONS.length : i;
}
export function resolveTimers(state, now) {
  let changed = false;
  const plots = state.plots.map((p) => {
    if (p.state === "growing" && p.readyAt <= now) {
      changed = true;
      return { ...p, state: "ready" };
    }
    return p;
  });
  const ready = state.coop.status === "fed" && state.coop.readyAt <= now;
  if (!changed && !ready) return state;
  return {
    ...state,
    plots,
    coop: ready ? { status: "egg-ready", readyAt: 0 } : state.coop,
  };
}
export function zoneStatus(state, zone) {
  if (zone === "field")
    return state.plots.some((p) => p.state === "ready")
      ? "Sẵn sàng hái"
      : state.plots.some((p) => p.state === "growing")
        ? "Rau đang lớn"
        : "Đất chờ hạt";
  if (zone === "coop")
    return {
      hungry: "Gà đang đói",
      fed: "Gà đã ăn no",
      "egg-ready": "Có trứng mới",
    }[state.coop.status];
  if (zone === "water")
    return !state.waterFixed
      ? "Ống đang rò"
      : state.water < 20
        ? "Nước sắp cạn"
        : `Ổn định · ${state.water}%`;
  if (zone === "house")
    return state.houseFixed ? "Mái nhà ấm" : "Nghỉ ngơi ở đây";
  return state.milestones.market
    ? "Chợ đang mở"
    : state.milestones.order
      ? "Sẵn sàng mở chợ"
      : missionIndex(state) >= 4
        ? "Linh đợi đơn hàng"
        : "Mở sau 4 nhiệm vụ";
}
const energyError =
  "Hết năng lượng. Sang ngày mới miễn phí để hồi đủ 5 năng lượng.";
// Atomic transitions prevent stale UI events from duplicating rewards or partial deductions.
export function applyAction(original, action, now = Date.now()) {
  const state = resolveTimers(original, now),
    fail = (message) => ({ state, ok: false, message, sound: "error" });
  if (action.type === "RESET")
    return {
      state: createInitialState(),
      ok: true,
      message: "Một mùa mới bắt đầu!",
      sound: "sleep",
    };
  if (action.type === "TICK") return { state, ok: true };
  if (action.type === "SETTING") {
    if (
      !["soundOn", "musicOn", "hapticsOn", "starterSeen"].includes(
        action.key,
      ) ||
      typeof action.value !== "boolean"
    )
      return fail("Cài đặt không hợp lệ.");
    return { state: { ...state, [action.key]: action.value }, ok: true };
  }
  const next = { ...state, milestones: { ...state.milestones } };
  let message = "",
    reward = "",
    sound = "click";
  const spend = () => {
    next.energy -= 1;
  };
  const addXp = (amount) => {
    next.xp += amount;
    while (next.xp >= 100) {
      next.xp -= 100;
      next.level += 1;
      next.gems += 2;
      next.coins += 50;
      reward += " · Lên cấp! +50 xu";
      sound = "levelup";
    }
  };
  const plot = state.plots.find((p) => p.id === action.plotId);
  switch (action.type) {
    case "PLANT":
      if (!plot || plot.state !== "empty")
        return fail("Luống này chưa sẵn sàng gieo.");
      if (!state.seeds)
        return fail(
          "Hết hạt. Mua hạt ở Tiếp tế hoặc nhận gói giúp đỡ miễn phí.",
        );
      if (!state.energy) return fail(energyError);
      spend();
      next.seeds -= 1;
      next.plots = state.plots.map((p) =>
        p.id === plot.id
          ? { ...p, state: "growing", readyAt: now + GROW_TIME, watered: false }
          : p,
      );
      message = "Hạt đã gieo. Rau lớn sau 2 phút hoặc vào ngày mới.";
      addXp(5);
      break;
    case "WATER":
      if (!plot || plot.state !== "growing" || plot.watered)
        return fail("Luống này không cần tưới thêm.");
      if (state.water < 10)
        return fail(
          "Thiếu nước. Lấy 30% nước mưa miễn phí tại bể hoặc sang ngày mới.",
        );
      if (!state.energy) return fail(energyError);
      spend();
      next.water -= 10;
      next.plots = state.plots.map((p) =>
        p.id === plot.id
          ? {
              ...p,
              watered: true,
              readyAt: Math.min(p.readyAt, now + GROW_TIME / 2),
            }
          : p,
      );
      message = "Cây đã uống no. Thời gian lớn còn tối đa 1 phút.";
      sound = "harvest";
      addXp(5);
      break;
    case "HARVEST":
      if (!plot || plot.state !== "ready")
        return fail("Rau chưa sẵn sàng thu hoạch.");
      if (!state.energy) return fail(energyError);
      spend();
      next.veg += 3;
      next.coins += 12;
      next.seeds += 1;
      next.plots = state.plots.map((p) =>
        p.id === plot.id
          ? { ...p, state: "empty", readyAt: 0, watered: false }
          : p,
      );
      next.milestones.harvest = true;
      message = "Một giỏ rau tươi và hạt cho mùa sau.";
      reward = "+3 rau · +12 xu";
      sound = "harvest";
      addXp(12);
      break;
    case "REPAIR":
      if (state.waterFixed) return fail("Bể nước đã ổn định rồi.");
      if (state.coins < 40)
        return fail(
          "Cần 40 xu. Thu hoạch rau (+12 xu), bán nông sản hoặc nhận gói giúp đỡ miễn phí.",
        );
      if (!state.energy) return fail(energyError);
      spend();
      next.coins -= 40;
      next.water = 100;
      next.waterFixed = true;
      next.reputation += 10;
      next.milestones.repair = true;
      message = "Đã sửa ống nước. Mỗi đêm bể được bổ sung 25%.";
      reward = "Bể nước đã ổn định";
      sound = "coin";
      addXp(20);
      break;
    case "REFILL":
      if (state.water >= 100) return fail("Bể đã đầy nước.");
      next.water = Math.min(100, state.water + 30);
      message = "Bạn hứng thêm nước mưa, hoàn toàn miễn phí.";
      reward = "+30% nước";
      break;
    case "FEED":
      if (state.coop.status !== "hungry")
        return fail("Gà đã ăn rồi. Hãy đợi và nhặt trứng trước.");
      if (state.feed < 15)
        return fail("Thiếu thức ăn. Nhận gói giúp đỡ miễn phí tại Tiếp tế.");
      if (!state.energy) return fail(energyError);
      spend();
      next.feed -= 15;
      next.coop = { status: "fed", readyAt: now + EGG_TIME };
      next.milestones.feed = true;
      message = "Gà đã ăn no! Trứng sẵn sàng sau 2 phút hoặc vào ngày mới.";
      reward = "Đàn gà đã ăn no";
      addXp(8);
      break;
    case "COLLECT":
      if (state.coop.status !== "egg-ready")
        return fail(
          "Trứng chưa sẵn sàng. Đợi 2 phút sau khi cho ăn hoặc sang ngày mới.",
        );
      if (!state.energy) return fail(energyError);
      spend();
      next.eggs += state.chickens;
      next.coop = { status: "hungry", readyAt: 0 };
      next.milestones.egg = true;
      message = "Trứng tươi đã được cất vào giỏ.";
      reward = `+${state.chickens} trứng`;
      sound = "harvest";
      addXp(10);
      break;
    case "DELIVER":
      if (missionIndex(state) < 4)
        return fail("Hoàn thành bốn nhiệm vụ đầu để gặp Linh.");
      if (state.orderDay === state.day)
        return fail(
          "Linh đã nhận đơn hôm nay. Sang ngày mới để giao tiếp nhé.",
        );
      if (state.veg < 3 || state.eggs < 1)
        return fail(
          "Linh cần 3 rau và 1 trứng. Thu hoạch vườn và nhặt trứng tại chuồng gà.",
        );
      if (!state.energy) return fail(energyError);
      spend();
      next.veg -= 3;
      next.eggs -= 1;
      next.coins += 70;
      next.gems += 1;
      next.reputation += 15;
      next.orderDay = state.day;
      next.milestones.order = true;
      message = "Linh: “Rau của bạn thơm quá! Hẹn ở phiên chợ nhé.”";
      reward = "+70 xu · +1 ngọc";
      sound = "coin";
      addXp(25);
      break;
    case "OPEN_MARKET":
      if (!state.milestones.order)
        return fail("Giao đơn đầu tiên cho Linh để mở phiên chợ.");
      if (state.milestones.market) return fail("Phiên chợ đã mở.");
      if (!state.energy) return fail(energyError);
      spend();
      next.milestones.market = true;
      next.coins += 30;
      next.gems += 2;
      next.reputation += 20;
      message =
        "Chương 1 hoàn thành! Thung lũng đã có phiên chợ của riêng mình.";
      reward = "+30 xu · Chương 2 mở khóa";
      sound = "levelup";
      addXp(20);
      break;
    case "SELL": {
      const reserve = !state.milestones.order,
        vegetables = Math.max(0, state.veg - (reserve ? 3 : 0)),
        eggs = Math.max(0, state.eggs - (reserve ? 1 : 0));
      if (!vegetables && !eggs)
        return fail(
          "Giữ lại 3 rau và 1 trứng cho đơn đầu tiên. Thu hoạch thêm hoặc nhận gói giúp đỡ nếu thiếu xu.",
        );
      if (!state.energy) return fail(energyError);
      const profit = vegetables * 15 + eggs * 22;
      spend();
      next.veg -= vegetables;
      next.eggs -= eggs;
      next.coins += profit;
      message = "Đã bán nông sản dư cho hàng xóm.";
      reward = `+${profit} xu`;
      sound = "coin";
      addXp(5);
      break;
    }
    case "BUY_SEEDS":
      if (state.coins < 15)
        return fail("Cần 15 xu. Nhận gói giúp đỡ miễn phí ngay bên dưới.");
      next.coins -= 15;
      next.seeds += 3;
      message = "Đã mua 3 túi hạt giống.";
      reward = "+3 hạt";
      sound = "coin";
      break;
    case "BUY_FEED":
      if (state.feed >= 100) return fail("Kho thức ăn đã đầy.");
      if (state.coins < 20)
        return fail("Cần 20 xu. Nhận gói giúp đỡ miễn phí ngay bên dưới.");
      next.coins -= 20;
      next.feed = Math.min(100, state.feed + 40);
      message = "Đã bổ sung thức ăn cho đàn gà.";
      reward = "+40% thức ăn";
      sound = "coin";
      break;
    case "HELP":
      if (state.rescueDay === state.day)
        return fail(
          "Đã nhận quà hôm nay. Sang ngày mới miễn phí để nhận tiếp.",
        );
      next.rescueDay = state.day;
      next.coins += 20;
      next.seeds += 2;
      next.feed = Math.min(100, state.feed + 30);
      message =
        "Hàng xóm gửi bạn ít hạt, thức ăn và xu. Mỗi ngày một gói miễn phí.";
      reward = "+20 xu · +2 hạt · +30% thức ăn";
      sound = "coin";
      break;
    case "UPGRADE_FIELD":
      if (!state.milestones.market)
        return fail("Mở phiên chợ trước để bắt đầu nâng cấp.");
      if (state.plots.length >= 3) return fail("Đã mở đủ ba luống rau.");
      if (state.coins < 70)
        return fail("Cần 70 xu. Giao đơn cho Linh hoặc bán nông sản dư.");
      if (!state.energy) return fail(energyError);
      spend();
      next.coins -= 70;
      next.plots = [
        ...state.plots,
        { id: 3, state: "empty", readyAt: 0, watered: false },
      ];
      message = "Luống mới sẵn sàng cho mùa trồng tiếp theo.";
      reward = "+1 luống rau";
      addXp(15);
      break;
    case "UPGRADE_HOUSE":
      if (!state.milestones.market)
        return fail("Hoàn thành Chương 1 để tu sửa nhà.");
      if (state.houseFixed) return fail("Mái nhà đã ấm cúng rồi.");
      if (state.coins < 80)
        return fail("Cần 80 xu. Giao đơn hoặc bán nông sản để kiếm thêm.");
      if (!state.energy) return fail(energyError);
      spend();
      next.coins -= 80;
      next.houseFixed = true;
      next.reputation += 25;
      message = "Bạn tìm thấy cuốn nhật ký của ông dưới mái nhà mới.";
      reward = "Nhật ký của ông mở khóa";
      sound = "levelup";
      addXp(30);
      break;
    case "NEXT_DAY":
      next.day += 1;
      next.energy = MAX_ENERGY;
      next.water = Math.min(100, state.water + (state.waterFixed ? 25 : 10));
      next.feed = Math.max(0, state.feed - 5);
      next.plots = state.plots.map((p) =>
        p.state === "growing" ? { ...p, state: "ready", readyAt: 0 } : p,
      );
      next.coop =
        state.coop.status === "fed"
          ? { status: "egg-ready", readyAt: 0 }
          : state.coop;
      message = `Ngày ${next.day}: rau lớn, nước được bổ sung, năng lượng đầy lại.`;
      reward = "+5 năng lượng · Ngày mới";
      sound = "sleep";
      break;
    default:
      return fail("Hành động không hợp lệ.");
  }
  next.logs = [message, ...state.logs].slice(0, 20);
  return {
    state: next,
    ok: true,
    message,
    reward,
    sound,
    completed: !state.milestones.market && next.milestones.market,
  };
}
