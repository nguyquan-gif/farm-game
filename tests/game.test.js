import test from "node:test";
import assert from "node:assert/strict";
import {
  applyAction,
  missionIndex,
  resolveTimers,
} from "../src/game/engine.js";
import {
  createInitialState,
  normalizeSave,
  readSave,
  writeSave,
  SAVE_KEY,
  LEGACY_KEY,
} from "../src/game/state.js";
const at = 1000;
function play(state, type, extras = {}) {
  const r = applyAction(state, { type, ...extras }, at);
  assert.equal(r.ok, true, `${type}: ${r.message}`);
  return r.state;
}
test("complete Chapter 1, repeat farming, deliver another order, unlock both upgrades", () => {
  let s = createInitialState();
  s = play(s, "HARVEST", { plotId: 1 });
  assert.equal(missionIndex(s), 1);
  s = play(s, "REPAIR");
  assert.equal(missionIndex(s), 2);
  s = play(s, "FEED");
  assert.equal(s.eggs, 0);
  assert.equal(missionIndex(s), 3);
  s = play(s, "PLANT", { plotId: 1 });
  s = play(s, "WATER", { plotId: 1 });
  assert.equal(s.energy, 0);
  s = play(s, "NEXT_DAY");
  assert.equal(s.energy, 5);
  assert.equal(s.plots[0].state, "ready");
  assert.equal(s.coop.status, "egg-ready");
  s = play(s, "COLLECT");
  assert.equal(missionIndex(s), 4);
  s = play(s, "DELIVER");
  assert.equal(missionIndex(s), 5);
  const opened = applyAction(s, { type: "OPEN_MARKET" }, at);
  assert.equal(opened.completed, "market");
  s = opened.state;
  assert.equal(missionIndex(s), 6);
  s = play(s, "HARVEST", { plotId: 1 });
  s = play(s, "NEXT_DAY");
  s = play(s, "DELIVER");
  s = play(s, "UPGRADE_FIELD");
  s = play(s, "UPGRADE_HOUSE");
  assert.equal(s.plots.length, 3);
  assert.equal(s.houseFixed, true);
  assert.ok(s.coins >= 0);
});
test("free recovery from zero coins, water, feed, seeds and energy cannot soft-lock", () => {
  let s = {
    ...createInitialState(),
    energy: 0,
    coins: 0,
    seeds: 0,
    water: 0,
    feed: 0,
    plots: [{ id: 1, state: "empty", readyAt: 0, watered: false }],
  };
  s = play(s, "HELP");
  s = play(s, "NEXT_DAY");
  s = play(s, "HELP");
  s = play(s, "REPAIR");
  s = play(s, "PLANT", { plotId: 1 });
  s = play(s, "WATER", { plotId: 1 });
  s = play(s, "FEED");
  s = play(s, "NEXT_DAY");
  s = play(s, "HARVEST", { plotId: 1 });
  s = play(s, "COLLECT");
  s = play(s, "DELIVER");
  s = play(s, "OPEN_MARKET");
  assert.equal(missionIndex(s), 6);
});
test("validate plot states and duplicate rewards atomically", () => {
  const initial = createInitialState(),
    s = play(initial, "HARVEST", { plotId: 1 });
  const duplicate = applyAction(s, { type: "HARVEST", plotId: 1 }, at);
  assert.equal(duplicate.ok, false);
  assert.deepEqual(duplicate.state, s);
  assert.equal(applyAction(initial, { type: "COLLECT" }, at).ok, false);
  const broke = { ...initial, coins: 0 };
  assert.deepEqual(applyAction(broke, { type: "REPAIR" }, at).state, broke);
  const noEnergy = { ...initial, energy: 0 };
  assert.deepEqual(
    applyAction(noEnergy, { type: "HARVEST", plotId: 1 }, at).state,
    noEnergy,
  );
});
test("out of order actions do not strand mission progression", () => {
  let s = createInitialState();
  s = play(s, "REPAIR");
  s = play(s, "FEED");
  s = play(s, "NEXT_DAY");
  s = play(s, "COLLECT");
  assert.equal(missionIndex(s), 0);
  s = play(s, "HARVEST", { plotId: 1 });
  assert.equal(missionIndex(s), 4);
});
test("timer-based growth survives a closed/backgrounded app and water only speeds once", () => {
  let s = createInitialState();
  s = play(s, "PLANT", { plotId: 2 });
  s = play(s, "FEED");
  assert.equal(resolveTimers(s, at + 119999).coop.status, "fed");
  let ready = resolveTimers(s, at + 120000);
  assert.equal(ready.coop.status, "egg-ready");
  assert.equal(ready.plots[1].state, "ready");
  s = play(s, "WATER", { plotId: 2 });
  assert.equal(s.plots[1].readyAt, at + 60000);
  assert.equal(applyAction(s, { type: "WATER", plotId: 2 }, at).ok, false);
});
test("daily changes are bounded, gift and order are at most once per game day", () => {
  let s = play(createInitialState(), "HELP");
  assert.equal(applyAction(s, { type: "HELP" }, at).ok, false);
  s = { ...s, energy: 0, water: 95, feed: 3 };
  s = play(s, "NEXT_DAY");
  assert.equal(s.water, 100);
  assert.equal(s.feed, 0);
  assert.equal(s.energy, 5);
});
test("save round-trip, legacy migration, damaged save preservation, reset", () => {
  const values = new Map(),
    storage = {
      getItem: (k) => values.get(k) ?? null,
      setItem: (k, v) => values.set(k, v),
    };
  const s = play(createInitialState(), "HARVEST", { plotId: 1 });
  writeSave(storage, s);
  assert.deepEqual(readSave(storage).state, s);
  values.delete(SAVE_KEY);
  values.set(
    LEGACY_KEY,
    JSON.stringify({
      energy: 60,
      coins: 234,
      step: 7,
      waterFixed: true,
      eggs: 1,
      veg: 6,
    }),
  );
  const migrated = readSave(storage).state;
  assert.equal(migrated.energy, 3);
  assert.equal(migrated.coins, 234);
  assert.equal(missionIndex(migrated), 5);
  values.set(SAVE_KEY, "broken");
  assert.equal(readSave(storage).blocked, true);
  assert.equal(values.get(SAVE_KEY), "broken");
  assert.deepEqual(
    applyAction(s, { type: "RESET" }).state,
    createInitialState(),
  );
});
test("corrupt and future schemas do not leak invalid resources into rules", () => {
  const s = normalizeSave({
    version: 5,
    energy: 999,
    water: -2,
    coins: "bad",
    plots: [null],
    day: 0,
  });
  assert.equal(s.energy, 5);
  assert.equal(s.water, 0);
  assert.equal(s.coins, 80);
  assert.equal(s.plots[0].state, "empty");
  assert.equal(s.day, 1);
  assert.throws(() => normalizeSave({ version: 999 }));
});
test("selling surplus keeps first order supplies", () => {
  const s = play({ ...createInitialState(), veg: 6, eggs: 2 }, "SELL");
  assert.equal(s.veg, 3);
  assert.equal(s.eggs, 1);
  assert.equal(s.coins, 147);
});

