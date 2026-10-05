import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { chromium } from "playwright";
import { preview } from "vite";
const server = await preview({
  preview: { host: "127.0.0.1", port: 5181, strictPort: true },
});
const override = process.env.BROWSER_EXECUTABLE_PATH;
const browser = await chromium.launch({
  headless: true,
  executablePath: override || undefined,
  args: override
    ? [
        "--no-sandbox",
        "--disable-gpu",
        "--disable-software-rasterizer",
        "--use-gl=disabled",
        "--use-angle=disabled",
        "--no-zygote",
      ]
    : [],
});
const errors = [],
  output = "test-results";
await mkdir(output, { recursive: true });
const context = await browser.newContext({
  viewport: { width: 360, height: 800 },
  deviceScaleFactor: 1,
});
const page = await context.newPage();
page.on("pageerror", (error) => errors.push(error.message));
page.on("console", (msg) => {
  if (msg.type() === "error") errors.push(msg.text());
});
page.setDefaultTimeout(12000);
const save = () =>
  page.evaluate(() => JSON.parse(localStorage.getItem("green_valley_save")));
const button = (name) =>
  page.getByRole("button", { name, exact: typeof name === "string" });
const close = async () => {
  if (await page.locator("dialog").count()) await button("Đóng bảng").click();
};
const tab = async (name) => {
  await close();
  await button(name).click();
};
const zone = async (name) => {
  await tab("Nông trại");
  await button(new RegExp(`^${name}:`)).click();
};
const mission = async () => {
  await close();
  await page.locator(".mission-card").click();
};
const nextDay = async () => {
  await close();
  await tab("Nông trại");
  await button("Sang ngày mới").click();
  await button(/^Bắt đầu ngày /).click();
  await page.locator(".daybreak").waitFor({ state: "detached" });
};
const energy = async () => {
  if ((await save()).energy === 0) await nextDay();
};
const plot = (id) =>
  page
    .locator(".plot-row")
    .filter({
      has: page.getByRole("heading", { name: new RegExp(`^Luống ${id} ·`) }),
    });
