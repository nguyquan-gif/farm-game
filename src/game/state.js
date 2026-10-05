import { CROPS } from "../data/crops.js";
export const SAVE_KEY = "green_valley_save";
export const LEGACY_KEY = "green_valley_v4_save";
export const SCHEMA_VERSION = 6;
export const MAX_ENERGY = 5;
export const GROW_TIME = 120_000;
export const EGG_TIME = 120_000;
export function createInitialState() {
  return {
    version: SCHEMA_VERSION,
    day: 1,
    coins: 80,
    gems: 5,
    energy: 5,
    level: 1,
    xp: 15,
    seeds: 4,
    veg: 0,
    eggs: 0,
    tomatoes: 0,
    flowers: 0,
    deliveredOrders: [],
    daily: { harvest: false, care: false, trade: false },
    dailyRewardDay: 0,
    festivalDay: 0,
    stats: { harvests: 0, deliveries: 0 },
    water: 50,
    feed: 60,
    waterFixed: false,
    houseFixed: false,
    chickens: 2,
    reputation: 10,
    coop: { status: "hungry", readyAt: 0 },
    plots: [
      { id: 1, state: "ready", readyAt: 0, watered: false, crop: "greens" },
      { id: 2, state: "empty", readyAt: 0, watered: false, crop: "greens" },
    ],
    milestones: {
      harvest: false,
      repair: false,
      feed: false,
      egg: false,
      order: false,
      market: false,
      home: false,
      expansion: false,
      tomato: false,
      specialOrder: false,
      flowers: false,
      feast: false,
      festival: false,
    },
    soundOn: true,
    musicOn: false,
    hapticsOn: true,
    starterSeen: false,
    rescueDay: 0,
    orderDay: 0,
    logs: ["Bạn trở về Green Valley. Một mùa mới đang đợi."],
  };
}
const count = (v, fallback, max = 1_000_000) =>
  Number.isFinite(v) ? Math.max(0, Math.min(max, Math.floor(v))) : fallback;
export function normalizeSave(raw) {
  if (!raw || typeof raw !== "object" || Array.isArray(raw))
    throw new Error("Invalid save");
  if (raw.version && raw.version > SCHEMA_VERSION)
    throw new Error("Newer save version");
  const initial = createInitialState(),
    legacy = !raw.version || raw.version < 5,
    state = { ...initial };
  for (const key of [
    "day",
    "coins",
    "gems",
    "level",
    "xp",
    "seeds",
    "veg",
    "eggs",
    "tomatoes",
    "flowers",
    "dailyRewardDay",
    "festivalDay",
    "water",
    "feed",
    "chickens",
    "reputation",
    "rescueDay",
    "orderDay",
  ])
    state[key] = count(
      raw[key],
      initial[key],
      ["water", "feed"].includes(key) ? 100 : 1_000_000,
    );
  state.chickens = Math.max(2, Math.min(10, state.chickens));
  state.day = Math.max(1, state.day);
  state.level = Math.max(1, state.level);
  state.xp %= 100;
  state.energy = legacy
    ? Math.ceil(count(raw.energy, 100, 100) / 20)
    : count(raw.energy, 5, 5);
  for (const key of [
    "waterFixed",
    "houseFixed",
    "soundOn",
    "musicOn",
    "hapticsOn",
    "starterSeen",
  ])
    if (typeof raw[key] === "boolean") state[key] = raw[key];
  if (Array.isArray(raw.plots) && raw.plots.length)
    state.plots = raw.plots.slice(0, 3).map((p, i) => ({
      id: i + 1,
      state: ["empty", "growing", "ready"].includes(p?.state)
        ? p.state
        : "empty",
      readyAt: Number.isFinite(p?.readyAt) ? Math.max(0, p.readyAt) : 0,
      watered: p?.watered === true,
      crop: Object.hasOwn(CROPS, p?.crop) ? p.crop : "greens",
    }));
  if (raw.coop && ["hungry", "fed", "egg-ready"].includes(raw.coop.status))
    state.coop = {
      status: raw.coop.status,
      readyAt: Number.isFinite(raw.coop.readyAt)
        ? Math.max(0, raw.coop.readyAt)
        : 0,
    };
  if (legacy) {
    const step = count(raw.step, 0, 12);
    state.milestones = {
      ...initial.milestones,
      harvest: step > 0 || state.veg > 0,
      repair: state.waterFixed,
      feed: step > 3 || state.eggs > 0,
      egg: state.eggs > 0 || step > 6,
      order: step > 6,
      market: step > 9,
    };
    state.starterSeen = step > 0;
  } else
    for (const key of Object.keys(state.milestones))
      state.milestones[key] = raw.milestones?.[key] === true;
  state.milestones.home = state.houseFixed;
  state.milestones.expansion = state.plots.length >= 3;
  state.deliveredOrders = Array.isArray(raw.deliveredOrders)
    ? [
        ...new Set(
          raw.deliveredOrders.filter((x) =>
            ["linh", "binh", "mai"].includes(x),
          ),
        ),
      ]
    : state.orderDay === state.day
      ? ["linh"]
      : [];
  state.daily = Object.fromEntries(
    ["harvest", "care", "trade"].map((k) => [k, raw.daily?.[k] === true]),
  );
  state.stats = {
    harvests: count(raw.stats?.harvests, 0),
    deliveries: count(raw.stats?.deliveries, 0),
  };
  if (Array.isArray(raw.logs))
    state.logs = raw.logs
      .filter((x) => typeof x === "string")
      .map((x) => x.slice(0, 160))
      .slice(0, 20);
  return state;
}
export function readSave(storage) {
  try {
    const value = storage.getItem(SAVE_KEY) ?? storage.getItem(LEGACY_KEY);
    return {
      state: value ? normalizeSave(JSON.parse(value)) : createInitialState(),
      error: null,
    };
  } catch {
    return {
      state: createInitialState(),
      error:
        "Không đọc được bản lưu. Bạn có thể chơi tạm hoặc đặt lại trong Cài đặt.",
      blocked: true,
    };
  }
}
export function writeSave(storage, state) {
  storage.setItem(SAVE_KEY, JSON.stringify(state));
}