test("full second chapter has a reachable ending using earned resources only", () => {
  let s = createInitialState();
  const go = (type, extras = {}) => {
    if (
      !s.energy &&
      !["NEXT_DAY", "HELP", "REFILL", "CLAIM_DAILY"].includes(type)
    )
      s = play(s, "NEXT_DAY");
    s = play(s, type, extras);
  };
  go("HARVEST", { plotId: 1 });
  go("REPAIR");
  go("FEED");
  go("PLANT", { plotId: 1 });
  go("WATER", { plotId: 1 });
  go("NEXT_DAY");
  go("COLLECT");
  go("DELIVER");
  go("OPEN_MARKET");
  go("UPGRADE_HOUSE");
  go("UPGRADE_FIELD");
  assert.equal(missionIndex(s), 8);
  go("HARVEST", { plotId: 1 });
  go("PLANT", { plotId: 1, crop: "tomato" });
  go("WATER", { plotId: 1 });
  go("FEED");
  go("NEXT_DAY");
  go("COLLECT");
  go("HARVEST", { plotId: 1 });
  assert.equal(s.tomatoes, 5);
  go("SPECIAL_ORDER");
  assert.equal(s.milestones.specialOrder, true);
  go("PLANT", { plotId: 1, crop: "sunflower" });
  go("PLANT", { plotId: 2, crop: "tomato" });
  go("HELP");
  go("FEED");
  go("NEXT_DAY");
  go("COLLECT");
  go("HARVEST", { plotId: 1 });
  go("HARVEST", { plotId: 2 });
  assert.ok(s.veg >= 3);
  assert.ok(s.flowers >= 3);
  assert.ok(s.tomatoes >= 2);
  assert.ok(s.eggs >= 2);
  go("PREPARE_FEAST");
  go("START_FESTIVAL");
  assert.equal(missionIndex(s), 13);
  assert.equal(s.milestones.festival, true);
  assert.ok(s.coins >= 0 && s.gems >= 0 && s.energy >= 0);
  assert.equal(applyAction(s, { type: "START_FESTIVAL" }, at).ok, false);
  const replay = normalizeSave(JSON.parse(JSON.stringify(s)));
  assert.deepEqual(replay, s);
  const morning = play(s, "NEXT_DAY");
  assert.equal(morning.milestones.festival, true);
  assert.ok(morning.day > morning.festivalDay);
});