const cropAction = async (id, name, crop) => {
  await energy();
  await zone("Vườn của ông");
  if (crop) await button(new RegExp(`^${crop} `)).click();
  await plot(id).getByRole("button", { name, exact: true }).click();
};
const widthCheck = async (label) => {
  const r = await page.evaluate(() => ({
    width: innerWidth,
    page: document.documentElement.scrollWidth,
    sheet: document.querySelector("dialog")
      ? {
          w: document.querySelector("dialog").clientWidth,
          sw: document.querySelector("dialog").scrollWidth,
        }
      : null,
  }));
  assert.ok(r.page <= r.width, `${label}: page overflow ${JSON.stringify(r)}`);
  if (r.sheet) assert.ok(r.sheet.sw <= r.sheet.w, `${label}: sheet overflow`);
};
const shot = async (name) => {
  await page.screenshot({
    path: `${output}/${name}.png`,
    fullPage: true,
    animations: "disabled",
  });
};
try {
  await page.goto("http://127.0.0.1:5181");
  await page.locator(".story-opening img").evaluate((img) => img.decode());
  await shot("opening-360");
  await button("Về vườn hái giỏ rau đầu tiên").click();
  await shot("farm-360");
  // Chapter 1: play through real controls; never inject gameplay state.
  await button("Luống 1: Cải ngọt, thu hoạch").click();
  await page.getByText(/^\+3 cải ngọt · \+12 xu/).waitFor();
  assert.equal((await save()).veg, 3);
  await mission();
  await button(/^Sửa đường ống/).click();
  assert.equal((await save()).waterFixed, true);
  await mission();
  await button(/^Cho Mơ & Mận ăn/).click();
  await cropAction(1, "Gieo");
  await plot(1).getByRole("button", { name: "Tưới", exact: true }).click();
  assert.equal((await save()).energy, 0);
  await nextDay();
  await mission();
  await button(/^Nhặt 2 trứng/).click();
  await mission();
  await button(/^Giao giỏ/).click();
  await button(/^Mở phiên chợ/).click();
  await page
    .getByRole("heading", { name: "Phiên chợ lại rộn ràng!", exact: true })
    .waitFor();
  await shot("chapter-one-360");
  assert.equal((await save()).milestones.market, true);
  // Chapter 2: discover seeds, plan mixed crops, fulfill two narrative baskets and finish.
  await button("Chương 2 · Tìm lá thư của ông").click();
  await button(/^Tu sửa mái nhà/).click();
  await mission();
  await button(/^Mở luống thứ 3/).click();
  await cropAction(1, "Thu hoạch");
  await cropAction(1, "Gieo", "Cà chua");
  await plot(1).getByRole("button", { name: "Tưới", exact: true }).click();
  await zone("Mơ & Mận");
  await button(/^Cho Mơ & Mận ăn/).click();
  await nextDay();
  await zone("Mơ & Mận");
  await button(/^Nhặt 2 trứng/).click();
  await cropAction(1, "Thu hoạch");
  await mission();
  await page
    .locator(".order-paper")
    .filter({
      has: page.getByRole("heading", {
        name: "Bữa trưa của chú Bình",
        exact: true,
      }),
    })
    .getByRole("button", { name: /Giao giỏ/ })
    .click();
  assert.equal((await save()).milestones.specialOrder, true);
  await cropAction(1, "Gieo", "Hướng dương");
  await cropAction(2, "Gieo", "Cà chua");
  await energy();
  await tab("Kho đồ");
  await button("Nhận quà hôm nay · Miễn phí").click();
  await zone("Mơ & Mận");
  await button(/^Cho Mơ & Mận ăn/).click();
  await nextDay();
  await zone("Mơ & Mận");
  await button(/^Nhặt 2 trứng/).click();
  await cropAction(1, "Thu hoạch");
  await cropAction(2, "Thu hoạch");
  await mission();
  await page
    .locator(".order-paper")
    .filter({
      has: page.getByRole("heading", {
        name: "Giỏ nông sản hội mùa",
        exact: true,
      }),
    })
    .getByRole("button", { name: /Giao giỏ/ })
    .click();
  await button(/^Thắp đèn hội mùa/).click();
  await page
    .getByRole("heading", { name: "Thung lũng đã có cậu.", exact: true })
    .waitFor();
  await shot("story-complete-360");
  await button("Ngắm thung lũng đêm hội").click();
  await shot("festival-360");
  const complete = await save();
  assert.equal(complete.milestones.festival, true);
  assert.equal(Object.values(complete.milestones).filter(Boolean).length, 13);
  await page.reload();
  assert.equal((await save()).milestones.festival, true);
  assert.equal((await save()).day, complete.day);
  // Every screen and zone must remain readable at compact phone, tablet and desktop widths.
  for (const [width, height] of [
    [360, 640],
    [375, 812],
    [390, 844],
    [430, 932],
    [768, 1024],
    [1024, 768],
    [1440, 900],
  ]) {
    await page.setViewportSize({ width, height });
    await tab("Nông trại");
    await widthCheck(`farm ${width}`);
    const covered = await page
      .locator(".map-pin,.plot-hit,.field-sign")
      .evaluateAll((nodes) =>
        nodes
          .filter((el) => {
            const r = el.getBoundingClientRect();
            const hit = document.elementFromPoint(
              r.x + r.width / 2,
              r.y + r.height / 2,
            );
            return !el.contains(hit);
          })
          .map((el) => el.getAttribute("aria-label")),
      );
    assert.deepEqual(
      covered,
      [],
      `unreachable map controls ${width}x${height}`,
    );
    if ([360, 430].includes(width)) await shot(`festival-${width}-${height}`);
    for (const name of ["Đơn hàng", "Kho đồ", "Nhật ký"]) {
      await tab(name);
      await widthCheck(`${name} ${width}`);
    }
    for (const name of [
      "Vườn của ông",
      "Mơ & Mận",
      "Bể nước",
      "Mái nhà nhỏ",
      "Phiên chợ của Linh",
    ]) {
      await zone(name);
      await widthCheck(`${name} ${width}`);
      await close();
    }
  }
  await page.setViewportSize({ width: 360, height: 800 });
  await tab("Đơn hàng");
  await shot("orders-360");
  await tab("Nhật ký");
  await shot("journal-360");
  // Native-dialog focus, Escape, drag dismissal and reduced-motion preference.
  await tab("Nông trại");
  await button("Cài đặt").click();
  await page.keyboard.press("Tab");
  assert.equal(
    await page.evaluate(() => !!document.activeElement.closest("dialog")),
    true,
  );
  await page.keyboard.press("Escape");
  assert.equal(await page.locator("dialog").count(), 0);
  await button("Cài đặt").click();
  const grip = await page.locator(".sheet-grip").boundingBox();
  await page.mouse.move(grip.x + grip.width / 2, grip.y + 10);
  await page.mouse.down();
  await page.mouse.move(grip.x + grip.width / 2, grip.y + 120, { steps: 10 });
  await page.mouse.up();
  assert.equal(await page.locator("dialog").count(), 0);
  await page.emulateMedia({ reducedMotion: "reduce" });
  assert.equal(
    await page
      .locator(".hen")
      .first()
      .evaluate((el) => getComputedStyle(el).animationName),
    "none",
  );
  // Reset cancel preserves the completed game, confirm restores the actual prologue.
  await button("Cài đặt").click();
  await button("Đặt lại tiến trình").click();
  await button("Giữ nông trại của tôi").click();
  assert.equal((await save()).milestones.festival, true);
  await button("Đặt lại tiến trình").click();
  await button("Xác nhận đặt lại tiến trình").click();
  await page.locator(".story-opening").waitFor();
  const reset = await save();
  assert.equal(reset.day, 1);
  assert.equal(reset.energy, 5);
  assert.equal(reset.coins, 80);
  assert.equal(reset.milestones.festival, false);
  assert.deepEqual(errors, []);
  console.log(
    `PASS: two chapters / 13 milestones through UI in ${complete.day} game days; three crops, bonuses, eggs, daily orders, story baskets, finale, persistence, reset, 7 viewport sizes, reachable map controls, all tabs/zones, keyboard, swipe, reduced motion; no runtime errors.`,
  );
} catch (error) {
  await shot("failure");
  throw error;
} finally {
  await browser.close();
  await new Promise((resolve) => server.httpServer.close(resolve));
}
