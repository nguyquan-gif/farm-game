import { createInitialState, MAX_ENERGY, EGG_TIME } from "./state.js";
import { CROPS, cropUnlocked } from "../data/crops.js";
import {
  FIRST_ORDER,
  SPECIAL_ORDER,
  FEAST_ORDER,
  dailyOrders,
  canFulfill,
} from "../data/orders.js";
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
  const next = {
    ...state,
    milestones: { ...state.milestones },
    daily: { ...state.daily },
    stats: { ...state.stats },
  };
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
  const crop =
    CROPS[
      action.type === "PLANT" ? action.crop || "greens" : plot?.crop || "greens"
    ];
  const deliver = (order) => {
    for (const [key, quantity] of Object.entries(order.needs))
      next[key] -= quantity;
    next.coins += order.coins;
    next.gems += order.gems;
    next.reputation += 10;
    next.stats.deliveries += 1;
    next.daily.trade = true;
    reward = `+${order.coins} xu${order.gems ? ` · +${order.gems} ngọc` : ""}`;
    sound = "coin";
    spend();
    addXp(25);
  };
  switch (action.type) {
    case "PLANT":
      if (!plot || plot.state !== "empty")
        return fail("Luống này chưa sẵn sàng gieo.");
      if (!crop || !cropUnlocked(state, action.crop || "greens"))
        return fail("Giống cây này chưa mở. Hãy tiếp tục câu chuyện của Linh.");
      if (state.seeds < crop.seeds)
        return fail(
          "Hết hạt. Mua hạt ở Tiếp tế hoặc nhận gói giúp đỡ miễn phí.",
        );
      if (!state.energy) return fail(energyError);
      spend();
      next.seeds -= crop.seeds;
      next.plots = state.plots.map((p) =>
        p.id === plot.id
          ? {
              ...p,
              state: "growing",
              readyAt: now + crop.time,
              watered: false,
              crop: action.crop || "greens",
            }
          : p,
      );
      message = `${crop.name} đã gieo. Lớn sau ${crop.time / 60000} phút hoặc vào ngày mới.`;
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
              readyAt: Math.min(p.readyAt, now + crop.time / 2),
            }
          : p,
      );
      next.daily.care = true;
      message =
        "Đã tưới. Cây lớn nhanh hơn và cho thêm 1 nông sản khi thu hoạch.";
      sound = "harvest";
      addXp(5);
      break;
    case "HARVEST":
      if (!plot || plot.state !== "ready")
        return fail("Rau chưa sẵn sàng thu hoạch.");
      if (!state.energy) return fail(energyError);
      spend();
      next[crop.item] += crop.yield + (plot.watered ? 1 : 0);
      next.stats.harvests += 1;
      next.daily.harvest = true;
      if (plot.crop === "tomato") next.milestones.tomato = true;
      if (plot.crop === "sunflower") next.milestones.flowers = true;
      next.coins += 12;
      next.seeds += 1;
      next.plots = state.plots.map((p) =>
        p.id === plot.id
          ? { ...p, state: "empty", readyAt: 0, watered: false }
          : p,
      );
      next.milestones.harvest = true;
      message = "Một giỏ rau tươi và hạt cho mùa sau.";
      reward = `+${crop.yield + (plot.watered ? 1 : 0)} ${crop.name.toLowerCase()} · +12 xu`;
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
      next.daily.care = true;
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
      next.daily.care = true;
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
    case "DELIVER": {
      if (missionIndex(state) < 4)
        return fail("Hoàn thành bốn việc đầu để mở bữa cơm đoàn tụ.");
      const first = !state.milestones.order;
      const order = first
        ? FIRST_ORDER
        : dailyOrders(state).find((o) => o.id === (action.orderId || "linh"));
      if (!first && !state.milestones.market)
        return fail("Mở phiên chợ để nhận đơn mới.");
      if (!order) return fail("Đơn hàng không hợp lệ.");
      if (!first && state.deliveredOrders.includes(order.id))
        return fail("Đã giao đơn này hôm nay. Ngày mới sẽ có đơn tiếp.");
      if (!canFulfill(state, order))
        return fail(
          "Giỏ còn thiếu nông sản. Chạm vào món còn thiếu để đến đúng nơi lấy.",
        );
      if (!state.energy) return fail(energyError);
      deliver(order);
      next.orderDay = state.day;
      next.deliveredOrders = [
        ...state.deliveredOrders,
        first ? "linh" : order.id,
      ];
      next.milestones.order = true;
      message = `${order.person}: “Cảm ơn giỏ nông sản của cậu. Thung lũng ấm hơn từng ngày!”`;
      break;
    }
    case "SPECIAL_ORDER":
      if (!state.milestones.tomato || state.milestones.specialOrder)
        return fail(
          "Hãy thu hoạch cà chua đầu mùa trước. Giỏ này chỉ giao một lần.",
        );
      if (!canFulfill(state, SPECIAL_ORDER))
        return fail(
          "Chú Bình cần 4 cà chua và 2 trứng. Trồng cà chua, cho gà ăn rồi nghỉ sang ngày mới nhé.",
        );
      if (!state.energy) return fail(energyError);
      deliver(SPECIAL_ORDER);
      next.milestones.specialOrder = true;
      next.seeds += 4;
      message =
        "Chú Bình đã mang bàn ghế và hạt hướng dương tới. Hội mùa đang gần hơn!";
      reward += " · Mở hướng dương · +4 hạt";
      break;
    case "PREPARE_FEAST":
      if (!state.milestones.flowers || state.milestones.feast)
        return fail("Thu hoạch hướng dương rồi hãy góp giỏ hội mùa.");
      if (!canFulfill(state, FEAST_ORDER))
        return fail(
          "Giỏ hội mùa cần 3 cải, 2 cà chua, 3 hoa và 2 trứng. Không có hạn chót.",
        );
      if (!state.energy) return fail(energyError);
      deliver(FEAST_ORDER);
      next.milestones.feast = true;
      message = "Bàn tiệc đã đủ đầy. Cả làng đang chờ cậu thắp đèn.";
      break;
    case "START_FESTIVAL":
      if (!state.milestones.feast || state.milestones.festival)
        return fail("Chuẩn bị bàn tiệc trước khi thắp đèn hội mùa.");
      if (!state.energy) return fail(energyError);
      spend();
      next.milestones.festival = true;
      next.festivalDay = state.day;
      next.gems += 3;
      next.reputation += 50;
      reward = "+3 ngọc · Một thung lũng đầy ánh sáng";
      message =
        "Linh: “Điều ông để lại không chỉ là khu vườn. Là một nơi để mọi người trở về.”";
      sound = "levelup";
      addXp(50);
      break;
    case "CLAIM_DAILY":
      if (
        !Object.values(state.daily).every(Boolean) ||
        state.dailyRewardDay === state.day
      )
        return fail(
          "Thu hoạch, chăm cây hoặc gà, rồi giao một đơn trong cùng ngày để nhận quà.",
        );
      next.dailyRewardDay = state.day;
      next.coins += 35;
      next.seeds += 2;
      next.gems += 1;
      message =
        "Một ngày trọn vẹn: chăm vườn, thu hoạch và kết nối với hàng xóm.";
      reward = "+35 xu · +2 hạt · +1 ngọc";
      sound = "coin";
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
      next.daily.trade = true;
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
        { id: 3, state: "empty", readyAt: 0, watered: false, crop: "greens" },
      ];
      next.milestones.expansion = true;
      message = "Luống mới sẵn sàng cho mùa trồng tiếp theo.";
      reward = "+1 luống rau";
      addXp(15);
      break;
    case "UPGRADE_COOP":
      if (!state.milestones.market)
        return fail("Mở phiên chợ trước để đón thêm gà.");
      if (state.chickens >= 4)
        return fail("Chuồng đã có đủ bốn người bạn nhỏ.");
      if (state.gems < 5)
        return fail(
          "Cần 5 ngọc. Giao đơn hoặc nhận quà ngày trọn vẹn để kiếm ngọc.",
        );
      if (!state.energy) return fail(energyError);
      spend();
      next.gems -= 5;
      next.chickens += 1;
      message =
        "Một cô gà mới về nhà. Mỗi lần nhặt trứng sẽ nhận thêm một quả.";
      reward = "+1 gà · Tăng sản lượng trứng";
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
      next.milestones.home = true;
      next.seeds += 4;
      next.reputation += 25;
      message = "Bạn tìm thấy cuốn nhật ký của ông dưới mái nhà mới.";
      reward = "Mở giống cà chua · +4 hạt";
      sound = "levelup";
      addXp(30);
      break;
    case "NEXT_DAY":
      next.day += 1;
      next.energy = MAX_ENERGY;
      next.deliveredOrders = [];
      next.daily = { harvest: false, care: false, trade: false };
      next.water = Math.min(
        100,
        state.water + (next.day % 3 === 0 ? 40 : state.waterFixed ? 25 : 10),
      );
      next.feed = Math.max(0, state.feed - 5);
      next.plots = state.plots.map((p) =>
        p.state === "growing"
          ? {
              ...p,
              state: "ready",
              readyAt: 0,
              watered: p.watered || next.day % 3 === 0,
            }
          : p,
      );
      next.coop =
        state.coop.status === "fed"
          ? { status: "egg-ready", readyAt: 0 }
          : state.coop;
      message = `Ngày ${next.day}: rau lớn, nước được bổ sung, năng lượng đầy lại.`;
      reward = "5/5 năng lượng · Ngày mới";
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
    completed:
      !state.milestones.market && next.milestones.market
        ? "market"
        : !state.milestones.festival && next.milestones.festival
          ? "festival"
          : null,
    missionCompleted: missionIndex(next) > missionIndex(state),
    zone:
      action.zone ||
      {
        HARVEST: "field",
        PLANT: "field",
        WATER: "field",
        FEED: "coop",
        COLLECT: "coop",
        REPAIR: "water",
        DELIVER: "market",
        NEXT_DAY: "house",
      }[action.type],
  };
}