test("crop locks, per-crop timing, water yield and action crop tampering", () => {
  let s = createInitialState();
  assert.equal(
    applyAction(s, { type: "PLANT", plotId: 2, crop: "tomato" }, at).ok,
    false,
  );
  assert.equal(
    applyAction(s, { type: "PLANT", plotId: 2, crop: "sunflower" }, at).ok,
    false,
  );
  assert.equal(
    applyAction(s, { type: "PLANT", plotId: 2, crop: "not-a-crop" }, at).ok,
    false,
  );
  s = { ...s, houseFixed: true };
  s = play(s, "PLANT", { plotId: 2, crop: "tomato" });
  assert.equal(s.plots[1].readyAt, at + 240000);
  s = play(s, "WATER", { plotId: 2 });
  assert.equal(s.plots[1].readyAt, at + 120000);
  s = resolveTimers(s, at + 120001);
  s = play(s, "HARVEST", { plotId: 2, crop: "sunflower" });
  assert.equal(s.tomatoes, 5);
  assert.equal(s.flowers, 0);
  assert.equal(s.milestones.tomato, true);
});

test("v5 migration preserves five-point energy, milestones, upgrades, resources and timers", () => {
  const old = {
    version: 5,
    energy: 4,
    coins: 345,
    gems: 8,
    water: 38,
    feed: 67,
    day: 8,
    houseFixed: true,
    waterFixed: true,
    starterSeen: true,
    orderDay: 8,
    milestones: {
      harvest: true,
      repair: true,
      feed: true,
      egg: true,
      order: true,
      market: true,
    },
    plots: [
      { id: 1, state: "growing", readyAt: 999999999, watered: true },
      { id: 2, state: "empty" },
      { id: 3, state: "empty" },
    ],
  };
  const s = normalizeSave(old);
  assert.equal(s.version, 6);
  assert.equal(s.energy, 4);
  assert.equal(s.coins, 345);
  assert.equal(s.gems, 8);
  assert.equal(s.milestones.market, true);
  assert.equal(s.milestones.home, true);
  assert.equal(s.milestones.expansion, true);
  assert.equal(missionIndex(s), 8);
  assert.equal(s.plots[0].readyAt, old.plots[0].readyAt);
  assert.equal(s.plots[0].crop, "greens");
  assert.deepEqual(s.deliveredOrders, ["linh"]);
});

test("daily orders, daily gifts, rain bonus and coop upgrade remain bounded", () => {
  let s = {
    ...createInitialState(),
    coins: 100,
    veg: 20,
    eggs: 6,
    energy: 5,
    day: 2,
    houseFixed: true,
    milestones: {
      ...createInitialState().milestones,
      harvest: true,
      repair: true,
      feed: true,
      egg: true,
      order: true,
      market: true,
    },
    daily: { harvest: true, care: true, trade: false },
  };
  s = play(s, "DELIVER", { orderId: "linh" });
  const duplicate = applyAction(s, { type: "DELIVER", orderId: "linh" }, at);
  assert.equal(duplicate.ok, false);
  assert.deepEqual(duplicate.state, s);
  assert.equal(
    applyAction(s, { type: "DELIVER", orderId: "bad" }, at).ok,
    false,
  );
  s = play(s, "CLAIM_DAILY");
  assert.equal(applyAction(s, { type: "CLAIM_DAILY" }, at).ok, false);
  const eggs = s.eggs;
  s = play(s, "UPGRADE_COOP");
  assert.equal(s.chickens, 3);
  assert.equal(s.eggs, eggs);
  s = play(s, "PLANT", { plotId: 2, crop: "tomato" });
  s = play(s, "NEXT_DAY");
  assert.equal(s.day, 3);
  assert.equal(s.plots[1].watered, true);
  assert.equal(s.plots[1].state, "ready");
  assert.deepEqual(s.deliveredOrders, []);
  assert.deepEqual(s.daily, { harvest: false, care: false, trade: false });
});
